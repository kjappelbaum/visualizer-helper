import Datas from 'src/main/datas';
import API from 'src/util/api';
import UI from 'src/util/ui';

import Roc from '../rest-on-couch/Roc';

import ExpandableMolecule from './ExpandableMolecule';
import Nmr1dManager from './Nmr1dManager';
import MF from './MF';
import { createVar } from './jpaths';
import elnPlugin from './libs/elnPlugin';
import CCE from './libs/CCE';
import convertToJcamp from './libs/convertToJcamp';

const DataObject = Datas.DataObject;

var defaultOptions = {
  varName: 'sample',
  track: false,
  bindChange: true
};

class Sample {
  constructor(couchDB, uuid, options) {
    this.options = Object.assign({}, defaultOptions, options);

    var roc = API.cache('roc');
    if (!roc) {
      roc = new Roc({
        url: couchDB.url,
        database: couchDB.database,
        processor: elnPlugin,
        kind: couchDB.kind
      });
      API.cache('roc', roc);
    }
    this.roc = roc;

    if (options.onSync) {
      var emitter = this.roc.getDocumentEventEmitter(uuid);
      emitter.on('sync', () => options.onSync(true));
      emitter.on('unsync', () => options.onSync(false));
    }

    this.uuid = uuid;
    if (!this.uuid) {
      UI.showNotification(
        'Cannot create an editable sample without an uuid',
        'error'
      );
      return;
    }
    this._loadInstanceInVisualizer();
  }

  async _loadInstanceInVisualizer() {
    this.sample = await this.roc.document(this.uuid, this.options);

    if (!this.sample.$content.general) {
      this.sample.$content.general = {};
    }

    var sampleVar = API.getVar(this.options.varName);

    createVar(sampleVar, 'sampleCode');
    createVar(sampleVar, 'batchCode');
    createVar(sampleVar, 'creationDate');
    createVar(sampleVar, 'modificationDate');
    createVar(sampleVar, 'content');
    createVar(sampleVar, 'general');
    createVar(sampleVar, 'molfile');
    createVar(sampleVar, 'sequence');
    createVar(sampleVar, 'mf');
    createVar(sampleVar, 'mw');
    createVar(sampleVar, 'em');
    createVar(sampleVar, 'title');
    createVar(sampleVar, 'description');
    createVar(sampleVar, 'keyword');
    createVar(sampleVar, 'name');
    createVar(sampleVar, 'physical');
    createVar(sampleVar, 'bp');
    createVar(sampleVar, 'nd');
    createVar(sampleVar, 'mp');
    createVar(sampleVar, 'density');
    createVar(sampleVar, 'ir');
    createVar(sampleVar, 'uv');
    createVar(sampleVar, 'raman');
    createVar(sampleVar, 'mass');
    createVar(sampleVar, 'nmr');
    createVar(sampleVar, 'xray');
    createVar(sampleVar, 'chromatogram');
    createVar(sampleVar, 'thermogravimetricAnalysis');
    createVar(sampleVar, 'differentialScanningCalorimetry');
    createVar(sampleVar, 'image');
    createVar(sampleVar, 'sampleCode');
    createVar(sampleVar, 'attachments');
    createVar(sampleVar, 'nucleic');

    this._initializeObjects();

    this.onChange = (event) => {
      var jpathStr = event.jpath.join('.');
      if (jpathStr.match(/\$content.spectra.nmr.[0-9]+.range/)) {
        this.nmr1dManager.rangesHasChanged();
      }

      switch (event.jpath.join('.')) {
        case '$content.general.molfile':
          this.mf.fromMolfile();
          this.nmr1dManager.handleAction({
            name: 'clearAllAssignments'
          });
          break;
        case '$content.general.mf':
          try {
            this.mf.fromMF();
            this.nmr1dManager.updateIntegralOptionsFromMF();
          } catch (e) {
            console.log(e); // eslint-disable-line no-console
          }
          break;
        case '$content.general.sequence':
          try {
            var sequenceOriginal = `${this.sample.getChildSync([
              '$content',
              'general',
              'sequence'
            ]) || ''}`;
            var sequence = CCE.convertAASequence(sequenceOriginal);
            this.sample.setChildSync(['$content', 'general', 'mf'], sequence);
          } catch (e) {
            console.log(e); // eslint-disable-line no-console
          }
          break;
        default:
          break; // ignore
      }
    };

    this.bindChange();
  }

  _initializeObjects() {
    this.expandableMolecule = new ExpandableMolecule(this.sample, this.options);
    this.nmr1dManager = new Nmr1dManager(this.sample);

    this.mf = new MF(this.sample);
    this.mf.fromMF();
  }

  bindChange() {
    if (this.options.bindChange) {
      this.sample.unbindChange(this.onChange);
      this.sample.onChange(this.onChange);
    }
  }

  unbindChange() {
    if (this.options.bindChange) this.sample.unbindChange(this.onChange);
  }

  /** An image with a special name that is used to display on the
   * first page of a sample
   */
  async handleOverview(variableName) {
    let data = API.getData(variableName);
    if (data && data.file && data.file[0]) {
      let file = data.file[0];
      // we only accepts 3 mimetype
      switch (file.mimetype) {
        case 'image/png':
          file.filename = 'overview.png';
          break;
        case 'image/jpeg':
          file.filename = 'overview.jpg';
          break;
        case 'image/svg+xml':
          file.filename = 'overview.svg';
          break;
        default:
          UI.showNotification(
            'For overview only the following formats are allowed: png, jpg and svg.',
            'error'
          );
          return undefined;
      }
      return this.handleDrop(variableName, false);
    }
    return undefined;
  }

