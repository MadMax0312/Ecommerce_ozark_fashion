# Emerap RA :sunny:

[![Build Status](https://travis-ci.org/ra-js/ra.svg?branch=master)](https://travis-ci.org/ra-js/ra)

## Synopsis
Customizing Rest API builder

[![NPM](https://nodei.co/npm/ra.png)](https://nodei.co/npm/ra)

## API reference

### `call(req, res, [method])`

* `req`: **required** Instance of http.IncomingMessage
* `res`: **required** Instance of http.ServerResponse
* `method`: Method name, (default value from `req.params.method`)

Return object as Promise.

### `definition(obj)`

* `obj`: **required** Definition reference

```js
{
  name: 'methodName',
  args: {
    paramName: {
      dataType: 'dataTypeName',
    },
  },
  callback: (args) => {
    return promise or value
  }
}
```

### `datatype(obj)`

* `obj`: **required** Datatype reference

```js
{
  type: 'datatypeName',
  callback: (value) => {
    return promise or value
  }
}
```

## Quick start

Open terminal and run command

```
mkdir ra-test && cd ra-test && npm init -y && touch app.js && npm install express ra --save
```
Paste code into app.js and save changes

```js
const express = require('express');
const app = express();

const ra = require('ra');
const api = new ra();

api.datatype({
  type: 'fooBar',
  callback: (value) => {
    return `foo bar ${value}`;
  }
});

api.definition({
  name: 'ra.fooBar',
  args: {
    user: {
      dataType: 'fooBar',
    },
  },
  callback: (args) => {
    return Promise.resolve(args);
  }
});

app.all('/ra/method/:method', (req, res) => {
  api.call(req, res).then((response) => {
    res.status(response.code).json(response.data);
  });

});

app.listen(3000, () => {
  console.log('=====================================================');
  console.log('Starting app http://lvh.me:3000/ra/method/ra.version');
  console.log('=====================================================');
});
```
Start app in terminal
```
node app.js
```

© Alexander Pokhodyun (Karbunkul) 2017
