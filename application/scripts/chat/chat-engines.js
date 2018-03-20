"use strict";
exports.__esModule = true;
var chalk_1 = require("chalk");
var RiverScriptChat = /** @class */ (function () {
    function RiverScriptChat() {
        var _this = this;
        this.ready = false;
        this.pendingMessage = "";
        this._user = "Guest";
        this.chat = new RiveScript({
            debug: false,
            onDebug: function (message) { console.debug(chalk_1["default"].bold.red(message)); }
        });
        var that = this;
        this.chat.loadDirectory("brain", function () {
            that.chat.sortReplies();
            that.ready = true;
            if (_this.pendingMessage.length > 0) {
                _this.say(_this.pendingMessage);
                _this.pendingMessage = "";
            }
        }, function (err) {
            debugger;
            console.log("Robin> Loading error: " + err);
        });
    }
    RiverScriptChat.prototype.say = function (message) {
        //debugger
        if (!this.ready) {
            this.pendingMessage = message;
            console.log("Robin> Error during answering.");
            return 'Robin> Error during answering.';
        }
        var reply = this.chat.reply(this._user, message, this);
        if (this.onReply)
            this.onReply("Robin> " + reply);
        return reply;
    };
    Object.defineProperty(RiverScriptChat.prototype, "user", {
        get: function () {
            return this._user;
        },
        set: function (username) {
            this._user = username;
        },
        enumerable: true,
        configurable: true
    });
    return RiverScriptChat;
}());
exports.DefaultChatEngine = RiverScriptChat;
