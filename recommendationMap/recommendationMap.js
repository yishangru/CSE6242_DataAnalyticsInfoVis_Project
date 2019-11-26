function recommendationMap(divId, maxZoom) {
	/* add divId of world map */
	this.divId = divId;

	/* add set to record which attraction to show */
	this.attractionSelectedSet = d3.set();
	/* add set to record the selected restaurant */
	this.restaurantSelectedSet = d3.set();
	/* add set to record the selected hosts */
	this.hostSelectedSet = d3.set();
	
	/* radius for show range */
	this.attractionRadiusDef = 5;
	this.restaurantRadiusDef = 3;
	this.hostRadiusDef = 3;

	this.attractionRadius = 5;
	this.restaurantRadius = 3;
	this.hostRadius = 3;

	/* declare meta map attribute */
	var minZoom = 10;
	this.mapInitialCenter = new L.LatLng(36.16991, -115.139832);
	this.mapMaxBoundsZoom = L.latLngBounds(L.latLng(28.16991, -118.139832), L.latLng(44.16991, -112.139832));
	this.mapMaxBounds = L.latLngBounds(L.latLng(36, -115.15), L.latLng(36.34, -115.13));

	d3.select("#" + this.divId).style("width", (window.screen.availWidth - 4) + "px").style("height", (window.screen.availHeight - 75) + "px");
	this.map = L.map(divId, {
		minZoom: minZoom
	}).setView(this.mapInitialCenter, minZoom);
	this.map.associatedMap = this;

	// add pane to map for svg
	this.map.createPane('svgLayer');
	// set the stack position of added pane layer
	this.map.getPane('svgLayer').style.zIndex = 400;
	// make the mouse event go through the event and reach below
	this.map.getPane('svgLayer').style.pointerEvents = 'none';

	// add pane to map for country layer
	this.map.createPane('markerLayer');
	// set the stack position of added pane layer
	this.map.getPane('markerLayer').style.zIndex = 500;

	// add pane to map for country name tooltip
	this.map.createPane('geoLayer');
	// set the stack position of added pane layer
	this.map.getPane('geoLayer').style.zIndex = 300;

	// add tile layer for map
	this.tileLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox.streets',
		accessToken: 'pk.eyJ1IjoiamFnb2R3aW4iLCJhIjoiY2lnOGQxaDhiMDZzMXZkbHYzZmN4ZzdsYiJ9.Uwh_L37P-qUoeC-MBSDteA'
	});

	this.svgLayer = L.svg({
		pane: 'svgLayer'
	});

	/* --------------user preference list & preference search ------------------ */
		this.preferencedivPosition = L.point(-10, 10);
		this.preferenceInfo = L.control({position: 'bottomleft'});
		this.preferenceInfo.associatedMap = this;
		this.preferenceInfo.onAdd = function(map) {
			this._div = L.DomUtil.create('div', 'preferenceInfo');
			return this._div;
		}
		this.preferenceInfo.addTo(this.map);
		let preferencediv = d3.select("#" + this.divId).select(".preferenceInfo")
			.style("width", "370px")
			.style("height", "42px");

		let preferenceForm = preferencediv.append("div");
		preferenceForm.append("button")
			.attr("class", "btn btn-primary active")
			.attr("id", "preferenceSearch")
			.attr("data-type", "Preference Search")
			.datum("Preference Search")
			.text("Preference Search \u2713")
			.style("width", "170px")
			.on("click", toggelSelection);
		preferenceForm.append("button")
			.attr("class", "btn btn-primary")
			.attr("id", "preferenceList")
			.attr("data-type", "Preference List")
			.datum("Preference List")
			.text("Preference List")
			.style("width", "155px")
			.on("click", toggelSelection);
		preferencediv.append("button")
			.attr("type", "button")
			.attr("class", "preferenceButton")
			.text("▲")
			.on("click", expandInfoSection);
		L.DomUtil.setPosition(this.preferenceInfo._div, this.preferencedivPosition);
	/* ------------------------------------------ */

	/* --------------info dash board (right)------------------ */
		this.localPointdivPosition = L.point(0, 0);
		this.yelpdivPosition = L.point(0, 0);
		this.airbnbdivPosition = L.point(0, 0);

		this.localPointInfo = L.control();
		this.localPointInfo.associatedMap = this;
		this.localPointInfo.onAdd = function(map) {
			this._div = L.DomUtil.create('div', 'localPointInfo');
			return this._div;
		}
		this.localPointInfo.addTo(this.map);
		let localPointdiv = d3.select("#" + this.divId).select(".localPointInfo")
			.style("width", "300px")
			.style("height", "42px");

		localPointdiv.append("p")
			.attr("class", "exploreTitle")
			.text("Top Local Attractions");
		localPointdiv.append("button")
			.attr("type", "button")
			.attr("class", "localPointButton")
			.text("▼")
			.on("click", expandInfoSection);
		L.DomUtil.setPosition(this.localPointInfo._div, this.localPointdivPosition);
		
		this.yelpCompareInfo = L.control();
		this.yelpCompareInfo.associatedMap = this;
		this.yelpCompareInfo.onAdd = function(map) {
			this._div = L.DomUtil.create('div', 'yelpCompareInfo');
			return this._div;
		}
		this.yelpCompareInfo.addTo(this.map);
		let yelpdiv = d3.select("#" + this.divId).select(".yelpCompareInfo")
			.style("width", "300px")
			.style("height", "42px");
		yelpdiv.append("p")
			.attr("class", "exploreTitle")
			.text("Explore Top Restaurants");
		yelpdiv.append("button")
			.attr("type", "button")
			.attr("class", "yelpButton")
			.text("▼")
			.on("click", expandInfoSection);
		L.DomUtil.setPosition(this.yelpCompareInfo._div, this.yelpdivPosition);

		this.airbnbCompareInfo = L.control();
		this.airbnbCompareInfo.associatedMap = this;
		this.airbnbCompareInfo.onAdd = function(map) {
			this._div = L.DomUtil.create('div', 'airbnbCompareInfo');
			return this._div;
		}
		this.airbnbCompareInfo.addTo(this.map);
		let airbnbdiv = d3.select("#" + this.divId).select(".airbnbCompareInfo")
			.style("width", "300px")
			.style("height", "42px");
		airbnbdiv.append("p")
			.attr("class", "exploreTitle")
			.text("Explore Top Hosts");
		airbnbdiv.append("button")
			.attr("type", "button")
			.attr("class", "airbnbButton")
			.text("▼")
			.on("click", expandInfoSection);
		L.DomUtil.setPosition(this.airbnbCompareInfo._div, this.airbnbdivPosition);
	/* ------------------------------------------ */

	// add set for showing marker
	this.attractionMarkerMap = d3.map();
	this.attractionShowSet = d3.set();

	this.restaurantMarkerMap = d3.map();
	this.restaurantShowSet = d3.set();

	this.hostMarkerMap = d3.map();
	this.hostShowSet = d3.set();

	// default layer order: tile, GeoJSON, Marker shadows, Marker icons, Popups
	this.tileLayer.addTo(this.map);
	this.tileLayer.associatedMap = this;
	this.svgLayer.addTo(this.map);
	this.svgLayer.associatedMap = this;
	d3.select("#" + this.divId).select("svg").attr("id", this.divId + "geoSvg");
}

