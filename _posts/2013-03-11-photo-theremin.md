---
layout: post
title: "$1 Photo-Theremin"
tagline: and more fun with reversed LEDs
description: "$1 Photo-Theremin and More Fun With Reversed LEDs"
thumbnail: "/images/thumbnails/photoled.jpg"
category: 
tags: []
---
{% include JB/setup %}



A little known fact about LEDs (Light Emitting Diodes) is that when hooked up backwards, they act as photodiodes. I have manipulated this property to make a few fun and cheap Arduino projects, including a musical instrument I call a photo-theremin.

I am going to begin with my understanding of physically how this works. Bare with me, my 4th grade teacher once told my mother that she was certain I’d never be an artist. If you’re not interested in exactly how it works, feel free to scroll past my crude diagrams. If you’re just interested in the photo-theremin, you will find it at the bottom of this post.

##Physics

###Hooked up 'correctly'

This my very simplified way of thinking of diodes, if you want a better and accurate explanation, I suggest looking at this article on HowStuffWorks.

My understanding is that particles there are positively charged (P-type) and negatively charged (N-type) sides on the diode. In the middle, there is what is called a “depletion zone”. This can be simplified to a positive side, a negative side, and a “hole”. When the voltage drop is in the correct direction of the diode, the negatively charged particles are repelled by the negatively charged wire, and fills the hole. In an LED, as they cross the gap, they release electromagnetic energy, a photon, or light.

###Hooked up backwards

When a diode is hooked up backwards, the positive side is now connected to the negatively charged wire, so instead of going across the wire, the particles are attracted to the edges and no current flows.

LEDs exhibit an interesting property: photons can excite the LED and allow some current to flow through. Notice in the diagram above, the LED is hooked up backwards, but the photon has excited the electron to fill the gap between the P-type and N-type, allowing a bit of current to flow. In essence, the LED becomes a photodiode.

#Arduino

So how can we use this with the Arduino?

##Light sensitive dimmed blinking LED

<iframe width="100%" height="400" src="//www.youtube.com/embed/Ce-1MpBxUCQ" frameborder="0" allowfullscreen></iframe>

My first project with the reverse LEDs was a photosensitive blinking light. This is a very simple arduino circuit, requiring only a single LED and a current limiting resistor (100Ω).  I found the basis of the project on Arduino Playground – LEDSensor. If I were to do this project over again, I’d look into using analogRead and analogWrite to achieve the same effect, probably more efficiently.

Here is my code; the negative side of the LED is hooked up to pin 2, the positive to pin 3.

{% highlight c %}

/*
 * Title: Photosensitive LED Blinker
 *
 * Author: Michael Vartan
 * E-mail: admin@mvartan.com
 *
 */
 
#define LED_N_SIDE 2
#define LED_P_SIDE 3
 
const unsigned int MAX=10000; //max number of clock cycles 
                              //to wait for pin to read LOW
 
void setup()
{
//  Serial.begin(9600);
}
void loop()
{
  unsigned int j; // used to record how many clock cycles
                  // it takes to change from HIGH->LOW
 
  // Apply reverse voltage, charges up the LED
  pinMode(LED_N_SIDE,OUTPUT);
  pinMode(LED_P_SIDE,OUTPUT);
  digitalWrite(LED_N_SIDE,HIGH);
  digitalWrite(LED_P_SIDE,LOW);
 
  // Isolate the pin 2 end of the diode
  pinMode(LED_N_SIDE,INPUT);
  digitalWrite(LED_N_SIDE,LOW);  // turn off internal pull-up resistor
  // Count how long it takes the diode to bleed back down to a logic zero
  boolean b=false;
  for ( j = 0; j<MAX && !b; j++) {
    for(int i=0;i<10 && !b;i++) {
        if ( digitalRead(LED_N_SIDE)==0)
          b=true; 
    }
  }
 
  digitalWrite(LED_P_SIDE,HIGH);
  digitalWrite(LED_N_SIDE,LOW);
  pinMode(LED_P_SIDE,OUTPUT);
  pinMode(LED_N_SIDE,OUTPUT);
  int dec = 10-j/(MAX/10); //how many tenths of the max darkness.
  for(int i=0;i<30000;i++) { //dimmer loop, loops 3000 times
    if(i%10>dec) { //light up dec/10ths of the time.
      digitalWrite(LED_P_SIDE,LOW);
    } 
    else {
      digitalWrite(LED_P_SIDE,HIGH);
    }
    delayMicroseconds(10);
  }
}
{% endhighlight %}


