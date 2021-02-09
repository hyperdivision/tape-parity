const Parity = require('openethereum-spawn')
const Nanoeth = require('nanoeth/ipc')
const fs = require('fs').promises
const path = require('path')
const os = require('os')

module.exports = async function (fn) {
  const p = new Parity({
    port: '39393',
    parityExec: require('openethereum-binary'),
    basePath: await fs.mkdtemp(path.join(os.tmpdir(), 'tape-parity-')),
    light: false,
    ipc: true,
    ws: false,
    jsonrpc: false,
    chain: 'dev',
    apis: ['eth', 'parity_pubsub', 'traces'],
    argv: ['--reseal-min-period', '0', '--min-gas-price', '0']
  })

  process.once('SIGINT', stop)
  process.once('SIGTERM', stop)
  process.once('uncaughtException', stop)
  process.once('unhandledRejection', stop)

  p.on('log', function (data) {
    // console.log('[parity]', data)
  })

  await p.started
  const eth = new Nanoeth(p.ipcPath)

  await fn(eth)

  await stop()

  async function stop (ex) {
    if (ex) console.log(ex)
    // console.log('[parity] Stopping')
    p.kill()
    await p.stopped
    // console.log('[parity] stopped')
  }
}
