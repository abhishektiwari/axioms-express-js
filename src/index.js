const hasValidAccessToken = require("./hasValidAccessToken.js");
const hasRequiredScopes = require('./hasRequiredScopes.js');
const hasRequiredRoles = require('./hasRequiredRoles.js');
const hasRequiredPermissions = require('./hasRequiredPermissions.js');

module.exports = {
    hasValidAccessToken,
    hasRequiredScopes,
    hasRequiredRoles,
    hasRequiredPermissions
}