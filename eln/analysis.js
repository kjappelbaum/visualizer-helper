import UI from 'src/util/ui';
import Roc from '../rest-on-couch/Roc';

const kind = 'analysis';

export async function analysisFactory(sampleId, viewUUID, options = {}) {
    const {
        url = undefined,
        database = 'eln',
        category = 'analysis'
    } = options;

    var roc = new Roc({url, database, kind});

    return new AnalysisManager(roc, sampleId, viewUUID, category);
}

export class AnalysisManager {
    constructor(roc, sampleId, viewUUID, category) {
        this.roc = roc;
        this.sampleId = sampleId;
        this.viewUUID = viewUUID;
        this.category = category;
    }

    async load(label) {
        var existing = (await this.roc.view('analysisById', {key: [this.sampleId, this.viewUUID, label]}))[0];

        var rocOptions = {
            track: true,
            varName: 'viewAnalysis'
        };

        if (existing) {
            return this.roc.document(existing._id, rocOptions);
        } else {
            UI.showNotification(`Analysis ${label} not found`, 'error');
            return Promise.reject();
        }
    }

    async save(label, analysisResult) {
        var existing = (await this.roc.view('analysisById', {key: [this.sampleId, this.viewUUID, label]}))[0];

        if (existing) {
            existing.$content.result = analysisResult;
            return this.roc.update(existing._id);
        } else {
            return this.roc.create({
                $id: [this.sampleId, this.viewUUID, label],
                $content: {
                    category: this.category,
                    result: analysisResult
                },
                $kind: kind
            });
        }
    }

    list() {
        return this.roc.view('analysisByIdAndCategory', {key: [this.sampleId, this.viewUUID, this.category]});
    }
}
