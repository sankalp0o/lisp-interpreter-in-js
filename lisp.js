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
	else return atomize(firstToken);
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
		for (var j=0; j<arguments.length; j++){
			sum+= arguments[j];
		} 
		return sum;
	},

	'*': function(){  
		var product = 1;
		for (var i=0; i<arguments.length; i++){
			product *= arguments[i];
		} 
		return product;
	},

	'-': function(a,b){
		return a-b;
	},

	'pi': Math.PI,

	'abs': Math.abs,

};

['<', '>', '/', '==', '<=', '>=', '!='].forEach(function(op) {
  globalEnv[op] = new Function("a, b", "return a " + op + " b;");
});


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
		var localEnv = Object.create(env);
		return function(){
			for (var i=0; i<arguments.length; i++){
				localEnv[args[i]] = arguments[i];
			}
			return eval(body, localEnv);
		}
	}

	else if (expr[0]==='set!'){                                // assignment
		var variableName = expr[1];
		if (env.hasOwnProperty(variableName)){
			var variableValue = eval(expr[2], env);
			env[variableName] = variableValue;
			return env[variableName];
		}
		else console.log(variableName, ' not found');
	}

	else if (expr[0]==='quote'){                              // quotation
		return expr[1];
	}

	else if (expr[0]==='if'){                                  //conditions
		var test = expr[1], conseq = expr[2], alt = expr[3];
		if (eval(test, env)) return eval(conseq, env);
		else return eval(alt,env);
	}

	else {                                                     // procedure calls
		var funcName = eval(expr[0], env);
		var args = [];
		for (var i=1; i<expr.length; i++){
			args.push(eval(expr[i], env));
		}
		if ((typeof funcName) !=='function') console.log(funcName+ ' is not a function. Calculating funcName in expression '+ expr);
		return funcName.apply(null, args);
	}

}


//--------------------------------------------------------------------------REPL---------------------------------------------------------------


function logEval(expr){
	return eval(parse(expr), globalEnv);
}

var repl = require('repl');

repl.start({prompt: '> ', eval: myEval});

function myEval(cmd, context, filename, callback) {
  callback(null,logEval(cmd.slice(0, cmd.length - 1)
));
}



