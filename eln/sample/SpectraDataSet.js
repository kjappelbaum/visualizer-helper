// this class is not really related to a sampleToc but can be used for any TOC

import API from 'src/util/api';
import Versioning from 'src/util/versioning';
import Color from 'src/util/color';

const SpectraConfigs = {
  IR: {
    tocFilter: (entry) => entry.value.nbIR && !entry.value.hidden,
    tocCallback: (entry) => {
      entry.value.nbSpectra = entry.value.nbIR;
    },
    getSpectra: (sample) => {
      if (
        sample &&
        sample.$content &&
        sample.$content.spectra &&
        Array.isArray(sample.$content.spectra.ir)
      ) {
        let spectra = sample.$content.spectra.ir;
        return spectra;
      } else {
        return [];
      }
    },
    chartPrefs: {
      yLabel: 'Absorbance',
      displayYAxis: [
        'display',
        'main',
        'sec'
      ],
      xLabel: 'Wavelength [cm-1]',
      displayXAxis: [
        'display',
        'flip',
        'main',
        'sec'
      ]
    }
  },
  Raman: {
    tocFilter: (entry) => entry.value.nbRaman && !entry.value.hidden,
    tocCallback: (entry) => {
      entry.value.nbSpectra = entry.value.nbRaman;
    },
    getSpectra: (sample) => {
      if (
        sample &&
        sample.$content &&
        sample.$content.spectra &&
        Array.isArray(sample.$content.spectra.raman)
      ) {
        let spectra = sample.$content.spectra.raman;
        return spectra;
      } else {
        return [];
      }
    },
    chartPrefs: {
      yLabel: 'Absorbance',
      displayYAxis: [
        'display',
        'main',
        'sec'
      ],
      xLabel: 'Wavelength [cm-1]',
      displayXAxis: [
        'display',
        'flip',
        'main',
        'sec'
      ]
    }
  },
  '1H NMR': {
    tocFilter: (entry) => entry.value.nb1h && !entry.value.hidden,
    tocCallback: (entry) => {
      entry.value.nbSpectra = entry.value.nb1h;
    },
    getSpectra: (sample) => {
      if (
        sample &&
        sample.$content &&
        sample.$content.spectra &&
        Array.isArray(sample.$content.spectra.nmr)
      ) {
        let spectra = sample.$content.spectra.nmr;
        spectra = spectra.filter(
          (spectrum) => spectrum.dimension === 1 && spectrum.nucleus[0] === '1H'
        );
        spectra.forEach((spectrum) => {
          let info = [];
          if (spectrum.nucleus) info.push(spectrum.nucleus[0]);
          if (spectrum.experiment) info.push(spectrum.experiment);
          if (spectrum.solvent) info.push(spectrum.solvent);
          if (spectrum.frequency) info.push(spectrum.frequency.toFixed(0));
          spectrum.info = info.join(', ');
        });
        return spectra;
      } else {
        return [];
      }
    },
    chartPrefs: {
      yLabel: 'Intensity',
      displayYAxis: [
        'main',
        'sec'
      ],
      xLabel: 'δ [ppm]',
      displayXAxis: [
        'display',
        'flip',
        'main',
        'sec'
      ]
    }
  },
  Chromatography: {
    tocFilter: (entry) => entry.value.mbChrom && !entry.value.hidden,
    tocCallback: (entry) => {
      entry.value.nbSpectra = entry.value.mbChrom;
    },
    getSpectra: (sample) => {
      if (
        sample &&
        sample.$content &&
        sample.$content.spectra &&
        Array.isArray(sample.$content.spectra.chromatogram)
      ) {
        let spectra = sample.$content.spectra.chromatogram;
        return spectra;
      } else {
        return [];
      }
    },
    chartPrefs: {
      yLabel: 'Intensity',
      displayYAxis: [
        'main',
        'sec'
      ],
      xLabel: 'Time [s]',
      displayXAxis: [
        'display',
        'flip',
        'main',
        'sec'
      ]
    }
  }
};

class SpectraDataSet {
  constructor(roc, sampleToc, options = {}) {
    this.roc = roc;
    this.sampleToc = sampleToc;
    this.spectraConfig = undefined;
    this.defaultAttributes = options.defaultAttributes || {};
  }

