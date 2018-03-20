"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
class RiverScriptChat {
    constructor() {
        this.ready = false;
        this.pendingMessage = "";
        this._user = "Guest";
        this.chat = new RiveScript({
            debug: false,
            onDebug: (message) => { console.debug(chalk_1.default.bold.red(message)); }
        });
        let that = this;
        this.chat.loadDirectory("brain", () => {
            that.chat.sortReplies();
            that.ready = true;
            if (this.pendingMessage.length > 0) {
                this.say(this.pendingMessage);
                this.pendingMessage = "";
            }
        }, (err) => {
            debugger;
            console.log(`Robin> Loading error: ${err}`);
        });
    }
    say(message) {
        //debugger
        if (!this.ready) {
            this.pendingMessage = message;
            console.log(`Robin> Error during answering.`);
            return 'Robin> Error during answering.';
        }
        let reply = this.chat.reply(this._user, message, this);
        if (this.onReply)
            this.onReply(`Robin> ${reply}`);
        return reply;
    }
    get user() {
        return this._user;
    }
    set user(username) {
        this._user = username;
    }
}
exports.DefaultChatEngine = RiverScriptChat;
