import MolecularFormula from './libs/MolecularFormula';

function explodeSequences(sample) {
  var sequencePeptidic = getFirstPeptide(sample);

  if (sequencePeptidic) {
    sequencePeptidic.setValue(
      MolecularFormula.Peptide.sequenceToMF(String(sequencePeptidic))
    );
  }
  var sequenceNucleic = getFirstNucleotide(sample);
  if (
    sequenceNucleic &&
    sequenceNucleic.sequence &&
    String(sequenceNucleic.sequence) // could be removed with new MolecularFormula library
  ) {
    sequenceNucleic.sequence = MolecularFormula.Nucleotide.sequenceToMF(
      String(sequenceNucleic.sequence)
    );
  }
  sample.triggerChange();
}

function calculateMFFromSequence(sample) {
  var sequencePeptidic = getFirstPeptide(sample);
  if (sequencePeptidic) {
    let sequence = MolecularFormula.Peptide.sequenceToMF(
      String(sequencePeptidic)
    );
    sample.setChildSync(['$content', 'general', 'mf'], sequence);
  }
  var sequenceNucleic = getFirstNucleotide(sample);
  if (sequenceNucleic) {
    sequenceNucleic = JSON.parse(JSON.stringify(sequenceNucleic));
  } // get rid of datatypes
  if (sequenceNucleic && sequenceNucleic.sequence) {
    let sequence = MolecularFormula.Nucleotide.sequenceToMF(
      sequenceNucleic.sequence,
      {
        kind: sequenceNucleic.moleculeType,
        circular: sequenceNucleic.circular,
        fivePrime: sequenceNucleic.fivePrime
      }
    );
    sample.setChildSync(['$content', 'general', 'mf'], sequence);
  }
}

function getFirstPeptide(sample) {
  return sample.getChildSync([
    '$content',
    'biology',
    'peptidic',
    '0',
    'seq',
    '0',
    'sequence'
  ]);
}

function getFirstNucleotide(sample) {
  return sample.getChildSync([
    '$content',
    'biology',
    'nucleic',
    '0',
    'seq',
    '0'
  ]);
}

module.exports = {
  calculateMFFromSequence,
  explodeSequences
};
