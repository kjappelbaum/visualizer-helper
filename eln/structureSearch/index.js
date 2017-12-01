import OCLE from '../libs/OCLE';
import API from 'src/util/api';
import _ from 'lodash';

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
        for (let i = 0; i < l; i++) {
            if (options.showLoading) {
                if (i % 1000 === 0) {
                    await waitImmediate();
                    API.loading('mol', 'Loading molecules (' + (i + 1) + '/' + l + ')');
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

            db.push(ocl, mol);
        }
        if (options.showLoading) {
            API.stopLoading('mol');
        }
        return db;
    },
    query(db, molfile, options = {}) {
        if (!db) return null;
        molfile = String(molfile);
        if (!molfile) {
            if (db.data) {
                return db.data.slice();
            } else {
                return null;
            }
        }
        const query = OCLE.Molecule.fromMolfile(molfile);
        if (options.setFragment) {
            query.setFragment(true);
        }
        const queryOptions = {
            mode: String(options.mode)
        };
        const result = db.search(query, queryOptions);

        return result.data.slice();
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
