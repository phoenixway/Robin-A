import {DefaultChatEngine} from './chat/chat-engines'

export const chatbot = (function(){
    const maxSilenceDuration = 30,
          maxSilenceScope = "seconds";  
	var  stopWaitingDate,
    	 timerId,
         hasTGambits = false

    var chatEngine = new DefaultChatEngine()
    var firstMessage = true
    var userName = 'Guest'

    return {
        get user(){
            return userName
        },
        set user(username){
            userName = username
        },
        set onReply(func){
            chatEngine.onReply = func
            if (firstMessage){
                this.talk.sayHello()
                firstMessage = false
            }
            
		},
        get onReply(){
            return chatEngine.onReply
        },
        talk: {
            say: function(message){
                //emit own message
                if (chatEngine.onReply)
                    chatEngine.onReply(`${userName}> ${message}`)
                chatEngine.say(message)
                //breaking silence
                clearTimeout(timerId);
                stopWaitingDate = moment().add(maxSilenceDuration ,         maxSilenceScope).toDate();
                if (hasTGambits)
                    timerId = setTimeout(this.breakSilence, maxSilenceDuration *1000);
            },            
            sayHello: function(){
                this.say('robi hello')
            },
            breakSilence: function () {
                this.say(`robi silence`);
                stopWaitingDate = moment().add(maxSilenceDuration, maxSilenceScope).toDate();
                clearTimeout(timerId);
                if (hasTGambits)
                    timerId = setTimeout(breakSilence, maxSilenceDuration*1000);
            },
            direct: function (topic, label) {
                
            }
        },
        state: {
            load: function(){
            
            },
            save: function(){

            },
            reload: function () {
            
            }
        }
    }
})()