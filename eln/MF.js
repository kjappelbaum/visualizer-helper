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
            console.log(API.getData('mf')+'');
            if (! (API.getData('mf')+'')) {
                console.log("No MF ?!",API.getData('mf'))
                this.fromMolfile();
            }
        }

        fromMolfile() {
            var chemcalc=this._chemcalcFromMolfile();
            if (chemcalc && this.previousEM !== chemcalc.em) {
                this.previousEM = chemcalc.em;

                var general=API.getData('general');
                general.mf=chemcalc.mf;
                general.em=chemcalc.em;
                general.mw=chemcalc.mw;
                general.triggerChange();
            }
            API.createData('mfBGColor','white');
        }

        _chemcalcFromMolfile() {
            var molfile=API.getData('molfile')+'';
            if (molfile) {
                var molecule=OCLE.Molecule.fromMolfile(molfile);
                var mf=molecule.getMolecularFormula().formula;
                try {
                    return CCE.analyseMF(mf);
                } catch (e) {
                    UI.showNotification('Could not calculate molecular formula: '+e);
                }
            }
            return undefined;
        }

        fromMF() {
            var chemcalc=CCE.analyseMF(API.getData('mf')+'');
            if (chemcalc && this.previousEM !== chemcalc.em) {
                this.previousEM = chemcalc.em;
                var general=API.getData('general');
                general.mw=chemcalc.mw;
                general.em=chemcalc.em;
                general.triggerChange();
            }
        }

        _mfColor() {
            var existingMF=API.getData('mf')+"";
            if (molfile) {
                var molecule=OCLE.Molecule.fromMolfile(molfile);
                var mf=molecule.getMolecularFormula().formula;
                var existingMW=existingMF ? CCE.analyseMF(existingMF).mw : 0;
                var newMW=mf ? CCE.analyseMF(mf).mw : 0;
                if (newMW!=existingMW) {
                    API.createData('mfBGColor','pink');
                } else {
                    API.createData('mfBGColor','white');
                }
            } else {
                API.createData('mfBGColor','white');
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