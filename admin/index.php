<?
include('../constants.php');
$verb= mysql_connect(HOST, USER, PASSWORD);
mysql_select_db(DB, $verb);

# SAVING-STUFF
if($_POST["save"])
{
	for($i = 0; $i < mysql_num_rows(mysql_query("SELECT * FROM `staedte`")); $i++)
	{
		mysql_query("UPDATE staedte SET `stadt`='".$_POST["stadt_".$i]."', `lon`='".$_POST["lon_".$i]."', `lat`='".$_POST["lat_".$i]."', `boxes`='".$_POST["boxes_".$i]."', `euro`='".$_POST["euro_".$i]."' WHERE `ID` = '".$i."'");
	}
	
	if($_POST["stadt_new"] != '')
	{
		mysql_query("INSERT INTO staedte (`stadt`, `lon`, `lat`, `boxes`, `euro`) VALUES ('".$_POST["stadt_new"]."', '".$_POST["lon_new"]."', '".$_POST["lat_new"]."', '".$_POST["boxes_new"]."', '".$_POST["euro_new"]."')");
	}
}
?>
<html>
	<head>
		<meta http-equiv="content-type" content="text/html" charset="UTF-8" />
		<meta name="viewport" content="width=device-width, user-scalable=no">
		<title>Spenden für die Ukraine - Admin-Panel</title>
		<link rel="SHORTCUT ICON" href="../../friedenstaube.png"/>
		<script src="../openlayers/OpenLayers.js"></script>
		<style type='text/css'>
			#map {
				width:600px;
				height:600px;
			}
			
			tr:nth-child(2n) {
				background-color:lightgray;
			}
			
		</style>
		<script type='text/javascript'>
			var zoom = 6;
			var user_lat = 52;
			var user_lon = 11;
			var markers = new OpenLayers.Layer.Markers( "Markers" );
			var loc_id = null;
			var user_location_icon = new OpenLayers.Icon('../location.png', new OpenLayers.Size(40,40), new OpenLayers.Pixel(-20, -40));
		
			function initialize_map()
			{
	
				// Create the necessary controls
				var controls = new OpenLayers.Control.PanZoomBar();
	
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
//				map.addControl(select);
//				analyze_url();		
			}
			
			function man_set_user_location(pos)
			{
				if(user_lat != 52 && user_lon != 11)
				{
					markers.removeMarker(user_location_marker);
				}
				user_lat = parseFloat(map.getLonLatFromPixel(pos.xy).lat);
				user_lon = parseFloat(map.getLonLatFromPixel(pos.xy).lon);
				map.events.unregister("click", map, man_set_user_location);
				document.getElementById("map").style.cursor = "default";
				user_location_marker = new OpenLayers.Marker(new OpenLayers.LonLat(user_lon,user_lat), user_location_icon);
				markers.addMarker(user_location_marker);
				map.setCenter(new OpenLayers.LonLat(user_lon,user_lat));
				document.getElementsByName("lat_"+loc_id)[0].value = user_lat;
				document.getElementsByName("lon_"+loc_id)[0].value = user_lon;
				loc_id = null;
			}
		</script>
	</head>
	
	<body  onload='initialize_map();'>
		<table border='0'>
		<tr><td>Stadt</td><td>Lat</td><td>Lon</td><td>Kisten</td><td>Euro</td><td</td></tr>
		<form action='index.php' method='post'>
		<?
			$data = mysql_query("SELECT * FROM `staedte` ORDER BY `stadt` ASC");
			while($row = mysql_fetch_array($data))
			{
				echo "<tr><td><input type='text' name='stadt_".$row["ID"]."' value='".$row["stadt"]."' size='30'></td><td><input type='text' name='lat_".$row["ID"]."' value='".$row["lat"]."' readonly></td><td><input type='text' name='lon_".$row["ID"]."' value='".$row["lon"]."' readonly></td><td><input type='number' name='boxes_".$row["ID"]."' value='".$row["boxes"]."' step='1'></td><td><input type='number' name='euro_".$row["ID"]."' value='".$row["euro"]."'></td><td><input type='button' name='set_loc_".$row["ID"]."' value='Lon/Lat setzen' onclick='alert(\"Ort durch klick auf Karte wählen.\"); loc_id = ".$row["ID"]."; map.events.register(\"click\", map, man_set_user_location);'></td></tr>\n";
			}
		?>
		<tr><td><input type='text' name='stadt_new' placeholder='Neue Stadt' size='30'></td><td><input type='text' name='lat_new' readonly></td><td><input type='text' name='lon_new' readonly></td><td><input type='number' name='boxes_new'></td><td><input type='number' name='euro_new'></td><td><input type='button' name='set_loc_new' value='Lon/Lat setzen' onclick='alert("Ort durch klick auf Karte wählen."); loc_id = "new"; map.events.register("click", map, man_set_user_location);'></td></tr>
		</table>
		<input type='submit' name='save' value='gesamte Tabelle speichern'>
		</form>	
		<div id='map'></div>
	</body>
</html>
<?
mysql_close($verb);
?>