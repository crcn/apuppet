// Generated by CoffeeScript 1.6.2
(function() {
  var Loaders, async, comerr, loaders,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  async = require("async");

  comerr = require("comerr");

  loaders = {
    directory: require("./directory"),
    remote: require("./remote")
  };

  Loaders = (function(_super) {
    __extends(Loaders, _super);

    /*
    */


    function Loaders(options) {
      var clazz, name;

      this._loaders = [];
      for (name in options) {
        if (!(clazz = loaders[name])) {
          continue;
        }
        this._loaders.push(new clazz(options[name]));
      }
    }

    /*
    */


    Loaders.prototype.loadApplications = function(callback) {
      return async.forEach(this._loaders, (function(loader, next) {
        return loader.loadApplications(callback);
      }), callback);
    };

    return Loaders;

  })(require("./base"));

  module.exports = Loaders;

}).call(this);