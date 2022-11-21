class Tester {

  constructor() {
    this.name ='stuff';
    this.prop = { things: 'what' };
  }

  doStuff() {
    console.log('blah');
  }

  destroy(target) {
    destroyer(target);
  }

}

const destroyer = async (target) => {
  console.log(target);
  target.value = 123;
  return target;
}

const test = new Tester();

test.doStuff()

await destroyer({ value: test }).then(resp => {
  console.log(resp);
  console.log(test);
  console.log('sdfgdf');
})

setTimeout(() => {
  console.log(test)
}, 2000);