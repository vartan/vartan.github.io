---
layout: post
title: "Fixing Sticky Hover on Mobile Devices"
tagline: "Converts :hover CSS to :active CSS on mobile devices"
description: "Introduce anything with a remote to the Internet of Things by
            controlling it with your raspberry pi"
thumbnail: "/images/thumbnails/javascript.png"
category: web
tags: [javascript]
---
{% include JB/setup %}

#Sticky Hover

I recently ran into an obnoxious problem on my [IR Controller Webapp](http://mvartan.com/2014/11/25/controlling-your-tv-or-any-ir-device-with-raspberry-pi/). When you tap on an element on a mobile device, it stays in a `:hover` state until you tap elsewhere. 

##Failed Attempts
I tried quite a few things to fix this problem, but it was more difficult than I'd imagined. Sadly, I spent a pretty long time trying to figure this anomaly out.
####Blurring element focus and focusing another element
At first, I thought that the problem could be solved if I forced the browser to focus on another element. Unfortunately, the hover condition is entirely independent of elements' focus, so this solution was a failure. 
####Temporarily removing the element from DOM
Next, I went online to try to fix this issue. I found [this](http://stackoverflow.com/a/17234319) solution online, which suggested that temporarily removing/readding the element from the DOM would solve the hover issue. Perhaps this worked in other mobile browsers, but my testing in iOS 8 showed that this solution is broken for the following two reasons:

1. The page jumps as the element gets removed and reinserted. This effect was jarring and unsuitable for production.
2. Often this solution causes other hover artifacts! Sometimes, the new element that is re-inserted still gets the hover effect! Other times, other elements nearby get the hover effect instead! This was wholly confusing and unsuitable for production.

#### Simulating hover psuedo-class by using actual CSS classes
[This solution](http://www.nczonline.net/blog/2012/07/05/ios-has-a-hover-problem/) proposes programatically adding a "no-touch" class to your elements, which you add your `:hover` psuedo-class to as such:

{% highlight css %}
button.no-touch:hover {
    background:red;
}
{% endhighlight %}


This is the first solution that I've found that entirely works. Unfortunately, there are a few problems with this:

1. It makes your stylesheet more complicated. Especially if you are importing a stylesheet created by others, this means you have to trawl through their CSS to fix things.
2. Sometimes elements do not have an explicit `:active` psuedo-class, and rely on the `:hover` element to style it. Having no `:hover` element upsets the user experience because the user cannot tell anything happened after the element has been tapped.

####Removing all hover CSS selectors on mobile devices.
I found [this](http://retrogamecrunch.com/tmp/hover-fix) solution from retrogramecrunch, which suggests removing all hover rules. This was the closest solution so far, as it doesn't require you to modify existing CSS. 

Unfortunately, it still doesn't cue the user that the button has been tapped on `:hover` only elements, so this solution still didn't satisfy my requirements.

##My Solution
My solution is a slight modification on retrogamecrunch's. Rather than delete all `:hover` css rules, I replace them with the `:active` psuedo-class. Assuming the same [CSS priority](http://www.w3.org/TR/CSS2/cascade.html#specificity) is preserved, this shouldn't affect existing `:active` rules.

Feel free to use my code below in any of your projects.
<script src="https://gist.github.com/vartan/ab195e5a502a47e0c3e5.js"></script>

