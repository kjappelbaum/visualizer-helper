'use strict';

import OCL from 'openchemlib/openchemlib-core';
import RocUtil from 'vh/rest-on-couch/util';

function Structure(roc) {
    return {
        async refresh(type) {
            const options = {
                key: 'structure',
                varName: 'structures'
            };

            if (type) {
                options.filter = function (entry) {
                    return entry.$id[1] === type;
                };
            }
            return await roc.view('entryByKind', options);
        },

        async create(molfile, type) {
            const ocl = getOcl(molfile);
            return await this._createFromOcl(ocl, type);
        },

        async _createFromOcl(ocl, type, rocOptions) {
            rocOptions = rocOptions || {};
            const newEntry = {
                $id: [ocl.idCode, type],
                $kind: 'structure',
                $owners: ['structureRW', 'structureR'],
                $content: {
                    structureId: await RocUtil.getNextId(roc, 'structureId', 'AC'),
                    coordinates: ocl.coordinates
                }
            };
            await roc.create(newEntry, Object.assign({
                messages: {
                    409: 'Conflict: this structure already exists'
                }
            }, rocOptions));
            return newEntry;
        },

        async createOrGetId(molfile, type) {
            const ocl = getOcl(molfile);
            try {
                const entry = await this._createFromOcl(ocl, type, {disableNotification: true});
                return entry;
            } catch (e) {
                if (e.message === 'Conflict') {
                    console.log('conflict');
                    // try to get id
                    const result = await roc.view('entryById', {
                        key: [ocl.idCode, type]
                    });
                    if (result.length) {
                        console.log(result);
                        return result[0];
                    } else {
                        throw new Error('Unexpected error creating structure');
                    }
                }
            }
        }

    };
}

function getOcl(molfile) {
    molfile = String(molfile);
    var ocl = OCL.Molecule.fromMolfile(molfile).getIDCodeAndCoordinates();
    return ocl;
};

module.exports = Structure;