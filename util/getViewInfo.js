define(['src/util/versioning'], function (Versioning) {
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

  return getViewInfo;
});
