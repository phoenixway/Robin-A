import {bla} from "../src/scripts/chat-engines.js"
import chalk from 'chalk';
import RiveScript from 'RiveScript'

var assert = require('assert');

function isPendingToBabel(path){ 
	return path.indexOf(/.babelyuvaty/) != -1 
}

describe('modules', function() {
  describe('es6 import after gulp browserify', function() {
    it('should return real object from imported module', function() {
      assert.notEqual(typeof bla, "undefined");
      console.log(chalk.bold.yellow(`>> bla is ${typeof bla}`)) 
    });
  });
});  

function onDebug(message) {
		if (true) {
				console.debug(chalk.bold.red(message));
			}
		}

	function on_load_error (err) {
		console.log(`Robin> Loading error: ${err}`);
	}

describe('other', function(){
	it('fs', function(){
        var fs = require('fs')
        console.log(`> fs is: ${Object.keys(fs)}`);
		assert.notEqual(fs.stat, undefined)
	})
})