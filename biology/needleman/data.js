const BLOSUM62 = {
  A: {
    A: 4,
    R: -1,
    N: -2,
    D: -2,
    C: 0,
    Q: -1,
    E: -1,
    G: 0,
    H: -2,
    I: -1,
    L: -1,
    K: -1,
    M: -1,
    F: -2,
    P: -1,
    S: 1,
    T: 0,
    W: -3,
    Y: -2,
    V: 0,
    B: -2,
    Z: -1,
    X: 0,
    '*': -4,
  },
  R: {
    A: -1,
    R: 5,
    N: 0,
    D: -2,
    C: -3,
    Q: 1,
    E: 0,
    G: -2,
    H: 0,
    I: -3,
    L: -2,
    K: 2,
    M: -1,
    F: -3,
    P: -2,
    S: -1,
    T: -1,
    W: -3,
    Y: -2,
    V: -3,
    B: -1,
    Z: 0,
    X: -1,
    '*': -4,
  },
  N: {
    A: -2,
    R: 0,
    N: 6,
    D: 1,
    C: -3,
    Q: 0,
    E: 0,
    G: 0,
    H: 1,
    I: -3,
    L: -3,
    K: 0,
    M: -2,
    F: -3,
    P: -2,
    S: 1,
    T: 0,
    W: -4,
    Y: -2,
    V: -3,
    B: 3,
    Z: 0,
    X: -1,
    '*': -4,
  },
  D: {
    A: -2,
    R: -2,
    N: 1,
    D: 6,
    C: -3,
    Q: 0,
    E: 2,
    G: -1,
    H: -1,
    I: -3,
    L: -4,
    K: -1,
    M: -3,
    F: -3,
    P: -1,
    S: 0,
    T: -1,
    W: -4,
    Y: -3,
    V: -3,
    B: 4,
    Z: 1,
    X: -1,
    '*': -4,
  },
  C: {
    A: 0,
    R: -3,
    N: -3,
    D: -3,
    C: 9,
    Q: -3,
    E: -4,
    G: -3,
    H: -3,
    I: -1,
    L: -1,
    K: -3,
    M: -1,
    F: -2,
    P: -3,
    S: -1,
    T: -1,
    W: -2,
    Y: -2,
    V: -1,
    B: -3,
    Z: -3,
    X: -2,
    '*': -4,
  },
  Q: {
    A: -1,
    R: 1,
    N: 0,
    D: 0,
    C: -3,
    Q: 5,
    E: 2,
    G: -2,
    H: 0,
    I: -3,
    L: -2,
    K: 1,
    M: 0,
    F: -3,
    P: -1,
    S: 0,
    T: -1,
    W: -2,
    Y: -1,
    V: -2,
    B: 0,
    Z: 3,
    X: -1,
    '*': -4,
  },
  E: {
    A: -1,
    R: 0,
    N: 0,
    D: 2,
    C: -4,
    Q: 2,
    E: 5,
    G: -2,
    H: 0,
    I: -3,
    L: -3,
    K: 1,
    M: -2,
    F: -3,
    P: -1,
    S: 0,
    T: -1,
    W: -3,
    Y: -2,
    V: -2,
    B: 1,
    Z: 4,
    X: -1,
    '*': -4,
  },
  G: {
    A: 0,
    R: -2,
    N: 0,
    D: -1,
    C: -3,
    Q: -2,
    E: -2,
    G: 6,
    H: -2,
    I: -4,
    L: -4,
    K: -2,
    M: -3,
    F: -3,
    P: -2,
    S: 0,
    T: -2,
    W: -2,
    Y: -3,
    V: -3,
    B: -1,
    Z: -2,
    X: -1,
    '*': -4,
  },
  H: {
    A: -2,
    R: 0,
    N: 1,
    D: -1,
    C: -3,
    Q: 0,
    E: 0,
    G: -2,
    H: 8,
    I: -3,
    L: -3,
    K: -1,
    M: -2,
    F: -1,
    P: -2,
    S: -1,
    T: -2,
    W: -2,
    Y: 2,
    V: -3,
    B: 0,
    Z: 0,
    X: -1,
    '*': -4,
  },
  I: {
    A: -1,
    R: -3,
    N: -3,
    D: -3,
    C: -1,
    Q: -3,
    E: -3,
    G: -4,
    H: -3,
    I: 4,
    L: 2,
    K: -3,
    M: 1,
    F: 0,
    P: -3,
    S: -2,
    T: -1,
    W: -3,
    Y: -1,
    V: 3,
    B: -3,
    Z: -3,
    X: -1,
    '*': -4,
  },
  L: {
    A: -1,
    R: -2,
    N: -3,
    D: -4,
    C: -1,
    Q: -2,
    E: -3,
    G: -4,
    H: -3,
    I: 2,
    L: 4,
    K: -2,
    M: 2,
    F: 0,
    P: -3,
    S: -2,
    T: -1,
    W: -2,
    Y: -1,
    V: 1,
    B: -4,
    Z: -3,
    X: -1,
    '*': -4,
  },
  K: {
    A: -1,
    R: 2,
    N: 0,
    D: -1,
    C: -3,
    Q: 1,
    E: 1,
    G: -2,
    H: -1,
    I: -3,
    L: -2,
    K: 5,
    M: -1,
    F: -3,
    P: -1,
    S: 0,
    T: -1,
    W: -3,
    Y: -2,
    V: -2,
    B: 0,
    Z: 1,
    X: -1,
    '*': -4,
  },
  M: {
    A: -1,
    R: -1,
    N: -2,
    D: -3,
    C: -1,
    Q: 0,
    E: -2,
    G: -3,
    H: -2,
    I: 1,
    L: 2,
    K: -1,
    M: 5,
    F: 0,
    P: -2,
    S: -1,
    T: -1,
    W: -1,
    Y: -1,
    V: 1,
    B: -3,
    Z: -1,
    X: -1,
    '*': -4,
  },
  F: {
    A: -2,
    R: -3,
    N: -3,
    D: -3,
    C: -2,
    Q: -3,
    E: -3,
    G: -3,
    H: -1,
    I: 0,
    L: 0,
    K: -3,
    M: 0,
    F: 6,
    P: -4,
    S: -2,
    T: -2,
    W: 1,
    Y: 3,
    V: -1,
    B: -3,
    Z: -3,
    X: -1,
    '*': -4,
  },
  P: {
    A: -1,
    R: -2,
    N: -2,
    D: -1,
    C: -3,
    Q: -1,
    E: -1,
    G: -2,
    H: -2,
    I: -3,
    L: -3,
    K: -1,
    M: -2,
    F: -4,
    P: 7,
    S: -1,
    T: -1,
    W: -4,
    Y: -3,
    V: -2,
    B: -2,
    Z: -1,
    X: -2,
    '*': -4,
  },
  S: {
    A: 1,
    R: -1,
    N: 1,
    D: 0,
    C: -1,
    Q: 0,
    E: 0,
    G: 0,
    H: -1,
    I: -2,
    L: -2,
    K: 0,
    M: -1,
    F: -2,
    P: -1,
    S: 4,
    T: 1,
    W: -3,
    Y: -2,
    V: -2,
    B: 0,
    Z: 0,
    X: 0,
    '*': -4,
  },
  T: {
    A: 0,
    R: -1,
    N: 0,
    D: -1,
    C: -1,
    Q: -1,
    E: -1,
    G: -2,
    H: -2,
    I: -1,
    L: -1,
    K: -1,
    M: -1,
    F: -2,
    P: -1,
    S: 1,
    T: 5,
    W: -2,
    Y: -2,
    V: 0,
    B: -1,
    Z: -1,
    X: 0,
    '*': -4,
  },
  W: {
    A: -3,
    R: -3,
    N: -4,
    D: -4,
    C: -2,
    Q: -2,
    E: -3,
    G: -2,
    H: -2,
    I: -3,
    L: -2,
    K: -3,
    M: -1,
    F: 1,
    P: -4,
    S: -3,
    T: -2,
    W: 11,
    Y: 2,
    V: -3,
    B: -4,
    Z: -3,
    X: -2,
    '*': -4,
  },
  Y: {
    A: -2,
    R: -2,
    N: -2,
    D: -3,
    C: -2,
    Q: -1,
    E: -2,
    G: -3,
    H: 2,
    I: -1,
    L: -1,
    K: -2,
    M: -1,
    F: 3,
    P: -3,
    S: -2,
    T: -2,
    W: 2,
    Y: 7,
    V: -1,
    B: -3,
    Z: -2,
    X: -1,
    '*': -4,
  },
  V: {
    A: 0,
    R: -3,
    N: -3,
    D: -3,
    C: -1,
    Q: -2,
    E: -2,
    G: -3,
    H: -3,
    I: 3,
    L: 1,
    K: -2,
    M: 1,
    F: -1,
    P: -2,
    S: -2,
    T: 0,
    W: -3,
    Y: -1,
    V: 4,
    B: -3,
    Z: -2,
    X: -1,
    '*': -4,
  },
  B: {
    A: -2,
    R: -1,
    N: 3,
    D: 4,
    C: -3,
    Q: 0,
    E: 1,
    G: -1,
    H: 0,
    I: -3,
    L: -4,
    K: 0,
    M: -3,
    F: -3,
    P: -2,
    S: 0,
    T: -1,
    W: -4,
    Y: -3,
    V: -3,
    B: 4,
    Z: 1,
    X: -1,
    '*': -4,
  },
  Z: {
    A: -1,
    R: 0,
    N: 0,
    D: 1,
    C: -3,
    Q: 3,
    E: 4,
    G: -2,
    H: 0,
    I: -3,
    L: -3,
    K: 1,
    M: -1,
    F: -3,
    P: -1,
    S: 0,
    T: -1,
    W: -3,
    Y: -2,
    V: -2,
    B: 1,
    Z: 4,
    X: -1,
    '*': -4,
  },
  X: {
    A: 0,
    R: -1,
    N: -1,
    D: -1,
    C: -2,
    Q: -1,
    E: -1,
    G: -1,
    H: -1,
    I: -1,
    L: -1,
    K: -1,
    M: -1,
    F: -1,
    P: -2,
    S: 0,
    T: 0,
    W: -2,
    Y: -1,
    V: -1,
    B: -1,
    Z: -1,
    X: -1,
    '*': -4,
  },
  '*': {
    A: -4,
    R: -4,
    N: -4,
    D: -4,
    C: -4,
    Q: -4,
    E: -4,
    G: -4,
    H: -4,
    I: -4,
    L: -4,
    K: -4,
    M: -4,
    F: -4,
    P: -4,
    S: -4,
    T: -4,
    W: -4,
    Y: -4,
    V: -4,
    B: -4,
    Z: -4,
    X: -4,
    '*': 1,
  },
};
const PAM250 = {
  A: {
    A: 2,
    C: -2,
    D: 0,
    E: 0,
    F: -3,
    G: 1,
    H: -1,
    I: -1,
    K: -1,
    L: -2,
    M: -1,
    N: 0,
    P: 1,
    Q: 0,
    R: -2,
    S: 1,
    T: 1,
    V: 0,
    W: -6,
    Y: -3,
  },
  C: {
    A: -2,
    C: 12,
    D: -5,
    E: -5,
    F: -4,
    G: -3,
    H: -3,
    I: -2,
    K: -5,
    L: -6,
    M: -5,
    N: -4,
    P: -3,
    Q: -5,
    R: -4,
    S: 0,
    T: -2,
    V: -2,
    W: -8,
    Y: 0,
  },
  D: {
    A: 0,
    C: -5,
    D: 4,
    E: 3,
    F: -6,
    G: 1,
    H: 1,
    I: -2,
    K: 0,
    L: -4,
    M: -3,
    N: 2,
    P: -1,
    Q: 2,
    R: -1,
    S: 0,
    T: 0,
    V: -2,
    W: -7,
    Y: -4,
  },
  E: {
    A: 0,
    C: -5,
    D: 3,
    E: 4,
    F: -5,
    G: 0,
    H: 1,
    I: -2,
    K: 0,
    L: -3,
    M: -2,
    N: 1,
    P: -1,
    Q: 2,
    R: -1,
    S: 0,
    T: 0,
    V: -2,
    W: -7,
    Y: -4,
  },
  F: {
    A: -3,
    C: -4,
    D: -6,
    E: -5,
    F: 9,
    G: -5,
    H: -2,
    I: 1,
    K: -5,
    L: 2,
    M: 0,
    N: -3,
    P: -5,
    Q: -5,
    R: -4,
    S: -3,
    T: -3,
    V: -1,
    W: 0,
    Y: 7,
  },
  G: {
    A: 1,
    C: -3,
    D: 1,
    E: 0,
    F: -5,
    G: 5,
    H: -2,
    I: -3,
    K: -2,
    L: -4,
    M: -3,
    N: 0,
    P: 0,
    Q: -1,
    R: -3,
    S: 1,
    T: 0,
    V: -1,
    W: -7,
    Y: -5,
  },
  H: {
    A: -1,
    C: -3,
    D: 1,
    E: 1,
    F: -2,
    G: -2,
    H: 6,
    I: -2,
    K: 0,
    L: -2,
    M: -2,
    N: 2,
    P: 0,
    Q: 3,
    R: 2,
    S: -1,
    T: -1,
    V: -2,
    W: -3,
    Y: 0,
  },
  I: {
    A: -1,
    C: -2,
    D: -2,
    E: -2,
    F: 1,
    G: -3,
    H: -2,
    I: 5,
    K: -2,
    L: 2,
    M: 2,
    N: -2,
    P: -2,
    Q: -2,
    R: -2,
    S: -1,
    T: 0,
    V: 4,
    W: -5,
    Y: -1,
  },
  K: {
    A: -1,
    C: -5,
    D: 0,
    E: 0,
    F: -5,
    G: -2,
    H: 0,
    I: -2,
    K: 5,
    L: -3,
    M: 0,
    N: 1,
    P: -1,
    Q: 1,
    R: 3,
    S: 0,
    T: 0,
    V: -2,
    W: -3,
    Y: -4,
  },
  L: {
    A: -2,
    C: -6,
    D: -4,
    E: -3,
    F: 2,
    G: -4,
    H: -2,
    I: 2,
    K: -3,
    L: 6,
    M: 4,
    N: -3,
    P: -3,
    Q: -2,
    R: -3,
    S: -3,
    T: -2,
    V: 2,
    W: -2,
    Y: -1,
  },
  M: {
    A: -1,
    C: -5,
    D: -3,
    E: -2,
    F: 0,
    G: -3,
    H: -2,
    I: 2,
    K: 0,
    L: 4,
    M: 6,
    N: -2,
    P: -2,
    Q: -1,
    R: 0,
    S: -2,
    T: -1,
    V: 2,
    W: -4,
    Y: -2,
  },
  N: {
    A: 0,
    C: -4,
    D: 2,
    E: 1,
    F: -3,
    G: 0,
    H: 2,
    I: -2,
    K: 1,
    L: -3,
    M: -2,
    N: 2,
    P: 0,
    Q: 1,
    R: 0,
    S: 1,
    T: 0,
    V: -2,
    W: -4,
    Y: -2,
  },
  P: {
    A: 1,
    C: -3,
    D: -1,
    E: -1,
    F: -5,
    G: 0,
    H: 0,
    I: -2,
    K: -1,
    L: -3,
    M: -2,
    N: 0,
    P: 6,
    Q: 0,
    R: 0,
    S: 1,
    T: 0,
    V: -1,
    W: -6,
    Y: -5,
  },
  Q: {
    A: 0,
    C: -5,
    D: 2,
    E: 2,
    F: -5,
    G: -1,
    H: 3,
    I: -2,
    K: 1,
    L: -2,
    M: -1,
    N: 1,
    P: 0,
    Q: 4,
    R: 1,
    S: -1,
    T: -1,
    V: -2,
    W: -5,
    Y: -4,
  },
  R: {
    A: -2,
    C: -4,
    D: -1,
    E: -1,
    F: -4,
    G: -3,
    H: 2,
    I: -2,
    K: 3,
    L: -3,
    M: 0,
    N: 0,
    P: 0,
    Q: 1,
    R: 6,
    S: 0,
    T: -1,
    V: -2,
    W: 2,
    Y: -4,
  },
  S: {
    A: 1,
    C: 0,
    D: 0,
    E: 0,
    F: -3,
    G: 1,
    H: -1,
    I: -1,
    K: 0,
    L: -3,
    M: -2,
    N: 1,
    P: 1,
    Q: -1,
    R: 0,
    S: 2,
    T: 1,
    V: -1,
    W: -2,
    Y: -3,
  },
  T: {
    A: 1,
    C: -2,
    D: 0,
    E: 0,
    F: -3,
    G: 0,
    H: -1,
    I: 0,
    K: 0,
    L: -2,
    M: -1,
    N: 0,
    P: 0,
    Q: -1,
    R: -1,
    S: 1,
    T: 3,
    V: 0,
    W: -5,
    Y: -3,
  },
  V: {
    A: 0,
    C: -2,
    D: -2,
    E: -2,
    F: -1,
    G: -1,
    H: -2,
    I: 4,
    K: -2,
    L: 2,
    M: 2,
    N: -2,
    P: -1,
    Q: -2,
    R: -2,
    S: -1,
    T: 0,
    V: 4,
    W: -6,
    Y: -2,
  },
  W: {
    A: -6,
    C: -8,
    D: -7,
    E: -7,
    F: 0,
    G: -7,
    H: -3,
    I: -5,
    K: -3,
    L: -2,
    M: -4,
    N: -4,
    P: -6,
    Q: -5,
    R: 2,
    S: -2,
    T: -5,
    V: -6,
    W: 17,
    Y: 0,
  },
  Y: {
    A: -3,
    C: 0,
    D: -4,
    E: -4,
    F: 7,
    G: -5,
    H: 0,
    I: -1,
    K: -4,
    L: -1,
    M: -2,
    N: -2,
    P: -5,
    Q: -4,
    R: -4,
    S: -3,
    T: -3,
    V: -2,
    W: 0,
    Y: 10,
  },
};
module.exports = {
  createTable,
  identityMatrix,
  scoringMatrix,
  vocabulary,
};

