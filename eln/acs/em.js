import CCE from '../libs/CCE';

export default function toHTML(value) {
    let acsString = '';

    if (value.accurate && value.accurate.mf) {
        let accurate = value.accurate;
        let cc = CCE.analyseMF(accurate.mf + '(' + accurate.modification + ')');
        let modification = CCE.analyseMF(accurate.modification);
        let result = [];
        let experiment = [];
        experiment.push('HRMS');
        let inParenthesis = [];
        if (value.ionisation) inParenthesis.push(value.ionisation);
        if (value.analyzer) inParenthesis.push(value.analyzer);
        if (inParenthesis.length > 0) experiment.push('(' + inParenthesis.join('/') + ')');
        experiment.push('m/z:');
        result.push(experiment.join(' '));

        var modificationMF = modification.mf.replace(/\(.*/, '');
        if (modificationMF) {
            result.push('[M + ' + modificationMF + ']' + getCharge(modification.charge));
        } else {
            result.push('[M]' + getCharge(modification.charge));
        }
        result.push('Calcd for');
        var mf = cc.mf.replace(/\(.*/, '').replace(/([^+-])([0-9]+)/g, '$1<sub>$2</sub>');

        result.push(mf + getCharge(cc.charge));

        if (cc.parts[0].msem) {
            result.push(cc.parts[0].msem.toFixed(4) + ';');
        } else {
            result.push(cc.em.toFixed(4) + ';');
        }
        result.push('Found');
        result.push(Number(accurate.value).toFixed(4));

        acsString = result.join(' ');

    }
    return acsString;
}

function getCharge(charge) {
    if (!charge) charge = 1;
    if (charge > 0) charge = '+' + charge;
    if (charge === '+1') charge = '+';
    if (charge === -1) charge = '-';
    return '<sup>' + charge + '</sup>';
}

