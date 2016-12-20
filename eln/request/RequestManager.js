'use strict';

import {confirm} from 'src/util/ui';

const statuses = {
    // statusCode: [statusName, statusColor]
    0: ['Cancelled', 'grey'],
    10: ['Pending', 'yellow'],
    20: ['Processing', 'blue'],
    30: ['Finished', 'green'],
    90: ['Error', 'red']
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
}
