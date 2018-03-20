// import * as moment from "moment";
// import * as schedule from "node-schedule";
var moment = require("moment"), schedule = require("node-schedule");
var TGQuery = /** @class */ (function () {
    function TGQuery() {
    }
    TGQuery.prototype.add = function (tgTopic, tgLabel) {
    };
    TGQuery.prototype.remove = function (tgTopic, tgLabel) {
    };
    TGQuery.prototype.getItem = function () {
        return {
            tgTopic: this.tgTopic_,
            tgLabel: this.tgLabel_
        };
    };
    return TGQuery;
}());
var Action = /** @class */ (function () {
    function Action(id, priority) {
        if (id === void 0) { id = 0; }
        if (priority === void 0) { priority = 0; }
        this.id = id;
        this.priority = priority;
        this["do"] = function () { };
        this.doIt = function () {
            if (this["do"] !== null)
                this["do"]();
            this.doAfter();
        };
        this.id = id;
        this.priority = priority;
    }
    Object.defineProperty(Action.prototype, "isPossible", {
        get: function () {
            if (this.possible_checker != null)
                return this.possible_checker();
        },
        enumerable: true,
        configurable: true
    });
    return Action;
}());
var ActionQuery = /** @class */ (function () {
    function ActionQuery() {
        this.actions = new Array();
    }
    Object.defineProperty(ActionQuery.prototype, "ids", {
        get: function () { return this.actions.map(function (act) { return act.id; }); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ActionQuery.prototype, "length", {
        get: function () {
            return this.actions.length;
        },
        enumerable: true,
        configurable: true
    });
    ActionQuery.prototype.item = function (index) {
        return this.actions[index];
    };
    ActionQuery.prototype.sort = function () {
        this.actions.sort(function (a, b) {
            if (b.priority < a.priority)
                return 1;
            return -1;
        });
    };
    ActionQuery.prototype.clear = function () {
        this.actions.length = 0;
        this.current_position = -1;
    };
    ActionQuery.prototype.add = function (action) {
        this.actions.push(action);
        this.sort();
    };
    ActionQuery.prototype.remove = function (action) {
        var i = this.actions.indexOf(action);
        if (i !== -1)
            this.actions.splice(i, 1);
        this.current_position--;
    };
    //в початок черги
    ActionQuery.prototype.start = function () {
        if (this.actions.length > 0)
            this.current_position = -1;
        else
            this.current_position = -2;
    };
    //сама пріорітетна із можливих
    ActionQuery.prototype.next = function () {
        ;
        this.current_position++;
        if (this.current_position >= this.actions.length)
            return null;
        if (this.actions[this.current_position].isPossible)
            return this.actions[this.current_position];
        else
            return this.next();
    };
    //найближча наступна доступна дія
    ActionQuery.prototype.nextAction = function () {
        this.actions.sort(function (a, b) {
            if (b.when.nextTime < a.when.nextTime)
                return 1;
            return -1;
        });
        return this.item(0);
    };
    ActionQuery.prototype.nextActionA = function () {
        this.actions.sort(function (a, b) {
            if (b.when.toDate() < a.when.toDate())
                return 1;
            return -1;
        });
        return this.item(0);
    };
    Object.defineProperty(ActionQuery.prototype, "notEmpty", {
        //чи є можливі зараз дії
        get: function () {
            return this.actions.length > 0 && (this.current_position + 1 < this.actions.length);
        },
        enumerable: true,
        configurable: true
    });
    return ActionQuery;
}());
var Scope;
(function (Scope) {
    Scope["none"] = "none";
    Scope["hour"] = "hours";
    Scope["minute"] = "minutes";
    Scope["second"] = "seconds";
    Scope["day"] = "days";
})(Scope || (Scope = {}));
;
var Dati = /** @class */ (function () {
    function Dati() {
        this.recurring = false;
        this.at_ = null;
        this.every_ = 0;
        this.scope = Scope.none;
        this.after_ = 0;
        this.lastTime = new Date();
    }
    Dati.prototype.recalc = function () {
        this.parse(this.stringParam);
    };
    Dati.prototype.getFormat = function (s) {
        var format = "";
        if (s.match(/\d\d\:\d\d/g))
            format = "HH:mm";
        return format;
    };
    Dati.prototype.update = function () {
        //get mode
        if (this.at_ != null) {
            this.recurring = false;
            var d = void 0;
            try {
                d = moment(this.at_, this.getFormat(this.at_));
                if (d.isValid())
                    this.finalDate = d.toDate();
                else
                    this.finalDate = null;
            }
            catch (e) {
                console.debug("Error in Dati.recalc() parsing this.at to Date: " + e);
            }
        }
        else if (this.every_ != 0 && this.scope != Scope.none) {
            this.recurring = true;
            var mom = void 0;
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
            var mom = moment(new Date()).add(this.after_, this.scope);
            if (mom.isValid())
                this.finalDate = mom.toDate();
            else
                this.finalDate = null;
        }
    };
    Dati.prototype.toDate = function () {
        // this.update();
        return this.finalDate;
    };
    Dati.prototype.after = function (n) {
        this.from_ = null;
        this.after_ = n;
        this.scope = Scope.none;
        this.update();
        return this;
    };
    Dati.prototype.from = function (s) {
        this.from_ = s;
        this.update();
        return this;
    };
    Dati.prototype.at = function (s) {
        this.at_ = s;
        this.from_ = null;
        this.every_ = 0;
        this.after_ = 0;
        this.scope = Scope.none;
        this.update();
        return this;
    };
    Dati.prototype.each = function (n) {
        this.at_ = null;
        this.every_ = n;
        this.after_ = 0;
        this.from_ = null;
        this.scope = Scope.none;
        this.update();
        return this;
    };
    Dati.prototype.hours = function () {
        this.scope = Scope.hour;
        this.update();
        return this;
    };
    Dati.prototype.minutes = function () {
        this.scope = Scope.minute;
        this.update();
        return this;
    };
    Dati.prototype.seconds = function () {
        this.scope = Scope.second;
        this.update();
        return this;
    };
    Dati.prototype.days = function () {
        this.scope = Scope.day;
        this.update();
        return this;
    };
    Dati.prototype.parse = function (s) {
        //		
        var reg = /^(once|every)(\s*)(.*)/;
        var m = s.match(reg);
        if (!m)
            return;
        this.stringParam = s;
        if (m[1] == "once") {
        }
        else {
            this.every(m[3]);
        }
    };
    Dati.prototype.every = function (s) {
        this.recurring = true;
        var reg = /^(\d+)(\s*)(.*)/;
        var m = s.match(reg);
        if (!m)
            return this;
        var num = Number(m[1]);
        var scope = Scope.hour;
        if (m[3].match(/\b(?:minutes|minute|m)\b/))
            scope = Scope.minute;
        else if (m[3].match(/\b(?:days|day|d)\b/))
            scope = Scope.day;
        var mom;
        if (!this.lastTime) {
            mom = moment();
        }
        else
            mom = moment(this.lastTime).add(num, scope);
        this.nextTime = mom.toDate();
        return this;
    };
    return Dati;
}());
var Scheduler = /** @class */ (function () {
    function Scheduler() {
        this.query = new ActionQuery();
        this.query = new ActionQuery();
    }
    Scheduler.prototype.getRandomNum = function (max, min) {
        return Math.random() * (max - min) + min;
    };
    Scheduler.prototype.getNewId = function () {
        var i = 1;
        while (i in this.query.ids)
            i = this.getRandomNum(this.query.length, this.query.length * 10);
        return i;
    };
    Scheduler.prototype.createAction = function (params) {
        var act = new Action(this.getNewId(), params.priority);
        var w = new Dati();
        var now = new Date();
        var when = params.when.toDate();
        if (when < now) {
            if (!params.when.recurring)
                return null;
        }
        act.when = params.when;
        act["do"] = params.do_func;
        act.possible_checker = params.possible_checker;
        act.doAfter = function () { };
        this.query.add(act);
        return this.scheduleAction(act);
    };
    Scheduler.prototype.scheduleAction = function (act) {
        var _this = this;
        var when;
        try {
            when = act.when.toDate();
            if ((act.when.toDate() < (new Date())) && act.when.recurring) {
                this.runAction(act);
                when = new Date();
            }
            else {
                var buf = schedule.scheduleJob(when, function () { _this.runAction(act); });
                if (buf == null) {
                    when = moment(when).add(15, 'seconds').toDate();
                    schedule.scheduleJob(when, function () { _this.runAction(act); });
                }
            }
        }
        catch (e) {
            console.debug("Scheduler exception " + e + " :(");
            return null;
        }
        console.debug("Action scheduled to run on " + moment(when).format("D MMM YYYY HH:mm"));
        return act;
    };
    Scheduler.prototype.runAction = function (action) {
        try {
            if (action !== null)
                action.doIt();
            else
                return;
            console.debug("Action has ran on " + moment(new Date()).format("D MMM YYYY HH:mm"));
            if (!action.when.recurring)
                this.query.remove(action);
            else {
                action.when.from(new Date());
                this.scheduleAction(action);
            }
        }
        catch (e) {
            console.debug("Exception " + e + " :(");
        }
    };
    return Scheduler;
}());
global.Scheduler = Scheduler;
global.Dati = Dati;
