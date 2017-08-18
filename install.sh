## HD44780 installation script
echo "Installing HD44780 dependencies"
INSTALLING="/home/volumio/hd44780-plugin.installing"

if [ ! -f $INSTALLING ]; then

	touch $INSTALLING
	
	apt-get update
	DEBIAN_FRONTEND=noninteractive apt-get --assume-yes install -y -q python-smbus i2c-tools lcdproc python-mpd python-pip zip

	pip install mpdlcd

	wget -O /etc/mpdlcd.conf https://raw.githubusercontent.com/Saiyato/volumio-hd44780-plugin/master/templates/mpdlcd.conf

	# Driver installation
	mkdir /home/volumio/raspdrivers
	# ARMv6 -> rPi 1 A/A+/B/B+/Zero
	# ARMv7 -> rPi 2/3
	wget -O /home/volumio/raspdrivers/hd44780.so https://github.com/Saiyato/volumio-hd44780-plugin/raw/master/driver/hd44780.so

	# Remove and create LCDd.conf
	rm /etc/LCDd.conf
	wget -O /etc/LCDd.conf https://raw.githubusercontent.com/Saiyato/volumio-hd44780-plugin/master/templates/LCDd.conf
	
	# Place a patched wrapper to remove <Unknown> from the radio string
	mv /usr/local/lib/python2.7/dist-packages/mpdlcd/mpdwrapper.py /usr/local/lib/python2.7/dist-packages/mpdlcd/mpdwrapper.py.bak
	wget -O /usr/local/lib/python2.7/dist-packages/mpdlcd/mpdwrapper.py https://raw.githubusercontent.com/Saiyato/volumio-hd44780-plugin/master/templates/mpdwrapper.py

	rm /etc/init.d/mpdlcd
	echo "#! /bin/sh
	case \"\$1\" in
		start)
			/usr/local/bin/mpdlcd --no-syslog &
			;;
		stop)
			killall mpdlcd
			;;
		*)
			echo \"Usage: /etc/init.d/mpdlcd {start|stop}\"
			exit 1
			;;
	esac
	exit 0
	#" | sudo tee -a /etc/init.d/mpdlcd

	chmod a+x /etc/init.d/mpdlcd

	update-rc.d mpdlcd defaults
	update-rc.d LCDd defaults
	
	rm $INSTALLING
	
	#required to end the plugin install
	echo "plugininstallend"
else
	echo "Plugin is already installing! Not continuing..."
fi
