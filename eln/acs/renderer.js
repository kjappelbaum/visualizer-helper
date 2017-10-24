import TypeRenderer from 'src/util/typerenderer';
import toHtmlIR from './ir';
import toHtmlNMR from './nmr';
import toHtmlEM from './em';

export function add() {
    TypeRenderer.addType('acsir', {
        toscreen($element, val, rootVal, options) {
            var acsString=toHtmlIR(val);
            $element.html(acsString);
        }
    });

    TypeRenderer.addType('acsnmr', {
        toscreen($element, val, rootVal, options) {
            var acsString=toHtmlNMR(val);
            $element.html(acsString);
        }
    });

    TypeRenderer.addType('acsem', {
        toscreen($element, val, rootVal, options) {
            var acsString=toHtmlEM(val);
            $element.html(acsString);
        }
    });
}


