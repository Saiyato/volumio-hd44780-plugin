'use strict';

// var STR_PAD_LEFT = 1;
// var STR_PAD_RIGHT = 2;
// var STR_PAD_BOTH = 3;

var DISPLAY_WIDTH = 16;
var DISPLAY_HEIGHT = 2;

var ANIMATION_SPEED = 1000; // in milliseconds

var Lcd = require('lcd');

// if (!String.prototype.padEnd) {	
	// String.prototype.padEnd = function (count, str) {		
		// var rep = count - str.length > 0 ? count - str.length : 0;
		// return (this + (str || ' ').repeat(rep)).substr(0,count);
	// };
// }

// if (!String.prototype.padStart) {
	// String.prototype.padStart = function (count, str) {
		// return (str || ' ').repeat(count).substr(0,count) + this;
	// };
// }

module.exports = parallelDisplay;

function parallelDisplay(context) {
	var self = this;

	self.displayTimer = undefined;
	self.currentState = undefined;
	self.elapsed = 0;
	
	var columns = 16;
	DISPLAY_WIDTH = columns;

	self.context = context;
  	self.logger = self.context.logger;

	self.lcd = new Lcd({rs: 7, e: 8, data: [25, 24, 23, 18], cols: columns, rows: 2});
};


parallelDisplay.prototype.pushState = function(state)  {
	var self = this;
	self.elapsed = state.seek;
	if (state.status === 'play') {		
		if (self._needStartDisplayInfo(state)) {
			clearTimeout(self.displayTimer);
			self.lcd.clear();
			self.displayInfo(state, 0);
		}
	}
	else if (state.status === 'stop') {
		self.elapsed = 0;
		clearTimeout(self.displayTimer);
		self.lcd.clear();
	}
	else if (state.status === 'pause') {
		self.elapsed = state.seek;
	}
	self.currentState = state;
}

parallelDisplay.prototype.close = function() {
	var self = this;
	if (self.displayTimer !== undefined) {
		clearTimeout(self.displayTimer);
	}
	self.lcd.close();
};


parallelDisplay.prototype.stopDisplayDuration = function() {
	var self = this;
	if (self.displayTimer !== undefined) {
		clearTimeout(self.displayTimer);
		self.displayTimer = undefined;
	}
	self.lcd.clear();
}

parallelDisplay.prototype.endOfSong = function() {
	var self = this;

	if (self.displayTimer !== undefined) {
		clearTimeout(self.displayTimer);
		self.displayTimer = undefined;
	}	
	self.lcd.clear();
}

parallelDisplay.prototype.displayInfo = function(data, index) {
	var self = this;

 	var duration = data.duration;
	
	// Enable auto-scroll
	//self.lcd.autoscroll();

	if (duration != 0 && (self.elapsed == 0 || self.elapsed >= duration * 1000)) {
		self.endOfSong();
	}
	else {
	    //self.lcd.clear();
	    // Display artist info
	    var artistInfo = data.artist + ' - ' + data.title;
	    var buff = artistInfo;
	    if (buff.length > DISPLAY_WIDTH) {
	    	buff = artistInfo + '          ' + artistInfo.substr(0, DISPLAY_WIDTH);
	    }
	    else {
	    	buff = buff + (' ').repeat(DISPLAY_WIDTH-buff.length);
	    	buff = buff.substr(0, DISPLAY_WIDTH);
	    }

	    if (index >= buff.length - DISPLAY_WIDTH) {
	    	index = 0;
	    }
	    self.lcd.setCursor(0,0);
	    self.lcd.print(buff.substr(index, DISPLAY_WIDTH), function() {  
		
	  	    // Display duration
	  	    self.lcd.setCursor(0,1);
			if(duration != 0)
			{
				self.lcd.print(self._formatDuration(self.elapsed,duration), function() {
					self.displayTimer = setTimeout( function () {
						if (self.currentState.status != 'pause')
							self.elapsed += ANIMATION_SPEED;
						self.displayInfo(data, index + 1);
					}, ANIMATION_SPEED);
				});
			}
			// Webradio fix
			else
				self.lcd.print('    WEBRADIO', function() {
					self.displayTimer = setTimeout( function () {
						if (self.currentState.status != 'pause')
							self.elapsed += ANIMATION_SPEED;
						self.displayInfo(data, index + 1);
					}, ANIMATION_SPEED);
				});
				
	  	});
	}
}

// private
parallelDisplay.prototype._formatDuration = function(seek, duration) {
  var self = this;
  var dur;
  var seek_sec = Math.ceil(seek / 1000).toFixed(0);
  var seek_min = Math.floor(seek_sec / 60);
  seek_sec = seek_sec - seek_min * 60;
  
  if(duration > 0)
  {
	  var dur_min = Math.floor(duration / 60);
	  var dur_sec = duration - dur_min * 60;
	  if (dur_sec < 10) {dur_sec = "0"+dur_sec;}  
  }

  if (seek_sec < 10) {seek_sec = "0"+seek_sec;}  
  
  if(duration > 0)
	dur = '   '+seek_min+'.'+seek_sec+':'+dur_min+'.'+dur_sec+'   ';
  else
	dur = ' WEBRADIO ' + seek_min + ':' + seek_sec + ' ';

  return dur.substr(0,DISPLAY_WIDTH);
}

//private
parallelDisplay.prototype._displayRunning = function(state) {
  var self = this;
  return (typeof(self.currentState) === 'undefined' ||
          self.currentState.artist !== state.artist || 
  	  	  self.currentState.title !== state.title);
}

//private
parallelDisplay.prototype._needStartDisplayInfo = function(state) {
  var self = this;
  return  ((state.status === 'play' && self.currentState.status === 'stop') ||
          self.currentState.artist !== state.artist || 
  	  	  self.currentState.title !== state.title);
}
