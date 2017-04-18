'use strict';

var libQ = require('kew');
var libNet = require('net');
var fs = require('fs-extra');
var config = new (require('v-conf'))();
var exec = require('child_process').exec;


// Define the ControllerHD44780 class
module.exports = ControllerHD44780;

function ControllerHD44780(context) 
{
	var self = this;

	this.context = context;
	this.commandRouter = this.context.coreCommand;
	this.logger = this.context.logger;
	this.configManager = this.context.configManager;

}

ControllerHD44780.prototype.onVolumioStart = function()
{
	var self = this;
	self.logger.info("HD44780 initiated");
	
	this.configFile = this.commandRouter.pluginManager.getConfigurationFile(this.context, 'config.json');
	self.getConf(this.configFile);
	
	// For debugging purposes
	//self.logger.info('GPU memory: ' + self.config.get('gpu_mem'));
	//self.logger.info("Config file: " + this.configFile);
	
	return libQ.resolve();	
}

ControllerHD44780.prototype.getConfigurationFiles = function()
{
	return ['config.json'];
};

// Plugin methods -----------------------------------------------------------------------------
ControllerHD44780.prototype.onStop = function() {
	var self = this;

	return libQ.resolve();
};

ControllerHD44780.prototype.onStart = function() {
	var self = this;
	// var defer=libQ.defer();

	return libQ.resolve();
};

ControllerHD44780.prototype.stop = function() 
{
	// Kill process?
	self.logger.info("performing stop action");	
	
	return libQ.resolve();
};


ControllerHD44780.prototype.onRestart = function() 
{
	// Do nothing
	self.logger.info("performing onRestart action");	
	
	var self = this;
};

ControllerHD44780.prototype.onInstall = function() 
{
	var self = this;
};

ControllerHD44780.prototype.onUninstall = function() 
{
	// Uninstall.sh?
};

ControllerHD44780.prototype.getUIConfig = function() {
    var self = this;
	var defer = libQ.defer();    
    var lang_code = this.commandRouter.sharedVars.get('language_code');

	self.getConf(this.configFile);
	self.logger.info("Reloaded the config file");
	
	var charmappings = fs.readJsonSync(('/data/plugins/miscellanea/HD44780/character_mappings.json'),  'utf8', {throws: false});
	var contypes = fs.readJsonSync(('/data/plugins/miscellanea/HD44780/connection_types.json'),  'utf8', {throws: false});
	var scrolling = fs.readJsonSync(('/data/plugins/miscellanea/HD44780/scroll_speeds.json'),  'utf8', {throws: false});
	
    self.commandRouter.i18nJson(__dirname+'/i18n/strings_' + lang_code + '.json',
    __dirname + '/i18n/strings_en.json',
    __dirname + '/UIConfig.json')
    .then(function(uiconf)
    {
		// User configuration
        uiconf.sections[0].content[0].value = self.config.get('hello0');
		uiconf.sections[0].content[1].value = self.config.get('hello1');
		uiconf.sections[0].content[2].value = self.config.get('hello2');
		uiconf.sections[0].content[3].value = self.config.get('hello3');
		uiconf.sections[0].content[4].value = self.config.get('goodbye0');
		uiconf.sections[0].content[5].value = self.config.get('goodbye1');
		uiconf.sections[0].content[6].value = self.config.get('goodbye2');
		uiconf.sections[0].content[7].value = self.config.get('goodbye3');
		for (var n = 0; n < scrolling.speeds.length; n++){			
			self.configManager.pushUIConfigParam(uiconf, 'sections[0].content[8].options', {
				value: scrolling.speeds[n].value,
				label: scrolling.speeds[n].label
			});
			
			if(scrolling.speeds[n].label == self.config.get('speed'))
			{
				uiconf.sections[0].content[8].value.value = scrolling.speeds[n].value;
				uiconf.sections[0].content[8].value.label = scrolling.speeds[n].label;
			}
		}
		
		// Display configuration
		uiconf.sections[1].content[0].value = self.config.get('port');
		uiconf.sections[1].content[1].value = self.config.get('columns');
		uiconf.sections[1].content[2].value = self.config.get('rows');
		for (var n = 0; n < charmappings.mappings.length; n++){
			self.configManager.pushUIConfigParam(uiconf, 'sections[1].content[3].options', {
				value: charmappings.mappings[n].cIndex,
				label: charmappings.mappings[n].mapping
			});
			
			if(charmappings.mappings[n].mapping == self.config.get('char_map'))
			{
				
				uiconf.sections[1].content[3].value.value = charmappings.mappings[n].cIndex;
				uiconf.sections[1].content[3].value.label = charmappings.mappings[n].mapping;
			}
		}
		uiconf.sections[1].content[4].value = self.config.get('enable_mpdlcd');
		
		// Driver configuration
		uiconf.sections[2].content[0].value = self.config.get('driver_path');
		for (var n = 0; n < contypes.connections.length; n++){
			self.configManager.pushUIConfigParam(uiconf, 'sections[2].content[1].options', {
				value: contypes.connections[n].type,
				label: contypes.connections[n].connection
			});
			
			if(contypes.connections[n].connection == self.config.get('connection_type'))
			{
				uiconf.sections[2].content[1].value.value = contypes.connections[n].type;
				uiconf.sections[2].content[1].value.label = contypes.connections[n].connection;
			}
		}
		
        defer.resolve(uiconf);
    })
    .fail(function()
    {
        defer.reject(new Error());
    });

    return defer.promise;
};

