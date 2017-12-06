const fs = require('fs-extra')

let snapshot = process.argv[2]
console.log(snapshot);

let heldfile = `./held--${snapshot}.json`
let holdfile = `./hold--${snapshot}.json`
let holdAccounts = objToStrMap(fs.readJsonSync(holdfile));
let heldAccounts = objToStrMap(fs.readJsonSync(heldfile));

holdAccounts.delete("0xe11bd1032fe0d7343e8de21f92f050ae8462a7d7");
holdAccounts.delete("0x00000000000000000000000000000000000000b1");
holdAccounts.delete("0x00000000000000000000000000000000000000b2");
holdAccounts.delete("0x8c161e726e783760f5ab709fcd0d07c74cbce59a");
holdAccounts.delete("0x0000000000000000000000000000000000000000");

heldAccounts.delete("0xe11bd1032fe0d7343e8de21f92f050ae8462a7d7");
heldAccounts.delete("0x00000000000000000000000000000000000000b1");
heldAccounts.delete("0x00000000000000000000000000000000000000b2");
heldAccounts.delete("0x8c161e726e783760f5ab709fcd0d07c74cbce59a");
heldAccounts.delete("0x0000000000000000000000000000000000000000");

heldAccounts.forEach( (value, key, map) => {
  map.set(key, 10);
})

holdAccounts.forEach( (value, key, map) => {
  map.set(key, value*0.01);
})

let heldcontributefile = `./held--${snapshot}--contribute.json`
let holdcontributefile = `./hold--${snapshot}--contribute.json`
fs.outputJsonSync(holdcontributefile, strMapToObj(holdAccounts));
fs.outputJsonSync(heldcontributefile, strMapToObj(heldAccounts));



function objToStrMap(obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
      strMap.set(k, obj[k]);
  }
  return strMap;
}

function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k,v] of strMap) {
      obj[k] = v;
  }
  return obj;
}