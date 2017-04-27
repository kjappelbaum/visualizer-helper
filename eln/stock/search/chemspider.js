'use strict';

import chemspider from 'https://www.lactame.com/lib/chemspider-json-api/0.0.3/chemspider-json-api.js';
import util from 'src/util/util';

module.exports = {
    search(term) {
        return chemspider.search({
            searchOptions: {
                searchOptions: {
                    QueryText: term
                }
            },
            resultOptions: {
                serfilter: 'Compound[Mol|Name|Synonyms]'
            }
        }).then(data => data.map(fromChemspider));
    }
};


function fromChemspider(chemspider) {
    var entry = {
        $content: {
            general: {
                molfile: chemspider.Mol,
                description: chemspider.Name
            }
        },
        id: util.getNextUniqueId(true),
        source: 'chemspider'
    };

    const name = entry.$content.general.name =  [];
    const identifier = entry.$content.identifier = {};
    const cas = identifier.cas = [];
    const synonyms = chemspider.Synonyms;
    for (let i = 0; i < synonyms.length; i++) {
        const synonym = synonyms[i];
        if (isReliableSynonym(synonym)) {
            name.push({
                value: synonym.Name,
                language: synonym.LangID
            });
        }
        if(isReliableCas(synonym)) {
            cas.push({
                value: synonym.Name
            });
        }
    }
    return entry;
}

function isReliableCas(synonym) {
    return synonym.Reliability >= 4 && synonym.LangID === 'en' && synonym.SynonymType == 2;
}

function isReliableSynonym(synonym) {
    return synonym.Reliability >= 4 && synonym.SynonymType == 5 && synonym.LangID === 'en';
}