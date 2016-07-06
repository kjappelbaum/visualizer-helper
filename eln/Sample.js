'use strict'
/**
 * Created by acastillo on 7/1/16.
 */
define(['src/util/api', 'src/util/ui', 'OCLE', 'Roc'], function (API, UI, OCLE, Roc) {


    class Sample{

        constructor(roc, uuid, varName, options){
            this.options = Object.assign({},{trackChanges:true},options);
            this.roc = roc;
            if(!this.roc){
                console.log("Cannot create an editable sample without an active Roc");
                return;
            }
            this.uuid = uuid;
            if(!this.uuid){
                console.log("Cannot create an editable sample without an uuid");
                return;
            }
            this.varName = varName||"sample";
            this.loadInstanceInVisualizer();
        }

        loadInstanceInVisualizer(){
            var that = this;
            this.roc.document(this.uuid, {
                varName: this.varName
            }).then(function (sample) {
                var sampleVar = API.getVar(that.varName);
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
                that.updateAttachments(sample);
                if(typeof OCLE !='undefined'&&that.options.trackChanges){
                    var expandableMolecule = new ExpandableMolecule(sample);
                    API.cache('expandableMolecule', expandableMolecule);
                    if (typeof IframeBridge != 'undefined') {
                        sample.onChange(function (event) {
                            IframeBridge.postMessage('tab.status', {
                                saved: false
                            });
                        });
                    }
                }
            });
        }

        updateAttachments(entry) {
            return this.roc.getAttachmentList(this.uuid).then(function (list) {
                API.createData('sampleAttachments', list);
            })
        }

        handleAction(action, data){
            if (action) {
                var sample = API.getData(this.varName);
                if(action.name=='refresh'){
                    this.roc.get(this.uuid);
                }
                else{
                    if(this.options.trackChanges){
                        switch (action.name) {
                            case 'save':
                                this.roc.update(sample).then(function () {
                                    if(typeof IframeBridge !='undefined') {
                                        IframeBridge.postMessage('tab.status', {
                                            saved: true
                                        });
                                    }
                                });
                                break;
                            case 'deleteAttachment':
                                var attachment = action.value.name;
                                this.roc.deleteAttachment(sample, attachment).then(this.updateAttachments);
                                break;
                            case 'deleteSpectra':
                                this.roc.unattach(sample, action.value).then(this.updateAttachments);
                                break;
                            case 'attachNMR':
                            case 'attachIR':
                            case 'attachMass':
                                var type = action.name.replace("attach","").toLowerCase();
                                var droppedDatas = data;
                                droppedDatas = droppedDatas.file || droppedDatas.str;
                                var prom = Promise.resolve();
                                var that = this;
                                for(var i=0; i<droppedDatas.length; i++) {
                                    (function(i) {
                                        prom = prom.then(function() {
                                            var data = DataObject.resurrect(droppedDatas[i]);
                                            //console.log(data);
                                            return that.roc.attach(type, sample, data);
                                        });
                                    })(i)
                                }

                                prom.then(function() {
                                    that.updateAttachments(sample);
                                }).catch(function() {
                                    that.updateAttachments(sample);
                                });
                                break;
                            default:
                                break
                        }
                    }
                }
            }
        }
    }

    class ExpandableMolecule {
        constructor(sampleIn) {
            this.sample = sampleIn;
            this.molfile = this.sample.$content.general.molfile;
            var molecule = OCLE.Molecule.fromMolfile(this.molfile + '');
            this.idCode = molecule.getIDCode();
            this.expandedHydrogens = false;
            this.jsmeEditionMode = false;
            var that = this;
            API.createData('editableMolfile', this.molfile || "").then(
                function (editableMolfile) {
                    //console.log('editableMolfile variable was created');
                    editableMolfile.onChange(function (event) {
                        // us this really a modification ? or a loop event ...
                        // need to compare former oclID with new oclID
                        var idCode = OCLE.Molecule.fromMolfile(event.target + '').getIDCode();
                        //console.log(idCode, that.idCode);
                        //console.log(this.value);
                        if (idCode != that.idCode) {
                            that.idCode = idCode;
                            //console.log('molfile changed');
                            that.molfile = event.target + '';
                            that.sample.setChildSync('$content.general.molfile', that.molfile);
                            that.updateMolfiles();
                            that.updateMF();
                        } else {
                            console.log('no update');
                        }

                        // by default we would like the depict mode
                        that.updateMolfiles();
                        that.updateMF();
                    });
                    that.updateMolfiles();
                    that.toggleJSMEEdition(false);
                }
            );
        }

        toggleJSMEEdition(force, noDepictUpdate) {
            if (force !== undefined && force === this.jsmeEditionMode) return;
            if (force === undefined) {
                this.jsmeEditionMode = !this.jsmeEditionMode;
            } else {
                this.jsmeEditionMode = force;
            }
            //console.log("JSME edit mode: "+this.jsmeEditionMode);
            var prefs = {
                "prefs": [
                    "oldlook",
                    "nozoom"
                ],
                "labelsize": "14",
                "bondwidth": "1",
                "defaultaction": "105",
                "highlightColor": "3",
                "outputResult": [
                    "yes"
                ]
            };

            if (this.jsmeEditionMode) {
                API.getData("editableMolfile").triggerChange();
                this.expandedHydrogens = false;
            } else {
                prefs.prefs.push('depict');
                if (!noDepictUpdate) {
                    this.expandedHydrogens = false;
                    API.createData("viewMolfile", this.viewMolfile);
                }

            }
            //console.log('setJSMEPreferences', prefs);
            API.doAction('setJSMEPreferences', prefs)
        }

        setExpandedHydrogens(force) {
            if (force === undefined) {
                this.expandedHydrogens = !this.expandedHydrogens;
            } else {
                this.expandedHydrogens = force;
            }
            //console.log("Expanded hydrogens: "+this.expandedHydrogens);
            if (this.expandedHydrogens) {
                API.createData("viewMolfileExpandedH", this.viewMolfileExpandedH);
                this.toggleJSMEEdition(false, true);
            } else {
                API.createData("viewMolfile", this.viewMolfile);
            }
        }

        updateMolfiles() {
            // prevent the loop by checking actelionID
            var molecule = OCLE.Molecule.fromMolfile(this.molfile);
            this.viewMolfile = molecule.toVisualizerMolfile();

            molecule.addImplicitHydrogens();
            this.viewMolfileExpandedH = molecule.toVisualizerMolfile();
            this.mf = molecule.getMolecularFormula().formula;
            this.mw = molecule.getMolecularFormula().relativeWeight;
            this.nH = molecule.getNumberOfAtoms('H');
        }

        updateMF() {
            if(typeof UI !='undefined')
                UI.showNotification('Updated mf and mw', 'info');
            this.sample.$content.general.molfile = this.molfile;
            this.sample.$content.general.mf = this.mf;
            this.sample.$content.general.mw = this.mw;
        }
    }

    return Sample;
});