  getChartPrefs() {
    return this.spectraConfig.chartPrefs;
  }

  /**
   * @param {object} [options={}]
   * @param {string} [options.varName='analysisKind'] contains the name of the variable containing the form value
   * @param {string} [options.schemaVarName='analysisKindSchema'] contains the name of the variable containing the form schema
   * @return {string} the form to select group}
   */
  async initializeAnalysis(options = {}) {
    const {
      schemaVarName = 'analysisKindSchema',
      varName = 'analysisKind',
      cookieName = 'eln-default-analysis-kind'
    } = options;

    var possibleAnalysis = Object.keys(SpectraConfigs);
    var defaultAnalysis = localStorage.getItem(cookieName);
    if (possibleAnalysis.indexOf(defaultAnalysis) === -1) {
      defaultAnalysis = possibleAnalysis[0];
    }
    var schema = {
      type: 'object',
      properties: {
        analysis: {
          type: 'string',
          enum: possibleAnalysis,
          default: defaultAnalysis,
          required: true
        }
      }
    };

    API.createData(schemaVarName, schema);

    let analysisKind = await API.createData(varName, {
      analysis: defaultAnalysis
    });

    this.spectraConfig = SpectraConfigs[defaultAnalysis];

    await this.refresh();

    let mainData = Versioning.getData();
    mainData.onChange((evt) => {
      if (evt.jpath[0] === varName) {
        localStorage.setItem(cookieName, analysisKind.analysis);
        this.spectraConfig = SpectraConfigs[String(analysisKind.analysis)];
        this.refresh();
      }
    });

    return analysisKind;
  }

  refresh() {
    if (!this.sampleToc) return;
    this.sampleToc.options.filter = this.spectraConfig.tocFilter;
    this.sampleToc.options.callback = this.spectraConfig.tocCallback;
    this.sampleToc.refresh();
  }

  async processAction(action) {
    console.log({ action });
    switch (action.name) {
      case 'clickedSample':
        this.clickedSample(action.value);
        break;
      case 'refresh':
        this.refresh();
        break;
      case 'hideSpectra':
        this.hideSpectra();
        break;
      case 'hideAllSpectra':
        this.hideAllSpectra();
        break;
      case 'showOnlySpectra':
        this.showOnlySpectra();
        break;
      case 'forceRecolor': {
        let selectedSpectra = API.getData('selectedSpectra');
        selectedSpectra.forEach((spectrum) => spectrum.color = '');
        recolor(selectedSpectra);
        selectedSpectra.triggerChange();
        break;
      }
      case 'showSpectra':
        this.showSpectra();
        break;
      case 'showAllSpectra':
        this.showAllSpectra();
        break;
      case 'clearSelectedSamples':
        {
          let selectedSpectra = API.getData('selectedSpectra');
          selectedSpectra.length = 0;
          selectedSpectra.triggerChange();
        }
        break;
      case 'addSelectedSamples':
        await this.addSelectedSamples(API.getData('tocSelected').resurrect());
        break;
      case 'addSample':
        await this.addSelectedSamples([action.value.resurrect()]);
        break;
      case 'addSpectrum':
        await this.addSpectrum(
          API.getData('tocClicked').resurrect(),
          action.value.resurrect()
        );
        break;
      default:
    }
  }

  async clickedSample(samples) {
    if (samples.length !== 1) {
      API.createData('spectra', []);
      return;
    }
    let uuid = String(samples[0].id);
    let data = await this.roc.document(uuid, { varName: 'linkedSample' });
    let spectra = this.spectraConfig.getSpectra(data);
    API.createData('spectra', spectra);
  }

  showAllSpectra() {
    let selectedSpectra = API.getData('selectedSpectra');
    for (let spectrum of selectedSpectra) {
      spectrum.display = true;
    }
    API.getData('selectedSpectra').triggerChange();
  }

  hideAllSpectra() {
    let selectedSpectra = API.getData('selectedSpectra');
    for (let spectrum of selectedSpectra) {
      spectrum.display = false;
    }
    API.getData('selectedSpectra').triggerChange();
  }

