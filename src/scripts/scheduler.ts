// import * as moment from "moment";
// import * as schedule from "node-schedule";

const moment = require("moment"),
	  schedule = require("node-schedule");

class TGQuery{
	private tgTopic_: string;
	private tgLabel_: string;
	public add(tgTopic: string, tgLabel: string){

	}
	public remove(tgTopic: string, tgLabel: string){

	}
	public getItem(){
		return {
			tgTopic: this.tgTopic_,
			tgLabel: this.tgLabel_
 		}
	}
}

class Action{
	
	private whenString: string;

	when: Dati;

	public nextTime: Date;
	
	public doAfter: () => void;
	
	constructor ( public id: number = 0, public priority: number = 0) {
		this.id = id;
		this.priority = priority;
	}

	public do = function() {};
	
	public doIt = function():void {
		if(this.do !== null ) 
			this.do();
		this.doAfter();
	}

	public possible_checker: () => boolean;
	
	get isPossible(): boolean{
		if (this.possible_checker != null)
		return this.possible_checker();
	}
}

interface IActionParams{
	priority?: number, 
	when?: string, 
	possible_checker?: ()=>boolean,
	do_func?: ()=>void
}

interface IActionParamsA{
	priority?: number, 
	when?: Dati, 
	possible_checker?: ()=>boolean,
	do_func?: ()=>void
}

class ActionQuery{
	private actions: Action[];
	private current_position: number;
	
	public get ids(): Array<number> { return this.actions.map((act: Action): number => {return act.id})};
	
	public get length(): number{
		return this.actions.length;
	}
	
	constructor(){
		this.actions = new Array<Action>();
	}
	
	public item(index: number): Action{
		return this.actions[index];
	}
	
	public sort(): void {
		this.actions.sort(function(a, b){
			if (b.priority < a.priority)
				return 1;
			return -1;
				
		});
	}
	
	public clear(): void {
		this.actions.length = 0;
		this.current_position = -1;
	}
	
	
	public add(action: Action): void {
		this.actions.push(action);
		this.sort();
	}

	public remove(action: Action): void {
		let i = this.actions.indexOf(action);
		if (i !== -1 )
			this.actions.splice(i, 1);
		this.current_position--;
	}

	//в початок черги
	public start(): void{
		if (this.actions.length > 0)
			this.current_position = -1;
		else 
			this.current_position = -2;
	}

	//сама пріорітетна із можливих
	public next(): Action{
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
	
	public nextAction(): Action{
		this.actions.sort(function(a, b){
			if (b.when.nextTime < a.when.nextTime)
				return 1;
			return -1;
				
		});
		return this.item(0);
	}
	public nextActionA(): Action{
		this.actions.sort(function(a, b){
			if (b.when.toDate() < a.when.toDate() )
				return 1;
			return -1;
				
		});
		return this.item(0);
	}
	//чи є можливі зараз дії
	public get notEmpty(): boolean{
		
		return this.actions.length > 0 && (this.current_position + 1 < this.actions.length);
	}

}

enum Scope {
	none="none",
	hour="hours", 
	minute="minutes", 
	second="seconds", 
	day="days"
};

class Dati{
	recurring: boolean = false;
	lastTime: Date;
	nextTime: Date;
	stringParam: string;
	
	private at_: string = null;
	private every_: number = 0;
	private scope: Scope = Scope.none;
	private after_: number = 0;
	private finalDate: Date;
	private from_: any;
	
	constructor(){	
		this.lastTime = new Date();
	}
	
	recalc(){
		this.parse(this.stringParam);
	}

	getFormat(s: string): string{
		
		let format: string ="";
		if (s.match(/\d\d\:\d\d/g))
			format = "HH:mm";
		return format;
	}

