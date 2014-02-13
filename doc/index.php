<html>
	<head>
		<title>mvartan - Flashcard Generator</title>
	<style>
		body,html {
			width:99%;height:99%;
		}
		textarea{
			width:99%;
		}
		#splitter {
			margin-right:10px;
			width:20px;
		}
		</style>
	</head>
	<body>
		<h1>Flashcard Generator</h1>
		<p>Type your word list in the text area below. Seperate the word and its definition with a colon.  Each item should be seperated by a line break. If not given a definition, we will find one from wikipedia.</p>
		<p style="font-weight:bold;color:red">Unfortunately, since I've had to host this elsewhere, it will not search wikipedia for undefined terms</p>
		<form method="post" action="download.php">
			<textarea name="list" cols=120 rows=10>RAM:Read Only Memory
PLD: Programmable Logic Device
ASIC: Application Specific Integrated Circuit</textarea><br/>
			Splitting character(s) (default is colon): <input type="text" value=":" name="splitter" id="splitter"/><br/>
			<input type=submit value=Download>
		</form>
<br/>
<hr>
<br/>
		<p>This is confirmed to work in Microsoft Word 2013</p>
		<p>Source code: <a href="download.php.txt">download.php</a></p>
		<p>
			<b>TODO:</b>
			<ul>
				<li>Look into PDF alternative; maybe install LaTeX on my host and compile some LaTeX</li>
			</ul>
		</p>
		<p>(hosted on my raspberry pi)
	</body>
</html>