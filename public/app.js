let user=null;

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
    user=d.user;
    if(user.is_admin) loadAdmin();
    else loadDashboard();
  }
 });
}

function register(){
 fetch('/api/register',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
    username:ruser.value,
    password:rpass.value,
    ref:ref.value
  })
 }).then(()=>alert("Registered"));
}

// USER DASHBOARD
function loadDashboard(){
 document.body.innerHTML=`
 <h2>User Dashboard</h2>
 <h3>Balance: ${user.balance}</h3>
 <button onclick="deposit()">Deposit</button>
 <button onclick="withdraw()">Withdraw</button>
 `;
}

// ADMIN PANEL
function loadAdmin(){
 fetch('/api/users')
 .then(r=>r.json())
 .then(users=>{
  let html="<h2>Admin Panel</h2>";
  users.forEach(u=>{
    html+=`<p>${u.username} - ${u.balance}</p>`;
  });
  document.body.innerHTML=html;
 });
}

function deposit(){
 let a=prompt("Amount");
 let n=prompt("Number");
 fetch('/api/deposit',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({userId:user.id,amount:a,number:n})
 });
}

function withdraw(){
 let a=prompt("Amount");
 let n=prompt("Number");
 fetch('/api/withdraw',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({userId:user.id,amount:a,number:n})
 });
}