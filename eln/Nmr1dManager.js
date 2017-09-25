import fileSaver from 'file-saver';
import API from 'src/util/api';
import UI from 'src/util/ui';
import {getData} from './jpaths';
import SD from './libs/SD';
import CCE from './libs/CCE';

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
                var blob = new Blob([action.value + ''], {type: 'application/jcamp-dx;charset=utf-8'});
                fileSaver(blob, 'spectra.svg');
                break;
            case 'toggleNMR1hAdvancedOptions':
                var advancedOptions1H = !API.cache('nmr1hAdvancedOptions');
                API.cache('nmr1hAdvancedOptions', advancedOptions1H);
                if (advancedOptions1H) {
                    API.createData('nmr1hOndeTemplate', API.getData('nmr1hOndeTemplates').full);
                } else {
                    API.createData('nmr1hOndeTemplate', API.getData('nmr1hOndeTemplates').short);
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
                    if (action.value.jcamp) {
                        API.createData('blackNMR2d', action.value.jcamp.data);
                    } else {
                        API.createData('blackNMR2d', null);
                    }

                } else {
                    if (action.value.jcamp) {
                        API.createData('blackNMR1d', action.value.jcamp.data);
                    } else {
                        API.createData('blackNMR1d', null);
                    }
                }
                break;
            case 'executePeakPicking':
                var currentNmr = API.getData('currentNmr');
                if (currentNmr.dimension > 1) {
                    if (typeof UI !== 'undefined') {
                        UI.showNotification('Peak picking can only be applied on 1D spectra', 'warning');
                    }
                    return false;
                }
                this._autoRanges(currentNmr);
                break;
            case 'nmrChanged':
                if (action.value.dimension <= 1) {
                    this.executePeakPicking(action.value, true);
                }
                break;
            default:
                return false;
        }
        return true;
    }

    executePeakPicking(nmr, updateIntegral) {
        if (nmr.dimension > 1) {
            return false;
        }
        if (nmr.nucleus && nmr.nucleus[0].replace(/[0-9]/,'')!=='H' ) {
            return false;
        }

        if (!nmr.range || !nmr.range.length) {
            this.updateIntegral({mf: true});
            this._autoRanges(nmr);
        } else {
            if (updateIntegral) {
                this.updateIntegral({range: nmr.range});
            }
        }
    }

    updateIntegrals(integral) {
        var ppOptions = API.getData('nmr1hOptions');
        var currentRanges = API.getData('currentNmrRanges');
        if (!currentRanges) return;

        // We initialize ranges with the DataObject so that
        // the integral update is inplace
        var ranges = new Ranges(currentRanges);
        ranges.updateIntegrals({sum: Number(ppOptions.integral || integral)});
    }

    _getNMR(currentNMRLine) {
        var filename = String(currentNMRLine.getChildSync(['jcamp', 'filename']));
        return currentNMRLine.getChild(['jcamp', 'data']).then((jcamp) => {
            if (filename && this.spectra[filename]) {
                var spectrum = this.spectra[filename];
            } else {
                if (jcamp) {
                    jcamp = String(jcamp.get());
                    spectrum = NMR.fromJcamp(jcamp);
                    if (filename) {
                        this.spectra[filename] = spectrum;
                    }
                } else {
                    spectrum = new NMR();
                }
            }
            return spectrum;
        });
    }

    _autoRanges(nmrLine) {
        this._getNMR(nmrLine).then(nmrSpectrum => {
            var ppOptions = API.getData('nmr1hOptions').resurrect();
            var removeImpurityOptions = {};
            if (ppOptions.removeImpurities.useIt) {
                removeImpurityOptions = {solvent: nmrLine.solvent, nH: Number(ppOptions.integral), error: ppOptions.removeImpurities.error};
            }
            var ranges = nmrSpectrum.getRanges({
                nH: Number(ppOptions.integral),
                realTop: true,
                thresholdFactor: Number(ppOptions.noiseFactor),
                clean: ppOptions.clean,
                compile: ppOptions.compile,
                from: ppOptions.from,
                to: ppOptions.to,
                optimize: ppOptions.optimize,
                integralType: ppOptions.integralFn,
                gsdOptions: {minMaxRatio: 0.001, smoothY: false, broadWidth: 0.004},
                removeImpurity: removeImpurityOptions
            });
            nmrLine.setChildSync(['range'], ranges);
        });
    }

    async _createNMRannotationsAndACS(ranges) {
        var nmrLine=API.getData('currentNmr');
        var nmrSpectrum = await this._getNMR(nmrLine);
        var nucleus = nmrLine.nucleus[0];
        var observe = nmrLine.frequency;
        if (nmrSpectrum && nmrSpectrum.sd) {
            nucleus = nmrSpectrum.getNucleus(0);
            observe = nmrSpectrum.observeFrequencyX();
        }

        const resurrectedRanges = ranges.resurrect ? ranges.resurrect() : ranges;

        if (nmrSpectrum) {
            API.createData('annotationsNMR1d', SD.GUI.annotations1D(resurrectedRanges, {
                line: 1,
                fillColor: 'lightgreen',
                strokeWidth: 0
            }));
        }

        API.createData('acsNMR1d', SD.getACS(resurrectedRanges, {
            rangeForMultiplet: true,
            nucleus,
            observe
        }));
    }

    updateIntegral(opts) {
        opts = opts || {};
        var integral;
        if (opts.range) {
            let sum = 0;
            for (const range of opts.range) {
                sum += range.integral;
            }
            integral = Math.round(sum);
        } else {
            const mf = getData(this.sample, 'mf') + '';
            if (mf) {
                const chemcalc = CCE.analyseMF(mf);
                if (chemcalc && chemcalc.atoms && chemcalc.atoms.H) {
                    integral = chemcalc.atoms.H;
                }
            }
        }

        if (typeof integral !== 'number' || Number.isNaN(integral) || ! integral) {
            integral = 100;
        }
        const nmr1hOptions = API.getData('nmr1hOptions');
        nmr1hOptions.integral = integral;
        nmr1hOptions.triggerChange();
        this.updateIntegrals();
    }

    rangesHasChanged(ranges) {
        ranges = ranges || API.getData('currentNmrRanges');

        if (!ranges) return;

        var rangesWasChanged = SD.GUI.ensureRangesHighlight(ranges);
        if (rangesWasChanged) {
            ranges.triggerChange();
        }
        this._createNMRannotationsAndACS(ranges);
        return rangesWasChanged;
    }

    async initializeNMRAssignment(nmr) {
        if (nmr && nmr.length) {
            for (var i = 0; i < nmr.length; i++) {
                if (!nmr[i].range) {
                    nmr[i].range = [];
                }
             //   this.rangesHasChanged(nmr.getChildSync([i, 'range']));
            }
        }

        await API.createData('nmr1hOptions', {
            noiseFactor: 0.8,
            clean: 0.5,
            compile: true,
            optimize: false,
            integralType: 'sum',
            integral: 100,
            type: '1H',
            removeImpurities: {
                useIt: false,
                error: 0.025
            }
        });

        var nmr1hOndeTemplates = await API.createData('nmr1hOndeTemplates', {
            full: {
                type: 'object',
                properties: {
                    integral: {
                        type: 'number',
                        title: 'value to fit the spectrum integral',
                        label: 'Integral'
                    },
                    noiseFactor: {
                        type: 'number',
                        title: 'Mutiplier of the auto-detected noise level',
                        label: 'noiseFactor'
                    },
                    clean: {
                        type: 'number',
                        title: 'Delete signals with integration less than input value',
                        label: 'clean'
                    },
                    compile: {
                        type: 'boolean',
                        title: 'Compile the multiplets',
                        label: 'compile'
                    },
                    optimize: {
                        type: 'boolean',
                        title: 'Optimize the peaks to fit the spectrum',
                        label: 'optimize'
                    },
                    integralFn: {
                        type: 'string',
                        title: 'Type of integration',
                        label: 'Integral type',
                        enum: [
                            'sum',
                            'peaks'
                        ]
                    },
                    type: {
                        type: 'string',
                        title: 'Nucleus',
                        label: 'Nucleus',
                        editable: false
                    },
                    removeImpurities: {
                        type: 'object',
                        label: 'Remove solvent impurities',
                        properties: {
                            useIt: {
                                type: 'boolean',
                                label: 'Remove Impurities',
                            },
                            error: {
                                type: 'number',
                                label: 'Tolerance',
                                title: 'Allowed error in ppm'
                            }
                        }
                    }
                }
            },
            short: {
                type: 'object',
                properties: {
                    integral: {
                        type: 'number',
                        title: 'Total integral value',
                        label: 'Integral'
                    },
                    removeImpurities: {
                        type: 'object',
                        label: 'Remove solvent impurities',
                        properties: {
                            useIt: {
                                type: 'boolean',
                                label: 'Remove Impurities',
                            },
                            error: {
                                type: 'number',
                                label: 'Tolerance',
                                title: 'Allowed error in ppm'
                            }
                        }
                    }
                }
            }
        });
        await API.createData('nmr1hOndeTemplate', nmr1hOndeTemplates.short);

        var currentNmr = API.getData('currentNmr');
        if (currentNmr) {
            this.updateIntegral({range: currentNmr.getChildSync(['range'])});
        }
    }
}

module.exports = Nmr1dManager;
