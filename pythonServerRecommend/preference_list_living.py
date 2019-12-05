
def preference_list_living(iid):
    import pandas as pd
    import numpy as np
    import math
    json_data=pd.read_json('NV_listing.json',orient='records')
    data = json_data[['id','name','host_identity_verified','latitude',\
                      'longitude','room_type','price','guests_included',\
                      'bathrooms','beds','minimum_nights','number_of_reviews',\
                      'security_deposit',"review_scores_rating","cancellation_policy"]]
    attributes = data[['host_identity_verified','room_type','price',\
                       'guests_included','bathrooms','beds','minimum_nights',\
                       'number_of_reviews',"cancellation_policy"]]
    
    identity = []
    room_type = []
    price = []
    bathrom =[]
    bed = []
    min_nights = []
    num_review = []
    num_guests = []
    cancellation = []
    
    for i in range(len(attributes)):
        attr = attributes.loc[i]
        if attr["host_identity_verified"]=='t':
                identity.append(1)
        else:
                identity.append(0)
        
        if attr["room_type"] == "Entire home/apt":
                room_type.append(4)
        elif attr["room_type"] == "Hotel room":
                room_type.append(3)
        elif attr["room_type"] == "Private room":
                room_type.append(2)
        elif attr["room_type"] == "Shared room":
                room_type.append(1)
        
        s = list(attr["price"])
        price.append(float("".join(s[1:]).replace(',','')))
        
        bathrom.append(float(attr["bathrooms"]))
        bed.append(float(attr["beds"]))
        min_nights.append(int(attr["minimum_nights"]))
        num_review.append(int(attr["number_of_reviews"]))
        num_guests.append(int(attr['guests_included']))
        
        if attr["cancellation_policy"] == "flexible":
                cancellation.append(4)
        elif attr["cancellation_policy"] == "moderate":
                cancellation.append(3)
        elif attr["cancellation_policy"] == "strict_14_with_grace_period":
                cancellation.append(2)
        elif attr["cancellation_policy"] == "strict":
                cancellation.append(1)
        elif attr["cancellation_policy"] == "super_strict_30": 
                cancellation.append(0)
    ran = max(price)-min(price)
    price = [p*5/ran for p in price]

    ran2 = max(min_nights) - min(min_nights)
    min_nights = [nights*5/ran2 for nights in min_nights]

    ran3 = max(num_review) - min(num_review)
    num_review = [review*5/ran3 for review in num_review]

    
    att = [identity, room_type, price, bathrom, bed, min_nights, num_review, num_guests,cancellation]

    df = pd.DataFrame()
    for ii in list(range(len(att))):
        df.loc[:,ii] = att[ii]
    
    userrating = json_data['review_scores_rating']

    
    train_data=df.loc[data['id'].isin(iid)]
    test_data=df.loc[data['id'].isin(iid)==False]
    similarity = []
    ###similarity
    mm = len(test_data)
    nn = len(train_data)
    
    for i in range(mm):
        similarity.append([])
        for j in range(nn):
            d = np.sum(abs(test_data[i:i+1].values- train_data[j:j+1].values))
            sim = math.exp(-d**2)
            similarity[i].append(sim)

    ###rating
    rating = []
    train_rating = userrating.loc[data['id'].isin(iid)]
    for k in range(mm):
        r = [similarity[k][p]*train_rating.iloc[p]/sum(similarity[k]) for p in range(nn)]
        rr = sum(r)
        rating.append(rr)      

    final_data = data.loc[data['id'].isin(iid)==False]
    final_data['rating']= rating
    final_data.sort_values(by = 'rating',ascending= False, axis=0, inplace=True)
    preference = final_data[0:10]
    return preference

pp = preference_list_living(['143096','682065', '3979', '44701', '405623', '682065', '850029', '1292212'])
#print(pp)