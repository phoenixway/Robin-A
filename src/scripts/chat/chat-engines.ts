import {IChatEngine} from "./chat/IChatEngine"

import chalk from 'chalk'
 
class RiverScriptChat implements IChatEngine{
    private chat: any
    private ready: boolean = false
    private pendingMessage: string = ""
    private _user: string = "Guest"
    constructor(){
        this.chat = new RiveScript({
            debug:   false,
            onDebug: (message) => {console.debug(chalk.bold.red(message));}
        });
        let that = this
        this.chat.loadDirectory("brain"
				, () => {
					that.chat.sortReplies();
                    that.ready = true
                    if (this.pendingMessage.length > 0){
                        this.say(this.pendingMessage)
                        this.pendingMessage = ""
                    }
				}
                , (err) => {
            debugger
                    console.log(`Robin> Loading error: ${err}`);
                }
            );
    }
    onReply: (answer: string) => any
    say(message: string): string{
        //debugger
        if (!this.ready){
            this.pendingMessage = message
            console.log(`Robin> Error during answering.`);
            return 'Robin> Error during answering.'
        }
        let reply: string = this.chat.reply(this._user, message, this)
        if (this.onReply)
            this.onReply(`Robin> ${reply}`)
        return reply
    }
    get user(){
        return this._user
    }
    set user(username){
        this._user = username
    }
}


export {RiverScriptChat as DefaultChatEngine};
