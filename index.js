const tape = require('tape')
const EventEmitter = require('events')

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
  const txObj = {
    nonce: await this.eth.getTransactionCount(address, 'pending'),
    gasPrice: '0x1',
    gas: '0x' + (8000000).toString(16),
    to,
    value: '0x' + (value).toString(16),
    data
  }
  const tx = signer.sign(txObj, privateKey, parseInt(await this.eth.chainId(), 16))
  const txHash = await this.eth.sendRawTransaction('0x' + tx.raw.toString('hex'))
  await this.mined(txHash)
}

Test.prototype.mined = async function mined (tx) {
  // eslint-disable-next-line
  return new Promise(async (resolve, reject) => {
    const unlisten = await this.eth.subscribe(this.eth.getTransactionReceipt(tx), function (err, res) {
      if (err) return

      unlisten()
      if (res.status === '0x1') return resolve()
      return reject(new Error())
    })
  })
}

module.exports = tape
