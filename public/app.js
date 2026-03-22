function showRegister(){
 loginBox.classList.add("hidden");
 registerBox.classList.remove("hidden");
}

function showLogin(){
 registerBox.classList.add("hidden");
 loginBox.classList.remove("hidden");
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
    localStorage.setItem("user",JSON.stringify(d.user));
    window.location.href="dashboard.html";
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
    password:rpass.value
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
