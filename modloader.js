const fs = require('fs');
const path = require('path');
const main = require('./mod.js');

let moddir = "mods"

if(!fs.existsSync( path.join(__dirname,moddir) )){
  console.warn("the mod dir does not exist, no mods to load");
}

modsys = new main.Event("require")

let fnCache = {}

modsys.add((type,...args)=>{

let l = fnCache[type]
if(l)return l(...args);

let mp = path.join(__dirname,moddir,type+'.js')
if(!fs.existsSync(mp))return null;

l = main.vmFunction("sysEval,main",fs.readFileSync(mp,'utf8')) (cmd=>eval(cmd),main)

if (typeof l != "function") throw new Error("Module: expected function as a return");
fnCache[type] = l;
return l(...args)

})

main.vmGlobal.require = m=>modsys.fireAndCatch(m)
