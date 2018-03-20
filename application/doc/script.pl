:- use_module(library(lists)).
%=============
%    facts   =
%=============
%% fakes
day_planned(fake).
day_plan_good(fake).
day_plan_done(fake).
week_planned(fake).
productive_day(fake).
%% real facts


%=============
%    rules   =
%=============

%=============
%   helpers  =
%=============

help(productive_day(X)) :- productive_day(X).
help(productive_day(X)) :- 
	\+ productive_day(X), 
    write(`>> Day is an only point, when we can live, rise, doing important things and fight. Please, make your day really productive! It's an only to live a good life (!!)`), 
    control(X, [day_planned, week_planned, day_plan_good, day_plan_done]).
    
help(week_planned(X)) :- 
	not(week_planned(X)),
    write(`>> In order to concentrate on not only relatively local things, you have to think and plan bigger. Plan your week, please!`).


help(day_planned(X)) :- 
	not(day_planned(X)),
	write(`>> Day planning is the first and absolutely necessary condition of a productive and fullfilling day! Plan your day, please!`).
    
help(day_plan_good(X)) :- 
	not(day_plan_good(X)),
	write(`>> Is you plan really good? Can't you improve it for a bit?`).

help(day_plan_done(X)) :- 
	not(day_plan_done(X)),
	write(`>> Plan is worth nothing without realization!`).

%% just another tips
advice_another_tips(X) :- 
    write("Advices :: It's super-important to do at each single moment the most important thing for it. Are there some more important things to do then you're doing now? Don't you lose in greater values doing now what you're engaged in? Are you doing the most important for now?"),
    write(" :: Health discipline."),
    write(" :: Always do most important thing with a best way possible."),
    
    write(` :: Self-control.\n
 :: Responsibility.  \n
 :: Manage and control own life. \n
 :: Have a life program - Life Course. \n
 :: Answer inportant events. \n
 :: Use time available. \n
 :: Live and act consciously. Don't abandon, ignore a reality, don't run away from it. \n
 :: Right decisions every single moment. Are you doing it now? Have you already do it for this moment? Best decisions, best choices each single moment and their perfect realization\n
 :: What is the best to do next few days? What are the main, best, most important and actual goals for that time? What is most important now? What are the best tactics, strategies and plays now? \n
`).

%=============
%  technical =
%=============

not(X) :- X, !, fail; true.
call_failed(X, Y) :- call(X,Y), !, fail; true.

%======================
%  control conditions =
%======================

control(Y, L) :- member(X, L), call_failed(X,Y), call(help, X,Y).

%=============
%  main goal =
%=============
    

assist(Y) :- 
	run(`ui.clearOutput(); document.outputEditor.setOption('fullScreen', true);document.outputEditor.focus(); console.debug("Performing the query 'assist(roma)'..");`), 
    write(`>> Hi! I'll try to consult you about living a better life. Please, treat said carefully! Remember, you are responsible for own life before youself. You are responsible for realization of own VALUES before themself and youself!.`)
    %, advice_another_tips(Y)
    , call(control(Y, [productive_day]))
    %, run("document.outputEditor.setCursor(0, 0);")
    .
