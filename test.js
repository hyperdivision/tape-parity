const test = require('.')

test('fund', async function (t) {
  const acc = await t.keygen()
  await t.fund(acc.address, 10000)

  t.equal(10000, parseInt(await t.eth.getBalance(acc.address)))

  const tx = await t.sign({
    from: acc.address,
    to: '0x0000000000000000000000000000000000000000',
    value: 10000
  }, acc.privateKey)

  console.log(await t.trace(tx))

  t.end()
})
