---
layout: post
title: "Controlling your TV or any infrared device with a Raspberry Pi"
tagline: Introduce anything with a remote to the Internet of Things
description: "Introduce anything with a remote to the Internet of Things by
            controlling it with your raspberry pi"
thumbnail: "/images/thumbnails/remote-pi.jpg"
category: Raspberry Pi
tags: [internet of things, HTML, raspberry pi, infrared]
---
{% include JB/setup %}

Although the Internet of Things is relatively new, controlling devices remotely is as old as sin; devices have been using IR remotes for ages. There is a lot of untapped potential from the infrared devices sitting in your home. Besides the raspberry pi, you can get all of the materials for this project at your local electronics store or radioshack. To unlock this potential you need the following parts:

* A raspberry pi (Any model OK)
* A PNP Transistor
* One infrared LED/Blaster
* One infrared receiver (optional)
* Various resistors (10kΩ, 37Ω)

# Hardware

If you can find your remote already in the [LIRC Remote Database](http://lirc.sourceforge.net/remotes/), you do not have to hook up the receiver.

Because the GPIO varies slightly between raspberry pi models, please check out [this GPIO reference guide](http://raspi.tv/2014/rpi-gpio-quick-reference-updated-for-raspberry-pi-b) to find exactly which pin to connect to.

![Raspberry Pi Receiver/Transmitter Schematic](/images/remote-pi/schem.png)
![Breadboard example](/images/remote-pi/bb.png)


# Installing necessary software on the pi

## LIRC

*Please note that I borrowed heavily from alexba.in in this section. Essentially, this section is his tutorial boiled down*

LIRC stands for Linux Infrared Remote Control. The acronym speaks for itself, really. With almost no work, this package allows you to record and play back from any infrared remote control. 

If you do not already LIRC installed, run the following command on your pi:

{% highlight bash %}
    sudo apt-get update && sudo apt-get install lirc
{% endhighlight %}

Next, we have to fix the configuration of lirc for your pi. Modify `/etc/lirc/hardware.conf` to match alexba's below using your `nano /etc/lirc/hardware.conf` or your favorite text editor.

<script src="https://gist.github.com/vartan/984286efea1230664e3a.js"></script>

Next, run these commands to finish setting up the pi and restart LIRC.
<script src="https://gist.github.com/vartan/a4654f526915aadaaf31.js"></script>

### Recording your remote
(will flush this section out)

##NodeJS and Webapp

NodeJS is a platform which allows unshackles javascript from the web browser. We will use NodeJS to run our webserver.

Install NodeJS with the following commands:
<script src="https://gist.github.com/vartan/6dcdb707d003f19fb727.js"></script>

Next, download and run the webapp by running the following commands:
<script src="https://gist.github.com/vartan/2aeccca2c08c66d861d5.js"></script>

The meat of the webapp can at the end of this section. For the most part, it serves static files located in the `html/` folder. However the special functionality is:

* Upon run, it queries LIRC for the list of devices, then for each device's button/keys. 
* When a user requests (GET) `http://webappurl/deviceName/buttonName`, it will send that key code by running `irsend SEND_ONCE deviceName keyName`. 

Here is the app code for your perusing. *Please do not copy and paste this script, clone it from git instead to receive the rest of the files.*
<script src="https://gist.github.com/vartan/fb6fd26006fb6fb87a90.js"></script>


### Running the app
The app can be ran with the following command: `sudo node app.js`. Ideally, though, this app runs whenever the raspberry pi boots up. This can be achieved by editing `/etc/rc.local` with the command `sudo nano /etc/rc.local` and adding this before `exit 0`

    sudo node /path/to/remote-pi/app.js


<style>  .file-data {max-height: 500px;}</style>
#References

**alexba.in**: [Setting Up LIRC on the RaspberryPi](http://alexba.in/blog/2013/01/06/setting-up-lirc-on-the-raspberrypi/) *http://alexba.in/blog/2013/01/06/setting-up-lirc-on-the-raspberrypi/*
