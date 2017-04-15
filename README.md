# volumio-lcd-line-display-plugin
Plugin for the HD44780 LCD for Volumio 2

No working version!

Roadmap:

1. Write the configuration
2. Write the index.js
3. Update the installscript to final
4. Update dependencies
5. Create package

# LCDPROC

I did not write nor contribute to lcdproc, so all credits go to them for enabling me to use it.

You can test your LCD by calling lcdproc to print CPU info, note that it is a capital C.

$ lcdproc C

For some reason a Pi2/Pi3 in combination with GPIO connections will not work:

Apr 15 19:03:55 volumio LCDd[1643]: check_board_rev: This board is not recognized as a Raspberry Pi!
Apr 15 19:03:55 volumio LCDd[1643]: Driver [hd44780] init failed, return code -1
Apr 15 19:03:55 volumio LCDd[1643]: Could not load driver hd44780
Apr 15 19:03:55 volumio LCDd[1643]: There is no output driver
Apr 15 19:03:55 volumio LCDd[1643]: Critical error while initializing, abort.

I recommend the use of an i2c piggy back.

# MPDLCD

Same as lcdproc, all credits go to the mpdlcd development team. You can start mpdlcd manually after installation to test its functionality.

$ mpdlcd
