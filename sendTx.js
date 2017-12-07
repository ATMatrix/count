import contractUtil from '../../../util/contracts.js'
import config from '../../../util/config'
import Tx from 'ethereumjs-tx'
import rp from 'request-promise'

const {
  endpoint,
  gas,
  contracts,
} = config.blockchain

const methodDef = {
  approve: 'approve(address,uint256)',
  allowance: 'allowance(address,address)',
  callAI: 'callAI(bytes32,string)'
}

export default async (contract, method, params) => {
  const callData = contractUtil[contract][method].getData(...params)
  console.log('++++++++++++++++')
  console.log(contract)
  console.log(method)
  console.log(params)
  console.log('++++++++++++++++')

  const methodHash = contractUtil['web3'].sha3(methodDef[method])

  function hexParam(p) {
    let h = (typeof p === 'number')
      ? p.toString(16)
      : Buffer.from(p.toString(), 'utf8').toString("hex")
    h = '0x' + h
    while(h.length < 66) {
      h += '0'
    }
    return h
  }

  console.log('#############')
  console.log(callData)
  console.log(methodHash)
  params.forEach(p => console.log(hexParam(p)))
  console.log('#############')

  const privateKey = new Buffer('0d3b6ebd6e83c0341428983819b55a4ea717498c749e0055491c16361fc9bd61', 'hex')

  const rawTx = {
    nonce: 1048576,
    gasPrice:  0.02e13,
    gasLimit: gas,
    to: contracts[contract],
    data: callData,
  }

  const tx = new Tx(rawTx)
  tx.sign(privateKey)

  const serializedTx = tx.serialize()
  const hexSerializedTx = '0x' + serializedTx.toString('hex')

  const options = {
    uri: endpoint,
    method: 'POST',
    json: true,
    body: {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "eth_sendRawTransaction",
      "params": [hexSerializedTx]
    }
  }

  const res = await rp(options)
  return res.result
}
