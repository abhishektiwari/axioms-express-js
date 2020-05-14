module.exports = function(requiredRoles, options) {

    if (!Array.isArray(requiredRoles)) {
        throw new Error(
            'Parameter requiredRoles must be an array of strings representing allowed role or roles.'
        );
    }

    return function(req, res, next) {
        if (req.auth_payload.scope) {
            var tokenRoles = [];
            try {
                tokenRoles = req.auth_payload[`https://${req.axiomsDomain}/claims/roles`]
            } catch (error) {
                tokenRoles = [];
            }
            var hasRole = false
            for (const role of requiredRoles) {
                if (tokenRoles.includes(role)) {
                    hasRole = true;
                }
            }
            if (hasRole) {
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