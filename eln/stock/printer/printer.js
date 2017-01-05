'use strict';

define([
        'src/util/api',
        './Printer',
        './printProcessors',
        './PrintServer',
        'https://www.lactame.com/github/cheminfo-js/visualizer-helper/fbbf28649f34169eee925d920d3a5161676d5bb0/rest-on-couch/Roc.js'
    ]
    , function (API, Printer, processors, PrintServer, Roc) {
        const SECOND = 1000;
        const MINUTE = 60 * SECOND;
        const LIMIT = 10 * MINUTE;
        return async function (couchDB) {
            var printerRoc, formatsRoc, printServerRoc, printers, printFormats, printServers, allIds;
            var onlineServers, onlinePrinters;

            const exports = {
                getDBPrinters() {
                    return printers;
                },

                async refresh() {
                    allIds = new Set();
                    printerRoc = new Roc(couchDB);
                    formatsRoc = new Roc(couchDB);
                    printServerRoc = new Roc(couchDB);
                    printers = await printerRoc.view('entryByKind', {key: 'printer', varName: 'labelPrinters'});
                    printFormats = await formatsRoc.view('entryByKind', {
                        key: 'printFormat',
                        varName: 'labelPrintFormats'
                    });
                    printServers = await printServerRoc.view('printServerByMacAddress', {varName: 'printServers'});
                    onlineServers = printServers.filter(ps => Date.now() - ps.$modificationDate < LIMIT);
                    onlinePrinters = printers.filter(p => onlineServers.find(ps => ps.$content.macAddress === p.$content.macAddress));

                    await Promise.all(printServers.map(ps => {
                        return exports.getConnectedPrinters(ps.$content.url).then(ids => {
                            ps.ids = ids;
                            ids.forEach(id => allIds.add(id));
                            ps.responds = true;
                            ps.color = 'lightgreen';
                        }).catch(() => {
                            ps.ids = [];
                            ps.responds = false;
                            ps.color = 'pink';
                        }).then(() => {
                            ps.triggerChange();
                        });
                    }));

                    API.createData('allIds', Array.from(allIds));
                },

                async getConnectedPrinters(url) {
                    const server = new PrintServer(String(url));
                    return await server.getDeviceIds();
                },

                async print(printer, printFormat, data) {
                    printer = await printerRoc.get(printer);
                    printFormat = await formatsRoc.get(printFormat);
                    const printServer = printServers.find(ps => String(ps.$content.macAddress) === String(printer.$content.macAddress));
                    const p = new Printer(printer.$content, printServer.$content);
                    await p.print(printFormat.$content, data);
                },

                async createPrinter(printer) {
                    printer.$kind = 'printer';
                    await printerRoc.create(printer);
                },

                async createFormat(format) {
                    format.$kind = 'printFormat';
                    await formatsRoc.create(format);
                },

                async updateFormat(format) {
                    await formatsRoc.update(format);
                },

                async updatePrinter(printer) {
                    await printerRoc.update(printer);
                },

                async deletePrinter(printer) {
                    await printerRoc.delete(printer);
                },

                async deleteFormat(format) {
                    await formatsRoc.delete(format);
                },

                // get online printers that can print a given format
                async getPrinters(format) {
                    if (!format) return onlinePrinters;
                    format = await formatsRoc.get(format);
                    const onlineMacAdresses = onlinePrinters
                        .map(ps => ps.$content.macAddress);
                    return printers
                        .filter(p => onlineMacAdresses.includes(p.$content.macAddress))
                        .filter(p => {
                            return format.$content.models.filter(m => String(m.name) === String(p.$content.model)).length > 0;
                        });
                },

                getFormats(printer, type) {
                    if (!printer) {
                        var formats = printFormats.filter(f => {
                            return onlinePrinters.some(printer => f.$content.models.some(m => String(m.name) === String(printer.$content.model)));
                        })
                    } else {
                        printer = printerRoc.get(printer);
                        formats = printFormats.filter(f => f.$content.models.some(m => String(m.name) === String(printer.$content.model)));
                    }
                    if (type) {
                        formats = formats.filter(f => String(f.$content.type) === type);
                    }
                    return formats;
                },

                getProcessors () {
                    return Object.keys(processors);
                },

                getTypes() {
                    var formats = exports.getFormats.apply(null, arguments);
                    var s = new Set();
                    for (var format of formats) {
                        s.add(String(format.$content.type));
                    }
                    return Array.from(s);
                }
            };


            await exports.refresh();
            return exports;
        };

    });
