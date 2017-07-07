import API from 'src/util/api';
import {OCLE} from './libs';

const noop = () => {/* noop */};

const defaultOptions = {
    onMolfileChanged: noop
};

class ExpandableMolecule {
    constructor(sample, options) {
        this.options = Object.assign({}, defaultOptions, options);
        this.sample = sample;
        this.molfile = String(this.sample.getChildSync(['$content', 'general', 'molfile']) || '');
        this.idCode = OCLE.Molecule.fromMolfile(this.molfile).getIDCode();
        this.expandedHydrogens = false;
        this.jsmeEditionMode = false;
        this.calculateDiastereotopicID = false;

        this.onChange = (event) => {
            // us this really a modification ? or a loop event ...
            // need to compare former oclID with new oclID
            var newMolecule = OCLE.Molecule.fromMolfile(event.target + '');

            var oclID = newMolecule.getIDCodeAndCoordinates();

            if (oclID.idCode !== this.idCode) {
                this.idCode = oclID.idCode;
                this.molfile = event.target + '';
                this.sample.setChildSync(['$content', 'general', 'molfile'], this.molfile);
                this.sample.setChildSync(['$content', 'general', 'ocl'], {
                    value: oclID.idCode,
                    coordinates: oclID.coordinates
                });
            }
            this.options.onMolfileChanged(this);
        };


        API.createData('editableMolfile', this.molfile).then(
            (editableMolfile) => {
                this.editableMolfile = editableMolfile;
                this.bindChange();
                this.updateMolfiles();
                this.setJSMEEdition(false);
            }
        );
    }

    bindChange() {
        this.editableMolfile.onChange(this.onChange);
    }

    unbindChange() {
        this.editableMolfile.unbindChange(this.onChange);
    }

    setJSMEEdition(value, noDepictUpdate) {
        this.jsmeEditionMode = value;

        var options = {
            prefs: []
        };

        if (this.jsmeEditionMode) {
            options.prefs.push('nodepict');
            API.getData('editableMolfile').triggerChange();
            this.expandedHydrogens = false;
        } else {
            options.prefs.push('depict');
            if (!noDepictUpdate) { // TODO when we should not updateMolfile
                this.expandedHydrogens = false;
                this.updateMolfiles();
                API.createData('viewMolfile', this.viewMolfile);
            }

        }
        API.doAction('setJSMEOptions', options);
    }

    setExpandedHydrogens(force) {
        if (force === undefined) {
            this.expandedHydrogens = !this.expandedHydrogens;
        } else {
            this.expandedHydrogens = force;
        }
        if (this.expandedHydrogens) {
            this.setJSMEEdition(false, true);
            API.createData('viewMolfileExpandedH', this.viewMolfileExpandedH);

        } else {
            API.createData('viewMolfile', this.viewMolfile);
        }
    }

    updateMolfiles() {
        var molecule = OCLE.Molecule.fromMolfile(this.molfile);
        let calculateDiastereotopicID=this.calculateDiastereotopicID;
        if (calculateDiastereotopicID) {
            // is it reasonnable to calculate the DiastereotopicID. We check the time it will take
            let start = Date.now();
            molecule.toIDCode();
            let exptected = (Date.now() - start) * molecule.getAllAtoms();
            if (exptected > 3000) {
                console.log('The diastereotopic calculation is expected to last more than 3s. No way to assign molecule.')
                calculateDiastereotopicID=false;
            }
        }

        this.viewMolfile = molecule.toVisualizerMolfile({
            heavyAtomHydrogen: true,
            diastereotopic: calculateDiastereotopicID
        });
        molecule.addImplicitHydrogens();
        this.viewMolfileExpandedH = molecule.toVisualizerMolfile({
            diastereotopic: calculateDiastereotopicID
        });
    }

    handleAction(action) {
        if (!action) return false;
        switch (action.name) {
            case 'toggleJSMEEdition':
                this.setJSMEEdition(!this.jsmeEditionMode);
                break;
            case 'clearMolfile':
                var molfile = API.getData('editableMolfile');
                molfile.setValue('');
                break;
            case 'swapHydrogens':
                this.setExpandedHydrogens();
                break;
            default:
                return false;
        }
        return true;
    }
}

module.exports = ExpandableMolecule;
