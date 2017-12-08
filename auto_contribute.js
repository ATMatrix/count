const BN = require('bignumber.js')
const fs = require('fs-extra')
const Web3 = require("web3")
const Tx = require('ethereumjs-tx');
const ethUtil = require('ethereumjs-util');
const Confirm = require('prompt-confirm');
const config = require('./config.json');
const abiArray = require('./AGT.json')

async function run() {

  let todofile = `./todo.json`
  let donefile = `./done.json`
  let todos = objToStrMap(fs.readJsonSync(todofile));
  let dones = objToStrMap(fs.readJsonSync(donefile));

  var web3 = new Web3(new Web3.providers.HttpProvider(config.endpoint));
  var privateKeyString = config.private_key;
  var myAccount = web3.eth.accounts.privateKeyToAccount("0x" + privateKeyString);
  var owner = myAccount.address;
  console.log(myAccount);
  web3.eth.accounts.wallet.add(myAccount);
  let balance = await web3.eth.getBalance(owner)
  console.log(`Address ${owner} balance is  ${balance}`);
  if (balance <= 0) return;

  const agt = new web3.eth.Contract(abiArray, config.agt);
  const tokenBalance = await agt.methods.balanceOf(owner).call();
  console.log(`Address ${owner} tokenBalance is ${tokenBalance}`);
  if (tokenBalance == 0) return;

  const _to = '0xF6074de3a0dAE1710C0BCe11C56Bac0f413fe44D';
  const tokenBalance2 = await agt.methods.balanceOf(_to).call();
  console.log(`Address ${_to} tokenBalance is ${tokenBalance2}`);

  let i = 0;
  for (let [key, value] of todos) {
    if(i >= 10) break;
    console.log(key)
    console.log(value)
    let tx = {};
    tx.address = key;
    const todoBalance = await agt.methods.balanceOf(key).call();
    tx.balance = todoBalance;
    if (dones.has(key) || todoBalance > 0) {
      todos.delete(key);
      todos.set(key, tx);
      console.log(`${key} has been done, move to dones`);
      continue;
    }
    let receipt = await agt.methods['transfer(address,uint256)'](_to, 1)
      .send({
        from: owner,
        gasPrice: 60000000000,
        gas: 90000
      }, (err, hash) => {
        if (err) console.error(err);
        console.log(`hash: ${hash}`)
        tx.hash = hash;
      })
    console.log(`${key} receipt : ${receipt}`);
    tx.receipt = receipt;
    const doneBalance = await agt.methods.balanceOf(key).call();
    tx.balance = doneBalance;
    todos.delete(key);
    dones.set(key, tx);
    i++;
  }

  fs.outputJsonSync(todofile, strMapToObj(todos));
  fs.outputJsonSync(donefile, strMapToObj(dones));

}

run()

function objToStrMap(obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
}

function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k, v] of strMap) {
    obj[k] = v;
  }
  return obj;
}