'use strict';

import fileSaver from 'file-saver';
import API from 'src/util/api';
import UI from 'src/util/ui';
import {getData} from './jpaths';
import {SD, CCE} from './libs';

const Ranges = SD.Ranges;
const NMR = SD.NMR;

class Nmr1dManager {
    constructor(sample) {
        this.spectra = {};
        this.sample = sample;
    }

    handleAction(action) {
        switch (action.name) {
            case 'updateRanges':
                this.updateIntegrals();
                break;
            case 'downloadSVG':
                var blob = new Blob([action.value + ""], {type: "application/jcamp-dx;charset=utf-8"});
                fileSaver(blob, 'spectra.svg');
                break;
            case 'toggleNMR1hAdvancedOptions':
                var advancedOptions1H = !API.cache("nmr1hAdvancedOptions");
                API.cache("nmr1hAdvancedOptions", advancedOptions1H);
                if (advancedOptions1H) {
                    API.createData("nmr1hOndeTemplate", API.getData("nmr1hOndeTemplates").full);
                } else {
                    API.createData("nmr1hOndeTemplate", API.getData("nmr1hOndeTemplates").short);
                }

                break;
            case 'resetNMR1d':
                var type = action.name.replace(/[^0-9]/g, '');

                type = type + 'd';
                API.createData('blackNMR' + type, null);
                API.createData('annotationNMR' + type, null);
                API.createData('acsNMR' + type, null);
                break;


            case 'switchNMRLayer':
                var goToLayer = action.value.dimension > 1 ? 'nmr2D' : 'Default layer';
                API.switchToLayer(goToLayer);
                if (action.value.dimension > 1) {
                    API.createData('blackNMR2d', action.value.jcamp.data);
                } else {
                    API.createData('blackNMR1d', action.value.jcamp.data);
                }
                break;
            case 'executePeakPicking':
                // Execute pickPeacking button was clicked
                var currentNmr = API.getData('currentNmr');
                if (currentNmr.dimension > 1) {
                    if (typeof UI != "undefined") {
                        UI.showNotification('Peak picking can only be applied on 1D spectra', 'warning');
                    }
                    return;
                }
                this._autoRanges(currentNmr);
                break;
            case 'nmrChanged':
                if (action.value.dimension <= 1) {
                    this.executePeakPicking(action.value);
                }
                break;
            default:
                return false;
        }
        return true;
    }

    executePeakPicking(nmr) {
        if (!nmr.range || !nmr.range.length) {
            this.updateIntegral({mf: true});
            this._autoRanges(nmr);
        } else {
            this.updateIntegral({range: nmr.range});
            // this._updateAnnotations(nmr);
        }
    }

    _updateAnnotations(nmr) {
        // var ppOptions = API.getData('nmr1hOptions');
        this._getNMR(nmr).then(spectrum => {
            // spectrum.updateIntegrals(nmr.getChildSync(['range']), {nH: Number(ppOptions.integral)});
            this._createNMRannotationsAndACS(spectrum, new Ranges(nmr.range.resurrect()));
        });
    }

    updateIntegrals(integral) {
        var ppOptions = API.getData("nmr1hOptions");
        var currentRanges = API.getData("currentNmrRanges");
        if(!currentRanges) return;


        // We initialize ranges with the DataObject so that
        // the integral update is inplace
        var ranges = new Ranges(currentRanges);
        ranges.updateIntegrals({sum: Number(ppOptions.integral || integral)});

        // Trigger change of currentRanges would cause an infinite loop
        // So we just send an action for notifying modules
        // TODO: fix that so that entry can be detected as changed and saved to idb when integrals are updated
        API.doAction('rerenderRanges');
        const currentNmr = API.getData('currentNmr');
        if(currentNmr) {
            setImmediate(() => {
                this._updateAnnotations(currentNmr);
            });
        }
    }

    _getNMR(nmr) {
        var filename = String(nmr.getChildSync(['jcamp', 'filename']));
        return nmr.getChild(['jcamp', 'data']).then((jcamp) => {
            if (filename && this.spectra[filename]) {
                var spectrum = this.spectra[filename];
            } else {
                jcamp = String(jcamp.get());
                spectrum = NMR.fromJcamp(jcamp);
                if (filename) {
                    this.spectra[filename] = spectrum;
                }
            }
            return spectrum;
        });
    }

