function toAnnotations(peaks, options = {}) {
    var {
        fillColor = 'green',
        strokeColor = 'red'
    } = options;

    if (!peaks) return [];

    return peaks.map(a => {
        var annotation = {line: 1,
            _highlight: [
                a._highlight
            ],
            type: 'rect',
            strokeColor: strokeColor,
            strokeWidth: 0,
            fillColor: fillColor
        };
        annotation.label = [
            {
                text: a.kind,
                size: '18px',
                anchor: 'middle',
                color: 'red',
                position: {
                    x: a.wavelength,
                    y: a.transmittance,
                    dy: '-22px'
                }
            }];
        annotation.position = [{
            x: a.wavelength - 10,
            y: a.transmittance,
            dy: '-20px'
        }, {
            x: a.wavelength + 10,
            y: a.transmittance,
            dy: '-10px'
        }];
        return annotation;
    });
}

module.exports = toAnnotations;
