'use strict';

import superagent from 'superagent';
import util from 'src/util/util';
import ui from 'src/util/ui';

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
    var mol = chemexper.row.mol;
    return {
        $content: {
            general: {
                molfile: mol && mol[0] && mol[0].value.value,
                description: chemexper.name,
                names: chemexper.row.iupac
            }
        },
        id: util.getNextUniqueId(true),
        source: 'chemexper'
    };
}