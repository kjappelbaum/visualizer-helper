import API from 'src/util/api';

/**
 * (string|array) [categories='']:  categories
 * (object) [options]
 * (string) [options.variableName='templates']
 */

module.exports = async function loadTemplates(categories, options = {}) {
  const {
    variableName = 'templates'
  } = options;
  if (typeof categories === 'string') {
    categories = [categories];
  }
  var Roc = await API.require('vh/rest-on-couch/Roc');

  // we check if roc is already defined, in this case
  // we will check if the templates database exists
  var roc = API.cache('roc');

  var templateRoc;
  if (roc) {
    await fetch(`${roc.url}/db/templates/_query/template`).then(() => {
      templateRoc = new Roc({
        database: 'templates',
        url: roc.url,
        track: false
      });
    }).catch(() => { // no local templates database, we use the default one
      templateRoc = new Roc({
        database: 'templates',
        url: 'https://mydb.cheminfo.org',
        track: false
      });
    });
  } else {
    templateRoc = new Roc({
      database: 'templates',
      url: 'https://mydb.cheminfo.org',
      track: false
    });
  }

  var templates = [];
  for (let category of categories) {
    let currentTemplates = await templateRoc.query(
      'template', {
        startkey: category,
        endkey: category+'\uFFFF'
      }
    );
    templates.push(...currentTemplates);
  }

  // could be improved to remember the last selected format

  await API.createData(variableName, templates);
  setTimeout(() => {
    API.doAction('setTemplate', 0);
  }, 10);

  return templates;
};

