import API from 'src/util/api';

/**
 * (string|array) [categories='']:  categories
 * (object) [options]
 * (string) [options.variableName='templates']
 */

module.exports = async function loadTemplates(categories, options = {}) {
  const { variableName = 'templates' } = options;
  if (typeof categories === 'string') {
    categories = [categories];
  }

  // we check if roc is already defined, in this case
  // we will check if the templates database exists
  var roc = API.cache('roc');

  var templates;
  if (roc) {
    await fetch(`${roc.url}/db/templates/_query/template?key=abcdef`)
      .then(async (result) => {
        if (result.status === 200) {
          templates = await fetchAndLink(`${roc.url}`, categories);
        } else {
          templates = await fetchAndLink(undefined, categories);
        }
      })
      .catch(async () => {
        templates = await fetchAndLink(undefined, categories);
      });
  } else {
    templates = await fetchAndLink(undefined, categories);
  }

  templates.sort((a, b) => {
    if (a.value.title < b.value.title) return -1;
    if (a.value.title > b.value.title) return 1;
    return 0;
  });

  // could be improved to remember the last selected format
  await API.createData(variableName, templates);

  return templates;
};

async function fetchAndLink(url = 'https://mydb.cheminfo.org', categories) {
  var templates = [];
  for (let category of categories) {
    let startkey = category;
    let endkey = `${category}\uFFFF`;
    let response = await fetch(
      `${url}/db/templates/_query/template?startkey=${startkey}&endkey=${endkey}`
    );
    let results = await response.json();
    results.forEach((result) => {
      result.document = {
        type: 'object',
        url: `${url}/db/templates/entry/${result.id}`
      };
    });
    templates.push(...results);
  }
  return templates;
}
