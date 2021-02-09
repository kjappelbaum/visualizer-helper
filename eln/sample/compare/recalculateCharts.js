import API from 'src/util/api';

export default function recalculateCharts(action) {
  const CommonSpectrum = API.cache('CommonSpectrum');
  const analysesManager = API.cache('analysesManager');
  const selectedSpectra = API.getData('selectedSpectra');
  const preferences = JSON.parse(JSON.stringify(API.getData('preferences')));

  let ids = selectedSpectra.filter(entry => DataObject.resurrect(entry.display)).map(entry => String(entry.id));
  let colors = selectedSpectra
    .filter(entry => DataObject.resurrect(entry.display))
    .map(entry => String(entry.color));

  let analyses = analysesManager.getAnalyses({ ids });

  console.log('Calculate chart')

  if (preferences.normalization.processing) {
    let chartProcessed = CommonSpectrum.JSGraph.getJSGraph(analyses, {
      colors,
      opacities: [0.2],
      linesWidth: [3],
      ids,
      selector: preferences.selector,
      normalization: {
        processing: preferences.normalization.processing,
        filters: [
          {
            name: "rescale"
          }
        ]
      },
    });
    delete preferences.normalization.processing;
    API.createData('chartProcessed', chartProcessed);
  } else {
    API.createData('chartProcessed', {});
  }

  let chart = CommonSpectrum.JSGraph.getJSGraph(analyses, {
    colors,
    ids,
    selector: preferences.selector,
    normalization: preferences.normalization,
  });

  console.log(chart);

  API.createData('chart', chart);

  let filterAnnotations = CommonSpectrum.JSGraph.getNormalizationAnnotations(preferences.normalization, {
    y: { min: '0px', max: '2000px' },
  })

  API.createData('filterAnnotations', filterAnnotations);
}
