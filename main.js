let a = 2 //1 for called "*.js mode", 2 for called with "node *.js mode"
let argv = process.argv
let file = argv[a+0]


const fs = require('fs');
const path = require('path');
const main = require('./mod.js');
const mloader = require("./modloader")


//{
	let Event = main.Event
//}


let charm = new Event("charmSystem")
main.vmGlobal.charms = charm.public

let color = {warn:"\x1b[0;33m",accent:"\x1b[32m",reset:"\x1b[0m",info:"\x1b[0;34m"}
main.vmGlobal.color = Object.assign({},color) //clone of color


let doesSave = ()=>!(global.noSave || main.vmGlobal.noSave)

Object.defineProperty(main.vmGlobal,"autosave",{
	get:doesSave,
	set(v){
		main.vmGlobal.noSave = !v
	}
})

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
  let jsonOf = file.substr(0,file.length-ext.length) +".json"
  main.fsroot.load({"ljsoned::trusted":true,"ljsoned::function":fs.readFileSync(file,'utf8'),"ljsoned::onInit":"this.exec()"})

  if(fs.existsSync(jsonOf)){
    main.vmGlobal.noSave = true
    console.log(`you are overriting a file with it's template!${"\n"}therefore ${color.warn}autosave has been turned off${color.reset}`)
  }
  file = jsonOf
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
  function save() {
    fs.writeFileSync(file,JSON.stringify(main.fsroot.save()))
  }
  main.vmGlobal.save = save;

	let promptHead = main.vmGlobal.sysEval ? "#" : "$"




  function prompt(rtn) {
    if(rtn !== undefined)console.log(rtn);
		let charms = []
		charm.fire((colorOf,text)=>{
			charms.push(" "+(color[colorOf] || color.reset)+"("+text+")")
		})
    rl.question(`ljsoned${charms.join("")} ${color.accent}${main.fileJoin(main.cwd)}${color.reset}${promptHead} `,ans=>{
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
    if(!doesSave()){
      console.log("exit (unsaved)");
    }else{
      save()
      console.log("exit (saved do "+file+")");
    }

  })
