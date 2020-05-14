module.exports = function(requiredPermissions, options) {

    if (!Array.isArray(requiredPermissions)) {
        throw new Error(
            'Parameter requiredPermissions must be an array of strings representing allowed role or permissions.'
        );
    }

    return function(req, res, next) {
        if (req.auth_payload.scope) {
            var tokenPermissions = [];
            try {
                tokenPermissions = req.auth_payload[`https://${req.axiomsDomain}/claims/permissions`]
            } catch (error) {
                tokenPermissions = [];
            }
            var hasPermission = false
            for (const role of requiredPermissions) {
                if (tokenPermissions.includes(role)) {
                    hasPermission = true;
                }
            }
            if (hasPermission) {
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