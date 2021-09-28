let stoTag = "ljsoned::"

const util = require('util');



function subToObj(text) {
  let numOf = Number(text)
  if(!isNaN(numOf))return [];
  if(text === "..") throw new Error("(forcefull): cannot construct parent word");
  if(text === "." || text === "") throw new Error("(forcefull): cannot construct \".\" ");
  return {};
}



function subType(v) { //if is constructable childLike value, return constructor
  if(v === null || v === undefined)return null;
  switch (v.constructor) {
    case Array:
    case Object:
      return v.constructor
      break;
    default:
    return null;
  }
}

let secureReturnToken = null
function getPrivateOf(public,callerName){
  secureReturnToken = null
    if(typeof public !== "object")throw new Error((callerName || "getPrivateOf")+": expected (public face of) node, got "+typeof public);
    public.__getPrivate()
    if(secureReturnToken == null || secureReturnToken.public !== public)
    throw new Error((callerName || "getPrivateOf")+": expected (public face of) node");
  return secureReturnToken
}

class FsNode {

  //pls confgure me//
  fileToArray(arr){
    return arr
  }
  arrayToFile(p){
    return p.join("/")
  }
  createArbitraryFn(args,body,base){ //makes arbitrary functions from string, basically a wrapper for Function()
    return Function(args,body).bind(base)
  }
  //actual code//

  constructor(root,parent,parentName) {
    this.root = this.root || this
    this.parent = parent
    this.parentId = parentName
    this.clear()
    this.setupPublic()
  }
  [util.inspect.custom](dep,opts){
    return `[FsNode private ${
       this.storage  ? "storage: "+util.inspect(this.storage ,opts)+" " : ""
    }${this.children ? "children: "+util.inspect(this.children,opts)+" " : ""
    }${this.value    ? "value: "+util.inspect(this.value   ,opts)+" " : ""
    }]`
  }

  setupPublic(){
    let privateFace = this
    let publicFace;
        publicFace = {
          __getPrivate(){
            secureReturnToken = privateFace
          },
          get parent(){
            return privateFace.parent.public
          },
          set parent(name){
            //Obj(Obj(parent = Obj(...)))
            let privateDest = privateFace.linkish
            if (name) {
              privateDest.moveTo(getPrivateOf(name,"(node.parent = node)"))
            } else {
              privateDest.remove()
            }
          },
          get value(){
              //if(privateFace.children)return this.subGet("value");
              let privateDest = privateFace.linkish
            return privateDest.children ? privateDest.save() : privateDest.value;
          },
          get preview(){
            let privateDest = privateFace.linkish
            return privateDest.children ? privateDest.save(true) : privateDest.value;
          },
          set value(v){
            //if(privateFace.children)return this.subSet("value",v);
            let privateDest = privateFace.linkish
            if(v === null) privateDest.clear();
            else privateDest.load(v,true);
          },
          set valueWithTrust(v){//DEPRECATED replased with trustedValue
            let privateDest = privateFace.linkish
            if(v === null) privateDest.clear(); //technically redundant
            else privateDest.load(v,false);
          },
          set trustedValue(v){//disables trust pretections for user input data
            let privateDest = privateFace.linkish
            if(v === null) privateDest.clear(); //technically redundant
            else privateDest.load(v,false);
          },
          set link(v){
            //TODO finish
          },
          sub(name){
            let privateDest = privateFace.linkish
            let l = privateDest.sub(name)
            return l ? l.public : null
          },
          go(where,assert){
            let privateDest = privateFace.linkish
            try{
            let l = privateDest.go(where,assert)
            return l ? l.public : null
            }
            catch(e){
              console.log("inside go attempt,",where);
              throw e
            }
          },
          setSub(name,value){
            let privateDest = privateFace.linkish
            let l = privateDest.sub(name)
            if(l)l.load(value,true);
            else privateDest.makeSub(name).load(value,true);
          },
          getSub(name){
            let privateDest = privateFace.linkish
            let l = privateDest.sub(name)
            return l ? l.value : null
          },
          get path(){
            //let privateDest = privateFace.linkish
            return privateFace.path
          },
          get list(){
            let privateDest = privateFace.linkish
            return privateDest.list.map(f=>f.public)
          },
          get storage(){
            let privateDest = privateFace.linkish
            return privateDest.storage
          },
          get name(){
            return privateFace.parentId
          },
          get exec(){

            if(!privateFace.hasValue)privateFace.load({});
            if(!privateFace.storage)throw new Error("only objects can contain code");

            if(privateFace.functionCache)
            return privateFace.functionCache;

            let func = publicFace.storage["function"]
            if(!func) func = "";
            func = privateFace.createArbitraryFn("...args",func).bind(this)
            privateFace.functionCache = func;
            return func;
          },
          set exec(v){
            var entire = v.toString(); // this part may fail!
            var body = entire;
            if(typeof v == "function")body = entire.substring(entire.indexOf("{") + 1, entire.lastIndexOf("}"));

            if(!privateFace.hasValue)privateFace.load({});
            if(!privateFace.storage)throw new Error("only objects can contain code");

            privateFace.functionCache = privateFace.createArbitraryFn("...args",body).bind(this)
            publicFace.storage["function"] = body

          }


        }
    publicFace[util.inspect.custom] = (dep,opts)=>{
      return `[FsNode public "/${privateFace.arrayToFile(this.path)}" ${
        privateFace.storage && privateFace.storage.link ? "linkedTo: "+privateFace.arrayToFile(privateFace.storage.link) : ""}]`
    }
    this.public = publicFace
  }
  get linkish(){ //is able to control the public face of the object disabled due to unsolvable bugs
    //let storage = this.storage
    //if(storage && storage.link) return this.go(storage.link,true,true);
    return this
  }
  get childLike(){//copy and paste this logic and avoid calling me
    return !!this.children
  }
  save(isPreview){
    let children = this.children
    let newO;
    if(children){
      if (this.arrayLike) {
        newO = [];
        children.forEach((item, i) => {
          newO[i] = item.save(isPreview)
        });
      } else {
        newO = {};
        for (var key in children) {
          if (children.hasOwnProperty(key)) {
            newO[key] = children[key].save(isPreview);
          }
        }//end of for
       if(!isPreview){
        let storage = this.storage
        for (var key in storage) {
          if (storage.hasOwnProperty(key)) {
            newO[stoTag+key] = storage[key]
          }
        }
       }
      }
    } else {
      newO = this.value
    }
    return newO;
  }
  go(where,forcefull,firstNonLinkish){
    let newp = this.root.fileToArray(where)

    let car = this
    let i = 0
    if(newp[0] == ""){
      car = car.root //avoid linkish TEMP
      i++
    }
    //console.log(firstNonLinkish,car.public,car.root.public,where);
    for (; i < newp.length; i++) {

      let node = newp[i];
      if(node == "" || node == ".");
      else if(node == "..") car = car.parent; //parent is non linkish
      else {
        let cat;

        //if(firstNonLinkish) firstNonLinkish = false;
        //else car = car.linkish; //folow link

        //if(!car) throw new Error("invalid link "+this.arrayToFile(where)+" file: "+cat.path+" to: "+this.arrayToFile(cat.storage.link))
        cat = car.sub(node); //this is linkish
        if(!cat || !cat.hasValue){
          if(forcefull){
            let next = newp[i+1]
            if(next === undefined) return car.makeSub(node);
            cat = car.makeSub(node);
            cat.load(subToObj(next));
            //console.log(subToObj(node));
          }
          else return null;
        }
        car = cat
        //
      }
    }
    return car
  }
  get path(){
    let parr = []
    let car = this
    while(car.parent){
      parr.push(car.parentId)
      car = car.parent
    }
    return parr.reverse()
  }
  load(value,untrusted){

    if(this.hasValue)this.clear();
    if(value === null)return;

    let mker = subType(value)
    this.arrayLike = value instanceof Array
    if(mker){
      this.children = new mker()
      if (this.arrayLike) {
        value.forEach((item, i) => {
          let l = new this.constructor(this.root,this,i)
          this.children[i] = l
          l.load(item,untrusted)
        });
      } else {
        let storage = {}
        this.storage = storage
        for (var key in value) {
          if(key.substring(0,stoTag.length)==stoTag){
            let stoK = key.substring(stoTag.length)
            if(stoK == "trusted" && untrusted)
                 storage["trusted"] = false; //marks values as untrustworthy
            else storage[stoK] = value[key];

          } else if (value.hasOwnProperty(key)) {
            let l = new this.constructor(this.root,this,key)
            this.children[key] = l
            l.load(value[key],untrusted)
          }
        }//end of for
      }//end if this.arrayLike
    } else {
      this.value = value
    } //end of if mker else
    this.hasValue = true
    //if(this.storage && this.storage.trusted && untrusted)this.storage.trusted = false; //marks values as untrustworthy
    this.onLoad()
  }//endof func

