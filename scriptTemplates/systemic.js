
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

assertFile("/bin/echo/")
.exec = (done,cmd,...args)=>{
  print(...args)
  done()
}
assertFile("/bin/ted/")
.exec = (done,cmd,file,...args)=>{
  let f = assertFile(file)
  let lines = String(f.value).split("\n")
  let lineI = 0
  function p(){
    ask((lineI+1)+">",lines[lineI] || "",ans=>{
      if(ans[0] == "/"){
        ans = ans.split(" ")
        switch (ans[0]) {
          case "/go":
            {
              let gnum = Number(ans[1])
              if(isNaN(gnum)){
                print("not a number")
                return p()
              }else{
                lineI = gnum - 1
                return p()
              }
            }
            break;
            case "/save":
              {
                f.value = lines.join("\n")
                print("saved")
                return p()
              }
              break;
              case "/exit":
              {
                print("bye")
                return done()
              }
                break;
          default:

        }
      }
      lines[lineI] = ans
      lineI++
      p()
    })
  }
  p()
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
