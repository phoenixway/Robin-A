// import * as moment from "moment";
// import * as schedule from "node-schedule";
const moment = require("moment"), schedule = require("node-schedule");
class TGQuery {
    add(tgTopic, tgLabel) {
    }
    remove(tgTopic, tgLabel) {
    }
    getItem() {
        return {
            tgTopic: this.tgTopic_,
            tgLabel: this.tgLabel_
        };
    }
}
class Action {
    constructor(id = 0, priority = 0) {
        this.id = id;
        this.priority = priority;
        this.do = function () { };
        this.doIt = function () {
            if (this.do !== null)
                this.do();
            this.doAfter();
        };
        this.id = id;
        this.priority = priority;
    }
    get isPossible() {
        if (this.possible_checker != null)
            return this.possible_checker();
    }
}
class ActionQuery {
    get ids() { return this.actions.map((act) => { return act.id; }); }
    ;
    get length() {
        return this.actions.length;
    }
    constructor() {
        this.actions = new Array();
    }
    item(index) {
        return this.actions[index];
    }
    sort() {
        this.actions.sort(function (a, b) {
            if (b.priority < a.priority)
                return 1;
            return -1;
        });
    }
    clear() {
        this.actions.length = 0;
        this.current_position = -1;
    }
    add(action) {
        this.actions.push(action);
        this.sort();
    }
    remove(action) {
        let i = this.actions.indexOf(action);
        if (i !== -1)
            this.actions.splice(i, 1);
        this.current_position--;
    }
    //в початок черги
    start() {
        if (this.actions.length > 0)
            this.current_position = -1;
        else
            this.current_position = -2;
    }
    //сама пріорітетна із можливих
    next() {
        ;
        this.current_position++;
        if (this.current_position >= this.actions.length)
            return null;
        if (this.actions[this.current_position].isPossible)
            return this.actions[this.current_position];
        else
            return this.next();
    }
    //найближча наступна доступна дія
    nextAction() {
        this.actions.sort(function (a, b) {
            if (b.when.nextTime < a.when.nextTime)
                return 1;
            return -1;
        });
        return this.item(0);
    }
    nextActionA() {
        this.actions.sort(function (a, b) {
            if (b.when.toDate() < a.when.toDate())
                return 1;
            return -1;
        });
        return this.item(0);
    }
    //чи є можливі зараз дії
    get notEmpty() {
        return this.actions.length > 0 && (this.current_position + 1 < this.actions.length);
    }
}
var Scope;
(function (Scope) {
    Scope["none"] = "none";
    Scope["hour"] = "hours";
    Scope["minute"] = "minutes";
    Scope["second"] = "seconds";
    Scope["day"] = "days";
})(Scope || (Scope = {}));
;
class Dati {
    constructor() {
        this.recurring = false;
        this.at_ = null;
        this.every_ = 0;
        this.scope = Scope.none;
        this.after_ = 0;
        this.lastTime = new Date();
    }
    recalc() {
        this.parse(this.stringParam);
    }
    getFormat(s) {
        let format = "";
        if (s.match(/\d\d\:\d\d/g))
            format = "HH:mm";
        return format;
    }
    update() {
        //get mode
        if (this.at_ != null) {
            this.recurring = false;
            let d;
            try {
                d = moment(this.at_, this.getFormat(this.at_));
                if (d.isValid())
                    this.finalDate = d.toDate();
                else
                    this.finalDate = null;
            }
            catch (e) {
                console.debug(`Error in Dati.recalc() parsing this.at to Date: ${e}`);
            }
        }
        else if (this.every_ != 0 && this.scope != Scope.none) {
            this.recurring = true;
            let mom;
            if (this.from_ == null)
                this.finalDate = new Date();
            else {
                if ((typeof this.from_) == 'string')
                    mom = moment(this.from_, this.getFormat(this.from_)).add(this.every_, this.scope);
                else
                    mom = moment(this.from_).add(this.every_, this.scope);
                if (mom.isValid())
                    this.finalDate = mom.toDate();
                else
                    this.finalDate = null;
            }
        }
        else if (this.after_ != 0 && this.scope != Scope.none) {
            this.recurring = false;
            let mom = moment(new Date()).add(this.after_, this.scope);
            if (mom.isValid())
                this.finalDate = mom.toDate();
            else
                this.finalDate = null;
        }
    }
    toDate() {
        // this.update();
        return this.finalDate;
    }
    after(n) {
        this.from_ = null;
        this.after_ = n;
        this.scope = Scope.none;
        this.update();
        return this;
    }
    from(s) {
        this.from_ = s;
        this.update();
        return this;
    }
    at(s) {
        this.at_ = s;
        this.from_ = null;
        this.every_ = 0;
        this.after_ = 0;
        this.scope = Scope.none;
        this.update();
        return this;
    }
    each(n) {
        this.at_ = null;
        this.every_ = n;
        this.after_ = 0;
        this.from_ = null;
        this.scope = Scope.none;
        this.update();
        return this;
    }
    hours() {
        this.scope = Scope.hour;
        this.update();
        return this;
    }
    minutes() {
        this.scope = Scope.minute;
        this.update();
        return this;
    }
    seconds() {
        this.scope = Scope.second;
        this.update();
        return this;
    }
    days() {
        this.scope = Scope.day;
        this.update();
        return this;
    }
    parse(s) {
        //		
        let reg = /^(once|every)(\s*)(.*)/;
        let m = s.match(reg);
        if (!m)
            return;
        this.stringParam = s;
        if (m[1] == "once") {
        }
        else {
            this.every(m[3]);
        }
    }
    every(s) {
        this.recurring = true;
        let reg = /^(\d+)(\s*)(.*)/;
        let m = s.match(reg);
        if (!m)
            return this;
        let num = Number(m[1]);
        let scope = Scope.hour;
        if (m[3].match(/\b(?:minutes|minute|m)\b/))
            scope = Scope.minute;
        else if (m[3].match(/\b(?:days|day|d)\b/))
            scope = Scope.day;
        let mom;
        if (!this.lastTime) {
            mom = moment();
        }
        else
            mom = moment(this.lastTime).add(num, scope);
        this.nextTime = mom.toDate();
        return this;
    }
}
class Scheduler {
    constructor() {
        this.query = new ActionQuery();
        this.query = new ActionQuery();
    }
    getRandomNum(max, min) {
        return Math.random() * (max - min) + min;
    }
    getNewId() {
        let i = 1;
        while (i in this.query.ids)
            i = this.getRandomNum(this.query.length, this.query.length * 10);
        return i;
    }
    createAction(params) {
        let act = new Action(this.getNewId(), params.priority);
        let w = new Dati();
        const now = new Date();
        const when = params.when.toDate();
        if (when < now) {
            if (!params.when.recurring)
                return null;
        }
        act.when = params.when;
        act.do = params.do_func;
        act.possible_checker = params.possible_checker;
        act.doAfter = () => { };
        this.query.add(act);
        return this.scheduleAction(act);
    }
    scheduleAction(act) {
        let when;
        try {
            when = act.when.toDate();
            if ((act.when.toDate() < (new Date())) && act.when.recurring) {
                this.runAction(act);
                when = new Date();
            }
            else {
                let buf = schedule.scheduleJob(when, () => { this.runAction(act); });
                if (buf == null) {
                    when = moment(when).add(15, 'seconds').toDate();
                    schedule.scheduleJob(when, () => { this.runAction(act); });
                }
            }
        }
        catch (e) {
            console.debug(`Scheduler exception ${e} :(`);
            return null;
        }
        console.debug(`Action scheduled to run on ${moment(when).format("D MMM YYYY HH:mm")}`);
        return act;
    }
    runAction(action) {
        try {
            if (action !== null)
                action.doIt();
            else
                return;
            console.debug(`Action has ran on ${moment(new Date()).format("D MMM YYYY HH:mm")}`);
            if (!action.when.recurring)
                this.query.remove(action);
            else {
                action.when.from(new Date());
                this.scheduleAction(action);
            }
        }
        catch (e) {
            console.debug(`Exception ${e} :(`);
        }
    }
}
global.Scheduler = Scheduler;
global.Dati = Dati;