	update(){
		//get mode
		
		if (this.at_ != null){
			this.recurring = false;
			let d;
			try {
				
				d = moment(this.at_, this.getFormat(this.at_));
				if (d.isValid())
					this.finalDate = d.toDate();
				else
					this.finalDate = null;
			}
			catch(e){
				console.debug(`Error in Dati.recalc() parsing this.at to Date: ${e}`)
			}
		}
		else if (this.every_ != 0 && this.scope != Scope.none){
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
		else if (this.after_ != 0 && this.scope != Scope.none){
			this.recurring = false;
			let mom = moment(new Date()).add(this.after_, this.scope);
			if (mom.isValid())
					this.finalDate = mom.toDate();
				else
					this.finalDate = null;
		}
	}



	toDate(): Date {
		// this.update();
		return this.finalDate;
	}

	after(n: number): Dati {
		this.from_ = null;
		this.after_ = n;
		this.scope = Scope.none;
		this.update();
		return this;
	}

	from(s: any): Dati {
		this.from_ = s;
		this.update();
		return this;
	}

	at(s: string): Dati {
		this.at_ = s;
		this.from_ = null
		this.every_ = 0;
		this.after_ = 0;
		this.scope = Scope.none;
		this.update();
		return this
	}

	each(n: number): Dati {
		this.at_ = null;
		this.every_ = n;
		this.after_ = 0;
		this.from_ = null;	
		this.scope = Scope.none;
		this.update();
		return this;
	}

	hours(): Dati{
		this.scope = Scope.hour;
		this.update();
		return this;
	}

	minutes(): Dati{
		this.scope = Scope.minute;
		this.update();
		return this;
	}
	seconds(): Dati{
		this.scope = Scope.second;
		this.update();
		return this;
	}

	days(): Dati{
		this.scope = Scope.day;
		this.update();
		return this;
	}

	parse(s: string): void{
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
	
	every(s: string ): Dati{
		this.recurring = true;
		let reg = /^(\d+)(\s*)(.*)/;
		let m = s.match(reg);
		if (!m)
			return this;
		let num: number = Number(m[1]);
		let scope: Scope = Scope.hour;
		if (m[3].match(/\b(?:minutes|minute|m)\b/))
			scope = Scope.minute;
		else if (m[3].match(/\b(?:days|day|d)\b/))
			scope = Scope.day;
		let mom: any;
		if(!this.lastTime) {
			mom = moment();
		} else 
			mom = moment(this.lastTime).add(num, scope);
		this.nextTime = mom.toDate();
		return this;
	}

}

class Scheduler {
	query: ActionQuery = new ActionQuery();
	
	constructor(){
		this.query = new ActionQuery();
	}
	
	private getRandomNum(max, min: number): number {
		return Math.random() * (max - min) + min;
	}
	
	private getNewId(): number {
		let i = 1;
		
		while (i in this.query.ids)
			i = this.getRandomNum(this.query.length, this.query.length*10);
		return i;
	}
	
	public createAction(params?: IActionParamsA): Action{
		
		let act = new Action(this.getNewId(), params.priority);
		let w = new Dati();
		const now = new Date();
		const when = params.when.toDate();
		if ( when < now ){
			if (!params.when.recurring)
				return null;}
		act.when = params.when;
		act.do=params.do_func;
		act.possible_checker = params.possible_checker;

		act.doAfter = () => {	} ;
		this.query.add(act);
		return this.scheduleAction(act);
	}

	private scheduleAction(act){
		
		let when: Date;		
		try{
			when = act.when.toDate();
			if ( (act.when.toDate() < (new Date())) && act.when.recurring) {
				this.runAction(act);
				when = new Date();
			} else {	
				let buf = schedule.scheduleJob(when, () => {this.runAction(act)});
				if (buf == null) {
					when = moment(when).add(15, 'seconds').toDate();
					schedule.scheduleJob(when, () => {this.runAction(act)});
				}
			}
		}
		catch(e){
			console.debug(`Scheduler exception ${e} :(`);
			return null;
		}
		console.debug(`Action scheduled to run on ${moment(when).format("D MMM YYYY HH:mm")}`);
		return act;
	}

	private runAction(action){
		
		try{

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
		catch(e){
			console.debug(`Exception ${e} :(`);
		}
	}

}

global.Scheduler = Scheduler;
global.Dati = Dati;