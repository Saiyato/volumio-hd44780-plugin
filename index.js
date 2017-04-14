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
		//uiconf.sections[0].content[8].value = self.config.get('speed');
		for (var n = 1; n < 11; n++){
			self.configManager.pushUIConfigParam(uiconf, 'sections[0].content[8].options', {
				value: n,
				label: n.toString()
			});
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
		}
		
		// Driver configuration
		uiconf.sections[2].content[0].value = self.config.get('driver_path');
		for (var n = 0; n < contypes.connections.length; n++){
			self.configManager.pushUIConfigParam(uiconf, 'sections[2].content[1].options', {
				value: contypes.connections[n].type,
				label: contypes.connections[n].connection
			});
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

ControllerHD44780.prototype.restartKodi = function ()
{
	var self = this;
	var defer=libQ.defer();

	exec("/usr/bin/sudo /bin/systemctl restart kodi.service", {uid:1000,gid:1000}, function (error, stdout, stderr) {
		if (error !== null) {
			self.commandRouter.pushConsoleMessage('The following error occurred while starting KODI: ' + error);
			self.commandRouter.pushToastMessage('error', "Restart failed", "Restarting Kodi failed with error: " + error);
			defer.reject();
		}
		else {
			self.commandRouter.pushConsoleMessage('KODI started');
			self.commandRouter.pushToastMessage('success', "Restarted Kodi", "Restarted Kodi for the changes to take effect.");
			defer.resolve();
		}
	});

	return defer.promise;
}

ControllerHD44780.prototype.updateSoundConfig = function (data)
{
	var self = this;
	var defer = libQ.defer();
	
	self.config.set('usedac', data['usedac']);
	self.config.set('kalidelay', data['kalidelay']);
	self.logger.info("Successfully updated sound configuration");
	
	self.writeSoundConfig(data)
	.then(function (restartService) {
		self.restartKodi();
	})
	.fail(function(e)
	{
		defer.reject(new error());
	})
	
	return defer.promise;
}

ControllerHD44780.prototype.updateConfigFile = function (setting, value, file)
{
	var self = this;
	var defer = libQ.defer();
	var castValue;
	
	if(value == true || value == false)
			castValue = ~~value;
	else
		castValue = value;
	
	var command = "/bin/echo volumio | /usr/bin/sudo -S /bin/sed '/^" + setting + "=/{h;s/=.*/=" + castValue + "/};${x;/^$/{s//" + setting + "=" + castValue + "/;H};x}' -i " + file;
	exec(command, {uid:1000, gid:1000}, function (error, stout, stderr) {
		if(error)
			console.log(stderr);
		
		defer.resolve();
	});
	
	return defer.promise;
}