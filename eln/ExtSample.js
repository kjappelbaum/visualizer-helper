'use strict';

import ExpandableMolecule from './ExpandableMolecule';
import MF from './MF';
import API from 'src/util/api';
import Debug from 'src/util/debug';

const defaultOptions = {
    varName: 'sample',
};

class Sample {
    constructor(sample, options) {
        // make sure we don't copy attachment metadata
        const s = {
            $content: {
                general: sample.$content.general,
                identifier: sample.$content.identifier
            }
        };

        this.sample = JSON.parse(JSON.stringify(s));
        this.options = Object.assign({}, defaultOptions, options);

        API.createData(this.options.varName, this.sample).then(sample => {
            this.sample = sample;
            var sampleVar = API.getVar(this.options.varName);

            API.setVariable('sampleCode', sampleVar, ['$id', 0]);
            API.setVariable('batchCode', sampleVar, ['$id', 1]);
            API.setVariable('content', sampleVar, ['$content']);
            API.setVariable('general', sampleVar, ['$content', 'general']);
            API.setVariable('molfile', sampleVar, ['$content', 'general', 'molfile']);
            API.setVariable('mf', sampleVar, ['$content', 'general', 'mf']);
            API.setVariable('mw', sampleVar, ['$content', 'general', 'mw']);
            API.setVariable('em', sampleVar, ['$content', 'general', 'em']);
            API.setVariable('description', sampleVar, ['$content', 'general', 'description']);
            API.setVariable('iupac', sampleVar, ['$content', 'general', 'iupac']);

            this.expandableMolecule = new ExpandableMolecule(this.sample);
            this.mf = new MF(this.sample);
            this.mf.fromMF();

            this.onChange = (event) => {
                var jpathStr = event.jpath.join('.');


                if (jpathStr.replace(/\.\d+\..*/, '') === '$content.spectra.nmr') {
                    // execute peak picking
                    var currentNmr = this.sample.getChildSync(jpathStr.replace(/(\.\d+)\..*/, '$1').split('.'));
                    this.nmr1dManager.executePeakPicking(currentNmr);
                    // this.nmr1dManager.updateIntegrals();
                }


                switch (event.jpath.join('.')) {
                    case '$content.general.molfile':
                        this.mf.fromMolfile();
                        break;
                    case '$content.general.mf':
                        try {
                            this.mf.fromMF();
                        } catch (e) {}
                        break;
                    default:
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
        if (!name) {
            throw new Error('handleDrop expects a variable name');
        }
        name = String(name);
        // maps name of variable to type of data
        var types = {
            'droppedNmr': 'nmr',
            'droppedIR': 'ir',
            'droppedMS': 'mass'
        };

        if (!types[name]) {
            throw new Error('Unexpected variable name');
        }

        // Dropped data can be an array
        // Expecting format as from drag and drop module
        var droppedDatas = API.getData(name);
        droppedDatas = droppedDatas.file || droppedDatas.str;
        var prom = Promise.resolve();
        for (let i = 0; i < droppedDatas.length; i++) {
            prom = prom.then(() => {
                var data = DataObject.resurrect(droppedDatas[i]);
                return this.roc.attach(types[name], this.sample, data);
            });
        }

        prom.then(() => {
            this.updateAttachments();
        }).catch(err => {
            Debug.error('Error in handle drop', err);
            // Even if it failed it could be that some of them succeeded
            this.updateAttachments();
        });
    }

    handleAction(action) {
        if (!action) return;

        if (this.expandableMolecule) {
            this.expandableMolecule.handleAction(action)
        }
    }
}

export default Sample;
