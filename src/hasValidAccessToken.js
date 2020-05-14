const fetch_jwkset = require("./fetchJwkset.js");
const jws = require("jws");
const jwktopem = require("jwk-to-pem");

module.exports = function(config) {
    let cacheKeyTime;
    if (!config) {
        throw new ReferenceError("A config must be provided");
    }
    if (!config.axiomsDomain) {
        throw new ReferenceError("A axiomDomain must be provided");
    }
    if (!config.axiomsAud) {
        throw new ReferenceError("A axiomsAud must be provided");
    }
    try {
        cacheKeyTime = config.cacheKeyTime;
    } catch (error) {
        cacheKeyTime = 600000;
    }

    let jwksEndpoint = `https://${config.axiomsDomain}/oauth2/.well-known/jwks.json`;

    return async function(req, res, next) {
        try {
            req.axiomsDomain = config.axiomsDomain;
            var err;
            if (req.headers && req.headers.authorization) {
                var parts = req.headers.authorization.split(" ");
                if (parts.length == 2) {
                    var bearer = parts[0];
                    var token = parts[1];
                    var unverified = jws.decode(token);
                    var payload = JSON.parse(unverified.payload);
                    var audience = payload.aud
                    var alg;
                    var kid = unverified.header.kid;
                    var now = Math.floor(Date.now() / 1000);
                    if (bearer.toLowerCase() == "bearer" && (payload.hasOwnProperty('token_type')) && (payload.token_type.toLowerCase() == "bearer")) {
                        let keys;
                        try {
                            keys = await fetch_jwkset(jwksEndpoint, cacheKeyTime);
                        } catch (error) {
                            err = {
                                "error": "unauthorized_access",
                                "error_description": "Invalid access token."
                            };
                            res.header('WWW-Authenticate', `Bearer realm='${config.axiomsDomain}', error='${err.error}', error_description='${err.error_description}'`);
                            res.status(401).send(err);
                        }
                        try {
                            var key = keys.find(key => key.kid == kid);
                            alg = key.alg
                            var is_valid_token = jws.verify(token, alg, jwktopem(key));
                            if (!is_valid_token || !audience.includes(config.axiomsAud) || !(now < payload.exp)) {
                                err = {
                                    "error": "unauthorized_access",
                                    "error_description": "Invalid access token."
                                };
                                res.header('WWW-Authenticate', `Bearer realm='${config.axiomsDomain}', error='${err.error}', error_description='${err.error_description}'`);
                                res.status(401).send(err);
                            } else {
                                req.auth_payload = payload;
                                next();
                            }
                        } catch (error) {
                            err = {
                                "error": "unauthorized_access",
                                "error_description": "Invalid access token."
                            };
                            res.header('WWW-Authenticate', `Bearer realm='${config.axiomsDomain}', error='${err.error}', error_description='${err.error_description}'`);
                            res.status(401).send(err);
                        }
                    } else {
                        err = {
                            "error": "unauthorized_access",
                            "error_description": "Invalid authorization header. Required format: Bearer [AccessToken]"
                        };
                        res.header('WWW-Authenticate', `Bearer realm='${config.axiomsDomain}', error='${err.error}', error_description='${err.error_description}'`);
                        res.status(401).send(err);
                    }
                } else {
                    err = {
                        "error": "unauthorized_access",
                        "error_description": "Invalid authorization header. Required format: Bearer [AccessToken]"
                    };
                    res.header('WWW-Authenticate', `Bearer realm='${config.axiomsDomain}', error='${err.error}', error_description='${err.error_description}'`);
                    res.status(401).send(err);
                }
            } else {
                err = {
                    "error": "unauthorized_access",
                    "error_description": "Missing authorization header."
                };
                res.header('WWW-Authenticate', `Bearer realm='${config.axiomsDomain}', error='${err.error}', error_description='${err.error_description}'`);
                res.status(401).send(err);
            }
        } catch (error) {
            err = {
                "error": "unauthorized_access",
                "error_description": "Invalid authorization header or access token. Required format: Bearer [AccessToken]"
            };
            res.header('WWW-Authenticate', `Bearer realm='${config.axiomsDomain}', error='${err.error}', error_description='${err.error_description}'`);
            res.status(401).send(err);
        }
    };
};