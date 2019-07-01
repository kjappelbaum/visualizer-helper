define([
  '../util/getViewInfo',
  'src/util/api',
  'src/util/couchdbAttachments'
], function (getViewInfo, API, CDB) {
  class UserAnalysisResults {
    constructor(roc, sampleID) {
      this.roc = roc;
      this.sampleID = sampleID;
      this.viewID = undefined;
    }

    setSampleID(sampleID) {
      this.sampleID = sampleID;
    }

    async refresh() {
      let analysisResults = await this.loadResults();
      API.createData('analysisResults', analysisResults);
      let analysisTemplates = await this.loadTemplates();
      API.createData('analysisTemplates', analysisTemplates);
    }

    async loadTemplates(key) {
      return this.loadResults(key, { sampleID: '' });
    }

    /**
     * Retrieve all the analytical results for a sample in a view
     * @param {string} key
     */
    async loadResults(key, options = {}) {
      const { sampleID = this.sampleID } = options;
      this.viewID = this.viewID || (await getViewInfo())._id;
      var user = await this.roc.getUser();
      if (!user || !user.username) return undefined;
      let queryOptions = key
        ? {
          key: [
            user.username,
            ['userAnalysisResults', this.viewID, sampleID, key]
          ]
        }
        : {
          startkey: [
            user.username,
            ['userAnalysisResults', this.viewID, sampleID, '\u0000']
          ],
          endkey: [
            user.username,
            ['userAnalysisResults', this.viewID, sampleID, '\uffff']
          ]
        };
      var entries = await this.roc.view('entryByOwnerAndId', queryOptions);
      if (sampleID) {
        return entries.filter((entry) => entry.$id[2].match(/^[0-9a-f]{32}$/i));
      }
      return entries;
    }

    delete(entry) {
      return this.roc.delete(entry);
    }

    /**
     * Result is stored in an attachment called result.json
     * @param {*} entry
     */
    loadResult(entry) {
      return this.roc.getAttachment(entry, 'result.json');
    }

    async saveTemplate(key, meta, result) {
      return this.save(key, meta, result, { sampleID: '' });
    }

    async save(key, meta, result, options = {}) {
      const { sampleID = this.sampleID } = options;
      this.viewID = this.viewID || (await getViewInfo())._id;
      let entry = (await this.loadResults(key, { sampleID }))[0];
      if (entry) {
        entry.$content = meta;
        await this.roc.update(entry);
      } else {
        entry = await this.roc.create({
          $id: ['userAnalysisResults', this.viewID, sampleID, key],
          $content: meta,
          $kind: 'userAnalysisResults'
        });
      }
      if (result) {
        let attachments = [
          {
            filename: 'result.json',
            data: JSON.stringify(result),
            contentType: 'application/json'
          }
        ];
        await this.roc.addAttachment(entry, attachments);
      }
      return entry;
    }
  }

  return UserAnalysisResults;
});