/**
 * Given two strings V and W of length n and m respectively,
 * generate a (n+1)x(m+1) matrix.
 * E.g. let v='GCATGCU' and w='GATTACA'
 *
 *     -  G  A  T  T  A  C  A
 * - [ 0, 0, 0, 0, 0, 0, 0, 0 ],
 * G [ 0, 0, 0, 0, 0, 0, 0, 0 ],
 * C [ 0, 0, 0, 0, 0, 0, 0, 0 ],
 * A [ 0, 0, 0, 0, 0, 0, 0, 0 ],
 * T [ 0, 0, 0, 0, 0, 0, 0, 0 ],
 * G [ 0, 0, 0, 0, 0, 0, 0, 0 ],
 * C [ 0, 0, 0, 0, 0, 0, 0, 0 ],
 * U [ 0, 0, 0, 0, 0, 0, 0, 0 ]
 *
 * @param {string} v
 * @param {string} w
 * @return {Array} table
 */
function createTable(v, w) {
  let n = v.length;
  let m = w.length;
  let rows = [];
  for (var i = 0; i < n + 1; i++) {
    rows[i] = [];
    for (var j = 0; j < m + 1; j++) {
      rows[i].push(0);
    }
  }
  return rows;
}

/**
 * Generate an identity matrix of size n
 * @param {number} n
 * @param {number} match
 * @param {number} penalization
 * @return {Array} matrix
 */
