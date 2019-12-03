import API from 'src/util/api';
import UI from 'src/util/ui';

import getViewInfo from './getViewInfo';

// ModulePrefsManager is created in the init script
// Any module may have a gear in the settings allowing to change preferences
// If roc is defined we save in roc otherwise with save in local storage

export class ModulePrefsManager {
  constructor(modulePrefs = [], options = {}) {
    this.modulePrefs = modulePrefs;
    this.roc = options.roc;
    getViewInfo().then((result) => {
      this.viewID = result._id;
      console.log('viewID', this.viewID);
    });
  }

  async updateSlickGridPrefs(moduleID) {
    const objectStructure = API.getModule(moduleID).data.resurrect()[0];
    const cols = JSON.parse(
      JSON.stringify(API.getModulePreferences(moduleID).cols)
    );
    cols.forEach((item) => {
      if (!item.id) item.id = Math.random();
    });

    await UI.editTable(cols, {
      remove: true,
      dialog: {
        title: 'Configure the columns of the module'
      },
      columns: [
        {
          id: 'id',
          name: 'name',
          jpath: ['name'],
          editor: Slick.CustomEditors.TextValue
        },
        {
          id: 'rendererOptions',
          name: 'rendererOptions',
          jpath: ['rendererOptions'],
          editor: Slick.CustomEditors.TextValue
        },
        {
          id: 'width',
          name: 'width',
          jpath: ['width'],
          editor: Slick.CustomEditors.NumberValue
        },
        {
          id: 'x',
          name: 'x',
          jpath: ['x'],
          editor: Slick.CustomEditors.Select,
          editorOptions: { choices: 'ab:cd;ef:gh' }
        },
        {
          id: 'jpath',
          name: 'jpath',
          jpath: ['jpath'],
          editor: Slick.CustomEditors.JPathFactory(objectStructure),
          forceType: 'jpath',
          rendererOptions: {
            forceType: 'jpath'
          }
        }
      ]
    });

    cols.forEach((item) => {
      item.formatter = 'typerenderer';
    });

    API.updateModulePreferences(moduleID, {
      cols: JSON.parse(JSON.stringify(cols))
    });

    localStorage.setItem('prefsSlick', JSON.stringify({ cols }));
  }

  async reloadModulePrefs(moduleID) {
    if (!this.roc) {
      let prefs = JSON.parse(
        localStorage.getItem('viewModulePreferences') || '{}'
      );
      if (!prefs[this.viewID]) return;
      if (moduleID && !prefs[this.viewID].moduleID) return;
      if (moduleID) {
        API.updateModulePreferences(moduleID, prefs[this.viewID.moduleID]);
      } else {
        for (moduleID in prefs[this.viewID]) {
          API.updateModulePreferences(moduleID, prefs[this.viewID.moduleID]);
        }
      }
    }
  }

  async saveModulePrefs(moduleID, modulePrefs) {
    if (!this.roc) {
      let prefs = JSON.parse(
        localStorage.getItem('viewModulePreferences') || '{}'
      );
      if (!prefs[this.viewID]) prefs[this.viewID] = {};
      prefs[this.viewID].moduleID = modulePrefs;
      localStorage.setItem(
        'viewModulePreferences',
        JSON.stringify(modulePrefs)
      );
    }
  }
}

module.exports = ModulePrefsManager;
