import API from 'src/util/api';
import UI from 'src/util/ui';

import OCLE from './libs/OCLE';
import MolecularFormula from './libs/MolecularFormula';

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
        try {
          let mfInfo = new MolecularFormula.MF(mf).getInfo();
          this.previousEMMF = mfInfo.monoisotopicMass;
        } catch (e) {}
      }
    }
  }

  getIsotopicDistributionInstance(options) {
    options = Object.assign(
      {},
      {
        ionizations: '+',
        fwhm: 0.01,
        maxLines: 5000,
        minY: 1e-8
      },
      options
    );
    return new MolecularFormula.IsotopicDistribution(this.getMF(), options);
  }

  getIsotopicDistribution(options) {
    let isotopicDistribution = this.getIsotopicDistributionInstance(options);
    return isotopicDistribution.getXY();
  }

  getMassParts(options) {
    let isotopicDistribution = this.getIsotopicDistributionInstance(options);
    return isotopicDistribution.getParts();
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
      var mf = molecule.getMF().parts.join(' . ');
      try {
        let mfInfo = new MolecularFormula.MF(mf).getInfo();
        mfInfo.mf = mf;
        return mfInfo;
      } catch (e) {
        if (mf !== '') {
          UI.showNotification(`Could not calculate molecular formula: ${e}`);
        }
      }
    }
    return null;
  }

  getMF() {
    return String(
      this.sample.getChildSync(['$content', 'general', 'mf']) || ''
    );
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
    try {
      if (!this.getMF()) {
        this.previousEMMF = 0;
        this.setMW(0);
        this.setEM(0);
        return;
      }
      var mfInfo = new MolecularFormula.MF(this.getMF()).getInfo();

      if (this.previousEMMF !== mfInfo.monoisotopicMass) {
        this.previousEMMF = mfInfo.monoisotopicMass;
        this.setMW(mfInfo.mass);
        this.setEM(mfInfo.monoisotopicMass);
      }
    } catch (e) {
      console.log('MF error', e);
      this.setMW(0);
      this.setEM(0);
    }
  }

  _mfColor() {
    var existingMF = this.getMF();
    var molfile = this.getMolfile();
    if (molfile) {
      var molecule = OCLE.Molecule.fromMolfile(molfile);
      var mf = molecule.getMolecularFormula().formula;
      var existingMW = existingMF
        ? new MolecularFormula.MF(existingMF).getInfo().mw
        : 0;

      var newMW = mf ? new MolecularFormula.MF(mf).getInfo().mw : 0;
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
