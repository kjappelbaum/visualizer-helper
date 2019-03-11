function toHTML(value, options = {}) {
  const { parenthesis = false, ascending = false } = options;
  value = JSON.parse(JSON.stringify(value));
  if (value && value.peak) {
    if (ascending) {
      value.peak.sort((a, b) => a.wavelength - b.wavelength);
    } else {
      value.peak.sort((a, b) => b.wavelength - a.wavelength);
    }
  }
  if (parenthesis) return format2(value);
  return format1(value);
}

// IR (cm-1): 1955w, 1881w, 1807w, 1614m, 1500S, 1454m
function format1(value) {
  var acsString = '';
  if (value && value.peak) {
    acsString += 'IR (cm<sup>-1</sup>): ';
    acsString += value.peak
      .map((a) => Math.round(a.wavelength) + (a.kind ? `<i>${a.kind}</i>` : ''))
      .join(', ');
  }
  return acsString;
}

// IR (νmax, cm-1) 2929 (w), 3521 (w), 3016 (w), 3065 (w), 2853 (w), 1766S, 1495 (w),
function format2(value) {
  var acsString = '';
  if (value && value.peak) {
    acsString += 'IR (ν<sub>max</sub>, cm<sup>-1</sup>) ';
    acsString += value.peak
      .map(
        (a) =>
          Math.round(a.wavelength) +
          (a.kind ? ` (${a.kind.toLowerCase()})` : '')
      )
      .join(', ');
  }
  return acsString;
}

module.exports = toHTML;
