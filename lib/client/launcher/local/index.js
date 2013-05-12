// Generated by CoffeeScript 1.6.2
(function() {
  var Browser, Loader, LocalLauncher, async, cstep, fs, path, sift, utils;

  fs = require("fs");

  path = require("path");

  utils = require("../../../utils");

  cstep = require("cstep");

  async = require("async");

  Browser = require("./browser");

  sift = require("sift");

  Loader = require("./loader");

  LocalLauncher = (function() {
    /*
    */
    function LocalLauncher(path) {
      this.directory = utils.fixPath(path);
      this._loader = new Loader(this.directory);
      this.load();
      this._listenOnExit();
    }

    /*
    */


    LocalLauncher.prototype.start = cstep(function(options, callback) {
      var browser;

      browser = sift({
        name: options.name
      }, this.browsers).pop();
      if (!browser) {
        return callback(new Error("browser " + options.name + " does not exist"));
      }
      return browser.start(options, callback);
    });

    /*
    */


    LocalLauncher.prototype.load = cstep(function(callback) {
      var _this = this;

      return this._loader.load(function(err, browsers) {
        _this.browsers = browsers;
        return callback(err);
      });
    });

    /*
    */


    LocalLauncher.prototype._listenOnExit = function() {
      var _this = this;

      return process.once("SIGINT", function() {
        var app, _i, _len, _ref, _results;

        _ref = _this.browsers;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          app = _ref[_i];
          _results.push(app.stop());
        }
        return _results;
      });
    };

    return LocalLauncher;

  })();

  module.exports = LocalLauncher;

}).call(this);