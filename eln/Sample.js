'use strict'
/**
 * Created by acastillo on 7/1/16.
 */
define([
    'Sample/ExpandableMolecule',
    'Sample/Nmr1dManager',
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
                promise = promise.then(this._initializeNMRAssignment.bind(this));
                promise = promise.then(this._updatedMF.bind(this));
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

        handleActionSD(action) {
            switch (action.name) {
                case 'reset1d':
                case 'reset2d':
                    if (this.event !== 'action') return;

                    var type;
                    if (action.name === 'reset1d') type = '1'
                    else if (action.name === 'reset2d') type = '2'
                    else return;

                    var legend = API.cache('legend');
                    if (!legend) {
                        legend = {
                            1: {},
                            2: {}
                        }
                        API.cache('legend', legend);
                    }

                    legend[type] = {};

                    type = type + 'd';
                    API.createData('black', null);
                    API.createData('annot' + type, null);
                    API.createData('legend' + type, {});
                    API.createData('acs', null);

                    break;
                case 'executePeakPicking':
                    //API.doAction("reset1d");
                    // the action may be generated by clicking on a line or clicking on the button to
                    // recalculate the peak picking.
                    
                    var currentNmr;
                    if (action.value.dimension) { // Fired from click on row. We can not take variable because it may not exist yet
                        currentNmr = action.value;
                        if (currentNmr.dimension > 1) {
                            API.createData('black2d', currentNmr.jcamp.data);
                            API.switchToLayer('2D');
                            return;
                        } else {
                            API.switchToLayer('Default layer');
                            API.createData('black1d', currentNmr.jcamp.data);
                        }
                    } else { // we click on the button, show an alert if we want to redo peak picking
                        currentNmr = API.getData('currentNmr');
                        if (currentNmr.dimension > 1) {
                            if (typeof UI != "undefined")
                                UI.showNotification('Peak picking can only be applied on 1D spectra', 'warning');
                            return;
                        }
                    }
                    if (action.value.integral) {//Fired from button
                        doNmrAssignement();
                    } else {
                        if (!currentNmr.range || ! currentNmr.range.length) {
                            doNmrAssignement();
                        }
                    }
                    API.createData("nmrParams", {
                        "nucleus": currentNmr.nucleus[0],
                        "observe": Math.floor(currentNmr.frequency / 10) * 10
                    });
                    break;
                default:
                    return false;
            }
            return true;
        }




        doNmrAssignement() {
            var jcamp = currentNmr.getChild(['jcamp', 'data']);
            console.log(doNmrAssignement);
            console.log('jcamp',jcamp.length);

            jcamp.then(function(jcamp) {
                jcamp = String(jcamp.get());
                var ppOptions = JSON.parse(JSON.stringify(API.getData("nmr1hOptions"))) || {};
                var integral = ppOptions.integral;
                if(!ppOptions.noiseFactor){
                    ppOptions = {
                        noiseFactor:0.8,
                        clean:true,
                        compile:true,
                        optimize:false,
                        integralFn:"sum",
                        type:"1H"};
                }

                var spectrum = SD.NMR.fromJcamp(jcamp);
                var intFN = 0;
                if(ppOptions.integralFn=="peaks"){
                    intFN=1;
                }
                var peakPicking = spectrum.nmrPeakDetection({"nH":integral,
                    realTop:true,
                    thresholdFactor:ppOptions.noiseFactor,
                    clean:ppOptions.clean,
                    compile:ppOptions.compile,
                    optimize:ppOptions.optimize,
                    integralFn:intFN,
                    idPrefix:spectrum.getNucleus()+"",
                    gsdOptions:{minMaxRatio:0.001, smoothY:false, broadWidth:0},
                    format:"new"
                });
                currentNmr.setChildSync(['range'], peakPicking);
            });

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

