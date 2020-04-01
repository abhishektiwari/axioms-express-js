const cache = require("memory-cache");
const axios = require("axios");
const https = require('https');

module.exports = async function(jwksEndpoint, cacheKeyTime = 300000) {
    let is_cached = cache.get(jwksEndpoint);
    let keys;
    if (is_cached) {
        return is_cached;
    }
    try {
        let response = await axios.get(jwksEndpoint, {
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        });
        keys = response.data.keys;
        if (!keys || !keys.length) {
            throw new Error("No public keys to verify token");
        }
        cache.put(jwksEndpoint, keys, cacheKeyTime)
    } catch (error) {
        throw error;
    }
    return keys;
}