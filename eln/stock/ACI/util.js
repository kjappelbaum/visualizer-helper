import OCL from 'openchemlib/openchemlib-core';
import UI from 'src/util/ui';

module.exports = function (roc, prefix) {
    function getMoleculeWithSalts(options) {
        const {saltCode, idCode, nbSalts, value} = options;
        const oclid = idCode || value;
        const mol = OCL.Molecule.fromIDCode(oclid);
        if (saltCode !== 'NX' && oclid !== 'd@') {
            var salt = salts[saltCode];
            if (salt) {
                var oclSalt = OCL.Molecule.fromIDCode(String(salt.idCode));
                for (var i = 0; i < nbSalts; i++) {
                    mol.addMolecule(oclSalt);
                }
                mol.inventCoordinates();
            } else {
                throw new Error('unknown salt');
            }
        }
        // Todo: fix invent coordinates with getCanonizedIDCode
        //mol.inventCoordinates();
        return mol;
    }

    function getOclDistinguishOr(mol) {
        const idCode = mol.getCanonizedIDCode(OCL.Molecule.CANONIZER_DISTINGUISH_RACEMIC_OR_GROUPS);
        const {coordinates} = mol.getIDCodeAndCoordinates();
        return {
            idCode,
            coordinates
        };
    }

    async function updateInternalDocumentWithNewStructure(doc, newOcl) {
        // init some variables
        const newOclid = String(newOcl.idCode || newOcl.value);
        const general = doc.$content.general;
        const misc = doc.$content.misc;
        const saltCode = general.saltCode;
        const nbSalts = general.nbSalts;

        // update free base
        const freeBaseMolecule = OCL.Molecule.fromIDCode(newOclid);
        const freeBaseOcl = freeBaseMolecule.getIDCodeAndCoordinates();
        const baseMf = freeBaseMolecule.getMolecularFormula();

        misc.freeBase = {
            mf: baseMf.formula,
            mw: baseMf.relativeWeight,
            ocl: {
                value: freeBaseOcl.idCode,
                coordinates: freeBaseOcl.coordinates
            }
        };


        const moleculeWithSalts = getMoleculeWithSalts({
            nbSalts,
            saltCode,
            idCode: newOclid
        });
        const withSaltsMf = moleculeWithSalts.getMolecularFormula();
        const newOclWithSalts = getOclDistinguishOr(moleculeWithSalts);

        general.mf = withSaltsMf.formula;
        general.mw = withSaltsMf.relativeWeight;
        general.molfile = moleculeWithSalts.toMolfileV3();
        general.ocl = {
            value: newOclWithSalts.idCode,
            coordinates: newOclWithSalts.coordinates,
            index: moleculeWithSalts.getIndex()
        };
    }

    async function updateInternalStructureByCreate(docId, newOcl) {
        let doc = await roc.document(docId);
        const oclid = newOcl.idCode || newOcl.value;
        // update $id and structure with salt
        updateInternalDocumentWithNewStructure(doc, newOcl);
        debugger;
        delete doc._id;
        doc.$id = await getNextSampleWithSaltID(oclid, doc.$content.general.saltCode);
        await roc.create(doc);
        await roc.delete(docId);
    }

    async function updateInternalStructureByUpdate(docId, newOcl) {
        let doc = await roc.document(docId);
        updateInternalDocumentWithNewStructure(doc, newOcl);
        await roc.update(doc);
    }

    async function updateInternalStructure(oldOclid, newOcl) {
        const newOclid = newOcl.idCode || newOcl.value;
        if (String(newOclid) === String(oldOclid)) {
            throw new Error('new and old structures are identical');
        }
        const oldDups = await getDups(oldOclid);
        const newDups = await getDups(newOclid);
        if (!isUnique(newDups) || !isUnique(oldDups)) {
            throw new Error('There are ID conflicts to resolve');
        }
        if (newDups.length > 0) {
            // warn user
            // Create new entry for each old one
            const confirmed = await UI.confirm('Same ACI number cannot be reused. The update of the structure will create a new ACI number? do you want to continue?');
            if (!confirmed) return;
            for (let dup of oldDups) {
                await updateInternalStructureByCreate(dup.id, newOcl);
            }
        } else if (oldDups.length > 0) {
            // warn user
            const confirmed = await UI.confirm('The same ACI number can be reused. Do you want to proceed?');
            if (!confirmed) return;
            for (let dup of oldDups) {
                await updateInternalStructureByUpdate(dup.id, newOcl);
            }

            // update all old entries with the new structure
        } else {
            throw new Error('oclid cannot be updated because it does not exist');
        }
    }

    async function getNextID() {
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

    function getDups(oclid) {
        const oclidStr = String(oclid);
        return roc.query('idWithOCLID', {
            startkey: [oclidStr],
            endkey: [oclidStr, '\ufff0']
        });
    }

    async function getNextSampleWithSaltID(oclid, salt) {
        let dups = await getDups(oclid);
        dups.forEach(d => d.key.shift());
        if (dups.length === 0) {
            const code = await getNextID();
            return [code, salt, 1];
        }
        const code = dups[0].value[0];
        const unique = isUnique(dups);
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

    async function getNextSampleID(oclid) {
        const dups = await roc.query('idWithOCLID', {
            startkey: [oclid],
            endkey: [oclid, '\ufff0']
        });
        if (dups.length === 0) {
            const code = await getNextID();
            return [code, 1];
        }
        const unique = isUnique(dups);
        if (!unique) throw new Error('conflict with this structure');
        const nextBatchNumber = getNextBatchNumber(dups);
        const newId = dups[0].value.slice();
        newId[newId.length - 1] = nextBatchNumber;
        return newId;
    }

    function isUnique(dups) {
        const keys = dups.map(v => v.key);
        if (keys.length === 0) return true;
        const id = keys[0][2];
        for (let key of keys) {
            if (key[2] !== id) return false;
        }
        return true;
    }

    function getNextBatchNumber(values) {
        return Math.max.apply(null, values.map(v => v.value[v.value.length - 1])) + 1;
    }

    return {
        updateInternalStructure,
        getNextSampleID,
        getNextSampleWithSaltID,
        salts
    };
};


var salts = {
    NX: {
        name: 'Free base'
    },
    AA: {
        idCode: 'fHdP@@',
        name: 'Hydrochloride',
        mf: 'HCl'
    },
    AB: {
        idCode: 'fHv`d@',
        name: 'Sodium',
        mf: 'Na+'
    },
    AC: {
        idCode: 'fHfH@@',
        mf: 'HBr',
        mw: 80.91194,
        name: 'Hydrobromide'
    },
    AD: {
        idCode: 'fHeX@@',
        mf: 'HI',
        mw: 127.90794000000001,
        name: 'Hydroiodide'
    },
    AE: {
        idCode: 'daxB@@QnR[VZY`cD',
        mf: 'C4H4O4',
        mw: 116.07176,
        name: 'Maleate'
    },
    AG: {
        idCode: 'gJQhHl@bOV`@',
        mf: 'CH4O3S',
        mw: 96.10576,
        name: 'Mesylate'
    },
    AH: {
        idCode: 'gGPP@cTfyi`@',
        mf: 'C2H2O4',
        mw: 90.03388,
        name: 'Oxalate'
    },
    AI: {
        idCode: 'gNplJqHJPtadTaeTp@',
        mf: 'C2HO2F3',
        mw: 114.02194,
        name: 'Trifluoroacetate'
    },
    AJ: {
        idCode: 'gJPXHlPDQzt@@',
        mf: 'H2O4S',
        mw: 98.07788000000001,
        name: 'Sulfate'
    },
    AK: {
        idCode: 'gC``@dfZ@@',
        mf: 'C2H4O2',
        mw: 60.05176,
        name: 'Acetate'
    },
    AL: {
        idCode: 'fHvPd@',
        mf: 'K',
        mw: 39.098,
        name: 'Potassium'
    },
    AM: {
        idCode: 'dedF@@PfFTf{nZjf@@',
        mf: 'C4H6O6',
        mw: 150.08564,
        name: 'Tartrate'
    },
    AN: {
        idCode: 'dmtL`HS@BLddlRVFUh@H@@',
        mf: 'C7H8O3S',
        mw: 172.20352,
        name: 'p-Toluenesulfonate'
    },
    AO: {
        idCode: 'dkLN@@PiWSR[kVYjjfX@@',
        mf: 'C6H8O7',
        mw: 192.12252,
        name: 'Citrate'
    },
    AP: {
        idCode: 'dmvL`BaL@HrRRjIJUVjjh@@',
        mf: 'C6H13NO3S',
        mw: 179.23922000000002,
        name: 'n-Cyclohexylsulfamate'
    },
    AQ: {
        idCode: 'gGPXHlPDYIHUj@@',
        mf: 'CH4O4S',
        mw: 112.10476,
        name: 'Methylsulfate'
    },
    AR: {
        idCode: 'fHv@d@',
        mf: 'Li',
        mw: 6.941,
        name: 'Lithium'
    },
    AS: {
        idCode: 'dazL@LAnRVmjj`@',
        mf: 'C4H11NO3',
        mw: 121.13534,
        name: 'Tris(hydroxymethyl)-methylammonium'
    },
    AT: {
        idCode: 'gCi`hEiNyIf`@',
        mf: 'HNO3',
        mw: 63.011939999999996,
        name: 'Nitrate'
    },
    AU: {
        idCode: 'gNpP@jtfvZf@@',
        mf: 'C3H4O4',
        mw: 104.06076,
        name: 'Malonate'
    },
    AV: {
        idCode: 'fJ@@',
        mf: 'H3N',
        mw: 17.03082,
        name: 'Ammonium'
    },
    AW: {
        idCode: 'gNx@@eRmUP@',
        mf: 'C6H15N',
        mw: 101.19210000000001,
        name: 'Triethylammonium'
    },
    AX: {
        idCode: 'fdy@q@HHqxLPAE`cIIKEDhmCIKQgKP@@Pl@@@',
        mf: 'C10H8O6S2',
        mw: 288.29952000000003,
        name: 'Naphthalene-1,5-disulfonic acid'
    },
    AY: {
        idCode: 'dk^@@@RfYU\\]Tzjjjj@@',
        mf: 'C12H23N',
        mw: 181.32162,
        name: 'Dicyclohexyl-ammonium'
    },
    DB: {
        idCode: 'gJPXHlQDQzl@@',
        mf: 'HO4Cl',
        mw: 100.45694,
        name: 'Perchlorate'
    }
};
