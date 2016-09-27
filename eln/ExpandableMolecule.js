define([
    'src/util/api',
    'src/util/ui',
    './libs'
    ], function (API, UI, libs) {
    var OCLE = libs.OCLE;
    
    class ExpandableMolecule {
        constructor(sample) {
            this.sample = sample;
            this.molfile = this.sample.$content.general.molfile + '';
            this.idCode = OCLE.Molecule.fromMolfile(this.molfile).getIDCode();
            this.expandedHydrogens = false;
            this.jsmeEditionMode = false;
            API.createData('editableMolfile', this.molfile).then(
                (editableMolfile) => {
                    editableMolfile.onChange((event) => {
                        // us this really a modification ? or a loop event ...
                        // need to compare former oclID with new oclID
                        var newMolecule = OCLE.Molecule.fromMolfile(event.target + '');
                        var idCode = newMolecule.getIDCode();
                        if (idCode != this.idCode) {
                            this.idCode = idCode;
                            this.molfile = event.target + '';
                            this.sample.setChildSync(['$content','general','molfile'], this.molfile);
                        } else {
                            console.log('no update');
                        }
                    });
                    this.updateMolfiles();
                    this.setJSMEEdition(false);
                }
            );
        }

        setJSMEEdition(value, noDepictUpdate) {
            this.jsmeEditionMode = value;

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
                if (!noDepictUpdate) { // TODO when we should not updateMolfile
                    this.expandedHydrogens = false;
                    this.updateMolfiles();
                    API.createData("viewMolfile", this.viewMolfile);
                }

            }
            API.doAction('setJSMEPreferences', prefs)
        }

        setExpandedHydrogens(force) {
            if (force === undefined) {
                this.expandedHydrogens = !this.expandedHydrogens;
            } else {
                this.expandedHydrogens = force;
            }
            if (this.expandedHydrogens) {
                API.createData("viewMolfileExpandedH", this.viewMolfileExpandedH);
                this.setJSMEEdition(false, true);
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

    return ExpandableMolecule;
});