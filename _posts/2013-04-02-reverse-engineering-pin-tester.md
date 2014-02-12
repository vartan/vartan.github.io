---
layout: post
title: "Reverse Engineering using the Arduino"
tagline: Serial Pin Controller
description: "Using the serial monitor in the arduino to control the pins"
thumbnail: "/images/thumbnails/arduino.jpg"
category: Arduino
tags: [embedded, programming, arduino, hardware]
---
{% include JB/setup %}

The other week a professor gave me ”Omega multidimensional effect” Christmas lights and challenged me to figure them out to control them. Under the impression that each LED was individually controllable, I took up the challenge looking to convert them into an LED matrix/display. Unfortunately, the lights aren’t as complex as I’d hoped. But in reverse engineering the lights, I came up with a very useful serial pin controller that I have used a few times since, and want to share with you all. It allowed me to type a string of bits such as “00011110″, turning pins 2,3,4,8 on and 5,6,7 off.


##Christmas Lights

I was pretty excited to have these Christmas lights, hoping to use them as some sort of display. The professor was under the impression that each ‘stick’ of LEDs was individually controllable. When I cracked up the controller box, I found an old microcontroller and some transistors connected to some wires labeled R,Y,O,G,1,2,3,4. I quickly realized R, Y, O, and G stood for Red, Yellow, Orange, and Green. I hoped that 1, 2, 3, and 4 were outputs that were eventually decoded to control each stick.

However, unfortunately this wasn’t how it was wired. I found that that when a color was given HIGH, and a number was given LOW, some LEDs was turned on. I wrote the pin controller below, and found when I typed “11110000″, all of the lights were turned on. It turns out the sticks repeated their pattern every four sticks. Therefore, pin 1 controlled the 1st, 5th, 9th, etc. sticks, pin 2 controlled the 2nd, 6th 10th, etc. sticks, and so on.

So, it turns out, these Christmas lights were really good at being repeatable pattern Christmas lights, but no more. In hindsight, it’d be kind of ridiculous if they controlled each LED individually on simple Christmas lights. For those interested, here is a video of the Christmas lights. Source code

<iframe width="100%" height="400" src="//www.youtube.com/embed/cc0XsAym3Wc" frameborder="0" allowfullscreen></iframe>


#Pin Controller

Without further delay, here is the commented source code for the Pin Controller:

{% highlight c %}
/* 
 * Title:   Arduino Pin Controller
 * Author:  Michael Vartan
 * E-mail:  admin@mvartan.com
 * Usage:   Input bits into serial monitor. If your startAt is 2, and you type
 *          "10110100", the pin outputs will look like this:
 *          Pin 2: HIGH    Pin 6: LOW
 *          Pin 3: LOW     Pin 7: HIGH
 *          Pin 4: HIGH    Pin 8: LOW
 *          Pin 5: HIGH    Pin 9: LOW
 */
 
int incomingByte = 0;   // for incoming serial data
String s = "11110000";  // initial pinout. 
int startAt = 2;        // first pin you are using. 2 is default.
 
void setup() {
        Serial.begin(9600);     // opens serial port, sets data rate to 9600 bps
        for(int i=0;i<=14;i++)  // opens all digital pins; include 15-19 to
           pinMode(i, OUTPUT);  // include analog pins
}
 
void loop() {
  String content = "";
  char character;
 
  while(Serial.available()) {   //begin read serial
      character = Serial.read();
      content.concat(character);
      delay(10);                // you must wait to recieve next character.
  } //end read serial.
 
  if (content != "") { 
    Serial.println(content); // if we recieved input, send it back as feedback
    s=content;               // and remember it as variable s
  }
 
  for(int i=0;i<content.length();i++) {
    if(s[i]=='1')
      digitalWrite(startAt+i,HIGH); // set one high
        else
      digitalWrite(startAt+i,LOW);  // zero low
  }
}
{% endhighlight %}
To use it, compile the code up on your arduino and then open the Serial Monitor. Type a string of zeroes and ones and send it. Beginning at pin 2 (by default), it will output high for each one and low for each zero. For example, if I send “01101″, pin 2 will be low, pin 3 will be high, pin 4 will be high, pin 5 will be low, and finally pin 6 will be high.

I’ve found this even useful for testing a single pin, I put a device on pin 2 and just type a zero or a 1. In the few weeks I’ve had this, I’ve already used it on a few projects that I hope to post here soon. I hope you all find it useful as well.
