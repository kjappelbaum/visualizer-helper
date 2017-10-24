import SD from '../libs/SD';


export default function toHTML(value, options={}) {
    var acsString="";
    if (value && value.range) {

        var ranges=new SD.Ranges(value.range);
        var nucleus='';
        if (Array.isArray(value.nucleus)) nucleus=value.nucleus[0];
        acsString += ranges.getACS({
            nucleus,
            solvent: value.solvent,
            frequencyObserved: value.frequency
        });
    }
    return acsString;
}

