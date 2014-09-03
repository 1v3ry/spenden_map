<?
include('constants.php');
header('Content-type: application/json');
$verb = mysql_connect(HOST, USER, PASSWORD);
mysql_select_db(DB, $verb);
$result = mysql_query("SELECT * FROM staedte ORDER BY stadt ASC");
$count = 0;
echo "[";
while($row = mysql_fetch_array($result))
{
	if($count != 0){echo ",";}
	echo "{"."\"stadt\":\"".htmlspecialchars($row["stadt"])."\", \"lat\":".$row["lat"].", \"lon\":".$row["lon"].", \"boxes\":\"".$row["boxes"]."\", \"euro\":\"".$row["euro"]."\"}";
	$count++;
}
echo "]";
mysql_close($verb);
?>