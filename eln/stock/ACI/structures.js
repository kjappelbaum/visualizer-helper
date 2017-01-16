'use strict';

import OCL from 'openchemlib/openchemlib-core';
import RocUtil from 'vh/rest-on-couch/util';

function Structure(roc) {
    return {
        async getStructures(type) {
            const options = {
                key: 'structure',
                varName: 'structures'
            };

            if(type) {
                options.filter = function(entry) {
                    return entry.$id[1] === type;
                };
            }
            return await roc.view('entryByKind', options);
        },

        async create(molfile, type) {
            molfile = String(molfile);
            var ocl = OCL.Molecule.fromMolfile(molfile).getIDCodeAndCoordinates();
            const newEntry = {
                $id: [ocl.idCode, type],
                $kind: 'structure',
                $owners: ['structureRW', 'structureR'],
                $content: {
                    structureId: await RocUtil.getNextId(roc, 'structureId', 'AC'),
                    coordinates: ocl.coordinates
                }
            };
            await roc.create(newEntry, {
                messages: {
                    409: 'Conflict: this structure already exists'
                }
            });
        }


    };
}

module.exports = Structure;