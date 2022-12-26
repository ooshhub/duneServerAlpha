import { readFile } from "fs/promises";


const getFile = async(path) => {
  return readFile(path, { encoding: 'utf-8' })/* .then(response => {
    // return response;
  }) */.catch(err => {
    return new Error(err.message);
  }).finally(() => console.log('fin'));
}

getFile('./src/test/test.txt').then(response => console.log(response));
