---
layout: post
title: "Making an online r&egrave;sum&egrave;"
tagline: Using HTML/CSS to generate seperate online/print views
description: "Using PHP to generate microsoft office documents"
thumbnail: "/images/thumbnails/resume.jpg"
category: Web
tags: [HTML, CSS, Software]
---
{% include JB/setup %}

Making a résumé in Microsoft Word felt really generic and boring to me. I tried LaTeX with mixed results, and then I realized that I already know a markup language: HTML. An example of an HTML/CSS résumé that we will cover in this post can be seen [here](http://www.mvartan.com/resume), as a shameless plug for my own résumé.

Setting up your page

You may be thinking at this point, html isn’t for making documents. If you have seen my previous post, Dynamically Generating a Word Document; PHP Flash Card Generator, you would already know that there are methods in HTML/CSS to format a document for printing.

Let’s make some decisions about the formatting of my page. I am going to be printing on letter paper which is 8.5in x 11in, and I want half inch margins. When viewing the page on the computer, I want it to be over a non-plain dark background. When printing the page out, I want it to only display the content, not any of the background.

I’m going to start out with a blank style.css very basic HTML skeleton index.html, shown below:
{%highlight html%}
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Resume</title>
    <link href="style.css" rel="stylesheet" type="text/css">
</head>
<body>
    <div class="page">
        <div class="resume"> 
            This is some content
        </div>
    </div>
</body>
</html>
{%endhighlight%}
The very first thing I am going to do in the stylesheet is give it the instructions to print at the correct size. I’ve found through my research that browsers generally have bad printing support, so it is a bit different in every browser. My suggestion is to make it so that it shows well in every browser, and prints best in a browser of your choice. I chose to style for chrome, because not only is it one of the most popular browsers but it has a print to PDF option so I can distribute it as a PDF as well. This is a basic stylesheet I’ve made, which I’ve found the dimensions fit best with printing on chrome:

{%highlight css%}

@page Section1 {
	size:8.5in 11in; 
	margin:.5in .5in .5in .5in; 
	mso-header-margin:.5in; 
	mso-footer-margin:.5in; 
	mso-paper-source:0;
}
body {
	font:10.5pt "Times New Roman", Times, Serif;
}
@media only screen and (min-device-width: 480px) {
  body {
    background-color:#666;
  }
  .page {
		  background-color:white;
		  width:7in;
		  height:9.5in; /* IDK why the size is 9.5in instead of 10 */
		  padding:.5in; /*Should subtract from the width/height*/
		  margin:30px auto;
		  box-shadow:0 0 100px #222, 0 0 10px #ffd;
	 }
}

@media print {
	#resume {
		-webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
		-moz-box-sizing: border-box;    /* Firefox, other Gecko */
		box-sizing: border-box;         /* Opera/IE 8+ */
		height:9.45in;
		margin-bottom:-5pt;
	}

}
{%endhighlight%}
This is what the page we just made looks like:
[http://www.mvartan.com/resume-test/](http://www.mvartan.com/resume-test/)

At this point, we have a web page that prints only the content in our ‘page’, so our goal is met. Now you can apply all of the web design knowledge you already know to carefully design your résumé. Feel free to use my own résumé as a template if you aren’t up for designing it all yourself. If you are successful with it, please let me know I’d love to know I helped someone.

Once again for reference, here’s my final result:
[http://www.mvartan.com/resume/](http://www.mvartan.com/resume/)