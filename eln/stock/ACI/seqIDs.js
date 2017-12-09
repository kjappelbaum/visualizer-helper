
async function getNextID(roc, prefix) {
    var v = await roc.view('sampleId', {
        reduce: true
    });

    if (!v.length || !v[0].value || !v[0].value[prefix]) {
        return `${prefix}-000001-` + getCheckDigit(1);
    }

    var id = v[0].value[prefix];
    var current = Number(id);
    var nextID = current + 1;
    var check = getCheckDigit(nextID);
    var nextIDStr = String(nextID);
    return prefix + '-' + '0'.repeat(6 - nextIDStr.length) + nextIDStr + '-' + check;

}

function getCheckDigit(number) {
    var str = number.toString();
    var strlen = str.length;
    var idx = 1;
    var total = 0;
    for (var i = strlen - 1; i >= 0; i--) {
        var el = +str.charAt(i);
        total += el * idx++;
    }
    var checkDigit = total % 10;
    return checkDigit;
}

async function getNextSampleID(roc, oclid, prefix) {
    const dups = await roc.query('idWithOCLID', {
        startkey: [oclid],
        endkey: [oclid, '\ufff0']
    });
    if (dups.length === 0) {
        const code = await getNextID(roc, prefix);
        return [code, 1];
    }
    const isUnique = checkIsUnique(dups.map(v => v.key));
    if (!isUnique) throw new Error('conflict with this structure');
    const nextBatchNumber = getNextBatchNumber(dups);
    const newId = dups[0].value.slice();
    newId[newId.length - 1] = nextBatchNumber;
    return newId;
}

function checkIsUnique(keys) {
    if (keys.length === 0) return true;
    const oclid = keys[0][1];
    for (let key of keys) {
        if (key[1] !== oclid) return false;
    }
    return true;
}

function getNextBatchNumber(values) {
    return Math.max.apply(null, values.map(v => v.value[v.value.length - 1])) + 1;
}

module.exports = {
    getNextSampleID,
};
