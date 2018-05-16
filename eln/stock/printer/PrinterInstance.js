define(['src/util/util', './printServerFactory', './printProcessors'], function (
  Util,
  printServerFactory,
  processors
) {
  class Printer {
    constructor(printer, printServer, opts) {
      this.url = String(printServer.url);
      this.id = String(printer.id);
      this.printServer = printServerFactory(printServer, opts);
    }

    async print(printFormat, data) {
      const printData = await getPrintData(printFormat, data);
      if (printData === null) return null;
      return this.printServer.print(this.id, printData);
    }
  }

  async function getPrintData(printFormat, data, options = {}) {
    if (!processors[printFormat.processor]) {
      throw new Error('processor does not exist');
    }
    data = processData(printFormat, data);
    return processors[String(printFormat.processor)].call(
      null,
      printFormat,
      data,
      options
    );
  }

  function processData(printFormat, data) {
    switch (printFormat.type) {
      case 'sample': {
        const result = JSON.parse(JSON.stringify(data));
        if (data.$content) {
          result.entry = data.$content;
          if (data._id) {
            result.uuidShort = data._id.substring(0, 12);
            result.b64Short = Util.hexToBase64(result.uuidShort);
          }
          if (data.$id) {
            result.id = data.$id;
          }
          if (data.$content.general) {
            if (data.$content.general.description) {
              result.line1 = data.$content.general.description.substring(0, 60);
              result.line2 = data.$content.general.description.substring(60, 120);
            } else {
              result.line1 = '';
              result.line2 = '';
            }
            if (data.$content.general.molfile) {
              result.molfile = String(data.$content.general.molfile);
            }
          }
        }

        return result;
      }
      case 'location':
        return data;
      default:
        return data;
    }
  }

  Printer.processData = processData;
  Printer.getPrintData = getPrintData;

  return Printer;
});
