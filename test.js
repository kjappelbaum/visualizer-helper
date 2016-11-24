define([], async function () {
  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  console.log(1);
  await sleep()
  console.log(2);
})