/* for map style */
recommendationMap.prototype.AttractionRangeStyle = function(f) {
    return {
        weight: 4,
        opacity: 0.7,
        color: '#fc8d62',
        dashArray: '2',
        fillOpacity: 0.6,
        fillColor: '#8dd3c7'
    }
}

recommendationMap.prototype.HostRangeStyle = function(f) {
    return {
        weight: 4,
        opacity: 0.7,
        color: '#e78ac3',
        dashArray: '2',
        fillOpacity: 0.6,
        fillColor: '#8da0cb'
    }
}

recommendationMap.prototype.RestaurantRangeStyle = function(f) {
    return {
        weight: 4,
        opacity: 0.7,
        color: '#7570b3',
        dashArray: '2',
        fillOpacity: 0.6,
        fillColor: '#fbb4ae'
    }
}

/* end map style */

/* for map function */
recommendationMap.prototype.initialMap = function() {
	this.map.on('zoomend', updateZoomDemo);
	let associatedMap = this;
	attractionInfoMap.keys().forEach(function(d) {
		associatedMap.attractionShowSet.add(d);
	})
	updateZoomDemo.call(this.map);
}

/* update all marker in show set */
recommendationMap.prototype.updateAttractionMarker = function() {
	let associatedMap = this;
	this.attractionShowSet.each(function(d){
		associatedMap.updateAttractionMarkerShow(d);
	});
}

