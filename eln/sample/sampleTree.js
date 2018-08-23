import d3 from 'd3-hierarchy';
import treeUtil from 'src/util/tree';

// data should have id as first level property
// id should be an array that represents the hierarchy
export function getTree(data) {
  fillGaps(data);

  const stratify = d3
    .stratify()
    .id(getId)
    .parentId(getParentId);

  let tree = stratify(data);
  return tree;
}

const defaultAnnotationOptions = { label: ['label'] };

// Creates tree and annotates it
export function getAnnotatedTree(
  data,
  annotations,
  annotationOptions = defaultAnnotationOptions
) {
  let tree = getTree(data);
  for (let key in annotations) {
    annotations[key] = DataObject.check(annotations[key], true);
  }

  tree.each(node => {
    node.index = node.id;
  });

  tree = treeUtil.annotateTree(tree, annotations, annotationOptions);
  return tree;
}

function getId(d) {
  return d.id.length === 0 ? '.' : d.id.join('.');
}

function getParentId(d) {
  let id = d.id;
  if (id.length === 0) {
    return null;
  }
  id = id.slice();
  id.pop();
  return getId({ id });
}

function createParent(element) {
  const parentId = element.id.slice();
  parentId.pop();
  return {
    id: parentId
  };
}

function fillGaps(data) {
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
