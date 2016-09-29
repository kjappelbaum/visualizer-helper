'use strict'

define([
    'file-saver',
    'src/util/api',
    'src/util/ui',
    './libs'
] , function (fileSaver, API, UI, libs) {

    var SD=libs.SD;
    var CCE=libs.CCE;
    
    class Nmr1dManager {
        constructor() {
            this.spectra = {};
        }

        handleAction(action) {
            switch (action.name) {
                case 'updateRanges':
                    this.updateIntegrals();
                    break;
                case 'downloadSVG':
                    var blob = new Blob([action.value+""], {type: "application/jcamp-dx;charset=utf-8"});
                    fileSaver(blob, 'spectra.svg');
                    break;
                case 'toggleNMR1hAdvancedOptions':
                    var advancedOptions1H = ! API.cache("nmr1hAdvancedOptions");
                    API.cache("nmr1hAdvancedOptions", advancedOptions1H);
                    if (advancedOptions1H) {
                        API.createData("nmr1hOndeTemplate", API.getData("nmr1hOndeTemplates").full);
                    } else {
                        API.createData("nmr1hOndeTemplate", API.getData("nmr1hOndeTemplates").short);
                    }

                    break;
                case 'resetNMR1d':
                    var type = action.name.replace(/[^0-9]/g,'');

                    type = type + 'd';
                    API.createData('blackNMR' + type, null);
                    API.createData('annotationNMR' + type, null);
                    API.createData('acsNMR' + type, null);
                    break;
                

                case 'switchNMRLayer': {
                    var layer = API.getActiveLayerName();
                    var goToLayer = action.value.dimension > 1 ? 'nmr2D' : 'Default layer';
                    if(layer !== goToLayer) {
                        API.switchToLayer(goToLayer);
                    }
                    if(action.value.dimension > 1) {
                        API.createData('blackNMR2d', action.value.jcamp.data);
                    } else {
                        API.createData('blackNMR1d', action.value.jcamp.data);
                    }
                    break;
                }
                case 'executePeakPicking':
                    // Execute pickPeacking button was clicked
                    var currentNmr = API.getData('currentNmr');
                    if (currentNmr.dimension>1) {
                        if (typeof UI != "undefined") {
                            UI.showNotification('Peak picking can only be applied on 1D spectra','warning');
                        }
                        return;
                    }
                    this._autoRanges(currentNmr);
                    break;
                case 'nmrChanged':
                    if(action.value.dimension <= 1) {
                        this.executePeakPicking(action.value);
                    }
                    break;
                default:
                    return false;
            }
            return true;
        }

        executePeakPicking(nmr) {
            if(!nmr.range || ! nmr.range.length) {
                this._autoRanges(nmr);
            } else {
                this._updateAnnotations(nmr);
            }
        }

        _updateAnnotations(nmr) {
            var ppOptions = API.getData('nmr1hOptions');
            this._getSpectrum(nmr).then(spectrum => {
                spectrum.updateIntegrals(nmr.getChildSync(['range']), {nH: Number(ppOptions.integral)});
                this._createNMRannotationsAndACS(nmr);
            });
        }

        updateIntegrals() {
            var ppOptions = API.getData("nmr1hOptions");
            var currentRanges = API.getData("currentNmrRanges");
            SD.formatter.updateIntegrals(currentRanges, {sum: Number(ppOptions.integral)});
            currentRanges.triggerChange(true); // no bubbling
        }

        _getSpectrum(nmr) {
            var spectrum;
            var filename = String(nmr.getChildSync(['jcamp', 'filename']));
            return nmr.getChild(['jcamp', 'data']).then((jcamp) => {
                if(filename && this.spectra[filename]) {
                    console.log('load spectrum from cache', filename);
                    spectrum = this.spectra[filename];
                } else {
                    jcamp = String(jcamp.get());
                    var spectrum = SD.NMR.fromJcamp(jcamp);
                    if(filename) {
                        this.spectra[filename] = spectrum;
                    }
                }
                return spectrum;
            });
        }

        _autoRanges(nmr) {
            this._getSpectrum(nmr).then(spectrum => {
                var ppOptions = API.getData("nmr1hOptions").resurrect();
                var intFN = 0;
                if(ppOptions.integralFn=="peaks"){
                    intFN=1;
                }
                var peakPicking = spectrum.nmrPeakDetection({
                    nH:ppOptions.integral,
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
                nmr.setChildSync(['range'], peakPicking);
                this._createNMRannotationsAndACS(nmr);
            });
        }


        _createNMRannotationsAndACS(nmr) {
            console.log('create annoations');
            var peakPicking = JSON.parse(JSON.stringify(nmr.getChildSync(['range'])));

            // TODO : this code hsould not be here !
            //Recompile multiplicity
            for (var i=0; i<peakPicking.length; i++){
                var peak = peakPicking[i];
                for (var j=0; j<peak.signal.length; j++){
                    var signal = peak.signal[j];
                    if (signal.j && ! signal.multiplicity) {
                        signal.multiplicity = "";
                        for (var k=0; k<signal.j.length;k++){
                            signal.multiplicity+=signal.j[k].multiplicity;
                        }
                    }
                }
            }
            //SD.formatter.update(peakPicking);
    
            API.createData("annotationsNMR1d", SD.GUI.annotations1D(peakPicking, {
                line:1,
                fillColor:"green",
                strokeWidth:0
            }));
            API.createData("acsNMR1d",SD.formatter.toACS(peakPicking, {
                rangeForMultiplet:true,
                nucleus:nmr.nucleus[0],
                observe:Math.round(nmr.frequency/10)*10
            }));
        }

        updateIntegral() {
            var chemcalc=CCE.analyseMF(API.getData('mf')+'');
            if (chemcalc && chemcalc.atoms && chemcalc.atoms.H) {
                var nmr1hOptions=API.getData('nmr1hOptions');
                if (nmr1hOptions) nmr1hOptions.integral=chemcalc.atoms.H;
                nmr1hOptions.triggerChange();
            }
        }

        updateHighlights(ranges) {
            ranges = ranges || API.getData("currentNmrRanges");
            if(!ranges) return;
            for(var i=0; i<ranges.length; i++) {
                var range = ranges[i];
                range._highlight = [];
                // Object.defineProperty(range, '_highlight', {
                //     enumerable: false,
                //     writable: true
                // });
                range._highlight = [];
                if(!range.signal) continue;
                for(var j=0; j<range.signal.length; j++) {
                    var signal = range.signal[j];
                    if(!signal.diaID) continue;
                    for(var k=0; k<signal.diaID.length; k++) {
                        var diaID = signal.diaID[k];
                        range._highlight.push(diaID);
                    }
                }
            }
        }

        initializeNMRAssignment(nmr) {
            if(nmr && nmr.length) {
                for(var i=0; i<nmr.length; i++) {
                    this.updateHighlights(nmr[i].range);
                }
            }
            var promise = Promise.resolve();
            promise = promise.then(() => API.createData('nmr1hOptions', {
                    "noiseFactor": 0.8,
                    "clean": true,
                    "compile": true,
                    "optimize": false,
                    "integralFn": "sum",
                    "integral": 30,
                    "type": "1H"
                })
            );

            promise=promise.then(() => API.createData('nmr1hOndeTemplates', {
                "full": {
                    "type": "object",
                    "properties": {
                        "integral": {
                            "type": "number",
                            "title": "value to fit the spectrum integral",
                            "label": "Integral"
                        },
                        "noiseFactor": {
                            "type": "number",
                            "title": "Mutiplier of the auto-detected noise level",
                            "label": "noiseFactor"
                        },
                        "clean": {
                            "type": "boolean",
                            "title": "Delete signals with integration less than 0.5",
                            "label": "clean"
                        },
                        "compile": {
                            "type": "boolean",
                            "title": "Compile the multiplets",
                            "label": "compile"
                        },
                        "optimize": {
                            "type": "boolean",
                            "title": "Optimize the peaks to fit the spectrum",
                            "label": "optimize"
                        },
                        "integralFn": {
                            "type": "string",
                            "title": "Type of integration",
                            "label": "Integral type",
                            "enum": [
                                "sum",
                                "peaks"
                            ]
                        },
                        "type": {
                            "type": "string",
                            "title": "Nucleus",
                            "label": "Nucleus",
                            "editable": false
                        }
                    }
                },
                "short": {
                    "type": "object",
                    "properties": {
                        "integral": {
                            "type": "number",
                            "title": "value to fit the spectrum integral",
                            "label": "Integral"
                        }
                    }
                }
            }));
            promise=promise.then((nmr1hOndeTemplates) => API.createData('nmr1hOndeTemplate', nmr1hOndeTemplates.short));
            promise=promise.then(() => {
                this.updateIntegral();
            });
            return promise;
        }
    }
        

    return Nmr1dManager;
});

