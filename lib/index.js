//module.exports = require('./utils').Utils;
// module.exports = require('./identities');

// const conf = require('./conf');
// var utils = require('./utils');
var identities = require('./identities');
var http = require('./http');
/*const {
  method,
  request,
  SeedAuthResponseError,
  SeedAuthResult
} = require('./http');*/

 // module.exports = {
  /*conf,*/
  // utils : utils
  /*method,
  request,*/
  //identities : identities,
  /*SeedAuthResponseError,
  SeedAuthResult*/
 // };

module.exports = {
    // utils: utils,
    identities: identities,
    http: http
};
