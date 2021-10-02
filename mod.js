const split = require('split-string');
const replaceAll = require('string.prototype.replaceall');

String.prototype.replaceAll = function (ex,rep) {
  return replaceAll(this,ex,rep)
};

var event = {}
exports.events = event
	class Event extends Set{
		constructor(name){
			super();
			event[name] = this
			this.public = {
				addListener:this.addListener.bind(this),
				removeListener:this.removeListener.bind(this),

				add:this.addListener.bind(this),
				remove:this.removeListener.bind(this),

				fire:this.fire.bind(this)
			}
		}
		addListener(func){
			this.add(func)
		}
		removeListener(func){
			this.delete	(func)
		}
		fire(...args){
			this.forEach((item, i) => {
				item(...args)
			});
		}
    fireAndCatch(...args){
      let rtn = null
			this.forEach((item, i) => {
        if(rtn === null || rtn === undefined) rtn = item(...args);
			});
      return rtn;
		}
	}
	function eventPublic(e){
		if(event[e])return event[e].public;
		else return new Event(e).public;
	}
	exports.eventPublic = eventPublic
exports.Event = Event

exports.cli_split = {
  quotes: ['"'],
  separator: ' ',
  keep:(value, state) => {
    /*if(value === '\\')return false;
    let isEscaped = state.prev() === '\\'
    if(isEscaped){
      return true //return (value !== '') || (value !== '')
    }*/
    return true;
}

}

exports.file_split = {
  quotes: ['"'],
  separator: '/',
  keep:(value, state) => {
    return value !== '\\' && (value !== '"' || state.prev() === '\\');
  }
}

/*
console.log(
  split(`hi/ho is\\&\\ \\"lol 7 and "Verry spacey"\\ indeed file/hi" / "ho is funny`,exports.cli_split).map(
    v=>split(v,exports.file_split).join(" & ")
  ).join("\n")
);*/
//default("jimmy")

exports.cliSplit =  str=>{
  if(typeof str == "string")return split(str,exports.cli_split);
  if(typeof str == "array" || str instanceof Array)return str;
  throw new Error("value must be Array or String got: "+typeof str);
}
exports.fileSplit =  str=>{
  if(typeof str == "string")return split(str,exports.file_split);
  if(typeof str == "array" || str instanceof Array)return str;
  return []
  //throw new Error("value must be Array or String got: "+typeof str);
}
exports.shFuncs = {}
exports.say = function (...args) {
  // body...
  console.log(...args);
};
exports.filesys = { //expect mutablility. even from sandbox
  /*"pkg::json-sed":{
    //ghosted element to exports.privFileys//
  }*/

}
exports.privFileys = {
  "launchFunc":"", //ran when the system starts
  "permissions":[],
  "links":{"ln":"/"}, //pseudo fs for links, TODO: build, top level only, /linked/data == /linkTarget/linkTarget/data, data/ being appended
}
exports.cwd = [""] // working directory

exports.pathToValue = str=>{ //words are arguments that have been parsed into a string
  if(typeof str == "string")return str;
  if(typeof str == "array" || str instanceof Array)return str.join("/");
  throw new Error("value must be Array or String got: "+typeof str);
}

let noCommandEvent = new Event("command")

exports.cliDo = (args,callbk)=>{
  let infunc = null
  args = exports.cliSplit(args).map(v=>exports.fileSplit(v))


  args[0] = exports.pathToValue(args[0] || "") //0 is processed as "word"

  if(args[0] == "")return callbk();

  let cmd = exports.shFuncs[args[0]]
 if(!cmd) cmd = noCommandEvent.fireAndCatch(args[0])
  if(!cmd){
    throw new Error("command not found")
  }


  {
    let argmode = cmd[0/*argmode*/]
    let mode = "word" //default to this
    args = args.map((item, i) => {
      if(i == 0)return item; //0 is skipped
      mode = argmode[i] || mode //keep old mode if out of bounds
      if(!(["raw","path"].includes(mode))) //if not on the list, wordify
        item = exports.pathToValue(item);
      //
      //if(mode == "XYZ"){...} //TEMPLATE
      return item;
    });

  }
  //console.log(args);

  if (args[0] == "") {
    return callbk()
  } else if (cmd){
    return cmd[1](callbk,...args);
  }

}

function fjoin(){ //ik its hell to debug
  if(this.length == 1 && this[0] == "")return "/"
  return this.map(v=>replaceAll(replaceAll(replaceAll(replaceAll(
    v,
    '\\',"\\\\"),
    '"',"\\\""),
    "\/","\\/"),
    " ","\\ ")).join("/")
}

exports.fileJoin = function(...arg){return fjoin.call(...arg)}

/*
String.prototype.isFileArray = function(){
  split(this,cli_split)
}
Array.prototype.isFileArray = function(){
  return this;
}*/


//exports.

exports.pathResolve = function (path,basepath) {

  if(basepath === undefined || basepath === null) basepath = exports.cwd;

  let newp = exports.fileSplit(path)
  let i = 0
  if(newp[0] == ""){
    path = ['']
    i++
  }else {
    path = Array.from(exports.fileSplit(basepath))
  }
  for (; i < newp.length; i++) {
    let node = newp[i]
    if(node == "" || node == ".");
    else if(node == "..") path.pop();
    else path.push(node);
  }
  return path
};



class Node {
  constructor() {

  }
}

exports.vmGlobal = {
  pathToString:exports.pathToValue,
  func:(cfg,func)=>{
    if(typeof cfg !== "string")throw new Error("func(config,func), config expected string but got: "+typeof cfg);
    if(func.constructor.name !== "Function")throw new Error("func(config,func), func expected async function but got: "+typeof cfg);
    cfg = cfg.split(" ") //set word value
    exports.shFuncs[cfg[0]] = [cfg,func]
    return func;
  },


}


let jfs = require('./jsonic-fs');
const { VM } = require('vm2');

const vm = new VM({
    //timeout:1000,
    sandbox:exports.vmGlobal,

});
let vmGlobal = vm.run(`global`)
exports.vmGlobal = vmGlobal

exports.vm = vm

let VMFunctionFactory = vm.run(`
(function(args,body,base){
  return Function(args,body).bind(base)
})`)
let VMTrap = vm.run(`(function(io){return io})`)
exports.VMTrap = VMTrap //vm entrapped value maker
exports.vmFunction = VMFunctionFactory


class FsNode extends jfs.FsNode {
  fileToArray(inp){
    return exports.fileSplit(inp)
  }
  arrayToFile(inp){
    return exports.fileJoin(inp)
  }
  createArbitraryFn(args,body,base){
    return VMFunctionFactory(args,body,base)
  }
}

let fsroot = new FsNode(null,null,"o");
exports.fsroot = fsroot

vmGlobal.file = (function file(path) {
  return fsroot.public.go(exports.pathResolve(path))
})
vmGlobal.assertFile = (function file(path) {
  return fsroot.public.go(exports.pathResolve(path),true)
})
vmGlobal.isEmptyPath = (path)=>{
  //TODO finish
}
vmGlobal.pathResolve = (path,base)=>exports.pathResolve(path,base);
vmGlobal.cd = (function cd(path) {
  path = path || ['.']
  exports.cwd = exports.pathResolve(path);
  return Array.from(exports.cwd)
})

vmGlobal.ask = function(question,autofill) { //its in the standard just not configured
  new Promise(function(resolve, reject) {
    resolve(null)
  });
}
vmGlobal.print = function(...data) {
  console.log(...data);
}
vmGlobal.pathToString = path=>exports.fileJoin(path)
vmGlobal.event = eventPublic

//vmGlobal.ask
