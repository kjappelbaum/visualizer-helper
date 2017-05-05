'use strict';

import superagent from 'superagent';
import util from 'src/util/util';
import ui from 'src/util/ui';
import _ from 'lodash';

module.exports = {
    search(term) {
        return superagent.get(`https://www.chemexper.com/search/reference/json2/quick/${encodeURIComponent(term)}`)
            .then(function (result) {
                result = result.body && result.body.entry;
                if(!result) {
                    ui.showNotification('No results', 'warn');
                    return Promise.resolve([]);
                }
                var list = [];
                for (var i = 0; i < result.length; i++) {
                    if (result[i] && result[i].value) {
                        var val = result[i].value;
                        val.code = val.catalogID;
                        list.push({
                            id: i,
                            name: val.iupac[0].value,
                            row: val
                        });
                    }
                }
                return list;
            }).then(data => data.map(fromChemexper));
    }
};

function fromChemexper(chemexper) {
    const mol = chemexper.row.mol;
    const mf = chemexper.row.mf && chemexper.row.mf[0] && chemexper.row.mf[0].value.value;
    return {
        $content: {
            general: {
                molfile: mol && mol[0] && mol[0].value.value,
                description: chemexper.name,
                name: chemexper.row.iupac,
                mf
            },
            identifier: {
                cas: chemexper.row.rn.map(rn => ({value: numberToCas(rn.value.value)}))
            },
            stock: {
                catalogNumber: chemexper.row.code
            }
        },
        id: util.getNextUniqueId(true),
        names: _.uniq([chemexper.name, ...chemexper.row.iupac.map(i => i.value)]),
        source: 'reference'
    };
}


function numberToCas(nb) {
    nb = String(nb);
    return nb.slice(0,-3) + '-' + nb.slice(-3,-1) + '-' +  nb.slice(-1)
}