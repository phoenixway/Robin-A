# Robin A
AI engine in Javascript and Prolog 
## About

This application is a result of my wish to play with (and learn) interesting AI ideas.
It can run both javascript and prolog scripts just in a browser. Scripts can refer to each other's functions. And, what is more, scripts are executed at time, specified by user. 

Application consists of
* Scheduler, running javascript code and prolog queries considering their priorities and recurrence rules. 
* Prolog engine, which is able to answer queries based on user rules and facts. Also it can run inline javascript code. 
* Javascript custom control script, which describes what you want to do with other components. 

Each of them includes pretty good amount of work that can be useful mainly for another developers.
In general I try to write a good code regardless of its purpose and app's one is documented. So feel free to use it as you wish. 

## Copyright and license
Copyright. 2018 Roman Pylypchuk. All Righs Reserved.
## Depencies and deployment 
Project needs next libraries (in form *. js), accessible locally in project folder or from web:
* moment.js 
* node-schedule 
* tau-prolog (adapted by me) 
* codemirror
* jquery notify

All code, except scheduler, is written in javascript (I prefer ES5/ES6). Scheduler is in typescript. In work on project I used browserify/watchify for managing with requirements. Gulp is used for building. 