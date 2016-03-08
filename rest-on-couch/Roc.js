'use strict';

define([
        'src/util/api',
        'src/util/ui',
        'superagent',
        'uri/URI',
        'lodash',
        'src/util/couchdbAttachments'
    ],
    function (API, ui, superagent, URI, _, CDB) {

        const defaultOptions = {
            messages: {
                200: 'OK',
                201: 'Created',
                202: 'Accepted',
                204: 'No content',
                400: 'Bad request',
                401: 'Unauthorized',
                409: 'Conflict',
                403: 'Forbidden',
                408: 'Request timeout',
                500: 'Internal server error',
                502: 'Bad gateway'
            }
        };

        const getTypes = ['get', 'getAttachment', 'getView'];

        const messagesByType = {
            get: {
                401: 'Unauthorized to get entry'
            },
            create: {
                200: 'Entry created',
                201: 'Entry created',
                401: 'Unauthorized to create entry'
            },
            update: {
                200: 'Entry updated',
                401: 'Unauthorized to update entry'
            },
            delete: {
                200: 'Entry deleted',
                401: 'Unauthorized to delete entry'
            },
            addAttachment: {
                200: 'Added attachment',
                401: 'Unauthorized to add attachment'
            },
            deleteAttachment: {
                200: 'Attachment deleted',
                401: 'Unauthorized to delete attachment'
            },
            getAttachment: {
                401: 'Unauthorized to get attachment'
            },
            getView: {
                401: 'Unauthorized to get view'
            }
        };

        for (let key in defaultOptions.messages) {
            // For get requests default is not to show any messages
            if (key < '300') {
                for (let i = 0; i < getTypes.length; i++) {
                    messagesByType[getTypes[i]][key] = '';
                }
            }
        }

        const viewSearch = ['key', 'startkey', 'endkey'];
        const mandatoryOptions = ['url', 'database'];

        class Roc {
            constructor(opts) {
                for (var key in opts) {
                    if (opts.hasOwnProperty(key)) {
                        this[key] = opts[key];
                    }
                }

                for (let i = 0; i < mandatoryOptions.length; i++) {
                    if (!this[mandatoryOptions[i]]) {
                        throw new Error(`${mandatoryOptions[i]} is a mandatory option`);
                    }
                }
                this.messages = this.messages || {};
                this.variables = {};


                this.requestUrl = new URI(opts.url);
                this.databaseUrl = this.requestUrl.directory(`${this.requestUrl.directory()}/db/${this.database}`).normalize().href();
                this.entryUrl = `${this.databaseUrl}entry`;
                this.__ready = Promise.resolve();
            }

            view(viewName, options) {
                return this.__ready.then(() => {
                    options = createOptions(options, 'getView');
                    let requestUrl = new URI(`${this.databaseUrl}_view/${viewName}`);

                    for (let i = 0; i < viewSearch.length; i++) {
                        if (options[viewSearch[i]]) {
                            requestUrl.addSearch(viewSearch[i], JSON.stringify(options[viewSearch[i]]));
                        }
                    }

                    requestUrl = requestUrl.normalize().href();

                    return superagent.get(requestUrl)
                        .withCredentials()
                        .then(res => {
                            if (res && res.body && res.status == 200) {
                                if (options.varName) {
                                    this.variables[options.varName] = {
                                        type: 'view',
                                        requestUrl,
                                        data: res.body
                                    };
                                    API.createData(options.varName, res.body);
                                }
                            }
                            return res.body;
                        })
                        .then(handleSuccess(this, options))
                        .catch(handleError(this, options));
                });
            }

            document(uuid, options) {
                return this.get(uuid).then(doc => {
                    if (!doc) return;
                    if (options.varName) {
                        this.variables[options.varName] = {
                            type: 'document',
                            data: doc
                        };
                        API.createData(options.varName, doc);
                        return doc;
                    }
                });
            }

            get(entry, options) {
                return this.__ready.then(() => {
                    var uuid = getUuid(entry);
                    options = createOptions(options, 'get');
                    if (options.fromCache) {
                        return this._findByUuid(uuid);
                    } else {
                        return superagent.get(`${this.entryUrl}/${uuid}`)
                            .withCredentials()
                            .end()
                            .then(res => {
                                if (res.body && res.status == 200) {
                                    this._updateByUuid(uuid, res.body);
                                    return res.body;
                                }
                            }).catch(handleError(this, options));
                    }
                });
            }

            getById(id, options) {
                return this.__ready.then(() => {
                    options = createOptions(options, 'get');
                    var entry = this._findById(id);
                    if (!entry || options.fromCache) {
                        return entry;
                    }
                    return this.get(entry)
                        .catch(handleError(this, options));
                });
            }

            create(entry, options) {
                return this.__ready
                    .then(() => {
                        options = createOptions(options, 'create');
                        return superagent.post(this.entryUrl)
                            .withCredentials()
                            .send(entry)
                            .then(handleSuccess(this, options))
                            .then(res => {
                                if (res.body && (res.status == 200 || res.status == 201)) {
                                    return this.get(res.body.id);
                                }
                            })
                            .then(entry => {
                                if (!entry) return;
                                let keys = Object.keys(this.variables);
                                for (let i=0; i<keys.length; i++) {
                                    this.variables[keys[i]].data.push(_.cloneDeep(entry));
                                    this.variables[keys[i]].data.triggerChange();
                                }
                                return entry;
                            })
                            .catch(handleError(this, options));
                    });
            }

            update(entry, options) {
                return this.__ready.then(() => {
                        options = createOptions(options, 'update');
                        return superagent.put(`${this.entryUrl}/${String(entry._id)}`)
                            .withCredentials()
                            .send(entry)
                            .then(handleSuccess(this, options))
                            .then(res => {
                                if (res.body && res.status == 200) {
                                    entry._rev = res.body.rev;
                                    this._updateByUuid(entry._id, entry);
                                }
                                return res.body;
                            })
                            .catch(handleError(this, options));
                    });
            }

            deleteAttachment(entry, attachments, options) {
                return this.__ready.then(() => {
                    var uuid = getUuid(entry);
                    options = createOptions(options, 'deleteAttachment');
                    if (Array.isArray(attachments) && attachments.length === 0) return this.getAttachmentList(entry);
                    const cdb = this._getCdb(uuid);
                    return cdb.remove(attachments)
                        .then(attachments => {
                            return this.get(uuid).then(data => {
                                console.log('got doc', data);
                                this._updateByUuid(uuid, data);
                                return attachments;
                            });
                        })
                        .catch(handleError(this, options));;
                });
            }

            removeAttachment(entry, attachments, options) {
                return this.deleteAttachment(entry, attachments, options);
            }

            getAttachment(entry, name, options) {
                return this.__ready.then(() => {
                    const uuid = getUuid(entry);
                    options = createOptions(options, 'getAttachment');
                    const cdb = this._getCdb(uuid);
                    return cdb.get(name)
                        .catch(handleError(this, options));
                });
            }

            getAttachmentList(entry) {
                return this.__ready.then(() => {
                    const uuid = getUuid(entry);
                    const cdb = this._getCdb(uuid);
                    return cdb.list();
                });
            }

            addAttachment(entry, attachments, options) {
                return this.__ready.then(() => {
                    if(!Array.isArray(attachments)) {
                        attachments = [attachments];
                    }
                    var uuid = getUuid(entry);
                    options = createOptions(options, 'addAttachment');
                    const cdb = this._getCdb(uuid);
                    return cdb.inlineUploads(attachments)
                        .then(attachments => {
                            return this.get(uuid).then(data => {
                                console.log('got doc add att', data);
                                this._updateByUuid(uuid, data);
                                return attachments;
                            });
                        })
                        .catch(handleError(this, options));
                })
            }

            addAttachmentById(id, attachment, options) {
                return this.__ready.then(() => {
                    var doc = this._findById(id);
                    if (!doc) return;
                    return this.addAttachment(doc._id, attachment, options);
                });
            }


            delete(entry, options) {
                return this.__ready.then(() => {
                        const uuid = getUuid(entry);
                        options = createOptions(options, 'delete');
                        return superagent.del(`${this.entryUrl}/${uuid}`)
                            .withCredentials()
                            .then(handleSuccess(this, options))
                            .then(res => {
                                if (res.body && res.status == 200) {
                                    for (let key in this.variables) {
                                        const idx = this._findIndexByUuid(uuid, key);
                                        if (idx !== -1) {
                                            this.variables[key].data.splice(idx, 1);
                                            this.variables[key].data.triggerChange();
                                        }
                                    }

                                }
                                return res.body;
                            })
                            .catch(handleError(this, options));
                    });
            }

            remove(entry, options) {
                return this.delete(entry, options);
            }

            // Private
            _getCdb(uuid) {
                const docUrl = `${this.entryUrl}/${String(uuid)}`;
                return new CDB(docUrl);
            }

            _findByUuid(uuid, key) {
                if (key === undefined) {
                    var result;
                    // Return the first one found (they are all supposed to be the same...)
                    for (let key in this.variables) {
                        result = this._findByUuid(uuid, key);
                        if (result) return result;
                    }
                    return null;
                }

                if (!this.variables[key]) return null;
                return this.variables[key].data.find(entry => String(entry._id) === String(uuid));
            }

            _findById(id, key) {
                if (key === undefined) {
                    var result;
                    for (let key in this.variables) {
                        result = this._findById(id, key);
                        if (result) return result;
                    }
                    return null;
                }
                if (!this.variables[key]) return null;
                id = DataObject.resurrect(id);
                if (this.variables[key].type === 'document' && _.isEqual(DataObject.resurrect(this.variables[key].data.$id), id)) {
                    return this.variables[key].data;
                } else if (this.variables[key.type === 'view']) {
                    return this.variables[key].data.find(entry => _.isEqual(id, DataObject.resurrect(entry.$id)));
                }
                return null;
            }

            _findIndexByUuid(uuid, key) {
                if (!this.variables[key]) return -1;
                if (this.variables[key].type === 'document') {
                    return -1;
                }
                return this.variables[key].data.findIndex(entry => String(entry._id) === String(uuid));
            }

            _updateByUuid(uuid, data) {
                for (let key in this.variables) {
                    if (this.variables[key].type === 'view') {
                        const idx = this._findIndexByUuid(uuid, key);
                        if (idx !== -1) {
                            this.variables[key].data.setChildSync([idx], _.cloneDeep(DataObject.resurrect(data)));
                        }
                    } else if (this.variables[key].type === 'document') {
                        uuid = String(uuid);
                        const _id = this.variables[key].data._id;
                        if (uuid === _id) {
                            var newData = _.cloneDeep(DataObject.resurrect(data));
                            this.variables[key].data = newData;
                            API.createData(key, newData);
                        }
                    }
                }

            }
        }

        function createOptions(options, type) {
            var messages = Object.assign({}, defaultOptions.messages, messagesByType[type], options && options.messages);
            options = Object.assign({}, defaultOptions, options);
            if (messages) options.messages = messages;
            return options;
        }

        function handleError(ctx, options) {
            return function (err) {
                if (err.status || err.timeout) { // error comes from superagent
                    handleSuperagentError(err, ctx, options);
                }
                // Propagate error
                throw err;
            };
        }

        function handleSuccess(ctx, options) {
            return function (data) {
                if (data.status) {
                    handleSuperagentSuccess(data, ctx, options);
                }
                return data;
            };
        }

        function handleSuperagentSuccess(data, ctx, options) {
            const message = options.messages[data.status] || ctx.messages[data.status];
            if (message && !options.disableNotification) {
                ui.showNotification(message, 'success');
            }
        }

        function handleSuperagentError(err, ctx, options) {
            const message = options.messages[err.status] || ctx.messages[err.status];
            if (message && !options.disableNotification) {
                ui.showNotification(message, 'error');
            }
        }

        function getUuid(entry) {
            var uuid;
            var type = DataObject.getType(entry);
            if (type === 'string') {
                uuid = entry;
            } else if (type === 'object') {
                uuid = entry._id;
            } else {
                throw new Error('Bad arguments');
            }
            return String(uuid);
        }

        return Roc;
    });

