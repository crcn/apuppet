// Generated by CoffeeScript 1.6.2
(function() {
  var Browser, Loader, Version, asyngleton, cstep, fiddle, fs, path, utils, winston, _;

  Browser = require("./browser");

  Version = require("./version");

  asyngleton = require("asyngleton");

  utils = require("../../../utils");

  cstep = require("cstep");

  _ = require("underscore");

  path = require("path");

  fs = require("fs");

  fiddle = require("fiddle");

  winston = require("winston");

  Loader = (function() {
    /*
    */
    function Loader(directory) {
      this.directory = directory;
      this.load();
    }

    /*
    */


    Loader.prototype.load = asyngleton(cstep(function(callback) {
      var browsers,
        _this = this;

      winston.info("load local " + this.directory);
      browsers = utils.readdir(this.directory).map(function(dir) {
        var config;

        config = _this._fixConfig(dir, require(dir));
        return new Browser(dir, config, _this._loadVersions(config));
      });
      return callback(null, browsers);
    }));

    /*
    */


    Loader.prototype._loadVersions = function(config) {
      var versions,
        _this = this;

      versions = utils.readdir(config.directories.versions).map(function(verPath) {
        var setter, vc, version, versionParts, _i, _len, _ref;

        versionParts = path.basename(verPath).split(".");
        versionParts.pop();
        version = versionParts.join(".");
        vc = {
          number: version,
          path: verPath,
          settingDirs: config.settingPaths[version]
        };
        _ref = config.versionConfigSetter;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          setter = _ref[_i];
          setter(vc);
        }
        return new Version(vc);
      });
      return versions;
    };

    /*
    */


    Loader.prototype._fixConfig = function(dir, config) {
      var dirname, name, settingName, settingPaths, settings, version, versions, vp, _i, _j, _len, _len1, _ref;

      config.directories = _.defaults(config.directories || {}, {
        versions: "versions",
        settings: "settings"
      });
      config.settings = config.settings || {};
      for (name in config.settings) {
        config.settings[name] = utils.fixPath(config.settings[name]);
      }
      for (dirname in config.directories) {
        config.directories[dirname] = path.join(dir, config.directories[dirname]);
      }
      settingPaths = {};
      if (fs.existsSync(config.directories.settings)) {
        _ref = fs.readdirSync(config.directories.settings);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          name = _ref[_i];
          versions = name.split(" ");
          for (_j = 0, _len1 = versions.length; _j < _len1; _j++) {
            version = versions[_j];
            vp = path.join(config.directories.settings, name);
            settings = [];
            for (settingName in config.settings) {
              settings.push({
                from: path.join(vp, settingName),
                to: config.settings[settingName]
              });
            }
            settingPaths[version] = settings;
          }
        }
      }
      config.settingPaths = settingPaths;
      config.versionConfigSetter = (config.versions || []).map(function(config) {
        return fiddle({
          $set: config.set
        }, config.test);
      });
      return config;
    };

    return Loader;

  })();

  module.exports = Loader;

}).call(this);
