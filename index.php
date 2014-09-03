<?
include('constants.php');
$verb= mysql_connect(HOST, USER, PASSWORD);
mysql_select_db(DB, $verb);
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="content-type" content="text/html" charset="UTF-8" />
		<meta name="viewport" content="width=device-width, user-scalable=no">
		<title>Spenden für die Ukraine</title>
		<link rel="SHORTCUT ICON" href="../friedenstaube.png"/>
		<link href="styles.css" rel="stylesheet" type="text/css"/>
		<link href="jquery/css/ui-lightness/jquery-ui-1.10.4.custom.css" rel="stylesheet" type="text/css"/>
		<script src="openlayers/OpenLayers.js"></script>
		<script src="jquery/js/jquery-1.10.2.js"></script>
		<script src="jquery/js/jquery-ui-1.10.4.custom.js"></script>
		<script src="jquery/js/jquery-ui-1.10.4.custom.min.js"></script>
		<script type='text/javascript' src='map.js'></script>
		<script type='text/javascript'>
		</script>
	</head>
	<body onload='initialize_map();'>

<!--	HEADER		-->
		<div id='header'>
			<span id='submits_nr'>
				<? 
					echo mysql_result(mysql_query("SELECT SUM(euro) FROM `staedte` WHERE 1"), 0)."<br/>".mysql_result(mysql_query("SELECT SUM(boxes) FROM `staedte"), 0);
				?>
			</span>
			<span>
				€<br/><br/>
				Kisten
			</span>
		</div>
		<div id='logo'><img src='' height='0px' width='0px' alt='PEACE!' title='logo'/></div>

<!--	MAP					-->	
		<div id='map'></div>
		<div id='map_attribution'>&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <a href="#" onclick="showhideimprint(); return false;">Impressum</a></div>

<!--	IMPRINT				-->	
		<div id='imprint'>
			<span id='license'>Diese Arbeit ist gemeinfrei.<br/>
			Speziellen Dank an <a href='https://jqueryui.com' target='_blank'>jQuery user interface</a>, <a href='https://www.openstreetmap.org/' target='_blank'>openstreetmap</a> und <a href='' target='_blank'>openlayers</a>.<br/><br/>
			<a href='https://www.facebook.com/MahnwachenHelfenInfoSeite' target='_blank'>Mehr Infos</a>.</span>
			<span id='address'><span class='headline'>Host & Admin</span><br/>Oliver Sch&ouml;nefeld<br/>Ferdinand-Jost-Str. 45<br/>04299 Leipzig; Germany<br/>&#9993; <a href='mailto:oliver.schoenefeld@me.com'>MAIL</a> < <a href='http://pgp.mit.edu:11371/pks/lookup?op=get&search=0xB2B9A8393D2A593C' title='0xB2B9A8393D2A593C' target='_blank'>PGP</a></span>
<!--			<span id='address'><span class='headline'>Content</span><br>Andy Mangelmann<br/>Nachtigallenweg 28<br/>47638 Straelen; Germany<br/>+49 157/88649509</span> -->
		</div>

<!--	NOSCRIPT			-->
		<noscript>
			Please activate javascript to properly display this webpage.
		</noscript>
	</body>
</html>
<?
mysql_close($verb);
?>