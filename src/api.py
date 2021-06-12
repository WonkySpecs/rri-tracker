import os
import time
import csv
from flask import Blueprint, jsonify

api = Blueprint("api", __name__)
DATA_FILE = os.path.expanduser("~/games.csv")

def parse_row(row, headers):
    res = {}
    for k, v in zip(headers, row):
        if v == "":
            res[k] = None
        elif k == "expansions":
            res[k] = v.split(":")
        elif k == "goals":
            res[k] = v.split(":")
        else:
            res[k] = v
    return res


@api.route("/games")
def games():
    headers = []
    rows = []
    c = 0
    with open(DATA_FILE) as f:
        reader = csv.reader(f)
        for row in reader:
            if c == 0:
                headers = row
                c += 1
                continue
            rows.append(parse_row(row, headers))
    return jsonify(rows)
