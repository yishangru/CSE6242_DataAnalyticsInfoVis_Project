# -*- coding: UTF-8 -*-
import json
import pymongo
import pandas as pd

# mongoDB for CSE6242 Project - use module pymongo

# create a mongo client
connectDBclient = pymongo.MongoClient("mongodb://cse6252-2019fall:243c4BFs7HJREOpni4cnCHfcv2JWFJJ2MEjBlZN7dyUwrjrCedIAID61IaZ4RPxi5zmAMZwxhqvQlxMfRuO0NA==@cse6252-2019fall.documents.azure.com:10255/?ssl=true")
print(connectDBclient.list_database_names())

dblist = connectDBclient.list_database_names()

# connect to database
projectdb = connectDBclient["cse6242"]

# azure not support for list_collection_names ... suck, use following to print collections stats
# print(projectdb.command('listCollections'))

# print collection statistics
print(projectdb.command('collstats', 'business'))
print(projectdb.command('collstats', 'review'))


"""
collection.find({}, {"_id": 0, "name": 1, "address": 1})
# return specific columns (name and address), not include _id
# if specify a column as 0, others get 1 and vice verse

query a database (address as "xxxxxx"):
	documentQuery = {"address": "xxxxxx"}
	document = collection.find(documentQuery)

advance query (address start starts with "S" or higher):
	documentQuery = {"address": {"$gt": "S"}}

query with regex (address start with "S"):
	documentQuery = {"address": {"$regex": "^S"}}

sort the result (sort by name), -1 as descending, 1 as ascending:
	collection.find().sort("name", -1)

delete document:
	collection.delete_one({"address": "xxxxxx"})

delete many document:
	x = collection.delete_many({"address": {"$regex": "^S"}})
	print(x.deleted_count, " document deleted")

drop collection:
	collection.drop()

update document:
	collection.update_one({"address": "xxxxxx"}, {"$set": {"address": "xxxxxx"}})

update many document:
	collection.update_many({"address": {"$regex": "^S"}}, {"$set": {"name": "xxxxxx"}})
	print(x.modified_count, " documents update")

limit query result:
	collection.find().limit(5)
"""


# two collections in database: review and business
businessTable = projectdb["business"]
x = businessTable.find_one()
print(x)

reviewTable = projectdb["review"]
x = reviewTable.find_one()
print(x)
#pd.DataFrame(data=x).to_csv("sampleReviewRow.csv", index=False)