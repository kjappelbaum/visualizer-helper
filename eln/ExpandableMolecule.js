import API from 'src/util/api';
import {OCLE} from './libs';

class ExpandableMolecule {
    constructor(sample) {
        this.sample = sample;
        this.molfile = String(this.sample.getChildSync(['$content', 'general', 'molfile']) || '');
        this.idCode = OCLE.Molecule.fromMolfile(this.molfile).getIDCode();
        this.expandedHydrogens = false;
        this.jsmeEditionMode = false;
        
        this.onChange=(event) => {
            // us this really a modification ? or a loop event ...
            // need to compare former oclID with new oclID
            var newMolecule = OCLE.Molecule.fromMolfile(event.target + '');
            var idCode = newMolecule.getIDCode();
            if (idCode != this.idCode) {
                this.idCode = idCode;
                this.molfile = event.target + '';
                this.sample.setChildSync(['$content','general','molfile'], this.molfile);
            }
        };
        
        
        API.createData('editableMolfile', this.molfile).then(
            (editableMolfile) => {
                this.editableMolfile=editableMolfile;
                this.editableMolfile.onChange(this.onChange);
                this.updateMolfiles();
                this.setJSMEEdition(false);
            }
        );
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
            API.getData("editableMolfile").triggerChange();
            this.expandedHydrogens = false;
        } else {
            options.prefs.push('depict');
            if (!noDepictUpdate) { // TODO when we should not updateMolfile
                this.expandedHydrogens = false;
                this.updateMolfiles();
                API.createData("viewMolfile", this.viewMolfile);
            }

        }
        API.doAction('setJSMEOptions', options)
    }

    setExpandedHydrogens(force) {
        if (force === undefined) {
            this.expandedHydrogens = !this.expandedHydrogens;
        } else {
            this.expandedHydrogens = force;
        }
        if (this.expandedHydrogens) {
            this.setJSMEEdition(false, true);
            API.createData("viewMolfileExpandedH", this.viewMolfileExpandedH);

        } else {
            API.createData("viewMolfile", this.viewMolfile);
        }
    }

    updateMolfiles() {
        // prevent the loop by checking actelionID
        var molecule = OCLE.Molecule.fromMolfile(this.molfile);
        this.viewMolfile = molecule.toVisualizerMolfile({
            heavyAtomHydrogen: true
        });
        molecule.addImplicitHydrogens();
        this.viewMolfileExpandedH = molecule.toVisualizerMolfile();
    }

    handleAction(action) {
        if (!action) return;
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
