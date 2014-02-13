<?php
/*
 * Name:        Flash Card Generator
 * Author:      Michael Vartan
 * Contact:     admin@mvartan.com
 *
 * Description: Apparently, Word can edit HTML files, so we give it 
 *              a HTML file, disguised as a DOC.
 * 
 */



/* Wikipedia searcher mostly taken from http://www.barattalo.it/2010/08/29/php-bot-to-get-wikipedia-definitions/ */
function wikidefinition($s) { 
    $url = "http://en.wikipedia.org/w/api.php?action=opensearch&search=".urlencode($s)."&format=xml&limit=1";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_HTTPGET, TRUE);
    curl_setopt($ch, CURLOPT_POST, FALSE);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_NOBODY, FALSE);
    curl_setopt($ch, CURLOPT_VERBOSE, FALSE);
    curl_setopt($ch, CURLOPT_REFERER, "");
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
    curl_setopt($ch, CURLOPT_MAXREDIRS, 4);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows; U; Windows NT 6.1; he; rv:1.9.2.8) Gecko/20100722 Firefox/3.6.8");
    $page = curl_exec($ch);
    $xml = simplexml_load_string($page);
    if((string)$xml->Section->Item->Description) {
        return (string)$xml->Section->Item->Description;
    } else {
        return "";
    }
}

header("Content-type: application/vnd.ms-word");
header("Content-Disposition: attachment;Filename=flashcards.doc");
?>
<html>
<meta http-equiv="content-type" content="text/html; charset=UTF-8" />
<head>


<style>
@page Section1
{size:8.5in 11.0in;
margin:.5in .5in .5in .5in;
mso-header-margin:.5in;
mso-footer-margin:.5in;
mso-paper-source:0;}
div.Section1
{page:Section1;} 
table {
border: 1px solid; 
border-collapse:collapse;
text-align:center;
vertical-align:center;
}
td {
width:50%;
height:1.9in;
}
</style>
</head>
<body>
	<div class="Section1"> 
<table width="100%" border=1>
<?php

// Set up splitter character
$splitter = ":";
if($_POST['splitter'])
	$splitter = $_POST['splitter'];

//remove double line breaks
$list = preg_replace('/[\r\n]+/', "\n", $_POST['list']);
$list = trim($list);

//make $lines, an array containing each line from the textarea
$lines = array_filter(preg_split ('/$\R?^/m', $list));

//loop through each line
foreach($lines as $line) { 
    //ignore empty space lines
	if (ctype_space($str))
		continue;
	if(strpos($line,":")==0) {
        //if there is no colon, use wikipedia
		$word = $line;
		$definition = trim(wikidefinition($word));
	} else {
        //otherwise, split the line at the colon, removing whitespace
		$splitLine=explode($splitter, $line);
		$word = trim($splitLine[0]);
		$definition = trim($splitLine[1]);
	}

	echo '<tr><td height="3in"><b><u>'.$word.'</u></b></td><td>'.$definition.'</td></tr>';
}
?>
</table>
</div>
</body>
</html>