# Express Request Logger

A simple request/response log middleware (with body and headers) for express.

## Install

`npm i express-request-logger --save`

## Using

```javascript

    const requestLogger = require('express-request-logger');
    
    app.use(requestLogger({
        logger: myBunyanLogger.debug.bind(myBunyanLogger),
        hide: ['password', 'secret']
    }));

```

## Parameters

- logger - Function tha will save the log. Default is console.log function
- hide - Array with properts that can not appear in the log. Default is ['password', 'senha', 'secret']

## Example of output

```
REQUEST [129887cf-32f2-4f2a-900f-9c3d056cd2c8] [POST /login] [Object {
  "body": Object {
    "username": "username"
    "password": "*****",
  },
  "headers": Object {
    "accept": "*/*",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4,es;q=0.2",
    "cache-control": "no-cache",
    "connection": "keep-alive",
    "content-length": "24",
    "content-type": "application/json",
    "host": "localhost:3000",
    "origin": "chrome-extension://fhbjgbiflinjbdggehcddcbncdddomop",
    "postman-token": "04a4070e-5d12-0812-f9fb-474f2f91b7e7",
    "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
  },
}]

RESPONSE [200] para [129887cf-32f2-4f2a-900f-9c3d056cd2c8] [POST /login] [Arguments [ "Ok, its done!" ]] em 52.60 ms

```