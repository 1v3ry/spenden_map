var zoom = 6;
var user_lat = 52;
var user_lon = 11;
var map;
var markers = new OpenLayers.Layer.Markers( "Markers" );
var user_location_marker;
var map_e = '';
var user_location_icon = new OpenLayers.Icon('location.png', new OpenLayers.Size(40,40), new OpenLayers.Pixel(-20, -40));
var submissions = new Array;
var popup;
var select;
var features = [];

var element = document.createElement('div')
if("ontouchstart" in  element)
{
	var mobile = true;
}
else
{
	var mobile = false;
}
element.remove();

function auto_set_user_location(pos)
{
	if(user_lat != 0 && user_lon != 0)
	{
		markers.removeMarker(user_location_marker);
	}
	user_lat = pos.coords.latitude;
	user_lon = pos.coords.longitude;
	var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
	var toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
	var position       = new OpenLayers.LonLat(user_lon,user_lat).transform( fromProjection, toProjection);
	user_location_marker = new OpenLayers.Marker(position, user_location_icon);
	markers.addMarker(user_location_marker);
	user_lat = parseFloat(user_location_marker.lonlat.lat);
	user_lon = parseFloat(user_location_marker.lonlat.lon);
	map.setCenter(position);
	document.getElementById('location_set').style.color = "#44CC44";
	document.getElementById('location_set').innerHTML = "&#10004;";
	document.getElementById('auto_location_button').style.color = "white";
	document.getElementById('auto_location_button').style.backgroundColor = "black";
}

function man_set_user_location(pos)
{
	if(user_lat != 0 && user_lon != 0)
	{
		markers.removeMarker(user_location_marker);
	}
	if(mobile)
	{
 		user_lat = parseFloat(map.getLonLatFromPixel({x:pos.changedTouches[0].clientX,y:pos.changedTouches[0].clientY}).lat);
		user_lon = parseFloat(map.getLonLatFromPixel({x:pos.changedTouches[0].clientX,y:pos.changedTouches[0].clientY}).lon);
		map.events.unregister("touchend", map, man_set_user_location);
		showhideform();
 	}
 	else
 	{
		user_lat = parseFloat(map.getLonLatFromPixel(pos.xy).lat);
		user_lon = parseFloat(map.getLonLatFromPixel(pos.xy).lon);
		map.events.unregister("click", map, man_set_user_location);
	}
	document.getElementById('location_set').style.color = "#44CC44";
	document.getElementById('location_set').innerHTML = "&#10004;";
	document.getElementById('set_location_button').style.color = "white";
	document.getElementById('set_location_button').style.backgroundColor = "black";
	document.getElementById("map").style.cursor = "default";
	user_location_marker = new OpenLayers.Marker(new OpenLayers.LonLat(user_lon,user_lat), user_location_icon);
	markers.addMarker(user_location_marker);
	map.setCenter(new OpenLayers.LonLat(user_lon,user_lat));
}

function location_error(e)
{
	if(e.code == 2 || e.code == 3)
	{
		alert("Your location can't be determined.");
		document.getElementById('auto_location_button').style.color = "white";
		document.getElementById('auto_location_button').style.backgroundColor = "black";
	}
}

function showhideform()
{
	if(document.getElementById("submit_form").style.display != "block")
	{
		$("#submit_form").show("slide", {direction:"up", easing: "easeOutBounce"}, 500);
		$("#submit_plus").addClass("active", {easing: "easeInQuart"}, 500);
	}
	else
	{
		$("#submit_form").hide("slide", {direction:"up", easing: "easeOutQuart"}, 500);
		$("#submit_plus").removeClass("active", {easing: "easeOutQuart"}, 500);
	}
}

function showhideimprint()
{
	if(document.getElementById("map").className.indexOf("small") == -1)
	{
		$("#map").addClass("small", {easing: "easeInQuart"}, 500);
		$("#map_attribution").addClass("small", {easing: "easeInQuart"}, 500);
	}
	else
	{
		$("#map").removeClass("small", {easing: "easeOutQuart"}, 500);
		$("#map_attribution").removeClass("small", {easing: "easeOutQuart"}, 500);
	}
}

