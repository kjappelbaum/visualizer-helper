export function explodeNucleic(nucleic) {
  const result = [];
  if (!nucleic) return result;
  for (let i = 0; i < nucleic.length; i++) {
    const { seq, ...otherFeatures } = nucleic[i];
    for (let j = 0; j < seq.length; j++) {
      const el = {
        ...otherFeatures,
        seq: seq[j]
      };

      if (nucleic[i].dUrl) {
        Object.defineProperty(el, 'dUrl', {
          value: nucleic[i].dUrl,
          enumerable: false,
          writable: true
        });
      }
      result.push(el);
    }
  }
  return result;
}
