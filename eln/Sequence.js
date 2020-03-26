import MolecularFormula from './libs/MolecularFormula';
import translateDNA from '../biology/translateDNA';

function explodeSequences(sample) {
  var sequencePeptidic = getFirstPeptide(sample);

  if (sequencePeptidic && sequencePeptidic.sequence) {
    sequencePeptidic.sequence = MolecularFormula.Peptide.sequenceToMF(
      String(sequencePeptidic.sequence),
    );
  }

  var sequenceNucleic = getFirstNucleotide(sample);
  if (sequenceNucleic && sequenceNucleic.sequence) {
    sequenceNucleic.sequence = MolecularFormula.Nucleotide.sequenceToMF(
      String(sequenceNucleic.sequence),
    );
  }
  sample.triggerChange();
}

function calculateMFFromPeptidic(sample) {
  const sequencePeptidic = getFirstPeptide(sample);
  if (sequencePeptidic) {
    let sequence = MolecularFormula.Peptide.sequenceToMF(
      String(sequencePeptidic.sequence),
    );
    sample.setChildSync(['$content', 'general', 'mf'], sequence);
  }
}

function calculateMFFromNucleic(sample) {
  let sequenceNucleic = getFirstNucleotide(sample);
  if (sequenceNucleic) {
    sequenceNucleic = JSON.parse(JSON.stringify(sequenceNucleic));
  } // get rid of datatypes
  if (sequenceNucleic && sequenceNucleic.sequence) {
    let sequence = MolecularFormula.Nucleotide.sequenceToMF(
      sequenceNucleic.sequence,
      {
        kind: sequenceNucleic.moleculeType,
        circular: sequenceNucleic.circular,
        fivePrime: sequenceNucleic.fivePrime,
      },
    );
    sample.setChildSync(['$content', 'general', 'mf'], sequence);
  }
}

function calculateMFFromSequence(sample) {
  calculateMFFromNucleic(sample);
  calculateMFFromPeptidic(sample);
}

function translateNucleic(sample) {
  const sequenceNucleic = sample.getChildSync([
    '$content',
    'biology',
    'nucleic',
  ]);
  const sequencePeptidic = [];
  for (let nucleic of sequenceNucleic) {
    const peptidic = [];
    sequencePeptidic.push({ seq: peptidic });
    if (Array.isArray(nucleic.seq)) {
      for (let entry of nucleic.seq) {
        peptidic.push({
          sequence: translateDNA(entry.sequence),
        });
      }
    }
  }
  sample.setChildSync(['$content', 'biology', 'peptidic'], sequencePeptidic);
}

function getFirstPeptide(sample) {
  return sample.getChildSync([
    '$content',
    'biology',
    'peptidic',
    '0',
    'seq',
    '0',
  ]);
}

function getFirstNucleotide(sample) {
  return sample.getChildSync([
    '$content',
    'biology',
    'nucleic',
    '0',
    'seq',
    '0',
  ]);
}

module.exports = {
  calculateMFFromSequence,
  calculateMFFromNucleic,
  calculateMFFromPeptidic,
  explodeSequences,
  getFirstNucleotide,
  getFirstPeptide,
  translateNucleic,
};
