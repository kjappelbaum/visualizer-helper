define([
    'src/util/api',
    'src/util/ui',
    './libs'
], function (API, UI, libs) {
    var OCLE = libs.OCLE;
    var CCE = libs.CCE;

    class MF {
        constructor(sample) {
            this.sample = sample;

            // if no mf we calculate from molfile
            if (!this.getMF()) {
                this.fromMolfile();
            }
        }

        fromMolfile() {
            var chemcalc = this._chemcalcFromMolfile();
            if (chemcalc && this.previousEM !== chemcalc.em) {
                this.previousEM = chemcalc.em;

                this.sample.setChildSync(['$content','general','mf'], chemcalc.mf);

                // var general = API.getData('general');
                // API.getData('mf').setValue(chemcalc.mf, true);
                // API.getData('em').setValue(chemcalc.em, true);
                // API.getData('mw').setValue(chemcalc.mw, true);
                // general.triggerChange();
                console.log('Changed mf to ', chemcalc.mf)
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
                    UI.showNotification('Could not calculate molecular formula: ' + e);
                }
            }
            return undefined;
        }

        getMF() {
            return String(this.sample.getChildSync(['$content', 'general', 'mf']));
        }

        getMolfile() {
            return String(this.sample.getChildSync(['$content', 'general', 'molfile']));
        }

        setMW(mw) {
            this.sample.setChildSync(['$content','general','mw'], mw);
        }

        setEM(em) {
            this.sample.setChildSync(['$content','general','em'], em);
        }

        fromMF() {
            var chemcalc = CCE.analyseMF(this.getMF());
            console.log('new MF', chemcalc);
            if (chemcalc && this.previousEM !== chemcalc.em) {
                this.previousEM = chemcalc.em;
                this.setMW(chemcalc.mw);
                this.setEM(chemcalc.em);
                // var general = API.getData('general');
                // general.mw = chemcalc.mw;
                // general.em = chemcalc.em;
                // general.triggerChange();
            }
        }

        _mfColor() {
            var existingMF = this.getMF();
            if (molfile) {
                var molecule = OCLE.Molecule.fromMolfile(molfile);
                var mf = molecule.getMolecularFormula().formula;
                var existingMW = existingMF ? CCE.analyseMF(existingMF).mw : 0;
                var newMW = mf ? CCE.analyseMF(mf).mw : 0;
                if (newMW != existingMW) {
                    API.createData('mfBGColor', 'pink');
                } else {
                    API.createData('mfBGColor', 'white');
                }
            } else {
                API.createData('mfBGColor', 'white');
            }
        }


        handleAction(action) {
            if (!action) return;
            switch (action.name) {

                default:
                    return false;
            }
            return true;
        }
    }

    return MF;
});