function initialize_map()
{
	
	// Create the necessary controls
	if(mobile)
    {
    	var controls = new OpenLayers.Control.TouchNavigation({
                dragPanOptions: {
                    enableKinetic: true
                }
            });
    }
    else
    {
    	var controls = new OpenLayers.Control.PanZoomBar();
    }
    
    // create the map
    
    map = new OpenLayers.Map('map', 
    	{ controls: 
    		[
    			controls,
    			new OpenLayers.Control.Navigation()
    		]
    	});
        var mapnik         = new OpenLayers.Layer.OSM();
        var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
        var toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
        var position       = new OpenLayers.LonLat(user_lon,user_lat).transform( fromProjection, toProjection);
    map.addLayer(mapnik);
    map.addLayer(markers);
    map.setCenter(position, zoom);

		// Get and display the submissions
	var ajaxRequest;  // The variable that makes Ajax possible!	
	try{
		// Opera 8.0+, Firefox, Safari
		ajaxRequest = new XMLHttpRequest();
	} catch (e){
		// Internet Explorer Browsers
		try{
			ajaxRequest = new ActiveXObject('Msxml2.XMLHTTP');
		} catch (e) {
			try{
				ajaxRequest = new ActiveXObject('Microsoft.XMLHTTP');
			} catch (e){
				// Something went wrong
				alert('Your browser broke!');
				return false;
			}
		}
	}
	
	ajaxRequest.open('GET', 'get_submissions.php', true);
	ajaxRequest.send();
	
	ajaxRequest.onreadystatechange = function(){
		if(ajaxRequest.readyState == 4)
		{
			submissions = JSON.parse(ajaxRequest.responseText);	
			
			for(var i=0; i < submissions.length; i++)
			{
				var pointGeometry = new OpenLayers.Geometry.Point(submissions[i].lon, submissions[i].lat);
				var pointFeature = new OpenLayers.Feature.Vector(pointGeometry, {x: submissions[i].lon, y: submissions[i].lat, id: i, boxes: submissions[i].boxes, euro: submissions[i].euro});
				features.push(pointFeature);
			}
			var style = new OpenLayers.Style({
                    pointRadius: "${radius}",
                    fillColor: "#0900FF",
                    fillOpacity: 0.5,
                    strokeColor: "#FFFFFF",
                    strokeWidth: "${width}",
                    strokeOpacity: 1,
                    label: "${label}",
                    fontColor: "#000000",
                    fontSize: "10px",
                    fontFamily: "Impact, Arial",
                    fontWeight: "bold"
                }, {
                    context: {
                        width: 2,
                        radius: function(feature) {
                            var pix = 13;
                            if(!feature.cluster) {
                                pix += feature.attributes.boxes/10;
                            }
                            else
                            {
                            	for(i=0; i < feature.cluster.length; i++)
                        		{
                        			pix += parseFloat(feature.cluster[i].attributes.boxes)/5;
                        		}
                        		
                            }
                            return pix ;
                        },
                        label: function(feature) {
                        	if(feature.cluster)
                        	{
                        		sum = 0;
                        		for(i=0; i < feature.cluster.length; i++)
                        		{
                        			sum += parseFloat(feature.cluster[i].attributes.euro);
                        		}
                        		return sum+ " €";
                        	}
                        	else
                        	{
                        		return feature.attributes.euro + " €";                         	
                        	}
                        }
                    }
                });
			var vector = new OpenLayers.Layer.Vector("Submissions", {renderers: ['Canvas','SVG'], strategies: [new OpenLayers.Strategy.Cluster({distance: 21, threshold:2})], styleMap: new OpenLayers.StyleMap({
						"default": style,
                        "select": {
                            fillColor: "#0900FF",
                            fillOpacity: 1,
                            strokeColor: "#FFFFFF",
                            strokeOpacity: 1,
                            fontColor: "#FFFFFF",
                        }
                    })
                });
			map.addLayer(vector);
			vector.addFeatures(features);
			select = new OpenLayers.Control.SelectFeature(vector, {onSelect: show_submission_details, onUnselect: function(){popup.destroy()}});
			map.addControl(select);
			select.activate();
			analyze_url();	
		}
	}
}

function onPopupClose(evt) 
{
    select.unselect(selectedFeature);
}