function identityMatrix(n, match, penalization) {
  match = match || 1;
  penalization = penalization || 0;

  let matrix = [];
  for (var i = 0; i < n; i++) {
    matrix[i] = [];
    for (var j = 0; j < n; j++) {
      matrix[i][j] = i === j ? match : penalization;
    }
  }
  return matrix;
}

/**
 * Generate a scoring matrix based on similarity
 * @param {string} v
 * @param {string} w
 * @param {object} scores rules
 * @return {Array} matrix
 */
function similarityMatrix(v, w, scores) {
  scores = scores || {};
  let match = scores.match || +1;
  let mismatch = scores.mismatch || -1;

  let vocab = vocabulary(v + w);
  let matrix = {};
  for (var i in vocab) {
    matrix[vocab[i]] = {};
    for (var j in vocab) {
      matrix[vocab[i]][vocab[j]] = i === j ? match : mismatch;
    }
  }

  return matrix;
}

/**
 * Generate a scoring matrix for strings V and W
 * Loads PAM, BLOSUM, and defaults to a similarity matrix
 * References:
 * - https://www.ncbi.nlm.nih.gov/Class/FieldGuide/BLOSUM62.txt
 * - https://www.ncbi.nlm.nih.gov/IEB/ToolBox/C_DOC/lxr/source/data/PAM250
 * @param {object} options { v, w, name, scores }
 * @return {object} dictionary of dictionaries
 */
function scoringMatrix(options) {
  let v = options.v;
  let w = options.w;
  let name = options.name || 'similarity';
  let scores = options.scores;

  let matrix = {};
  switch (name) {
    case 'similarity':
      matrix = similarityMatrix(v, w, scores);
      break;
    case 'BLOSUM62':
      matrix = BLOSUM62;
      break;
    case 'PAM250':
      matrix = PAM250;
      break;
    default:
  }

  return matrix;
}

/**
 * Find the unique set of characters in a string
 * @param {string} text
 * @return {Array} vocab
 */
function vocabulary(text) {
  let dictionary = text.split('').reduce((p, c) => {
    p[c] = 1;
    return p;
  }, {});
  return Object.keys(dictionary).sort();
}
