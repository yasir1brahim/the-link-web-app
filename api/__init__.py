# from flask import Flask, jsonify, Response, request, session, redirect
# from flask_mysqldb import MySQL
# import os, re
# from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
# from flask_mail import Mail, Message
# from werkzeug.security import generate_password_hash, check_password_hash
# from .api_routes import api_routes
#
# app = Flask(__name__)
# basedir = os.path.abspath(os.path.dirname(__file__))
#
# # app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql:root@Tester@localhost/api'
# # app.config['MYSQL_HOST'] = 'localhost'
# # app.config['MYSQL_PORT'] = 3306
# # app.config['MYSQL_USER'] = 'root'
# # app.config['MYSQL_PASSWORD'] = 'Tester@123'
# # app.config['MYSQL_DB'] = 'api'
# # app.config["MYSQL_CURSORCLASS"] = "DictCursor"
#
# # app.config['SECRET_KEY'] = "supersecretkey"
#
# # pipenv run python -c 'import os; print(os.urandom(64))' > secret_key.txt
# # with open('secret_key.txt', 'rb') as f:
# #     app.secret_key = f.read().strip()
#
# # app.config['JWT_SECRET_KEY'] = "supersecretkey"
#
#
# # app.config['MAIL_SERVER'] = 'smtp.gmail.com'
# # app.config['MAIL_PORT'] = 465
# # app.config['MAIL_USERNAME'] = os.environ["MAIL_USERNAME"]
# # app.config['MAIL_PASSWORD'] = os.environ["MAIL_PASSWORD"]
# # app.config['MAIL_USE_TLS'] = False
# # app.config['MAIL_USE_SSL'] = True
#
# app.register_blueprint(api_routes)
#
# app.config.from_object('config')
#
# mysql = MySQL(app)
# jwt = JWTManager(app)
# mail = Mail(app)
#
#
# @app.after_request
# def after_request(response):
#     response.headers.add('Access-Control-Allow-Origin', '*')
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#     response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
#     return response
#
#
# if __name__ == '__main__':
#     app.run(host=app.config['HOST'],
#             port=app.config['PORT'],
#             debug=app.config['DEBUG'],
#             threaded=app.config['THREADED'],
#             use_reloader=app.config['USE_RELOAD'])