function show_submission_details(feature)
{
	selectedFeature = feature;
	if(feature.cluster)
	{
		sum_euro = 0;
		sum_boxes = 0;
        for(i=0; i < feature.cluster.length; i++)
    	{
            sum_euro += parseFloat(feature.cluster[i].attributes.euro);
            sum_boxes += parseFloat(feature.cluster[i].attributes.boxes);
        }
		popup_content = "<div class='cluster'>Diese Mahnwachen haben " + sum_euro + " € und " + sum_boxes + " Kisten Sachspenden gesammelt.</div>";
	}
	else
	{
		popup_content = "<div class='feature'><div id='headline'>" + submissions[feature.attributes.id].stadt + "</div><div id='text'>" + submissions[feature.attributes.id].boxes + " Kisten<br/>" + submissions[feature.attributes.id].euro + " €</div> </div>";	
	}
	popup = new OpenLayers.Popup.FramedCloud("active_submit", 
                                     feature.geometry.getBounds().getCenterLonLat(),
                                     null,
                                     popup_content,
                                     null, true, onPopupClose);
            feature.popup = popup;
            map.addPopup(popup);
}

function check_form()
{
	if(document.getElementById('filesize').lastChild.className.lastIndexOf(' error') != -1)
	{
		document.getElementById('filesize').lastChild.innerHTML ='';
		document.getElementById('filesize').lastChild.className = document.getElementById('filesize').lastChild.className.substring(0,document.getElementById('filesize').lastChild.className.lastIndexOf(' error'));
	}
	$("#filesize").progressbar( "option", "value", false );
	var ajaxRequest;  // The variable that makes Ajax possible!	
	try{
		// Opera 8.0+, Firefox, Safari
		ajaxRequest = new XMLHttpRequest();
	} catch (e){
		// Internet Explorer Browsers
		try{
			ajaxRequest = new ActiveXObject('Msxml2.XMLHTTP');
		} catch (e) {
			try{
				ajaxRequest = new ActiveXObject('Microsoft.XMLHTTP');
			} catch (e){
				// Something went wrong
				alert('Your browser broke!');
				return false;
			}
		}
	}

	var data = new FormData(document.getElementById('submit_form'));
	data.append('user_lat', user_lat);
	data.append('user_lon', user_lon);
	ajaxRequest.open('POST', 'check_form.php?do=file', true);
	ajaxRequest.send(data);

	ajaxRequest.onreadystatechange = function(){
		if(ajaxRequest.readyState == 4)
		{
			document.getElementById('submit_error').innerHTML = '';
			var response = JSON.parse(ajaxRequest.responseText);
			if(response.request < 14680064)
			{
				$("#filesize").progressbar( "option", "value",  response.request);
				$("#filesize").removeClass( "error");
			}
			else
			{
				$("#filesize").progressbar( "option", "value", 14680064);
				$("#filesize").addClass( "error");
				document.getElementById('submit_error').innerHTML += 'The maximum upload size is exceeded.<br/>';
			}
			if(response.status != '')
			{
				document.getElementById('submit_error').innerHTML += response.status;
				$("#filesize").addClass( "error");		
			}
			else
			{
				$("#filesize").removeClass( "error");
			}
			if(document.getElementById('submit_error').innerHTML != '')
			{
				document.getElementById('submit_error').innerHTML += '<br/><br/><font size="0.9em">Click <a href="#" onclick="$(\'#submit_error\').hide(\'fade\', null, 500); return false;">here</a> to close me.</font>';
				$('#submit_error').show("fade", null, 500);
				return false;
			}
		}
	}
}

