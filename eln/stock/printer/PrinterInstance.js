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
      if (!processors[printFormat.processor]) {
        throw new Error('processor does not exist');
      }
      processData(printFormat, data);
      const printData = await processors[String(printFormat.processor)].call(
        null,
        printFormat,
        data
      );
      if (printData === null) return null;
      return this.printServer.print(this.id, printData);
    }
  }

  function processData(printFormat, data) {
    switch (printFormat.type) {
      case 'sample': {
        if (data.$content && data.$content) {
          data.uuidShort = data._id.substring(0, 12);
          data.b64Short = Util.hexToBase64(data.uuidShort);
          data.id = data.$id.join(' ');
          if (data.$content.general) {
            if (data.$content.general.description) {
              data.line1 = data.$content.general.description.substring(0, 60);
              data.line2 = data.$content.general.description.substring(60, 120);
            } else {
              data.line1 = '';
              data.line2 = '';
            }
            data.molfile = data.$content.general.molfile;
          }
        }
        if (data.molfile) {
          data.molfile = String(data.molfile);
        }
        break;
      }
      case 'location':
        break;
      default:
        break;
    }
  }

  return Printer;
});
