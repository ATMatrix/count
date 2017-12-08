const fs = require('fs-extra')
const _ = require('lodash');
const BN = require('bignumber.js')

let snapshot = process.argv[2]

let heldfile = `./held--${snapshot}.json`
let holdfile = `./hold--${snapshot}.json`
let holdAccounts = objToStrMap(fs.readJsonSync(holdfile));
let heldAccounts = objToStrMap(fs.readJsonSync(heldfile));

let contributers = new Map();

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

console.log(holdAccounts.size);
console.log(heldAccounts.size);
console.log(holdAccounts.size + heldAccounts.size);

let amount = new BN(0);

heldAccounts.forEach( (value, key, map) => {
  map.set(key, "10");
  contributers.set(key, "10");
  amount = amount.plus("10");
})

holdAccounts.forEach( (value, key, map) => {
  let balance = (new BN(value)).div(1e+18);
  if(balance.comparedTo(1000) < 0) {
    balance = new BN(1000);
  }
  balance = balance.div(100).toFixed(18, 1); 
  balance = _.trimEnd(balance, '0');
  balance = _.trimEnd(balance, '.');
  map.set(key, balance);
  contributers.set(key, balance);  
  amount = amount.plus(balance);
})

console.log(amount.toString());

let Camount =  new BN(0);
contributers.forEach( (value, key, map) => {
  Camount = Camount.plus(new BN(value));
})

console.log(contributers.size);
console.log('contributers',Camount.toFixed(18, 1));

let heldcontributefile = `./held--${snapshot}--airdrop.json`
let holdcontributefile = `./hold--${snapshot}--airdrop.json`
let contributersfile = `./airdrop--${snapshot}.json`
fs.outputJsonSync(holdcontributefile, strMapToObj(holdAccounts));
fs.outputJsonSync(heldcontributefile, strMapToObj(heldAccounts));
fs.outputJsonSync(contributersfile, strMapToObj(contributers));


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