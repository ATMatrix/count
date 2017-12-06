const rp = require('request-promise')
const fs = require('fs-extra')

let accounts = new Set();
let heldAccounts = new Map();
let holdAccounts = new Map();

let contractDeploy = 4165158;
let fromBlock = 4173157
let toBlock = 4173157
// let toBlock = 'latest'

const opts1 = {
  uri: 'https://api.etherscan.io/api',
  qs: {
    module: 'logs',
    action: 'getLogs',
    fromBlock,
    toBlock,
    address: '0x887834d3b8d450b6bab109c252df3da286d73ce4',
    topic0: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    apikey: 'DTXTXHA7MVZNP4EJBR3IF2IRAFBAETYPJY',
  },
  json: true,
}

const opts2 = {
  uri: 'https://api.etherscan.io/api',
  qs: {
    module: 'block',
    action: 'getblockreward',
    blockno: '4378560',
    apikey: 'DTXTXHA7MVZNP4EJBR3IF2IRAFBAETYPJY',
  },
  json: true,
}

const opts3 = {
  uri: 'https://api.etherscan.io/api',
  qs: {
    module: 'proxy',
    action: 'eth_blockNumber',
    apikey: 'DTXTXHA7MVZNP4EJBR3IF2IRAFBAETYPJY',
  },
  json: true,
}

async function fetchLogs(opts) {
  let res = await rp.get(opts);
  return res.result;
}

async function count() {
  let snapshot = Number.parseInt(await fetchLogs(opts3));
  let interval = 100;
  let opts;
  while (fromBlock < snapshot) {
    if (fromBlock >= 4174357 && fromBlock < 4244357) {
      interval = 10000;
    }
    if ( fromBlock >= 4244357 ) {
      interval = 500;
    }
    if (fromBlock >= 4259357) {
      interval = 100000;
    }
    toBlock += interval
    if (toBlock > snapshot) {
      toBlock = snapshot
    }
    opts = {
      uri: 'https://api.etherscan.io/api',
      qs: {
        module: 'logs',
        action: 'getLogs',
        fromBlock,
        toBlock,
        address: '0x887834d3b8d450b6bab109c252df3da286d73ce4',
        topic0: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        apikey: 'DTXTXHA7MVZNP4EJBR3IF2IRAFBAETYPJY',
      },
      json: true,
    }
    console.log(`Block:${fromBlock}--${toBlock}`);
    let logs = Array.from(await fetchLogs(opts))
    console.log("logs.length:", logs.length);
    if (logs.length >= 1000) {
      throw 'logs loss';
    }
    logs.forEach(log => {
      accounts.add(xAddress(log.topics[1]))
      accounts.add(xAddress(log.topics[2]))
    })
    console.log("accounts.size:", accounts.size)
    fromBlock += interval
  }

  fs.outputFileSync('./accounts.json', Array.from(accounts));

  for (let address of accounts) {
    opts = {
      uri: 'https://api.etherscan.io/api',
      qs: {
        module: 'account',
        action: 'tokenbalance',
        contractaddress: '0x887834d3b8d450b6bab109c252df3da286d73ce4',
        address,
        tag: snapshot,
        apikey: 'DTXTXHA7MVZNP4EJBR3IF2IRAFBAETYPJY',
      },
      json: true,
    }

    let balance = await fetchLogs(opts);
    console.log(`account:${address},balance:${balance}`)
    if (balance > 0) {
      holdAccounts.set(address, balance);
    } else {
      heldAccounts.set(address, balance);
    }

  }

  console.log("=================")
  console.log("accout:", accounts.size);
  console.log("holders:", holdAccounts.size);
  console.log("balanceAcount:", holdAccounts.size + heldAccounts.size);
  
  let heldfile = `./held--${snapshot}.json`
  let holdfile = `./hold--${snapshot}.json`
  fs.outputJsonSync(holdfile, strMapToObj(holdAccounts));
  fs.outputJsonSync(heldfile, strMapToObj(heldAccounts));
}

function xAddress(a) {
  return '0x' + a.slice(-40)
}

function bulkObj2csv(objs, fields) {
  const header = fields.join(',')
  const rows = [header]
  objs.forEach((obj) => {
    const row = fields
      .map(f => obj[f])
      .join(',')
    rows.push(row)
  })
}

function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k,v] of strMap) {
      obj[k] = v;
  }
  return obj;
}
function objToStrMap(obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
      strMap.set(k, obj[k]);
  }
  return strMap;
}

count()