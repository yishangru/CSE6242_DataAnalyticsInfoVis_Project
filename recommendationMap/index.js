dataPath = {
	hosts: "./data/airbnb/listing.csv",
	restaurants: "./data/yelp/business.csv",
	attractions: "./data/attractions.csv"
}

var recommendationMap = new recommendationMap("recommendationMap", 10);

var attractionInfoMap = d3.map();
var hostInfoMap = d3.map();
var restaurantInfoMap = d3.map();

/*
structure as {
	attractions: {0-1: array, 1-2: array, 2-3: array, 3-4: array, 4-5: array, 5-6: array},
	restaurants: {0-1: array, 1-2: array, 2-3: array, 3-4: array, 4-5: array, 5-6: array},
	hosts: {0-1: array, 1-2: array, 2-3: array, 3-4: array, 4-5: array, 5-6: array}
}
*/
var attractionAroudMap = d3.map();

Promise.all([
		d3.csv(dataPath.attractions, attractionProcess),
		d3.csv(dataPath.restaurants, restaurantProcess)
	]).then(function(data) {
		let attractionInfoData = d3.nest()
			.key(d=>d.attraction_id)
			.object(data[0]);
		data[0].forEach(function(d) {
			attractionInfoMap.set(d.attraction_id, attractionInfoData[d.attraction_id][0])
		})

		let restaurantInfoData = d3.nest()
			.key(d=>d.restaurant_id)
			.object(data[1]);
		data[1].forEach(function(d) {
			restaurantInfoMap.set(d.restaurant_id, restaurantInfoData[d.restaurant_id][0])
		})
		recommendationMap.initialMap();
});

function attractionProcess(d) {
	return {
		attraction_id: d.id + "_" + d.type,
		id: d.id,
		type: d.type,
		name: d.name,
		latitude: +d.latitude,
		longitude: +d.longitude,
		rating: +d.rating,
		introduction: d.introduction,
		website: d.website
	}
}

function restaurantProcess(d) {
	return {
		restaurant_id: d["business_id"],
		name: d.name,
		star: +d.stars, 
		latitude: +d.latitude,
		longitude: +d.longitude,
		address: d.address,
		reviewCount: +d["review_count"],
		categories: d["categories"].split(",")
	}
}

function hostProcess(d) {

}