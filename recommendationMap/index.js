dataPath = {
	hosts: "./data/hosts.csv",
	restaurants: "./data/business.csv",
	attractions: "./data/attractions.csv"
}

var recommendationMap = new recommendationMap("recommendationMap", 10);

var attractionInfoMap = d3.map();
var hostInfoMap = d3.map();
var restaurantMap = d3.map();

var attractionAroudMap = d3.map();
var restaurantAroundMap = d3.map();
var hostAroundMap = d3.map();


Promise.all([
		d3.csv(dataPath.attractions, attractionProcess),
	]).then(function(data) {
		let attractionInfoData = d3.nest()
			.key(d=>d.attraction_id)
			.object(data[0]);
		data[0].forEach(function(d) {
			attractionInfoMap.set(d.attraction_id, attractionInfoData[d.attraction_id][0])
		})
		initialMap(recommendationMap);
});

function initialMap(MapToInitialization) {
	MapToInitialization.showSelectionArround();
}

function attractionProcess(d) {
	return {
		attraction_id: d.id + d.type,
		attraction_type: d.type,
		latitude: +d.latitude,
		longtitude: +d.longtitude,
		rating: +d.rating,
		introduction: d.introduction,
		website: d.website
	}
}

function restaurantProcess(d) {

}

function hostProcess(d) {

}