const request = require('request');
const cache = require("memory-cache");

module.exports = async function(options) {
    return new Promise((resolve, reject) => {
        var is_cached = cache.get(options.uri);
        if (is_cached) {
            resolve(is_cached);
        }
        request(options, function(err, res, body) {
            if (err) reject(err);
            else {
                cache.put(options.uri, body.keys, 300000)
                resolve(body.keys);
            }
        });
    });
}