  onLoad(){
    //when an item loads data
    let storage = this.storage
    if(this === this.root && storage && storage.trusted && storage.onInit){
      (this.createArbitraryFn("",storage.onInit,this.public))()
    }
  }

  clear(){
    if(this.children)this.clearChildren();
    this.hasValue = false
    this.value = null
    this.children = null //childLike if trueish
    this.arrayLike = false
    this.storage = null //nulled when not used
  }
  clearChildren(){
    if (this.arrayLike) {
      this.children.forEach((item, i) => {
        item.parent = null
        this.children[i] = null
      });
    } else {
      for (var key in this.children) {
        this.children[key].parent = null
        this.children[key] = null
      }//end of for
    }//end if this.arrayLike
  }
  keyCorrect(key,act){
    if(!this.children)throw new Error("attempt to "+act+" on non childLike element")
    if(this.arrayLike){
      key = Number(key)
      if(Number.isNaN(key))throw new Error("array key, expected number got text");
      key = Math.floor(key)
      if(key < 0) key = key % this.children.length; //if i < 0  wrap around to the end
    };
    return key;
  }
  makeSub(key){
    key = this.keyCorrect(key,"make child");
    let l = new this.constructor(this.root,this,key)
    this.children[key] = l
    return l
  }
  sub(key){
    key = this.keyCorrect(key,"get child");
    //if(key == "" || key == ".")return this; //TODO make this change stable
    return this.children.hasOwnProperty(key) ? this.children[key] : null
  }
  subSet(key,value){
    key = this.keyCorrect(key,"write child");
    return this.children[key] = value
  }
  remove(){
    if(this.parent){
      this.parent.children[this.parentId] = null
      this.parent = null
    }
  }
  attach(node,name){
    if(this.parent)this.remove();
    name = (name !== undefined || name !== null) ? name : this.parentId
    name = node.keyCorrect(name,"attach node")
    if(node.children[name])throw new Error("that node already exists");
    this.parent = node
    node.children[name] = this
  }
  delete(){
    this.remove()
    this.clear()
  }
  moveTo(dest){
    let origParent = this.parent
    try {
      this.attach(dest)
    } catch (e) {
      this.attach(origParent)
      throw e
    }
  }

  get list() {
    let children = this.children
    let newO = [];
    if(children){
      if (this.arrayLike) {
        newO = Array.from(children)
      } else {
        newO = Object.values(children)
      }
    } else {
      return []
    }
    return newO.filter(v=>v&&v.hasValue)
  }
}

exports.FsNode = FsNode