In this example, we are reading the LED by treating it somewhat like a capacitor. We “charge” it up by letting turning the LED on, and then quickly turn it off and perform a digital read on it. As light hits it, the voltage will change slowly as the current is allowed through it, and eventually we reach the threshold to a digital LOW. By counting the clock cycles it took to switch to a digital LOW, we can determine how much light is shining on the LED.

The second half of the loop function is dedicated to dimming the LED. When we turn the LED off and on very fast, it looks to our human eye like the LED is on continuously but dim.

##Photo-Theremin

<iframe width="100%" height="400" src="//www.youtube.com/embed/oDPm3Qe4U90" frameborder="0" allowfullscreen></iframe>

To create a photo-theremin, you could do it with only an LED and a piezo buzzer. These are cheap components you could get at even radioshack for probably around $1. In my example, I am additionally using a push button to play the notes, as well as a potentiometer (variable resistor) to control the volume of the piezo buzzer. These are also very cheap components you could easily get.



For this example, to read the LED we are going to use the Arduino’s analogRead function which is much easier than digitally reading the voltage like in the example before. The analogRead function directly gives us a relative voltage (if the voltage were 5V, analogRead would return 1023; 2.5V would read 512; 0V would read 0).

To play music through the piezo buzzer, we are going to use the Arduino’s tone function which will output a square wave frequency to the piezo buzzer. To generate a frequency corresponding to a note, I found that the equation 440 * 2^(n/12) will generate a frequency n notes above A440 Pitch Standard. If n is a double, you can generate any sound, but if n is an integer, this equation will generate only on-pitch notes. I went a step further with the help of my friend Sam Jacobs, and my photo-theremin will only produce notes on a defined musical scale.

Here is my code; the LED is hooked from A0 to GND, my push button is connected to pin 7, and my piezo element to pin 8.

{% highlight c %}
/*
 * Title: LED Phototheremin
 *
 * Author: Michael Vartan
 * E-mail: admin@mvartan.com
 *
 */
 
const int DARK = 80; //value of the analog in at its darkst
const int LIGHT = 300; //what is the value of the analog in at ambient light? (check the serial monitor)
const int NUM_AVG=100; //number of times to read the LED to average out
 
const int A=0, AS=1, B=2, C=3, CS=4, D=5, DS=6, E=7, F=8, FS=9, G=10, GS=11;
 
//Below: Only leave one uncommented, which scale you want it to play.
//const int SCALE[] = {A,AS,B,C,CS,D,DS,E,F,FS,G,GS}; //all notes
//const int SCALE[] = {A,C,D,E,G}; //pentatonic
//const int SCALE[] = {C,D,DS,E,G,A};  //blues major
const int SCALE[] = {C,DS,F,FS,G,AS}; //blues minor
//const int SCALE[] = {E,G,A,B,D}; //pentatonic a minor
 
void setup() {
  pinMode(7, INPUT); //set up our push button
  //Serial.begin(9600); //uncomment if you want to use the serial port to debug DARK/LIGHT constants
}  
 
void loop() {
  //Begin averaging out reads to get an accurate result
  long total=0;
  for(int i=0;i<NUM_AVG;i++)
    total += analogRead(0); //reads the potentiometer information
  int avg=(total/NUM_AVG);
  //end averaging out reads.
 
  //Serial.println(avg); //uncomment if you want to use the serial port to debug DARK/LIGHT constants
 
  //begin mapping the number to a note on the chosen scale
  int val = map(avg, DARK, LIGHT, -12, 13);  //converts the value. -12 is an octave below the middle, 12 is an octave above.
  int note = val%12; //converts notes from A440 Pitch Standard to just note.
  int closest = 0;
  for(int i=1;i<sizeof(SCALE);i++) { //finds the closest note in the scale to the mapped note.
    if(SCALE[i]==note) {            // (if this loop were not here, it would just play all notes instead of scaled notes)
      closest = i;
      break;
    }
    if(abs(note-SCALE[i])<abs(note-SCALE[closest]))
      closest = i;
  }
  note=closest;
  //end mapping
 
  if(digitalRead(7)==0){
    tone(8, pow(2,((double)val)/12)*440); //plays the note according to the position of the piezo element.
  } else {
    noTone(8); //turn off the piezo element 
  }
}
{% endhighlight %}

Feel free to comment or shoot me an e-mail if you have any questions or ideas.