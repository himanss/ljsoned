
//this asserts that both file and its parents exist
{
let l = assertFile("/startup/splash")
if(l.value == null)l.exec = (...args)=>{
  print("systemic v1.0")
};
}

let home = assertFile("/home/"); if(home.value == null)home.value = {};
let sys = assertFile("/sys/"); if(sys.value == null)sys.value = {};


cd("/sys/")

{
let l = assertFile("/startup/")
l.list.forEach((v, i) => v.exec() );
}

cd("/home/")