/* update one marker in show set, if not exist, create */
recommendationMap.prototype.updateAttractionMarkerShow = function(attractionId) {
	let associatedMap = this;
	let attractionInfo = attractionInfoMap.get(attractionId);
		
	if(!associatedMap.attractionMarkerMap.has(attractionId)){
		/* create marker group */
		let attractionMarkerGroup = [
			L.marker([attractionInfo.latitude, attractionInfo.longitude]), // image or icon
			L.marker([attractionInfo.latitude, attractionInfo.longitude]), // rating icon
			L.marker([attractionInfo.latitude, attractionInfo.longitude]), // add preference list
			L.marker([attractionInfo.latitude, attractionInfo.longitude]), // checked marked
		];

		associatedMap.attractionMarkerMap.set(attractionId, attractionMarkerGroup);
		
		attractionMarkerGroup[0].attractionId = attractionId;
		attractionMarkerGroup[0].associatedMap = associatedMap;

		attractionMarkerGroup[0].on("mouseover", function(e){
			this.openPopup();
		});
		attractionMarkerGroup[0].on("mouseout", function(e){
			this.closePopup();
		});
		attractionMarkerGroup[0].on("click", function(e){
			let associatedMap = this.associatedMap
			let checkedMarker = associatedMap.attractionMarkerMap.get(this.attractionId)[3];
			
			/* if already selected, change to unselected */
			if (associatedMap.attractionSelectedSet.has(this.attractionId)){
				associatedMap.attractionSelectedSet.remove(this.attractionId);
				associatedMap.map.removeLayer(checkedMarker);
			} else {
				associatedMap.generateAroundInfo(this.attractionId);
				associatedMap.attractionSelectedSet.add(this.attractionId);
				checkedMarker.addTo(associatedMap.map);
			}
			associatedMap.showSelectedAttractionRange();

			associatedMap.updateRestaurantMarker(true);
			associatedMap.updateHostMarker(true);
		})

		attractionMarkerGroup[2].associatedMap = associatedMap;
		attractionMarkerGroup[2].attractionId = attractionId;

		/* wait to add : final verison */
		attractionMarkerGroup[2].on("click", function(e){
			/* add to preference list, not implement yet*/
		})
	}
	/* remove already added marker for enlarge zoom event */
	associatedMap.attractionMarkerMap.get(attractionId).forEach(function(d) {
		associatedMap.map.removeLayer(d);
	})

	let widthIcon = 80;
	let heightIcon = 60;
	let attractionMarkerGroup = associatedMap.attractionMarkerMap.get(attractionId);
	let scaleFactor = 1 + 6 * (associatedMap.map.getZoom()/(associatedMap.map.getMinZoom() + 2) - 1);
	
	/* 0 as image */
		attractionMarkerGroup[0].setIcon( L.icon({
			iconUrl: "./data/" + attractionInfo["type"] + "s_pictures/resize/" + attractionInfo["id"] + ".jpg",
			iconSize: [Math.round(widthIcon * scaleFactor), Math.round(heightIcon * scaleFactor)],
			iconAnchor: [Math.round(widthIcon/2 * scaleFactor), Math.round(heightIcon/2 * scaleFactor)],
			popupAnchor: [-3, 76],
			className: "mapIcon"
		}));
		/* bind tooltip to the marker */
		let tooltipContent = '<h4>' + attractionInfo["name"] + '</h4>\
			Introduction:<br/>' + attractionInfo["introduction"] + '<br/>\
			Website:&nbsp;<p>' + attractionInfo["website"] + '</p>';
		attractionMarkerGroup[0].bindTooltip(tooltipContent, {
			className: "attractionToolTip",
			offset: [0, -1 * Math.round((heightIcon/2 + 4) * scaleFactor)],
			direction: "top"
		})
		attractionMarkerGroup[0].addTo(associatedMap.map);

	/* 1 as rating */
		let attractionRating = Math.floor(attractionInfo["rating"])
		let half = "";
		if (attractionInfo["rating"] - attractionRating <= 0.8 && attractionInfo["rating"] - attractionRating >= 0.5){
			half = "-half";
		} else if (attractionInfo["rating"] - attractionRating > 0.8) {
			attractionRating += 1;
		}

		let accumentStar = (half == ""? attractionRating : attractionRating + 0.5); 
		attractionMarkerGroup[1].setIcon( L.icon({
			iconUrl: "./recommendationMap/Icon/rates/" + attractionRating + half + ".png",
			iconSize: [Math.round(13 * accumentStar * scaleFactor), Math.round(15 * scaleFactor)],
			iconAnchor: [Math.round((widthIcon/2 - (widthIcon - 13 * accumentStar)/2) * scaleFactor), -1 * Math.round(heightIcon/2 * scaleFactor)]
		}));
		attractionMarkerGroup[1].addTo(associatedMap.map);

	/* 2 as add preference list */
		attractionMarkerGroup[2].setIcon( L.icon({
			iconUrl: "./recommendationMap/Icon/plus.png",
			iconSize: [Math.round(30 * scaleFactor), Math.round(30 * scaleFactor)],
			iconAnchor: [-1 * Math.round(widthIcon/2 * scaleFactor), Math.round(heightIcon/2 * scaleFactor)],
			popupAnchor: [-3, 76]
		}));
		attractionMarkerGroup[2].addTo(associatedMap.map);

	/* 3 as checked symbol */
		attractionMarkerGroup[3].setIcon( L.icon({
			iconUrl: "./recommendationMap/Icon/selected.png",
			iconSize: [Math.round(30 * scaleFactor), Math.round(30 * scaleFactor)],
			iconAnchor: [ Math.round(30/2 * scaleFactor), -1 * Math.round((30 - heightIcon/2) * scaleFactor)],
			popupAnchor: [-3, 76]
		}));
		if (associatedMap.attractionSelectedSet.has(attractionId)){
			attractionMarkerGroup[3].addTo(associatedMap.map);
		}
}


/* generate distance for restaurant and host */
recommendationMap.prototype.generateAroundInfo = function(attractionId) {
	let associatedMap = this;
	let attractionInfoData = attractionInfoMap.get(attractionId);
	/* first check default km range, deafult as 5, 3, 3 */
	if (!attractionAroundMap.has(attractionId)) {
		attractionAroundMap.set(attractionId, {restaurants: d3.map(), hosts: d3.map()});
	}
	attractionAroundData = attractionAroundMap.get(attractionId);
	if (!attractionAroundData["restaurants"].has(associatedMap.attractionRadiusDef)) {
		let aroundRestaurants = d3.set();
		let from = turf.point([attractionInfoData["longitude"], attractionInfoData["latitude"]]);
		let options = {units: 'kilometers'};
		restaurantInfoMap.each(function(d) {
			let to = turf.point([d["longitude"], d["latitude"]]);
			if (turf.distance(from, to, options) <= associatedMap.attractionRadiusDef) {
				aroundRestaurants.add(d["restaurant_id"]);
			} 
		})
		attractionAroundData["restaurants"].set(associatedMap.attractionRadiusDef, aroundRestaurants);
	}

	if (!attractionAroundData["hosts"].has(associatedMap.attractionRadiusDef)) {
		let aroundHosts = d3.set();
		let from = turf.point([attractionInfoData["longitude"], attractionInfoData["latitude"]]);
		let options = {units: 'kilometers'};
		hostInfoMap.each(function(d) {
			let to = turf.point([d["longitude"], d["latitude"]]);
			if (turf.distance(from, to, options) <= associatedMap.attractionRadiusDef) {
				aroundHosts.add(d["host_id"]);
			} 
		})
		attractionAroundData["hosts"].set(associatedMap.attractionRadiusDef, aroundHosts);
	}

	if (!attractionAroundData["restaurants"].has(associatedMap.attractionRadius)) {
		let aroundRestaurants = d3.set();
		let from = turf.point([attractionInfoData["longitude"], attractionInfoData["latitude"]]);
		let options = {units: 'kilometers'};
		attractionAroundData["restaurants"].get(associatedMap.attractionRadiusDef).each(function(d) {
			let restaurantInfoData = restaurantInfoMap.get(d);
			let to = turf.point([restaurantInfoData["longitude"], restaurantInfoData["latitude"]]);
			if (turf.distance(from, to, options) <= associatedMap.attractionRadius) {
				aroundRestaurants.add(restaurantInfoData["restaurant_id"]);
			} 
		})
		attractionAroundData["restaurants"].set(associatedMap.attractionRadius, aroundRestaurants);
	}

	if (!attractionAroundData["hosts"].has(associatedMap.attractionRadius)) {
		let aroundHosts = d3.set();
		let from = turf.point([attractionInfoData["longitude"], attractionInfoData["latitude"]]);
		let options = {units: 'kilometers'};
		attractionAroundData["hosts"].get(associatedMap.attractionRadiusDef).each(function(d) {
			let hostInfoData = hostInfoMap.get(d);
			let to = turf.point([hostInfoData["longitude"], hostInfoData["latitude"]]);
			if (turf.distance(from, to, options) <= associatedMap.attractionRadius) {
				aroundHosts.add(hostInfoData["host_id"]);
			} 
		})
		attractionAroundData["hosts"].set(associatedMap.attractionRadius, aroundHosts);
	}
}


