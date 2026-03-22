function showRegister(){
 document.getElementById("loginBox").classList.add("hidden");
 document.getElementById("registerBox").classList.remove("hidden");
}

function showLogin(){
 document.getElementById("registerBox").classList.add("hidden");
 document.getElementById("loginBox").classList.remove("hidden");
}

// LOGIN
function login(){
 fetch('/api/login',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
    username:user.value,
    password:pass.value
  })
 }).then(r=>r.json()).then(d=>{
  if(d.success){
    alert("✅ Login Success");
    location.reload();
  }else{
    alert("❌ Login Failed");
  }
 });
}

// REGISTER
function register(){
 fetch('/api/register',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
    username:ruser.value,
    password:rpass.value,
    ref:ref.value
  })
 }).then(r=>r.json()).then(d=>{
  if(d.success){
    alert("✅ Registered");
    showLogin();
  }else{
    alert("❌ Already exists");
  }
 });
}
