'use strict'

var fs
if (typeof window != 'undefined'){
	 if (window && window.process && window.process.type) {
		fs = window.require('fs')
	 }
}
 else {
 	fs = require('fs')
}

//var fs = require('fs')

module.exports = clone(fs)

function clone (obj) {
  if (obj === null || typeof obj !== 'object')
    return obj

  if (obj instanceof Object)
    var copy = { __proto__: obj.__proto__ }
  else
    var copy = Object.create(null)

  Object.getOwnPropertyNames(obj).forEach(function (key) {
    Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key))
  })

  return copy
}
