const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./db.sqlite');

// ===== DATABASE =====
db.serialize(() => {

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT,
    balance INTEGER DEFAULT 0,
    is_admin INTEGER DEFAULT 0,
    ref_by INTEGER,
    total_ref INTEGER DEFAULT 0
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

// ===== CREATE ADMIN =====
db.get(`SELECT * FROM users WHERE username=?`, ["01735047020"], (err,row)=>{
  if(!row){
    db.run(`INSERT INTO users (username,password,is_admin) VALUES (?,?,1)`,
    ["01735047020","16253640k"]);
  }
});

// ===== REGISTER =====
app.post('/api/register',(req,res)=>{
 const {username,password,ref} = req.body;

 db.run(`INSERT INTO users (username,password,ref_by) VALUES (?,?,?)`,
 [username,password,ref||null],
 function(err){
  if(!err){
    if(ref){
      db.run(`UPDATE users SET balance=balance+200,total_ref=total_ref+1 WHERE id=?`,[ref]);
    }
    res.json({success:true});
  }else res.json({success:false});
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

// ===== GET USERS (ADMIN) =====
app.get('/api/users',(req,res)=>{
 db.all(`SELECT * FROM users`,[],(err,rows)=>{
  res.json(rows);
 });
});

// ===== DEPOSIT REQUEST =====
app.post('/api/deposit',(req,res)=>{
 const {userId,amount,number} = req.body;

 db.run(`INSERT INTO requests (user_id,type,amount,number) VALUES (?,?,?,?)`,
 [userId,'deposit',amount,number]);

 res.json({success:true});
});

// ===== WITHDRAW REQUEST =====
app.post('/api/withdraw',(req,res)=>{
 const {userId,amount,number} = req.body;

 db.run(`INSERT INTO requests (user_id,type,amount,number) VALUES (?,?,?,?)`,
 [userId,'withdraw',amount,number]);

 res.json({success:true});
});

// ===== ADMIN APPROVE =====
app.post('/api/approve',(req,res)=>{
 const {id} = req.body;

 db.get(`SELECT * FROM requests WHERE id=?`,[id],(err,row)=>{
   if(row.type==="deposit"){
     db.run(`UPDATE users SET balance=balance+? WHERE id=?`,
     [row.amount,row.user_id]);
   }

   db.run(`UPDATE requests SET status='approved' WHERE id=?`,[id]);
   res.json({success:true});
 });
});

app.listen(3000,()=>console.log("🚀 TrustPay Full Running"));