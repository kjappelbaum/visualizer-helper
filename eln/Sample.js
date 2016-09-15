'use strict'
/**
 * Created by acastillo on 7/1/16.
 */
define([
    './ExpandableMolecule',
    './Nmr1dManager',
    'file-saver',
    'src/util/api',
    'src/util/ui',
    'https://www.lactame.com/lib/chemcalc-extended/1.27.0/chemcalc-extended.js',
    'https://www.lactame.com/lib/eln-plugin/0.0.2/eln-plugin.js',
    'https://www.lactame.com/github/cheminfo-js/visualizer-helper/7f9c4d2c296389ed263a43826bafeba1164d13de/rest-on-couch/Roc.js'
], function (Nmr1dManager, ExpandableMolecule, fileSaver, API, UI, CCE, elnPlugin, Roc) {

    var defaultOptions = {
        varName: 'sample',
        track: true
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


            this.uuid = uuid;
            if (!this.uuid) {
                UI.showNotification("Cannot create an editable sample without an uuid", 'error');
                return;
            }
            this._loadInstanceInVisualizer();
        }

        _loadInstanceInVisualizer() {
            this.roc.document(this.uuid, {
                varName: this.options.varName
            }).then(sample => {
                this.sample = sample;
                var sampleVar = API.getVar(this.options.varName);
                API.setVariable('sampleCode', sampleVar, ['$id', 0]);
                API.setVariable('batchCode', sampleVar, ['$id', 1]);
                API.setVariable('creationDate', sampleVar, ['$creationDate']);
                API.setVariable('modificationDate', sampleVar, ['$modificationDate']);
                API.setVariable('content', sampleVar, ['$content']);
                API.setVariable('molfile', sampleVar, ['$content', 'general', 'molfile']);
                API.setVariable('mf', sampleVar, ['$content', 'general', 'mf']);
                API.setVariable('mw', sampleVar, ['$content', 'general', 'mw']);
                API.setVariable('em', sampleVar, ['$content', 'general', 'em']);
                API.setVariable('description', sampleVar, ['$content', 'general', 'description']);
                API.setVariable('iupac', sampleVar, ['$content', 'general', 'iupac']);
                API.setVariable('bp', sampleVar, ['$content', 'physical', 'bp']);
                API.setVariable('nd', sampleVar, ['$content', 'physical', 'nd']);
                API.setVariable('mp', sampleVar, ['$content', 'physical', 'mp']);
                API.setVariable('density', sampleVar, ['$content', 'physical', 'density']);
                API.setVariable('nmr', sampleVar, ['$content', 'spectra', 'nmr']);
                API.setVariable('ir', sampleVar, ['$content', 'spectra', 'ir']);
                API.setVariable('mass', sampleVar, ['$content', 'spectra', 'mass']);
                this.updateAttachments(sample);

                this.expandableMolecule = new ExpandableMolecule(sample);
                this.nmr1dManager = new Nmr1dManager(sample);

                var self=this;

                sample.onChange((event) => {
                    if (typeof IframeBridge !== 'undefined') {
                        IframeBridge.postMessage('tab.status', {
                            saved: false
                        });
                    }

                    console.log("change event received", event.jpath.join('.'), event);

                    switch (event.jpath.join('.')) {
                        case '$content.general.molfile':

                            break;
                        case '$content.general.mf':
                            var previousEM=this.sample.$content.general.em;
                            this._updatedMF();
                            if (previousEM!==this.chemcalc.em) {
                                this.sample.$content.general.mw = this.chemcalc.mw;
                                this.sample.$content.general.em = this.chemcalc.em;
                                this.sample.$content.general.triggerChange();
                            }
                            break;
                    }
                });

                var promise = Promise.resolve();
                promise = promise.then(() => this.nmr1dManager._initializeNMRAssignment());
                promise = promise.then(() => this._updatedMF());
                return promise;
            });
        }

        _updatedMF() {
            this.chemcalc=undefined;

            if (this.sample['$content'].general && this.sample['$content'].general.mf) {
                try {
                    this.chemcalc=CCE.analyseMF(this.sample['$content'].general.mf+'');
                } catch (e) {
                    UI.showNotification('Could not calculate molecular formula: '+e);
                    console.log(e);
                }
            }
            if (this.chemcalc && this.chemcalc.atoms && this.chemcalc.atoms.H) {
                var nmr1hOptions=API.getData('nmr1hOptions');
                if (nmr1hOptions) nmr1hOptions.integral=this.chemcalc.atoms.H;
                nmr1hOptions.triggerChange();
            }
        }

        updateAttachments(entry) {
            return this.roc.getAttachmentList(this.uuid).then(function (list) {
                API.createData('sampleAttachments', list);
            })
        }

        handleAction(action) {
            if (!action) return;

            if (this.handleActionSD(action)) return;

            if (this.expandableMolecule && this.expandableMolecule.handleAction(action)) return;
            if (this.nmr1dManager && this.nmr1dManager.handleAction(action)) return;

            switch (action.name) {
                case 'refresh':
                    this.roc.get(this.uuid);
                    break;
                case 'save':
                    this.roc.update(this.sample).then(function () {
                        if (typeof IframeBridge != 'undefined') {
                            IframeBridge.postMessage('tab.status', {
                                saved: true
                            });
                        }
                    });
                    break;
                case 'createOptions':
                    var advancedOptions1H = API.cache("nmr1hAdvancedOptions");
                    if (advancedOptions1H) {
                        API.createData("nmr1hOndeTemplate", API.getData("nmr1hOndeTemplates").full);
                    } else {
                        API.createData("nmr1hOndeTemplate", API.getData("nmr1hOndeTemplates").short);
                    }
                    break;
                case 'downloadSVG':
                    var blob = new Blob([this.action.value+""], {type: "application/jcamp-dx;charset=utf-8"});
                    fileSaver(blob, 'spectra.svg');
                    break;
                case 'toggleNMR1hAdvancedOptions':
                    API.cache('nmr1hAdvancedOptions', ! API.cache('nmr1hAdvancedOptions'));
                    break;
                case 'deleteAttachment':
                    var attachment = action.value.name;
                    this.roc.deleteAttachment(sample, attachment).then(this.updateAttachments.bind(this));
                    break;
                case 'deleteSpectra':
                    this.roc.unattach(sample, action.value).then(this.updateAttachments.bind(this));
                    break;
                case 'attachNMR':
                case 'attachIR':
                case 'attachMass':
                    var type = action.name.replace("attach", "").toLowerCase();
                    var droppedDatas = data;
                    droppedDatas = droppedDatas.file || droppedDatas.str;
                    var prom = Promise.resolve();
                    for (let i = 0; i < droppedDatas.length; i++) {
                        prom = prom.then(() => {
                            var data = DataObject.resurrect(droppedDatas[i]);
                            return this.roc.attach(type, sample, data);
                        });
                    }

                    prom.then(() => {
                        this.updateAttachments(sample);
                    }).catch(() => {
                        this.updateAttachments(sample);
                    });
                    break;
                default:
                    break
            }
        }
    }

    return Sample;
});

