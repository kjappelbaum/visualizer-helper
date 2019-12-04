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

    let waitingInitialized = new Promise((resolveWaiting) => {
      this.resolveWaiting = resolveWaiting;
    }).then(() => {
      console.log('Initialized');
    });

    let waitingView = getViewInfo().then((result) => {
      this.viewID = result._id;
      console.log('Got view: viewID', this.viewID);
    });

    let promiseAll = Promise.all([waitingInitialized, waitingView]).then(() => {
      console.log('Finished waiting');
      this.waiting = () => true;
    });
    this.waiting = () => promiseAll;
  }

  initialized() {
    this.resolveWaiting();
  }

  async updateSlickGridPrefs(moduleID) {
    await this.waiting();
    console.log('finish waiting updateSlickGridPrefs');
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
    console.log({ moduleID, cols });
    API.updateModulePreferences(moduleID, {
      cols: JSON.parse(JSON.stringify(cols))
    });

    this.saveModulePrefs(moduleID, { cols });
  }

  async reloadModulePrefs(moduleID) {
    await this.waiting();
    console.log('finish waiting reloadModulePrefs');
    if (!this.roc) {
      let prefs = JSON.parse(
        localStorage.getItem('viewModulePreferences') || '{}'
      );
      if (!prefs[this.viewID]) return;
      if (moduleID && !prefs[this.viewID][moduleID]) return;
      if (moduleID) {
        console.log('Reloading prefs', prefs[this.viewID][moduleID]);
        API.updateModulePreferences(moduleID, prefs[this.viewID][moduleID]);
      } else {
        for (moduleID in prefs[this.viewID]) {
          API.updateModulePreferences(moduleID, prefs[this.viewID][moduleID]);
        }
      }
    }
  }

  async saveModulePrefs(moduleID, modulePrefs) {
    await this.waiting();
    console.log('finish waiting saveModulePrefs');
    if (!this.roc) {
      let prefs = JSON.parse(
        localStorage.getItem('viewModulePreferences') || '{}'
      );
      if (!prefs[this.viewID]) prefs[this.viewID] = {};
      prefs[this.viewID][moduleID] = modulePrefs;
      console.log({ prefs });
      localStorage.setItem('viewModulePreferences', JSON.stringify(prefs));
    }
  }
}

module.exports = ModulePrefsManager;
