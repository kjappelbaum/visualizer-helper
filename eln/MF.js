
import API from 'src/util/api';
import UI from 'src/util/ui';
import {OCLE, CCE} from './libs';

class MF {
    constructor(sample) {
        this.sample = sample;
        // if no mf we calculate from molfile
        if (!this.getMF()) {
            this.fromMolfile();
        } else {
            const mf = this.getMF();
            if (mf) {
                var chemcalc = CCE.analyseMF(this.getMF());
                if (chemcalc) {
                    this.previousEMMF = chemcalc.em;
                }
            }
        }
    }

    fromMolfile() {
        var chemcalc = this._chemcalcFromMolfile();
        if (chemcalc && this.previousEMMolfile !== chemcalc.em) {
            this.previousEMMolfile = chemcalc.em;
            this.setMF(chemcalc.mf);
        } else {
            // why should we suppress the molecular formula if it changed ???
            // this.setMF('');
        }
        API.createData('mfBGColor', 'white');
    }

    _chemcalcFromMolfile() {
        var molfile = this.getMolfile();
        if (molfile) {
            var molecule = OCLE.Molecule.fromMolfile(molfile);
            var mf = molecule.getMolecularFormula().formula;
            try {
                return CCE.analyseMF(mf);
            } catch (e) {
                if (mf !== '') {
                    UI.showNotification('Could not calculate molecular formula: ' + e);
                }
            }
        }
        return null;
    }

    getMF() {
        return String(this.sample.getChildSync(['$content', 'general', 'mf']) || '');
    }

    getMolfile() {
        return String(this.sample.getChildSync(['$content', 'general', 'molfile']));
    }

    setMF(mf) {
        this.sample.setChildSync(['$content', 'general', 'mf'], mf);
    }

    setMW(mw) {
        this.sample.setChildSync(['$content', 'general', 'mw'], mw);
    }

    setEM(em) {
        this.sample.setChildSync(['$content', 'general', 'em'], em);
    }

    fromMF() {
        if (!this.getMF()) {
            this.previousEMMF = 0;
            this.setMW(0);
            this.setEM(0);
            return;
        }
        var chemcalc = CCE.analyseMF(this.getMF());
        if (chemcalc && this.previousEMMF !== chemcalc.em) {
            this.previousEMMF = chemcalc.em;
            this.setMW(chemcalc.mw);
            this.setEM(chemcalc.em);
        }
    }

    _mfColor() {
        var existingMF = this.getMF();
        var molfile = this.getMolfile();
        if (molfile) {
            var molecule = OCLE.Molecule.fromMolfile(molfile);
            var mf = molecule.getMolecularFormula().formula;
            var existingMW = existingMF ? CCE.analyseMF(existingMF).mw : 0;
            var newMW = mf ? CCE.analyseMF(mf).mw : 0;
            if (newMW !== existingMW) {
                API.createData('mfBGColor', 'pink');
            } else {
                API.createData('mfBGColor', 'white');
            }
        } else {
            API.createData('mfBGColor', 'white');
        }
    }
}

module.exports = MF;
