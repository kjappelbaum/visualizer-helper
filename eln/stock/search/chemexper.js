import superagent from 'superagent';
import util from 'src/util/util';
import ui from 'src/util/ui';
import _ from 'lodash';

module.exports = {
  search(term) {
    return superagent
      .get(
        `https://mastersearch.chemexper.com/search/reference/json2/quick/${encodeURIComponent(
          term
        )}`
      )
      .then(function (result) {
        result = result.body && result.body.entry;
        if (!result) {
          ui.showNotification('No results in reference DB', 'warn');
          return Promise.resolve([]);
        }
        var list = [];
        for (var i = 0; i < result.length; i++) {
          if (result[i] && result[i].value) {
            var val = result[i].value;
            val.code = val.catalogID;
            list.push({
              id: i,
              name: val && val.iupac && val.iupac[0] ? val.iupac[0].value : '',
              row: val
            });
          }
        }
        return list;
      })
      .then((data) => data.map(fromChemexper))
      .then((data) =>
        data.sort((a, b) => {
          let rn1 =
            a.$content.identifier.cas.length > 0
              ? Number(a.$content.identifier.cas[0].value.replace(/-/g, ''))
              : Number.MAX_SAFE_INTEGER;
          let rn2 =
            b.$content.identifier.cas.length > 0
              ? Number(b.$content.identifier.cas[0].value.replace(/-/g, ''))
              : Number.MAX_SAFE_INTEGER;
          return rn1 - rn2;
        })
      );
  }
};

function fromChemexper(chemexper) {
  const mol = chemexper.row.mol;
  const mf =
    chemexper.row.mf && chemexper.row.mf[0] && chemexper.row.mf[0].value.value;
  const cas =
    chemexper.row.rn &&
    chemexper.row.rn.map((rn) => ({ value: numberToCas(rn.value.value) }));
  if (!chemexper.row.iupac) chemexper.row.iupac = [];
  return {
    $content: {
      general: {
        molfile: mol && mol[0] && mol[0].value.value,
        description: chemexper.name,
        name: chemexper.row.iupac,
        mf
      },
      identifier: {
        cas
      },
      stock: {
        catalogNumber: chemexper.row.code
      },
      physical: {
        density: chemexper.row.density,
        mp: chemexper.row.mp,
        bp: chemexper.row.bp
      }
    },
    id: util.getNextUniqueId(true),
    names: _.uniq([chemexper.name, ...chemexper.row.iupac.map((i) => i.value)]),
    source: 'reference'
  };
}

function numberToCas(nb) {
  nb = String(nb);
  return `${nb.slice(0, -3)}-${nb.slice(-3, -1)}-${nb.slice(-1)}`;
}