/* show geo range for selected attraction */
recommendationMap.prototype.showSelectedAttractionRange = function() {
	let associatedMap = this;
	/* 	this.attractionSelectedSet changed, use 5km for testing */
	if(this.AttractionSelectionRangeLayer != undefined) {
		this.map.removeLayer(this.AttractionSelectionRangeLayer);
	}

	/* change to take input later */
	if (this.attractionSelectedSet.size() >= 1){
		let featureCollection = [];
		let options = {steps: 12, units: 'kilometers'};
		this.attractionSelectedSet.each(function(d) {
			let attractionInfoData = attractionInfoMap.get(d);
			let center = [attractionInfoData["longitude"], attractionInfoData["latitude"]];
			featureCollection.push(turf.circle(center, associatedMap.attractionRadius, options));
		})
		let unionFeature = featureCollection[0];
		for (var i = 0; i < featureCollection.length - 1; i++) {
			unionFeature = turf.union(unionFeature, featureCollection[i+1]);
		}

		/* show on map */
		this.AttractionSelectionRangeLayer  = L.geoJSON([unionFeature], {
			style: this.AttractionRangeStyle,
			pane: "geoLayer"
		})
		this.AttractionSelectionRangeLayer.addTo(this.map);
	}
}

/* batch update restaurant marker */
recommendationMap.prototype.updateRestaurantMarker = function(whetherUpdate) {
	/* 
	When new attraction is selected, read selection;
	For all attraction selection, update them
	*/
	let associatedMap = this;
	if (whetherUpdate) {
		associatedMap.restaurantShowSet.each(function(restaurantId) {
			associatedMap.restaurantMarkerMap.get(restaurantId).forEach(function(d) {
			associatedMap.map.removeLayer(d);
		})});
		associatedMap.restaurantShowSet.clear();

		associatedMap.attractionSelectedSet.each(function(d) {
			attractionAroundMap.get(d)["restaurants"].get(associatedMap.attractionRadius).each(function(d) {
				associatedMap.restaurantShowSet.add(d);
			});
		});
		associatedMap.restaurantSelectedSet.each(function(d) {
			associatedMap.restaurantShowSet.add(d);
		});
	}
	associatedMap.restaurantShowSet.each(function(d) {
		associatedMap.updateRestaurantMarkerShow(d);
	});
}

