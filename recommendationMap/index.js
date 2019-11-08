dataPath = {
	hosts: "./data/hosts.csv",
	restaurants: "./data/business.csv",
	attractions: "./data/attractions.csv"
}

recommendationMap = new recommendationMap("recommendationMap", 10);

Promise.all([]).then(function(data) {
	initialMap(recommendationMap);
});

function initialMap(MapToInitialization) {
	/* initial map:
		1. For coffee compare map, just add all country to its set;
		2. For user preference map, take a country selection set and 
		also a map for coffee for each country in country selection, 
		using ISO3 code as key, a array of coffee as value
	*/	
	MapToInitialization.showSelectionArround();
}