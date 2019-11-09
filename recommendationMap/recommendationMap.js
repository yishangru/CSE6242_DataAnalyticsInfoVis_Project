function recommendationMap(divId, maxZoom) {
	/* add divId of world map */
	this.divId = divId;
	/* add set to record which country to show */
	this.attractionSelectedSet = d3.set()
	/* add present selection for local info demo */
	this.currentSelection = null;
	
	/* declare meta map attribute */
	var minZoom = 10;
	this.mapInitialCenter = new L.LatLng(36.16991, -115.139832);
	this.mapMaxBoundsZoom = L.latLngBounds(L.latLng(28.16991, -118.139832), L.latLng(44.16991, -112.139832));
	this.mapMaxBounds = L.latLngBounds(L.latLng(36, -115.15), L.latLng(36.34, -115.13));


	d3.select("#" + this.divId).style("width", (window.screen.availWidth - 4) + "px").style("height", (window.screen.availHeight - 75) + "px");
	this.map = L.map(divId, {
		maxBounds: this.mapMaxBounds,
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
	this.map.createPane('TooltipLayer');
	// set the stack position of added pane layer
	this.map.getPane('TooltipLayer').style.zIndex = 575;

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
			.style("width", "360px")
			.style("height", "42px");

		let preferenceForm = preferencediv.append("div")
			.attr("class", "btn-group btn-group-sm")
			.attr("data-toggle", "buttons");
		preferenceForm.append("label")
			.attr("class", "btn btn-secondary active")
			.attr("data-type", "Preference Search")
			.text("Preference Search \u2713")
			.style("width", "165px")
			.append("input")
			.attr("type", "checkbox")
			.attr("name", "options")
			.attr("autocomplete", "off");
		preferenceForm.append("label")
			.attr("class", "btn btn-secondary")
			.attr("data-type", "Preference List")
			.text("Preference List")
			.style("width", "150px")
			.append("input")
			.attr("type", "checkbox")
			.attr("name", "options")
			.attr("autocomplete", "off");
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
	this.attractionAddedSet = d3.set();

	this.restaurantMarkerMap = d3.map();
	this.restaurantShowSet = d3.set();
	this.restaurantAddedSet = d3.set();

	this.hostMarkerMap = d3.map();
	this.hostShowSet = d3.set();
	this.hostAddedSet = d3.set();

	// default layer order: tile, GeoJSON, Marker shadows, Marker icons, Popups
	this.tileLayer.addTo(this.map);
	this.tileLayer.associatedMap = this;
	this.svgLayer.addTo(this.map);
	this.svgLayer.associatedMap = this;
	d3.select("#" + this.divId).select("svg").attr("id", this.divId + "geoSvg");
}

/* for map style */


/* end map style */

/* for map function */
recommendationMap.prototype.initialMap = function() {
	this.map.on('zoomend', updateZoomDemo);
	updateZoomDemo.call(this.map);
}

recommendationMap.prototype.showAttractionMarker = function(whetherInitial) {
	let associatedMap = this;
	if (whetherInitial) {
		attractionInfoMap.keys().forEach(function(d) {
			associatedMap.attractionShowSet.add(d);
		})
	}

	this.attractionAddedSet.values().forEach(function(d){
		if (!associatedMap.attractionShowSet.has(d)) {
			associatedMap.attractionMarkerMap.get(d).forEach(function(d) {
				associatedMap.map.removeLayer(d);
			})
			associatedMap.attractionAddedSet.remove(d);
		}
	});

	this.attractionShowSet.each(function(d){
		let attractionInfo = attractionInfoMap.get(d);
		if(!associatedMap.attractionAddedSet.has(d)){
			if(!associatedMap.attractionMarkerMap.has(d)){
				/* create marker group */
				let attractionMarkerGroup = [
					L.marker([attractionInfo.latitude, attractionInfo.longtitude]), // image or icon
					L.marker([attractionInfo.latitude, attractionInfo.longtitude]), // rating icon
					L.marker([attractionInfo.latitude, attractionInfo.longtitude]), // checked marked
				];

				associatedMap.attractionMarkerMap.set(d, attractionMarkerGroup);
				
				attractionMarkerGroup[0].attractionId = d;
				attractionMarkerGroup[0].associatedMap = associatedMap;
				attractionMarkerGroup[0].on("mouseover", function(e){
					// pop up tooltip
				});
				attractionMarkerGroup[0].on("mouseout", function(e){
					// close tooltip
				});
				attractionMarkerGroup[0].on("click", function(e){
					let associatedMap = this.associatedMap
					let checkedMarker = associatedMap.attractionMarkerMap.get(this.attractionId)[3];
					if (associatedMap.attractionSelectedSet.has(this.attractionId)){
						associatedMap.attractionSelectedSet.remove(this.attractionId);
						associatedMap.map.removeLayer(checkedMarker);
					} else {
						associatedMap.attractionSelectedSet.add(this.attractionId);
						checkedMarker.addTo(associatedMap.map);
					}
				})
			}
			associatedMap.attractionAddedSet.add(d);
		} else {
			associatedMap.attractionMarkerMap.get(d).forEach(function(d) {
				associatedMap.map.removeLayer(d);
			})
		}
		let attractionMarkerGroup = associatedMap.attractionMarkerMap.get(d);
		let scaleFactor = 1 + 6 * (associatedMap.map.getZoom()/(associatedMap.map.getMinZoom() + 2) - 1);
		
		/* 0 as image */
		attractionMarkerGroup[0].setIcon( L.icon({
			iconUrl: "./data/" + attractionInfo["type"] + "s_pictures/resize/" + attractionInfo["id"] + ".jpg",
			iconSize: [Math.round(80 * scaleFactor), Math.round(60 * scaleFactor)],
			iconAnchor: [0, 0],
			popupAnchor: [-3, 76],
			className: "mapIcon"
		}));
		attractionMarkerGroup[0].addTo(associatedMap.map);

		/* 2 as rating */
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
			iconAnchor: [-1 * Math.round((80 - 13 * accumentStar)/2 * scaleFactor), -1 * Math.round(60 * scaleFactor - 1)]
		}));
		attractionMarkerGroup[1].addTo(associatedMap.map);

		/* 3 as checked symbol */
		attractionMarkerGroup[2].setIcon( L.icon({
			iconUrl: "./recommendationMap/Icon/selected.png",
			iconSize: [Math.round(30 * scaleFactor), Math.round(30 * scaleFactor)],
			iconAnchor: [-1 * Math.round((80 - 30)/2 * scaleFactor), -1 * Math.round(30 * scaleFactor)],
			popupAnchor: [-3, 76]
		}));
		if (associatedMap.attractionSelectedSet.has(d)){
			attractionMarkerGroup[2].addTo(associatedMap.map);
		}

		/* add the star and the title to map */
	});
}

