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

	'begin': function(args){
		var temp;
		for (i=0; i<args.length; i++){
			temp = eval(args[i], env);
		}
		return temp;
	},

	'+': function(a,b){
		return a+b;
	}

};



//------------------------------------------------------------------------EVALUATION-------------------------------------------------------------------


function eval(expr, env){

	if (env.hasOwnProperty(expr)) return env.expr;             // variable reference

	else if (!isNaN(expr)) return expr;                        // constant literal

	else if (expr[0] === 'define') {                           // definition
		var variableName = expr[1];
		var variableValue = eval(expr[2], env);
		env[variableName] = variableValue;
		return env[variableName];
	}

	else {                                                     // procedure calls
		var funcName = env[expr[0]];
		var args = [];
		for (i=1; i<expr.length; i++){
			args.push(expr[i]);
		}
		return funcName.apply(null, args);
	}

}


//------------------------------------------------------------------------TEST-CASES--------------------------------------------------------------------------

//console.log(parse('(begin (define r 10) (* pi (* r r)))'))
console.log(eval(parse('(+ 10 10)'), globalEnv));
eval(parse('(write-line hello)'), globalEnv);


