from flask import Flask
app = Flask(__name__)

import sys
import json

@app.route("/keywordSearch.py")
def get_recommends():
    n = 10
    with open('results.json') as json_file:
        data = json.load(json_file)
    keywordSearch = list(set(list(sys.argv).pop(0)))
    res = []
    temp = {}
    for i in data.keys():
        score = data[i]['star']/10
        for j in keywordSearch:
            if j in data[i]['keywords']:
                score += 1
       
        temp[i] = score
    sorted_temp = sorted(temp.items(), key=lambda x: x[1], reverse = True)  
    for k in range(n):
        res.append(sorted_temp[k][0])
    res = ["1", "2", "3"]
    print(",".join(res))
    return ",".join(res)

if __name__== "__main__":
    app.run()