define(['src/util/api'], function (API) {
  async function recreateCharts(variable) {
    if (!API.getData('preferences')) return;
    const preferences = JSON.parse(JSON.stringify(API.getData('preferences')));

    if (variable && !preferences.display.autorefresh) {
      return;
    }

    const spectraProcessor = API.cache('spectraProcessor');
    const spectraDataSet = API.cache('spectraDataSet');

    if (!spectraProcessor.spectra || spectraProcessor.spectra.length === 0)
      return;

    if (variable === 'preferences') {
      let currentPreferences = JSON.stringify(preferences);
      if (API.cache('previousPreferences') === currentPreferences) return;
      API.cache('previousPreferences', currentPreferences);
    }

    console.log('Update chart');

    let ids = spectraProcessor.spectra
      .filter((spectrum) => spectrum.meta.display)
      .map((spectrum) => spectrum.id);

    if (preferences.display.original === 'true') {
      let chart = spectraProcessor.getChart({ ids });
      API.createData('chart', chart);
    } else {
      spectraProcessor.setNormalization(preferences.normalization);

      if (preferences.scale) {
        let scaleOptions = JSON.parse(JSON.stringify(preferences.scale));
        scaleOptions.range = API.getData('ranges')
          .resurrect()
          .filter((range) => range.label === scaleOptions.range)[0];
        scaleOptions.ids = ids;

        API.createData('chart', spectraProcessor.getScaledChart(scaleOptions));
      } else {
        API.createData('chart', spectraProcessor.getNormalizedChart({ ids }));
      }
    }

    let chartPrefs = spectraDataSet.getChartPrefs();
    let currentChartPrefs = API.cache('currentChartPrefs');
    if (chartPrefs !== currentChartPrefs) {
      API.cache('currentChartPrefs', chartPrefs);
      API.doAction('setChartPreferences', chartPrefs);
    }

    API.createData(
      'filterAnnotations',
      spectraProcessor.getNormalizationAnnotations(),
    );

    if (
      preferences.display.original === 'true' ||
      !preferences.display.boxplot
    ) {
      API.createData('boxPlotAnnotations', []);
    } else {
      const boxPlotAnnotations = spectraProcessor.getBoxPlotAnnotations(
        preferences.display.boxplotOptions,
      );
      API.createData('boxPlotAnnotations', boxPlotAnnotations);
    }

    if (
      preferences.display.original === 'true' ||
      preferences.display.autocorrelationIndex === undefined
    ) {
      API.createData('autocorrelationChart', {});
    } else {
      console.log(preferences.display.autocorrelationIndex);
      let autocorrelationChart = spectraProcessor.getAutocorrelationChart(
        preferences.display.autocorrelationIndex,
      );
      console.log(autocorrelationChart);
      API.createData('autocorrelationChart', autocorrelationChart);
    }
  }
  return recreateCharts;
});
