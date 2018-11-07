import API from 'src/util/api';
import Versioning from 'src/util/versioning';

let lastOptions = {
  group: 'all'
};

/**
 * Retrieve, filter and sort the TOC
 * @param {object} [options={}]
 * @param {string} [options.group='mine'] Group to retrieve products. mine, all of a specific group name
 * @param {Array} [options.groups] List of groups, this value is replace by options.group if not defined
 * @param {string} [options.varName='queryResult']
 * @param {function} [options.sort] Callback, by default sort by reverse date
 * @param {function} [options.filter] Callback to filter the result
 */

export async function refreshSampleToc(roc, options = {}) {
  lastOptions = Object.assign(lastOptions, options);
  let { group } = lastOptions;

  if (!lastOptions.groups) {
    if (group === 'mine') {
      lastOptions.mine = 1;
    } else if (group !== 'all') {
      lastOptions.groups = group;
    }
  }

  if (!lastOptions.sort) {
    lastOptions.sort = function (a, b) {
      if (a.value.modificationDate > b.value.modificationDate) {
        return -1;
      } else if (a.value.modificationDate < b.value.modificationDate) {
        return 1;
      } else {
        return 0;
      }
    };
  }

  return roc.query('sample_toc', lastOptions);
}

/**
 * Retrieve the allowed groups for the logged in user and create 'groupForm' variable and 'groupFormSchema' (for onde module).
 * It will keep in a cookie the last selected group.
 * Calling this method should reload automatically the TOC
 * @param {*} roc
 * @param {object} [options={}]
 * @param {string} [varName='groupForm'] contains the name of the variable containing the form value
 * @param {string} [schemaVarName='groupFormSchema'] contains the name of the variable containing the form schema
 * @param {string} [cookieName='eln-default-sample-group''] cookie name containing the last selected group
 * @return {string} the form to select group}
 */
export async function initializeGroupForm(roc, options = {}) {
  const {
    schemaVarName = 'groupFormSchema',
    varName = 'groupForm',
    cookieName = 'eln-default-sample-group'
  } = options;
  let groups = await roc.getGroups();
  var possibleGroups = ['all', 'mine'].concat(groups);
  var defaultGroup = localStorage.getItem(cookieName);
  if (possibleGroups.indexOf(defaultGroup) === -1) {
    defaultGroup = 'all';
  }
  var schema = {
    type: 'object',
    properties: {
      group: {
        type: 'string',
        enum: possibleGroups,
        default: defaultGroup,
        required: true
      }
    }
  };
  API.createData(schemaVarName, schema);

  let groupForm = await API.createData(varName, {
    group: defaultGroup
  });

  let mainData = Versioning.getData();
  mainData.onChange((evt) => {
    if (evt.jpath[0] === varName) {
      localStorage.setItem(cookieName, groupForm.group);
      refreshSampleToc();
    }
  });
  return groupForm;
}
