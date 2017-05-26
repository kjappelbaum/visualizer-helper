import Datas from 'src/main/datas';
import API from 'src/util/api';

const DataObject = Datas.DataObject;

const jpaths = {};

jpaths.sampleCode = ['$id', 0];
jpaths.batchCode = ['$id', 1];
jpaths.creationDate = ['$creationDate'];
jpaths.modificationDate = ['$modificationDate'];
jpaths.content = ['$content'];
jpaths.general = ['$content', 'general'];
jpaths.molfile = ['$content', 'general', 'molfile'];
jpaths.mf = ['$content', 'general', 'mf'];
jpaths.mw = ['$content', 'general', 'mw'];
jpaths.em = ['$content', 'general', 'em'];
jpaths.description = ['$content', 'general', 'description'];
jpaths.name = ['$content', 'general', 'name'];
jpaths.physical = ['$content', 'physical'];
jpaths.bp = ['$content', 'physical', 'bp'];
jpaths.nd = ['$content', 'physical', 'nd'];
jpaths.mp = ['$content', 'physical', 'mp'];
jpaths.density = ['$content', 'physical', 'density'];
jpaths.ir = ['$content', 'spectra', 'ir'];
jpaths.mass = ['$content', 'spectra', 'mass'];
jpaths.nmr = ['$content', 'spectra', 'nmr'];
jpaths.attachments = ['attachmentList'];


export function createVar(variable, varName) {
    check(varName);
    API.setVariable(varName, variable, jpaths[varName]);
}

export function getData(sample, varName) {
    check(varName);
    sample = _getData(sample);
    return sample.getChildSync(jpaths[varName]);
}

export function setData(sample, varName) {
    check(varName);
    // todo fix this
    //sample = get(sample);
    sample.setChildSync(jpaths[varName]);
}

function check(varName) {
    if (!jpaths[varName]) {
        throw new Error(`jpath for ${varName} not defined`);
    }
}

function _getData(variable) {
    if (DataObject.getType(variable) === 'string') {
        return API.getData(variable);
    }
    return variable;
}