ControllerHD44780.prototype.setUIConfig = function(data) {
	var self = this;
	
	self.logger.info("Updating UI config");
	var uiconf = fs.readJsonSync(__dirname + '/UIConfig.json');
	
	return libQ.resolve();
};

ControllerHD44780.prototype.getConf = function(configFile) {
	var self = this;
	this.config = new (require('v-conf'))()
	this.config.loadFile(configFile)
	
	return libQ.resolve();
};

ControllerHD44780.prototype.setConf = function(conf) {
	var self = this;
	return libQ.resolve();
};

// Public Methods ---------------------------------------------------------------------------------------

ControllerHD44780.prototype.getAdditionalConf = function (type, controller, data) {
	var self = this;
	return self.commandRouter.executeOnPlugin(type, controller, 'getConfigParam', data);
};

ControllerHD44780.prototype.updateUserConfig = function (data)
{
	var self = this;	
	var defer = libQ.defer();
	
	self.config.set('hello0', data['hello0']);
	self.config.set('hello1', data['hello1']);
	self.config.set('hello2', data['hello2']);
	self.config.set('hello3', data['hello3']);
	self.config.set('goodbye0', data['goodbye0']);
	self.config.set('goodbye1', data['goodbye1']);
	self.config.set('goodbye2', data['goodbye2']);
	self.config.set('goodbye3', data['goodbye3']);
	self.config.set('speed', data['speed'].value);
	
	self.updateLCDdConfig('TitleSpeed', self.config.get('speed'))
	.then(function (restart)
	{
		self.restartLCDd();
	})
	.fail(function ()
	{
		defer.reject(new Error());
	});
	
	defer.resolve();
	
	return defer.promise;
};

ControllerHD44780.prototype.updateDisplayConfig = function (data)
{
	var self = this;	
	var defer = libQ.defer();
	
	self.config.set('port', data['port']);
	self.config.set('columns', data['columns']);
	self.config.set('rows', data['rows']);
	self.config.set('char_map', data['char_map'].label);
	self.config.set('enable_mpdlcd', data['enable_mpdlcd']);
	
	self.updateLCDdConfig('port', self.config.get('port'))
	.then(function (c)
	{
		var size = self.config.get('columns') + "x" + self.config.get('rows');
		self.updateLCDdConfig('Size', size);
	})
	.then(function (c)
	{
		self.updateLCDdConfig('CharMap', self.config.get('char_map'));
	})
	.then(function (mpdlcd)
	{
		self.logger.info("mpdlcd = " + self.config.get('enable_mpdlcd'));
		
		var command = "/bin/echo volumio | /usr/bin/sudo -S /bin/mv /etc/init.d/mpdlcd.bak /etc/init.d/mpdlcd";
		var sCommand = "/bin/echo volumio | /usr/bin/sudo -S /etc/init.d/mpdlcd start";
		if(self.config.get('enable_mpdlcd') == false)
		{
			command = "/bin/echo volumio | /usr/bin/sudo -S /bin/mv /etc/init.d/mpdlcd /etc/init.d/mpdlcd.bak";
			sCommand = "/bin/echo volumio | /usr/bin/sudo -S /etc/init.d/mpdlcd stop";
				
			exec(sCommand, {uid:1000, gid:1000}, function (error, stout, stderr) {
			if(error)
				console.log(stderr);
			});
				
			exec(command, {uid:1000, gid:1000}, function (error, stout, stderr) {
			if(error)
				console.log(stderr);
			});
		}
		else
		{			
			exec(command, {uid:1000, gid:1000}, function (error, stout, stderr) {
			if(error)
				console.log(stderr);
			});
			
			exec(sCommand, {uid:1000, gid:1000}, function (error, stout, stderr) {
			if(error)
				console.log(stderr);
			});
		}
		defer.resolve();
	})
	.then(function (control_mpdlcd)
	{
		
	})
	.then(function (restart)
	{
		self.restartLCDd();
	})
	.fail(function ()
	{
		defer.reject(new Error());
	});
	
	defer.resolve();
	
	return defer.promise;
};

