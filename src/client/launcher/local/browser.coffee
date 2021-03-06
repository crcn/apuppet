_     = require "underscore"
path  = require "path"
cstep = require "cstep"
utils = require "../../../utils"
asyngleton = require "asyngleton"
sift       = require "sift"
fiddle = require "fiddle"
Version = require "./version"
fs = require "fs"
outcome = require "outcome"
async = require "async"
rmdir = require "rmdir"
dirmr = require "dirmr"
os = require("os")
exec = require("child_process").exec
EventEmitter = require("events").EventEmitter

class Browser extends EventEmitter

  ###
  ###

  constructor: (@directory, @config, @versions) ->
    @name = path.basename directory

    @_systemSettingPaths = []

    if @config.settings
      for name of @config.settings
        @_systemSettingPaths.push @config.settings[name]


  ###
  ###

  test: (options, callback) ->
    version = sift({ number: options.version }, @versions).shift()

    if not version
      return callback new Error "#{@name}@#{options.version} does not exist"

    callback null, version


  ###
  ###

  start: (options, callback) -> 

    @killAll () =>
      @test options, (err, version) =>
        @currentVersion = version
        return callback(err) if err?
        @_copySettingsToSys () =>
          if os.type() is "Windows_NT"
            command = "start /WAIT \"\" \"#{version.path}\" #{options.args.join(" ")}"
          else
            command = "open \"#{version.path}\" -W --args #{options.args.join(" ")}"


          utils.logger.log command
          @_process = exec command
          @_process.on "exit", @_onExit
          callback null, @

  ###
  ###

  stop: (callback = (() ->)) ->
    return callback() if not @_process
    @killAll callback

  ###
  ###

  cleanup: cstep (callback) ->
    async.forEach @_systemSettingPaths, ((settingPath, next) ->
      return next() if not fs.existsSync settingPath
      utils.logger.log "rm -rf #{settingPath}"
      rmdir settingPath, next
    ), callback

  ###
  ###

  killAll: cstep (callback) ->
    utils.killProcesses @config.process.names, callback

  
  ###
  ###

  _copySettingsToSys: (callback) ->
    @cleanup outcome.e(callback).s () =>
      async.forEach @currentVersion.settings, ((setting, next) ->
        o = outcome.e next
        utils.logger.log "cp #{setting.from} -> #{setting.to}"
        dirmr([setting.from]).join(setting.to).complete(next)
      ), callback


  ###
  ###

  _onExit: () =>
    utils.logger.log "#{@name}@#{@currentVersion.number} has exited, cleaning up..."
    @running = false
    @emit "stop"


module.exports = Browser