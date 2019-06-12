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
      let analysisResults = await this.getRecords();
      API.createData('analysisResults', analysisResults);
    }

    /**
     * Retrieve all the analytical results for a sample in a view
     * @param {string} key
     */
    async getRecords(key) {
      this.viewID = this.viewID || (await getViewInfo())._id;
      var user = await this.roc.getUser();
      if (!user || !user.username) return undefined;
      let options = key
        ? {
          key: [
            user.username,
            ['userAnalysisResults', this.viewID, this.sampleID, key]
          ]
        }
        : {
          startkey: [
            user.username,
            ['userAnalysisResults', this.viewID, this.sampleID, '\u0000']
          ],
          endkey: [
            user.username,
            ['userAnalysisResults', this.viewID, this.sampleID, '\uffff']
          ]
        };
      var entries = await this.roc.view('entryByOwnerAndId', options);
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

    async save(key, meta, result) {
      this.viewID = this.viewID || (await getViewInfo())._id;
      let entry = (await this.getRecords(key))[0];
      if (entry) {
        entry.$content = meta;
        await this.roc.update(entry);
      } else {
        entry = await this.roc.create({
          $id: ['userAnalysisResults', this.viewID, this.sampleID, key],
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
