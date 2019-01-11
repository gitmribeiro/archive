import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as replaceStream from 'replacestream';

var rstream = fs.createReadStream('D:/workspaces/nodejs/wtt-archive/server2/data/plans/89c24f87-2ebb-4932-b4c6-abc9bf251f27/snapshots/1.txt');
var wstream = fs.createWriteStream('D:/workspaces/nodejs/wtt-archive/server2/data/plans/89c24f87-2ebb-4932-b4c6-abc9bf251f27/snapshots/1.txt');

rstream
.pipe(replaceStream('Linha', 'OK'))
.on('data', (chunk: string) => {
    console.log(chunk.toString());
    return 'OK';
})
.pipe(wstream)
.on('finish', function () {
    console.log('done!');
});


// const rl = readline.createInterface({
//     input: rstream,
//     terminal: false,
//     historySize: 0
// });

// rl.on('line', async (line: string) => {
//     console.log(line);
//     rl.write('TESTE');
// });

// rl.on('error', (err) => {
//     console.log('Error:', err);
// });

// rl.on('close', async () => {
//     console.log('Closed!');
// });