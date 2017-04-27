'use strict';

import chemspider from './chemspider';
import chemexper from './chemexper';

import ui from 'src/util/ui';

const defaultOptions = {
    chemexper: true,
    chemspider: true
};

module.exports = {
    chemspider: chemspider,
    chemexper: chemexper,
    choose(term, options) {
        options = Object.assign({}, defaultOptions, options);
        const sources = [];
        if(options.chemspider) sources.push({promise: chemspider.search(term)});
        if(options.chemexper) sources.push({promise: chemexper.search(term)});
        return ui.choose(sources, {
            asynchronous: true,
            noConfirmation: true,
            returnRow: true,
            columns: [
                {
                    id: 'description',
                    name: 'description',
                    jpath: ['$content', 'general', 'description']
                },
                {
                    id: 'molfile',
                    name: 'molfile',
                    jpath: ['$content', 'general', 'molfile'],
                    rendererOptions: {
                        forceType: 'mol2d'
                    }

                },
                {
                    id: 'names',
                    name: 'names',
                    jpath: ['$content', 'general'],
                    rendererOptions: {
                        forceType: 'object',
                        twig: `
                        <div style="height: 100%; line-height: initial; vertical-align: middle">
                        <table style="width: 100%; text-align: center;">
                        {% for n in name %}
                            <tr><td>{{ n.value }}</td></tr>
                        {% endfor %}
                        </table>
                        </div>
                    `
                    }
                },
                {
                    id: 'cas',
                    name: 'cas',
                    jpath: ['$content', 'identifier'],
                    rendererOptions: {
                        forceType: 'object',
                        twig: listTemplate('cas', '.value')
                    }
                },
                {
                    id: 'source',
                    name: 'source',
                    field: 'source'
                }
            ],
            idField: 'id',
            slick: {
                rowHeight: 150
            }
        }).catch(function(e) {
            console.error(e);
            ui.showNotification('search failed', 'error');
        });

    }
};

function listTemplate(val, prop) {
    return `
    <div style="height: 100%; line-height: initial; vertical-align: middle">
        <table style="width: 100%; text-align: center;">
            {% for n in ${val} %}
                <tr><td>{{ n${prop} }}</td></tr>
            {% endfor %}
        </table>
    </div>
    `;
}