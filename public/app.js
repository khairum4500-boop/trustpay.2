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

 const username = document.getElementById("user").value;
 const password = document.getElementById("pass").value;

 if(!username || !password){
  alert("সব ঘর পূরণ করুন");
  return;
 }

 fetch('/api/login',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({username,password})
 })
 .then(res => res.json())
 .then(data => {

   console.log(data); // DEBUG

   if(data.success){
     localStorage.setItem("user", JSON.stringify(data.user));
     window.location.href = "dashboard.html";
   }else{
     alert("❌ ভুল নাম্বার বা পাসওয়ার্ড");
   }

 })
 .catch(err=>{
   alert("Server error");
   console.log(err);
 });
}

// REGISTER
function register(){

 const username = document.getElementById("ruser").value;
 const password = document.getElementById("rpass").value;

 if(!username || !password){
  alert("সব ঘর পূরণ করুন");
  return;
 }

 fetch('/api/register',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({username,password})
 })
 .then(res => res.json())
 .then(data=>{
   if(data.success){
     alert("✅ রেজিস্টার সফল");
     showLogin();
   }else{
     alert("❌ আগে থেকেই আছে");
   }
 })
 .catch(err=>{
   alert("Server error");
 });
}
