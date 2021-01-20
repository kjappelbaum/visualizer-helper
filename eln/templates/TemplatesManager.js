define([
  '../../rest-on-couch/Roc',
  '../../rest-on-couch/getChangedGroups',
  'src/util/api',
  'vh/rest-on-couch/showRecordInfo',
  'src/util/ui',
], function (
  Roc,
  getChangedGroups,
  API,
  showRecordInfo,
  UI,
) {

  class TemplatesManager {
    constructor(couchDB, options = {}) {
      this.roc = new Roc({ ...couchDB, database: 'templates' });
      this.roc.getGroupMembership().then(groups => this.allGroups = groups);
      this.basename = options.basename || '';
      this.refreshTemplates();
    }


    async createTemplate() {
      let template = {
        $kind: 'template',
        $owners: ['anonymousRead'],
        $id: ''.padStart(8).replace(/ /g, () => (Math.random() * 36 | 0).toString(36)),
        $content: {
          title: '',
          description: '',
          twig: '',
          category: [{
            value: "org.cheminfo.default"
          }],
          example: [
            {
              description: 'Default data',
              data: {
              },
              form: {
              }
            }
          ]
        }
      }
      let entry = await this.roc.create(template);
      API.createData('currentTemplate', entry);
      this.refreshTemplates();
      return entry;
    }

    async updateTemplate(template) {
      await this.roc.update(template);
      this.refreshTemplates();
    }

    async getTemplate(template) {
      if (!template) return;
      let entry = await this.roc.document(template.id);
      await API.createData('currentTemplate', entry);
      updateVariables();
      this.doAction('setSelectedData', 0);
      return entry;
    }

    async deleteTemplate(template) {
      console.log('Delete', template);
      return;
      await this.roc.delete(template.id);
      API.createData('currentTemplate', {
      });
      updateVariables();
      this.refreshTemplates();
    }

    async refreshTemplates() {
      var templates = await this.roc.query('toc', {
        addRightsInfo: true,
        sort: (a, b) => a.modificationDate - b.modificationDate
      });
      console.log(templates)
      await API.createData('templates', templates);
      this.doAction('setSelectedTemplate', 0);
      return templates;
    }

    async doAction(action) {
      if (!action) return;
      var actionName = action.name;
      var actionValue = action.value;

      console.log('ACTION:', actionName, actionValue);


      switch (actionName) {
        case 'createTemplate':
          return this.createTemplate(actionValue);
        case 'updateTemplate':
          return this.updateTemplate(actionValue);
        case 'deleteTemplate':
          return this.deleteTemplate(actionValue);
        case 'getTemplate':
          return this.getTemplate(actionValue);
        case 'showTemplateInfo':
          return this.showTemplateInfo(actionValue);
        case 'editTemplateAccess':
          return this.editTemplateAccess(actionValue);
        case 'refreshTemplates':
          return this.refreshTemplates();
      }
    }


    async editTemplateAccess(entry) {
      const record = await this.roc.get(entry.id);
      console.log(record, this.allGroups);
      const changed = await getChangedGroups(record, this.allGroups);
      if (!changed) return;
      try {
        for (let group of changed.add) {
          await this.roc.addGroup(record, group);
        }
        for (let group of changed.remove) {
          await this.roc.deleteGroup(record, group);
        }
      } catch (e) {
        UI.showNotification(e.message, 'error');
      }
    }

    async showTemplateInfo(entry) {
      const record = await this.roc.get(entry.id);
      console.log('got record');
      console.log({ record })
      return showRecordInfo(record);
    }

  }
  return TemplatesManager;

});