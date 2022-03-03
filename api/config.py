import os

DEBUG = True
PORT = 5000
# Set this to '0.0.0.0' to have the server available externally as well. Defaults to '127.0.0.1'
HOST = '127.0.0.1'
THREADED = False
USE_RELOAD = False

# mail config
MAIL_SERVER = 'smtp.gmail.com'
MAIL_PORT = 465
MAIL_USERNAME = os.environ["MAIL_USERNAME"]
MAIL_PASSWORD = os.environ["MAIL_PASSWORD"]
MAIL_USE_TLS = False
MAIL_USE_SSL = True

# database.py config
MYSQL_HOST = 'localhost'
MYSQL_PORT = 3306
MYSQL_USER = 'root'
MYSQL_PASSWORD = 'Tester@123'
MYSQL_DB = 'logmaker'
MYSQL_CURSORCLASS = "DictCursor"

TOKEN_EXPIRE_HOURS = 0
TOKEN_EXPIRE_MINUTES = 30

# secrets
with open('secret_key.txt', 'rb') as f:
    SECRET_KEY = f.read().strip()
    JWT_SECRET_KEY = f.read().strip()
