const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./db.sqlite');

// ===== DB =====
db.serialize(() => {

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    balance INTEGER DEFAULT 0,
    is_admin INTEGER DEFAULT 0,
    vip INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price INTEGER,
    profit INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS investments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    plan_id INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    amount INTEGER,
    number TEXT,
    status TEXT DEFAULT 'pending'
  )`);

});

// ===== DEFAULT ADMIN =====
db.get(`SELECT * FROM users WHERE username=?`, ["01735047020"], (err,row)=>{
  if(!row){
    db.run(`INSERT INTO users (username,password,is_admin) VALUES (?,?,1)`,
    ["01735047020","16253640k"]);
  }
});

// ===== DEFAULT PLANS =====
db.run(`INSERT OR IGNORE INTO plans (id,name,price,profit) VALUES
(1,'Starter',100,10),
(2,'VIP',500,60)`);

// ===== REGISTER =====
app.post('/api/register',(req,res)=>{
 const {username,password} = req.body;

 db.get(`SELECT * FROM users WHERE username=?`,[username],(err,row)=>{
  if(row) return res.json({success:false});

  db.run(`INSERT INTO users (username,password,balance) VALUES (?,?,200)`,
  [username,password],
  ()=>res.json({success:true}));
 });
});

// ===== LOGIN =====
app.post('/api/login',(req,res)=>{
 const {username,password} = req.body;

 db.get(`SELECT * FROM users WHERE username=? AND password=?`,
 [username,password],
 (err,row)=>{
  if(row) res.json({success:true,user:row});
  else res.json({success:false});
 });
});

// ===== PLANS =====
app.get('/api/plans',(req,res)=>{
 db.all(`SELECT * FROM plans`,[],(e,r)=>res.json(r));
});

// ===== INVEST =====
app.post('/api/invest',(req,res)=>{
 const {userId,planId} = req.body;

 db.get(`SELECT price FROM plans WHERE id=?`,[planId],(e,plan)=>{
  db.get(`SELECT balance FROM users WHERE id=?`,[userId],(e,u)=>{
    if(u.balance>=plan.price){
      db.run(`UPDATE users SET balance=balance-? WHERE id=?`,
      [plan.price,userId]);
      db.run(`INSERT INTO investments (user_id,plan_id) VALUES (?,?)`,
      [userId,planId]);
      res.json({success:true});
    }else res.json({success:false});
  });
 });
});

// ===== INCOME (ADMIN CONTROL) =====
app.post('/api/give-income',(req,res)=>{
 db.all(`SELECT * FROM investments`,[],(e,inv)=>{
  inv.forEach(i=>{
    db.get(`SELECT profit FROM plans WHERE id=?`,[i.plan_id],(e,p)=>{
      db.run(`UPDATE users SET balance=balance+? WHERE id=?`,
      [p.profit,i.user_id]);
    });
  });
 });
 res.json({success:true});
});

// ===== REQUEST =====
app.post('/api/deposit',(req,res)=>{
 const {userId,amount,number} = req.body;
 db.run(`INSERT INTO requests (user_id,type,amount,number) VALUES (?,?,?,?)`,
 [userId,'deposit',amount,number]);
 res.json({success:true});
});

app.post('/api/withdraw',(req,res)=>{
 const {userId,amount,number} = req.body;
 db.run(`INSERT INTO requests (user_id,type,amount,number) VALUES (?,?,?,?)`,
 [userId,'withdraw',amount,number]);
 res.json({success:true});
});

// ===== ADMIN =====
app.get('/api/requests',(req,res)=>{
 db.all(`SELECT * FROM requests WHERE status='pending'`,[],(e,r)=>res.json(r));
});

app.post('/api/handle',(req,res)=>{
 const {id,action} = req.body;

 db.get(`SELECT * FROM requests WHERE id=?`,[id],(e,row)=>{
  if(action==="approve"){
    if(row.type==="deposit"){
      db.run(`UPDATE users SET balance=balance+? WHERE id=?`,
      [row.amount,row.user_id]);
    }
    if(row.type==="withdraw"){
      db.run(`UPDATE users SET balance=balance-? WHERE id=?`,
      [row.amount,row.user_id]);
    }
  }
  db.run(`UPDATE requests SET status=? WHERE id=?`,
  [action,id]);
  res.json({success:true});
 });
});

app.listen(3000,()=>console.log("🚀 PRO MAX RUNNING"));
