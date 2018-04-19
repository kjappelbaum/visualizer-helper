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
      data = processData(printFormat, data);
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
        const result = {};
        if (data.$content && data.$content) {
          result.entry = data;
          result.uuidShort = data._id.substring(0, 12);
          result.b64Short = Util.hexToBase64(result.uuidShort);
          result.id = data.$id.join(' ');
          if (data.$content.general) {
            if (data.$content.general.description) {
              result.line1 = data.$content.general.description.substring(0, 60);
              result.line2 = data.$content.general.description.substring(
                60,
                120
              );
            } else {
              result.line1 = '';
              result.line2 = '';
            }
            result.molfile = String(data.$content.general.molfile);
          }
        }
        if (data.molfile) {
          Object.assign(result, data, {
            molfile: String(data.molfile)
          });
        }
        return result;
      }
      case 'location':
      default:
        return data;
    }
  }

  return Printer;
});
