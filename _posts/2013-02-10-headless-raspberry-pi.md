---
layout: post
title: "Setting up a Headless Raspberry Pi"
description: "Setting up a raspberry pi with no monitor, keyboard, or mouse optional: WiFi"
thumbnail: "/images/thumbnails/rpi.jpg"
category : raspberry-pi
tagline: "no monitor, keyboard, or mouse. (optional: Wifi)"
tags : [raspberry-pi, hardware, linux]
---
{% include JB/setup %}
A headless raspberry pi is a raspberry pi that is not hooked up to a monitor, a keyboard, or a mouse. It is pretty easy to set a raspberry pi up 
and then remove the peripherals, but this guide is for those who do not want to take their setups apart to set up their raspberry pi.


## Things you will need

1. A [Raspberry Pi](http://www.amazon.com/exec/obidos/ASIN/B009SQQF9C/mvartan-20). 
They should sell as low as $35 on some websites, but if you need it quickly, it will be in stock at amazon. 
Make sure to have a [Micro-USB cable](http://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=microusb%7C%28Micro+usb%29&tag=mvartan-20) and [USB power adapter](http://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=usb+power%7Ccharger%7Cac&rh=i%3Aaps%2Ck%3Ausb+power%7Ccharger%7Cac&tag=mvartan-20) handy as well.

2. An SD Card. I recommend getting a [Class 10 SD Card](http://www.amazon.com/s/?url=search-alias&field-keywords=class+10+sd+card&tag=mvartan-20) for the fastest speeds. The small ones go for as little as 5 dollars.

3. SSH. If you are using Windows, I recommend using [PuTTy](http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html). You can also SSH using apps on your smartphone or tablet. 

4. A VNC viewer/client. I recommend [TightVNC](http://www.tightvnc.com/download.php) for your PC. You can also find VNC clients for your smartphone or tablet

5. Ethernet connection.

6. (optional) WiFi adapter. I bought the Edimax Wireless Nano USB Adapter and have had no issues.


## Downloading raspbian

First, download Raspbian, the primary operating system for the Raspberry Pi, and write it to the SD card. If you are using Windows, use Win32DiskImager. After the image is written to your SD card, pop it into your Raspberry Pi


Connect your Raspberry Pi to Ethernet, and power it up. Meanwhile, log in to your WiFi router to find all of the clients connected to it.

You should be able to find your raspberry pi’s local IP address

![Find your Raspberry Pi's IP through your router's web interface](/images/headless-raspberry-pi/router.png)

## Logging into your pi

Now, ssh into your Raspberry Pi, in port 22. The default login is:

I suggest you first change your password and set up your pi by typing `sudo raspi-config` Then, update your raspberry pi by `sudo apt-get upgrade`.


**Username**: pi
	
**Password**: raspberry

![](/images/headless-raspberry-pi/putty.png)





 
## Accessing your Desktop Environment

If you do not need to ever use a desktop environment, you are done! Otherwise, read on.

The next thing we need to do is install a VNC server. VNC stands for “Virtual Network Computing”, and allows you to view your computer screen remotely. Type the command: `sudo apt-get install tightvncserver`

Now we have a VNC server installed!

![Raspberry Pi Desktop on VNC](/images/headless-raspberry-pi/desktop.png)
 

I prefer to leave VNC off until I need it, so that the Raspberry Pi doesn’t maintain a desktop environment unless I need it, saving processing power. When I need to view the desktop, I type this command in ssh: `tightvncserver -geometry 1366×768` (change the resolution as desired)

This will create a server, usually on port 1. It may ask you for a password on the first time, it must be less than 8 characters.

Then, just log into your VNC viewer and put in your server details and login credentials.


If you want to close the VNC server, type `tightvncserver -kill :[port]` (where [port] is most likely 1)

Now you have your headless raspberry pi set up!

## Adding WiFi <small>(optional)</small>

Plug your WiFi dongle into a USB port of the Raspberry Pi. On the desktop, you should see WiFi Config. If not, go to `Start`->`Other`->`wpa_supplicant user interface`. 

Click *Scan* and configure your network.


