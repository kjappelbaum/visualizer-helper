/* eslint-disable */

import API from 'src/util/api';
import Versioning from 'src/util/versioning';
import URI from 'uri/URI';

function track() {
    var externalInfo = JSON.parse(window.localStorage.getItem('external_cache') || '{}');
    var smiles = externalInfo.smiles;
    var molfile = externalInfo.molfile;
    API.createData('nmr', []);
    API.createData('mass', []);
    API.createData('ir', []);

    var uri = new URI(document.location.href);
    var search = uri.search(true);
    if (search.smiles) {
        smiles = search.smiles;
        molfile = '';
    }


    var data = Versioning.getData();
    data.onChange(function (evt) {
        if (evt.jpath.length === 1 && evt.jpath[0] === 'molfile') {
            localStorage.setItem('molfile', evt.target.get());
        }
    });

    if (molfile) {
        if (typeof OCLE === 'undefined') {
            return API.require("vh/eln/libs").then( function(libs) {
                const molecule = libs.OCLE.Molecule.fromMolfile(molfile);
                API.createData('molfile', molecule.toMolfile());
            });
        } else {
            const molecule = OCLE.Molecule.fromMolfile(molfile);
            API.createData('molfile', molecule.toMolfile());
        }
    } else if (smiles) {
        if (typeof OCLE === 'undefined') {
            return API.require("vh/eln/libs").then( function(libs) {
                const molecule = libs.OCLE.Molecule.fromSmiles(smiles);
                console.log(molecule.toMolfile())
                API.createData('molfile', molecule.toMolfile());
            });
        } else {
            const molecule = OCLE.Molecule.fromSmiles(smiles);
            API.createData('molfile', molecule.toMolfile());
        }
    } else {
        molfile = window.localStorage.getItem('molfile');
        if (molfile) {
            API.createData('molfile', molfile);
        } else {
            API.createData('molfile', '');
        }
    }
    return Promise.resolve();
}

module.exports=track();
