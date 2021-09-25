func("who",(done,cmd,path)=>{
  ask("who are you?","", ans=>done("you are "+ans) )
})
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
  done()
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
func("ls path",(done,cmd,path)=>{
  let l = file((path))
  done(l ? l.list.map(m=>m.name) : null)
})
func("unset path",(done,cmd,path)=>{
  let l = file(path)
  l.value = null
  done()
})
func("echopath path",(done,cmd,path)=>{
  print(pathResolve(path))
  done()
})
print("jsonic v1.0");