ControllerHD44780.prototype.updateDriverConfig = function (data)
{
	var self = this;	
	var defer = libQ.defer();
	
	self.config.set('driver_path', data['driver_path']);
	self.config.set('connection_type', data['connection_type'].label);
	
	self.config.set('deviating_pins', data['deviating_pins']);
	
	if(self.config.get('deviating_pins'))
	{
		self.config.set('pin_D7', data['pin_D7']);
		self.config.set('pin_D6', data['pin_D6']);
		self.config.set('pin_D5', data['pin_D5']);
		self.config.set('pin_D4', data['pin_D4']);
		self.config.set('pin_EN', data['pin_EN']);
		self.config.set('pin_EN2', data['pin_EN2']);
		self.config.set('pin_RS', data['pin_RS']);
		self.config.set('pin_BL', data['pin_BL']);
	}
	else
	{
		// Revert to default
		self.config.set('pin_D7', "18");
		self.config.set('pin_D6', "23");
		self.config.set('pin_D5', "24");
		self.config.set('pin_D4', "25");
		self.config.set('pin_EN', "8");
		self.config.set('pin_EN2', "22");
		self.config.set('pin_RS', "7");
		self.config.set('pin_BL', "17");
	}
	
	self.updateLCDdConfig('DriverPath', self.config.get('driver_path'))
	.then(function (d7)
	{
		self.updateLCDdConfig('pin_D7', self.config.get('pin_D7'));
	})
	.then(function (d6)
	{
		self.updateLCDdConfig('pin_D6', self.config.get('pin_D6'));
	})
	.then(function (d5)
	{
		self.updateLCDdConfig('pin_D5', self.config.get('pin_D5'));
	})
	.then(function (d4)
	{
		self.updateLCDdConfig('pin_D4', self.config.get('pin_D4'));
	})
	.then(function (en)
	{
		self.updateLCDdConfig('pin_EN', self.config.get('pin_EN'));
	})
	.then(function (en2)
	{
		self.updateLCDdConfig('pin_EN2', self.config.get('pin_EN2'));
	})
	.then(function (rs)
	{
		self.updateLCDdConfig('pin_RS', self.config.get('pin_RS'));
	})
	.then(function (bl)
	{
		self.updateLCDdConfig('pin_BL', self.config.get('pin_BL'));
	})
	.then(function (restart)
	{
		self.restartLCDd();
	})
	.fail(function ()
	{
		defer.reject(new Error());
	});
	
	defer.resolve();
	
	return defer.promise;
};

ControllerHD44780.prototype.updateLCDdConfig = function (setting, value)
{
	var self = this;
	var defer = libQ.defer();
	var castValue;
	
	if(value == true || value == false)
			castValue = ~~value;
	else
		castValue = value;
	
	var command = "/bin/echo volumio | /usr/bin/sudo -S /bin/sed -i -- 's|^" + setting + "=.*|" + setting + "=" + castValue + "|g' /etc/LCDd.conf";
	
	if(setting == "port")
		command = "/bin/echo volumio | /usr/bin/sudo -S /bin/sed -i -- 's|^Port=0x.*|Port=" + castValue + "|g' /etc/LCDd.conf";
	
	// add or replace in line
	// var command = "/bin/echo volumio | /usr/bin/sudo -S /bin/sed '/^" + setting + "=/{h;s/=.*/=" + castValue + "/};${x;/^$/{s//" + setting + "=" + castValue + "/;H};x}' -i " + file;
	
	exec(command, {uid:1000, gid:1000}, function (error, stout, stderr) {
		if(error)
			console.log(stderr);
		
		defer.resolve();
	});
	
	return defer.promise;
};

ControllerHD44780.prototype.restartLCDd = function ()
{
	var self = this;
	var defer=libQ.defer();

	exec("/bin/echo volumio | /usr/bin/sudo -S /etc/init.d/LCDd restart", {uid:1000,gid:1000}, function (error, stdout, stderr) {
		if (error !== null) {
			self.commandRouter.pushConsoleMessage('The following error occurred while restarting LCDd: ' + error);
			self.commandRouter.pushToastMessage('error', "Restart failed", "Restarting LCDd failed with error: " + error);
			defer.reject();
		}
		else {
			self.commandRouter.pushConsoleMessage('LCDd restarted');
			self.commandRouter.pushToastMessage('success', "LCDd", "Restarted LCDd for the changes to take effect.");
			defer.resolve();
		}
	});

	return defer.promise;
};