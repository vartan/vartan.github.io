<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta name="viewport" content="user-scalable=no, width=device-width" />

        <title>BingBot</title>

        <link rel="StyleSheet" href="style/style.css" type="text/css" media="screen"/>
        <script type="text/javascript" src="script.js">
        </script>
		<script type="text/javascript">

		  var _gaq = _gaq || [];
		  _gaq.push(['_setAccount', 'UA-33561053-1']);
		  _gaq.push(['_trackPageview']);

		  (function() {
			var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
			ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
			var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
		  })();

		</script>
    </head>
    <body onclick="javascript:;"> 
		<iframe id="bing" src="shamelessplug.html">
			Your browser does not seem to support frames :(
		</iframe>
        <div class="nav">
			<input type="checkbox" value=""  id="refer" title="The checkbox determines whether or not you are sent to a referral link when the bot is done. Otherwise it sends you back to this page.I have coded it to remember the setting you have on the checkbox." checked />
			<img src="images/magnifier.png" alt="Number of searches" title="Number of searches">
			<input value="40" size="2" id="num" title="Number of searches"/>
			<img src="images/clock.png" alt="Delay between searches" title="Delay between searches"/>
			<input value="1500" size="4" id="time" title="Delay between searches"/>
			<input value="Start!" type="button" id="start" />
        </div>
    </body>
</html>