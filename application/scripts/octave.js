// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("libs/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["libs/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("octave", function() {
	
  var isNextLineString = false;
	
  function wordRegexp(words) {
    return new RegExp("^((" + words.join(")|(") + "))\\b");
  }

  var singleOperators = new RegExp("^[\\+\\-\\*/&|\\^~<>!@'\\\\]");
  var singleDelimiters = new RegExp('^[\\(\\[\\{\\},=;]');
  var doubleOperators = new RegExp("^((==)|(~=)|(<=)|(>=)|(<<)|(>>)|(\\.[\\+\\-\\*/\\^\\\\]))");
  var doubleDelimiters = new RegExp("^((:\\-)|(!=)|(\\\\\\+)|(\\-=)|(\\*=)|(/=)|(&=)|(\\|=)|(\\^=))");
  var tripleDelimiters = new RegExp("^((>>=)|(<<=))");
  var expressionEnd = new RegExp("^[\\]\\)]");
  var identifiers = new RegExp("^([_A-Za-z][_A-Za-z0-9]*)");
  var vars = new RegExp("^\\([A-Za-z][^\\)]*\\)\\.");


  var builtins = wordRegexp([
    'write', 'run'
  ]);

  var keywords = wordRegexp([
    'true', 'false', "fail", "!"
  ]);


  // tokenizers
  function tokenTranspose(stream, state) {
    if (!stream.sol() && stream.peek() === '\'') {
      stream.next();
      state.tokenize = tokenBase;
      return 'operator';
    }
    state.tokenize = tokenBase;
    return tokenBase(stream, state);
  }


  function tokenComment(stream, state) {
    if (stream.match(/^.*%}/)) {
      state.tokenize = tokenBase;
      return 'comment';
    };
    stream.skipToEnd();
    return 'comment';
  }

  function tokenQuasi(stream, state) {
    var escaped = false, next;
    while ((next = stream.next()) != null) {
      if (!escaped && (next == "`" || next == "$" && stream.eat("{"))) {
        state.tokenize = tokenBase;
        break;
      }
      escaped = !escaped && next == "\\";
    }
    return ret("quasi", "string-2", stream.current());
  }

  function tokenBase(stream, state) {
    // whitespaces
    if (stream.eatSpace()) return null;

    if (stream.match(/^[%]/)){
      stream.skipToEnd();
      return 'comment';
    }

    // Handle Number Literals
    if (stream.match(/^[0-9\.+-]/, false)) {
      if (stream.match(/^[+-]?0x[0-9a-fA-F]+[ij]?/)) {
        stream.tokenize = tokenBase;
        return 'number'; };
      if (stream.match(/^[+-]?\d*\.\d+([EeDd][+-]?\d+)?[ij]?/)) { return 'number'; };
      if (stream.match(/^[+-]?\d+([EeDd][+-]?\d+)?[ij]?/)) { return 'number'; };
    }
    if (stream.match(wordRegexp(['nan','NaN','inf','Inf']))) { return 'number'; };
	  
	  
//	//hadle multiline strings
//	
//	if (isNextLineString){
//		debugger
//		let s = stream.string;
//	}
//	
//	var m = stream.match(/(`)(?:[^`]|``)*($)/);
//	if (m){
//		debugger
//		isNextLineString = true;
//		stream.skipToEnd();
//		stream.lineOracle.nextLine();
//		state.tokenize = tokenBase;
//    	return "string";
//	}
    // Handle Strings
    var m = stream.match(/^"(?:[^"]|"")*("|$)/) || stream.match(/^'(?:[^']|'')*('|$)/) || stream.match(/^`(?:[^`]|``)*(`|$)/)
    //' responsibility. 
    if (m) { return m[1] ? 'string' : "string error"; }

    // Handle words
    if (stream.match(keywords)) { return 'keyword'; } ;
    if (stream.match(builtins)) { return 'builtin'; } ;
    
    if (stream.match(identifiers)) { return 'variable'; } ;
    //if (stream.match(vars)) { return 'number'; } ;

    if (stream.match(singleOperators) || stream.match(doubleOperators)) { return 'operator'; };
    if (stream.match(singleDelimiters) || stream.match(doubleDelimiters) || stream.match(tripleDelimiters)) { return null; };

    if (stream.match(expressionEnd)) {
      state.tokenize = tokenTranspose;
      return null;
    };


    // Handle non-detected items
    stream.next();
    return 'error';
  };


  return {
	
    startState: function() {
      return {
		inString: false,
        tokenize: tokenBase
      };
    },

    token: function(stream, state) {
		//string start here
		if (!state.inString && stream.peek()== "`"){
			stream.next();
			state.inString = true;
				
		}
		if(state.inString){
			if(stream.skipTo("`")){
				stream.next();
				state.inString = false;
			}
			else {
				stream.skipToEnd();
			}
			return "string";
			
		}
      var style = state.tokenize(stream, state);
      if (style === 'number' || style === 'variable'){
        state.tokenize = tokenTranspose;
      }
      return style;
    },

    lineComment: '%',

    fold: 'indent'
  };
});

CodeMirror.defineMIME("text/x-octave", "octave");

});
