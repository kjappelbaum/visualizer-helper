const STATUS = [
  { code: 'started', label: 'Started', color: 'rgba(244,204,204,1)' },
  { code: 'finished', label: 'Finished', color: 'rgba(252,229,205,1)' },
  { code: 'worked-up', label: 'Worked up', color: 'rgba(255,242,204,1)' },
  { code: 'purified', label: 'Purified', color: 'rgba(217.234.211,1)' },
  { code: 'closed', label: 'Closed', color: 'rgba(206,224,227,1)' }
];

function getColor(statusCode) {
  for (let status of STATUS) {
    if (status.code === statusCode) {
      return status.color;
    }
  }
  return 'white';
}

function getLabel(statusCode) {
  for (let status of STATUS) {
    if (status.code === statusCode) {
      return status.label;
    }
  }
  return 'white';
}

function getForm(currentStatus) {
  return `
    <style>
        #status {
            zoom: 1.5;
        }
    </style>
    <div id='status'>
        <b>Please select the new status</b>
        <p>&nbsp;</p>
        <form>
            <select name="status">
                ${STATUS.map(
    (item, i) =>
      `<option value="${item.code}" ${
        item.code === currentStatus ? 'selected' : ''
      }>${item.label}</option>`
  )}
            </select>
            <input type="submit" value="Submit"/>
        </form>
    </div>
`;
}

module.exports = {
  STATUS,
  getColor,
  getLabel,
  getForm
};
