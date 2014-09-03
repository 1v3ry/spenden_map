<?
include('constants.php');
function create_filename() {
    $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $string = '';

    for ($p = 0; $p <= 10; $p++) {
        $string .= $characters[mt_rand(0, strlen($characters))];
    }

    return $string;
}

if($_GET["do"] == "file")
{
	// we just need to check the max_post_size
	header('Content-type: application/json');
	echo "{\"status\":\"";
	$mime = false;
	for($i = 0; $i < count($_FILES["photos"]["tmp_name"]); $i++)
	{
		if($_FILES["photos"]["type"][$i] != 'image/jpeg' AND $_FILES["photos"]["type"][$i] != 'image/png' AND $_FILES["photos"]["type"][$i] != 'image/gif'AND $_FILES["photos"]["type"][$i] != 'image/tiff') {$mime = true;}
	}
	if($mime == true)
	{
		echo "Your photo(s) must be of the type JPEG, PNG, GIF of TIFF.\\n";
	}
	echo "\", \"request\":";
	echo $_SERVER['CONTENT_LENGTH'];
	echo "}";
}
else
{
	// we need to do the whole thing
	$data_error = false;
	header('Content-type: application/json');
	echo "{\"status\":\"";
	$mime = false;
	if(!$_POST["alias"]) 
	{
		echo "Please specify an alias.\\n";
		$data_error = true;
	}
	if($_POST["user_lat"] == 0 || $_POST["user_lon"] == 0) 
	{
		echo "Please choose your location.\\n";
		$data_error = true;
	}
	if(!$_FILES["photos"]) 
	{
		echo "Please submit at least one photo.\\n";
		$data_error = true;
	}
	for($i = 0; $i < count($_FILES["photos"]["tmp_name"]); $i++)
	{
		if($_FILES["photos"]["type"][$i] != 'image/jpeg' AND $_FILES["photos"]["type"][$i] != 'image/png' AND $_FILES["photos"]["type"][$i] != 'image/gif'AND $_FILES["photos"]["type"][$i] != 'image/tiff') {$mime = true;}
	}
	if($_SERVER['CONTENT_LENGTH'] > 14680064)
	{
		echo "The maximum filesize is exceeded.\\n";
		$data_error = true;
	}
	if($mime == true)
	{
		echo "Your photo(s) must be of the type JPEG, PNG, GIF or TIFF.\\n";
		$data_error = true;
	}
	echo "\",";
	
	// everything ok with the submitted data? => instert into database
	if($data_error == false)
	{
		$upload_error = '';
		$mysqli = mysqli_connect(HOST, USER, PASSWORD, DB);
		for($i = 0; $i < count($_FILES["photos"]["name"]); $i++)
		{		
			do
			{
				$image_name = create_filename();
				$result = $mysqli->query("SELECT * FROM submits WHERE images LIKE '%".$image_name."%' LIMIT 1");
			}
			while($result->num_rows != 0);
			$result->close();
			switch($_FILES["photos"]["type"][$i])
			{
				case 'image/png': $filetype = '.png'; break;
				case 'image/jpeg': $filetype = '.jpg'; break;
				case 'image/gif': $filetype = '.gif'; break;
				case 'image/tiff': $filetype = '.tiff'; break;
			}
			if(!move_uploaded_file($_FILES["photos"]["tmp_name"][$i], "images/".$image_name.$filetype)){$upload_error .= 'At least one file could not be uploaded.\\n';}
			if($image_string != ''){$image_string .= ';';}
			$image_string .= $image_name.$filetype;
		}
		$qs = "INSERT INTO submits (alias, lat, lon, text, images) VALUES ('".htmlspecialchars(strip_tags($_POST["alias"]))."', '".htmlspecialchars(strip_tags($_POST["user_lat"]))."', '".htmlspecialchars(strip_tags($_POST["user_lon"]))."', '".htmlspecialchars(strip_tags($_POST["text"]))."', '".htmlspecialchars(strip_tags($image_string))."');"; // htmlspecialchars(strip_tags()); to secure against XSS and SQL-Injection attacks
		if(!mysqli_query($mysqli, $qs)){$upload_error .= 'The submitted data could not be saved.\\n';}
		mysqli_close($mysqli);
		if($upload_error != '')
		{
			echo "\"upload\": \"".$upload_error."\",";
		}
		else
		{
			echo "\"upload\": \"ok\",";
		}
	}
	echo "\"request\":";
	echo $_SERVER['CONTENT_LENGTH'];
	echo "}";
}
?>