# -*- coding: UTF-8 -*-
import pandas as pd
from PIL import Image

attractions = pd.DataFrame(pd.read_csv("./attractions.csv", encoding="utf-8"))
for index, row in attractions.iterrows():
	if attractions["type"][index] == "casino":
		im = Image.open("./casinos_pictures/original/" + str(attractions["id"][index]) + ".jpg")
		im.resize((160, 120)).save("./casinos_pictures/resize/" + str(attractions["id"][index]) + ".jpg")
	elif attractions["type"][index] == "park":
		im = Image.open("./parks_pictures/original/" + str(attractions["id"][index]) + ".jpg")
		im.resize((160, 120)).save("./parks_pictures/resize/" + str(attractions["id"][index]) + ".jpg")