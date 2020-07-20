const tape = require('tape')
const assert = require('nanoassert')
const EventEmitter = require('events')
const helpers = require('eth-helpers')

const sodium = require('sodium-native')
const ethKeygen = require('eth-keygen')
const Test = tape.Test
const Result = require('tape/lib/results')

const signer = require('eth-sign')
const duplexify = require('duplexify')
const parity = require('./lib/parity')

const _createStream = Result.prototype.createStream
Result.prototype.createStream = function (...args) {
  const s = duplexify()

  parity(async (eth) => {
    Test.prototype.eth = eth
    var ts = _createStream.call(this, ...args)
    s.setReadable(ts)
    await Promise.race([EventEmitter.once(this, 'done'), EventEmitter.once(this, 'fail')])
  }).catch(e => s.destroy(e))

  return s
}

// pollute

// Parity fixed genesis user
const address = '0x00a329c0648769a73afac7f9381e08fb43dbea72'
const privateKey = Buffer.from('4d5db4107d237df6a3d58ee5f70ae63d73d7658d4026f2eefd2f204c81682cb7', 'hex')
Test.prototype.fund = async function fund (to, value, data) {
  assert(to != null, 'to must be given')
  assert(value != null, 'value must be given')

  const txHash = await this.send({
    from: address,
    to,
    value: value,
    gasPrice: 1,
    gas: 8000000n,
    data
  }, privateKey)

  return await this.mined(txHash)
}

Test.prototype.mined = async function mined (tx) {
  assert(tx != null, 'tx must be given')

  // eslint-disable-next-line
  return new Promise(async (resolve, reject) => {
    const unlisten = await this.eth.subscribe(this.eth.getTransactionReceipt(tx), function (err, res) {
      if (err) return

      unlisten()
      if (helpers.utils.parse.boolean(res.status) === true) return resolve(res)
      return reject(new Error(res))
    })
  })
}

Test.prototype.keygen = async function keygen (privateKey) {
  return ethKeygen(privateKey, helpers.utils.parse.number(await this.eth.chainId()))
}

Test.prototype.keygenSeed = async function keygenSeed (seed) {
  assert(seed != null, 'seed must be given')

  const privateKey = Buffer.alloc(32)
  sodium.crypto_generichash(privateKey, Buffer.from(seed))

  return ethKeygen(privateKey, helpers.utils.parse.number(await this.eth.chainId()))
}

Test.prototype.sign = async function sign ({
  from,
  to,
  value = 0,
  data,
  gas = 8e6,
  gasPrice = 1,
  nonce
}, privateKey) {
  assert(privateKey != null, 'privateKey must be given')

  return signer.sign({
    from: from == null ? undefined : helpers.utils.format(from),
    to: to == null ? undefined : helpers.utils.format(to),
    value: value == null ? undefined : helpers.utils.format(value),
    data: data == null ? undefined : helpers.utils.format(data),
    gas: helpers.utils.format(gas),
    gasPrice: helpers.utils.format(gasPrice),
    nonce: nonce != null ? helpers.utils.format(nonce) : await this.eth.getTransactionCount(helpers.utils.format(from), 'pending')
  }, privateKey, helpers.utils.parse.number(await this.eth.chainId()))
}

Test.prototype.send = async function send (txObj, privateKey) {
  const tx = await this.sign(txObj, privateKey)

  return this.eth.sendRawTransaction(helpers.utils.format(tx.raw))
}

Test.prototype.trace = async function trace (tx, opts = ['trace', 'vmTrace', 'stateDiff']) {
  assert(tx != null, 'tx must be given')
  assert(tx.raw != null, 'tx.raw missing')

  return await this.eth.rpc.request('trace_rawTransaction', [
    helpers.utils.format(tx.raw), opts
  ])
}

module.exports = tape
