let globalResolve;

doAll();

async function doAll() {
  const promise = () => {
    new Promise((resolve, reject) => {
      globalResolve = resolve;
    });
  };

  console.log('Waiting');

  await promise();
  console.log('DONE');

  console.log('Still waiting');

  globalResolve();
}
