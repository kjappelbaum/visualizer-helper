import API from 'src/util/api';
import _ from 'lodash';

import OCLE from '../libs/OCLE';

function waitImmediate() {
  return new Promise((resolve) => {
    setImmediate(resolve);
  });
}

module.exports = {
  async buildDatabase(tocData, options = {}) {
    const l = tocData.length;
    var cache = API.cache('search-database-molecules');
    if (!cache) {
      cache = {};
      API.cache('search-database-molecules', cache);
    }
    const db = new OCLE.DB();
    const date = Date.now();
    for (let i = 0; i < l; i++) {
      if (options.showLoading) {
        if (i % 1000 === 0 && Date.now() - date > 500) {
          await waitImmediate();
          API.loading('mol', `Loading molecules (${i + 1}/${l})`);
        }
      }

      let mol = tocData[i];
      const idcode = mol.value.ocl && mol.value.ocl.value;
      if (!idcode) {
        // hum...
        continue;
      }
      let ocl;
      if (cache[idcode]) {
        ocl = cache[idcode];
      } else {
        ocl = OCLE.Molecule.fromIDCode(idcode);
        ocl.index = mol.value.ocl.index;
        ocl.mw = mol.value.mw;
        ocl.idcode = idcode;
        cache[idcode] = ocl;
      }

      if (options.calculateProperties === true) {
        const prop = new OCLE.MoleculeProperties(ocl);
        mol.value.properties = {
          acc: prop.acceptorCount,
          don: prop.donorCount,
          logp: prop.logP,
          logs: prop.logS,
          psa: prop.polarSurfaceArea,
          rot: prop.rotatableBondCount,
        };
      }
      db.push(ocl, mol);
    }
    if (options.showLoading) {
      API.stopLoading('mol');
    }
    return db;
  },

  queryWithOCLID(db, oclid, options) {
    if (!db) return null;
    if (!oclid) {
      return getDataIfExists(db);
    }
    const molecule = OCLE.Molecule.fromIDCode(String(oclid));
    return module.exports.queryWithMolecule(db, molecule, options);
  },

  queryWithMolfile(db, molfile, options) {
    if (!db) return null;
    molfile = String(molfile);
    if (!molfile) {
      return getDataIfExists(db);
    }
    const molecule = OCLE.Molecule.fromMolfile(molfile);
    return module.exports.queryWithMolecule(db, molecule, options);
  },

  queryWithMolecule(db, molecule, options = {}) {
    if (!db) return null;
    if (!molecule) {
      return getDataIfExists(db);
    }

    const queryOptions = {
      mode: String(options.mode)
    };
    const result = db.search(molecule, queryOptions);
    if (result === -1) return null;
    return result.data.slice();
  },

  query(db, molfile, options) {
    return module.exports.queryWithMolfile(db, molfile, options);
  },

  groupByIDCode(data, options = {}) {
    var grouped = _.groupBy(data, function (s) {
      return s.value.ocl && s.value.ocl.value;
    });


    var g = [];

    for (var key in grouped) {
      if (options.mapCallback) {
        g.push(options.mapCallback(key, grouped[key]));
      } else {
        var struct = {};
        g.push(struct);
        struct.idcode = key;
        struct.elements = grouped[key];
        struct.n = grouped[key].length;
      }
    }

    return g;
  }
};

function getDataIfExists(db) {
  if (db.data) {
    return db.data.slice();
  } else {
    return null;
  }
}
