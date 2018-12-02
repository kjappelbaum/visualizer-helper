import API from 'src/util/api';

import OCLE from '../libs/OCLE';

function waitImmediate() {
  return new Promise((resolve) => {
    setImmediate(resolve);
  });
}

module.exports = {
  async buildDatabase(tocData, options = {}) {
    const l = tocData.length;
    const db = new OCLE.DB({ computeProperties: options.calculateProperties });
    const date = Date.now();
    for (let i = 0; i < l; i++) {
      if (options.showLoading) {
        if (i % 100 === 0 && Date.now() - date > 500) {
          await waitImmediate();
          API.loading('mol', `Loading molecules (${i + 1}/${l})`);
        }
      }

      let entry = tocData[i];
      const idCode = entry.value.ocl && entry.value.ocl.value;
      if (!idCode) continue;
      let moleculeInfo = { idCode, index: entry.value.ocl.index };
      db.pushMoleculeInfo(moleculeInfo, entry);
    }
    if (options.showLoading) {
      API.stopLoading('mol');
    }
    return db;
  }
};