recommendationMap.prototype.showRestaurantMarker = function() {

}

recommendationMap.prototype.showHostMarker = function() {

}


/* change following to interaction */
recommendationMap.prototype.showSelectionArround = function() {
	/* with selection, showing the item around it */
	if (this.currentSelection) {

	} else {
		this.map.setZoom(this.map.getMinZoom() + 1);
		/* for show all info */
		var associatedMap = this;
		/* show map title */
		updateMapTitle.call(this.map);
	}
}
/* end map function */

/* for map interaction */
function highlightFeature(e) {
	let layer = e.target;

	if (layer.selected)
		return;

	layer.setStyle({
		weight: 5,
		color: '#fb8072',
		dashArray: '',
		fillOpacity: 0.7
	});

	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();
	}
}

function resetHighlight(e) {
	if (this.selected)
		return;

	this.associatedMap.countryLayer.resetStyle(e.target);
}

function zoomToFeature(e) {
	this.associatedMap.map.fitBounds(e.target.getBounds());
}

function updateZoomDemo(e) {
	let associatedMap = this.associatedMap;
	let geoSvg = d3.select("#" + associatedMap.divId).select("#" + associatedMap.divId + "geoSvg");

	let mapTitleGroup = geoSvg.select("#" + associatedMap.divId + "mapTitleGroup");

	if (this.getZoom()  < this.getMinZoom() + 1){
		/* display welcome text */
		associatedMap.map.setMaxBounds(associatedMap.mapMaxBounds);
		associatedMap.map.setView(associatedMap.mapInitialCenter);
		if (mapTitleGroup.empty()){
			mapTitleGroup = geoSvg.append("g").attr("id", associatedMap.divId + "mapTitleGroup");
			mapTitleGroup.append("image").attr("id", associatedMap.divId + "mapTitleImage")
				.attr("href", "/recommendationMap/lasVegasTrans.png");
			mapTitleGroup.append("text").attr("id", associatedMap.divId + "mapTitleText")
				.text("Explore Local Greatness");
		};

		let mapTitleText = mapTitleGroup.select("#" + associatedMap.divId + "mapTitleText");
		let mapTitleImage = mapTitleGroup.select("#" + associatedMap.divId + "mapTitleImage");

		let mapBound = associatedMap.map.getBounds();
		let mapCenter = associatedMap.map.latLngToLayerPoint(associatedMap.mapInitialCenter);
		mapTitleImage.style("width", "460px").style("height", "430px")
			.attr("x", (mapCenter.x - 450) + "px")
			.attr("y", (mapCenter.y - 320) + "px")
			.attr("transform", "rotate(-8,100,100)");
		mapTitleText.attr("transform", "translate(" + (mapCenter.x - 50) + "," + (mapCenter.y + 300) + ")").style("font-size", "220px");

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

		associatedMap.attractionShowSet.clear();
		associatedMap.restaurantShowSet.clear();
		associatedMap.hostShowSet.clear();
		associatedMap.showAttractionMarker(false);
		associatedMap.showRestaurantMarker(false);
		associatedMap.showHostMarker(false);
	} else {
		associatedMap.map.setMaxBounds(associatedMap.mapMaxBoundsZoom);
		/* remove welcome text */
		if (!mapTitleGroup.empty()) {
			mapTitleGroup.remove();
		}
		associatedMap.showAttractionMarker(this.getZoom() <= this.getMinZoom() + 1? true : false);
		associatedMap.showRestaurantMarker(this.getZoom() <= this.getMinZoom() + 1? true : false);
		associatedMap.showHostMarker(this.getZoom() <= this.getMinZoom() + 1? true : false);
	}
}

function expandInfoSection(e){
	let buttonClass = d3.select(this).attr("class").toString();

	if (d3.select(this.parentNode).style("height") !== "42px") {
		d3.select(this.parentNode).style("height", "42px");
		if (buttonClass === "preferenceButton") {
			d3.select(this).text("▲");
		} else {
			d3.select(this).text("▼");
		}
		return;
	}

	if (buttonClass === "yelpButton") {
		d3.select(this.parentNode).style("height", "350px");
		d3.select(this).text("▲");
	} else if (buttonClass === "airbnbButton") {
		d3.select(this.parentNode).style("height", "350px");
		d3.select(this).text("▲");
	} else if (buttonClass === "localPointButton") {
		d3.select(this.parentNode).style("height", "350px");
		d3.select(this).text("▲");
	} else if (buttonClass === "preferenceButton") {
		d3.select(this.parentNode).style("height", "400px");
		d3.select(this).text("▼");
	}
}
/* end map interaction */



/* wait to add
1. use turf.buffer to get a shape cover the area within specific distance from center point / circle
*/