/* update single restaurant marker */
recommendationMap.prototype.updateRestaurantMarkerShow = function(restaurantId) {
	let associatedMap = this;
	let restaurantInfo = restaurantInfoMap.get(restaurantId);
		
	if(!associatedMap.restaurantMarkerMap.has(restaurantId)){
		/* create marker group */
		let restaurantMarkerGroup = [
			L.marker([restaurantInfo.latitude, restaurantInfo.longitude]), // image or icon
			L.marker([restaurantInfo.latitude, restaurantInfo.longitude]), // add preference list
			L.marker([restaurantInfo.latitude, restaurantInfo.longitude]), // add for selected
		];

		associatedMap.restaurantMarkerMap.set(restaurantId, restaurantMarkerGroup);
		
		restaurantMarkerGroup[0].restaurantId = restaurantId;
		restaurantMarkerGroup[0].associatedMap = associatedMap;

		restaurantMarkerGroup[0].on("mouseover", function(e){
			this.openPopup();
		});
		restaurantMarkerGroup[0].on("mouseout", function(e){
			this.closePopup();
		});
		restaurantMarkerGroup[0].on("click", function(e){
			let associatedMap = this.associatedMap
			let checkedMarker = associatedMap.restaurantMarkerMap.get(this.restaurantId)[2];
			
			/* if already selected, change to unselected */
			if (associatedMap.restaurantSelectedSet.has(this.restaurantId)){
				associatedMap.restaurantSelectedSet.remove(this.restaurantId);
				associatedMap.map.removeLayer(checkedMarker);
			} else {
				associatedMap.restaurantSelectedSet.add(this.restaurantId);
				checkedMarker.addTo(associatedMap.map);
			}
			associatedMap.showSelectedRestaurantRange();
		})

		restaurantMarkerGroup[1].associatedMap = associatedMap;
		restaurantMarkerGroup[1].restaurantId = restaurantId;
		
		/* wait to add : final verison */
		restaurantMarkerGroup[1].on("click", function(e){
			/* add to preference list, not implement yet*/
		})
	}
	/* remove already added marker for enlarge zoom event */
	associatedMap.restaurantMarkerMap.get(restaurantId).forEach(function(d) {
		associatedMap.map.removeLayer(d);
	})

	let widthIcon = 15;
	let heightIcon = 15;
	let restaurantMarkerGroup = associatedMap.restaurantMarkerMap.get(restaurantId);
	let scaleFactor = 1 + 6 * (associatedMap.map.getZoom()/(associatedMap.map.getMinZoom() + 2) - 1);
	
	/* 0 as image */
		let iconRestaurant = L.icon({
			iconUrl: restaurantInfo["star"] >= 4.5? "./recommendationMap/Icon/restaurant1.png" : "./recommendationMap/Icon/restaurant2.png",
			iconSize: [Math.round(widthIcon * scaleFactor), Math.round(heightIcon * scaleFactor)],
			iconAnchor: [Math.round(widthIcon/2 * scaleFactor), Math.round(heightIcon/2 * scaleFactor)],
			popupAnchor: [-3, 76],
			className: "mapIcon"
		})
		restaurantMarkerGroup[0].setIcon(iconRestaurant);
		/* bind tooltip to the marker */
		let tooltipContent = '<h4>' + restaurantInfo["name"] + '</h4>\
			Star:&nbsp;' + restaurantInfo["star"] + '/5<br>\
			Address:&nbsp;' + restaurantInfo["address"] + '<br>\
			Popularity (Review Count):&nbsp;' + restaurantInfo["reviewCount"] + '<br>\
			Categories:&nbsp;<p>' + restaurantInfo["categories"] + '</p>';
		restaurantMarkerGroup[0].bindTooltip(tooltipContent, {
			className: "restaurantToolTip",
			offset: [0, -1 * Math.round((heightIcon/2 + 4) * scaleFactor)],
			direction: "top"
		})
		restaurantMarkerGroup[0].addTo(associatedMap.map);


	/* 1 as add preference list */
		restaurantMarkerGroup[1].setIcon(L.icon({
			iconUrl: "./recommendationMap/Icon/plus.png",
			iconSize: [Math.round(10 * scaleFactor), Math.round(10 * scaleFactor)],
			iconAnchor: [-1 * Math.round(widthIcon/2 * scaleFactor), Math.round(heightIcon/2 * scaleFactor)],
			popupAnchor: [-3, 76]
		}));
		restaurantMarkerGroup[1].addTo(associatedMap.map);

	/* 2 as checked symbol */
		restaurantMarkerGroup[2].setIcon( L.icon({
			iconUrl: "./recommendationMap/Icon/yelp-pointer.png",
			iconSize: [Math.round(26 * scaleFactor), Math.round(30 * scaleFactor)],
			iconAnchor: [ Math.round(26/2 * scaleFactor), Math.round(30* scaleFactor)],
			popupAnchor: [-3, 76]
		}));
		if (associatedMap.restaurantSelectedSet.has(restaurantId)){
			restaurantMarkerGroup[2].addTo(associatedMap.map);
		}
}

/* show geo range for selected restaurant */
recommendationMap.prototype.showSelectedRestaurantRange = function() {
	let associatedMap = this;
	/* 	this.attractionSelectedSet changed, use 5km for testing */
	if(this.RestaurantSelectionRangeLayer != undefined) {
		this.map.removeLayer(this.RestaurantSelectionRangeLayer);
	}

	/* change to take input later */
	if (this.restaurantSelectedSet.size() >= 1){
		let featureCollection = [];
		let options = {steps: 12, units: 'kilometers'};
		this.restaurantSelectedSet.each(function(d) {
			let restaurantInfoData = restaurantInfoMap.get(d);
			let center = [restaurantInfoData["longitude"], restaurantInfoData["latitude"]];
			featureCollection.push(turf.circle(center, associatedMap.restaurantRadius, options));
		})
		let unionFeature = featureCollection[0];
		for (var i = 0; i < featureCollection.length - 1; i++) {
			unionFeature = turf.union(unionFeature, featureCollection[i+1]);
		}

		/* show on map */
		this.RestaurantSelectionRangeLayer  = L.geoJSON([unionFeature], {
			style: this.RestaurantRangeStyle,
			pane: "geoLayer"
		})
		this.RestaurantSelectionRangeLayer.addTo(this.map);
	}
}

/* batch update host marker */
recommendationMap.prototype.updateHostMarker = function(whetherUpdate) {
	/* 
	When new attraction is selected, read selection;
	For all attraction selection, update them
	*/
	let associatedMap = this;
	if (whetherUpdate) {
		associatedMap.hostShowSet.each(function(hostId) {
			associatedMap.hostMarkerMap.get(hostId).forEach(function(d) {
			associatedMap.map.removeLayer(d);
		})});
		associatedMap.hostShowSet.clear();
		associatedMap.attractionSelectedSet.each(function(d) {
			attractionAroundMap.get(d)["hosts"].get(associatedMap.attractionRadius).each(function(d) {
				associatedMap.hostShowSet.add(d);
			});
		});
		associatedMap.hostSelectedSet.each(function(d) {
			associatedMap.hostShowSet.add(d);
		});
	}
	associatedMap.hostShowSet.each(function(d) {
		associatedMap.updateHostMarkerShow(d);
	});
}

