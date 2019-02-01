/* eslint-disable */

import API from 'src/util/api';
import Versioning from 'src/util/versioning';
import URI from 'uri/URI';

async function track() {
  var sample = JSON.parse(
    window.localStorage.getItem('external_cache') || '{}'
  );
  API.createData('nmr', []);
  API.createData('mass', []);
  API.createData('ir', []);
  var uri = new URI(document.location.href);
  var search = uri.search(true);
  if (search.smiles) {
    sample.smiles = search.smiles;
    sample.molfile = '';
  }

  var data = Versioning.getData();
  data.onChange(function(evt) {
    if (evt.jpath.length === 1 && evt.jpath[0] === 'molfile') {
      localStorage.setItem('molfile', evt.target.get());
    }
  });

  if (sample.molfile) {
    if (typeof OCLE === 'undefined') {
      let OCLE = await API.require('vh/eln/libs/OCLE');
      let Molecule = OCLE.default ? OCLE.default.Molecule : OCLE.Molecule;
      const molecule = Molecule.fromMolfile(sample.molfile);
      API.createData('molfile', molecule.toMolfile());
    } else {
      const molecule = OCLE.Molecule.fromMolfile(sample.molfile);
      API.createData('molfile', molecule.toMolfile());
    }
  } else if (sample.smiles) {
    let OCLE;
    if (typeof OCLE === 'undefined') {
      OCLE = await API.require('vh/eln/libs/OCLE');
    }
    let Molecule = OCLE.default ? OCLE.default.Molecule : OCLE.Molecule;
    const molecule = Molecule.fromSmiles(sample.smiles);
    sample.molfile = molecule.toMolfile();
    API.createData('molfile', sample.molfile);
  } else {
    sample.molfile = window.localStorage.getItem('molfile');
    if (sample.molfile) {
      API.createData('molfile', sample.molfile);
    } else {
      API.createData('molfile', '');
    }
  }
  return Promise.resolve(sample);
}

module.exports = track();
