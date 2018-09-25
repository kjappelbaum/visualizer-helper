import { convert } from '../libs/jcampconverter';
import { parseXY } from '../libs/parseXY';

/**
 * Create a chart object from a clicked row
 * @param {object} experiment
 * @param {object} [options]
 * @return {Promise.<{data: [object]}>}
 */
export async function getChartFromMass(experiment, options = {}) {
  if (experiment.jcamp) {
    let name =
      options.name || String(experiment.jcamp.filename).match(/([^/]+)\..+/)[1];
    if (String(experiment.jcamp.encoding) === 'text') {
      let result = convert(String(experiment.jcamp.content), { xy: true });
      let points = result.spectra[0].data[0];
      return {
        data: [
          {
            label: name,
            x: points.x,
            y: points.y
          }
        ]
      };
    } else if (experiment.jcamp.dUrl) {
      let content = await fetch(String(experiment.jcamp.dUrl), {
        credentials: 'include'
      }).then((r) => r.text());
      let result = convert(content, { xy: true });
      let points = result.spectra[0].data[0];
      return {
        data: [
          {
            label: name,
            x: points.x,
            y: points.y
          }
        ]
      };
    } else if (experiment.jcamp.encoding === undefined) {
      return {}; // no data
    } else {
      throw new Error(`unsupported encoding ${experiment.jcamp.encoding}`);
    }
  } else if (experiment.text) {
    let name =
      options.name || String(experiment.text.filename).match(/([^/]+)\..+/)[1];
    if (String(experiment.text.encoding) === 'text') {
      let points = parseXY(String(experiment.text.content), {
        arrayType: 'xxyy',
        uniqueX: true
      });
      return {
        data: [
          {
            label: name,
            x: points[0],
            y: points[1]
          }
        ]
      };
    } else if (experiment.text.dUrl) {
      let content = await fetch(String(experiment.text.dUrl), {
        credentials: 'include'
      }).then((r) => r.text());
      let points = parseXY(content, { arrayType: 'xxyy', uniqueX: true });
      return {
        data: [
          {
            label: name,
            x: points[0],
            y: points[1]
          }
        ]
      };
    } else {
      throw new Error(`unsupported encoding ${experiment.text.encoding}`);
    }
  } else {
    throw new Error('the file should be a jcamp or text');
  }
}
