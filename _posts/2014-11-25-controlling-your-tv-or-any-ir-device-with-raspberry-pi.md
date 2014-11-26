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

    ########################################################
    # /etc/lirc/hardware.conf
    #
    # Arguments which will be used when launching lircd
    LIRCD_ARGS="--uinput"
     
    # Don't start lircmd even if there seems to be a good config file
    # START_LIRCMD=false
     
    # Don't start irexec, even if a good config file seems to exist.
    # START_IREXEC=false
     
    # Try to load appropriate kernel modules
    LOAD_MODULES=true
     
    # Run "lircd --driver=help" for a list of supported drivers.
    DRIVER="default"
    # usually /dev/lirc0 is the correct setting for systems using udev
    DEVICE="/dev/lirc0"
    MODULES="lirc_rpi"
     
    # Default configuration files for your hardware if any
    LIRCD_CONF=""
    LIRCMD_CONF=""
    ########################################################

Next, run these commands:
{% highlight bash %}
sudo echo "
lirc_dev
lirc_rpi gpio_in_pin=23 gpio_out_pin=22" >> /etc/modules
sudo /etc/init.d/lirc stop
sudo /etc/init.d/lirc start
{% endhighlight %}

### Recording your remote
(will flush this section out)




#References
[Setting Up LIRC on the RaspberryPi](http://alexba.in/blog/2013/01/06/setting-up-lirc-on-the-raspberrypi/)


<!-- app.js -->
<script src="https://gist.github.com/vartan/fb6fd26006fb6fb87a90.js"></script>