/* update single restaurant marker */
recommendationMap.prototype.updateHostMarkerShow = function(hostId) {
	let associatedMap = this;
	let hostInfo = hostInfoMap.get(hostId);
		
	if(!associatedMap.hostMarkerMap.has(hostId)){
		/* create marker group */
		let hostMarkerGroup = [
			L.marker([hostInfo.latitude, hostInfo.longitude]), // image or icon
			L.marker([hostInfo.latitude, hostInfo.longitude]), // add preference list
			L.marker([hostInfo.latitude, hostInfo.longitude]), // add for selected
		];

		associatedMap.hostMarkerMap.set(hostId, hostMarkerGroup);
		
		hostMarkerGroup[0].hostId = hostId;
		hostMarkerGroup[0].associatedMap = associatedMap;

		hostMarkerGroup[0].on("mouseover", function(e){
			this.openPopup();
		});
		hostMarkerGroup[0].on("mouseout", function(e){
			this.closePopup();
		});
		hostMarkerGroup[0].on("click", function(e){
			let associatedMap = this.associatedMap
			let checkedMarker = associatedMap.hostMarkerMap.get(this.hostId)[2];
			
			/* if already selected, change to unselected */
			if (associatedMap.hostSelectedSet.has(this.hostId)){
				associatedMap.hostSelectedSet.remove(this.hostId);
				associatedMap.map.removeLayer(checkedMarker);
			} else {
				associatedMap.hostSelectedSet.add(this.hostId);
				checkedMarker.addTo(associatedMap.map);
			}
			associatedMap.showSelectedHostsRange();
		})

		hostMarkerGroup[1].associatedMap = associatedMap;
		hostMarkerGroup[1].hostId = hostId;

		/* wait to add : final verison */
		hostMarkerGroup[1].on("click", function(e){
			/* add to preference list, not implement yet*/
		})
	}
	/* remove already added marker for enlarge zoom event */
	associatedMap.hostMarkerMap.get(hostId).forEach(function(d) {
		associatedMap.map.removeLayer(d);
	})

	let widthIcon = 15;
	let heightIcon = 15;
	let hostMarkerGroup = associatedMap.hostMarkerMap.get(hostId);
	let scaleFactor = 1 + 6 * (associatedMap.map.getZoom()/(associatedMap.map.getMinZoom() + 2) - 1);
	
	/* 0 as image */
		let iconhost = L.icon({
			iconUrl: hostInfo["rating"] >= 98? "./recommendationMap/Icon/host3.png" : "./recommendationMap/Icon/host2.png",
			iconSize: [Math.round(widthIcon * scaleFactor), Math.round(heightIcon * scaleFactor)],
			iconAnchor: [Math.round(widthIcon/2 * scaleFactor), Math.round(heightIcon/2 * scaleFactor)],
			popupAnchor: [-3, 76],
			className: "mapIcon"
		})
		hostMarkerGroup[0].setIcon(iconhost);
		/* bind tooltip to the marker */
		let tooltipContent = '<h4>' + hostInfo["name"] + '</h4>\
			Rating:&nbsp;&nbsp;' + hostInfo["rating"] + '/100<br>\
			Price:&nbsp;&nbsp;' + hostInfo["price"] + '<br>\
			Type:&nbsp;&nbsp;' + hostInfo["type"] + '<br>\
			Popularity (Review Count):&nbsp;&nbsp;' + hostInfo["reviewCount"] + '<br>\
			Amenities:<br><p>' + hostInfo["amenities"] + '</p><br>\
			Neightbor Overview:<br><p>' + hostInfo["neightborOverview"];
			//Description:<br><p>' + hostInfo["description"] + '</p><br>\
		
		hostMarkerGroup[0].bindTooltip(tooltipContent, {
			className: "hostToolTip",
			offset: [0, -1 * Math.round((heightIcon/2 + 4) * scaleFactor)],
			direction: "top"
		})
		hostMarkerGroup[0].addTo(associatedMap.map);


	/* 1 as add preference list */
		hostMarkerGroup[1].setIcon(L.icon({
			iconUrl: "./recommendationMap/Icon/plus.png",
			iconSize: [Math.round(10 * scaleFactor), Math.round(10 * scaleFactor)],
			iconAnchor: [-1 * Math.round(widthIcon/2 * scaleFactor), Math.round(heightIcon/2 * scaleFactor)],
			popupAnchor: [-3, 76]
		}));
		hostMarkerGroup[1].addTo(associatedMap.map);

	/* 2 as checked symbol */
		hostMarkerGroup[2].setIcon( L.icon({
			iconUrl: "./recommendationMap/Icon/host-pointer.png",
			iconSize: [Math.round(26 * scaleFactor), Math.round(30 * scaleFactor)],
			iconAnchor: [ Math.round(26/2 * scaleFactor), Math.round(30* scaleFactor)],
			popupAnchor: [-3, 76]
		}));
		if (associatedMap.hostSelectedSet.has(hostId)){
			hostMarkerGroup[2].addTo(associatedMap.map);
		}
}

/* show geo range for selected host */
recommendationMap.prototype.showSelectedHostsRange = function() {
	let associatedMap = this;
	/* 	this.attractionSelectedSet changed, use 5km for testing */
	if(this.HostSelectionRangeLayer != undefined) {
		this.map.removeLayer(this.HostSelectionRangeLayer);
	}

	/* change to take input later */
	if (this.hostSelectedSet.size() >= 1){
		let featureCollection = [];
		let options = {steps: 12, units: 'kilometers'};
		this.hostSelectedSet.each(function(d) {
			let hostInfoData = hostInfoMap.get(d);
			let center = [hostInfoData["longitude"], hostInfoData["latitude"]];
			featureCollection.push(turf.circle(center, associatedMap.hostRadius, options));
		})
		let unionFeature = featureCollection[0];
		for (var i = 0; i < featureCollection.length - 1; i++) {
			unionFeature = turf.union(unionFeature, featureCollection[i+1]);
		}

		/* show on map */
		this.HostSelectionRangeLayer  = L.geoJSON([unionFeature], {
			style: this.HostRangeStyle,
			pane: "geoLayer"
		})
		this.HostSelectionRangeLayer.addTo(this.map);
	}
}

/* end map function */

