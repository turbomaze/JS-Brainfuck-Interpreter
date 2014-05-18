/******************\
|     Brainfuck    |
|    Interpreter   |
| @author Anthony  |
| @version 0.1     |
| @date 2014/03/20 |
| @edit 2014/05/17 |
\******************/

/**********
 * config */

/*************
 * constants */
var PRG_SEL = '#program';
var INP_SEL_PREFIX = '#byte';
var RUN_BTN_SEL = '#run-btn';
var OUTPUT_SEL = '#output';

/*********************
 * working variables */
var numInputs;

/******************
 * work functions */
function initBFInterpreter() {
	numInputs = document.getElementsByClassName('byte').length;
	
	$s(RUN_BTN_SEL).addEventListener('click', function() {
		function inputIsValid(a) {
			var intA = parseInt(a);
			return parseFloat(a) === intA && intA >= 0 && intA < 256;
		}
		
		var program = $s(PRG_SEL).value.replace(/\u2212/g, '-'); //weird M-dash?
		var inputs = [];
		for (var ai = 1; ai <= numInputs; ai++) {
			var val = $s(INP_SEL_PREFIX+ai).value;
			if (inputIsValid(val)) {
				inputs.push(parseInt(val));
			} else {
				break; //only consecutive bytes are included
			}
		}
		var output = runProgram(program, inputs);
		$s(OUTPUT_SEL).innerHTML = output;
	});
}

//program is a String, inputs is an array of integers in [0, 256)
function runProgram(program, inputs) {
    var maxRunTime = 1000; //in ms
	var tapeLen = 64; //# cells on the tape
	var checkEvery = 200; //checks the time every this many iterations to ensure it isn't taking too long
	var instructions = program.replace(/ /g, '').split(''); //essentially String.toCharArray()
	var ret = 0;

	///////////////////////////////
	//interpreter state variables//
	var tape = [];
	for (var ai = 0; ai < tapeLen; ai++) tape.push(0);
	var ins_ptr = 0;
	var dat_ptr = 0;
	var inp_ptr = 0;

	///////////////
	//interpreter//
	var s = +new Date();
    var prgmHistory = {}; //all the states that have been reached
	while (+new Date() - s < maxRunTime) { //timeout
		for (var ai = 0; ai < checkEvery; ai++) {
            var state = tape+' '+ins_ptr+' '+dat_ptr+' '+inp_ptr;
            if (prgmHistory.hasOwnProperty(state)) return 'Infinite loop';
            else prgmHistory[state] = true;

			if (ins_ptr >= instructions.length) {
                return ret; //finished reading all instructions
			}

			switch (instructions[ins_ptr]) {
				case '>': ins_ptr += 1;
					dat_ptr = (dat_ptr+1)%tapeLen; //loops around
					break;
				case '<': ins_ptr += 1;
					dat_ptr = dat_ptr-1 < 0 ? tapeLen-1 : dat_ptr-1; //loops around
					break;
				case '+': ins_ptr += 1;
					tape[dat_ptr] = (tape[dat_ptr]+1)%256; //wrap around
					break;
				case '-': ins_ptr += 1;
                    console.log
					tape[dat_ptr] = tape[dat_ptr]-1 < 0 ? 255 : tape[dat_ptr]-1; //wrap around
					break;
				case '.': ins_ptr += 1;
					ret += tape[dat_ptr];
					break;
				case ',': ins_ptr += 1;
					if (inp_ptr < inputs.length) {
						tape[dat_ptr] = inputs[inp_ptr];
						inp_ptr += 1;
					} else {
						tape[dat_ptr] = 0; //clear it if there aren't any inputs to grab from
					}
					break;
				case '[':
					if (tape[dat_ptr] > 0) {
						ins_ptr += 1;
					} else {
						var rel_indent = 0;
						while (true) {
							ins_ptr += 1;
							if (ins_ptr >= instructions.length) return ''; //no match
							
							if (instructions[ins_ptr] == '[') {
								rel_indent += 1;
							} else if (instructions[ins_ptr] == ']' && rel_indent != 0) {
								rel_indent -= 1;
							} else if (instructions[ins_ptr] == ']' && rel_indent == 0) {
								ins_ptr += 1; //found match, go to next command and move on
								break;
							}
						}
					}
					break;
				case ']':
					if (tape[dat_ptr] > 0) {
						var rel_indent = 0;
						while (true) {
							ins_ptr -= 1;
							if (ins_ptr < 0) return ''; //no match
							
							if (instructions[ins_ptr] == ']') {
								rel_indent += 1;
							} else if (instructions[ins_ptr] == '[' && rel_indent != 0) {
								rel_indent -= 1;
							} else if (instructions[ins_ptr] == '[' && rel_indent == 0) {
								ins_ptr += 1; //found match, go to next command and move on
								break;
							}
						}
					} else {
						ins_ptr += 1;
					}
					break;
			}
		}
	}

	return 'Took too long.'; //only goes here if it times out
}

/********************
 * helper functions */
function $s(sel) {
	if (sel.charAt(0) === '#') return document.getElementById(sel.substring(1));
	else return false;
}

window.addEventListener('load', function() {
	initBFInterpreter();
});