## HD44780 installation script
apt-get update
apt-get --assume-yes install -y -q python-smbus i2c-tools lcdproc python-mpd python-pip zip

pip install mpdlcd

wget -O /etc/mpdlcd.conf https://raw.githubusercontent.com/Saiyato/volumio-hd44780-plugin/master/mpdlcd.conf

# Driver installation
mkdir /home/volumio/raspdrivers
# ARMv6 -> rPi 1 A/A+/B/B+/Zero
wget -O /home/volumio/raspdrivers/hd44780.so https://github.com/Saiyato/volumio-hd44780-plugin/raw/master/Driver/hd44780.so

# Remove and create LCDd.conf
rm /etc/LCDd.conf
wget -O /etc/LCDd.conf https://raw.githubusercontent.com/Saiyato/volumio-hd44780-plugin/master/LCDd.conf

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
