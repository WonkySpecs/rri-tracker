import os
import datetime
import csv
from flask import Blueprint, jsonify, request, abort, Response

api = Blueprint("api", __name__)
DATA_FILE = os.path.expanduser("~/games.csv")

def parse_row(row, headers):
    res = {}
    for k, v in zip(headers, row):
        if v == "":
            res[k] = None
        elif k == "expansions":
            res[k] = v.split("+")
        elif k == "goals":
            res[k] = v.split(":")
        else:
            res[k] = v
    return res


@api.get("/games")
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


@api.post("/games")
def add_game():
    new_game = request.json
    if not new_game:
        abort(Response("New game must be in JSON format", status=415))

    new_game["date"] = datetime.date.today().isoformat()
    new_game["goals"] = ":".join(new_game["goals"])

    expansions = new_game["expansion(s)"]
    if isinstance(expansions, list):
        new_game["expansion(s)"] = "+".join(expansions)

    num_rows = 0
    with open(DATA_FILE, "r") as f:
        headers = [h.strip() for h in f.readline().split(",")]
        while f.readline():
            num_rows += 1
    new_game["id"] = num_rows + 1

    with open(DATA_FILE, "a") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writerow(new_game)
    return games()
