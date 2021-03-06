// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("output", function() {
  function wordRegexp(words) {
    return new RegExp("^((" + words.join(")|(") + "))\\b");
  }

  var singleOperators = new RegExp("^[\\+\\-\\*/&|\\^~!@'\\\\]");
  var singleDelimiters = new RegExp('^[\\(\\[\\{\\},=;]');
  var doubleOperators = new RegExp("^((==)|(~=)|(<=)|(>=)|(<<)|(>>)|(\\.[\\+\\-\\*/\\^\\\\]))");
  var doubleDelimiters = new RegExp("^((:\\-)|(!=)|(\\\\\\+)|(\\-=)|(\\*=)|(/=)|(&=)|(\\|=)|(\\^=))");
  var tripleDelimiters = new RegExp("^((>>=)|(<<=))");
  var expressionEnd = new RegExp("^[\\]\\)]");
  var identifiers = new RegExp("^#.*");
  var vars = new RegExp("^\\([A-Za-z][^\\)]*\\)\\.");


  var builtins = wordRegexp([
    'write', 'run', `notify`
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

  function tokenBase(stream, state) {
    // whitespaces
    if (stream.eatSpace()) return null;

    if (stream.match(/^[%]/)){
      stream.skipToEnd();
      return 'comment';
    }if (stream.match(/\[.*\]/)){
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
//	if (stream.match(/\[.*\]/)) { return 'number'; };  
    if (stream.match(/^>>.*/)) { return 'number'; };
    if (stream.match(/::\s.*/)) { return 'number'; };

    //if (stream.match(keywords) { return 'keyword'; } ;
    if (stream.match(builtins)) { return 'builtin'; } ;
    
    
    if (stream.match(identifiers)) { return 'variable'; } ;
    //if (stream.match(vars)) { return 'number'; } ;
  

    if (stream.match(singleOperators) || stream.match(doubleOperators)) { return 'operator'; };
    if (stream.match(singleDelimiters) || stream.match(doubleDelimiters) || stream.match(tripleDelimiters)) { return null; };

    if (stream.match(expressionEnd)) {
      state.tokenize = tokenTranspose;
      return null;
    };
    //if (stream.match(/<script>[\s\S]*?<\/script>/gmi)) { return 'string'; } ;
    // Handle non-detected items
    stream.next();
    return 'error';
  };


  return {
    startState: function() {
      return {
        tokenize: tokenBase
      };
    },

    token: function(stream, state) {
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

CodeMirror.defineMIME("text/x-output", "output");

});
