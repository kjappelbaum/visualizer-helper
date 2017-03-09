'use strict';

import ExpandableMolecule from './ExpandableMolecule';
import Nmr1dManager from './Nmr1dManager';
import MF from './MF';
import API from 'src/util/api';
import UI from 'src/util/ui';
import Debug from 'src/util/debug';
import {createVar, getData} from './jpaths';
import {elnPlugin} from './libs';
import Roc from '../rest-on-couch/Roc';

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
        this.roc.document(this.uuid, this.options).then(sample => {
            this.sample = sample;
            var sampleVar = API.getVar(this.options.varName);

            createVar(sampleVar, 'sampleCode');
            createVar(sampleVar, 'batchCode');
            createVar(sampleVar, 'creationDate');
            createVar(sampleVar, 'modificationDate');
            createVar(sampleVar, 'content');
            createVar(sampleVar, 'general');
            createVar(sampleVar, 'molfile');
            createVar(sampleVar, 'mf');
            createVar(sampleVar, 'mw');
            createVar(sampleVar, 'em');
            createVar(sampleVar, 'description');
            createVar(sampleVar, 'name');
            createVar(sampleVar, 'bp');
            createVar(sampleVar, 'nd');
            createVar(sampleVar, 'mp');
            createVar(sampleVar, 'density');
            createVar(sampleVar, 'ir');
            createVar(sampleVar, 'mass');
            createVar(sampleVar, 'sampleCode');
            createVar(sampleVar, 'sampleCode');

            this.updateAttachments(sample);

            this.expandableMolecule = new ExpandableMolecule(this.sample);
            this.nmr1dManager = new Nmr1dManager(this.sample);
            this.nmr1dManager.initializeNMRAssignment();
            createVar(sampleVar, 'nmr');
            this.mf = new MF(this.sample);
            this.mf.fromMF();

            this.onChange = (event) => {
                if (typeof IframeBridge !== 'undefined') {
                    IframeBridge.postMessage('tab.status', {
                        saved: false
                    });
                }

                var jpathStr = event.jpath.join('.');


                if (jpathStr.replace(/\.\d+\..*/,'')==='$content.spectra.nmr') {
                    // execute peak picking
                    var currentNmr = this.sample.getChildSync(jpathStr.replace(/(\.\d+)\..*/, '$1').split('.'));
                    this.nmr1dManager.executePeakPicking(currentNmr);
                }


                console.log('Event received',event.jpath.join('.'))
                switch (event.jpath.join('.')) {
                    case '':
                        this.nmr1dManager.initializeNMRAssignment(getData(this.sample, 'nmr'));
                        createVar(sampleVar, 'nmr');
                        break;
                    case '$content.general.molfile':
                        this.mf.fromMolfile();
                        break;
                    case '$content.general.mf':
                        try {
                            this.mf.fromMF();
                            this.nmr1dManager.updateIntegral({mf: true});
                        } catch(e) {}
                        break;
                }
            };

            this.bindChange();
        });
    }

    bindChange() {
        this.sample.unbindChange(this.onChange);
        this.sample.onChange(this.onChange);
    }

    unbindChange() {
        this.sample.unbindChange(this.onChange);
    }



    updateAttachments() {
        return this.roc.getAttachmentList(this.uuid).then(function (list) {
            API.createData('sampleAttachments', list);
        })
    }

    handleDrop(name) {
        if(!name) {
            throw new Error('handleDrop expects a variable name');
        }
        name = String(name);
        // maps name of variable to type of data
        var types = {
            'droppedNmr': 'nmr',
            'droppedIR': 'ir',
            'droppedMS': 'mass'
        };

        if(!types[name]) {
            throw new Error('Unexpected variable name');
        }

        // Dropped data can be an array
        // Expecting format as from drag and drop module
        var droppedDatas = API.getData(name);
        droppedDatas = droppedDatas.file || droppedDatas.str;
        var prom = Promise.resolve();
        for(let i=0; i<droppedDatas.length; i++) {
            prom = prom.then(() => {
                var data = DataObject.resurrect(droppedDatas[i]);
                return this.roc.attach(types[name], this.sample, data);
            });
        }

        prom.then(() => {
            this.updateAttachments();
        }).catch(err =>  {
            Debug.error('Error in handle drop', err);
            // Even if it failed it could be that some of them succeeded
            this.updateAttachments();
        });
    }

    handleAction(action) {
        if (!action) return;

        if (this.expandableMolecule && this.expandableMolecule.handleAction(action)) return;
        if (this.nmr1dManager && this.nmr1dManager.handleAction(action)) return;

        switch (action.name) {
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
            case 'deleteAttachment':
                var attachment = action.value.name;
                this.roc.deleteAttachment(this.sample, attachment).then(this.updateAttachments.bind(this));
                break;
            case 'deleteNmr':
                this.roc.unattach(this.sample, action.value).then(this.updateAttachments.bind(this));
                break;
            case 'updateAttachments':
                this.updateAttachments();
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
            case 'refresh':
                UI.confirm('Are you sure you want to refresh? This will discard your local modifications.').then(ok => {
                    if(!ok) return;
                    this.unbindChange();
                    this.roc.discardLocal(this.sample).then(() => {
                        this.nmr1dManager.initializeNMRAssignment(API.getData('currentNmr'));
                        this.expandableMolecule.unbindChange();
                        this.expandableMolecule = new ExpandableMolecule(this.sample);
                        this.mf = new MF(this.sample);
                        this.mf.fromMF();
                        this.bindChange();
                    });
                    IframeBridge.postMessage('tab.status', {
                        saved: true
                    });
                });

                break;
            default:
                break
        }
    }
}

module.exports = Sample;
