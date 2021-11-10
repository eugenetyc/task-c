const AccessControl = require("accesscontrol");
const ac = new AccessControl();

// note that these granted roles are later used in the app.js
// to give permissions, and so "basic" users can only do things that are
// auth.checkAccess('readOwn', 'profile) and auth.checkAccess('updateOwn', 'profile),
// and likewise for "premium" users
exports.roles = (function () {
  ac.grant("basic").readOwn("profile");

  ac.grant("premium")
    .extend("basic")
    .readAny("profile")
    .updateAny("profile")
    .deleteAny("profile");
  return ac;
})();
