
			function tick() {
				var ticker = document.getElementById("num");
				var f = document.getElementById("bing");
				if(ticker.value == 0) {
					ticker.value = ticker.value - 1;
					if(document.getElementById("refer").checked)
						f.src = referralLink();
					else
						f.src = "shamelessplug.html";
				}
				if(ticker.value>0) {
					ticker.value = ticker.value - 1;
					f.src = "http://www.bing.com/search?q="+createRandomWord(5); 
				}
				window.onbeforeunload = function(e) {						
					return "Bing has tried to redirect the window. Stay on this page to continue the bot.";
				};						

			}
			function toggleRefer() {
				setCookie("refer",document.getElementById("refer").checked,365);
			}
			function getCookie(c_name)
			{
			var i,x,y,ARRcookies=document.cookie.split(";");
			for (i=0;i<ARRcookies.length;i++)
			{
			  x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
			  y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
			  x=x.replace(/^\s+|\s+$/g,"");
			  if (x==c_name)
				{
				return unescape(y);
				}
			  }
			}
			function setCookie(c_name,value,exdays)
{
				var exdate=new Date();
				exdate.setDate(exdate.getDate() + exdays);
				var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
				document.cookie=c_name + "=" + c_value;
			}
			function begin() {
				if(getCookie("refer") == null) {
					setCookie("refer","true",365);
				} else {
					document.getElementById("refer").checked = (getCookie("refer")=='true');
				}
				document.getElementById("refer").onclick = toggleRefer;
				document.getElementById("start").onclick = start;
			}
			function createRandomWord(length) {
				var consonants = 'bcdfghjklmnpqrstvwxyz',
					vowels = 'aeiou',
					rand = function(limit) {
						return Math.floor(Math.random()*limit);
					},
					i, word='', length = parseInt(length,10),
					consonants = consonants.split(''),
					vowels = vowels.split('');
				for (i=0;i<length/2;i++) {
					var randConsonant = consonants[rand(consonants.length)],
						randVowel = vowels[rand(vowels.length)];
					word += (i===0) ? randConsonant.toUpperCase() : randConsonant;
					word += i*2<length-1 ? randVowel : '';
				}
				return word;
			}
			function start() {
			tick();
			var time = document.getElementById("time");
			setInterval('tick()',time.value);
			}
			function referralLink() {
				var links = [
					"http://naturebucks.com/members/register.php?refid=23979",
					"https://www.jointopline.com/register?fid=QQJ2PVS5K4VB"/*,
					"http://www.prizelive.com/r/rattleglans",
					"http://www.gifthulk.com/refer/mvartan"*/
				];
				return links[Math.floor(Math.random()*links.length)];
			}
		window.onload = begin;



		