define([
  'src/util/api',
  './yamlParser',
  'src/util/ui',
  'src/util/versioning'
], function (API, yamlParser, UI, Versioning) {
  let tipsURL = 'https://tips.cheminfo.org/';
  let minDelayBetweenTips = 4 * 3600 * 1000;
  async function getViewInfo() {
    if (
      !Versioning.lastLoaded ||
      !Versioning.lastLoaded.view ||
      !Versioning.lastLoaded.view.url
    ) {
      return {};
    }
    let viewURL = Versioning.lastLoaded.view.url;
    let recordURL = viewURL.replace(/\/view.json.*/, '');
    let response = await fetch(recordURL, { credentials: 'include' });
    let info = await response.json();
    info.rev = Number(info._rev.replace(/-.*/, ''));
    return info;
  }

  async function showTips() {
    let info = await getViewInfo();
    if (!info._id) return;

    //  info._id='15c9a2dcd55c963fdedf2c18a1471b03';
    //  info.rev=90;
    // retrieve tips toc
    await fetch(`${tipsURL + info._id}/index.yml`)
      .then(async (response) => {
        let text = await response.text();
        processTipsToc(text, info);
      })
      .catch();
  }

  function processTipsToc(yaml, info) {
    let toc = yamlParser.parse(yaml);
    let userPrefs = JSON.parse(
      window.localStorage.getItem('tipsPreferences') ||
        '{"lastTip":0, "views":{}}'
    );
    if ((Date.now() - userPrefs.lastTip || 0) < minDelayBetweenTips) return;
    if (!userPrefs.views[info._id]) {
      userPrefs.views[info._id] = { lastIndex: -1 };
    }
    let viewPrefs = userPrefs.views[info._id];
    let tips = toc.tips
      .sort((a, b) => a.index - b.index)
      .filter((a) => a.index > viewPrefs.lastIndex);
    if (tips.length > 0 && info.rev >= tips[0].minRev) {
      viewPrefs.lastIndex = tips[0].index;
      userPrefs.lastTip = Date.now();
      window.localStorage.setItem('tipsPreferences', JSON.stringify(userPrefs));
      UI.dialog(
        `
            <iframe frameBorder="0" width="100%" height="100%" 
            src="${tipsURL}${info._id}/${tips[0].name}">
        `,
        { width: 800, height: 600, title: 'Did you know ?' }
      );
    }
  }

  return {
    showTips
  };
});
