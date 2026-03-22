const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./db.sqlite');

// DB
db.run(`CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 username TEXT UNIQUE,
 password TEXT,
 balance INTEGER DEFAULT 0
)`);

// REGISTER
app.post('/api/register',(req,res)=>{
 const {username,password} = req.body;

 db.get(`SELECT * FROM users WHERE username=?`,[username],(e,row)=>{
  if(row) return res.json({success:false});

  db.run(`INSERT INTO users (username,password,balance) VALUES (?,?,200)`,
  [username,password],
  ()=>res.json({success:true}));
 });
});

// LOGIN
app.post('/api/login',(req,res)=>{
 const {username,password} = req.body;

 db.get(`SELECT * FROM users WHERE username=? AND password=?`,
 [username,password],
 (e,row)=>{
  if(row) res.json({success:true,user:row});
  else res.json({success:false});
 });
});

// PORT FIX
const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log("Server Running"));
