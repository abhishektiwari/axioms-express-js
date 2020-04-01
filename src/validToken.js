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
        cacheKeyTime = 300000;
    }

    let jwksEndpoint = `https://${config.axiomsDomain}/oauth2/.well-known/jwks.json`;

    return async function(req, res, next) {
        try {
            if (req.headers && req.headers.authorization) {
                var parts = req.headers.authorization.split(" ");
                if (parts.length == 2) {
                    var bearer = parts[0];
                    var token = parts[1];
                    var unverified = jws.decode(token);
                    var payload = JSON.parse(unverified.payload);
                    var audience = payload.aud
                    var alg = unverified.header.alg;
                    var kid = unverified.header.kid;
                    var now = Math.floor(Date.now() / 1000);
                    if (bearer.toLowerCase() == "bearer" && (payload.hasOwnProperty('token_type')) && (payload.token_type.toLowerCase() == "bearer")) {
                        let keys;
                        try {
                            keys = await fetch_jwkset(jwksEndpoint, cacheKeyTime);
                        } catch (error) {
                            console.error(error)
                            res.status(401).send({ "error": "Unauthorized access", "description": "Token validation failed. Key not found." });
                        }
                        var key = keys.find(key => key.kty === "RSA" && key.kid == kid);
                        var is_valid_token = jws.verify(token, alg, jwktopem(key));
                        if (!is_valid_token || !audience.includes(config.axiomsAud) || !(now < payload.exp)) {
                            res.status(401).send({ "error": "Unauthorized access", "description": "Invalid access token." });
                        } else {
                            req.auth_payload = payload;
                            next();
                        }
                    } else {
                        res.status(401).send({ "error": "Unauthorized access", "description": "Invalid authorization header or access token, required format: Bearer [AccessToken]" });
                    }
                } else {
                    res.status(401).send({ "error": "Unauthorized access", "description": "Invalid authorization header or access token, required format: Bearer [AccessToken]" });
                }
            } else {
                res.status(401).send({ "error": "Unauthorized access", "description": "Missing authorization header" });
            }
        } catch (error) {
            res.status(401).send({ "error": "Unauthorized access", "description": "Invalid authorization header or access token, required format: Bearer [AccessToken]" });
        }
    };
};