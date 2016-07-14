// Lisp interpreter in Javascript

//------------------------------------------------------------------------PARSER------------------------------------------------------------------------------


function parse(programString){
	return readFromTokens(tokenize(programString));
}


function tokenize(inputString){
	var inputWithBrackets = inputString.split('(').join('( ').split(')').join(' )'); //String.prototype.replace only replaces the first instance
	var arr = inputWithBrackets.split(' ');
	return arr;
}


function readFromTokens(tokenArr){
	if (tokenArr.length===0) return null;
	var firstToken = tokenArr.shift();
	if (firstToken==='(') {
		var arr = [];
		while (tokenArr[0]!==')') {
			arr.push(readFromTokens(tokenArr));
		}
		tokenArr.shift();
		return arr;
	}
	else return atomize(firstToken); //Have to write error messages for other cases
}


function atomize(token){
	if (isNaN(token)) return token;
	else return Number(token);
}


//------------------------------------------------------------------------ENVIROMENT-----------------------------------------------------------------------------


var globalEnv = {

	'write-line': function(line){
		console.log(line);
	},

	'begin': function(){
		return arguments[arguments.length-1];
	},

	'+': function(){  
		var sum = 0;
		for (j=0; j<arguments.length; j++){
			sum+= arguments[j];
		} 
		return sum;
	},

	'*': function(){  
		var product = 1;
		for (i=0; i<arguments.length; i++){
			product *= arguments[i];
		} 
		return product;
	},

	'-': function(a,b){
		return a-b;
	},

	'/': function(a,b){
		return a/b;
	},


	'pi': Math.PI,

	'abs': Math.abs,


};



//------------------------------------------------------------------------EVALUATION-------------------------------------------------------------------


function eval(expr, env){
	if (expr in env) {                                         // variable reference
		return env[expr];
	}

	else if (!isNaN(expr)) return expr;                        // constant literal

	else if (expr[0] === 'define') {                           // definition
		var variableName = expr[1];
		var variableValue = eval(expr[2], env);
		env[variableName] = variableValue;
		return env[variableName];
	}

	else if (expr[0]==='lambda'){                              // procedures
		var args = expr[1];
		var body = expr[2];
		var localEnv = Object.create(globalEnv);

		return function(){
			for (var i=0; i<arguments.length; i++){
				localEnv[args[i]] = arguments[i];
			}
			return eval(body, localEnv);
		}

	}

	else if (expr[0]==='if'){
		var test = expr[1], conseq = expr[2], alt = expr[3];
		if (eval(test, env)) return eval(conseq, env);
		else return eval(alt,env);
	}

	else {                                                     // procedure calls
		var funcName = eval(expr.shift(), env);
		var args = [];
		for (var i=0; i<expr.length; i++){
			args.push(eval(expr[i], env));
		}
		return funcName.apply(null, args);
	}

}


//-----------------------------------------------------------------------REPL-----------------


function logEval(expr){
	//console.log(eval(parse(expr), globalEnv));
	return eval(parse(expr), globalEnv);
}


var repl = require('repl');

repl.start({prompt: '> ', eval: myEval});

function myEval(cmd, context, filename, callback) {
  callback(null,logEval(cmd.slice(0, cmd.length - 1)
));
}


//------------------------------------------------------------------------TEST-CASES--------------------------------------------------------------------------

//console.log(parse('(begin (define r 10) (* pi (* r r)))'))
//console.log(eval(parse('(+ 10 20 13)'), globalEnv));
//eval(parse('(write-line (* 12 12))'), globalEnv);
//logEval("(begin (define r 10) (* 3 (* r r)))");
//console.log(eval(parse("(begin (define r 10) r)"), globalEnv));
//console.log(eval(parse("(begin (+ 2 3 6 9 90) (+ 4 5 7 9) (+ 23 34))"), globalEnv));

/*logEval('((lambda (x y) (+ x y)) 4 5)');

logEval('(define summation (lambda (x y) (+ x y)))');
logEval('(summation 5 7)');

logEval('(define circle-area (lambda (r) (* 3 (* r r))))');
logEval('(circle-area 10)');

logEval('(+ 12 23)');

*/
// console.log(tokenize('(+ 10 20)'));

