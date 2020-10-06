const defaultOptions = {
  databaseName: 'templates',
};

class TemplatesManager {
  /**
   * Create an object managing the Toc
   * @param {object} [roc]
   * @param {object} [options={}]
   * @param {string} [options.databaseName='mine'] 
   * @param {string} [options.category=''] Starts with any name
   */
  constructor(roc, options = {}) {
    this.roc = roc;
    this.options = Object.assign({}, defaultOptions, options);
  }

  async createTemplate() {
    let template = {
        $kind: 'template',
        $owners: ['anonymousRead'],
        $id: ''
        .padStart(8)
        .replace(/ /g, () => ((Math.random() * 36) | 0).toString(36)),
        $content: {
            title: '',
            description: '',
            twig: '',
            category: [
                {
                value: 'org.cheminfo.default',
                },
            ],
            example: [
                {
                description: 'Default data',
                data: {},
                form: {},
                },
            ],
        },
    };
    let entry = await this.roc.create(template);
    return entry;
};

async updateTemplate = async function updateTemplate(
  template,
) {
  await this.roc.update(template);
  API.doAction('refreshTemplates', {});
};

TemplatesManager.prototype.getTemplate = async function getTemplate(template) {
  if (!template) return;
  let entry = await this.roc.document(template.id);
  await API.createData('currentTemplate', entry);
  updateVariables();
  API.doAction('setSelectedData', 0);
  return entry;
};

TemplatesManager.prototype.deleteTemplate = async function deleteTemplate(
  template,
) {
  console.log('Delete', template);
  await this.roc.delete(template.id);
  API.createData('currentTemplate', {});
  updateVariables();
  API.doAction('refreshTemplates', {});
};

TemplatesManager.prototype.refreshTemplates = async function refreshTemplates() {
  var templates = await this.roc.query('toc', {
    sort: (a, b) => a.modificationDate - b.modificationDate,
  });
  await API.createData('templates', templates);
  API.doAction('setSelectedTemplate', 0);
  return templates;
};

function updateVariables() {
  let currentTemplate = API.getVar('currentTemplate');
  API.setVariable('category', currentTemplate, ['$content', 'category']);
  API.setVariable('example', currentTemplate, ['$content', 'example']);
  API.setVariable('twig', currentTemplate, ['$content', 'twig']);
  API.setVariable('title', currentTemplate, ['$content', 'title']);
  API.setVariable('description', currentTemplate, ['$content', 'description']);
  API.setVariable('kind', currentTemplate, ['$content', 'kind']);
  API.setVariable('content', currentTemplate, ['$content']);
}

if (!this.action) return;
var actionName = this.action.name;
var actionValue = this.action.value;

console.log('ACTION:', actionName, actionValue);

var templatesManager = API.cache('templatesManager');

switch (actionName) {
  case 'createTemplate':
    return templatesManager.createTemplate(actionValue);
  case 'updateTemplate':
    return templatesManager.updateTemplate(actionValue);
  case 'deleteTemplate':
    return templatesManager.deleteTemplate(actionValue);
  case 'getTemplate':
    return templatesManager.getTemplate(actionValue);
  case 'refreshTemplates':
    return templatesManager.refreshTemplates();
}
