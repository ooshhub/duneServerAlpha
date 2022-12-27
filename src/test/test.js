import { NodeFileManager } from "../server/io/NodeFileManager.js";

const fileManager = new NodeFileManager({ name: 'testy', basePath: './src/test' });

const file = 'test2.txt';

(async () => {
  fileManager.readLocalFile(file)
    .then(response => console.log(response))
    .catch(() => console.log('err'));
  fileManager.writeLocalFile(file, 'fuck you')
    .then(response => console.log(response))
    .catch(() => console.log('err'));  
  fileManager.readLocalFile(file)
    .then(response => console.log(response))
    .catch(() => console.log('err'));  
  fileManager.writeLocalFile(file, 'still a cunt')
    .then(response => console.log(response))
    .catch(() => console.log('err'));
  fileManager.readLocalFile(file)
    .then(response => console.log(response))
    .catch(() => console.log('err'));
})();