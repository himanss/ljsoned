//danger: debug mode is not for production!

const main = require('./mod.js');
const readline = require('readline');
const fs = require('fs');
const path = require('path');



let fi1 = process.argv[2]
main.vmGlobal.req = n=>require(n)
main.vmGlobal.sysEval = n=>eval(n)


let dp = path.join(__dirname,"debugUnsafeConsent.json")
let gep = []
try {
  gep = JSON.parse(fs.readFileSync(dp,"utf8"))
} catch (e) {}

if(gep.includes(fi1)){
  return require('./main.js');
}


let rl =readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
console.log("\x1b[0;33m"+"this software can preform actions as you...\nthis mode is for DEBUGGING ONLY\n ONLY RUN PROGRAMS YOU TRUST\nYOU UNDERSTAND AND ACCEPT ALL RISKS");
rl.question("to continue type \"agree\": ",ans=>{
  rl.close()
  if(ans == "agree"){
    gep.push(fi1)
    fs.writeFileSync(dp,JSON.stringify(gep))
    return require('./main.js');
  }
  console.log("aborted");
  process.exit(1);
})
