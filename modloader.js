const fs = require('fs');
const path = require('path');
const main = require('./mod.js');

modsys = new main.Event("require")

modsys.add(type=>{

let mp = path.join(__dirname,"mods",type+'.js')
if(!fs.existsSync(mp))return null;
return main.vmFunction("sysEval,main",fs.readFileSync(mp,'utf8'))(cmd=>eval(cmd),main)

})

main.vmGlobal.require = m=>modsys.fireAndCatch(m)