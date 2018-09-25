function toAnnotations(peaks, options = {}) {
  var { fillColor = 'green', strokeColor = 'red' } = options;

  if (!peaks) return [];

  return peaks.map((a) => {
    var annotation = {
      line: 1,
      _highlight: [a._highlight],
      type: 'rect',
      strokeColor: strokeColor,
      strokeWidth: 0,
      fillColor: fillColor
    };
    annotation.label = [
      {
        text: a.mass.toFixed(1),
        size: '18px',
        anchor: 'middle',
        color: 'red',
        position: {
          x: a.mass,
          y: a.intensity,
          dy: '-22px'
        }
      }
    ];
    annotation.position = [
      {
        x: a.mass - 2,
        y: a.intensity,
        dy: '-20px'
      },
      {
        x: a.mass + 2,
        y: a.intensity,
        dy: '-10px'
      }
    ];
    return annotation;
  });
}

module.exports = toAnnotations;
