const test = require('.')

test('fund', async function (t) {
  await t.fund('0xd27E44f7F4118DB2c7812A363f5B76859c20e0b3', 10000)

  t.equal(10000, parseInt(await t.eth.getBalance('0xd27E44f7F4118DB2c7812A363f5B76859c20e0b3')))
  t.end()
})
