'use strict';

import {confirm} from 'src/util/ui';

const statuses = {
    // statusCode: [statusName, statusColor]
    0: ['Cancelled', '#AAAAAA'],
    10: ['Pending', '#FFDC00'],
    20: ['Processing', '#0074D9'],
    30: ['Finished', '#01FF70'],
    90: ['Error', '#FF4136']
};
const disableNotification = {disableNotification: true};

export function getStatus(code) {
    if (statuses[code]) {
        return statuses[code];
    }
    throw new Error(`No such status: ${code}`);
}

export function getStatusName(code) {
    return getStatus(code)[0];
}

export function getStatusColor(code) {
    return getStatus(code)[1];
}

export function getStatusCode(name) {
    for (const status in statuses) {
        if (statuses[status][0] === name) {
            return Number(status);
        }
    }
    throw new Error(`No such status: ${name}`);
}

export default class RequestManager {
    constructor(roc, options) {
        options = options || {};
        this.roc = roc;
        this.sampleRoc = options.sampleRoc || null;
    }

    async cancel(request) {
        if (Number(request.$content.status[0].status) === 0) {
            return;
        }
        if (await confirm('cancel request?')) {
            request.$content.status.unshift({
                date: Date.now(),
                status: 0
            });
            await this.roc.update(request, disableNotification);
        }
    }

    async createRequests(sample, list) {
        const groups = Array.from(new Set(list.map(el => el.kind)));
        // allow each lab to edit the entry
        for (const group of groups) {
            await this.sampleRoc.addGroup(sample, group, disableNotification);
        }
        for (const req of list) {
            const requestObject = {
                $content: {
                    productUuid: String(sample._id),
                    productId: sample.$id,
                    analysis: req,
                    status: [{
                        date: Date.now(),
                        status: 10
                    }]
                },
                $owners: [req.kind]
            };
            await this.roc.create(requestObject, disableNotification);
        }
    }

    async view(name, options) {
        const viewData = await this.roc.view(name, options);
        addChangeListener(viewData);
        return viewData;
    }
}

function addChangeListener(view) {
    const id = view.onChange((event, triggerId) => {
        if (triggerId !== id) {
            updateView(view, id);
        }
    });
    updateView(view, id);
}

function updateView(view, id) {
    view.forEach(updateRequest);
    view.triggerChange(false, id);
}

function updateRequest(request) {
    const lastStatus = request.$content.status[0];
    const status = getStatus(lastStatus.status);
    request.statusText = status[0];
    request.statusColor = status[1];
}
