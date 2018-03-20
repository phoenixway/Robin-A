'use strict';
 const path = require('path');
 var os, makeDir, writeFileAtomic, fs, dotProp, uniqueString
 if (typeof window != 'undefined'){
 if (window && window.process && window.process.type) {
 	os = window.require('os') 
 	fs = window.require('fs');
	makeDir = window.require('make-dir');
	writeFileAtomic = window.require('write-file-atomic');
	dotProp = window.require('dot-prop');
	uniqueString = window.require('unique-string');
 }}
 else {
 	os = require('os') 
 	fs = require('fs');
	makeDir = require('make-dir');
	writeFileAtomic = require('write-file-atomic');
	dotProp = require('dot-prop');
 }

const permissionError = 'You don\'t have access to this file.';
const makeDirOptions = {mode: 0o0700};
const writeFileOptions = {mode: 0o0600};
const RiveScriptSettingsFile = "rivescript.json"

class StateStore {
	constructor(name, defaults, opts) {
		let basedir = os.homedir()
		let fileName = `${name}.settings`
		this.fullName = path.join(basedir, fileName).replace(/\\/g, '/')
   	    this.all = Object.assign({}, defaults, this.all);
		if (!this.get('basedir'))
			this.set('basedir', os.homedir())
		if (!this.get('showDebugInOutput'))
			this.set('showDebugInOutput', true)
		if (!this.get('systemNotifications'))
			this.set('systemNotifications', false)
		if (!this.get('rivescript_settings')){
			let fullName = path.join(this.get('basedir'), RiveScriptSettingsFile).replace(/\\/g, '/')
			this.set('rivescript_settings', fullName)
		}
	}
	get all() {
		try {
			return JSON.parse(fs.readFileSync(this.fullName, 'utf8'));
		} catch (err) {
			// Create dir if it doesn't exist
			if (err.code === 'ENOENT') {
				makeDir.sync(path.dirname(this.fullName), makeDirOptions);
				return {};
			}

			// Improve the message of permission errors
			if (err.code === 'EACCES') {
				err.message = `${err.message}\n${permissionError}\n`;
			}

			// Empty the file if it encounters invalid JSON
			if (err.name === 'SyntaxError') {
				writeFileAtomic.sync(this.fullName, '', writeFileOptions);
				return {};
			}

			throw err;
		}
	}
	set all(val) {
		try {
			// Make sure the folder exists as it could have been deleted in the meantime
			makeDir.sync(path.dirname(this.fullName), makeDirOptions);

			writeFileAtomic.sync(this.fullName, JSON.stringify(val, null, '\t'), writeFileOptions);
		} catch (err) {
			// Improve the message of permission errors
			if (err.code === 'EACCES') {
				err.message = `${err.message}\n${permissionError}\n`;
			}

			throw err;
		}
	}
	get size() {
		return Object.keys(this.all || {}).length;
	}
	get(key) {
		return dotProp.get(this.all, key);
	}
	set(key, val) {
		const config = this.all;

		if (arguments.length === 1) {
			for (const k of Object.keys(key)) {
				dotProp.set(config, k, key[k]);
			}
		} else {
			dotProp.set(config, key, val);
		}

		this.all = config;
	}
	has(key) {
		return dotProp.has(this.all, key);
	}
	delete(key) {
		const config = this.all;
		dotProp.delete(config, key);
		this.all = config;
	}
	clear() {
		this.all = {};
	}
}

module.exports = StateStore;
