## HD44780 installation script
echo "Installing HD44780 dependencies"
UNINSTALLING="/home/volumio/hd44780-plugin.uninstalling"

if [ ! -f $UNINSTALLING ]; then

	touch $UNINSTALLING
	
	pip uninstall mpdlcd
	apt-get remove --purge -y lcdproc python-mpd
	# Not uninstalling all packages, they might be used by other plugins, these seem pretty specific
	
	rm /etc/mpdlcd.conf

	# Driver removal
	rm -rf /home/volumio/raspdrivers
	
	# Remove LCDd.conf
	rm /etc/LCDd.conf
	
	# Remove the unpatched wrapper backup
	rm /usr/local/lib/python2.7/dist-packages/mpdlcd/mpdwrapper.py.bak
	rm /etc/init.d/mpdlcd
	
	rm $UNINSTALLING
	
	#required to end the plugin install
	echo "plugininstallend"
else
	echo "Plugin is already uninstalling! Not continuing..."
fi
