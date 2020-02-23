# express-js ![npm](https://img.shields.io/npm/v/@axioms/express-js?style=flat-square)
[Axioms](https://axioms.io) Javascript SDK for Express. Secure your Express APIs using Axioms authentication and authorization.


# Install
Install `express-js` to your web app.

```
npm i @axioms/express-js
```

# Basic usage

## Create an `.env` file in root
Add Axioms domain and resource audience.

```
AXIOMS_DOMAIN=<your-axioms-slug>.axioms.io
AXIOMS_AUDIENCE=<your-axioms-resource-identifier>
```

## Import `validToken` and configure
Create `checkToken.js` and add following,

```
const { validToken } = require("@axioms/express-js");

const checkToken = validToken({
    axiomsDomain: process.env.AXIOMS_DOMAIN,
    axiomsAud: process.env.AXIOMS_AUDIENCE
});
module.exports = checkToken;
```

## Check token and scope validity
In your Express routes Check token and scope validity.


**Scope** must be must be an array of strings representing the scopes assigned to resources.

For instance, to check `openid` and `profile` pass `['profile', 'openid']` as parameter in `validScope`.


```
const express = require('express');
const checkToken = require('../checkToken.js');
const { validScope } = require('@axioms/express-js');

const router = express.Router();

router.get('/', checkToken, validScope(['profile', 'openid']), (req, res) => {
    res.json({
        message: 'All good. You are authenticated!'
    });
});

module.exports = router;
```

For more details please check our [sample-node-express](https://github.com/axioms-io/sample-node-express).