import TypeRenderer from 'src/util/typerenderer';

import toHtmlIR from './ir';
import toHtmlNMR from './nmr';
import toHtmlMass from './mass';

export function add() {
  TypeRenderer.addType('acsir', {
    toscreen($element, val) {
      var acsString = toHtmlIR(val);
      $element.html(acsString);
    }
  });

  TypeRenderer.addType('acsnmr', {
    toscreen($element, val) {
      var acsString = toHtmlNMR(val);
      $element.html(acsString);
    }
  });

  TypeRenderer.addType('acsms', {
    toscreen($element, val) {
      var acsString = toHtmlMass(val);
      $element.html(acsString);
    }
  });
}
