import { stratify } from 'd3-hierarchy';
import treeUtil from 'src/util/tree';
import _ from 'lodash';

// data should have id as first level property
// id should be an array that represents the hierarchy
export function getTree(data, options = { idProperty: 'id' }) {
  const { idProperty } = options;
  const getId = getIdFunction(idProperty);
  const getParentId = getParentIdFunction(idProperty);
  fillGaps(data, options);

  const strat = stratify()
    .id(getId)
    .parentId(getParentId);

  let tree = strat(data);
  tree.each(node => {
    node.index = _.property(node, idProperty);
  });
  return tree;
}

const defaultAnnotationOptions = { label: ['label'] };

// Creates tree and annotates it
export function getAnnotatedTree(
  data,
  annotations,
  annotationOptions = defaultAnnotationOptions,
  options = { idProperty: 'id' }
) {
  let { idProperty } = options;
  let tree = getTree(data, options);
  for (let key in annotations) {
    annotations[key] = DataObject.check(annotations[key], true);
  }

  tree.each(node => {
    node.index = _.get(node, idProperty);
  });

  tree = treeUtil.annotateTree(tree, annotations, annotationOptions);
  return tree;
}

function getIdFunction(idProperty) {
  return function getId(d) {
    const id = _.get(d, idProperty);
    return id.length === 0 ? '.' : id.join('.');
  };
}

function getParentIdFunction(idProperty) {
  const getId = getIdFunction(idProperty);
  return function getParentId(d) {
    let id = _.get(d, idProperty);
    if (id.length === 0) {
      return null;
    }
    id = id.slice();
    id.pop();
    return getId({ id });
  };
}
function getCreateParent(idProperty) {
  return function createParent(element) {
    let id = _.get(element, idProperty);
    const parent = {};
    const parentId = id.slice();
    parentId.pop();
    _.set(parent, idProperty, parentId);
    return parent;
  };
}

function fillGaps(data, options) {
  const { idProperty } = options;
  const getId = getIdFunction(idProperty);
  const getParentId = getParentIdFunction(idProperty);
  const createParent = getCreateParent(idProperty);
  const map = new Map();
  for (let element of data) {
    const id = getId(element);
    map.set(id, { data: element });
  }

  function fillParents(element) {
    const pid = getParentId(element);
    if (pid === null) return;
    const mapped = map.get(pid);
    if (!mapped) {
      const newElement = createParent(element);
      data.push(newElement);
      map.set(pid, { done: true, data: newElement });
      fillParents(newElement);
    } else if (!mapped.done) {
      mapped.done = true;
      fillParents(mapped.data);
    }
  }

  for (let element of data) {
    fillParents(element);
  }
}
