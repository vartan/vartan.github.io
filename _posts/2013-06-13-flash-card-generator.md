---
layout: post
title: "PHP Flash Card Generator"
tagline: Using PHP to generate microsoft office documents
description: "Using PHP to generate microsoft office documents"
thumbnail: "/images/thumbnails/flashcard.jpg"
category: 
tags: []
---
{% include JB/setup %}


I had to study for a midterm a few weeks ago, and thought to myself — I should really make myself some flashcards to memorize all of these acronyms. So, I got on the computer, opened up a word processor, immediately got bored and decided to make myself a program that does it for me. Why PHP? So I can share it! It also searches wikipedia if you don’t specify a definition. Check it out here: [http://www.mvartan.com/doc/](http://www.mvartan.com/doc/)


My first concern was, naturally, how in the world do you dynamically generate a word document? To my surprise, it is ridiculously easy to generate word documents, if you already know web development! A .doc file can be just a html file with a modified file extension.

There are a few caveats however. Firstly, you get a somewhat limited repertoire of CSS that will work correctly. Secondly, you have to add a few special CSS rules to customize page formatting. For reference, here is the source code for the flash card generator: [http://mvartan.com/doc/download.php.txt](http://mvartan.com/doc/download.php.txt).

##`@page rule`

Create a page rule in CSS with of the constraints to your pages in the word document. Here is where you specify the page size and margins. There are some special CSS properties that begin with mso, such as mso-header-margin and mso-footer-margin which you should look into. Wrap your content in an element such as a div, and give it your page rule.
{% highlight css %}
@page Section1
{
    size:8.5in 11.0in;
    margin:.5in .5in .5in .5in;
    mso-header-margin:.5in;
    mso-footer-margin:.5in;
    mso-paper-source:0;
}
.Section1 /*my div page-wrapper*/
{
    page:Section1;
}
{% endhighlight %}
##Application

So why am I posting about this six weeks after I made it? I had to do some more document generation at work yesterday. I work at an advising center for engineers, and we had a 700 page document of transfer student transcripts, and we were supposed to go through each page and organize it into its own file. Seeing a pattern here? Instead, I parsed them in python, and saved the office a week of repetitive data processing.

Update: Some of the above also applies to styling how your page is printed. Check out my resume which is styled in HTML/CSS, here: http://www.mvartan.com/resume