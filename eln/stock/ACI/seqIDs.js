
async function getNextID(roc, prefix) {
    var v = await roc.view('sampleId', {
        reduce: true
    });

    if (!v.length || !v[0].value || !v[0].value[prefix]) {
        return `${prefix}-1`;
    }

    var id = v[0].value[prefix];
    var current = Number(id);
    var nextID = current + 1;
    var nextIDStr = String(nextID);
    return prefix + '-' + nextIDStr;
}

async function getNextSampleWithSaltID(roc, oclid, salt, prefix) {
    let dups = await roc.query('idWithOCLID', {
        startkey: [oclid],
        endkey: [oclid, '\ufff0']
    });
    dups.forEach(d => d.key.shift());
    if (dups.length === 0) {
        const code = await getNextID(roc, prefix);
        return [code, salt, 1];
    }
    const code = dups[0].value[0];
    const unique = isUnique(dups.map(v => v.key));
    if (!unique) throw new Error('conflict with this structure');
    // only keep structures with same salt
    dups = dups.filter(dup => dup.value[1] === String(salt));

    if (dups.length === 0) {
        return [code, salt, 1];
    }
    const nextBatchNumber = getNextBatchNumber(dups);
    const newId = dups[0].value.slice();
    newId[newId.length - 1] = nextBatchNumber;
    return newId;
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
    const unique = isUnique(dups.map(v => v.key));
    if (!unique) throw new Error('conflict with this structure');
    const nextBatchNumber = getNextBatchNumber(dups);
    const newId = dups[0].value.slice();
    newId[newId.length - 1] = nextBatchNumber;
    return newId;
}

function isUnique(keys) {
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
    getNextSampleWithSaltID
};
