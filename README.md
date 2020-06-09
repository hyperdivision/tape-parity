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

### `const receipt = await t.mine(txHash)`

Await `txHash` to be mined and return the transaction receipt.

## Install

```sh
npm install tape-parity
```

## License

[ISC](LICENSE)
