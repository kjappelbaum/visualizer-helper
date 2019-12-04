let globalResolve;

async function doAll()

const promise = new Promise((resolve, reject) => {
  globalResolve = resolve;
});

console.log('Waiting');

promise.then(() => {
  console.log('DONE');
});

console.log('Still waiting');

globalResolve();