  /**
   *
   * @param {string} variableName
   * @param {boolean} askType
   * @param {object} options
   * @param {string} [options.customMetadata]
   * @param {boolean} [options.autoJcamp] - converts automatically tsv, txt and csv to jcamp
   */
  async handleDrop(variableName, askType, options = {}) {
    var type;
    if (!variableName) {
      throw new Error('handleDrop expects a variable name');
    }
    variableName = String(variableName);
    if (!askType) {
      // maps name of variable to type of data
      var types = {
        droppedNmr: 'nmr',
        droppedIR: 'ir',
        droppedUV: 'uv',
        droppedMS: 'mass',
        droppedXray: 'xray',
        droppedOverview: 'image',
        droppedImage: 'image',
        droppedGenbank: 'genbank'
      };
      if (!types[variableName]) {
        throw new Error('Unexpected variable name');
      }
      type = types[variableName];
    } else {
      type = await UI.choose(
        {
          nmr: 'NMR (jcamp, pdf)',
          mass: 'Mass (jcamp, pdf, netcdf, xml)',
          ir: 'Infrared (jcamp, pdf)',
          uv: 'UV (jcamp, pdf)',
          chromatogram:
            'Chromatogram LC, GC, LC/MS, GC/MS (jcamp, pdf, netcdf, xml)',
          thermogravimetricAnalysis: 'Thermogravimetric Analysis (txt)',
          differentialScanningCalorimetry:
            'Differential Scanning Calorimetry (txt)',
          xray: 'Xray (cif, pdb)',
          image: 'Images (jpg, png or tiff)',
          other: 'Other'
        },
        {
          noConfirmation: true,
          columns: [
            {
              id: 'description',
              name: 'description',
              field: 'description'
            }
          ]
        }
      );
      if (!type) return;
    }

    // Dropped data can be an array
    // Expecting format as from drag and drop module
    var droppedDatas = API.getData(variableName);
    droppedDatas = droppedDatas.file || droppedDatas.str;

    /*
          Possible autoconvertion of text file to jcamp
          * if filename ends with TXT, TSV or CSV
          * use convert-to-jcamp
        */
    if (options.autoJcamp) {
      let extension = droppedDatas.filename.replace(/.*\./, '').toLowerCase();
      if (extension === 'txt' || extension === 'csv' || extension === 'tsv') {
        var jcampTypes = {
          nmr: 'NMR SPECTRUM',
          ir: 'IR SPECTRUM',
          uv: 'UV SPECTRUM',
          mass: 'MASS SPECTRUM'
        };
        if (jcampTypes[type]) {
          droppedDatas.filename = droppedDatas.filename.replace(/\..*?$/, '');
          droppedDatas.mimetype = 'chemical/x-jcamp-dx';
          convertToJcamp('', {
            meta: {
              title: droppedDatas.filename,
              type: jcampTypes[type]
            }
          });
        }
      }
    }

    if (type === 'other') {
      await this.roc.addAttachment(this.sample, droppedDatas);
    } else {
      await this.attachFiles(droppedDatas, type, options);
    }
  }

  async handleAction(action) {
    if (!action) return;

    if (
      this.expandableMolecule &&
      this.expandableMolecule.handleAction(action)
    ) {
      return;
    }
    if (this.nmr1dManager && this.nmr1dManager.handleAction(action)) return;

    switch (action.name) {
      case 'save':
        await this.roc.update(this.sample);
        break;
      case 'createOptions':
        var advancedOptions1H = API.cache('nmr1hAdvancedOptions');
        if (advancedOptions1H) {
          API.createData(
            'nmr1hOndeTemplate',
            API.cache('nmr1hOndeTemplates').full
          );
        } else {
          API.createData(
            'nmr1hOndeTemplate',
            API.cache('nmr1hOndeTemplates').short
          );
        }
        break;
      case 'deleteAttachment':
        var attachment = action.value.name;
        await this.roc.deleteAttachment(this.sample, attachment);
        break;
      case 'deleteNmr': // Deprecated. Use unattach. Leave this for backward compatibility
      case 'unattach':
        await this.roc.unattach(this.sample, action.value);
        break;
      case 'attachNMR':
      case 'attachIR':
      case 'attachMass': {
        var tempType = action.name.replace('attach', '');
        var type = tempType.charAt(0).toLowerCase() + tempType.slice(1);
        var droppedDatas = action.value;
        droppedDatas = droppedDatas.file || droppedDatas.str;
        await this.attachFiles(droppedDatas, type);
        break;
      }
      case 'refresh': {
        const ok = await UI.confirm(
          'Are you sure you want to refresh? This will discard your local modifications.'
        );
        if (!ok) return;
        this.unbindChange();
        this.expandableMolecule.unbindChange();
        await this.roc.discardLocal(this.sample);
        this._initializeObjects();
        this.bindChange();
        this.nmr1dManager.handleAction({ name: 'nmrChanged' });
        break;
      }
      default:
        break;
    }
  }

  async attachFiles(files, type, options) {
    if (!files || !type) return;

    if (!Array.isArray(files)) {
      files = [files];
    }
    for (let i = 0; i < files.length; i++) {
      const data = DataObject.resurrect(files[i]);
      await this.roc.attach(type, this.sample, data, options);
    }
  }
}

module.exports = Sample;
