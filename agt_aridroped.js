const rp = require('request-promise')
const fs = require('fs-extra')

const opts3 = {
  uri: 'https://api.etherscan.io/api',
  qs: {
    module: 'proxy',
    action: 'eth_blockNumber',
    apikey: '8AYWYXWWJIU9RRKG6GKHCBNEW3D92D9VF8',
  },
  json: true,
}

async function fetchLogs(opts) {
  let res = await rp.get(opts);
  return res.result;
}

async function count() {
  let snapshot = Number.parseInt(await fetchLogs(opts3));
  console.log(snapshot)

  let holders = objToStrMap(fs.readJsonSync('./airdrop--4684388.json'));
  
  let promises = [];
  for (let [key, value] of holders) {
    opts = {
      uri: 'https://api.etherscan.io/api',
      qs: {
        module: 'account',
        action: 'tokenbalance',
        contractaddress: '0xed1eba8b87cd7e04e9389f65f7aeca750c85a010',
        address: key,
        tag: snapshot,
        apikey: '8AYWYXWWJIU9RRKG6GKHCBNEW3D92D9VF8',
      },
      json: true,
    }

    // promises.push(fetchLogs(opts));
    let balance = await fetchLogs(opts);
    console.log(`account:${key},balance:${balance}`)
    holders.set(key, balance);

  }

  console.log("=================")
  console.log("holders:", holders.size);
  
  let holdfile = `./hold-AGT-${snapshot}.json`
  fs.outputJsonSync(holdfile, strMapToObj(holders));

  // Promise.all(promises).then(values => {
  //   let addresses = Array.from(accounts);
  //   console.log(addresses.length+'--'+values.length);
  //   for (let i=0;i<addresses.length;i++) {
  //     console.log(`account:${addresses[i]},balance:${values[i]}`)

  //       holders.set(addresses[i], values[i]);
  //   }
  //   console.log("=================")
  //   console.log("holders:", holders.size);
    
  //   let holdfile = `./hold-AGT-${snapshot}.json`
  //   fs.outputJsonSync(holdfile, strMapToObj(holders));
  // })
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