module.exports = function(requiredScopes, options) {

    if (!Array.isArray(requiredScopes)) {
        throw new Error(
            'Parameter requiredScopes must be an array of strings representing allowed scope or scopes.'
        );
    }

    return function(req, res, next) {
        if (req.auth_payload.scope) {
            const tokenScopes = req.auth_payload.scope.split(" ");
            var hasScope = false
            for (const scope of requiredScopes) {
                if (tokenScopes.includes(scope)) {
                    hasScope = true;
                }
            }
            if (hasScope) {
                next()
            } else {
                res.status(403).send({
                    "error": "insufficient_permission",
                    "error_description": "Insufficient role, scope or permission"
                })
            }
        } else {
            res.status(403).send({
                "error": "insufficient_permission",
                "error_description": "Insufficient role, scope or permission"
            })
        }
    }
}