import API from 'src/util/api';
import Versioning from 'src/util/versioning';

let defaultOptions = {
  group: 'all'
};

class SampleToc {
  /**
   * Create an object managing the Toc
   * @param {object} [options={}]
   * @param {object} [roc=undefined]
   * @param {string} [options.group='mine'] Group to retrieve products. mine, all of a specific group name
   * @param {string} [options.varName='sampleToc']
   * @param {function} [options.sort] Callback, by default sort by reverse date
   * @param {function} [options.filter] Callback to filter the result
   */
  constructor(roc, options = {}) {
    this.roc = roc;
    this.options = Object.assign({}, defaultOptions, options);

    if (!this.options.varName) {
      this.options.varName = 'sampleToc';
    }

    if (!this.options.sort) {
      this.options.sort = function (a, b) {
        if (a.value.modificationDate > b.value.modificationDate) {
          return -1;
        } else if (a.value.modificationDate < b.value.modificationDate) {
          return 1;
        } else {
          return 0;
        }
      };
    }
  }

  /**
   * Retrieve the sample_toc and put the result in `sampleToc` variable
   */
  refresh(options = {}) {
    let {
      group, sort, filter
    } = Object.assign({}, this.options, options);
    let mine = 0;
    let groups = '';

    if (group === 'mine') {
      mine = 1;
    } else if (group !== 'all') {
      groups = group;
    }

    return this.roc.query('sample_toc', {
      groups,
      mine,
      sort,
      filter,
      varName: this.options.varName
    });
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
  async initializeGroupForm(options = {}) {
    const {
      schemaVarName = 'groupFormSchema',
      varName = 'groupForm',
      cookieName = 'eln-default-sample-group'
    } = options;

    let groups = (await this.roc.getGroupMembership()).map((g) => g.name);
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

    this.options.group = groupForm.group;
    await this.refresh();

    let mainData = Versioning.getData();
    mainData.onChange((evt) => {
      if (evt.jpath[0] === varName) {
        localStorage.setItem(cookieName, groupForm.group);
        this.options.group = String(groupForm.group);
        this.refresh();
      }
    });

    return groupForm;
  }
}

module.exports = SampleToc;
