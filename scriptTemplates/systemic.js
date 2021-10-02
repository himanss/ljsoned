
//this asserts that both file and its parents exist
{
let l = assertFile("/startup/splash")
if(l.value == null)l.exec = ()=>{
  print("systemic v1.0")
};
}



assertFile("/bin/echo/")
.exec = (done,cmd,...args)=>{
  print(...args)
  done()
}



let root = file("/")
root.exec = ()=>{
  let asf = f=>{ let l = assertFile(f); if(l.value == null)l.value = {}; return l}
  let home = asf("/home/")
  let bin = asf("/bin/");
  let sys = asf("/sys/");

  event("command").addListener(cmd=>{
    let l = bin.sub(cmd)

    if(l)return [cmd+" "+(l.storage.functionShArgs || []).join(" "), l.exec ];
  })

  cd("/sys/")

  {
  let l = assertFile("/startup/")
  l.list.forEach((v, i) => v.exec() );
  }

  cd("/home/")
}

root.exec()