  showSpectra() {
    let selectedSpectra = API.getData('selectedSpectra');
    let currentlySelectedSpectra = API.getData('currentlySelectedSpectra');
    for (let currentlySelectedSpectrum of currentlySelectedSpectra) {
      let spectrum = selectedSpectra.filter((spectrum) => String(spectrum.id) === String(currentlySelectedSpectrum.id))[0];
      spectrum.display = true;
    }
    API.getData('selectedSpectra').triggerChange();
  }

  showOnlySpectra() {
    let selectedSpectra = API.getData('selectedSpectra');
    for (let spectrum of selectedSpectra) {
      spectrum.display = false;
    }
    let currentlySelectedSpectra = API.getData('currentlySelectedSpectra');
    for (let currentlySelectedSpectrum of currentlySelectedSpectra) {
      let spectrum = selectedSpectra.filter((spectrum) => String(spectrum.id) === String(currentlySelectedSpectrum.id))[0];
      spectrum.display = true;
    }
    API.getData('selectedSpectra').triggerChange();
  }

  hideSpectra() {
    let selectedSpectra = API.getData('selectedSpectra');
    let currentlySelectedSpectra = API.getData('currentlySelectedSpectra');
    for (let currentlySelectedSpectrum of currentlySelectedSpectra) {
      let spectrum = selectedSpectra.filter((spectrum) => String(spectrum.id) === String(currentlySelectedSpectrum.id))[0];
      spectrum.display = false;
    }
    API.getData('selectedSpectra').triggerChange();
  }

  addSpectrum(tocEntry, spectrum) {
    let selectedSpectra = API.getData('selectedSpectra');
    this.addSpectrumToSelected(spectrum, tocEntry, selectedSpectra);
    recolor(selectedSpectra);
    selectedSpectra.triggerChange();
  }

  async addSelectedSamples(tocSelected) {
    let selectedSpectra = API.getData('selectedSpectra');
    // count the number of sampleIDs to determine the number of colros
    let promises = [];
    for (let tocEntry of tocSelected) {
      promises.push(
        this.roc.document(tocEntry.id).then((sample) => {
          let spectra = this.spectraConfig.getSpectra(sample);
          for (let spectrum of spectra) {
            if (spectrum.jcamp && spectrum.jcamp.filename) {
              this.addSpectrumToSelected(spectrum, tocEntry, selectedSpectra);
            }
          }
        })
      );
    }
    await Promise.all(promises);
    recolor(selectedSpectra);
    selectedSpectra.triggerChange();
  }

  addSpectrumToSelected(spectrum, tocEntry, selectedSpectra) {
    if (spectrum.jcamp) {
      let spectrumID = String(`${tocEntry.value.reference} / ${spectrum.jcamp.filename.replace(/.*\/(.*)\..*/, '$1')}`);
      let sampleID = String(tocEntry.id);
      if (selectedSpectra.filter((spectrum) => String(spectrum.id) === spectrumID).length > 0) return;
      spectrum.sampleID = sampleID;
      spectrum.id = spectrumID;
      spectrum.display = true;
      for (let key in this.defaultAttributes) {
        spectrum[key] = this.defaultAttributes[key];
      }

      spectrum.deconvolutionReference = false;
      spectrum.sampleCode = tocEntry.key.slice(1).join('_');
      spectrum.toc = tocEntry;
      spectrum.category = spectrum.sampleCode;
      spectrum._highlight = spectrumID;
      selectedSpectra.push(spectrum);
    }
  }
}

function recolor(selectedSpectra) {
  // need to count the categories
  let categoryColors = {};
  let existingColors = 0;
  for (let spectrum of selectedSpectra) {
    let category = String(spectrum.category);
    if (categoryColors[category] === undefined) {
      if (spectrum.color) {
        categoryColors[String(spectrum.category)] = spectrum.color;
        existingColors++;
      } else {
        categoryColors[String(spectrum.category)] = '';
      }
    }
  }

  let nbColors = Math.max(
    8,
    1 << Math.ceil(Math.log2(Object.keys(categoryColors).length))
  );
  const colors = Color.getDistinctColorsAsString(nbColors);
  let i = existingColors;
  for (let key in categoryColors) {
    if (!categoryColors[key]) {
      categoryColors[key] = colors[i++];
    }
  }
  for (let spectrum of selectedSpectra) {
    if (!spectrum.color) {
      spectrum.color = categoryColors[String(spectrum.category)];
    }
  }
}


module.exports = SpectraDataSet;
