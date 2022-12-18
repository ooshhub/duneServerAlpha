// class Tester {

//   constructor() {
//     this.name ='stuff';
//     this.prop = { things: 'what' };
//   }

//   doStuff() {
//     console.log('blah');
//   }

//   destroy(target) {
//     destroyer(target);
//   }

// }

// const destroyer = async (target) => {
//   console.log(target);
//   target.value = 123;
//   return target;
// }

// const test = new Tester();

// test.doStuff()

// await destroyer({ value: test }).then(resp => {
//   console.log(resp);
//   console.log(test);
//   console.log('sdfgdf');
// })

// setTimeout(() => {
//   console.log(test)
// }, 2000);

const filterInPlace = (inputArray, predicateFunction) => {
  for (let i = inputArray.length; i > 0; i--) {
    if (!predicateFunction(inputArray[i-1], i-1)) inputArray.splice(i-1, 1);
  }
}

const arr = [ 1,2,3,4,5,6 ];

console.log(arr.reduce((out, v) => out += v));

const now = Date.now();

console.log(typeof(now));