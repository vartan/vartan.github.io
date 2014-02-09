---
layout: post
title: "Online Webcam Viewer"
description: "Online Webcam Viewer"
tagline: "Via PHP and python"
category: 
tags: []
---
I just remembered a small project I had in 2011 that I wanted to share with you guys. I had just bought a webcam, and also gotten a cat, and decided to combine the two with programming to make this, a webcam viewer. This way, I could see what my cat was doing while I wasn't home, by checking the website on my phone.

Things you'll need:

1. Python (Link)
2. VideoCapture Plugin (Link) and its dependency, PIL (Link)
2. A Webserver equipped with PHP.
4. A Webcam.

##PHP code: (index.php)

{% highlight php %}
<?php 
exec('python capture.py'); //if you get any errors, check your environment variables
date_default_timezone_set('America/Los_Angeles'); 
$fp = fopen("log.log", "a"); 
fwrite($fp, date("F j, Y, g:i a")."\r\n"); 
?>
<html><body><img src="image.jpg" /></body></html>
{% endhighlight %}

##Python Code: (capture.py)

{% highlight python %}
from VideoCapture import Device
Device().saveSnapshot('image.jpg', timestamp=3, boldfont=1, quality=70)
{% endhighlight %}