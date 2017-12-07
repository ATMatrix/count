const BN = require('bignumber.js')
const fs = require('fs-extra')
const Web3 = require("web3")
const Tx = require('ethereumjs-tx');
const ethUtil = require('ethereumjs-util');
const rpc = require('node-json-rpc');
const Confirm = require('prompt-confirm');
const config = require('./config.json');
const abiArray = require('./ATN.json')

var options = {
  port: config.port,
  host: config.ip,
  path: '/rpc',
  strict: true
};

const agtAddr = config.agt;

var client = new rpc.Client(options);
var web3 = new Web3(new Web3.providers.HttpProvider("http://k3.andui.tech:8545"));

var privateKeyString = config.private_key;
var privateKey = new Buffer(privateKeyString, 'hex')

var address = '0x' + ethUtil.privateToAddress(privateKey).toString('hex');
console.log("The private key to address is: ", address);

var myAccount = web3.eth.accounts.privateKeyToAccount("0x" + privateKeyString);
console.log(myAccount);
web3.eth.accounts.wallet.add(myAccount);

async function run() {
  let int_nonce = await web3.eth.getTransactionCount(myAccount.address);
  console.log("The nonce is " + int_nonce);
  let balance = await web3.eth.getBalance(myAccount.address)
  console.log("The balance is " + balance);  
  if (balance <= 0) return;
  
  var rawTx = {
    gasPrice: ("0x" + gasprice_b.toString(16)),
    gasLimit: ("0x" + gasLimit_b.toString(16)),
    to: "0x8DBC20fAe8a51b035bE3F22162ce962cF4EC9C60",
    value: value16,
    nonce: _nonce,
    data: _data
  }

  const tx = new Tx(rawTx)
  tx.sign(privateKey)

  const serializedTx = tx.serialize()
  const hexSerializedTx = '0x' + serializedTx.toString('hex')

  web3.eth.sendSignedTransaction(hexSerializedTx, function (err, hash) {
    if (!err) {
      console.log("tx hash:", hash);
    } else {
      console.log("There is an error-------------------------------------");
      console.log(err);
    }
  }).on('receipt', console.log);

}