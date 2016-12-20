'use strict';

import {confirm} from 'src/util/ui';

export default class RequestManager {
    constructor(roc) {
        this.roc = roc;
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
            await this.roc.update(request);
        }
    }
}
