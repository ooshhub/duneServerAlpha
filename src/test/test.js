const int = setInterval(() => {
  console.log('blah');
}, 0);

let counter = 0;


const int2 = setInterval(async () => {
  console.log(counter += 1);
}, 0);

setTimeout(async () => {
  const p = () => new Promise(res => res('promise'));
  console.log(await p());
}, 0);


