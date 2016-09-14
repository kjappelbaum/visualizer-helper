define([
    'src/util/api',
    'src/util/ui',
    'https://www.lactame.com/lib/openchemlib-extended/1.11.0/openchemlib-extended.js'
    ], function (API, UI, OCLE) {

    class ExpandableMolecule {
        constructor(sampleIn) {
            this.sample = sampleIn;
            this.molfile = this.sample.$content.general.molfile + '';
            var molecule = OCLE.Molecule.fromMolfile(this.molfile);
            this.idCode = molecule.getIDCode();
            this.expandedHydrogens = false;
            this.jsmeEditionMode = false;
            API.createData('editableMolfile', this.molfile).then(
                (editableMolfile) => {
                    editableMolfile.onChange((event) => {
                        // us this really a modification ? or a loop event ...
                        // need to compare former oclID with new oclID
                        var idCode = OCLE.Molecule.fromMolfile(event.target + '').getIDCode();
                        if (idCode != this.idCode) {
                            this.idCode = idCode;
                            this.molfile = event.target + '';
                            this.sample.setChildSync('$content.general.molfile', this.molfile);
                        } else {
                            console.log('no update');
                        }

                        // by default we would like the depict mode
                        this.updateMolfiles();
                        var mf = molecule.getMolecularFormula().formula;
                        this.sample.setChildSync('$content.general.mf', mf);
                    });
                    this.updateMolfiles();
                    this.toggleJSMEEdition(false);
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
        }

        handleAction(action) {
            if (!action) return;
            switch (action.name) {
                case 'toggleJSMEEdition':
                    API.cache("expandableMolecule").toggleJSMEEdition();
                    break;
                case 'clearMolfile':
                    var molfile = API.getData('editableMolfile');
                    molfile.setValue('');
                    break;
                case 'swapHydrogens':
                    API.cache("expandableMolecule").setExpandedHydrogens();
                    break;
                case 'toggleNMR1hAdvancedOptions':
                    API.cache('nmr1hAdvancedOptions', ! API.cache('nmr1hAdvancedOptions'));
                    break;
                default:
                    return false;
            }
            return true;
        }
    }

    return ExpandableMolecule;
});