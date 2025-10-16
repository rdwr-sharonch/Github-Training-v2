import json
import bcrypt
import getpass
import uuid
import random
import string
import time
import os

print("WARNING: For best security, run this script in a secure, isolated environment.")

USERS_FILE = os.path.join(os.path.dirname(__file__), 'users.json')
LOG_FILE = os.path.join(os.path.dirname(__file__), 'auth.log')
MAX_ATTEMPTS = 3
OTP_LENGTH = 6

# Helper to log authentication attempts
def log_attempt(username, status):
    with open(LOG_FILE, 'a') as log:
        log.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} | User: {username} | Status: {status}\n")

# Helper to load users
def load_users():
    with open(USERS_FILE, 'r') as f:
        data = json.load(f)
    return {u['username']: u['password_hash'] for u in data['users']}

# Helper to validate input
def validate_input(s):
    return s.isalnum() and 3 <= len(s) <= 32

users = load_users()

for attempt in range(1, MAX_ATTEMPTS + 1):
    username = input("Enter username: ").strip().lower()
    if not validate_input(username):
        print("Invalid username format.")
        log_attempt(username, 'invalid_username')
        continue
    if username not in users:
        print("User not found.")
        log_attempt(username, 'user_not_found')
        continue
    password = getpass.getpass("Enter password: ")
    if not validate_input(password):
        print("Invalid password format.")
        log_attempt(username, 'invalid_password')
        continue
    password_hash = users[username].encode('utf-8')
    if not bcrypt.checkpw(password.encode('utf-8'), password_hash):
        print(f"Authentication failed. Attempts left: {MAX_ATTEMPTS - attempt}")
        log_attempt(username, 'wrong_password')
        if attempt == MAX_ATTEMPTS:
            print("Too many failed attempts. Exiting.")
            exit()
        continue
    # MFA step
    otp = ''.join(random.choices(string.digits, k=OTP_LENGTH))
    print(f"[MFA] Your OTP is: {otp}")  # In real use, send via email/SMS
    user_otp = input("Enter OTP: ").strip()
    if user_otp != otp:
        print("Invalid OTP. Exiting.")
        log_attempt(username, 'invalid_otp')
        exit()
    # Success
    session_token = str(uuid.uuid4())
    print(f"Authentication successful! Session token: {session_token}")
    log_attempt(username, 'success')
    break
else:
    print("Authentication failed. Exiting program.")
    exit()

print("Hello world")
print("Hello Sharon")
print("Hello John")
print("Hello Alice")
print("Hello Bob")
print("Hello Eve")
print("Hello Mallory")
print("Hello Trent")
print("Hello Peggy")
print("Hello Victor")
print("Hello Walter")
print("Hello Charlie")
print("Hello Dave")
print("Hello Oscar")
print("Hello Sybil")
print("Hello Rupert")
print("Hello Ted")
print("Hello Uma")
print("Hello Xavier")
print("Hello Yvonne")
print("Hello Zach")
print("Hello Quinn")
print("Hello Rachel")
print("Hello Steve")
print("Hello Tina")
print("Hello Ursula")
print("Hello Vicky")
print("Hello Wendy")
print("Hello Xavier")
print("There are 28 states in India.")

def count_print_statements():
    count = 0
    with open(__file__, 'r') as f:
        for line in f:
            if line.strip().startswith('print('):
                count += 1
    print(f"There are {count} print statements in this file.")

count_print_statements()