/* for map interaction */
function updateZoomDemo(e) {

	let associatedMap = this.associatedMap;
	let geoSvg = d3.select("#" + associatedMap.divId).select("#" + associatedMap.divId + "geoSvg");

	let mapTitleGroup = geoSvg.select("#" + associatedMap.divId + "mapTitleGroup");

	if (this.getZoom()  < this.getMinZoom() + 1){
		/* display welcome text */
		associatedMap.map.setMaxBounds(associatedMap.mapMaxBounds);
		associatedMap.map.flyToBounds(associatedMap.mapMaxBounds);

		associatedMap.map.setView(associatedMap.mapInitialCenter);
		/* 
		if (this.getZoom() == this.getMinZoom()) {
			mapTitleImage.style("width", "460px").style("height", "430px")
				.attr("transform", "rotate(-8,100,100)translate(" + (mapCenter.x - 500) + "," + (mapCenter.y - 300) + ")");
			mapTitleText.attr("transform", "translate(" + (mapCenter.x - 50) + "," + (mapCenter.y + 300) + ")").style("font-size", "220px");
		} else if (this.getZoom() == this.getMinZoom() + 1) {
			mapTitleImage.style("width", "460px").style("height", "440px")
				.attr("transform", "rotate(-8,100,100)translate(" + (mapCenter.x - 600) + "," + (mapCenter.y - 350) + ")");
			mapTitleText.attr("transform", "translate(" + (mapCenter.x - 50) + "," + (mapCenter.y + 280) + ")").style("font-size", "200px");
		}
		*/

		/* clear all selectedSet, back to original view */
		associatedMap.attractionSelectedSet.clear();
		associatedMap.restaurantSelectedSet.clear();
		associatedMap.hostSelectedSet.clear();

		/* update for marker */
		associatedMap.updateAttractionMarker();
		associatedMap.showSelectedAttractionRange();
		
		/* update for restaurant and host */
		associatedMap.updateRestaurantMarker(true);
		associatedMap.showSelectedRestaurantRange();
		associatedMap.updateHostMarker(true);
		associatedMap.showSelectedHostsRange();

		let mapCenter = associatedMap.map.latLngToLayerPoint(associatedMap.mapInitialCenter);
		
		if (mapTitleGroup.empty()){
			mapTitleGroup = geoSvg.append("g").attr("id", associatedMap.divId + "mapTitleGroup");
			mapTitleGroup.append("image").attr("id", associatedMap.divId + "mapTitleImage")
				.attr("href", "/recommendationMap/lasVegasTrans.png");
			mapTitleGroup.append("text").attr("id", associatedMap.divId + "mapTitleText")
				.text("Explore Local Greatness");
		};

		let mapTitleText = mapTitleGroup.select("#" + associatedMap.divId + "mapTitleText");
		let mapTitleImage = mapTitleGroup.select("#" + associatedMap.divId + "mapTitleImage");

		mapTitleImage.style("width", "460px").style("height", "430px")
			.transition()
			.attr("transform", "translate(" + (mapCenter.x - 450) + "," + (mapCenter.y - 370) + ")rotate(-12,100,100)")
			.duration(300);
		mapTitleText.style("font-size", "220px")
			.attr("transform", "translate(" + (2 * mapCenter.x) + "," + (2 * mapCenter.y) + ")")
			.transition()
			.attr("transform", "translate(" + (mapCenter.x - 30) + "," + (mapCenter.y + 280) + ")")
			.duration(300);

	} else {
		/* not back to original states */
		associatedMap.map.setMaxBounds(associatedMap.mapMaxBoundsZoom);
		
		/* remove welcome text */
		if (!mapTitleGroup.empty()) {
			mapTitleGroup.remove();
		}

		/* selected set not change */
		associatedMap.updateAttractionMarker();
		associatedMap.updateRestaurantMarker(false);
		associatedMap.updateHostMarker(false);
	}
}

