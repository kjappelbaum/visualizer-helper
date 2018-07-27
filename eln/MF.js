
import API from 'src/util/api';
import UI from 'src/util/ui';

import OCLE from './libs/OCLE';
import EMDB from './libs/EMDB';

class MF {
  constructor(sample) {
    this.sample = sample;
    // if no mf we calculate from molfile
    if (!this.getMF()) {
      this.fromMolfile();
      if (!this.getMF()) {
        this.setMF('');
      }
    } else {
      const mf = this.getMF();
      if (mf) {
        let mfInfo = (new EMDB.Util.MF(mf)).getInfo();
        this.previousEMMF = mfInfo.monoisotopicMass;
      }
    }
  }

  fromMolfile() {
    var mfInfo = this._mfInfoFromMolfile();
    if (mfInfo && this.previousEMMolfile !== mfInfo.monoisotopicMass) {
      this.previousEMMolfile = mfInfo.monoisotopicMass;
      this.setMF(mfInfo.mf);
    } else {
      // why should we suppress the molecular formula if it changed ???
      // this.setMF('');
    }
    API.createData('mfBGColor', 'white');
  }

  _mfInfoFromMolfile() {
    var molfile = this.getMolfile();
    if (molfile) {
      var molecule = OCLE.Molecule.fromMolfile(molfile);
      var mf = molecule.getMF().parts.join('.');
      try {
        return (new EMDB.Util.MF(mf)).getInfo();
      } catch (e) {
        if (mf !== '') {
          UI.showNotification(`Could not calculate molecular formula: ${e}`);
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
    var mfInfo = (new EMDB.Util.MF(this.getMF())).getInfo();

    if (this.previousEMMF !== mfInfo.monoisotopicMass) {
      this.previousEMMF = mfInfo.monoisotopicMass;
      this.setMW(mfInfo.mass);
      this.setEM(mfInfo.monoisotopicMass);
    }
  }

  _mfColor() {
    var existingMF = this.getMF();
    var molfile = this.getMolfile();
    if (molfile) {
      var molecule = OCLE.Molecule.fromMolfile(molfile);
      var mf = molecule.getMolecularFormula().formula;
      var existingMW = existingMF ? (new EMDB.Util.MF(existingMF)).getInfo().mw : 0;

      var newMW = mf ? (new EMDB.Util.MF(mf)).getInfo().mw : 0;
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
