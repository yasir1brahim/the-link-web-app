from flask import Flask
from flask_mysqldb import MySQL
import os
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from routes.api_routes import api_routes

app = Flask(__name__)

app.register_blueprint(api_routes)

app.config.from_object('config')

mysql = MySQL(app)
jwt = JWTManager(app)
mail = Mail(app)


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response


if __name__ == '__main__':
    app.run(host=app.config['HOST'],
            port=app.config['PORT'],
            debug=app.config['DEBUG'],
            threaded=app.config['THREADED'],
            use_reloader=app.config['USE_RELOAD'])

