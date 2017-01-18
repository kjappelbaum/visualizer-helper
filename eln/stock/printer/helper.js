'use strict';

import ui from 'src/util/ui';
import API from 'src/util/api';

module.exports = {
    async setup (printer, types) {
        API.cache('printer', printer);
        let varFormats = types.map(() => []);
        const printers = await printer.getPrinters();
        for(let i=0; i<printers.length; i++) {
            for(let j=0; j<types.length; j++) {
                const sFormats = (await printer.getFormats(printers[i], types[j])).map(f => ({
                    printer: printers[i],
                    format: f
                }));
                varFormats[j] = varFormats[j].concat(sFormats);
            }
        }


        for(let j=0; j<types.length; j++) {
            API.createData(types[j] + 'Formats', varFormats[j]);
        }
    },

    async printEntry(entry, info) {
        const printer = API.cache('printer');
        if(!printer) {
            ui.showNotification('Printer not setup');
            return;
        }

        if(typeof info === 'string') {
            info = info.split(';');
            if(!info[0]) {
                info = await module.exports.askFormat('sample');
            } else {
                info = {
                    printer: info[0],
                    format: info[1]
                }
            }
        } else if(typeof info !== 'object') {
            ui.showNotification('Unexpected printer info');
            return;
        }

        if(!info.printer || !info.format) {
            ui.showNotification('Incomplete printer info');
            return;
        }

        try {
            await printer.print(info.printer, info.format, entry);
        } catch(err) {
            console.log(err);
            ui.showNotification(`Error printing: ${err.message}`, 'error');
        }
    },
    async askFormat (type) {
        var f = {};
        const printer = API.cache('printer');
        const printers = await printer.getPrinters();
        const formats = await printer.getFormats(null, type);
        await ui.form(`
            <div>
                <form>
                <table>
                    <tr>
                        <td>Printer</td>
                        <td>
                            <select name="printer">
                                {% for el in printers %}
                                    <option value="{{ el._id }}">{{ el['$content'].name }}</option>
                                {% endfor %}
                            </select>    
                        </td>
                    </tr>
                    <tr>
                        <td>Format</td>
                        <td>
                            <select name="format">
                                {% for el in formats %}
                                    <option value="{{ el._id }}">{{ el['$content'].name }}</option>
                                {% endfor %}
                            </select>
                        </td>
                    </tr>
                </table>
                <input type="submit"/>
                </form>
            </div>
    `, f, {twig: {formats, printers}});
        return f;
    }
};