function submit_form()
{
	document.getElementById('submit_error').innerHTML = '';
	var request_length = $("filesize").progressbar( "option", "value" );
	if(document.getElementById('alias').value == '')
	{
		document.getElementById('submit_error').innerHTML += 'Please provide an alias.<br/>';
	}
	if(request_length == 0 || document.getElementById('photos').value == '')
	{
		document.getElementById('submit_error').innerHTML += 'Please select a photo.<br/>';
	}
	if(request_length == 14680064)
	{
		document.getElementById('submit_error').innerHTML += 'The maximum upload size is exceeded.<br/>';
	}
	if(user_lat == 0 || user_lon == 0)
	{
		document.getElementById('submit_error').innerHTML += 'Please select your location.<br/>';
	}
	switch(document.getElementById('photos').value.substring(document.getElementById('photos').value.lastIndexOf(".")+1, document.getElementById('photos').value.length))
	{
		case 'jpeg': break;
		case 'jpg': break;
		case 'png': break;
		case 'gif': break;
		case 'tiff': break;
		default: document.getElementById('submit_error').innerHTML += 'Your photo(s) must be of the type JPEG, PNG, GIF of TIFF.<br/>'; break;
	}
	if(document.getElementById('submit_error').innerHTML != '')
	{
		document.getElementById('submit_error').innerHTML += '<br/><br/><font size="0.9em">Click <a href="#" onclick="$(\'#submit_error\').hide(\'fade\', null, 500); return false;">here</a> to close me.</font>';
		$('#submit_error').show("fade", null, 500);
		return false;
	}
	
	var ajaxRequest;  // The variable that makes Ajax possible!	
	try{
		// Opera 8.0+, Firefox, Safari
		ajaxRequest = new XMLHttpRequest();
	} catch (e){
		// Internet Explorer Browsers
		try{
			ajaxRequest = new ActiveXObject('Msxml2.XMLHTTP');
		} catch (e) {
			try{
				ajaxRequest = new ActiveXObject('Microsoft.XMLHTTP');
			} catch (e){
				// Something went wrong
				alert('Your browser broke!');
				return false;
			}
		}
	}

	var data = new FormData(document.getElementById('submit_form'));
	data.append('user_lat', user_lat);
	data.append('user_lon', user_lon);
	ajaxRequest.open('POST', 'check_form.php', true);
	ajaxRequest.send(data);
	
	ajaxRequest.onreadystatechange = function(){
		var response = JSON.parse(ajaxRequest.responseText);
		if(response.upload != 'ok')
		{
			document.getElementById('submit_error').innerHTML = response.upload;
			document.getElementById('submit_error').innerHTML += '<br/><br/><font size="0.9em">Click <a href="#" onclick="$(\'#submit_error\').hide(\'fade\', null, 500); return false;">here</a> to close me.</font>';
			$('#submit_error').show("fade", null, 500);
		}
		else
		{
			document.getElementById('submit_error').innerHTML = 'You data has been successfully saved. <br/> Thank you for supporting our case!';
			document.getElementById('submit_error').innerHTML += '<br/><br/><font size="0.9em">Click <a href="#" onclick="showhideform(); document.getElementById(\'reset\').click(); return false;">here</a> to close me.</font>';
			$('#submit_error').addClass("ok");
			$('#submit_error').show("fade", null, 500);
		}
	}
}

//	PANORAMA-PHOTOVIEW

function showphoto(url)
{
	document.getElementById("site_url").innerHTML = "map.snowden-support.com/#"+url.substring(url.lastIndexOf("/")+1, url.length-4); 
	document.getElementById("site_url").href = "http://map.snowden-support.com/#"+url.substring(url.lastIndexOf("/")+1, url.length-4); 
	document.getElementById("panorama_photo").src = url;
//	window.setTimeout(function(){document.getElementById("panorama_photo").style.marginTop = parseFloat(document.getElementById("panorama_photo").height/(-2))+"px";}, 50); //"improve" css aka position the picture in the middle
	$("#panorama_photo_container").addClass("visible", {easing: 'linear'}, 500);
}

function hidephoto()
{
	$("#panorama_photo_container").removeClass("visible");
	document.getElementById("panorama_photo").src = '';
}

function analyze_url()
{
	for(var i=0; i<submissions.length;i++) //check if a feature id is contained in the url, if so zoom to the position, show the popup; i == id
	{
		var feature = document.location.href.substring(document.location.href.indexOf("#")+1, document.location.href.length);
		if(!isNaN(feature) && feature == i)
		{
			select.select(features[i]);
			map.setCenter(new OpenLayers.LonLat(features[i].attributes.x,features[i].attributes.y), 10);
		}
// 		for(var j=0; j<submissions[i].images.length; j++) //check if a photo url is contained in the url, if so show the photo
// 		{
// 			if(document.location.href.indexOf('#'+submissions[i].images[j].substring(submissions[i].images[j].indexOf("/")+1, submissions[i].images[j].length-4)) != -1)
// 			{
// 				showphoto("images/"+submissions[i].images[j]);
// 			}
// 		}
	}
}