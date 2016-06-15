'use strict';

define(['mathjs'], function(mathjs) {
    var exports = {};

    exports.isCorrect = function (sol, ans, options) {
        options = Object.assign({}, options);
        // Absolute error
        // if no units, same units as answer
        if(options.absoluteError != undefined && !isNaN(options.absoluteError)) {
            try {
                var errorUnit = mathjs.unit(options.absoluteError);
            } catch(e) {
                if(e.message.match(/no units/)) {
                    options.absoluteError = +options.absoluteError;
                } else {
                    options.absoluteError = null;
                }
            }
        }

        try {
            var solUnit = mathjs.unit(String(sol));
        } catch(e) {
            if(e.message.match(/no units/)) {
                sol = +sol;
                ans = +ans;
                if(isNaN(ans)) {
                    return {
                        correct: false,
                        reason: 'did not expect units in answer'
                    }
                } else {
                    return isCorrect(sol, ans, options);
                }
            } else {
                return {
                    correct: false,
                    reason: 'in solution: ' +  e.message
                }
            }
        }

        try {
            var ansUnit = mathjs.unit(String(ans));
            var solU = solUnit.formatUnits();
        } catch(e) {
            return {
                correct: false,
                reason: 'in answer: ' + e.message
            }
        }

        if(!solUnit.equalBase(ansUnit)) {
            return {
                correct: false,
                reason: 'answer has wrong units'
            }
        } else {
            sol = solUnit.toNumber(solU);
            ans = ansUnit.toNumber(solU);
            if(errorUnit) {
                options.absoluteError = errorUnit.toNumber(solU);
            }
            return isCorrect(sol, ans, options);
        }
    };

    return exports;
});

function isCorrect(sol, ans, options) {
    if(options.relativeError != undefined && !isNaN(options.relativeError)) {
        if(Math.abs(sol - ans) > options.relativeError * sol) {
            return {
                correct: false,
                reason: 'wrong answer (within relative error)'
            }
        } else {
            return {
                correct: true,
                reason: 'correct answer (within relative error)'
            }
        }
    } else if(options.absoluteError != undefined && !isNaN(options.absoluteError)) {
        var absoluteError = Math.abs(options.absoluteError);
        var err = sol -  ans;
        if(err > absoluteError || err < -absoluteError) {
            return {
                correct: false,
                reason: 'wrong answer (within absolute error)'
            };
        } else {
            return {
                correct: true,
                reason: 'correct answer (within absolute error)'
            };
        }
    }  else {
        if(ans !== sol) {
            return {
                correct: false,
                reason: 'wrong answer (not equal)'
            }
        } else {
            return {
                correct: true,
                reason: 'correct answer (is equal)'
            }
        }
    }
}