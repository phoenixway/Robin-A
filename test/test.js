'use strict';

var _chatEngines = require('../src/scripts/chat-engines.js');

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _RiveScript = require('RiveScript');

var _RiveScript2 = _interopRequireDefault(_RiveScript);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var assert = require('assert');

function isPendingToBabel(path) {
	return path.indexOf(/.babelyuvaty/) != -1;
}

describe('modules', function () {
	describe('es6 import after gulp browserify', function () {
		it('should return real object from imported module', function () {
			assert.notEqual(typeof _chatEngines.bla, "undefined");
			console.log(_chalk2.default.bold.yellow(`>> bla is ${typeof _chatEngines.bla}`));
		});
	});
});

function onDebug(message) {
	if (true) {
		console.debug(_chalk2.default.bold.red(message));
	}
}

function on_load_error(err) {
	console.log(`Robin> Loading error: ${err}`);
}

describe('other', function () {
	it('fs', function () {
		var fs = require('fs');
		console.log(`> fs is: ${Object.keys(fs)}`);
		assert.notEqual(fs.stat, undefined);
	});
});