function expandInfoSection(e){
	let buttonClass = d3.select(this).attr("class").toString();

	if (d3.select(this.parentNode).style("height") !== "42px") {
		d3.select(this.parentNode).style("height", "42px");
		if (buttonClass === "preferenceButton") {
			d3.select(this).text("▲");
			d3.select(this.parentNode).select("#showPreference").remove();
		} else {
			/* for dash board top right */
			d3.select(this).text("▼");
			d3.select(this.parentNode).select(".infoTable").remove();
		}
		return;
	}

	if (buttonClass === "yelpButton") {
		d3.select(this.parentNode).style("height", "350px");
		d3.select(this).text("▲");
		let appenddiv = d3.select(this.parentNode).append("div").attr("class", "infoTable");
		appenddiv.selectAll("button").data(topRestaurants)
			.enter().append("button").attr("class", "restaurantInfo").style("width", "280px").style("height", "27px").text(d=>d.name + "--" + d.star + "/5")
			.on("click", function(e) {
				/* add as selection, set map view, zoom */
				let restaurantInfoData = d3.select(this).datum();
				if (!recommendationMap.restaurantSelectedSet.has(restaurantInfoData["restaurant_id"])){
					recommendationMap.map.setZoom(12);
					d3.select(this).style("background", "rgba(255,255,255, 1)");
					recommendationMap.restaurantSelectedSet.add(restaurantInfoData["restaurant_id"]);
					recommendationMap.restaurantShowSet.add(restaurantInfoData["restaurant_id"]);
					recommendationMap.updateRestaurantMarkerShow(restaurantInfoData["restaurant_id"]);
					recommendationMap.showSelectedRestaurantRange();
					recommendationMap.map.setView(new L.LatLng(restaurantInfoData["latitude"], restaurantInfoData["longitude"]));
				} else {
					d3.select(this).style("background", "rgba(255,255,255, 0.1)");
					recommendationMap.restaurantSelectedSet.remove(restaurantInfoData["restaurant_id"]);
					recommendationMap.restaurantShowSet.remove(restaurantInfoData["restaurant_id"]);
					recommendationMap.restaurantMarkerMap.get(restaurantInfoData["restaurant_id"]).forEach(function(d) {
						recommendationMap.map.removeLayer(d);
					});
					recommendationMap.showSelectedRestaurantRange();
					recommendationMap.map.setView(recommendationMap.mapInitialCenter);
				}

			});
		appenddiv.append("p").text("To Be Continued ......");
	} else if (buttonClass === "airbnbButton") {
		d3.select(this.parentNode).style("height", "350px");
		d3.select(this).text("▲");
		let appenddiv = d3.select(this.parentNode).append("div").attr("class", "infoTable");
		appenddiv.selectAll("button").data(topHosts)
			.enter().append("button").attr("class", "hostInfo").style("width", "280px").style("height", "27px").text(function(d) {
				if (d.name.length >= 20) {
					return d.type + "-" + d.host_id + "--" + (d.rating/20) + "/5"
				} else {
					return d.name + "--" + (d.rating/20) + "/5";
				}
			})
			.on("click", function(e) {
				/* add as selection, set map view, zoom */
				let hostInfoData = d3.select(this).datum();
				if (!recommendationMap.hostSelectedSet.has(hostInfoData["host_id"])){
					recommendationMap.map.setZoom(12);
					d3.select(this).style("background", "rgba(255,255,255, 1)");
					recommendationMap.hostSelectedSet.add(hostInfoData["host_id"]);
					recommendationMap.hostShowSet.add(hostInfoData["host_id"]);
					recommendationMap.updateHostMarkerShow(hostInfoData["host_id"]);
					recommendationMap.showSelectedHostsRange();
					recommendationMap.map.setView(new L.LatLng(hostInfoData["latitude"], hostInfoData["longitude"]));
				} else {
					d3.select(this).style("background", "rgba(255,255,255, 0.1)");
					recommendationMap.hostSelectedSet.remove(hostInfoData["host_id"]);
					recommendationMap.hostShowSet.remove(hostInfoData["host_id"]);
					recommendationMap.hostMarkerMap.get(hostInfoData["host_id"]).forEach(function(d) {
						recommendationMap.map.removeLayer(d);
					});
					recommendationMap.showSelectedHostsRange();
					recommendationMap.map.setView(recommendationMap.mapInitialCenter);
				}

			});
		appenddiv.append("p").text("To Be Continued ......");
	} else if (buttonClass === "localPointButton") {
		d3.select(this.parentNode).style("height", "350px");
		d3.select(this).text("▲");
		let appenddiv = d3.select(this.parentNode).append("div").attr("class", "infoTable");
		appenddiv.selectAll("button").data(topAttractions)
			.enter().append("button").attr("class", "attractionInfo").style("width", "280px").style("height", "27px").text(d=>d.name + "--" + d.rating + "/5")
			.on("click", function(e) {
				/* add as selection, set map view, zoom */
				let attractionInfoData = d3.select(this).datum();
				if (!recommendationMap.attractionSelectedSet.has(attractionInfoData["attraction_id"])){
					recommendationMap.map.setZoom(12);
					recommendationMap.generateAroundInfo(attractionInfoData["attraction_id"]);
					d3.select(this).style("background", "rgba(255,255,255, 1)")
					recommendationMap.attractionSelectedSet.add(attractionInfoData["attraction_id"]);
					recommendationMap.updateAttractionMarkerShow(attractionInfoData["attraction_id"]);
					recommendationMap.showSelectedAttractionRange();
					recommendationMap.updateRestaurantMarker(true);
					recommendationMap.updateHostMarker(true);
					recommendationMap.map.setView(new L.LatLng(attractionInfoData["latitude"], attractionInfoData["longitude"]));
					/* show around info */

				} else {
					d3.select(this).style("background", "rgba(255,255,255, 0.1)")
					recommendationMap.attractionSelectedSet.remove(attractionInfoData["attraction_id"]);
					recommendationMap.updateAttractionMarkerShow(attractionInfoData["attraction_id"]);
					recommendationMap.showSelectedAttractionRange();
					recommendationMap.updateRestaurantMarker(true);
					recommendationMap.updateHostMarker(true);
					recommendationMap.map.setView(recommendationMap.mapInitialCenter);
					/* show around info */
				}
			});
		appenddiv.append("p").text("To Be Continued ......");
	} else if (buttonClass === "preferenceButton") {
		d3.select(this.parentNode).style("height", "400px");
		d3.select(this).text("▼");
		updatePreferencePanel(this.parentNode);
	}
}

function toggelSelection(e){
	if (!d3.select(this).classed('active')) {
		presentActive = d3.select(this.parentNode).select(".btn.btn-primary.active")
			.text(d=>d)
			.classed('active', false);
		d3.select(this)
			.text(function(d) {
				return d + " \u2713";
			})
			.classed('active', true);
		updatePreferencePanel(this.parentNode.parentNode);
	}
}

/* wait to add : final verison */
function updatePreferencePanel(preferenceDiv) {
	if (d3.select(preferenceDiv).style("height") === "400px") {
		let appenddiv = d3.select(preferenceDiv).select("#showPreference");
		let presentSelectionId = d3.select(preferenceDiv).select(".btn.btn-primary.active").attr("id"); 
		if (appenddiv.empty() || appenddiv.datum() !== presentSelectionId){
			appenddiv = d3.select(preferenceDiv).append("div").attr("id", "showPreference").datum(presentSelectionId);
			/* update content for preference board */
			appenddiv.html("<p>This is for preference search<br/>Not Implement Yet</p>");
			console.log("update " + appenddiv.datum() + "...");
		}
	}
}
/* end map interaction */


/*
To-do-list:

1. Add preference list update
2. Add radius change 
3. Add support for preference search

*/