class SVGCreator {
  constructor(height, width) {
    this.height = height;
    this.width = width;
    this.elements = [];
  }

  add(kind, inner, options = {}) {
    if (typeof inner === 'object') {
      options = inner;
      inner = '';
    }
    if (inner) {
      this.elements.push({
        kind,
        inner: inner,
        attributes: options,
      });
    } else {
      this.elements.push({
        kind,
        attributes: options,
      });
    }
  }

  toSVG() {
    let content = `<svg width="${this.width}" height="${this.height}">`;
    for (let element of this.elements) {
      let attributes = Object.keys(element.attributes)
        .map(
          (key) =>
            `${key.replace(
              /([A-Z])/g,
              (match) => '-' + match.toLowerCase(),
            )}="${element.attributes[key]}"`,
        )
        .join(' ');
      if (element.inner) {
        content += `<${element.kind} ${attributes}>${element.inner}</${element.kind}>`;
      } else {
        content += `<${element.kind} ${attributes} />`;
      }
    }
    content += '</svg>';
    return content;
  }
}

module.exports = SVGCreator;
