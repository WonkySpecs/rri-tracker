from flask import Flask
from api import api
from pages import pages

app = Flask(__name__)
app.register_blueprint(pages)
app.register_blueprint(api, url_prefix='/api')
