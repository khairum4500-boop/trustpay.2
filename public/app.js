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
    auth.style.display="none";
    app.style.display="block";
    load();
  }else alert("Login Failed");
 });
}

function register(){
 fetch('/api/register',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
    username:user.value,
    password:pass.value
  })
 }).then(()=>alert("Registered"));
}

function load(){
 balance.innerText="Balance: "+user.balance;

 if(user.is_admin){
   menu.innerHTML=`
   <button onclick="admin()">Admin Panel</button>
   <button onclick="income()">Give Income</button>
   `;
 }else{
   menu.innerHTML=`
   <button onclick="plans()">Invest</button>
   <button onclick="deposit()">Deposit</button>
   <button onclick="withdraw()">Withdraw</button>
   `;
 }
}

function plans(){
 fetch('/api/plans')
 .then(r=>r.json())
 .then(p=>{
  let html="";
  p.forEach(pl=>{
    html+=`<div>${pl.name} - ${pl.price}
    <button onclick="buy(${pl.id})">Buy</button></div>`;
  });
  content.innerHTML=html;
 });
}

function buy(id){
 fetch('/api/invest',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({userId:user.id,planId:id})
 }).then(()=>alert("Invested"));
}

function deposit(){
 let a=prompt("Amount");
 let n=prompt("Number");
 fetch('/api/deposit',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({userId:user.id,amount:a,number:n})
 }).then(()=>alert("Request Sent"));
}

function withdraw(){
 let a=prompt("Amount");
 let n=prompt("Number");
 fetch('/api/withdraw',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({userId:user.id,amount:a,number:n})
 }).then(()=>alert("Withdraw Sent"));
}

function admin(){
 fetch('/api/requests')
 .then(r=>r.json())
 .then(d=>{
  let html="";
  d.forEach(r=>{
    html+=`${r.type} ${r.amount}
    <button onclick="handle(${r.id},'approve')">✔</button>
    <button onclick="handle(${r.id},'reject')">❌</button><br>`;
  });
  content.innerHTML=html;
 });
}

function handle(id,action){
 fetch('/api/handle',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({id,action})
 }).then(()=>admin());
}

function income(){
 fetch('/api/give-income',{method:'POST'})
 .then(()=>alert("Income Added"));
}

function logout(){
 location.reload();
}
