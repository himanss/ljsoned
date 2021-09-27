const main = require('./mod.js');
main.vmGlobal.systemGlobal = global //danger: debug mode is not for production!
require('./main.js');
