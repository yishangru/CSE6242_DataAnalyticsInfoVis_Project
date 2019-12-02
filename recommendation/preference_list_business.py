

def preference_list_business(iid):
    import pandas as pd
    import numpy as np
    import ast
    import math

    csv_data = pd.read_csv("business.csv")
    data = csv_data[['_id','review_count','attributes','longitude','latitude']]
    attributes = data['attributes']

    HasTV=[]
    GoodForKids=[]
    RestaurantsReservations=[]
    OutdoorSeating=[]
    BusinessAcceptsCreditCards=[]
    RestaurantsPriceRange2=[]
    BikeParking =[]
    RestaurantsGoodForGroups = []
    for business in attributes:
        ditt = ast.literal_eval(business)
        if "HasTV" in ditt.keys():
            if ditt['HasTV'] == 'True':
                HasTV.append(1)
            else:
                HasTV.append(0)
        else:
            HasTV.append(0)
        
        if "GoodForKids" in ditt.keys():
            if ditt['GoodForKids'] == 'True':
                GoodForKids.append(1)
            else:
                GoodForKids.append(0)
        else:
            GoodForKids.append(0)
        
        if "RestaurantsReservations" in ditt.keys():
            if ditt['RestaurantsReservations'] == 'True':
                RestaurantsReservations.append(1)
            else:
                RestaurantsReservations.append(0)
        else:
            RestaurantsReservations.append(0)

        if "OutdoorSeating" in ditt.keys():
            if ditt['OutdoorSeating'] == 'True':
                OutdoorSeating.append(1)
            else:
                OutdoorSeating.append(0)
        else:
            OutdoorSeating.append(0)                

        if "BusinessAcceptsCreditCards" in ditt.keys():
            if ditt['BusinessAcceptsCreditCards'] == 'True':
                BusinessAcceptsCreditCards.append(1)
            else:
                BusinessAcceptsCreditCards.append(0)
        else:
            BusinessAcceptsCreditCards.append(0)           
        
        if "RestaurantsPriceRange2" in ditt.keys():
            if ditt['RestaurantsPriceRange2']!= "None":
                RestaurantsPriceRange2.append(int(ditt['RestaurantsPriceRange2']))
            else:
                RestaurantsPriceRange2.append(0)
        else:
            RestaurantsPriceRange2.append(0)

        if "BikeParking" in ditt.keys():
            if ditt['BikeParking'] == 'True':
                BikeParking.append(1)
            else:
                BikeParking.append(0)
        else:
            BikeParking.append(0)        
        
        if "RestaurantsGoodForGroups" in ditt.keys():
            if ditt['RestaurantsGoodForGroups'] == 'True':
                RestaurantsGoodForGroups.append(1)
            else:
                RestaurantsGoodForGroups.append(0)
        else:
            RestaurantsGoodForGroups.append(0)       

    att = [HasTV, GoodForKids, RestaurantsReservations, OutdoorSeating, BusinessAcceptsCreditCards, RestaurantsPriceRange2, BikeParking, RestaurantsGoodForGroups]

    df = pd.DataFrame()
    for ii in list(range(len(att))):
        df.loc[:,ii] = att[ii]
    
    userrating = csv_data['stars']

    
    train_data=df.loc[data['_id'].isin(iid)]
    test_data=df.loc[data['_id'].isin(iid)==False]
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
    train_rating = userrating.loc[data['_id'].isin(iid)]
    for k in range(mm):
        r = [similarity[k][p]*train_rating.iloc[p]/sum(similarity[k]) for p in range(nn)]
        rr = sum(r)
        rating.append(rr)      

    final_data = data.loc[data['_id'].isin(iid)==False]
    final_data['rating']= rating
    final_data.sort_values(by = 'rating',ascending= False, axis=0, inplace=True)
    preference = final_data[0:10]
    return preference, rr

#pp = preference_list_business(['5dc0bcce86ccf7e5fc29b41c','5dc0bcce86ccf7e5fc29b41d'])