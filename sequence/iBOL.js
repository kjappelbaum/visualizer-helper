'use strict';

define(['https://www.lactame.com/lib/NtSeq/HEAD/NtSeq.js'], function (NtSeq) {
    var exports = {};
    var MAX_MISMATCH = 3;

    exports.getFiltered = function (data, selection, keys) {
        return data.filter(function (d) {
            loop1: for (var i = 0; i < selection.length; i++) {
                for (var j = 0; j < keys.length; j++) {
                    if (String(d[keys[j]]) !== String(positive[i][keys[j]])) continue loop1;
                }
                return true;
            }
            return false;
        });
    };

    exports.discriminate = function (posSeq, negSeq) {

        console.log('number of species', posSeq.length + negSeq.length);


        var allSeq = posSeq.concat(negSeq);
        var primerSet = getPrimers(allSeq, 20);
        var result = new Array(primerSet.size);
        var counter = 0;

        console.log('primer set length', primerSet.size);

        primerSet.forEach(function (primer) {
            var r = {};
            r.pos = getMatchDistribution(primer, posSeq);
            r.neg = getMatchDistribution(primer, negSeq);
            r.primer = primer;
            result[counter] = r;
            counter++;
        });

        // sort result
        result.sort(function (a, b) {
            for (var i = 0; i < MAX_MISMATCH + 1; i++) {
                var diff = a.pos[i] - a.neg[i] - (b.pos[i] - b.neg[i]);
                if (diff < 0) return 1;
                else if (diff > 0) return -1;
            }
            return 0;
        });

        console.log('result', result);
        return result;
    };


    // Seq comparison functions
    function getPrimers(sequences, primerLength) {
        var s = new Set();

        for (var i = 0; i < sequences.length; i++) {
            processSequence(s, sequences[i], primerLength);
        }

        return s;
    }

    function processSequence(s, seq, primerLength) {
        for (var i = 0; i < seq.length - primerLength + 1; i++) {
            var primer = seq.substr(i, primerLength);
            s.add(primer);
        }
    }

    function findBestMatch(primer, seq) {
        var mismatches = MAX_MISMATCH;
        for (var i = 0; i < seq.length - primer.length + 1; i++) {
            var subseq = seq.substr(i, primer.length);
            var m = countMismatches(subseq, primer);
            if (mismatches === 0) {
                return 0;
            } else if (m < mismatches) {
                mismatches = m;
            }
        }
        return mismatches;
    }

    function getMatchDistribution(primer, sequences) {
        var bestMatches = sequences.map(function (seq) {
            return findBestMatch(primer, seq);
        });
        debugger;
        var distribution = new Array(MAX_MISMATCH + 1).fill(0);
        bestMatches.forEach(best => {
            distribution[best]++;
        });

        return distribution.map(d => {
            return d / bestMatches.length;
        });
    }

    function countMismatches(seq1, seq2) {
        var mismatch = 0;
        for (var i = 0; i < seq1.length; i++) {
            if (seq1[i] !== seq2[i]) {
                mismatch++;
                if (mismatch === MAX_MISMATCH) return mismatch;
            }
        }
        return mismatch;
    }

});

