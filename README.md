# `tape-parity`

[![Build Status](https://travis-ci.org/hyperdivision/tape-parity.svg?branch=master)](https://travis-ci.org/hyperdivision/tape-parity)

> Tape extension that adds a Parity dev chain and Nanoeth helpers

## Usage

```js
var test = require('tape-parity')

test('fund', async function (t) {
  await t.fund('0xd27E44f7F4118DB2c7812A363f5B76859c20e0b3', 10000)

  console.log(parseInt(await t.eth.getBalance('0xd27E44f7F4118DB2c7812A363f5B76859c20e0b3')))
})
```

## API

A fresh Parity dev chain will created before each test and closed after all
tests finish.

### `test([description], async t => {})`

Create a new `test` just like in tape. `t` is extended with extra methods
specified below:

### `t.eth`

This is a [`nanoeth`](https://github.com/hyperdivision/nanoeth) instance
connected to the Parity dev chain.

### `await t.fund(address, value, [data])`

Fund `address` with `value` wei and optional `data`. Await the transaction to be
mined. `value` can be `Number`, `BigInt` or hex encoded string.

### `const receipt = await t.mined(txHash)`

Await `txHash` to be mined and return the transaction receipt.

### `const account = await t.keygen([privateKey])`

Generate a new account of `{ publicKey, privateKey, address }`.
Uses the current `chainId`.

### `const account = await t.keygenSeed(seed)`

Generate a new account of `{ publicKey, privateKey, address }` from a seed,
which can be either a `Buffer` or `string`. Useful for deterministic tests and
debugging traces.
Uses the current `chainId`.

### `const txHash = await t.send({ from, to, data, nonce, value = 0, gasPrice = 1, gas = 8e6 }, privateKey)`

Sign and send a new transaction with the above parameters. Note the `privateKey`
at the end required for signing.

Examples:

* To deploy a contract, send with `{ from, data }`.
* To transfer funds, send with `{ to, value }`.
* To call a smart contract, send with `{ to, data }`.

### `const json = await t.trace(rawTx, [opts])`

Trace a raw transaction, returning the various diagnostics. `opts` defaults to
`['trace', 'vmTrace', 'stateDiff']`. Requires that parity has been started with
the `tracing` module enabled. The output is a JSON object, and can be stringified
and persisted to disk for further analysis.


## Install

```sh
npm install tape-parity
```

## License

[ISC](LICENSE)
