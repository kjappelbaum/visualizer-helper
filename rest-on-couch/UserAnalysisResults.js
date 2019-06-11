define(['../util/getViewInfo', 'src/util/api'], function (getViewInfo, API) {
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

    async set(key, value) {
      this.viewID = this.viewID || (await getViewInfo())._id;
      let record = (await this.getRecords(key))[0];
      if (record) {
        record.$content = value;
        return this.roc.update(record);
      } else {
        return this.roc.create({
          $id: ['userAnalysisResults', this.viewID, this.sampleID, key],
          $content: value,
          $kind: 'userAnalysisResults'
        });
      }
    }
  }
  return UserAnalysisResults;
});
