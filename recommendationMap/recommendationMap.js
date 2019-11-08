function recommendationMap(divId, maxZoom) {
	/* add divId of world map */
	this.divId = divId;
	/* add set to record which country to show */
	this.countryShowSet = d3.set()
	/* add present selection for local info demo */
	this.currentSelection = null;
	
	/* declare meta map attribute */
	var minZoom = 10;
	this.mapInitialCenter = new L.LatLng(36.16991, -115.139832);
	var maxBounds = L.latLngBounds(L.latLng(36, -115.15), L.latLng(36.34, -115.13));


	d3.select("#" + this.divId).style("width", (window.screen.availWidth - 4) + "px").style("height", (window.screen.availHeight - 75) + "px");
	this.map = L.map(divId, {
		maxBounds: maxBounds,
		minZoom: minZoom
	}).setView(this.mapInitialCenter, minZoom);
	this.map.associatedMap = this;
	this.mapInitialCenterPoint = this.map.latLngToLayerPoint(this.mapInitialCenter);

	// add pane to map for svg
	this.map.createPane('svgLayer');
	// set the stack position of added pane layer
	this.map.getPane('svgLayer').style.zIndex = 400;
	// make the mouse event go through the event and reach below
	this.map.getPane('svgLayer').style.pointerEvents = 'none';

	// add pane to map for country name tooltip
	this.map.createPane('nameTooltipLayer');
	// set the stack position of added pane layer
	this.map.getPane('nameTooltipLayer').style.zIndex = 575;
	// make the mouse event go through the event and reach below
	this.map.getPane('nameTooltipLayer').style.pointerEvents = 'none';

	// add pane to map for country layer
	this.map.createPane('countryLayer');
	// set the stack position of added pane layer
	this.map.getPane('countryLayer').style.zIndex = 200;

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
	this.attractionShowSet = d3.set();

	// default layer order: tile, GeoJSON, Marker shadows, Marker icons, Popups
	this.tileLayer.addTo(this.map);
	this.tileLayer.associatedMap = this;
	this.svgLayer.addTo(this.map);
	this.svgLayer.associatedMap = this;
	d3.select("#" + this.divId).select("svg").attr("id", this.divId + "geoSvg");

	// add listener for zoom end and move end
	this.map.on('zoomend', updateMapTitle);
}

/* for map style */


/* end map style */

/* for map function */

/* there are two set
recommendationMap.prototype.showAttractionMarker = function() {

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

function updateMapTitle(e) {
	let associatedMap = this.associatedMap;
	let geoSvg = d3.select("#" + associatedMap.divId).select("#" + associatedMap.divId + "geoSvg");

	let mapTitleGroup = geoSvg.select("#" + associatedMap.divId + "mapTitleGroup");
	if (this.getZoom()  <= this.getMinZoom() + 1){
		/* display welcome text */
		if (mapTitleGroup.empty()){
			mapTitleGroup = geoSvg.append("g").attr("id", associatedMap.divId + "mapTitleGroup");
			mapTitleGroup.append("image").attr("id", associatedMap.divId + "mapTitleImage")
				.attr("href", "/recommendationMap/lasVegasTrans.png");
			mapTitleGroup.append("text").attr("id", associatedMap.divId + "mapTitleText")
				.text("Explore Local Greatness");
		};
		let mapCenter = associatedMap.map.latLngToLayerPoint(associatedMap.map.getCenter());
		let mapTitleText = mapTitleGroup.select("#" + associatedMap.divId + "mapTitleText");
		let mapTitleImage = mapTitleGroup.select("#" + associatedMap.divId + "mapTitleImage");

		if (this.getZoom() == this.getMinZoom()) {
			mapTitleImage.style("width", "400px").style("height", "400px")
				.attr("transform", "rotate(-8,100,100)translate(" + (mapCenter.x - 450) + "," + (mapCenter.y - 250) + ")");
			mapTitleText.attr("transform", "translate(" + (mapCenter.x - 50) + "," + (mapCenter.y + 300) + ")");
		} else if (this.getZoom() == this.getMinZoom() + 1) {
			mapTitleImage.style("width", "460px").style("height", "460px")
				.attr("transform", "rotate(-8,100,100)translate(" + (mapCenter.x - 600) + "," + (mapCenter.y - 380) + ")");
			mapTitleText.attr("transform", "translate(" + (mapCenter.x - 50) + "," + (mapCenter.y + 280) + ")");
		}

	} else {
		/* remove welcome text */
		if (!mapTitleGroup.empty()) {
			mapTitleGroup.remove();
		}
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



/* wait to add */
/*
1. use turf.buffer to get a shape cover the area within specific distance from center point / circle