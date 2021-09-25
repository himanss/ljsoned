let a = 2 //1 for called "*.js mode", 2 for called with "node *.js mode"
let argv = process.argv
let file = argv[a+0]

const fs = require('fs');
const path = require('path');
const main = require('./mod.js');

if(!fs.existsSync(file)){
  console.error("that file does not exist: "+file);
  console.error(`
    to edit file             : node ljsoned/main.js existingJsonFile.json
    to make file from script : node ljsoned/main.js constructor.js
  `);
  global.noSave = true
  process.exit(1)
}

{
  let fp = path.join(__dirname,"preload.js")
  main.vm.run(fs.readFileSync(fp,'utf8'))
}

let ext = path.extname(file)
if(ext == ".js"){
  main.fsroot.load({"ljsoned::trusted":true,"ljsoned::onInit":fs.readFileSync(file,'utf8')})
  file = file+".json"
}else if(ext == ".json"){
  main.fsroot.load(JSON.parse(fs.readFileSync(file,'utf8')))
}else{
  throw new Error("must be .json or .js file")
}

  const readline = require('readline');
  let rl =readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  main.rl = rl;

  main.vmGlobal.ask = function(question,autofill,callbk) { //its in the standard just not configured
      if(autofill === undefined || autofill === null)autofill = "";
      rl.question(question+" ",callbk)
      rl.write(autofill)
  }

  function prompt(rtn) {
    if(rtn !== undefined)console.log(rtn);
    let fgReset = "\x1b[0m"
    let fgGreen = "\x1b[32m"
    rl.question(`ljsoned${fgGreen}${main.fileJoin(main.cwd)}${fgReset}> `,ans=>{
      try {
        main.cliDo(ans,prompt)
      } catch (e) {
        console.log(e instanceof Error ? e.message : e);
        prompt()
      } finally {

      }


    })
  }

  prompt()

  process.on("exit",m=>{
    if(global.noSave || main.vmGlobal.noSave){
      console.log("exit (unsaved)");
    }else{
      fs.writeFileSync(file,JSON.stringify(main.fsroot.save()))
      console.log("exit (saved do "+file+")");
    }

  })
