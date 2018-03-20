console.debug(`Control script started!`);


scheduler.createAction({
  priority: 9,
  when: "every 1 hour",
  possible_checker: 
  () => {
    return !Robin.ai.query(Robin.ui.script.text, "productive_day(roma).", Robin.ui.states)},
  do_func:
  () => {
    
    Robin.ai.query(Robin.ui.script.text, "control(productive_day(roma)).", Robin.ui.states)}
});



scheduler.run();