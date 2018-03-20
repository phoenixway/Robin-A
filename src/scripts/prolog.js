'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.prologEngine = undefined;

var _tauProlog = require('./libs/tau-prolog.js');

var _tauProlog2 = _interopRequireDefault(_tauProlog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const prologEngine = exports.prologEngine = function () {
    var queryAI_ = function (scriptText, queryText, statesText) {
        var state = false;
        scriptText = statesText + '\n' + scriptText;

        console.debug("# Performing the query \'" + queryText + "\'..");
        var pl = window.pl;
        var session = pl.create();
        var consulted = session.consult(scriptText);
        if (!consulted) {
            console.debug(">> Wrong script");
            return false;
        }
        var queried = session.query(queryText);
        if (!queried) {
            console.debug(">> Wrong query");
            return false;
        }
        var arr = [];

        var callback = function (answer) {
            if (answer.id === "throw") {
                console.debug(">> Exception!");
                return false;
            }
            if (answer !== false) {
                console.debug(`>> Answer for '${queryText}': true`);
            } else {
                console.debug(">> Answer: false");
                return false;
            }
            var i = 0;
            for (var link in answer.links) {
                i++;
                arr.push(answer.links[link].toString());
            }
            if (answer !== false) {
                state = true;
                console.debug("# Finding another answer..");
                session.answer(callback);
            }
            if (arr.length > 0) {
                console.debug(">> Answers: " + arr.toString());
                return true;
            }
        };
        session.answer(callback);
        return state;
    };
    return {
        query: function (scriptText, queryText, statesText) {
            return queryAI_(scriptText, queryText, statesText);
        }
    };
}();