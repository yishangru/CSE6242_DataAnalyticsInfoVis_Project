import sys
import json

def get_recommends(keywords, n = 10):
    res = []
    temp = {}
    for i in data.keys():
        score = data[i]['star']/10
        for j in keywords:
            if j in data[i]['keywords']:
                score += 1
       
        temp[i] = score
    sorted_temp = sorted(temp.items(), key=lambda x: x[1], reverse = True)  
    for k in range(n):
        res.append(sorted_temp[k][0])
    return res

if __name__== "__main__":
	with open('results.json') as json_file:
		data = json.load(json_file)
	keywordSearch = list(set(list(sys.argv).pop(0)))
	print(get_recommends(keywordSearch))