    _autoRanges(currentNmr) {
        this._getNMR(currentNmr).then(nmr => {
            var ppOptions = API.getData("nmr1hOptions").resurrect();
            var intFN = 0;
            if (ppOptions.integralFn == "peaks") {
                intFN = 1;
            }
            var ranges = nmr.getRanges({
                nH: Number(ppOptions.integral),
                realTop: true,
                thresholdFactor: Number(ppOptions.noiseFactor),
                clean: ppOptions.clean,
                compile: ppOptions.compile,
                optimize: ppOptions.optimize,
                integralFn: intFN,
                idPrefix: nmr.getNucleus() + "",
                gsdOptions: {minMaxRatio: 0.001, smoothY: false, broadWidth: 0},
                format: "new"
            });
            currentNmr.setChildSync(['range'], ranges);
            this._createNMRannotationsAndACS(nmr, ranges);
            //Is this possible. I need to add the highligth on the ranges
            //nmr.setChildSync(['range'], peakPicking);
        });
    }


    _createNMRannotationsAndACS(nmr, ranges) {
        ranges.updateMultiplicity();

        // TODO : this code hsould not be here !
        //Recompile multiplicity
        // for (var i = 0; i < ranges.length; i++) {
        //     var peak = ranges[i];
        //     for (var j = 0; j < peak.signal.length; j++) {
        //         var signal = peak.signal[j];
        //         if (signal.j && !signal.multiplicity) {
        //             signal.multiplicity = "";
        //             for (var k = 0; k < signal.j.length; k++) {
        //                 signal.multiplicity += signal.j[k].multiplicity;
        //             }
        //         }
        //     }
        // }
        //SD.formatter.update(peakPicking);

        API.createData("annotationsNMR1d", ranges.getAnnotations({
            line: 1,
            fillColor: "green",
            strokeWidth: 0
        }));
        API.createData('acsNMR1d', ranges.getACS({
            rangeForMultiplet: true,
            nucleus: nmr.getNucleus(0),
            observe: Math.round(nmr.observeFrequencyX() / 10) * 10
        }))
    }

    updateIntegral(opts) {
        opts = opts || {};
        var integral;
        if(opts.range) {
            let sum = 0;
            for(const range of opts.range) {
                sum += range.integral;
            }
            integral = Math.round(sum);
        } else {
            const chemcalc = CCE.analyseMF(getData(this.sample, 'mf') + '');
            if (chemcalc && chemcalc.atoms && chemcalc.atoms.H) {
                integral = chemcalc.atoms.H;
            }
        }

        if(!Number.isNaN(integral)) {
            const nmr1hOptions = API.getData('nmr1hOptions');
            nmr1hOptions.integral = integral;
            nmr1hOptions.triggerChange();
            this.updateIntegrals();
        } else {
            console.warn('not updating integrals, invalid total integral');
        }


    }

    updateHighlights(ranges) {
        ranges = ranges || API.getData("currentNmrRanges");
        if (!ranges) return;
        for (var i = 0; i < ranges.length; i++) {
            var range = ranges[i];
            // range._highlight = [];
            Object.defineProperty(range, '_highlight', {
                enumerable: false,
                writable: true
            });
            range._highlight = [range.signalID];
            if (!range.signal) continue;
            for (var j = 0; j < range.signal.length; j++) {
                var signal = range.signal[j];
                if (!signal.diaID) continue;
                for (var k = 0; k < signal.diaID.length; k++) {
                    var diaID = signal.diaID[k];
                    range._highlight.push(diaID);
                }
            }
        }
    }

    initializeNMRAssignment(nmr) {
        if (nmr && nmr.length) {
            for (var i = 0; i < nmr.length; i++) {
                if (!nmr[i].range) {
                    nmr[i].range = [];
                }
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

        promise = promise.then(() => API.createData('nmr1hOndeTemplates', {
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
        promise = promise.then((nmr1hOndeTemplates) => API.createData('nmr1hOndeTemplate', nmr1hOndeTemplates.short));
        promise = promise.then(() => {
            var nmr = API.getData('currentNmr');
            if(nmr) {
                this.updateIntegral({range: nmr.getChildSync(['range'])});
            }

        });
        return promise;
    }
}

module.exports = Nmr1dManager;
