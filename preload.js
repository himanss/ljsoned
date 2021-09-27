


{ //helpsys
  let htxt;htxt = function(cmd,help) {
    htxt[cmd] = help
  }
  global.helptxt = htxt
  func("help word",(done,cmd,shownCmd)=>{
    if(!shownCmd)return done(print("try: help <command>;\nto list all commands try: cmds"));
    print(htxt[shownCmd] || "no help for this command")
    done()
  })
}


helptxt("set","sets the value of a node")
func("set path value",(done,cmd,path,...value)=>{
  //let s2 = path.pop()
  let val = [...value].join(" ")
  let numOf = Number(val.trim())
  if(!isNaN(numOf))val = numOf;
  assertFile(path).value = val
  done()
})
func("mkobj path",(done,cmd,path,value)=>{
  assertFile(path).value = {}
  done()
})
func("cd path",(done,cmd,path)=>{
  cd(path)
  done()
})
func("nosave",(done,cmd,path)=>{
  global.noSave = true
  print("your changes will not be saved")
  done()
})
func("dosave",(done,cmd,path)=>{
  global.noSave = false
  print("your changes will be saved")
  done()
})
func("save",(done,cmd,path)=>{
  global.noSave = true
  save()
  print("saved")
  done()
})

func("exit",(done,cmd,path)=>{
  global.noSave = true
  print("goodbye! ")
  done()
  exit()
})

func("json path",(done,cmd,path)=>{
  let f = assertFile(path)
  ask('edit> ',JSON.stringify(f.value),rst=>{
    if(!rst || rst.length == 0){
      print("no changes made")
      return done()
    }
    f.trustedValue = JSON.parse(rst)
    print("changed")
    return done()
  })
  done()
})

func("mkarr path",(done,cmd,path,value)=>{
  assertFile(path).value = []
  done()
})
func("get path",(done,cmd,path)=>{
  let l = file(path)
  done(l ? l.preview : null)
})
func("dump path",(done,cmd,path)=>{
  let l = file(path)
  done(l ? l.value : null)
})
func("stod path",(done,cmd,path)=>{ //storage dump
  let l = file(path)
  done(l ? l.storage : null)
})
func("ls path",(done,cmd,path)=>{
  let l = file((path))
  done(l ? l.list.map(m=>m.name) : null)
})
func("rm path",(done,cmd,path)=>{
  let l = file(path)
  l.value = null
  done()
})
func("resolve-path path",(done,cmd,path)=>{
  print(pathResolve(path))
  done()
})

func("jsh",(done,cmd,path)=>{
  function prompt() {
    ask("jsh>","",ans=>{
      ans = ans.trim()
      if(ans == "exit")return done();
      try {
        print(eval(ans))
      } catch (e) {
        print(e)
      }
      prompt()
    })
  }
  prompt()
})



print("ljsoned v1.0");
