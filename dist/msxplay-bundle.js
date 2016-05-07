/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(30);



/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["MSXPlayUI"] = __webpack_require__(2);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = (function(){
		"use strict";

		var KSS = __webpack_require__(3);
		var MSXPlay = __webpack_require__(29);

		function zeroPadding(num) {
			return ('00' + num).slice(-2);
		}

		function timeToString(timeInMs) {
			var timeInSec = Math.floor(timeInMs/1000);
			return Math.floor(timeInSec/60) + ":" + zeroPadding(timeInSec%60);
		}

		function parseTime(str) {

			if(!str) return null;

			var m = str.match(/^(.*)ms$/);
			if(m) {
				return parseFloat(m[1]);
			}
			m = str.match(/^(.*)s$/);
			if(m) {
				return parseFloat(m[1]) * 1000;
			}

			return null;
		}

		var MSXPlayUI = function() {
			this.msxplay = new MSXPlay();
			this.playerElements = [];

			setInterval(this.updateDisplay.bind(this),100);
		};

		MSXPlayUI.prototype.install = function(rootElement) {
			var players = rootElement.querySelectorAll('.msxplay');
			for(var i=0;i<players.length;i++) {
				this.attach(players[i]);
			}
		};

		MSXPlayUI.prototype.attach = function(playerElement) {
			this.initPlayer(playerElement);
			this.playerElements.push(playerElement);
			playerElement.addEventListener('click', this.onClickPlayer.bind(this), true);
		};

		MSXPlayUI.prototype.detach = function(playerElement) {
			var i = this.playerElements.indexOf(playerElement);
			if(0<=i) {
				this.playerElements.splice(i,1);
			}
		};

		MSXPlayUI.prototype.createPlayer = function(data, url) {

			var kss = KSS.createObject(new Uint8Array(data));
			var playerElement = document.createElement('div');
			playerElement.classList.add('msxplay');
			playerElement.dataset.url = url;
			playerElement.dataset.hash = kss.hash;
			if(kss.hasMultiSongs) {
				playerElement.classList.add('multi-songs');
			} else {
				playerElement.classList.remove('multi-songs');
			}
			this.attach(playerElement);

			return playerElement;
		};

		MSXPlayUI.prototype.onClickPlayer = function(event) {

			var playerElement = event.target.closest('.msxplay');

			if(event.target == playerElement.querySelector('.leftbox')) {
				if(playerElement == this.currentPlayerElement) {
					if(this.msxplay.getState() == "finished") {
						this.play(playerElement);
					} else if(this.msxplay.isPaused()) {
						this.msxplay.resume();
					} else {
						this.msxplay.pause();
					}
				} else {
					this.play(playerElement);
				}
			} else if(event.target.classList.contains('track')) {
				if(playerElement == this.currentPlayerElement) {
					var pos = Math.floor(this.msxplay.getTotalTime() * event.offsetX / event.target.offsetWidth);
					this.msxplay.seekTo(pos);
				}
			} else if(event.target.classList.contains('next')) {
				var song = (parseInt(playerElement.dataset.song) + (event.shiftKey?10:1))%256;
				playerElement.dataset.song = song;
				playerElement.querySelector('.number').textContent = zeroPadding(song.toString(16));
				playerElement.dataset.duration = null;
				if(playerElement == this.currentPlayerElement) {
					this.play(playerElement);
				}

			} else if(event.target.classList.contains('prev')) {
				var song = (parseInt(playerElement.dataset.song) + (event.shiftKey?246:255))%256;
				playerElement.dataset.song = song;
				playerElement.querySelector('.number').textContent = zeroPadding(song.toString(16));
				playerElement.dataset.duration = null;
				if(playerElement == this.currentPlayerElement) {			
					this.play(playerElement);
				}
			}

		};

		MSXPlayUI.prototype.setDataToPlayer = function(playerElement, data, name) {
			var kss = KSS.createObject(data,name);
			setKSSToPlayerElement(playerElement, kss, name);
		};

		var setKSSToPlayerElement = function(playerElement, kss, url) {
			if(kss instanceof KSS) {
				var title = playerElement.dataset.title || kss.getTitle();
				if(/^[\u0000-\u0020]*$/.test(title)) {
					title = url.replace(/^.*[/\\]/,'');
				}
				playerElement.querySelector('.title').textContent = title;
				playerElement.dataset.hash = kss.hash;
			} else {
				playerElement.querySelector('.title').textContent = kss.toString();
				playerElement.dataset.hash = null;
			}
		};

		MSXPlayUI.prototype.initPlayer = function (playerElement) {
			playerElement.innerHTML = '';
			playerElement.insertAdjacentHTML('afterbegin',
				'<div class="leftbox"></div>' +
				'<div class="rightbox">' +
				'    <div class="title"></div>' +
				'    <div class="spinner">' +
				'       <div class="button next"></div>' +
				'       <div class="number"></div>' +
				'       <div class="button prev"></div>' +
				'    </div>' +
				'    <div class="slider">' +
				'	    <div class="playtime">0:00</div>' + 
				'       <div class="duration">?:??</div>' +
				'		<div class="track">' +
				'			<div class="buffered"></div>' +
				' 		    <div class="progress"></div>' +
				'		</div>' +
				'	 </div>' + 
				'</div>');

			if(playerElement.dataset.url) {
				playerElement.querySelector('.title').textContent = "Loading...";
				this.loadKSS(playerElement);
			}

			if(!playerElement.dataset.song) {
				playerElement.dataset.song = 0;
			}
			playerElement.querySelector('.number').textContent = zeroPadding(parseInt(playerElement.dataset.song).toString(16));

		};

		MSXPlayUI.prototype.loadKSS = function(playerElement) {

			var loadComplete = function(kss, url) {
				setKSSToPlayerElement(playerElement, kss, url);
			};

			var hash = playerElement.dataset.hash;

			if(hash) {
				var kss = KSS.hashMap[hash];
				loadComplete(kss, playerElement.dataset.url);
			} else {
				var url = playerElement.dataset.url;
				KSS.loadFromUrl(url, loadComplete);
			}
		};

		MSXPlayUI.prototype.stop = function() {

			this.msxplay.stop();

			if(this.currentPlayerElement) {			
				this.currentPlayerElement.classList.remove('active');
				this.currentPlayerElement = null;
			}

			for(var i=0;i<this.playerElements.length;i++) {
				var playerElement = this.playerElements[i];

				setPlayerState(playerElement,'standby');

				playerElement.querySelector(".buffered").style.width = 0;
				playerElement.querySelector(".progress").style.width = 0;
				playerElement.querySelector(".playtime").textContent = "0:00";

				var duration = parseTime(playerElement.dataset.duration);
				if(duration) {
					playerElement.querySelector(".duration").textContent = timeToString(duration);
				} else {
					playerElement.querySelector(".duration").textContent = "?:??";
				}
			}

		};

		MSXPlayUI.prototype.play = function(playerElement) {

			this.stop();

			var hash = playerElement.dataset.hash;
			var song = parseInt(playerElement.dataset.song);
			var gain = parseFloat(playerElement.dataset.gain);
			var duration = parseTime(playerElement.dataset.duration);

			var kss = KSS.hashMap[hash];
			if(kss) {
				this.msxplay.setData(kss,song,duration,gain);
				this.msxplay.play();
				this.currentPlayerElement = playerElement;
				playerElement.classList.add('active');
				if(kss.hasMultiSongs) {
					playerElement.classList.add('multi-songs');
				} else {
					playerElement.classList.remove('multi-songs');
				}
			}
		};

		function setPlayerState(playerElement, state) {
			playerElement.classList.remove('playing');
			playerElement.classList.remove('paused');
			playerElement.classList.remove('finished');		
			playerElement.classList.remove('standby');
			playerElement.classList.add(state);
		}

		MSXPlayUI.prototype.updateDisplay = function() {
			if(this.currentPlayerElement) {
				this.updatePlayerStatus(this.currentPlayerElement);
			}
		};

		MSXPlayUI.prototype.updatePlayerStatus = function(playerElement) {

			var played = this.msxplay.getPlayedTime();
			var buffered = this.msxplay.getBufferedTime();
			var total = this.msxplay.getTotalTime();
			var renderSpeed = this.msxplay.renderSpeed.toFixed(1);

			playerElement.querySelector('.playtime').textContent = timeToString(played);

			if(buffered<total) {
				playerElement.querySelector('.playtime').textContent += " buffering... (x" + renderSpeed + ") ";
			} else {
				playerElement.dataset.duration = total + "ms";
			}
			playerElement.querySelector('.duration').textContent = timeToString(total);

			playerElement.querySelector('.progress').style.width = Math.round(100 * played / total) + "%";
			playerElement.querySelector('.buffered').style.width = Math.round(100 * buffered / total) + "%";

			setPlayerState(playerElement, this.msxplay.getState());

		};

		MSXPlayUI.prototype.releaseKSS = function(kss) {
			if(typeof kss == 'string') {
				kss = KSS.hashMap[kss];
			}

			if(kss instanceof KSS) {
				console.log("release " + kss.hash);
				kss.release();
			}
		};

		return new MSXPlayUI();

	})();

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = (function() {
		
		"use strict"

		var Module = __webpack_require__(4);

		var encoding = __webpack_require__(5);
		var crypto = __webpack_require__(6);
		var alg = 'sha1';

		var KSS = function(magic,data,fileName) {
			if(magic!="internal") {
				throw new Error("Do not `new` KSS object directly. Use KSS.createObject() instead.");
			}
			if(65536 < data.length) {
				throw new Error("Wrong data format.");
			}

			var buf = Module._malloc(data.length);
			Module.HEAPU8.set(data,buf);
			this.obj = Module.ccall('KSS_bin2kss','number',['number','number','string'],[buf,data.length,fileName]);
			if(this.obj==0) {
				throw new Error("Can't create KSS object.");
			}
			Module._free(buf);
		};

		KSS.hashMap = {};

		KSS.releaseAll = function() {
			for(var key in KSS.hashMap) {
				KSS.hashMap[key].release();
			}
		};

		KSS.createObject = function(data,fileName) {

			var hash = crypto.createHash(alg);
			hash.update(data);
			var hashHex = alg + ":" + hash.digest('hex');

			var kss = KSS.hashMap[hashHex];
			if(kss) { return kss; }

			kss = new KSS("internal",data,fileName);
			kss.hash = hashHex;
			KSS.hashMap[kss.hash] = kss;

			if(data[0]==75&&data[1]==83&&data[2]==67&&data[3]==67) {
				kss.hasMultiSongs = true;
			}

			return kss;
		};

		KSS.loadFromUrl = function(url, complete) {
			var xhr = new XMLHttpRequest();

			xhr.open("GET",url,true);
			xhr.responseType = "arraybuffer";

			xhr.addEventListener('load',function(){
				if(xhr.status == 200 || xhr.status == 304 || xhr.status == 0) {
					try {
						var kss = KSS.createObject(new Uint8Array(xhr.response),url);
						if(complete) complete(kss, url);
					} catch(e) {
						console.log(e);
						var err = new Error("Can't create kss object: " + url);
						if(complete) complete(err, url);
					}
				} else if(xhr.status == 404) {
					var err = new Error("File Not Found: " + url);
					if(complete) complete(err, url);
				} else {
					var err = new Error(xhr.statusText);
					if(complete) complete(err, url);
				} 
			});
			xhr.addEventListener('error',function(e){
				var err = new Error("Load Error: Check 'Access-Control-Allow-Origin' header is present for the target resource. See browser's development panel for detail. If you run this script local Chrome, `--allow-file-access-from-files` option is required.");
				if(complete) complete(err, url);
			});
			xhr.send();
		};

		KSS.prototype.getTitle = function() {
			var ptr = Module.ccall('KSS_get_title','number',['number'],[this.obj]);
			var i;
			for(i=0;i<256;i++) {
				if( Module.HEAPU8[ptr+i]==0 ) break;
			}
			return encoding.convert(new Uint8Array(Module.HEAPU8.buffer,ptr,i),{to:'UNICODE',from:'SJIS',type:'String'});
		};
		
		KSS.prototype.release = function() {
			if(this.obj) {
				Module.ccall('KSS_delete',null,['number'],[this.obj]);
				this.obj = null;
				delete KSS.hashMap[this.hash];
			} else {
				console.error('KSS double-release: ' + this.hash);
			}
		};

		return KSS;

	}());



/***/ },
/* 4 */
/***/ function(module, exports) {

	var Module;if(!Module)Module=(typeof Module!=="undefined"?Module:null)||{};var moduleOverrides={};for(var key in Module){if(Module.hasOwnProperty(key)){moduleOverrides[key]=Module[key]}}var ENVIRONMENT_IS_WEB=typeof window==="object";var ENVIRONMENT_IS_WORKER=typeof importScripts==="function";var ENVIRONMENT_IS_NODE=typeof process==="object"&&typeof require==="function"&&!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_WORKER;var ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER;if(ENVIRONMENT_IS_NODE){if(!Module["print"])Module["print"]=function print(x){process["stdout"].write(x+"\n")};if(!Module["printErr"])Module["printErr"]=function printErr(x){process["stderr"].write(x+"\n")};var nodeFS=require("fs");var nodePath=require("path");Module["read"]=function read(filename,binary){filename=nodePath["normalize"](filename);var ret=nodeFS["readFileSync"](filename);if(!ret&&filename!=nodePath["resolve"](filename)){filename=path.join(__dirname,"..","src",filename);ret=nodeFS["readFileSync"](filename)}if(ret&&!binary)ret=ret.toString();return ret};Module["readBinary"]=function readBinary(filename){var ret=Module["read"](filename,true);if(!ret.buffer){ret=new Uint8Array(ret)}assert(ret.buffer);return ret};Module["load"]=function load(f){globalEval(read(f))};if(!Module["thisProgram"]){if(process["argv"].length>1){Module["thisProgram"]=process["argv"][1].replace(/\\/g,"/")}else{Module["thisProgram"]="unknown-program"}}Module["arguments"]=process["argv"].slice(2);if(typeof module!=="undefined"){module["exports"]=Module}process["on"]("uncaughtException",(function(ex){if(!(ex instanceof ExitStatus)){throw ex}}));Module["inspect"]=(function(){return"[Emscripten Module object]"})}else if(ENVIRONMENT_IS_SHELL){if(!Module["print"])Module["print"]=print;if(typeof printErr!="undefined")Module["printErr"]=printErr;if(typeof read!="undefined"){Module["read"]=read}else{Module["read"]=function read(){throw"no read() available (jsc?)"}}Module["readBinary"]=function readBinary(f){if(typeof readbuffer==="function"){return new Uint8Array(readbuffer(f))}var data=read(f,"binary");assert(typeof data==="object");return data};if(typeof scriptArgs!="undefined"){Module["arguments"]=scriptArgs}else if(typeof arguments!="undefined"){Module["arguments"]=arguments}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){Module["read"]=function read(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText};if(typeof arguments!="undefined"){Module["arguments"]=arguments}if(typeof console!=="undefined"){if(!Module["print"])Module["print"]=function print(x){console.log(x)};if(!Module["printErr"])Module["printErr"]=function printErr(x){console.log(x)}}else{var TRY_USE_DUMP=false;if(!Module["print"])Module["print"]=TRY_USE_DUMP&&typeof dump!=="undefined"?(function(x){dump(x)}):(function(x){})}if(ENVIRONMENT_IS_WORKER){Module["load"]=importScripts}if(typeof Module["setWindowTitle"]==="undefined"){Module["setWindowTitle"]=(function(title){document.title=title})}}else{throw"Unknown runtime environment. Where are we?"}function globalEval(x){eval.call(null,x)}if(!Module["load"]&&Module["read"]){Module["load"]=function load(f){globalEval(Module["read"](f))}}if(!Module["print"]){Module["print"]=(function(){})}if(!Module["printErr"]){Module["printErr"]=Module["print"]}if(!Module["arguments"]){Module["arguments"]=[]}if(!Module["thisProgram"]){Module["thisProgram"]="./this.program"}Module.print=Module["print"];Module.printErr=Module["printErr"];Module["preRun"]=[];Module["postRun"]=[];for(var key in moduleOverrides){if(moduleOverrides.hasOwnProperty(key)){Module[key]=moduleOverrides[key]}}var Runtime={setTempRet0:(function(value){tempRet0=value}),getTempRet0:(function(){return tempRet0}),stackSave:(function(){return STACKTOP}),stackRestore:(function(stackTop){STACKTOP=stackTop}),getNativeTypeSize:(function(type){switch(type){case"i1":case"i8":return 1;case"i16":return 2;case"i32":return 4;case"i64":return 8;case"float":return 4;case"double":return 8;default:{if(type[type.length-1]==="*"){return Runtime.QUANTUM_SIZE}else if(type[0]==="i"){var bits=parseInt(type.substr(1));assert(bits%8===0);return bits/8}else{return 0}}}}),getNativeFieldSize:(function(type){return Math.max(Runtime.getNativeTypeSize(type),Runtime.QUANTUM_SIZE)}),STACK_ALIGN:16,prepVararg:(function(ptr,type){if(type==="double"||type==="i64"){if(ptr&7){assert((ptr&7)===4);ptr+=4}}else{assert((ptr&3)===0)}return ptr}),getAlignSize:(function(type,size,vararg){if(!vararg&&(type=="i64"||type=="double"))return 8;if(!type)return Math.min(size,8);return Math.min(size||(type?Runtime.getNativeFieldSize(type):0),Runtime.QUANTUM_SIZE)}),dynCall:(function(sig,ptr,args){if(args&&args.length){if(!args.splice)args=Array.prototype.slice.call(args);args.splice(0,0,ptr);return Module["dynCall_"+sig].apply(null,args)}else{return Module["dynCall_"+sig].call(null,ptr)}}),functionPointers:[],addFunction:(function(func){for(var i=0;i<Runtime.functionPointers.length;i++){if(!Runtime.functionPointers[i]){Runtime.functionPointers[i]=func;return 2*(1+i)}}throw"Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS."}),removeFunction:(function(index){Runtime.functionPointers[(index-2)/2]=null}),warnOnce:(function(text){if(!Runtime.warnOnce.shown)Runtime.warnOnce.shown={};if(!Runtime.warnOnce.shown[text]){Runtime.warnOnce.shown[text]=1;Module.printErr(text)}}),funcWrappers:{},getFuncWrapper:(function(func,sig){assert(sig);if(!Runtime.funcWrappers[sig]){Runtime.funcWrappers[sig]={}}var sigCache=Runtime.funcWrappers[sig];if(!sigCache[func]){sigCache[func]=function dynCall_wrapper(){return Runtime.dynCall(sig,func,arguments)}}return sigCache[func]}),getCompilerSetting:(function(name){throw"You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work"}),stackAlloc:(function(size){var ret=STACKTOP;STACKTOP=STACKTOP+size|0;STACKTOP=STACKTOP+15&-16;return ret}),staticAlloc:(function(size){var ret=STATICTOP;STATICTOP=STATICTOP+size|0;STATICTOP=STATICTOP+15&-16;return ret}),dynamicAlloc:(function(size){var ret=DYNAMICTOP;DYNAMICTOP=DYNAMICTOP+size|0;DYNAMICTOP=DYNAMICTOP+15&-16;if(DYNAMICTOP>=TOTAL_MEMORY){var success=enlargeMemory();if(!success){DYNAMICTOP=ret;return 0}}return ret}),alignMemory:(function(size,quantum){var ret=size=Math.ceil(size/(quantum?quantum:16))*(quantum?quantum:16);return ret}),makeBigInt:(function(low,high,unsigned){var ret=unsigned?+(low>>>0)+ +(high>>>0)*+4294967296:+(low>>>0)+ +(high|0)*+4294967296;return ret}),GLOBAL_BASE:8,QUANTUM_SIZE:4,__dummy__:0};Module["Runtime"]=Runtime;var __THREW__=0;var ABORT=false;var EXITSTATUS=0;var undef=0;var tempValue,tempInt,tempBigInt,tempInt2,tempBigInt2,tempPair,tempBigIntI,tempBigIntR,tempBigIntS,tempBigIntP,tempBigIntD,tempDouble,tempFloat;var tempI64,tempI64b;var tempRet0,tempRet1,tempRet2,tempRet3,tempRet4,tempRet5,tempRet6,tempRet7,tempRet8,tempRet9;function assert(condition,text){if(!condition){abort("Assertion failed: "+text)}}var globalScope=this;function getCFunc(ident){var func=Module["_"+ident];if(!func){try{func=eval("_"+ident)}catch(e){}}assert(func,"Cannot call unknown function "+ident+" (perhaps LLVM optimizations or closure removed it?)");return func}var cwrap,ccall;((function(){var JSfuncs={"stackSave":(function(){Runtime.stackSave()}),"stackRestore":(function(){Runtime.stackRestore()}),"arrayToC":(function(arr){var ret=Runtime.stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret}),"stringToC":(function(str){var ret=0;if(str!==null&&str!==undefined&&str!==0){ret=Runtime.stackAlloc((str.length<<2)+1);writeStringToMemory(str,ret)}return ret})};var toC={"string":JSfuncs["stringToC"],"array":JSfuncs["arrayToC"]};ccall=function ccallFunc(ident,returnType,argTypes,args,opts){var func=getCFunc(ident);var cArgs=[];var stack=0;if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=Runtime.stackSave();cArgs[i]=converter(args[i])}else{cArgs[i]=args[i]}}}var ret=func.apply(null,cArgs);if(returnType==="string")ret=Pointer_stringify(ret);if(stack!==0){if(opts&&opts.async){EmterpreterAsync.asyncFinalizers.push((function(){Runtime.stackRestore(stack)}));return}Runtime.stackRestore(stack)}return ret};var sourceRegex=/^function\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;function parseJSFunc(jsfunc){var parsed=jsfunc.toString().match(sourceRegex).slice(1);return{arguments:parsed[0],body:parsed[1],returnValue:parsed[2]}}var JSsource={};for(var fun in JSfuncs){if(JSfuncs.hasOwnProperty(fun)){JSsource[fun]=parseJSFunc(JSfuncs[fun])}}cwrap=function cwrap(ident,returnType,argTypes){argTypes=argTypes||[];var cfunc=getCFunc(ident);var numericArgs=argTypes.every((function(type){return type==="number"}));var numericRet=returnType!=="string";if(numericRet&&numericArgs){return cfunc}var argNames=argTypes.map((function(x,i){return"$"+i}));var funcstr="(function("+argNames.join(",")+") {";var nargs=argTypes.length;if(!numericArgs){funcstr+="var stack = "+JSsource["stackSave"].body+";";for(var i=0;i<nargs;i++){var arg=argNames[i],type=argTypes[i];if(type==="number")continue;var convertCode=JSsource[type+"ToC"];funcstr+="var "+convertCode.arguments+" = "+arg+";";funcstr+=convertCode.body+";";funcstr+=arg+"="+convertCode.returnValue+";"}}var cfuncname=parseJSFunc((function(){return cfunc})).returnValue;funcstr+="var ret = "+cfuncname+"("+argNames.join(",")+");";if(!numericRet){var strgfy=parseJSFunc((function(){return Pointer_stringify})).returnValue;funcstr+="ret = "+strgfy+"(ret);"}if(!numericArgs){funcstr+=JSsource["stackRestore"].body.replace("()","(stack)")+";"}funcstr+="return ret})";return eval(funcstr)}}))();Module["ccall"]=ccall;Module["cwrap"]=cwrap;function setValue(ptr,value,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":HEAP8[ptr>>0]=value;break;case"i8":HEAP8[ptr>>0]=value;break;case"i16":HEAP16[ptr>>1]=value;break;case"i32":HEAP32[ptr>>2]=value;break;case"i64":tempI64=[value>>>0,(tempDouble=value,+Math_abs(tempDouble)>=+1?tempDouble>+0?(Math_min(+Math_floor(tempDouble/+4294967296),+4294967295)|0)>>>0:~~+Math_ceil((tempDouble- +(~~tempDouble>>>0))/+4294967296)>>>0:0)],HEAP32[ptr>>2]=tempI64[0],HEAP32[ptr+4>>2]=tempI64[1];break;case"float":HEAPF32[ptr>>2]=value;break;case"double":HEAPF64[ptr>>3]=value;break;default:abort("invalid type for setValue: "+type)}}Module["setValue"]=setValue;function getValue(ptr,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":return HEAP8[ptr>>0];case"i8":return HEAP8[ptr>>0];case"i16":return HEAP16[ptr>>1];case"i32":return HEAP32[ptr>>2];case"i64":return HEAP32[ptr>>2];case"float":return HEAPF32[ptr>>2];case"double":return HEAPF64[ptr>>3];default:abort("invalid type for setValue: "+type)}return null}Module["getValue"]=getValue;var ALLOC_NORMAL=0;var ALLOC_STACK=1;var ALLOC_STATIC=2;var ALLOC_DYNAMIC=3;var ALLOC_NONE=4;Module["ALLOC_NORMAL"]=ALLOC_NORMAL;Module["ALLOC_STACK"]=ALLOC_STACK;Module["ALLOC_STATIC"]=ALLOC_STATIC;Module["ALLOC_DYNAMIC"]=ALLOC_DYNAMIC;Module["ALLOC_NONE"]=ALLOC_NONE;function allocate(slab,types,allocator,ptr){var zeroinit,size;if(typeof slab==="number"){zeroinit=true;size=slab}else{zeroinit=false;size=slab.length}var singleType=typeof types==="string"?types:null;var ret;if(allocator==ALLOC_NONE){ret=ptr}else{ret=[_malloc,Runtime.stackAlloc,Runtime.staticAlloc,Runtime.dynamicAlloc][allocator===undefined?ALLOC_STATIC:allocator](Math.max(size,singleType?1:types.length))}if(zeroinit){var ptr=ret,stop;assert((ret&3)==0);stop=ret+(size&~3);for(;ptr<stop;ptr+=4){HEAP32[ptr>>2]=0}stop=ret+size;while(ptr<stop){HEAP8[ptr++>>0]=0}return ret}if(singleType==="i8"){if(slab.subarray||slab.slice){HEAPU8.set(slab,ret)}else{HEAPU8.set(new Uint8Array(slab),ret)}return ret}var i=0,type,typeSize,previousType;while(i<size){var curr=slab[i];if(typeof curr==="function"){curr=Runtime.getFunctionIndex(curr)}type=singleType||types[i];if(type===0){i++;continue}if(type=="i64")type="i32";setValue(ret+i,curr,type);if(previousType!==type){typeSize=Runtime.getNativeTypeSize(type);previousType=type}i+=typeSize}return ret}Module["allocate"]=allocate;function getMemory(size){if(!staticSealed)return Runtime.staticAlloc(size);if(typeof _sbrk!=="undefined"&&!_sbrk.called||!runtimeInitialized)return Runtime.dynamicAlloc(size);return _malloc(size)}Module["getMemory"]=getMemory;function Pointer_stringify(ptr,length){if(length===0||!ptr)return"";var hasUtf=0;var t;var i=0;while(1){t=HEAPU8[ptr+i>>0];hasUtf|=t;if(t==0&&!length)break;i++;if(length&&i==length)break}if(!length)length=i;var ret="";if(hasUtf<128){var MAX_CHUNK=1024;var curr;while(length>0){curr=String.fromCharCode.apply(String,HEAPU8.subarray(ptr,ptr+Math.min(length,MAX_CHUNK)));ret=ret?ret+curr:curr;ptr+=MAX_CHUNK;length-=MAX_CHUNK}return ret}return Module["UTF8ToString"](ptr)}Module["Pointer_stringify"]=Pointer_stringify;function AsciiToString(ptr){var str="";while(1){var ch=HEAP8[ptr++>>0];if(!ch)return str;str+=String.fromCharCode(ch)}}Module["AsciiToString"]=AsciiToString;function stringToAscii(str,outPtr){return writeAsciiToMemory(str,outPtr,false)}Module["stringToAscii"]=stringToAscii;function UTF8ArrayToString(u8Array,idx){var u0,u1,u2,u3,u4,u5;var str="";while(1){u0=u8Array[idx++];if(!u0)return str;if(!(u0&128)){str+=String.fromCharCode(u0);continue}u1=u8Array[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}u2=u8Array[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u3=u8Array[idx++]&63;if((u0&248)==240){u0=(u0&7)<<18|u1<<12|u2<<6|u3}else{u4=u8Array[idx++]&63;if((u0&252)==248){u0=(u0&3)<<24|u1<<18|u2<<12|u3<<6|u4}else{u5=u8Array[idx++]&63;u0=(u0&1)<<30|u1<<24|u2<<18|u3<<12|u4<<6|u5}}}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}}Module["UTF8ArrayToString"]=UTF8ArrayToString;function UTF8ToString(ptr){return UTF8ArrayToString(HEAPU8,ptr)}Module["UTF8ToString"]=UTF8ToString;function stringToUTF8Array(str,outU8Array,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){if(outIdx>=endIdx)break;outU8Array[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;outU8Array[outIdx++]=192|u>>6;outU8Array[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;outU8Array[outIdx++]=224|u>>12;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=2097151){if(outIdx+3>=endIdx)break;outU8Array[outIdx++]=240|u>>18;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=67108863){if(outIdx+4>=endIdx)break;outU8Array[outIdx++]=248|u>>24;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else{if(outIdx+5>=endIdx)break;outU8Array[outIdx++]=252|u>>30;outU8Array[outIdx++]=128|u>>24&63;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}}outU8Array[outIdx]=0;return outIdx-startIdx}Module["stringToUTF8Array"]=stringToUTF8Array;function stringToUTF8(str,outPtr,maxBytesToWrite){return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite)}Module["stringToUTF8"]=stringToUTF8;function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){++len}else if(u<=2047){len+=2}else if(u<=65535){len+=3}else if(u<=2097151){len+=4}else if(u<=67108863){len+=5}else{len+=6}}return len}Module["lengthBytesUTF8"]=lengthBytesUTF8;function UTF16ToString(ptr){var i=0;var str="";while(1){var codeUnit=HEAP16[ptr+i*2>>1];if(codeUnit==0)return str;++i;str+=String.fromCharCode(codeUnit)}}Module["UTF16ToString"]=UTF16ToString;function stringToUTF16(str,outPtr,maxBytesToWrite){if(maxBytesToWrite===undefined){maxBytesToWrite=2147483647}if(maxBytesToWrite<2)return 0;maxBytesToWrite-=2;var startPtr=outPtr;var numCharsToWrite=maxBytesToWrite<str.length*2?maxBytesToWrite/2:str.length;for(var i=0;i<numCharsToWrite;++i){var codeUnit=str.charCodeAt(i);HEAP16[outPtr>>1]=codeUnit;outPtr+=2}HEAP16[outPtr>>1]=0;return outPtr-startPtr}Module["stringToUTF16"]=stringToUTF16;function lengthBytesUTF16(str){return str.length*2}Module["lengthBytesUTF16"]=lengthBytesUTF16;function UTF32ToString(ptr){var i=0;var str="";while(1){var utf32=HEAP32[ptr+i*4>>2];if(utf32==0)return str;++i;if(utf32>=65536){var ch=utf32-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}else{str+=String.fromCharCode(utf32)}}}Module["UTF32ToString"]=UTF32ToString;function stringToUTF32(str,outPtr,maxBytesToWrite){if(maxBytesToWrite===undefined){maxBytesToWrite=2147483647}if(maxBytesToWrite<4)return 0;var startPtr=outPtr;var endPtr=startPtr+maxBytesToWrite-4;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343){var trailSurrogate=str.charCodeAt(++i);codeUnit=65536+((codeUnit&1023)<<10)|trailSurrogate&1023}HEAP32[outPtr>>2]=codeUnit;outPtr+=4;if(outPtr+4>endPtr)break}HEAP32[outPtr>>2]=0;return outPtr-startPtr}Module["stringToUTF32"]=stringToUTF32;function lengthBytesUTF32(str){var len=0;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343)++i;len+=4}return len}Module["lengthBytesUTF32"]=lengthBytesUTF32;function demangle(func){var hasLibcxxabi=!!Module["___cxa_demangle"];if(hasLibcxxabi){try{var buf=_malloc(func.length);writeStringToMemory(func.substr(1),buf);var status=_malloc(4);var ret=Module["___cxa_demangle"](buf,0,0,status);if(getValue(status,"i32")===0&&ret){return Pointer_stringify(ret)}}catch(e){}finally{if(buf)_free(buf);if(status)_free(status);if(ret)_free(ret)}}var i=3;var basicTypes={"v":"void","b":"bool","c":"char","s":"short","i":"int","l":"long","f":"float","d":"double","w":"wchar_t","a":"signed char","h":"unsigned char","t":"unsigned short","j":"unsigned int","m":"unsigned long","x":"long long","y":"unsigned long long","z":"..."};var subs=[];var first=true;function dump(x){if(x)Module.print(x);Module.print(func);var pre="";for(var a=0;a<i;a++)pre+=" ";Module.print(pre+"^")}function parseNested(){i++;if(func[i]==="K")i++;var parts=[];while(func[i]!=="E"){if(func[i]==="S"){i++;var next=func.indexOf("_",i);var num=func.substring(i,next)||0;parts.push(subs[num]||"?");i=next+1;continue}if(func[i]==="C"){parts.push(parts[parts.length-1]);i+=2;continue}var size=parseInt(func.substr(i));var pre=size.toString().length;if(!size||!pre){i--;break}var curr=func.substr(i+pre,size);parts.push(curr);subs.push(curr);i+=pre+size}i++;return parts}function parse(rawList,limit,allowVoid){limit=limit||Infinity;var ret="",list=[];function flushList(){return"("+list.join(", ")+")"}var name;if(func[i]==="N"){name=parseNested().join("::");limit--;if(limit===0)return rawList?[name]:name}else{if(func[i]==="K"||first&&func[i]==="L")i++;var size=parseInt(func.substr(i));if(size){var pre=size.toString().length;name=func.substr(i+pre,size);i+=pre+size}}first=false;if(func[i]==="I"){i++;var iList=parse(true);var iRet=parse(true,1,true);ret+=iRet[0]+" "+name+"<"+iList.join(", ")+">"}else{ret=name}paramLoop:while(i<func.length&&limit-->0){var c=func[i++];if(c in basicTypes){list.push(basicTypes[c])}else{switch(c){case"P":list.push(parse(true,1,true)[0]+"*");break;case"R":list.push(parse(true,1,true)[0]+"&");break;case"L":{i++;var end=func.indexOf("E",i);var size=end-i;list.push(func.substr(i,size));i+=size+2;break};case"A":{var size=parseInt(func.substr(i));i+=size.toString().length;if(func[i]!=="_")throw"?";i++;list.push(parse(true,1,true)[0]+" ["+size+"]");break};case"E":break paramLoop;default:ret+="?"+c;break paramLoop}}}if(!allowVoid&&list.length===1&&list[0]==="void")list=[];if(rawList){if(ret){list.push(ret+"?")}return list}else{return ret+flushList()}}var parsed=func;try{if(func=="Object._main"||func=="_main"){return"main()"}if(typeof func==="number")func=Pointer_stringify(func);if(func[0]!=="_")return func;if(func[1]!=="_")return func;if(func[2]!=="Z")return func;switch(func[3]){case"n":return"operator new()";case"d":return"operator delete()"}parsed=parse()}catch(e){parsed+="?"}if(parsed.indexOf("?")>=0&&!hasLibcxxabi){Runtime.warnOnce("warning: a problem occurred in builtin C++ name demangling; build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling")}return parsed}function demangleAll(text){return text.replace(/__Z[\w\d_]+/g,(function(x){var y=demangle(x);return x===y?x:x+" ["+y+"]"}))}function jsStackTrace(){var err=new Error;if(!err.stack){try{throw new Error(0)}catch(e){err=e}if(!err.stack){return"(no stack trace available)"}}return err.stack.toString()}function stackTrace(){return demangleAll(jsStackTrace())}Module["stackTrace"]=stackTrace;var PAGE_SIZE=4096;function alignMemoryPage(x){if(x%4096>0){x+=4096-x%4096}return x}var HEAP;var HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;var STATIC_BASE=0,STATICTOP=0,staticSealed=false;var STACK_BASE=0,STACKTOP=0,STACK_MAX=0;var DYNAMIC_BASE=0,DYNAMICTOP=0;function abortOnCannotGrowMemory(){abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value "+TOTAL_MEMORY+", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which adjusts the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")}function enlargeMemory(){abortOnCannotGrowMemory()}var TOTAL_STACK=Module["TOTAL_STACK"]||5242880;var TOTAL_MEMORY=Module["TOTAL_MEMORY"]||16777216;var totalMemory=64*1024;while(totalMemory<TOTAL_MEMORY||totalMemory<2*TOTAL_STACK){if(totalMemory<16*1024*1024){totalMemory*=2}else{totalMemory+=16*1024*1024}}if(totalMemory!==TOTAL_MEMORY){TOTAL_MEMORY=totalMemory}assert(typeof Int32Array!=="undefined"&&typeof Float64Array!=="undefined"&&!!(new Int32Array(1))["subarray"]&&!!(new Int32Array(1))["set"],"JS engine does not provide full typed array support");var buffer;buffer=new ArrayBuffer(TOTAL_MEMORY);HEAP8=new Int8Array(buffer);HEAP16=new Int16Array(buffer);HEAP32=new Int32Array(buffer);HEAPU8=new Uint8Array(buffer);HEAPU16=new Uint16Array(buffer);HEAPU32=new Uint32Array(buffer);HEAPF32=new Float32Array(buffer);HEAPF64=new Float64Array(buffer);HEAP32[0]=255;assert(HEAPU8[0]===255&&HEAPU8[3]===0,"Typed arrays 2 must be run on a little-endian system");Module["HEAP"]=HEAP;Module["buffer"]=buffer;Module["HEAP8"]=HEAP8;Module["HEAP16"]=HEAP16;Module["HEAP32"]=HEAP32;Module["HEAPU8"]=HEAPU8;Module["HEAPU16"]=HEAPU16;Module["HEAPU32"]=HEAPU32;Module["HEAPF32"]=HEAPF32;Module["HEAPF64"]=HEAPF64;function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback();continue}var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){Runtime.dynCall("v",func)}else{Runtime.dynCall("vi",func,[callback.arg])}}else{func(callback.arg===undefined?null:callback.arg)}}}var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATEXIT__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;var runtimeExited=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function ensureInitRuntime(){if(runtimeInitialized)return;runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function preMain(){callRuntimeCallbacks(__ATMAIN__)}function exitRuntime(){callRuntimeCallbacks(__ATEXIT__);runtimeExited=true}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}Module["addOnPreRun"]=addOnPreRun;function addOnInit(cb){__ATINIT__.unshift(cb)}Module["addOnInit"]=addOnInit;function addOnPreMain(cb){__ATMAIN__.unshift(cb)}Module["addOnPreMain"]=addOnPreMain;function addOnExit(cb){__ATEXIT__.unshift(cb)}Module["addOnExit"]=addOnExit;function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}Module["addOnPostRun"]=addOnPostRun;function intArrayFromString(stringy,dontAddNull,length){var len=length>0?length:lengthBytesUTF8(stringy)+1;var u8array=new Array(len);var numBytesWritten=stringToUTF8Array(stringy,u8array,0,u8array.length);if(dontAddNull)u8array.length=numBytesWritten;return u8array}Module["intArrayFromString"]=intArrayFromString;function intArrayToString(array){var ret=[];for(var i=0;i<array.length;i++){var chr=array[i];if(chr>255){chr&=255}ret.push(String.fromCharCode(chr))}return ret.join("")}Module["intArrayToString"]=intArrayToString;function writeStringToMemory(string,buffer,dontAddNull){var array=intArrayFromString(string,dontAddNull);var i=0;while(i<array.length){var chr=array[i];HEAP8[buffer+i>>0]=chr;i=i+1}}Module["writeStringToMemory"]=writeStringToMemory;function writeArrayToMemory(array,buffer){for(var i=0;i<array.length;i++){HEAP8[buffer++>>0]=array[i]}}Module["writeArrayToMemory"]=writeArrayToMemory;function writeAsciiToMemory(str,buffer,dontAddNull){for(var i=0;i<str.length;++i){HEAP8[buffer++>>0]=str.charCodeAt(i)}if(!dontAddNull)HEAP8[buffer>>0]=0}Module["writeAsciiToMemory"]=writeAsciiToMemory;function unSign(value,bits,ignore){if(value>=0){return value}return bits<=32?2*Math.abs(1<<bits-1)+value:Math.pow(2,bits)+value}function reSign(value,bits,ignore){if(value<=0){return value}var half=bits<=32?Math.abs(1<<bits-1):Math.pow(2,bits-1);if(value>=half&&(bits<=32||value>half)){value=-2*half+value}return value}if(!Math["imul"]||Math["imul"](4294967295,5)!==-5)Math["imul"]=function imul(a,b){var ah=a>>>16;var al=a&65535;var bh=b>>>16;var bl=b&65535;return al*bl+(ah*bl+al*bh<<16)|0};Math.imul=Math["imul"];if(!Math["clz32"])Math["clz32"]=(function(x){x=x>>>0;for(var i=0;i<32;i++){if(x&1<<31-i)return i}return 32});Math.clz32=Math["clz32"];var Math_abs=Math.abs;var Math_cos=Math.cos;var Math_sin=Math.sin;var Math_tan=Math.tan;var Math_acos=Math.acos;var Math_asin=Math.asin;var Math_atan=Math.atan;var Math_atan2=Math.atan2;var Math_exp=Math.exp;var Math_log=Math.log;var Math_sqrt=Math.sqrt;var Math_ceil=Math.ceil;var Math_floor=Math.floor;var Math_pow=Math.pow;var Math_imul=Math.imul;var Math_fround=Math.fround;var Math_min=Math.min;var Math_clz32=Math.clz32;var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function getUniqueRunDependency(id){return id}function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}}Module["addRunDependency"]=addRunDependency;function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}Module["removeRunDependency"]=removeRunDependency;Module["preloadedImages"]={};Module["preloadedAudios"]={};var memoryInitializer=null;var ASM_CONSTS=[];STATIC_BASE=8;STATICTOP=STATIC_BASE+1221520;__ATINIT__.push();allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,50,64,0,0,0,0,0,0,56,64,0,0,0,0,0,192,59,64,0,0,0,0,0,0,62,64,0,0,0,0,0,32,64,64,0,0,0,0,0,224,64,64,0,0,0,0,0,160,65,64,0,0,0,0,0,0,66,64,0,0,0,0,0,192,66,64,0,0,0,0,0,32,67,64,0,0,0,0,0,128,67,64,0,0,0,0,0,224,67,64,0,0,0,0,0,64,68,64,0,0,0,0,0,160,68,64,0,0,0,0,0,0,69,64,93,61,127,102,158,160,230,63,0,0,0,0,0,136,57,61,68,23,117,250,82,176,230,63,0,0,0,0,0,0,216,60,254,217,11,117,18,192,230,63,0,0,0,0,0,120,40,189,191,118,212,221,220,207,230,63,0,0,0,0,0,192,30,61,41,26,101,60,178,223,230,63,0,0,0,0,0,0,216,188,227,58,89,152,146,239,230,63,0,0,0,0,0,0,188,188,134,147,81,249,125,255,230,63,0,0,0,0,0,216,47,189,163,45,244,102,116,15,231,63,0,0,0,0,0,136,44,189,195,95,236,232,117,31,231,63,0,0,0,0,0,192,19,61,5,207,234,134,130,47,231,63,0,0,0,0,0,48,56,189,82,129,165,72,154,63,231,63,0,0,0,0,0,192,0,189,252,204,215,53,189,79,231,63,0,0,0,0,0,136,47,61,241,103,66,86,235,95,231,63,0,0,0,0,0,224,3,61,72,109,171,177,36,112,231,63,0,0,0,0,0,208,39,189,56,93,222,79,105,128,231,63,0,0,0,0,0,0,221,188,0,29,172,56,185,144,231,63,0,0,0,0,0,0,227,60,120,1,235,115,20,161,231,63,0,0,0,0,0,0,237,188,96,208,118,9,123,177,231,63,0,0,0,0,0,64,32,61,51,193,48,1,237,193,231,63,0,0,0,0,0,0,160,60,54,134,255,98,106,210,231,63,0,0,0,0,0,144,38,189,59,78,207,54,243,226,231,63,0,0,0,0,0,224,2,189,232,195,145,132,135,243,231,63,0,0,0,0,0,88,36,189,78,27,62,84,39,4,232,63,0,0,0,0,0,0,51,61,26,7,209,173,210,20,232,63,0,0,0,0,0,0,15,61,126,205,76,153,137,37,232,63,0,0,0,0,0,192,33,189,208,66,185,30,76,54,232,63,0,0,0,0,0,208,41,61,181,202,35,70,26,71,232,63,0,0,0,0,0,16,71,61,188,91,159,23,244,87,232,63,0,0,0,0,0,96,34,61,175,145,68,155,217,104,232,63,0,0,0,0,0,196,50,189,149,163,49,217,202,121,232,63,0,0,0,0,0,0,35,189,184,101,138,217,199,138,232,63,0,0,0,0,0,128,42,189,0,88,120,164,208,155,232,63,0,0,0,0,0,0,237,188,35,162,42,66,229,172,232,63,0,0,0,0,0,40,51,61,250,25,214,186,5,190,232,63,0,0,0,0,0,180,66,61,131,67,181,22,50,207,232,63,0,0,0,0,0,208,46,189,76,102,8,94,106,224,232,63,0,0,0,0,0,80,32,189,7,120,21,153,174,241,232,63,0,0,0,0,0,40,40,61,14,44,40,208,254,2,233,63,0,0,0,0,0,176,28,189,150,255,145,11,91,20,233,63,0,0,0,0,0,224,5,189,249,47,170,83,195,37,233,63,0,0,0,0,0,64,245,60,74,198,205,176,55,55,233,63,0,0,0,0,0,32,23,61,174,152,95,43,184,72,233,63,0,0,0,0,0,0,9,189,203,82,200,203,68,90,233,63,0,0,0,0,0,104,37,61,33,111,118,154,221,107,233,63,0,0,0,0,0,208,54,189,42,78,222,159,130,125,233,63,0,0,0,0,0,0,1,189,163,35,122,228,51,143,233,63,0,0,0,0,0,0,45,61,4,6,202,112,241,160,233,63,0,0,0,0,0,164,56,189,137,255,83,77,187,178,233,63,0,0,0,0,0,92,53,61,91,241,163,130,145,196,233,63,0,0,0,0,0,184,38,61,197,184,75,25,116,214,233,63,0,0,0,0,0,0,236,188,142,35,227,25,99,232,233,63,0,0,0,0,0,208,23,61,2,243,7,141,94,250,233,63,0,0,0,0,0,64,22,61,77,229,93,123,102,12,234,63,0,0,0,0,0,0,245,188,246,184,142,237,122,30,234,63,0,0,0,0,0,224,9,61,39,46,74,236,155,48,234,63,0,0,0,0,0,216,42,61,93,10,70,128,201,66,234,63,0,0,0,0,0,240,26,189,155,37,62,178,3,85,234,63,0,0,0,0,0,96,11,61,19,98,244,138,74,103,234,63,0,0,0,0,0,136,56,61,167,179,48,19,158,121,234,63,0,0,0,0,0,32,17,61,141,46,193,83,254,139,234,63,0,0,0,0,0,192,6,61,210,252,121,85,107,158,234,63,0,0,0,0,0,184,41,189,184,111,53,33,229,176,234,63,0,0,0,0,0,112,43,61,129,243,211,191,107,195,234,63,0,0,0,0,0,0,217,60,128,39,60,58,255,213,234,63,0,0,0,0,0,0,228,60,163,210,90,153,159,232,234,63,0,0,0,0,0,144,44,189,103,243,34,230,76,251,234,63,0,0,0,0,0,80,22,61,144,183,141,41,7,14,235,63,0,0,0,0,0,212,47,61,169,137,154,108,206,32,235,63,0,0,0,0,0,112,18,61,75,26,79,184,162,51,235,63,0,0,0,0,0,71,77,61,231,71,183,21,132,70,235,63,0,0,0,0,0,56,56,189,58,89,229,141,114,89,235,63,0,0,0,0,0,0,152,60,106,197,241,41,110,108,235,63,0,0,0,0,0,208,10,61,80,94,251,242,118,127,235,63,0,0,0,0,0,128,222,60,178,73,39,242,140,146,235,63,0,0,0,0,0,192,4,189,3,6,161,48,176,165,235,63,0,0,0,0,0,112,13,189,102,111,154,183,224,184,235,63,0,0,0,0,0,144,13,61,255,193,75,144,30,204,235,63,0,0,0,0,0,160,2,61,111,161,243,195,105,223,235,63,0,0,0,0,0,120,31,189,184,29,215,91,194,242,235,63,0,0,0,0,0,160,16,189,233,178,65,97,40,6,236,63,0,0,0,0,0,64,17,189,224,82,133,221,155,25,236,63,0,0,0,0,0,224,11,61,238,100,250,217,28,45,236,63,0,0,0,0,0,64,9,189,47,208,255,95,171,64,236,63,0,0,0,0,0,208,14,189,21,253,250,120,71,84,236,63,0,0,0,0,0,102,57,61,203,208,87,46,241,103,236,63,0,0,0,0,0,16,26,189,182,193,136,137,168,123,236,63,0,0,0,0,128,69,88,189,51,231,6,148,109,143,236,63,0,0,0,0,0,72,26,189,223,196,81,87,64,163,236,63,0,0,0,0,0,0,203,60,148,144,239,220,32,183,236,63,0,0,0,0,0,64,1,61,137,22,109,46,15,203,236,63,0,0,0,0,0,32,240,60,18,196,93,85,11,223,236,63,0,0,0,0,0,96,243,60,59,171,91,91,21,243,236,63,0,0,0,0,0,144,6,189,188,137,7,74,45,7,237,63,0,0,0,0,0,160,9,61,250,200,8,43,83,27,237,63,0,0,0,0,0,224,21,189,133,138,13,8,135,47,237,63,0,0,0,0,0,40,29,61,3,162,202,234,200,67,237,63,0,0,0,0,0,160,1,61,145,164,251,220,24,88,237,63,0,0,0,0,0,0,223,60,161,230,98,232,118,108,237,63,0,0,0,0,0,160,3,189,78,131,201,22,227,128,237,63,0,0,0,0,0,216,12,189,144,96,255,113,93,149,237,63,0,0,0,0,0,192,244,60,174,50,219,3,230,169,237,63,0,0,0,0,0,144,255,60,37,131,58,214,124,190,237,63,0,0,0,0,0,128,233,60,69,180,1,243,33,211,237,63,0,0,0,0,0,32,245,188,191,5,28,100,213,231,237,63,0,0,0,0,0,112,29,189,236,154,123,51,151,252,237,63,0,0,0,0,0,20,22,189,94,125,25,107,103,17,238,63,0,0,0,0,0,72,11,61,231,163,245,20,70,38,238,63,0,0,0,0,0,206,64,61,92,238,22,59,51,59,238,63,0,0,0,0,0,104,12,61,180,63,139,231,46,80,238,63,0,0,0,0,0,48,9,189,104,109,103,36,57,101,238,63,0,0,0,0,0,0,229,188,68,76,199,251,81,122,238,63,0,0,0,0,0,248,7,189,38,183,205,119,121,143,238,63,0,0,0,0,0,112,243,188,232,144,164,162,175,164,238,63,0,0,0,0,0,208,229,60,228,202,124,134,244,185,238,63,0,0,0,0,0,26,22,61,13,104,142,45,72,207,238,63,0,0,0,0,0,80,245,60,20,133,24,162,170,228,238,63,0,0,0,0,0,64,198,60,19,90,97,238,27,250,238,63,0,0,0,0,0,128,238,188,6,65,182,28,156,15,239,63,0,0,0,0,0,136,250,188,99,185,107,55,43,37,239,63,0,0,0,0,0,144,44,189,117,114,221,72,201,58,239,63,0,0,0,0,0,0,170,60,36,69,110,91,118,80,239,63,0,0,0,0,0,240,244,188,253,68,136,121,50,102,239,63,0,0,0,0,0,128,202,60,56,190,156,173,253,123,239,63,0,0,0,0,0,188,250,60,130,60,36,2,216,145,239,63,0,0,0,0,0,96,212,188,142,144,158,129,193,167,239,63,0,0,0,0,0,12,11,189,17,213,146,54,186,189,239,63,0,0,0,0,0,224,192,188,148,113,143,43,194,211,239,63,0,0,0,0,128,222,16,189,238,35,42,107,217,233,239,63,0,0,0,0,0,67,238,60,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,190,188,90,250,26,11,240,63,0,0,0,0,0,64,179,188,3,51,251,169,61,22,240,63,0,0,0,0,0,23,18,189,130,2,59,20,104,33,240,63,0,0,0,0,0,64,186,60,108,128,119,62,154,44,240,63,0,0,0,0,0,152,239,60,202,187,17,46,212,55,240,63,0,0,0,0,0,64,199,188,137,127,110,232,21,67,240,63,0,0,0,0,0,48,216,60,103,84,246,114,95,78,240,63,0,0,0,0,0,63,26,189,90,133,21,211,176,89,240,63,0,0,0,0,0,132,2,189,149,31,60,14,10,101,240,63,0,0,0,0,0,96,241,60,26,247,221,41,107,112,240,63,0,0,0,0,0,36,21,61,45,168,114,43,212,123,240,63,0,0,0,0,0,160,233,188,208,155,117,24,69,135,240,63,0,0,0,0,0,64,230,60,200,7,102,246,189,146,240,63,0,0,0,0,0,120,0,189,131,243,198,202,62,158,240,63,0,0,0,0,0,0,152,188,48,57,31,155,199,169,240,63,0,0,0,0,0,160,255,60,252,136,249,108,88,181,240,63,0,0,0,0,0,200,250,188,138,108,228,69,241,192,240,63,0,0,0,0,0,192,217,60,22,72,114,43,146,204,240,63,0,0,0,0,0,32,5,61,216,93,57,35,59,216,240,63,0,0,0,0,0,208,250,188,243,209,211,50,236,227,240,63,0,0,0,0,0,172,27,61,166,169,223,95,165,239,240,63,0,0,0,0,0,232,4,189,240,210,254,175,102,251,240,63,0,0,0,0,0,48,13,189,75,35,215,40,48,7,241,63,0,0,0,0,0,80,241,60,91,91,18,208,1,19,241,63,0,0,0,0,0,0,236,60,249,42,94,171,219,30,241,63,0,0,0,0,0,188,22,61,213,49,108,192,189,42,241,63,0,0,0,0,0,64,232,60,125,4,242,20,168,54,241,63,0,0,0,0,0,208,14,189,233,45,169,174,154,66,241,63,0,0,0,0,0,224,232,60,56,49,79,147,149,78,241,63,0,0,0,0,0,64,235,60,113,142,165,200,152,90,241,63,0,0,0,0,0,48,5,61,223,195,113,84,164,102,241,63,0,0,0,0,0,56,3,61,17,82,125,60,184,114,241,63,0,0,0,0,0,212,40,61,159,187,149,134,212,126,241,63,0,0,0,0,0,208,5,189,147,141,140,56,249,138,241,63,0,0,0,0,0,136,28,189,102,93,55,88,38,151,241,63,0,0,0,0,0,240,17,61,167,203,111,235,91,163,241,63,0,0,0,0,0,72,16,61,227,135,19,248,153,175,241,63,0,0,0,0,0,57,71,189,84,93,4,132,224,187,241,63,0,0,0,0,0,228,36,61,67,28,40,149,47,200,241,63,0,0,0,0,0,32,10,189,178,185,104,49,135,212,241,63,0,0,0,0,0,128,227,60,49,64,180,94,231,224,241,63,0,0,0,0,0,192,234,60,56,217,252,34,80,237,241,63,0,0,0,0,0,144,1,61,247,205,56,132,193,249,241,63,0,0,0,0,0,120,27,189,143,141,98,136,59,6,242,63,0,0,0,0,0,148,45,61,30,168,120,53,190,18,242,63,0,0,0,0,0,0,216,60,65,221,125,145,73,31,242,63,0,0,0,0,0,52,43,61,35,19,121,162,221,43,242,63,0,0,0,0,0,248,25,61,231,97,117,110,122,56,242,63,0,0,0,0,0,200,25,189,39,20,130,251,31,69,242,63,0,0,0,0,0,48,2,61,2,166,178,79,206,81,242,63,0,0,0,0,0,72,19,189,176,206,30,113,133,94,242,63,0,0,0,0,0,112,18,61,22,125,226,101,69,107,242,63,0,0,0,0,0,208,17,61,15,224,29,52,14,120,242,63,0,0,0,0,0,238,49,61,62,99,245,225,223,132,242,63,0,0,0,0,0,192,20,189,48,187,145,117,186,145,242,63,0,0,0,0,0,216,19,189,9,223,31,245,157,158,242,63,0,0,0,0,0,176,8,61,155,14,209,102,138,171,242,63,0,0,0,0,0,124,34,189,58,218,218,208,127,184,242,63,0,0,0,0,0,52,42,61,249,26,119,57,126,197,242,63,0,0,0,0,0,128,16,189,217,2,228,166,133,210,242,63,0,0,0,0,0,208,14,189,121,21,100,31,150,223,242,63,0,0,0,0,0,32,244,188,207,46,62,169,175,236,242,63,0,0,0,0,0,152,36,189,34,136,189,74,210,249,242,63,0,0,0,0,0,48,22,189,37,182,49,10,254,6,243,63,0,0,0,0,0,54,50,189,11,165,238,237,50,20,243,63,0,0,0,0,128,223,112,189,184,215,76,252,112,33,243,63,0,0,0,0,0,72,34,189,162,233,168,59,184,46,243,63,0,0,0,0,0,152,37,189,102,23,100,178,8,60,243,63,0,0,0,0,0,208,30,61,39,250,227,102,98,73,243,63,0,0,0,0,0,0,220,188,15,159,146,95,197,86,243,63,0,0,0,0,0,216,48,189,185,136,222,162,49,100,243,63,0,0,0,0,0,200,34,61,57,170,58,55,167,113,243,63,0,0,0,0,0,96,32,61,254,116,30,35,38,127,243,63,0,0,0,0,0,96,22,189,56,216,5,109,174,140,243,63,0,0,0,0,0,224,10,189,195,62,113,27,64,154,243,63,0,0,0,0,0,114,68,189,32,160,229,52,219,167,243,63,0,0,0,0,0,32,8,61,149,110,236,191,127,181,243,63,0,0,0,0,0,128,62,61,242,168,19,195,45,195,243,63,0,0,0,0,0,128,239,60,34,225,237,68,229,208,243,63,0,0,0,0,0,160,23,189,187,52,18,76,166,222,243,63,0,0,0,0,0,48,38,61,204,78,28,223,112,236,243,63,0,0,0,0,0,166,72,189,140,126,172,4,69,250,243,63,0,0,0,0,0,220,60,189,187,160,103,195,34,8,244,63,0,0,0,0,0,184,37,61,149,46,247,33,10,22,244,63,0,0,0,0,0,192,30,61,70,70,9,39,251,35,244,63,0,0,0,0,0,96,19,189,32,169,80,217,245,49,244,63,0,0,0,0,0,152,35,61,235,185,132,63,250,63,244,63,0,0,0,0,0,0,250,60,25,137,97,96,8,78,244,63,0,0,0,0,0,192,246,188,1,210,167,66,32,92,244,63,0,0,0,0,0,192,11,189,22,0,29,237,65,106,244,63,0,0,0,0,0,128,18,189,38,51,139,102,109,120,244,63,0,0,0,0,0,224,48,61,0,60,193,181,162,134,244,63,0,0,0,0,0,64,45,189,4,175,146,225,225,148,244,63,0,0,0,0,0,32,12,61,114,211,215,240,42,163,244,63,0,0,0,0,0,80,30,189,1,184,109,234,125,177,244,63,0,0,0,0,0,128,7,61,225,41,54,213,218,191,244,63,0,0,0,0,0,128,19,189,50,193,23,184,65,206,244,63,0,0,0,0,0,128,0,61,219,221,253,153,178,220,244,63,0,0,0,0,0,112,44,61,150,171,216,129,45,235,244,63,0,0,0,0,0,224,28,189,2,45,157,118,178,249,244,63,0,0,0,0,0,32,25,61,193,49,69,127,65,8,245,63,0,0,0,0,0,192,8,189,42,102,207,162,218,22,245,63,0,0,0,0,0,0,250,188,234,81,63,232,125,37,245,63,0,0,0,0,0,8,74,61,218,78,157,86,43,52,245,63,0,0,0,0,0,216,38,189,26,172,246,244,226,66,245,63,0,0,0,0,0,68,50,189,219,148,93,202,164,81,245,63,0,0,0,0,0,60,72,61,107,17,233,221,112,96,245,63,0,0,0,0,0,176,36,61,222,41,181,54,71,111,245,63,0,0,0,0,0,90,65,61,14,196,226,219,39,126,245,63,0,0,0,0,0,224,41,189,111,199,151,212,18,141,245,63,0,0,0,0,0,8,35,189,76,11,255,39,8,156,245,63,0,0,0,0,0,236,77,61,39,84,72,221,7,171,245,63,0,0,0,0,0,0,196,188,244,122,168,251,17,186,245,63,0,0,0,0,0,8,48,61,11,70,89,138,38,201,245,63,0,0,0,0,0,200,38,189,63,142,153,144,69,216,245,63,0,0,0,0,0,154,70,61,225,32,173,21,111,231,245,63,0,0,0,0,0,64,27,189,202,235,220,32,163,246,245,63,0,0,0,0,0,112,23,61,184,220,118,185,225,5,246,63,0,0,0,0,0,248,38,61,21,247,205,230,42,21,246,63,0,0,0,0,0,0,1,61,49,85,58,176,126,36,246,63,0,0,0,0,0,208,21,189,181,41,25,29,221,51,246,63,0,0,0,0,0,208,18,189,19,195,204,52,70,67,246,63,0,0,0,0,0,128,234,188,250,142,188,254,185,82,246,63,0,0,0,0,0,96,40,189,151,51,85,130,56,98,246,63,0,0,0,0,0,254,113,61,142,50,8,199,193,113,246,63,0,0,0,0,0,32,55,189,126,169,76,212,85,129,246,63,0,0,0,0,0,128,230,60,113,148,158,177,244,144,246,63,0,0,0,0,0,120,41,189],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE);allocate([128,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,32,0,0,0,32,0,0,0,32,0,0,0,0,0,0,0,64,0,0,0,32,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,9,0,0,0,11,0,0,0,13,0,0,0,15,0,0,0,18,0,0,0,22,0,0,0,26,0,0,0,31,0,0,0,37,0,0,0,45,0,0,0,53,0,0,0,63,0,0,0,76,0,0,0,90,0,0,0,106,0,0,0,127,0,0,0,151,0,0,0,180,0,0,0,214,0,0,0,255,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,3,0,0,0,5,0,0,0,5,0,0,0,7,0,0,0,7,0,0,0,11,0,0,0,11,0,0,0,15,0,0,0,15,0,0,0,22,0,0,0,22,0,0,0,31,0,0,0,31,0,0,0,45,0,0,0,45,0,0,0,63,0,0,0,63,0,0,0,90,0,0,0,90,0,0,0,127,0,0,0,127,0,0,0,180,0,0,0,180,0,0,0,255,0,0,0,255,0,0,0,69,77,85,50],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+6277);allocate([52,49,51],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+145756);allocate([72,160,16,0,72,164,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,8,0,0,0,12,0,0,0,16,0,0,0,20,0,0,0,24,0,0,0,28,0,0,0,32,0,0,0,36,0,0,0,40,0,0,0,44,0,0,0,48,0,0,0,52,0,0,0,56,0,0,0,64],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+410004);allocate([18,0,0,0,24,0,0,0,27,0,0,0,30,0,0,0,32,0,0,0,33,0,0,0,35,0,0,0,36,0,0,0,37,0,0,0,38,0,0,0,39,0,0,0,39,0,0,0,40,0,0,0,41,0,0,0,42],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+424428);allocate([2,0,0,0,4,0,0,0,1,0,0,0,3,0,0,0,5,0,0,0,255,255,255,255,255,255,255,255,6,0,0,0,8,0,0,0,10,0,0,0,7,0,0,0,9,0,0,0,11,0,0,0,255,255,255,255,255,255,255,255,12,0,0,0,14,0,0,0,16,0,0,0,13,0,0,0,15,0,0,0,17,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+559808);allocate([4,0,0,0,8,0,0,0,12,0,0,0,16,0,0,0,20,0,0,0,24,0,0,0,28,0,0,0,32,0,0,0,36,0,0,0,40,0,0,0,44,0,0,0,48,0,0,0,52,0,0,0,56,0,0,0,124,0,1,0,0,0,2,0,0,0,4,0,0,0,6,0,0,0,8,0,0,0,10,0,0,0,12,0,0,0,14,0,0,0,16,0,0,0,18,0,0,0,20,0,0,0,20,0,0,0,24,0,0,0,24,0,0,0,30,0,0,0,30,0,0,0,57,0,0,0,57,0,0,0,57,0,0,0,57,0,0,0,77,0,0,0,102,0,0,0,128,0,0,0,153,0,0,0,255,0,0,0,203,0,0,0,161,0,0,0,128,0,0,0,101,0,0,0,80,0,0,0,64,0,0,0,51,0,0,0,40,0,0,0,32,0,0,0,25,0,0,0,20,0,0,0,16,0,0,0,12,0,0,0,10,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,148,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,3,0,0,0,125,157,18,0,0,4,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,255,255,255,255],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+1086274);allocate([75,83,67,67,0,75,83,83,88,0,46,77,66,77,0,46,109,98,109,0,73,78,70,79,0,77,66,77,0,114,98],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+1091904);allocate([75,83,83,88,0,62,0,0,64,62,159,253,0,0,16,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,77,66,77,50,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,243,62,195,33,29,63,50,28,0,34,29,0,33,5,63,50,32,0,34,33,0,33,30,63,50,48,0,34,49,0,33,29,63,50,128,1,34,129,1,33,28,63,50,131,1,34,132,1,33,14,63,50,125,243,34,126,243,62,201,50,159,253,50,160,253,50,161,253,50,162,253,50,163,253,33,0,218,17,1,218,1,30,0,54,0,237,176,58,3,62,230,3,50,0,218,62,3,50,2,218,33,0,128,34,3,218,42,0,64,17,0,64,25,17,0,128,1,56,0,62,3,211,254,237,176,8,62,0,183,8,62,3,50,38,63,205,8,64,205,224,62,58,2,218,50,38,63,205,12,64,58,2,218,211,254,205,4,64,251,201,6,4,33,0,128,197,229,17,0,192,1,0,16,62,6,211,254,237,176,209,33,0,192,1,0,16,175,211,254,237,176,213,225,193,16,225,201,229,213,55,63,237,82,209,225,201,121,254,39,32,9,58,38,63,211,254,60,50,38,63,175,201,227,245,62,195,119,241,227,201,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,77,66,75,70,73,76,69,58,32,0,13,10,40,77,66,75,32,105,115,32,110,111,116,32,70,111,117,110,100,41,0,77,71,83,0,195,157,24,77,71,83,68,82,86,14,31,23,3,0,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,195,237,96,195,185,101,195,119,98,195,195,101,195,214,102,195,143,104,195,185,96,195,72,96,195,96,103,195,49,96,195,155,103,201,197,6,2,219,230,79,219,230,145,254,254,56,249,16,244,193,241,201,8,32,9,8,211,124,8,123,211,125,245,241,8,201,245,197,219,230,71,219,230,144,40,251,123,211,125,219,230,71,219,230,144,254,7,56,249,193,241,201,50,114,96,8,123,50,0,152,8,201,211,160,8,123,211,161,8,201,219,168,111,58,255,255,103,227,233,225,227,243,125,211,168,124,47,50,255,255,201,243,58,217,104,79,219,168,71,230,63,177,211,168,58,230,104,79,58,255,255,47,230,207,177,50,255,255,58,236,104,79,120,230,207,177,211,168,201,243,254,240,202,75,104,14,0,30,0,254,16,40,32,14,2,29,254,17,40,25,50,54,119,58,52,119,4,5,40,3,50,83,119,183,200,254,15,192,221,33,20,126,195,85,108,99,107,67,195,195,101,205,66,97,50,50,119,87,213,205,176,97,209,254,255,32,3,58,1,96,95,213,205,46,98,33,45,0,58,193,252,205,12,0,254,3,56,30,221,33,131,1,253,42,192,252,205,28,0,183,40,16,62,195,50,74,96,33,82,96,34,75,96,62,245,50,49,96,209,221,33,50,119,33,23,3,253,33,176,122,1,62,0,123,251,201,33,149,97,34,136,97,205,107,97,254,255,200,245,33,24,64,205,12,0,254,65,40,16,241,245,245,33,246,127,205,12,0,246,1,95,241,205,20,0,241,201,33,193,252,17,24,119,14,4,203,126,35,6,4,26,19,32,7,6,1,19,19,19,24,1,26,217,243,87,205,0,0,217,200,19,16,244,13,32,225,62,255,201,33,28,64,17,44,119,79,6,4,213,197,121,205,12,0,193,209,235,190,235,192,35,19,16,240,121,201,33,188,97,34,136,97,205,107,97,254,255,201,237,115,140,119,49,14,127,205,126,96,205,5,98,33,0,144,1,0,152,126,245,54,0,10,245,47,95,2,10,187,40,27,241,2,54,63,10,245,47,95,2,10,187,32,14,241,2,241,119,205,135,96,237,123,140,119,175,122,201,241,2,241,119,205,135,96,237,123,140,119,175,60,201,122,230,3,15,15,103,219,168,111,230,63,180,211,168,122,230,12,7,7,95,58,255,255,47,230,207,179,50,255,255,124,15,15,95,125,230,207,179,211,168,201,50,51,119,254,255,200,95,230,3,15,15,50,217,104,15,15,50,236,104,123,230,12,7,7,50,230,104,243,237,115,140,119,49,14,127,205,126,96,205,147,96,62,63,50,0,144,62,138,30,0,6,5,205,108,96,60,16,250,62,143,30,31,205,108,96,205,135,96,237,123,140,119,201,120,50,90,119,34,88,119,213,205,74,101,33,0,184,34,77,119,92,62,7,205,118,96,61,93,205,118,96,33,79,119,30,255,115,62,11,205,118,96,35,30,0,115,60,205,118,96,123,99,107,34,58,119,34,60,119,34,73,119,34,75,119,50,142,119,50,62,119,33,80,120,17,81,120,1,95,2,119,237,176,33,176,121,17,177,121,1,255,0,119,237,176,33,74,104,34,176,121,6,15,17,251,255,33,154,120,120,135,135,135,135,119,25,16,247,33,193,118,17,91,119,14,48,237,176,33,176,122,17,177,122,1,29,4,175,119,237,176,50,55,119,50,56,119,50,83,119,50,53,119,33,120,0,34,71,119,33,144,119,14,24,30,181,6,8,203,3,48,1,60,119,35,16,247,13,32,242,225,84,93,175,71,79,11,237,177,43,34,86,119,35,203,70,62,17,40,2,62,15,203,126,203,190,40,111,245,229,35,229,78,35,70,9,229,33,255,63,25,235,225,237,184,235,35,209,229,217,225,6,1,217,205,144,103,205,144,103,48,8,217,126,35,217,18,19,24,243,205,144,103,56,20,175,205,144,103,23,205,144,103,23,79,217,126,35,217,111,38,255,121,24,28,217,126,35,217,111,217,126,35,217,103,254,32,56,7,7,7,7,230,7,24,7,217,126,35,217,183,40,14,79,6,0,124,246,224,103,25,3,3,237,176,24,176,225,241,203,78,35,78,35,70,35,245,229,245,120,177,196,75,104,241,50,52,119,33,0,205,62,194,32,5,33,60,195,62,205,50,21,116,124,50,71,116,125,50,11,109,50,41,113,225,78,35,70,35,229,121,176,202,152,100,96,105,237,91,86,119,25,126,35,254,255,202,152,100,17,242,99,213,70,35,229,135,95,22,0,33,14,100,25,126,35,102,111,120,233,47,100,62,100,89,100,116,100,136,100,141,100,28,100,111,38,0,41,17,176,121,25,209,115,35,114,235,175,71,79,237,177,201,17,82,120,205,78,100,209,115,35,114,33,8,0,25,201,17,84,120,205,78,100,209,26,19,135,135,135,135,119,235,201,111,79,38,0,6,0,41,41,9,25,201,17,240,120,135,111,38,0,25,209,115,35,114,235,126,35,183,30,6,250,112,100,94,35,22,0,25,201,17,50,121,38,0,135,135,111,203,20,25,209,115,35,114,33,32,0,25,201,17,115,119,24,3,17,91,119,225,43,1,24,0,237,176,201,225,241,245,71,221,33,176,122,58,52,119,144,94,35,86,35,229,33,90,119,203,30,43,203,30,43,203,30,48,59,123,178,40,55,42,86,119,25,126,60,40,47,221,117,5,221,116,6,14,1,33,58,119,52,35,52,221,113,0,221,113,3,221,54,12,8,221,54,17,2,221,54,20,8,221,54,21,3,221,113,57,221,54,58,32,221,54,61,48,17,62,0,221,25,225,16,167,241,254,17,30,0,40,2,30,32,62,14,205,72,96,40,27,33,9,119,6,3,62,22,94,35,205,72,96,198,16,94,35,205,72,96,214,15,16,240,175,50,139,119,58,51,119,60,32,13,33,109,123,1,0,5,17,62,0,113,25,16,252,58,50,119,60,32,9,33,163,124,6,9,113,25,16,252,58,52,119,201,243,175,50,58,119,50,52,119,111,103,34,60,119,95,62,8,6,3,205,118,96,60,16,250,58,51,119,95,60,40,43,243,237,115,140,119,49,14,127,205,126,96,205,147,96,62,138,6,5,30,0,205,108,96,60,16,250,33,0,152,1,0,128,113,35,16,252,205,135,96,237,123,140,119,62,16,6,9,30,0,205,72,96,198,16,0,205,72,96,198,16,29,205,72,96,28,214,31,16,236,175,95,6,8,205,72,96,60,16,250,201,205,74,101,62,14,30,32,195,72,96,205,214,102,58,58,119,183,200,6,5,58,51,119,95,60,32,9,217,221,25,217,16,250,195,66,102,237,115,140,119,49,14,127,205,126,96,197,205,147,96,193,62,138,217,203,29,217,48,38,221,94,57,221,115,0,28,29,40,54,245,221,94,15,205,108,96,214,138,135,198,128,221,94,11,205,108,96,60,221,94,12,205,108,96,241,24,26,8,221,126,57,183,40,10,221,113,0,121,183,40,6,61,32,3,8,24,6,8,30,0,205,108,96,60,217,221,25,217,16,179,205,135,96,237,123,140,119,58,52,119,6,9,254,17,40,2,6,6,62,16,217,203,24,203,28,217,48,42,221,94,57,221,115,0,28,29,40,67,221,94,11,205,72,96,198,16,245,221,126,12,221,182,40,95,241,205,72,96,221,94,15,198,16,205,72,96,214,32,24,35,8,221,126,57,183,40,10,221,113,0,121,183,40,6,61,32,3,8,24,15,8,30,0,205,72,96,198,16,245,241,205,72,96,214,16,60,217,221,25,217,16,164,58,52,119,254,17,200,217,203,28,217,48,9,221,126,57,221,119,0,195,85,108,221,126,57,183,200,221,113,0,13,200,30,32,62,14,205,72,96,175,50,139,119,201,243,58,58,119,183,200,229,197,217,17,62,0,193,225,217,33,59,119,126,43,119,221,33,176,122,6,3,62,8,22,0,217,203,29,217,48,37,221,94,57,221,115,0,20,28,29,40,52,245,221,94,15,205,118,96,214,8,135,221,94,11,205,118,96,60,221,94,12,205,118,96,241,24,26,8,221,126,57,183,40,10,221,113,0,121,183,40,6,61,32,3,8,24,6,8,30,0,205,118,96,60,217,221,25,217,16,180,20,21,200,62,6,237,91,77,119,205,118,96,60,90,205,118,96,62,11,237,91,79,119,205,118,96,60,90,195,118,96,126,35,254,77,192,126,35,254,71,192,126,35,254,83,192,126,35,254,65,32,2,62,51,214,48,87,126,35,214,48,135,135,135,135,95,126,214,48,179,95,33,23,3,237,82,216,175,201,217,203,1,16,4,6,8,78,35,217,201,95,58,0,96,183,87,123,200,58,235,251,162,123,192,237,115,180,103,49,0,128,205,183,103,49,0,0,201,254,72,216,254,88,56,3,62,48,201,214,72,135,95,22,0,33,212,103,25,126,35,102,111,17,190,103,213,233,30,104,48,104,185,101,245,103,247,103,250,103,253,103,0,104,3,104,6,104,9,104,12,104,15,104,56,104,67,104,64,104,201,175,1,62,1,1,62,2,1,62,3,1,62,4,1,62,5,1,62,6,1,62,7,1,62,8,1,62,9,245,205,185,101,241,42,2,96,17,12,0,25,233,33,0,128,205,96,103,192,17,0,128,33,255,255,6,255,195,119,98,58,54,119,183,200,61,24,13,58,54,119,254,15,208,60,17,62,16,17,62,17,6,1,195,185,96,0,237,67,71,119,17,64,56,33,0,0,62,16,203,35,203,18,237,106,237,66,56,3,28,24,1,9,61,32,239,203,35,203,18,33,64,255,221,33,144,119,1,0,192,175,25,63,56,10,60,213,17,128,1,237,82,209,24,244,129,79,221,113,0,221,35,16,232,201,205,169,105,200,71,58,57,119,183,120,192,237,115,140,119,49,14,127,42,73,119,35,124,181,34,73,119,32,7,42,75,119,35,34,75,119,175,50,82,119,71,33,176,122,205,182,105,4,33,238,122,205,182,105,4,33,44,123,205,182,105,58,51,119,111,60,40,67,219,168,71,230,63,246,0,211,168,253,111,58,255,255,47,79,230,207,246,0,95,120,230,207,246,0,87,120,211,168,217,6,3,33,106,123,205,182,105,4,33,168,123,205,182,105,4,33,230,123,205,182,105,4,33,36,124,205,182,105,4,33,98,124,205,182,105,58,50,119,60,40,73,6,8,33,160,124,205,182,105,4,33,222,124,205,182,105,4,33,28,125,205,182,105,4,33,90,125,205,182,105,4,33,152,125,205,182,105,4,33,214,125,205,182,105,4,58,52,119,254,15,32,2,6,128,33,20,126,205,182,105,4,33,82,126,205,182,105,4,33,144,126,205,182,105,237,123,140,119,58,82,119,183,40,58,58,52,119,71,253,111,14,32,221,33,176,122,17,62,0,221,126,0,183,40,5,221,126,22,161,79,221,25,16,241,12,13,40,24,33,55,119,52,253,69,221,33,176,122,221,126,0,183,40,4,221,203,22,174,221,25,16,242,58,56,119,95,58,55,119,87,58,58,119,183,201,126,183,200,217,111,8,45,8,217,229,221,225,34,84,119,35,94,35,86,27,229,114,43,115,122,179,194,243,105,221,203,22,126,32,30,221,203,22,222,203,120,32,28,120,254,8,56,5,205,114,117,24,8,221,203,16,198,221,54,41,0,203,120,32,6,205,198,115,205,250,116,225,35,94,35,86,27,123,178,114,43,115,192,221,203,16,142,35,35,126,35,102,111,34,158,117,205,35,106,42,158,117,221,117,5,221,116,6,201,205,156,117,254,64,218,67,106,33,35,106,229,183,250,36,115,135,95,22,0,33,108,106,25,126,35,102,111,205,156,117,233,79,205,171,113,121,203,120,194,92,113,230,15,221,119,58,254,12,210,151,113,221,78,22,221,113,59,205,114,114,12,242,121,106,213,235,221,110,7,221,102,8,237,82,235,209,40,22,229,213,205,225,112,209,225,221,117,7,221,116,8,221,115,24,221,114,25,205,112,116,217,126,217,254,64,221,203,22,190,194,152,106,221,203,22,254,12,250,211,106,221,203,22,230,205,234,112,221,203,16,94,202,211,106,58,53,119,183,192,58,54,119,221,134,18,254,8,48,23,58,81,119,95,62,13,211,160,8,32,3,123,211,161,8,58,54,119,198,16,221,134,18,195,29,112,221,126,16,203,127,194,123,112,221,110,43,221,102,44,124,181,194,211,110,221,126,23,195,29,112,184,107,229,107,62,108,56,108,239,109,72,108,243,109,4,110,47,110,51,110,66,108,84,110,96,110,162,110,219,109,225,109,205,109,209,109,179,109,30,109,253,108,241,108,235,108,177,108,191,108,201,108,165,108,153,108,138,108,180,107,73,110,215,109,208,107,204,107,192,107,174,107,160,107,111,107,127,107,83,117,83,117,83,117,83,117,83,117,83,117,83,117,83,117,83,117,83,117,83,117,83,117,83,117,83,117,83,117,83,117,83,117,83,117,83,117,83,117,83,117,83,117,83,117,83,117,83,117,205,156,117,60,200,33,136,122,17,62,0,25,61,32,249,203,214,24,237,205,184,107,221,203,22,86,32,19,205,184,107,221,54,3,1,221,54,4,0,203,120,202,151,113,195,154,113,221,203,22,150,201,221,110,7,221,102,8,205,112,116,205,19,113,24,10,33,62,119,52,24,4,33,56,119,52,42,158,117,43,34,158,117,201,111,38,0,17,63,119,25,205,156,117,119,201,50,142,119,201,111,58,142,119,133,111,38,0,41,17,176,121,25,126,35,102,111,34,60,119,201,111,205,156,117,103,34,71,119,42,158,117,17,144,119,175,197,6,48,78,35,60,203,17,56,1,61,203,17,210,5,108,60,18,19,60,203,17,56,1,61,203,17,210,19,108,60,18,19,60,203,17,56,1,61,203,17,210,33,108,60,18,19,60,203,17,56,1,61,203,17,210,47,108,60,18,19,16,196,193,34,158,117,201,221,119,60,205,156,117,221,119,61,201,205,184,107,195,105,117,79,230,224,7,7,7,95,121,230,15,205,170,115,33,47,126,14,3,58,54,119,221,134,18,95,135,135,135,135,87,245,126,230,15,131,254,16,95,56,2,30,15,241,56,6,126,230,240,130,48,2,62,240,179,95,62,57,145,205,72,96,35,13,32,209,201,87,205,156,117,95,120,254,3,122,218,118,96,195,72,96,221,203,40,174,230,1,200,221,203,40,238,201,221,203,19,190,230,1,200,221,203,19,254,201,183,32,4,221,203,22,246,79,205,142,117,200,113,201,205,145,117,200,126,61,192,35,24,28,42,158,117,183,32,11,221,203,22,238,62,1,50,82,119,24,5,43,53,35,40,6,94,35,86,25,24,2,35,35,34,158,117,201,221,119,27,195,19,113,221,119,34,205,156,117,221,119,35,195,19,113,221,203,16,150,221,203,19,254,221,119,27,205,156,117,60,221,119,30,205,156,117,221,119,28,205,156,117,221,119,32,195,19,113,225,230,15,205,114,114,221,115,24,221,114,25,229,205,112,116,205,225,112,221,94,21,213,205,156,117,254,64,56,16,254,208,48,5,205,51,106,24,240,230,7,221,119,21,24,233,209,245,221,78,21,33,0,0,120,254,8,56,15,121,147,40,11,48,2,237,68,17,173,254,25,61,32,252,241,227,229,79,221,94,22,253,99,221,115,59,230,15,221,119,58,205,114,114,229,205,171,113,221,110,3,221,102,4,221,117,51,221,116,52,209,225,175,221,119,53,221,119,54,237,82,48,6,25,235,198,1,237,82,221,119,42,221,203,16,206,209,25,221,117,55,221,116,56,253,76,195,136,106,79,230,127,221,119,28,221,203,16,214,221,203,19,254,221,203,27,134,203,121,200,221,203,27,198,201,221,119,38,201,221,119,9,205,156,117,221,119,10,201,221,126,21,60,24,4,221,126,21,61,205,184,107,254,8,208,221,119,21,201,221,119,20,201,221,134,23,254,16,56,7,203,127,62,15,40,1,175,195,74,115,87,230,224,7,7,7,95,122,230,31,203,103,40,2,246,224,79,29,250,31,110,28,205,139,115,24,13,28,213,197,205,139,115,193,209,123,254,4,32,243,195,85,108,221,119,40,201,33,240,120,135,95,22,0,25,94,35,86,213,205,56,113,209,115,35,114,195,196,117,205,56,113,54,0,35,54,0,195,196,117,50,81,119,221,203,16,222,221,54,23,15,201,33,79,119,95,205,156,117,87,115,35,114,58,53,119,183,192,62,11,205,118,96,60,90,195,118,96,22,0,95,33,20,119,25,126,38,246,104,4,5,40,5,7,203,4,16,251,69,111,58,78,119,164,181,50,78,119,95,58,53,119,183,192,62,7,24,11,50,77,119,95,58,53,119,183,192,62,6,211,160,123,211,161,201,221,126,16,203,127,194,123,112,221,110,43,221,102,44,124,181,194,211,110,33,83,119,126,183,200,53,221,126,23,195,29,112,221,78,47,221,94,48,22,0,25,221,126,45,183,40,15,221,126,46,183,196,219,111,221,53,45,192,221,54,46,0,123,145,32,6,221,126,39,195,20,112,126,28,35,254,224,48,116,254,160,210,145,111,254,128,48,120,254,96,202,196,111,254,64,202,214,111,254,32,210,161,111,254,16,40,71,254,17,40,14,254,18,40,32,221,119,39,221,54,45,1,195,17,112,213,86,35,94,35,120,214,3,63,48,2,254,5,212,143,108,209,28,28,195,208,111,78,35,28,213,229,120,254,8,121,48,2,237,68,95,7,159,87,221,110,11,221,102,12,25,205,112,116,225,209,24,107,126,28,35,213,229,95,205,59,113,35,205,17,118,225,209,24,90,230,15,221,119,39,86,221,114,45,28,195,17,112,205,187,118,48,72,230,31,213,205,162,110,209,24,63,205,187,118,48,58,230,3,229,213,205,122,110,209,225,24,47,230,15,87,221,150,39,221,119,14,242,175,111,237,68,221,119,13,126,28,221,119,45,221,119,46,221,54,49,0,221,126,39,195,17,112,221,110,43,221,102,44,221,94,50,22,0,25,221,115,48,195,241,110,221,115,50,24,245,229,213,197,221,126,49,221,134,13,111,221,78,46,38,0,6,8,41,124,145,56,2,44,103,16,247,221,116,49,221,126,14,183,242,3,112,125,237,68,111,221,126,39,133,221,119,39,193,205,20,112,209,225,201,221,115,48,221,134,23,214,15,210,29,112,175,221,119,26,33,54,119,150,221,150,18,242,43,112,175,95,120,254,8,56,16,123,238,15,221,182,41,95,221,115,15,62,40,128,195,68,96,221,115,15,254,3,56,39,8,32,46,8,198,135,253,99,217,38,152,111,253,125,211,168,123,50,255,255,122,211,168,253,124,119,253,125,211,168,121,50,255,255,120,211,168,217,201,198,8,211,160,8,32,3,123,211,161,8,201,103,205,146,112,221,115,44,33,0,0,84,221,126,23,60,25,61,32,252,124,195,29,112,221,94,44,203,103,40,17,123,221,134,46,48,2,62,255,254,255,95,192,124,238,48,24,42,203,111,40,21,123,221,94,48,221,150,47,56,3,187,48,1,123,187,95,192,124,238,96,24,17,203,119,40,17,123,221,150,49,48,1,175,183,95,192,124,230,143,221,119,16,201,123,221,150,50,48,1,175,95,201,42,84,119,17,30,0,25,24,59,221,126,16,203,127,32,21,221,203,16,134,175,221,54,45,1,221,119,46,221,119,48,221,119,39,195,19,113,230,14,246,144,221,119,16,221,126,45,221,119,44,221,203,19,126,200,42,84,119,17,27,0,25,126,35,134,35,119,35,126,35,203,63,60,119,35,126,35,119,35,94,35,86,35,115,35,114,201,221,94,17,22,0,120,254,3,33,240,120,56,19,254,8,33,48,121,56,10,98,107,41,41,25,17,80,120,25,201,203,35,203,35,25,201,230,31,221,54,58,32,40,54,87,221,203,19,126,33,139,119,32,16,126,170,246,32,95,62,14,205,68,96,123,178,119,195,136,113,62,32,119,95,62,14,205,68,96,122,246,32,95,62,14,221,115,58,221,203,22,230,195,68,96,254,13,200,221,203,22,190,221,203,59,190,221,54,1,1,221,54,2,0,201,203,105,40,107,203,120,32,7,203,97,221,126,61,32,3,205,156,117,197,71,221,78,60,17,0,0,38,119,62,143,129,111,48,1,36,94,121,128,79,56,22,254,193,48,18,4,5,40,14,38,119,198,143,111,48,1,36,126,147,95,195,18,114,58,79,120,71,147,95,121,214,192,79,40,5,254,193,218,4,114,120,131,95,48,240,20,195,240,113,38,119,198,143,111,48,1,36,123,134,95,48,1,20,221,113,60,193,235,195,56,114,203,120,32,13,203,97,40,9,221,110,60,221,102,61,195,56,114,33,0,0,84,205,156,117,95,25,254,255,40,247,221,117,3,221,116,4,221,126,20,254,8,32,10,120,254,8,210,107,114,35,195,107,114,35,183,40,24,43,41,41,41,235,33,0,0,25,61,194,91,114,41,23,41,23,108,103,181,194,107,114,44,221,117,1,221,116,2,201,135,95,22,0,120,254,8,33,91,119,48,3,33,115,119,25,126,35,102,111,120,254,8,221,126,21,56,46,135,180,103,221,203,40,230,221,126,10,183,202,208,114,197,229,33,241,118,25,94,35,86,98,107,14,8,31,48,1,25,203,35,203,18,13,32,245,81,92,225,193,25,195,208,114,221,94,9,221,86,10,25,183,93,84,40,8,203,60,203,29,61,194,200,114,213,221,126,38,95,7,159,87,25,209,201,229,197,42,84,119,17,51,0,25,78,35,70,35,94,35,86,35,126,35,102,111,235,25,41,41,41,235,33,0,0,62,13,203,35,203,18,237,106,237,66,56,4,28,195,10,115,9,61,194,251,114,221,117,53,221,116,54,221,182,42,32,5,103,111,237,82,235,193,225,25,195,112,116,254,255,202,83,117,254,224,48,68,254,208,48,58,254,192,48,21,203,120,40,9,225,79,205,181,113,121,195,92,113,230,31,221,119,17,195,196,117,230,15,221,119,23,203,120,32,5,221,203,16,158,201,238,15,79,135,135,135,135,177,33,47,126,119,35,119,35,119,195,85,108,230,7,221,119,21,201,230,3,195,122,110,38,119,62,15,131,111,48,1,36,126,87,230,3,38,126,198,47,111,208,36,201,205,118,115,126,47,230,15,203,122,40,8,126,47,230,240,31,31,31,31,129,254,16,56,7,203,127,62,15,40,1,175,221,119,23,238,15,79,205,118,115,30,240,203,18,48,8,121,135,135,135,135,79,30,15,126,163,177,119,201,221,126,16,203,95,32,53,203,71,202,179,110,203,127,40,13,203,119,202,123,112,230,143,221,119,16,195,123,112,221,126,40,183,32,3,175,24,19,61,221,150,41,40,4,221,52,41,201,221,119,41,221,126,26,183,200,61,195,29,112,221,203,16,70,200,175,195,29,112,221,53,29,192,221,126,28,221,119,29,205,74,116,221,94,36,221,86,37,123,178,32,11,221,126,33,95,7,159,87,25,195,71,116,221,110,24,221,102,25,25,221,117,24,221,116,25,221,126,21,183,40,7,203,60,203,29,61,32,249,195,112,116,221,53,31,192,221,126,30,221,119,31,221,126,33,237,68,221,119,33,120,254,8,208,175,221,150,36,221,119,36,79,221,158,37,145,221,119,37,201,120,254,8,56,47,203,68,40,11,125,214,89,56,15,17,83,1,195,140,116,125,214,172,48,4,17,173,254,25,221,117,11,221,116,12,124,221,182,40,95,62,24,128,205,68,96,214,16,93,195,68,96,254,3,56,55,135,198,122,235,38,152,111,217,253,125,211,168,123,50,255,255,122,211,168,217,123,221,190,11,40,1,119,122,221,190,12,40,2,44,119,217,253,125,211,168,121,50,255,255,120,211,168,217,221,115,11,221,114,12,201,135,95,60,87,8,32,12,123,211,160,125,211,161,122,211,160,124,211,161,221,117,11,221,116,12,8,201,221,110,11,221,102,12,221,126,16,203,79,194,219,114,221,203,19,126,200,203,87,202,11,116,221,126,27,183,221,94,28,32,34,221,110,24,221,102,25,22,0,203,35,203,26,25,221,117,24,221,116,25,221,126,21,183,40,28,203,60,203,29,61,32,249,24,19,22,0,221,126,21,238,7,40,9,229,98,107,25,61,32,252,235,225,25,195,112,116,241,175,221,119,0,221,119,57,221,203,22,238,60,50,82,119,33,58,119,53,35,53,203,120,32,26,120,254,8,56,17,221,203,40,166,221,126,40,221,182,12,95,120,198,24,195,68,96,175,195,29,112,62,14,30,32,195,68,96,205,156,117,95,205,156,117,87,179,42,158,117,25,201,217,33,0,0,126,35,34,158,117,217,201,120,254,3,208,26,230,96,200,7,7,7,213,245,205,122,110,241,209,61,200,26,230,31,213,205,162,110,209,201,221,203,16,190,205,56,113,94,35,86,123,178,32,3,17,48,119,205,167,117,26,19,183,242,252,117,229,197,235,237,91,84,119,123,198,44,95,48,1,20,175,18,19,1,6,0,237,176,221,203,16,254,193,225,24,21,26,183,32,3,87,95,27,221,119,47,19,221,115,43,221,114,44,221,54,50,0,120,254,3,216,35,94,35,86,235,254,8,56,33,19,26,221,119,41,87,183,32,15,124,181,40,11,175,94,205,72,96,35,60,254,8,56,246,221,126,15,230,15,178,195,29,112,95,124,181,200,123,197,17,206,126,205,122,118,214,3,203,87,40,1,61,15,15,15,95,22,152,217,253,125,211,168,123,50,255,255,122,211,168,217,33,206,126,205,122,118,217,253,125,211,168,121,50,255,255,120,211,168,217,193,201,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,237,160,201,79,120,254,3,121,201,172,0,182,0,194,0,205,0,217,0,230,0,244,0,2,1,17,1,34,1,51,1,69,1,93,13,156,12,231,11,60,11,155,10,2,10,115,9,235,8,107,8,242,7,128,7,20,7,10,0,12,0,11,0,12,0,13,0,14,0,14,0,15,0,17,0,17,0,18,0,17,0,32,5,80,5,192,1,0,1,130,18,129,9,8,1,0,0,128,132,136,140,1,129,133,137,141,2,130,134,138,142,3,131,135,139,143,79,80,76,76,32,0,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,237,123,6,0,175,205,240,27,14,111,205,5,0,120,254,2,218,0,0,1,107,128,33,140,30,17,128,0,205,5,0,194,234,27,33,128,0,126,35,183,40,48,254,32,40,247,254,47,32,243,126,35,205,32,28,254,90,202,172,25,254,67,202,152,25,254,68,202,62,25,254,75,202,129,25,254,83,202,3,25,254,66,202,39,25,62,4,205,240,27,58,160,30,183,62,5,204,240,27,195,233,27,205,13,28,56,23,217,95,230,3,198,193,111,38,252,126,179,217,250,25,25,230,3,50,158,30,195,194,24,62,7,205,240,27,195,233,27,205,13,28,56,10,254,10,48,6,50,159,30,195,194,24,62,6,205,240,27,195,233,27,126,35,229,205,32,28,254,65,48,8,62,11,205,240,27,195,233,27,254,73,48,244,214,64,71,197,14,24,205,5,0,193,72,125,31,16,252,48,227,121,50,253,242,198,64,50,127,30,50,160,30,62,12,205,240,27,225,126,254,58,194,194,24,35,195,194,24,205,13,28,56,10,254,4,48,6,50,157,30,195,194,24,62,8,205,240,27,195,233,27,17,0,240,175,205,202,255,183,62,10,40,2,62,9,205,240,27,195,233,27,126,183,40,40,17,146,32,235,54,40,35,54,34,35,26,19,183,40,8,254,34,40,247,119,35,24,243,54,34,35,54,41,35,119,35,17,146,32,183,237,82,34,88,32,33,151,30,17,128,0,1,107,128,205,5,0,33,132,30,17,128,0,14,108,205,5,0,17,2,4,205,202,255,17,0,63,1,48,0,237,176,237,123,6,0,17,0,240,175,205,202,255,183,202,130,26,17,0,62,1,15,0,237,176,205,3,62,205,19,96,205,6,62,42,73,243,229,17,250,30,26,182,40,14,26,190,35,19,40,246,62,3,205,240,27,195,233,27,35,126,35,102,111,34,73,243,34,74,252,62,1,205,240,27,225,17,37,0,25,17,159,253,205,41,28,17,209,253,205,41,28,17,202,255,205,41,28,35,35,35,70,35,126,35,229,6,0,205,3,63,225,17,15,0,25,70,35,35,126,35,197,229,6,0,205,3,63,225,193,16,243,195,69,32,175,50,161,30,58,159,30,60,50,66,31,60,95,33,161,30,22,0,205,2,28,218,207,27,119,35,20,29,32,244,122,61,50,66,31,33,161,30,126,50,50,31,35,126,50,52,31,17,68,31,1,10,0,237,176,58,68,243,50,49,31,50,51,31,79,230,3,7,7,95,7,7,179,50,55,31,121,230,12,95,7,7,179,50,56,31,42,31,63,34,253,31,42,37,63,34,1,32,42,34,63,34,21,32,42,40,63,34,25,32,17,31,31,33,159,253,205,41,28,33,209,253,205,41,28,33,202,255,205,41,28,42,73,243,34,8,31,17,80,1,213,237,82,34,73,243,34,74,252,229,17,250,30,237,82,68,77,33,172,30,94,35,86,35,123,178,40,15,229,98,107,126,35,102,111,9,235,115,35,114,225,24,233,205,33,63,245,58,50,31,205,30,63,33,13,1,17,0,96,237,75,9,1,237,67,53,31,237,176,58,157,30,50,0,96,58,158,30,50,1,96,42,73,243,17,22,0,25,34,2,96,205,16,96,221,34,59,31,253,34,61,31,237,67,63,31,34,57,31,33,162,30,58,66,31,71,126,35,205,30,63,175,50,0,64,16,245,241,205,30,63,209,193,213,33,250,30,237,176,225,17,16,0,25,34,204,255,35,35,35,34,211,253,35,35,35,34,161,253,58,68,243,103,46,247,34,202,255,34,159,253,34,209,253,62,201,50,206,255,50,163,253,50,213,253,62,2,205,240,27,195,69,32,20,21,40,17,33,161,30,66,126,35,197,229,6,0,205,3,63,225,193,16,243,62,222,195,234,27,175,71,14,98,195,5,0,60,71,17,47,28,26,19,254,36,32,250,16,248,14,9,195,5,0,229,213,175,71,60,205,0,63,209,225,201,126,35,205,32,28,214,48,216,254,10,63,208,214,7,216,254,16,63,201,254,97,216,254,123,208,214,32,201,1,5,0,237,176,201,36,13,10,77,71,83,68,82,86,32,118,101,114,115,105,111,110,32,51,46,49,56,13,10,67,111,112,121,114,105,103,104,116,40,99,41,32,49,57,57,49,45,57,52,32,98,121,32,65,105,110,13,10,67,111,112,121,114,105,103,104,116,40,99,41,32,49,57,57,55,32,32,32,32,98,121,32,71,73,71,65,77,73,88,13,10,77,111,100,105,102,105,101,100,32,98,121,32,71,111,114,105,112,111,110,32,38,32,73,110,102,108,117,101,110,122,97,32,40,71,73,71,65,77,73,88,41,13,10,13,10,36,82,101,108,101,97,115,101,100,46,13,10,13,10,36,73,110,115,116,97,108,108,101,100,46,13,10,13,10,36,67,97,110,39,116,32,114,101,108,101,97,115,101,46,13,10,36,73,110,118,97,108,105,100,32,111,112,116,105,111,110,13,10,36,85,115,97,103,101,58,77,71,83,68,82,86,32,60,111,112,116,105,111,110,62,13,10,32,32,32,32,32,32,47,90,32,46,46,46,46,46,32,73,110,115,116,97,108,108,44,82,101,108,101,97,115,101,13,10,32,32,32,32,32,32,47,67,32,46,46,46,46,46,32,73,110,115,116,97,108,108,32,99,104,101,99,107,13,10,32,32,32,32,32,32,47,68,120,32,46,46,46,46,32,83,101,116,32,98,111,111,116,32,100,114,105,118,101,40,65,58,45,41,13,10,32,32,32,32,32,32,47,75,120,32,46,46,46,46,32,83,101,116,32,99,111,110,116,114,111,108,101,32,107,101,121,32,99,111,100,101,40,48,45,51,41,13,10,32,32,32,32,32,32,47,83,120,32,46,46,46,46,32,83,101,116,32,83,67,67,32,115,108,111,116,32,110,117,109,98,101,114,40,48,45,70,41,13,10,32,32,32,32,32,32,47,66,120,32,46,46,46,46,32,65,108,108,111,99,97,116,101,32,109,97,110,121,32,100,97,116,97,32,115,101,103,109,101,110,116,115,40,48,45,57,41,13,10,36,73,110,118,97,108,105,100,32,115,101,103,109,101,110,116,46,13,10,36,73,110,118,97,108,105,100,32,115,108,111,116,32,110,117,109,98,101,114,46,13,10,36,73,110,118,97,108,105,100,32,107,101,121,32,99,111,100,101,46,13,10,36,77,71,83,68,82,86,32,105,110,115,116,97,108,108,101,100,46,13,10,36,77,71,83,68,82,86,32,110,111,116,32,105,110,115,116,97,108,108,101,100,46,13,10,36,73,110,118,97,108,105,100,32,100,114,105,118,101,32,110,97,109,101,46,13,10,36,66,111,111,116,32,100,114,105,118,101,32,105,115,32,63,58,13,10,36,80,82,79,71,82,65,77,0,80,65,82,65,77,69,84,69,82,83,0,83,72,69,76,76,0,2,255,0,0,255,255,255,255,255,255,255,255,255,255,255,11,31,14,31,17,31,20,31,23,31,26,31,29,31,81,31,84,31,87,31,93,31,97,31,104,31,107,31,111,31,117,31,125,31,130,31,145,31,148,31,154,31,169,31,175,31,180,31,185,31,194,31,197,31,203,31,216,31,229,31,235,31,238,31,241,31,244,31,248,31,4,32,7,32,10,32,0,0,35,77,71,83,68,82,86,32,118,51,46,49,55,0,0,0,195,134,31,195,101,31,195,78,31,195,192,31,195,201,31,195,172,31,195,153,31,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,77,71,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,255,255,255,255,255,255,255,255,255,255,243,237,115,35,32,49,69,32,205,207,31,205,31,96,205,3,32,237,123,35,32,24,186,243,237,115,35,32,49,69,32,245,58,65,31,183,40,11,205,207,31,241,205,46,96,245,205,3,32,241,237,123,35,32,24,158,245,122,254,240,40,3,241,24,154,241,33,16,31,1,49,31,62,255,201,33,66,31,190,63,216,200,35,119,35,95,22,0,25,126,50,52,31,201,217,8,205,192,31,217,8,205,190,31,217,8,205,201,31,217,8,201,221,233,243,205,20,32,34,29,32,24,42,243,42,29,32,24,44,58,255,255,47,103,230,195,79,58,56,31,177,50,255,255,219,168,111,230,195,79,58,55,31,177,211,168,34,33,32,205,20,32,34,31,32,58,50,31,111,58,52,31,103,125,205,0,0,124,195,0,0,42,31,32,205,251,31,42,33,32,124,50,255,255,125,211,168,201,205,0,0,111,205,0,0,103,201,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,42,88,32,17,56,0,25,68,77,33,90,32,17,0,128,213,237,176,201,1,0,58,247,255,245,38,0,205,36,0,241,38,64,205,36,0,175,33,31,244,34,96,248,33,35,244,34,31,244,119,33,44,245,34,33,244,119,33,44,244,34,98,248,33,48,128,195,1,70,58,95,83,89,83,84,69,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,62,14,211,124,62,32,211,125,205,16,96,62,1,221,119,0,221,119,1,221,34,240,127,175,50,254,191,62,63,50,0,144,17,0,2,6,255,96,104,205,22,96,62,127,211,64,175,211,65,211,66,211,67,211,68,201,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,205,31,96,221,42,240,127,221,126,8,254,0,32,4,62,1,211,65,221,126,5,211,66,221,126,10,211,67,221,126,11,211,68,175,221,119,10,221,119,11,201,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,77,80,75,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,195,22,64,195,4,69,245,229,121,135,198,45,111,206,64,149,103,126,35,102,111,34,43,64,225,241,195,0,0,79,64,142,64,149,64,161,64,167,64,175,64,181,64,193,64,220,64,245,64,20,65,25,65,38,65,44,65,48,65,85,65,106,65,175,50,48,93,33,71,93,17,72,93,1,26,0,119,237,176,205,202,66,205,23,67,205,136,67,195,89,65,77,80,75,32,80,76,65,89,69,82,32,32,32,118,101,114,32,49,46,48,54,32,32,32,98,121,32,75,45,75,65,90,13,10,36,205,153,65,33,58,89,201,175,50,48,93,205,121,68,205,3,67,175,201,123,50,47,93,175,201,122,230,15,50,76,89,175,201,123,50,58,93,175,201,58,72,89,71,42,73,89,58,75,89,95,201,175,50,60,93,60,50,47,93,62,201,50,4,69,205,14,69,58,60,93,183,40,247,175,50,4,69,201,79,58,75,93,254,8,63,216,95,22,0,33,76,93,25,25,112,35,113,60,183,50,75,93,201,183,32,4,58,75,93,201,71,58,75,93,184,56,14,120,61,135,95,22,0,33,76,93,25,70,35,126,201,175,71,201,175,50,75,93,201,17,36,0,25,17,92,93,1,6,0,237,176,201,62,1,50,48,93,201,50,57,89,201,42,73,89,58,75,89,221,33,102,89,17,57,0,6,17,14,255,31,203,28,203,29,48,7,221,126,54,185,48,1,79,221,25,16,238,121,201,221,33,58,89,1,6,1,58,73,93,103,58,74,93,111,17,107,64,62,0,201,221,33,102,89,6,17,75,17,57,0,203,57,203,28,203,29,221,126,53,203,111,56,6,32,17,203,239,24,4,40,11,203,175,203,199,221,119,53,221,54,45,255,221,25,16,222,201,229,245,205,202,66,241,225,34,79,89,50,131,86,50,78,89,183,40,28,175,103,111,50,114,86,50,175,86,34,115,86,34,176,86,50,133,86,205,95,93,245,205,3,87,245,24,23,33,114,86,17,175,86,54,126,62,119,18,62,35,35,19,119,18,62,201,35,19,119,18,205,207,85,42,79,89,17,61,93,1,6,0,205,188,86,33,61,93,17,107,64,6,3,205,46,68,62,1,194,199,66,14,3,205,20,68,33,6,1,175,60,237,82,218,199,66,33,150,0,237,82,210,199,66,42,79,89,205,114,86,254,26,32,249,205,114,86,254,255,32,11,205,59,87,62,3,218,199,66,205,114,86,79,6,0,11,17,59,89,205,188,86,217,33,115,89,58,59,89,254,9,40,21,254,6,40,5,62,2,195,199,66,6,7,205,209,68,1,57,0,9,9,24,5,6,9,205,209,68,6,3,205,209,68,6,5,205,209,68,217,205,114,86,95,205,114,86,87,237,83,81,89,205,114,86,95,205,114,86,87,237,83,83,89,205,114,86,95,205,114,86,87,237,83,85,89,62,15,50,76,89,62,1,50,47,93,62,255,50,70,89,205,121,68,205,3,67,205,46,85,120,50,72,89,34,73,89,123,50,75,89,175,8,58,131,86,183,40,11,241,205,209,86,205,250,68,241,205,92,93,8,201,183,24,233,33,59,89,17,60,89,1,11,4,54,0,237,176,17,57,0,221,33,102,89,6,17,175,221,54,10,120,221,54,17,36,254,9,48,4,221,54,50,63,221,25,60,16,235,33,38,0,34,64,89,33,57,0,34,66,89,201,6,144,22,0,120,61,90,205,217,85,16,248,30,31,62,143,205,217,85,201,33,104,67,205,79,68,56,27,33,116,67,205,79,68,48,19,245,245,33,246,127,205,12,0,246,1,95,241,205,20,0,205,250,68,241,50,73,93,245,33,45,0,58,193,252,205,12,0,205,250,68,254,3,48,8,33,211,124,34,155,85,24,16,247,128,131,1,205,250,68,183,40,238,33,24,5,34,155,85,241,201,17,24,64,33,128,67,6,8,205,55,68,201,17,28,64,33,132,67,6,4,205,55,68,201,65,80,82,76,79,80,76,76,33,157,67,205,79,68,50,74,93,205,165,67,122,50,233,85,123,50,242,85,201,121,205,165,67,205,208,67,201,71,230,3,15,15,79,15,15,177,79,219,168,95,230,15,177,87,243,211,168],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+1126808);allocate([58,255,255,47,230,207,79,123,211,168,205,250,68,120,230,12,7,7,177,95,203,120,201,219,168,71,243,122,211,168,58,255,255,40,1,47,79,123,50,255,255,33,0,144,17,0,152,126,8,54,0,235,126,47,119,190,47,119,235,55,40,14,54,63,235,126,47,119,190,47,119,235,55,32,1,175,63,8,119,8,121,50,255,255,120,211,168,205,250,68,201,235,33,0,0,26,19,214,48,254,10,48,12,41,41,41,41,133,111,140,149,103,13,32,236,235,201,26,19,190,35,192,16,249,175,201,235,197,213,121,205,12,0,205,250,68,209,193,235,190,35,19,55,63,192,16,235,175,55,201,14,128,6,16,22,252,229,213,197,121,230,3,198,193,95,26,203,127,32,4,121,230,3,79,197,17,109,68,213,233,193,121,193,209,225,216,12,16,223,175,61,201,14,255,22,48,6,9,122,205,155,85,20,16,249,14,0,22,0,6,41,122,205,155,85,20,16,249,58,59,89,254,6,32,14,33,195,68,6,7,126,35,78,35,205,155,85,16,247,62,7,30,191,205,195,85,175,6,14,95,254,7,196,195,85,60,16,248,62,7,30,184,205,195,85,201,14,32,22,32,23,80,24,192,38,5,39,5,40,1,120,8,217,205,114,86,79,205,114,86,71,17,0,0,120,177,40,6,235,42,79,89,9,235,123,217,119,35,217,122,217,119,1,56,0,9,8,61,32,217,201,245,58,57,89,183,40,1,251,241,201,0,58,48,93,183,200,243,205,250,68,58,47,93,183,200,242,34,69,71,33,57,93,53,126,184,40,3,56,1,201,175,50,48,93,50,57,93,50,133,86,58,131,86,183,40,8,205,95,93,245,205,3,87,245,175,50,49,93,50,50,93,42,68,89,35,34,68,89,221,33,102,89,221,110,6,221,102,7,124,181,202,182,69,43,221,117,6,221,116,7,58,50,93,183,194,168,84,221,78,2,221,70,3,121,176,40,62,221,94,15,221,86,16,221,110,0,221,102,1,34,52,93,183,237,82,40,42,56,13,235,9,235,42,52,93,183,237,82,48,19,24,13,235,183,237,66,235,42,52,93,183,237,82,56,4,237,91,52,93,221,115,15,221,114,16,221,203,53,198,205,6,71,205,141,75,195,168,84,221,110,8,221,102,9,124,181,40,108,43,221,117,8,221,116,9,221,203,53,102,32,70,221,126,40,71,230,31,254,4,40,60,58,50,93,183,32,44,58,49,93,254,9,56,4,254,12,56,15,120,254,3,40,38,221,54,40,131,221,54,0,0,24,28,221,126,39,230,16,40,234,58,49,93,61,30,0,205,195,85,24,232,62,14,14,32,205,155,85,195,168,84,221,126,55,60,40,10,221,70,0,4,184,40,6,221,112,0,205,6,71,205,141,75,195,168,84,221,110,13,221,102,14,125,180,202,168,84,58,50,93,183,194,113,83,17,62,70,213,205,114,86,254,112,218,114,77,254,128,218,70,78,254,255,202,223,70,254,174,48,230,71,135,198,111,95,206,70,147,87,120,235,78,35,70,235,237,67,108,70,195,0,0,201,183,78,183,78,110,70,110,79,253,79,253,79,12,80,21,80,32,80,67,80,74,80,70,81,203,76,227,76,4,77,145,76,122,81,133,81,140,81,166,81,158,76,182,76,204,81,168,76,175,76,100,82,3,80,192,80,24,81,5,78,25,78,31,78,116,78,133,78,93,77,139,76,217,78,104,80,37,78,132,76,119,76,182,80,93,80,56,78,51,78,46,78,71,145,135,235,79,120,6,0,9,78,35,70,235,237,67,221,70,195,0,0,221,52,54,32,3,221,53,54,205,114,86,95,205,114,86,87,235,124,181,32,6,17,1,0,195,140,84,221,126,18,221,119,17,237,91,79,89,25,201,221,203,53,86,32,25,221,126,22,183,200,71,221,126,28,60,184,40,4,221,119,28,201,221,203,53,214,221,54,29,255,221,126,29,221,190,23,48,5,60,221,119,29,201,175,221,119,29,79,221,126,27,254,9,208,17,108,71,205,203,70,87,60,128,221,119,31,221,78,24,221,70,25,122,183,40,7,33,0,0,237,66,68,77,221,110,32,221,102,33,9,221,117,32,221,116,33,221,203,53,198,201,126,71,156,71,183,71,222,71,245,71,252,71,3,72,18,72,43,72,221,70,31,221,126,26,79,203,63,184,40,8,145,184,40,8,221,126,30,201,62,254,24,2,62,0,221,119,30,201,221,70,31,221,126,26,184,40,8,4,5,40,8,221,126,30,201,62,254,24,2,62,0,221,119,30,201,221,70,31,221,126,26,203,63,184,32,24,237,68,71,221,126,32,47,111,221,126,33,47,103,35,221,117,32,221,116,33,221,203,53,198,221,126,30,201,221,70,31,221,126,26,184,40,4,221,126,30,201,33,0,0,221,117,31,193,195,97,71,33,0,0,193,195,97,71,33,0,0,193,195,97,71,221,70,31,221,126,26,184,40,4,221,126,30,201,193,201,221,70,31,221,126,26,184,40,10,221,126,30,183,200,4,5,192,193,201,62,254,221,119,30,201,221,70,31,221,126,26,184,40,4,221,126,30,201,33,0,0,193,195,97,71,1,219,74,197,221,126,40,203,119,192,203,111,194,78,73,203,127,202,22,73,230,31,221,119,40,183,40,25,61,202,151,72,61,202,169,72,61,202,174,72,61,202,17,73,61,202,91,73,61,202,91,73,201,221,126,38,183,32,9,221,54,40,128,221,54,41,15,201,221,54,41,0,221,54,42,15,221,126,34,221,119,43,221,119,44,195,22,73,221,126,36,221,119,42,221,126,35,221,119,43,221,119,44,195,22,73,221,54,40,66,201,221,203,53,94,32,33,58,49,93,254,9,56,79,221,126,38,183,40,68,221,54,42,0,254,33,48,12,221,126,37,221,119,43,221,119,44,195,22,73,235,221,110,36,221,102,37,43,205,114,86,254,33,48,13,235,205,238,80,221,119,43,221,119,44,195,22,73,198,226,79,6,0,9,221,117,34,221,116,35,235,221,203,53,230,195,91,73,221,119,41,24,7,205,138,85,221,203,53,142,221,54,40,68,201,221,126,44,214,16,71,221,119,44,230,240,192,221,126,43,221,119,44,221,126,42,79,221,126,41,185,48,18,128,185,56,10,221,126,40,60,246,128,221,119,40,121,221,119,41,201,144,56,239,185,56,236,40,234,24,242,221,126,44,61,221,119,44,192,221,54,40,133,201,229,221,110,34,221,102,35,1,98,73,197,205,114,86,254,16,56,125,254,32,218,246,73,254,48,218,66,74,254,224,48,11,17,189,73,254,61,14,48,218,203,70,201,254,255,40,3,195,215,73,205,114,86,95,205,114,86,87,235,125,180,40,6,237,75,79,89,9,201,221,203,53,102,40,10,221,203,53,166,221,54,40,68,24,4,221,54,40,69,221,117,34,221,116,35,193,225,201,28,74,41,74,57,74,65,74,78,74,107,74,32,80,87,74,135,74,149,74,156,74,24,74,17,74,214,224,71,58,49,93,214,6,254,3,210,44,78,205,159,74,120,18,201,230,15,221,119,41,221,54,40,133,195,180,73,230,15,221,119,42,205,114,86,205,238,80,221,119,43,221,119,44,221,54,40,5,205,22,73,195,180,73,221,54,40,133,195,180,73,62,1,24,3,205,114,86,221,119,44,221,54,40,37,195,180,73,205,193,76,210,44,78,205,114,86,95,62,6,205,195,85,201,205,193,76,208,205,21,77,201,201,221,203,19,254,205,70,78,221,203,19,190,201,35,58,49,93,254,9,208,24,7,35,58,49,93,254,12,216,43,221,203,19,254,205,110,79,221,203,19,190,201,205,114,86,79,205,114,86,71,221,94,32,221,86,33,235,9,235,221,115,32,221,114,33,221,203,53,198,201,221,126,53,203,79,194,128,85,246,3,221,119,53,201,221,203,53,142,195,128,85,195,93,80,58,49,93,214,6,135,198,99,95,206,89,147,87,201,205,159,74,26,71,58,76,89,128,221,134,52,214,31,48,1,175,7,7,7,7,238,240,79,221,126,50,71,230,240,185,40,25,120,230,15,177,221,119,50,221,54,45,255,24,12,58,50,93,183,32,82,221,203,53,118,32,198,58,76,89,221,134,41,221,134,39,214,30,48,1,175,221,190,45,200,221,119,45,221,203,53,110,40,1,175,71,58,49,93,254,9,56,11,254,12,48,29,198,255,88,205,195,85,201,198,48,95,120,238,15,79,221,126,50,230,240,177,79,221,113,50,123,205,155,85,201,198,126,88,205,217,85,201,58,76,89,237,68,198,15,230,15,95,7,7,7,7,87,33,54,93,6,3,126,47,230,240,146,48,1,175,79,126,47,230,15,147,48,1,175,177,47,79,62,57,144,205,155,85,35,16,227,201,221,126,19,87,183,32,23,205,128,85,221,126,39,230,16,40,23,58,77,89,95,62,13,221,203,53,110,204,195,85,122,254,2,56,5,214,2,221,119,19,229,205,63,72,221,203,53,70,202,117,76,221,203,53,134,221,94,4,221,86,5,221,110,32,221,102,33,25,221,94,15,221,86,16,25,58,49,93,254,9,56,48,235,122,135,198,119,111,206,88,149,103,78,35,70,35,126,145,237,68,107,205,90,86,183,90,87,96,105,237,82,221,94,56,123,7,159,87,183,237,82,58,49,93,254,12,48,109,24,93,235,122,14,12,6,255,4,145,210,237,75,129,198,106,111,206,88,149,103,78,35,126,145,107,205,90,86,122,129,198,171,111,206,0,149,103,221,94,56,123,7,159,87,25,77,58,49,93,198,16,87,205,155,85,120,230,7,7,180,79,221,126,49,230,32,221,203,53,78,40,8,221,203,53,110,32,2,246,16,177,79,221,113,49,122,198,16,205,155,85,195,117,76,214,9,135,93,205,195,85,60,92,205,195,85,24,35,198,244,135,198,128,87,125,221,190,49,40,8,95,122,221,115,49,205,217,85,124,221,190,50,40,9,95,122,60,221,115,50,205,217,85,225,201,205,114,86,95,205,114,86,87,237,83,97,89,201,205,114,86,221,119,55,201,62,1,50,60,93,201,205,114,86,221,119,10,205,114,86,221,119,11,201,205,114,86,221,134,17,221,119,17,201,205,114,86,221,119,17,201,205,114,86,221,119,21,201,221,126,17,221,119,18,175,221,119,12,201,58,49,93,254,9,63,208,254,12,201,205,193,76,208,205,114,86,95,205,114,86,87,62,11,205,195,85,90,62,12,205,195,85,201,58,49,93,254,9,56,23,254,12,208,71,205,114,86,50,77,89,198,16,221,119,39,120,61,30,16,205,195,85,201,205,114,86,205,193,76,208,205,114,86,95,62,6,205,195,85,205,21,77,201,205,114,86,238,3,30,0,203,79,40,2,30,8,230,1,179,15,95,62,7,205,190,85,79,6,123,58,49,93,214,8,203,0,203,3,61,32,249,121,160,179,95,62,7,205,195,85,201,214,8,6,13,22,255,20,144,210,75,77,128,221,134,17,221,134,21,61,95,71,14,0,201,205,114,86,214,8,6,13,22,255,20,144,48,252,62,13,205,81,77,195,117,77,205,69,77,28,221,115,51,221,126,2,221,182,3,40,8,221,113,0,221,112,1,24,6,221,113,15,221,112,16,122,205,116,82,221,126,19,183,32,62,221,126,20,183,40,56,71,205,114,86,43,254,133,40,47,254,154,40,43,229,33,0,0,25,16,253,203,60,203,29,203,60,203,29,203,60,203,29,124,181,32,3,33,1,0,235,183,237,82,56,7,68,77,225,197,195,219,77,17,0,0,225,1,0,0,197,27,213,221,126,40,230,31,254,4,40,6,221,126,19,183,32,9,205,93,81,205,33,81,195,249,77,221,203,53,198,221,203,53,206,205,101,75,193,209,195,119,84,205,114,86,221,134,39,250,22,78,254,16,56,22,62,15,24,18,175,24,15,221,126,39,60,24,239,221,126,39,61,24,230,205,114,86,221,119,39,201,35,201,221,203,53,246,201,221,203,53,182,201,205,114,86,60,221,119,52,205,159,74,62,15,18,201,71,58,49,93,254,9,208,95,120,230,15,60,221,119,52,61,135,135,135,135,87,221,126,50,230,15,178,79,221,113,50,123,198,48,205,155,85,221,126,19,183,192,205,128,85,201,237,91,68,89,221,115,46,221,114,47,221,126,12,221,119,48,201,221,126,12,245,221,126,48,221,119,12,205,113,82,58,68,89,221,150,46,79,58,69,89,221,158,47,71,235,241,183,237,66,235,40,6,56,12,27,195,140,84,221,190,12,56,3,221,119,12,201,71,58,49,93,95,254,9,208,120,214,128,79,221,126,49,230,223,13,12,40,2,246,32,79,221,113,49,123,198,32,205,155,85,201,205,114,86,95,62,255,183,8,24,11,175,8,205,114,86,95,123,60,221,119,52,229,235,38,0,68,77,41,41,41,9,9,9,237,75,83,89,9,237,75,79,89,9,229,17,98,79,205,114,86,71,7,7,7,230,3,18,19,120,230,31,18,19,1,10,0,205,188,86,8,32,22,33,98,79,126,183,196,24,77,33,98,79,126,35,230,2,94,35,62,6,196,195,85,33,100,79,126,35,182,35,182,35,182,235,225,229,35,196,196,80,225,1,5,0,9,235,33,104,79,126,35,182,35,182,35,182,35,182,35,182,235,196,74,81,225,201,0,0,0,0,0,0,0,0,0,0,0,0,58,49,93,254,12,210,182,79,254,9,210,227,78,8,205,114,86,95,58,70,89,187,40,37,123,50,70,89,235,38,0,41,41,41,237,75,81,89,9,237,75,79,89,9,6,0,205,114,86,79,120,205,155,85,4,62,8,184,32,242,235,221,54,52,1,8,95,22,0,195,91,78,205,114,86,95,229,235,93,28,58,49,93,87,254,15,56,6,123,50,71,89,30,255,221,115,52,38,0,41,41,41,41,41,237,75,85,89,9,237,75,79,89,9,122,214,12,254,4,56,1,61,15,15,15,87,6,32,205,114,86,95,122,205,217,85,20,16,245,225,195,107,78,214,132,221,119,19,201,221,126,19,198,2,221,119,19,201,205,114,86,230,7,221,119,20,201,205,113,82,27,221,54,51,0,195,140,84,205,114,86,87,205,114,86,95,58,49,93,254,12,48,15,254,9,48,6,122,75,205,155,85,201,122,205,195,85,201,122,205,217,85,201,205,113,82,27,195,140,84,205,114,86,95,205,114,86,87,221,115,4,221,114,5,221,203,53,198,201,205,114,86,221,119,56,221,203,53,198,201,205,114,86,235,198,33,221,119,38,214,33,135,111,38,0,237,75,60,89,9,237,75,79,89,9,205,114,86,79,205,114,86,71,3,42,79,89,9,221,117,34,221,116,35,221,117,36,221,116,37,221,54,40,133,221,54,41,0,43,205,114,86,254,33,48,6,221,203,53,158,235,201,221,203,53,222,235,201,205,114,86,205,238,80,221,119,37,201,205,196,80,201,221,229,209,1,34,0,235,9,235,205,229,80,205,229,80,205,114,86,18,19,205,229,80,62,1,221,119,38,221,203,53,158,201,205,114,86,205,238,80,18,19,201,198,247,79,206,80,145,71,10,201,241,193,161,145,129,113,97,81,65,114,49,82,33,83,50,67,17,52,35,53,18,37,19,39,20,21,22,23,24,25,26,28,31,221,54,38,0,221,203,53,158,201,221,54,41,0,221,126,38,254,33,48,5,221,54,40,128,201,221,54,40,133,221,126,36,221,119,34,221,126,37,221,119,35,221,203,53,166,201,205,74,81,201,221,229,209,1,22,0,235,9,235,1,6,0,205,188,86,205,93,81,201,221,54,28,0,221,54,30,0,221,54,31,0,221,54,32,0,221,54,33,0,221,203,53,150,221,203,53,198,201,205,114,86,50,51,93,221,54,12,0,201,205,114,86,205,175,86,201,205,114,86,79,205,114,86,71,235,42,79,89,9,205,114,86,43,61,245,205,175,86,241,192,235,201,205,114,86,95,205,114,86,87,229,235,237,91,79,89,25,35,205,114,86,79,205,114,86,71,235,9,205,114,86,254,1,40,2,225,201,235,193,201,205,114,86,205,81,77,221,113,15,221,112,16,28,221,115,51,205,114,86,198,7,254,15,56,12,198,121,135,135,71,135,128,221,119,17,24,13,198,249,135,135,71,135,128,221,134,17,221,119,17,205,114,86,217,205,81,77,221,110,15,221,102,16,183,237,66,229,217,205,113,82,27,237,83,52,93,66,75,209,229,205,16,86,225,229,213,235,221,229,225,1,22,0,9,229,19,6,6,205,199,86,225,209,54,1,35,175,119,35,115,35,114,35,119,35,119,205,93,81,221,126,40,230,31,254,4,40,6,221,126,19,183,32,3,205,33,81,221,203,53,206,205,101,75,225,237,91,52,93,195,96,84,205,114,86,221,119,2,205,114,86,221,119,3,201,205,114,86,8,217,58,51,93,111,221,78,12,175,71,103,50,51,93,8,195,145,82,217,205,114,86,217,254,8,210,104,83,221,94,10,221,86,11,183,40,24,61,40,61,61,40,71,61,40,86,61,202,16,83,61,202,44,83,61,202,69,83,195,89,83,121,8,217,205,114,86,217,61,40,25,60,229,79,197,205,67,86,193,213,85,88,205,67,86,66,8,131,79,209,225,237,90,195,135,82,237,90,195,135,82,175,203,58,203,27,31,129,79,237,90,195,135,82,175,203,58,203,27,31,203,58,203,27,31,129,79,237,90,195,135,82,175,203,58,203,27,31,203,58,203,27,31,203,58,203,27,31,129,79,237,90,195,135,82,175,203,58,203,27,31,203,58,203,27,31,203,58,203,27,31,203,58,203,27,31,129,79,237,90,195,135,82,123,90,80,23,203,19,203,18,23,203,19,203,18,23,203,19,203,18,129,79,237,90,195,135,82,123,90,80,23,203,19,203,18,23,203,19,203,18,129,79,237,90,195,135,82,123,90,80,23,203,19,203,18,129,79,237,90,195,135,82,121,221,119,12,229,217,209,43,201,17,113,83,213,205,114,86,71,230,192,202,204,83,254,64,202,44,84,120,254,255,202,223,70,230,112,40,33,254,96,40,40,229,7,7,7,7,61,95,22,0,33,92,89,25,120,238,15,230,15,203,11,48,4,7,7,7,7,119,225,201,120,230,15,221,119,39,17,92,89,24,3,17,87,89,120,238,15,230,15,6,5,18,19,7,7,7,7,16,248,201,205,114,86,79,120,177,221,119,51,197,229,33,54,93,175,119,35,119,35,119,17,39,84,6,5,203,9,26,19,197,79,6,0,33,92,89,48,3,33,87,89,9,126,12,203,57,33,54,93,9,182,119,193,16,226,205,219,74,225,193,120,177,246,32,230,63,87,14,32,62,14,205,155,85,74,62,14,221,203,53,110,204,155,85,205,113,82,27,195,96,84,1,4,3,2,0,120,230,63,202,145,76,254,1,202,122,81,254,2,202,133,81,254,3,202,140,81,254,4,202,166,81,254,5,202,182,76,254,6,202,32,80,254,7,202,116,78,254,8,202,133,78,254,9,202,139,76,201,122,163,60,40,9,221,115,6,221,114,7,195,161,84,221,119,6,221,119,7,195,161,84,120,161,60,194,134,84,221,119,6,221,119,7,195,140,84,221,113,6,221,112,7,122,163,60,194,155,84,221,119,8,221,119,9,195,161,84,221,115,8,221,114,9,221,117,13,221,116,14,209,17,57,0,221,25,58,59,89,254,6,32,31,58,49,93,254,5,40,14,254,6,32,20,198,2,50,49,93,221,25,221,25,175,214,1,62,0,222,0,47,50,50,93,58,49,93,60,254,17,50,49,93,218,76,69,58,58,93,183,40,29,71,58,59,93,60,50,59,93,184,56,18,175,50,59,93,58,76,89,61,50,76,89,32,5,205,149,64,24,25,58,47,93,183,250,21,85,71,58,57,93,60,50,57,93,184,218,58,69,243,62,1,50,48,93,58,131,86,183,40,8,241,205,209,86,241,205,92,93,175,50,57,93,201,221,33,102,89,175,95,103,111,6,17,14,0,203,59,203,28,203,29,120,254,9,56,11,254,11,48,7,58,59,89,254,6,40,17,229,221,110,13,221,102,14,205,114,86,225,60,40,3,203,251,12,197,1,57,0,221,9,193,16,208,203,37,203,20,203,19,203,16,108,99,88,58,59,89,254,6,32,2,203,251,65,201,221,203,53,198,58,49,93,254,9,208,198,32,71,221,126,49,230,47,221,119,49,79,120,205,155,85,201,0,0,0,121,211,125,201,217,95,219,230,214,0,254,7,56,248,123,211,124,6,2,205,6,86,217,121,211,125,219,230,50,167,85,201,211,160,219,162,201,217,95,211,160,217,123,211,161,217,123,217,201,30,63,217,33,0,144,205,221,85,201,217,111,38,152,58,74,93,254,255,40,32,219,168,71,243,62,0,211,168,58,255,255,47,79,62,0,50,255,255,217,123,217,119,121,50,255,255,120,211,168,205,250,68,217,201,219,230,79,219,230,145,184,56,250,201,175,203,122,40,9,33,0,0,183,237,82,235,62,1,203,120,40,10,33,0,0,183,237,66,68,77,238,1,8,205,67,86,8,183,200,68,77,33,0,0,183,237,82,235,33,0,0,183,237,66,201,33,0,0,62,16,203,35,203,18,237,106,237,66,56,3,28,24,1,9,61,32,239,201,17,0,0,98,203,63,56,4,194,105,86,201,235,25,235,41,203,63,56,248,194,105,86,201,0,0,0,229,205,125,86,126,225,35,201,124,7,7,230,3,198,0,254,0,40,32,213,50,133,86,61,135,198,76,95,206,93,147,87,26,229,213,197,205,209,86,205,250,68,193,209,225,19,26,205,92,93,209,124,230,63,246,128,103,201,0,0,0,229,245,205,125,86,241,119,225,35,201,205,114,86,18,19,11,120,177,32,246,201,126,35,235,205,175,86,235,16,247,201,243,71,230,3,15,15,15,15,79,219,168,230,207,177,87,203,33,203,33,230,63,177,95,203,120,40,19,123,211,168,120,230,12,7,7,71,58,255,255,47,230,207,176,50,255,255,122,211,168,201,229,197,243,219,168,71,230,48,7,7,7,7,79,198,193,111,38,252,126,230,128,40,26,120,230,63,97,203,12,203,12,180,211,168,58,255,255,47,230,48,15,15,103,120,211,168,62,128,180,177,205,250,68,193,225,201,229,205,114,86,254,76,194,103,88,205,114,86,254,90,194,103,88,205,114,86,254,68,194,103,88,205,114,86,254,2,194,103,88,205,114,86,95,205,114,86,87,205,114,86,79,205,114,86,71,9,43,229,42,79,89,25,17,16,0,25,209,235,205,114,86,43,43,235,205,175,86,43,43,235,11,120,177,32,239,235,35,30,128,217,225,43,229,217,203,3,48,6,8,205,114,86,87,8,203,2,56,10,205,114,86,217,205,175,86,217,24,232,205,114,86,203,127,32,11,217,230,127,95,22,0,14,0,195,17,88,203,119,32,40,230,63,217,95,22,0,6,4,217,203,3,48,6,8,205,114,86,87,8,203,2,217,203,19,203,18,5,32,235,72,123,198,128,95,138,147,87,195,17,88,217,230,63,254,8,40,115,87,230,56,40,16,217,205,114,86,217,95,203,58,203,27,1,1,1,195,33,88,122,230,7,71,4,14,0,17,255,255,24,25,6,1,217,203,3,48,6,8,205,114,86,87,8,203,2,217,48,7,4,203,88,217,40,235,217,62,1,5,40,17,217,203,3,48,6,8,205,114,86,87,8,203,2,217,23,16,239,129,61,19,19,68,77,183,237,82,80,89,79,6,0,3,4,12,205,114,86,235,205,175,86,235,13,32,245,16,243,235,217,195,147,87,217,225,175,201,225,55,201,0,10,21,33,45,58,71,86,101,117,134,152,172,93,13,156,12,231,11,60,11,155,10,2,10,115,9,235,8,107,8,242,7,128,7,20,7,175,6,78,6,244,5,158,5,78,5,1,5,186,4,118,4,54,4,249,3,192,3,138,3,87,3,39,3,250,2,207,2,167,2,129,2,93,2,59,2,27,2,253,1,224,1,197,1,172,1,148,1,125,1,104,1,83,1,64,1,46,1,29,1,13,1,254,0,240,0,227,0,214,0,202,0,190,0,180,0,170,0,160,0,151,0,143,0,135,0,127,0,120,0,113,0,107,0,101,0,95,0,90,0,85,0,80,0,76,0,71,0,67,0,64,0,60,0,57,0,53,0,50,0,48,0,45,0,42,0,40,0,38,0,36,0,34,0,32,0,30,0,28,0,27,0,25,0,24,0,22,0,21,0,20,0,19,0,18,0,17,0,16,0,15,0,14,0,13,0,0,6],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+1137048);allocate([195,22,64,195,221,68,245,229,121,135,198,45,111,206,64,149,103,126,35,102,111,34,43,64,225,241,195,0,0,77,64,140,64,147,64,159,64,165,64,173,64,179,64,191,64,218,64,243,64,18,65,23,65,36,65,42,65,46,65,83,65,175,50,154,92,33,241,92,17,242,92,1,26,0,119,237,176,205,153,66,205,240,66,205,97,67,195,87,65,77,80,75,32,80,76,65,89,69,82,32,32,32,118,101,114,32,49,46,48,51,97,32,32,98,121,32,75,45,75,65,90,13,10,36,205,104,65,33,186,88,201,175,50,154,92,205,82,68,205,220,66,175,201,123,50,153,92,175,201,122,230,15,50,202,88,175,201,123,50,164,92,175,201,58,198,88,71,42,199,88,58,201,88,95,201,175,50,166,92,60,50,153,92,62,201,50,221,68,205,231,68,58,166,92,183,40,247,175,50,221,68,201,79,58,245,92,254,8,63,216,95,22,0,33,246,92,25,25,112,35,113,60,183,50,245,92,201,183,32,4,58,245,92,201,71,58,245,92,184,56,14,120,61,135,95,22,0,33,246,92,25,70,35,126,201,175,71,201,175,50,245,92,201,17,36,0,25,17,6,93,1,6,0,237,176,201,62,1,50,154,92,201,50,185,88,201,42,199,88,58,201,88,221,33,225,88,17,56,0,6,17,14,255,31,203,28,203,29,48,7,221,126,54,185,48,1,79,221,25,16,238,121,201,221,33,186,88,1,3,1,58,243,92,103,58,244,92,111,17,105,64,62,0,201,229,245,205,153,66,241,225,34,205,88,50,3,86,50,204,88,183,40,28,175,103,111,50,242,85,50,47,86,34,243,85,34,48,86,50,5,86,205,9,93,245,205,134,86,245,24,23,33,242,85,17,47,86,54,126,62,119,18,62,35,35,19,119,18,62,201,35,19,119,18,205,25,85,42,205,88,17,167,92,1,6,0,205,60,86,33,167,92,17,105,64,6,3,205,7,68,62,1,194,150,66,14,3,205,237,67,33,3,1,175,60,237,82,218,150,66,33,150,0,237,82,210,150,66,42,205,88,205,242,85,254,26,32,249,205,242,85,254,255,32,11,205,190,86,62,3,218,150,66,205,242,85,79,6,0,11,17,187,88,205,60,86,217,33,238,88,58,187,88,254,9,40,21,254,6,40,5,62,2,195,150,66,6,7,205,170,68,1,56,0,9,9,24,5,6,9,205,170,68,6,3,205,170,68,6,5,205,170,68,217,205,242,85,95,205,242,85,87,237,83,207,88,205,242,85,95,205,242,85,87,237,83,209,88,205,242,85,95,205,242,85,87,237,83,211,88,62,15,50,202,88,62,1,50,153,92,62,255,50,196,88,205,82,68,205,220,66,205,116,84,120,50,198,88,34,199,88,123,50,201,88,175,8,58,3,86,183,40,11,241,205,84,86,205,211,68,241,205,6,93,8,201,183,24,233,33,187,88,17,188,88,1,53,4,54,0,237,176,17,56,0,221,33,225,88,6,17,175,221,54,10,120,221,54,20,8,221,54,17,36,254,9,48,4,221,54,50,63,221,25,60,16,231,33,35,0,34,190,88,33,56,0,34,192,88,33,177,92,34,37,85,201,6,144,22,0,120,61,90,205,111,85,16,248,30,31,62,143,205,111,85,201,33,65,67,205,40,68,56,27,33,77,67,205,40,68,48,19,245,245,33,246,127,205,12,0,246,1,95,241,205,20,0,205,211,68,241,50,243,92,245,33,45,0,58,193,252,205,12,0,205,211,68,254,3,48,8,33,228,84,34,226,84,24,16,247,128,131,1,205,211,68,183,40,238,33,236,84,34,226,84,241,201,17,24,64,33,89,67,6,8,205,16,68,201,17,28,64,33,93,67,6,4,205,16,68,201,65,80,82,76,79,80,76,76,33,118,67,205,40,68,50,244,92,205,126,67,122,50,62,85,123,50,71,85,201,121,205,126,67,205,169,67,201,71,230,3,15,15,79,15,15,177,79,219,168,95,230,15,177,87,243,211,168,58,255,255,47,230,207,79,123,211,168,205,211,68,120,230,12,7,7,177,95,203,120,201,219,168,71,243,122,211,168,58,255,255,40,1,47,79,123,50,255,255,33,0,144,17,0,152,126,8,54,0,235,126,47,119,190,47,119,235,55,40,14,54,63,235,126,47,119,190,47,119,235,55,32,1,175,63,8,119,8,121,50,255,255,120,211,168,205,211,68,201,235,33,0,0,26,19,214,48,254,10,48,12,41,41,41,41,133,111,140,149,103,13,32,236,235,201,26,19,190,35,192,16,249,175,201,235,197,213,121,205,12,0,205,211,68,209,193,235,190,35,19,55,63,192,16,235,175,55,201,14,128,6,16,22,252,229,213,197,121,230,3,198,193,95,26,203,127,32,4,121,230,3,79,197,17,70,68,213,233,193,121,193,209,225,216,12,16,223,175,61,201,14,255,22,48,6,9,122,205,225,84,20,16,249,14,0,22,0,6,41,122,205,225,84,20,16,249,58,187,88,254,6,32,14,33,156,68,6,7,126,35,78,35,205,225,84,16,247,62,7,30,191,205,13,85,175,6,14,95,254,7,196,13,85,60,16,248,62,7,30,184,205,13,85,201,14,32,22,32,23,80,24,192,38,5,39,5,40,1,120,8,217,205,242,85,79,205,242,85,71,17,0,0,120,177,40,6,235,42,205,88,9,235,123,217,119,35,217,122,217,119,1,55,0,9,8,61,32,217,201,245,58,185,88,183,40,1,251,241,201,0,58,154,92,183,200,243,205,211,68,58,153,92,183,200,242,251,68,71,33,163,92,53,126,184,40,3,56,1,201,175,50,154,92,50,163,92,50,5,86,58,3,86,183,40,8,205,9,93,245,205,134,86,245,175,50,155,92,50,156,92,42,194,88,35,34,194,88,221,33,225,88,221,110,6,221,102,7,124,181,202,143,69,43,221,117,6,221,116,7,58,156,92,183,194,235,83,221,78,2,221,70,3,121,176,40,62,221,94,15,221,86,16,221,110,0,221,102,1,34,158,92,183,237,82,40,42,56,13,235,9,235,42,158,92,183,237,82,48,19,24,13,235,183,237,66,235,42,158,92,183,237,82,56,4,237,91,158,92,221,115,15,221,114,16,221,203,53,198,205,215,70,205,226,74,195,235,83,221,110,8,221,102,9,124,181,40,108,43,221,117,8,221,116,9,221,203,53,102,32,70,221,126,40,71,230,31,254,4,40,60,58,156,92,183,32,44,58,155,92,254,9,56,4,254,12,56,15,120,254,3,40,38,221,54,40,131,221,54,0,0,24,28,221,126,39,230,16,40,234,58,155,92,61,30,0,205,13,85,24,232,62,14,14,32,205,225,84,195,235,83,221,126,55,60,40,10,221,70,0,4,184,40,6,221,112,0,205,215,70,205,226,74,195,235,83,221,110,13,221,102,14,125,180,202,235,83,58,156,92,183,194,184,82,17,23,70,213,205,242,85,254,112,218,197,76,254,128,218,129,77,254,255,202,176,70,254,170,48,230,71,135,198,72,95,206,70,147,87,120,235,78,35,70,235,237,67,69,70,195,0,0,201,242,77,242,77,71,70,169,78,56,79,56,79,71,79,82,79,93,79,128,79,135,79,120,80,250,75,18,76,51,76,192,75,172,80,183,80,190,80,216,80,205,75,229,75,254,80,215,75,222,75,171,81,62,79,242,79,74,80,90,77,110,77,116,77,175,77,192,77,176,76,186,75,20,78,154,79,122,77,179,75,166,75,232,79,71,145,135,235,79,120,6,0,9,78,35,70,235,237,67,174,70,195,0,0,221,52,54,32,3,221,53,54,205,242,85,95,205,242,85,87,235,124,181,32,6,17,1,0,195,207,83,221,126,18,221,119,17,237,91,205,88,25,201,221,203,53,86,32,25,221,126,22,183,200,71,221,126,28,60,184,40,4,221,119,28,201,221,203,53,214,221,54,29,255,221,126,29,221,190,23,48,5,60,221,119,29,201,175,221,119,29,79,221,126,27,254,9,208,17,61,71,205,156,70,87,60,128,221,119,31,221,78,24,221,70,25,122,183,40,7,33,0,0,237,66,68,77,221,110,32,221,102,33,9,221,117,32,221,116,33,221,203,53,198,201,79,71,109,71,136,71,175,71,198,71,205,71,212,71,227,71,252,71,221,70,31,221,126,26,79,203,63,184,40,8,145,184,40,8,221,126,30,201,62,254,24,2,62,0,221,119,30,201,221,70,31,221,126,26,184,40,8,4,5,40,8,221,126,30,201,62,254,24,2,62,0,221,119,30,201,221,70,31,221,126,26,203,63,184,32,24,237,68,71,221,126,32,47,111,221,126,33,47,103,35,221,117,32,221,116,33,221,203,53,198,221,126,30,201,221,70,31,221,126,26,184,40,4,221,126,30,201,33,0,0,221,117,31,193,195,50,71,33,0,0,193,195,50,71,33,0,0,193,195,50,71,221,70,31,221,126,26,184,40,4,221,126,30,201,193,201,221,70,31,221,126,26,184,40,10,221,126,30,183,200,4,5,192,193,201,62,254,221,119,30,201,221,70,31,221,126,26,184,40,4,221,126,30,201,33,0,0,193,195,50,71,1,63,74,197,221,126,40,203,119,192,203,111,194,31,73,203,127,202,231,72,230,31,221,119,40,183,40,25,61,202,104,72,61,202,122,72,61,202,127,72,61,202,226,72,61,202,44,73,61,202,44,73,201,221,126,38,183,32,9,221,54,40,128,221,54,41,15,201,221,54,41,0,221,54,42,15,221,126,34,221,119,43,221,119,44,195,231,72,221,126,36,221,119,42,221,126,35,221,119,43,221,119,44,195,231,72,221,54,40,66,201,221,203,53,94,32,33,58,155,92,254,9,56,79,221,126,38,183,40,68,221,54,42,0,254,33,48,12,221,126,37,221,119,43,221,119,44,195,231,72,235,221,110,36,221,102,37,43,205,242,85,254,33,48,13,235,205,32,80,221,119,43,221,119,44,195,231,72,198,226,79,6,0,9,221,117,34,221,116,35,235,221,203,53,230,195,44,73,221,119,41,24,7,205,208,84,221,203,53,142,221,54,40,68,201,221,126,44,214,16,71,221,119,44,230,240,192,221,126,43,221,119,44,221,126,42,79,221,126,41,185,48,18,128,185,56,10,221,126,40,60,246,128,221,119,40,121,221,119,41,201,144,56,239,185,56,236,40,234,24,242,221,126,44,61,221,119,44,192,221,54,40,133,201,229,221,110,34,221,102,35,1,51,73,197,205,242,85,254,16,56,92,254,32,56,100,254,48,218,229,73,254,255,40,11,17,134,73,254,58,14,48,218,156,70,201,205,242,85,95,205,242,85,87,235,125,180,40,6,237,75,205,88,9,201,221,203,53,102,40,10,221,203,53,166,221,54,40,68,24,4,221,54,40,69,221,117,34,221,116,35,193,225,201,193,73,206,73,220,73,228,73,241,73,14,74,93,79,250,73,42,74,56,74,230,15,221,119,41,221,54,40,133,195,125,73,230,15,221,119,42,205,242,85,205,32,80,221,119,43,221,119,44,221,54,40,5,205,231,72,195,125,73,205,242,85,221,119,44,221,54,40,37,195,125,73,205,240,75,208,205,242,85,95,62,6,205,13,85,201,205,240,75,208,205,68,76,201,201,221,203,19,254,205,129,77,221,203,19,190,201,35,58,155,92,254,9,208,24,7,35,58,155,92,254,12,216,43,221,203,19,254,205,169,78,221,203,19,190,201,205,242,85,79,205,242,85,71,221,94,32,221,86,33,235,9,235,221,115,32,221,114,33,221,203,53,198,201,221,126,53,203,79,194,198,84,246,3,221,119,53,201,221,203,53,142,195,198,84,58,156,92,183,32,35,58,202,88,221,134,41,221,134,39,214,30,48,1,175,221,190,45,200,221,119,45,71,58,155,92,254,9,56,56,254,12,48,81,24,72,58,202,88,237,68,198,15,230,15,95,7,7,7,7,87,33,160,92,6,3,126,47,230,240,146,48,1,175,79,126,47,230,15,147,48,1,175,177,47,79,62,57,144,205,225,84,35,16,227,201,198,48,95,120,238,15,79,221,126,50,230,240,177,79,221,113,50,123,205,225,84,201,198,255,88,205,13,85,201,198,126,88,205,111,85,201,221,126,19,87,183,32,19,205,198,84,221,126,39,230,16,40,19,58,203,88,95,62,13,205,13,85,122,254,2,56,5,214,2,221,119,19,229,205,16,72,221,203,53,70,202,164,75,221,203,53,134,221,94,4,221,86,5,221,110,32,221,102,33,25,125,203,44,31,203,44,31,203,44,31,84,95,203,44,31,111,25,221,94,15,221,86,16,25,58,155,92,254,9,56,15,71,125,47,111,124,238,15,103,120,254,12,48,87,24,71,35,124,38,0,41,41,84,93,41,41,41,68,77,41,41,25,9,108,38,0,17,165,0,25,71,77,58,155,92,198,16,87,205,225,84,124,230,1,203,32,176,230,15,79,221,126,49,230,32,221,203,53,78,40,2,246,16,177,79,221,113,49,122,198,16,205,225,84,195,164,75,214,9,135,93,205,13,85,60,92,205,13,85,24,35,198,244,135,198,128,87,125,221,190,49,40,8,95,122,221,115,49,205,111,85,124,221,190,50,40,9,95,122,60,221,115,50,205,111,85,225,201,205,242,85,95,205,242,85,87,237,83,223,88,201,205,242,85,221,119,55,201,62,1,50,166,92,201,205,242,85,221,119,10,205,242,85,221,119,11,201,205,242,85,221,134,17,221,119,17,201,205,242,85,221,119,17,201,205,242,85,221,119,21,201,221,126,17,221,119,18,175,221,119,12,201,58,155,92,254,9,63,208,254,12,201,205,240,75,208,205,242,85,95,205,242,85,87,62,11,205,13,85,90,62,12,205,13,85,201,58,155,92,254,9,56,23,254,12,208,71,205,242,85,50,203,88,198,16,221,119,39,120,61,30,16,205,13,85,201,205,242,85,205,240,75,208,205,242,85,95,62,6,205,13,85,205,68,76,201,205,242,85,238,3,30,0,203,79,40,2,30,8,230,1,179,15,95,62,7,205,8,85,79,6,123,58,155,92,214,8,203,0,203,3,61,32,249,121,160,179,95,62,7,205,13,85,201,214,8,6,13,22,255,20,144,210,122,76,128,217,221,134,17,221,134,21,61,87,58,155,92,254,9,122,56,12,135,198,249,111,206,87,149,103,78,35,70,201,6,255,14,12,4,145,210,161,76,129,198,237,111,206,87,149,103,78,201,205,242,85,214,8,6,13,22,255,20,144,48,252,62,13,205,128,76,195,200,76,205,116,76,20,221,114,51,221,126,2,221,182,3,40,8,221,113,0,221,112,1,24,6,221,113,15,221,112,16,217,122,205,187,81,221,126,19,183,32,63,221,126,20,254,8,40,56,71,205,242,85,43,254,133,40,47,254,154,40,43,229,33,0,0,25,16,253,203,60,203,29,203,60,203,29,203,60,203,29,124,181,32,3,33,1,0,235,183,237,82,56,7,68,77,225,197,195,48,77,17,0,0,225,1,0,0,197,27,213,221,126,40,230,31,254,4,40,6,221,126,19,183,32,9,205,143,80,205,83,80,195,78,77,221,203,53,198,221,203,53,206,205,190,74,193,209,195,186,83,205,242,85,221,134,39,250,107,77,254,16,56,22,62,15,24,18,175,24,15,221,126,39,60,24,239,221,126,39,61,24,230,205,242,85,221,119,39,201,71,58,155,92,254,9,208,95,120,230,15,60,221,119,52,61,135,135,135,135,87,221,126,50,230,15,178,79,221,113,50,123,198,48,205,225,84,221,126,19,183,192,205,198,84,201,237,91,194,88,221,115,46,221,114,47,221,126,12,221,119,48,201,221,126,12,245,221,126,48,221,119,12,205,184,81,58,194,88,221,150,46,79,58,195,88,221,158,47,71,235,241,183,237,66,235,40,6,56,12,27,195,207,83,221,190,12,56,3,221,119,12,201,71,58,155,92,95,254,9,208,120,214,128,79,221,126,49,230,223,13,12,40,2,246,32,79,221,113,49,123,198,32,205,225,84,201,205,242,85,95,62,255,183,8,24,11,175,8,205,242,85,95,123,60,221,119,52,229,235,38,0,68,77,41,41,41,9,9,9,237,75,209,88,9,237,75,205,88,9,229,17,157,78,205,242,85,71,7,7,7,230,3,18,19,120,230,31,18,19,1,10,0,205,60,86,8,32,22,33,157,78,126,183,196,71,76,33,157,78,126,35,230,2,94,35,62,6,196,13,85,33,159,78,126,35,182,35,182,35,182,235,225,229,35,196,246,79,225,1,5,0,9,235,33,163,78,126,35,182,35,182,35,182,35,182,35,182,235,196,124,80,225,201,0,0,0,0,0,0,0,0,0,0,0,0,58,155,92,254,12,210,241,78,254,9,210,30,78,8,205,242,85,95,58,196,88,187,40,37,123,50,196,88,235,38,0,41,41,41,237,75,207,88,9,237,75,205,88,9,6,0,205,242,85,79,120,205,225,84,4,62,8,184,32,242,235,221,54,52,1,8,95,22,0,195,150,77,205,242,85,95,229,235,93,28,58,155,92,87,254,15,56,6,123,50,197,88,30,255,221,115,52,38,0,41,41,41,41,41,237,75,211,88,9,237,75,205,88,9,122,214,12,254,4,56,1,61,15,15,15,87,6,32,205,242,85,95,122,205,111,85,20,16,245,225,195,166,77,214,132,221,119,19,201,221,126,19,198,2,221,119,19,201,205,242,85,61,230,7,60,221,119,20,201,205,184,81,27,221,54,51,0,195,207,83,205,242,85,87,205,242,85,95,58,155,92,254,12,48,15,254,9,48,6,122,75,205,225,84,201,122,205,13,85,201,122,205,111,85,201,205,184,81,27,195,207,83,205,242,85,95,205,242,85,87,221,115,4,221,114,5,221,203,53,198,201,205,242,85,235,198,33,221,119,38,214,33,135,111,38,0,237,75,188,88,9,237,75,205,88,9,205,242,85,79,205,242,85,71,3,42,205,88,9,221,117,34,221,116,35,221,117,36,221,116,37,221,54,40,133,221,54,41,0,43,205,242,85,254,33,48,6,221,203,53,158,235,201,221,203,53,222,235,201,205,242,85,205,32,80,221,119,37,201,205,246,79,201,221,229,209,1,34,0,235,9,235,205,23,80,205,23,80,205,242,85,18,19,205,23,80,62,1,221,119,38,221,203,53,158,201,205,242,85,205,32,80,18,19,201,198,41,79,206,80,145,71,10,201,241,193,161,145,129,113,97,81,65,114,49,82,33,83,50,67,17,52,35,53,18,37,19,39,20,21,22,23,24,25,26,28,31,221,54,38,0,221,203,53,158,201,221,54,41,0,221,126,38,254,33,48,5,221,54,40,128,201,221,54,40,133,221,126,36,221,119,34,221,126,37,221,119,35,221,203,53,166,201,205,124,80,201,221,229,209,1,22,0,235,9,235,1,6,0,205,60,86,205,143,80,201,221,54,28,0,221,54,30,0,221,54,31,0,221,54,32,0,221,54,33,0,221,203,53,150,221,203,53,198,201,205,242,85,50,157,92,221,54,12,0,201,205,242,85,205,47,86,201,205,242,85,79,205,242,85,71,235,42,205,88,9,205,242,85,43,61,245,205,47,86,241,192,235,201,205,242,85,95,205,242,85,87,229,235,237,91,205,88,25,35,205,242,85,79,205,242,85,71,235,9,205,242,85,254,1,40,2,225,201,235,193,201,205,242,85,205,128,76,221,113,15,221,112,16,20,221,114,51,217,205,242,85,198,7,254,15,56,12,198,121,135,135,71,135,128,221,119,17,24,13,198,249,135,135,71,135,128,221,134,17,221,119,17,205,242,85,205,128,76,221,110,15,221,102,16,183,237,66,41,41,41,41,229,217,205,184,81,27,237,83,158,92,66,75,203,56,203,25,235,9,235,66,75,209,229,205,168,85,225,229,213,235,221,229,225,1,22,0,9,19,1,6,0,205,71,86,209,221,54,22,1,221,54,23,1,221,115,24,221,114,25,221,54,26,0,221,54,27,0,205,143,80,221,126,40,230,31,254,4,40,6,221,126,19,183,32,3,205,83,80,221,203,53,206,205,190,74,225,237,91,158,92,195,163,83,205,242,85,221,119,2,205,242,85,221,119,3,201,205,242,85,8,217,58,157,92,111,221,78,12,175,71,103,50,157,92,8,195,216,81,217,205,242,85,217,254,8,210,175,82,221,94,10,221,86,11,183,40,24,61,40,61,61,40,71,61,40,86,61,202,87,82,61,202,115,82,61,202,140,82,195,160,82,121,8,217,205,242,85,217,61,40,25,60,229,79,197,205,219,85,193,213,85,88,205,219,85,66,8,131,79,209,225,237,90,195,206,81,237,90,195,206,81,175,203,58,203,27,31,129,79,237,90,195,206,81,175,203,58,203,27,31,203,58,203,27,31,129,79,237,90,195,206,81,175,203,58,203,27,31,203,58,203,27,31,203,58,203,27,31,129,79,237,90,195,206,81,175,203,58,203,27,31,203,58,203,27,31,203,58,203,27,31,203,58,203,27,31,129,79,237,90,195,206,81,123,90,80,23,203,19,203,18,23,203,19,203,18,23,203,19,203,18,129,79,237,90,195,206,81,123,90,80,23,203,19,203,18,23,203,19,203,18,129,79,237,90,195,206,81,123,90,80,23,203,19,203,18,129,79,237,90,195,206,81,121,221,119,12,229,217,209,43,201,17,184,82,213,205,242,85,71,230,192,202,19,83,254,64,202,111,83,120,254,255,202,176,70,230,112,40,33,254,96,40,40,229,7,7,7,7,61,95,22,0,33,218,88,25,120,238,15,230,15,203,11,48,4,7,7,7,7,119,225,201,120,230,15,221,119,39,17,218,88,24,3,17,213,88,120,238,15,230,15,6,5,18,19,7,7,7,7,16,248,201,205,242,85,79,120,177,221,119,51,197,229,33,160,92,175,119,35,119,35,119,17,106,83,6,5,203,9,26,19,197,79,6,0,33,218,88,48,3,33,213,88,9,126,12,203,57,33,160,92,9,182,119,193,16,226,205,63,74,225,193,120,177,246,32,230,63,87,14,32,62,14,205,225,84,74,62,14,205,225,84,205,184,81,27,195,163,83,1,4,3,2,0,120,230,63,202,192,75,254,1,202,172,80,254,2,202,183,80,254,3,202,190,80,254,4,202,216,80,254,5,202,229,75,254,6,202,93,79,254,7,202,175,77,254,8,202,192,77,254,9,202,186,75,201,122,163,60,40,9,221,115,6,221,114,7,195,228,83,221,119,6,221,119,7,195,228,83,120,161,60,194,201,83,221,119,6,221,119,7,195,207,83,221,113,6,221,112,7,122,163,60,194,222,83,221,119,8,221,119,9,195,228,83,221,115,8,221,114,9,221,117,13,221,116,14,209,17,56,0,221,25,58,187,88,254,6,32,31,58,155,92,254,5,40,14,254,6,32,20,198,2,50,155,92,221,25,221,25,175,214,1,62,0,222,0,47,50,156,92,58,155,92,60,254,17,50,155,92,218,37,69,205,57,85,58,164,92,183,40,29,71,58,165,92,60,50,165,92,184,56,18,175,50,165,92,58,202,88,61,50,202,88,32,5,205,147,64,24,25,58,153,92,183,250,91,84,71,58,163,92,60,50,163,92,184,218,19,69,243,62,1,50,154,92,58,3,86,183,40,8,241,205,84,86,241,205,6,93,175,50,163,92,201,221,33,225,88,175,95,103,111,6,17,14,0,203,59,203,28,203,29,120,254,9,56,11,254,11,48,7,58,187,88,254,6,40,17,229,221,110,13,221,102,14,205,242,85,225,60,40,3,203,251,12,197,1,56,0,221,9,193,16,208,203,37,203,20,203,19,203,16,108,99,88,58,187,88,254,6,32,2,203,251,65,201,221,203,53,198,58,155,92,254,9,208,198,32,71,221,126,49,230,47,221,119,49,79,120,205,225,84,201,195,0,0,211,124,0,0,121,211,125,201,217,95,219,230,214,0,254,7,56,248,123,211,124,6,2,205,158,85,217,121,211,125,219,230,50,241,84,201,211,160,219,162,201,217,95,211,160,217,123,211,161,217,123,217,201,30,63,217,33,1,144,205,115,85,201,217,33,0,0,119,35,217,123,217,119,35,34,37,85,62,241,189,196,57,85,217,201,219,168,71,243,62,0,211,168,58,255,255,47,79,62,0,50,255,255,33,177,92,22,152,58,37,85,189,40,8,94,35,126,35,18,195,80,85,121,50,255,255,120,211,168,205,211,68,33,177,92,34,37,85,201,217,111,38,152,58,244,92,254,255,40,34,219,168,71,243,58,62,85,211,168,58,255,255,47,79,58,71,85,50,255,255,217,123,217,119,121,50,255,255,120,211,168,205,211,68,217,201,219,230,79,219,230,145,184,56,250,201,175,203,122,40,9,33,0,0,183,237,82,235,62,1,203,120,40,10,33,0,0,183,237,66,68,77,238,1,8,205,219,85,8,183,200,68,77,33,0,0,183,237,82,235,33,0,0,183,237,66,201,33,0,0,62,16,203,35,203,18,237,106,237,66,56,3,28,24,1,9,61,32,239,201,0,0,0,229,205,253,85,126,225,35,201,124,7,7,230,3,198,0,254,0,40,32,213,50,5,86,61,135,198,246,95,206,92,147,87,26,229,213,197,205,84,86,205,211,68,193,209,225,19,26,205,6,93,209,124,230,63,246,128,103,201,0,0,0,229,245,205,253,85,241,119,225,35,201,205,242,85,18,19,11,120,177,32,246,201,126,35,235,205,47,86,235,11,120,177,32,244,201,243,71,230,3,15,15,15,15,79,219,168,230,207,177,87,203,33,203,33,230,63,177,95,203,120,40,19,123,211,168,120,230,12,7,7,71,58,255,255,47,230,207,176,50,255,255,122,211,168,201,229,197,243,219,168,71,230,48,7,7,7,7,79,198,193,111,38,252,126,230,128,40,26,120,230,63,97,203,12,203,12,180,211,168,58,255,255,47,230,48,15,15,103,120,211,168,62,128,180,177,205,211,68,193,225,201,229,205,242,85,254,76,194,234,87,205,242,85,254,90,194,234,87,205,242,85,254,68,194,234,87,205,242,85,254,2,194,234,87,205,242,85,95,205,242,85,87,205,242,85,79,205,242,85,71,9,43,229,42,205,88,25,17,16,0,25,209,235,205,242,85,43,43,235,205,47,86,43,43,235,11,120,177,32,239,235,35,30,128,217,225,43,229,217,203,3,48,6,8,205,242,85,87,8,203,2,56,10,205,242,85,217,205,47,86,217,24,232,205,242,85,203,127,32,11,217,230,127,95,22,0,14,0,195,148,87,203,119,32,40,230,63,217,95,22,0,6,4,217,203,3,48,6,8,205,242,85,87,8,203,2,217,203,19,203,18,5,32,235,72,123,198,128,95,138,147,87,195,148,87,217,230,63,254,8,40,115,87,230,56,40,16,217,205,242,85,217,95,203,58,203,27,1,1,1,195,164,87,122,230,7,71,4,14,0,17,255,255,24,25,6,1,217,203,3,48,6,8,205,242,85,87,8,203,2,217,48,7,4,203,88,217,40,235,217,62,1,5,40,17,217,203,3,48,6,8,205,242,85,87,8,203,2,217,23,16,239,129,61,19,19,68,77,183,237,82,80,89,79,6,0,3,4,12,205,242,85,235,205,47,86,235,13,32,245,16,243,235,217,195,22,87,217,225,175,201,225,55,201,9,24,42,60,79,99,120,143,167,192,218,246,162,2,99,3,24,4,195,4,100,5,253,5,140,6,20,7,148,7,13,8,127,8,235,8,80,9,177,9,11,10,97,10,177,10,254,10,69,11,137,11,201,11,6,12,63,12,117,12,168,12,216,12,5,13,48,13,88,13,126,13,162,13,196,13,228,13,2,14,31,14,58,14,83,14,107,14,130,14,151,14,172,14,191,14,209,14,226,14,242,14,1,15,15,15,28,15,41,15,53,15,65,15,75,15,85,15,95,15,104,15,112,15,120,15,128,15,135,15,142,15,148,15,154,15,160,15,165,15,170,15,175,15,179,15,184,15,188,15,191,15,195,15,198,15,202,15,205,15,207,15,210,15,213,15,215,15,217,15,219,15,221,15,223,15,225,15,227,15,228,15,230,15,231,15,233,15,234,15,235,15,236,15,237,15,238,15,239,15,240,15,241,15,0,4],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+1144303);allocate([67,111,109,112,111,115,101,114,58,32,37,115,13,10,65,114,114,97,110,103,101,114,58,32,37,115,13,10,37,115,0,14,0,205,16,64,62,1,50,73,93,50,74,93,33,0,160,14,1,175,205,16,64,14,12,205,16,64,62,127,211,64,175,211,65,211,66,201,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,205,19,64,14,14,175,205,16,64,211,66,201,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,62,1,0,14,0,205,16,64,33,0,160,14,1,175,205,16,64,14,12,205,16,64,62,127,211,64,175,211,65,211,66,201],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+1153247);allocate([195,54,1,195,89,1,195,55,1,195,189,3,195,40,4,195,98,4,195,113,4,195,137,4,195,172,4,195,183,4,195,235,4,195,242,4,195,38,5,195,54,1,195,133,5,195,77,5,195,89,5,195,124,5,201,245,62,201,50,125,243,33,167,2,17,0,0,1,0,1,237,176,33,255,255,205,192,3,205,96,1,241,33,0,128,205,114,6,201,205,75,19,205,104,1,201,175,50,165,2,50,166,2,201,58,176,51,183,40,19,175,50,176,51,58,165,2,60,50,165,2,71,62,127,211,64,120,211,66,175,33,207,48,6,12,182,32,22,35,16,250,58,166,2,60,50,166,2,254,30,216,62,127,211,64,62,1,211,65,201,175,50,166,2,201,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,0,0,0,0,0,0,0,0,0,0,0,0,0,0,126,201,0,0,0,0,0,0,0,0,0,0,0,0,0,0,201,0,0,0,0,0,0,0,201,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,211,160,245,123,211,161,241,201,0,0,0,0,0,0,0,0,211,160,219,162,201,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,195,64,0,195,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,111,112,120,52,107,115,115,46,98,105,110,32,50,48,48,49,47,49,48,47,49,57,62,1,201,34,219,11,1,159,0,9,34,221,11,33,75,19,34,248,51,62,195,50,247,51,62,255,50,156,11,205,142,6,205,40,7,33,106,10,17,128,55,1,0,1,237,176,33,106,11,17,22,61,1,50,0,237,176,33,50,9,17,13,58,1,60,0,237,176,33,110,9,17,62,63,1,192,0,237,176,33,76,10,17,76,62,1,30,0,237,176,151,50,175,51,14,111,205,125,243,120,50,33,51,205,197,12,201,61,198,238,111,38,50,214,12,95,22,50,58,194,11,183,196,82,4,126,183,194,76,4,26,119,151,18,62,1,50,229,51,50,179,51,201,126,18,54,0,24,241,125,214,238,79,6,0,33,195,11,9,229,209,14,12,9,201,205,128,4,126,183,204,58,4,44,28,16,247,195,67,4,205,128,4,126,183,196,58,4,44,28,16,247,195,67,4,33,238,50,17,226,50,6,12,201,42,221,11,34,245,51,243,151,50,119,48,62,1,50,242,51,205,1,13,205,67,4,201,58,194,11,183,251,200,205,183,4,195,183,4,243,62,1,50,240,11,205,58,14,251,201,58,194,11,183,32,24,33,226,50,17,195,11,1,24,0,237,176,62,1,50,194,11,205,102,16,151,50,157,51,201,33,195,11,17,226,50,1,24,0,237,176,151,50,194,11,60,50,157,51,195,67,4,205,100,5,115,195,67,4,33,207,48,6,12,126,183,32,5,44,16,249,55,201,34,192,11,125,214,207,198,188,111,38,58,126,50,189,11,34,190,11,42,192,11,151,190,200,205,75,19,42,190,11,58,189,11,190,202,18,5,201,79,58,157,51,183,200,121,61,198,188,111,38,58,34,190,11,120,50,189,11,205,75,19,42,190,11,58,189,11,190,200,210,58,5,201,33,13,12,201,205,100,5,126,254,15,208,60,119,195,67,4,205,100,5,126,183,200,61,119,195,67,4,61,71,58,194,11,183,120,194,116,5,198,226,111,38,50,201,79,6,0,33,195,11,9,201,205,110,30,62,1,50,251,50,201,42,219,11,17,204,61,1,128,0,237,176,17,0,49,1,31,0,237,176,58,6,49,254,1,202,163,5,62,1,201,237,91,0,49,221,42,221,11,221,25,58,2,49,183,40,11,6,9,205,78,14,17,64,54,205,131,6,58,3,49,230,7,183,40,11,6,2,205,78,14,17,189,61,205,131,6,58,4,49,183,40,11,6,5,205,78,14,17,72,61,205,131,6,58,3,49,203,63,203,63,203,63,183,40,39,6,2,205,78,14,17,190,62,205,131,6,221,33,190,62,6,32,221,94,0,221,86,1,42,221,11,25,221,117,0,221,116,1,221,35,221,35,16,234,6,3,62,22,30,0,205,3,34,198,16,205,3,34,198,16,30,255,205,3,34,214,31,16,235,58,5,49,230,32,50,169,51,95,62,14,205,3,34,58,5,49,230,1,50,168,51,33,7,49,17,50,51,1,24,0,237,176,221,33,50,51,6,12,221,94,0,221,86,1,42,221,11,25,221,117,0,221,116,1,221,35,221,35,16,234,62,1,50,230,48,151,201,34,219,11,1,159,0,9,34,221,11,205,133,5,205,137,4,201,229,193,221,229,225,237,176,229,221,225,201,151,50,156,11,33,193,252,6,0,58,156,11,79,9,126,203,127,32,69,58,156,11,245,33,24,64,205,12,0,254,65,202,35,7,241,245,33,28,64,205,12,0,254,79,32,23,241,50,156,11,33,246,127,205,12,0,203,199,95,58,156,11,33,246,127,205,20,0,201,241,58,156,11,60,50,156,11,254,4,32,179,62,255,50,156,11,241,201,58,156,11,198,128,50,116,48,151,50,117,48,58,116,48,245,33,24,64,205,12,0,254,65,202,35,7,241,245,33,28,64,205,12,0,254,79,40,175,241,58,117,48,60,50,117,48,254,4,40,187,58,116,48,198,4,50,116,48,24,207,241,50,156,11,201,243,33,213,7,17,117,249,1,48,0,237,176,205,117,249,229,33,179,7,17,117,249,1,34,0,237,176,225,43,43,43,17,0,52,62,64,50,189,11,213,205,117,249,209,58,173,11,205,176,7,58,181,11,205,176,7,58,174,11,205,176,7,58,167,11,203,63,230,7,79,58,182,11,230,192,177,205,176,7,58,175,11,205,176,7,58,183,11,205,176,7,58,176,11,205,176,7,58,184,11,205,176,7,58,166,11,205,176,7,1,32,0,9,58,189,11,61,50,189,11,32,173,33,46,10,151,6,15,94,35,86,35,18,16,249,201,18,19,201,34,190,11,58,156,11,38,64,205,36,0,42,190,11,17,157,11,1,32,0,237,176,58,66,243,38,64,205,36,0,42,190,11,201,58,156,11,38,64,205,170,8,33,0,78,43,126,254,80,35,194,129,249,126,254,105,35,194,128,249,126,254,97,35,194,128,249,34,190,11,58,66,243,38,64,205,170,8,42,190,11,201,38,0,108,84,95,183,202,17,8,25,16,253,237,91,236,48,235,183,237,82,41,84,93,41,41,25,58,238,48,95,34,236,48,201,6,8,175,237,106,124,56,3,187,56,3,147,103,175,63,16,242,203,21,201,197,71,205,131,8,210,105,8,120,254,16,210,101,8,58,0,48,213,198,154,95,22,48,26,183,202,97,8,61,60,209,184,210,95,8,120,193,201,209,120,193,201,62,15,193,201,203,120,194,128,8,58,0,48,198,154,213,95,22,48,26,209,184,218,95,8,120,193,201,151,193,201,58,0,48,254,9,201,58,0,48,198,27,6,50,79,201,254,96,216,254,123,208,214,32,201,58,0,48,135,198,225,111,38,58,201,6,16,195,211,16,229,79,68,205,191,8,203,121,196,211,8,219,168,166,35,182,243,211,168,225,201,230,3,87,120,15,15,15,15,230,12,178,95,22,0,33,18,9,25,25,201,229,230,3,95,33,197,252,25,229,121,15,15,79,205,191,8,243,209,26,50,224,242,166,35,182,18,111,219,168,71,169,230,63,169,103,184,194,254,8,125,50,255,255,196,8,9,58,224,242,79,124,225,201,211,168,125,50,255,255,120,211,168,201,252,0,252,1,252,2,252,3,243,0,243,4,243,8,243,12,207,0,207,16,207,32,207,48,63,0,63,64,63,128,63,192,67,67,68,68,69,70,70,71,71,65,65,66,172,0,181,0,192,0,204,0,216,0,229,0,242,0,2,1,16,1,32,1,49,1,67,1,86,0,91,0,97,0,103,0,108,0,115,0,122,0,129,0,137,0,145,0,154,0,163,0,93,13,156,12,231,11,60,11,155,10,2,10,115,9,235,8,107,8,242,7,128,7,20,7,175,6,78,6,244,5,158,5,78,5,1,5,186,4,118,4,54,4,249,3,192,3,138,3,87,3,39,3,250,2,207,2,167,2,129,2,93,2,59,2,27,2,253,1,224,1,197,1,172,1,148,1,125,1,104,1,83,1,64,1,46,1,29,1,13,1,254,0,240,0,227,0,214,0,202,0,190,0,180,0,170,0,160,0,151,0,143,0,135,0,127,0,120,0,113,0,107,0,101,0,95,0,90,0,85,0,80,0,76,0,71,0,67,0,64,0,60,0,57,0,53,0,50,0,48,0,45,0,42,0,40,0,38,0,36,0,34,0,32,0,30,0,28,0,27,0,25,0,24,0,22,0,21,0,20,0,19,0,18,0,17,0,16,0,15,0,14,0,8,52,26,52,35,52,44,52,53,52,62,52,89,52,98,52,116,52,134,52,152,52,215,52,224,52,49,53,184,53,0,3,2,1,3,4,4,5,5,6,6,7,9,8,10,2,12,15,14,11,16,12,23,13,24,10,33,14,48,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,2,0,0,0,0,0,1,1,1,1,1,2,2,2,2,2,3,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,4,0,0,0,0,1,1,2,2,2,3,3,3,4,4,4,5,0,0,0,1,1,2,2,2,3,3,4,4,4,5,5,6,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,8,0,0,1,1,2,3,3,4,4,5,6,6,7,7,8,9,0,0,1,2,2,3,4,4,5,6,6,7,8,8,9,10,0,0,1,2,2,3,4,5,5,6,7,8,8,9,10,11,0,0,1,2,3,4,4,5,6,7,8,8,9,10,11,12,0,0,1,2,3,4,5,6,6,7,8,9,10,11,12,13,0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,15,0,0,0,4,15,12,6,6,3,2,0,0,10,9,15,0,3,10,9,5,4,2,0,1,15,4,1,131,1,15,0,0,1,1,15,32,2,15,0,15,0,15,1,0,15,10,4,6,1,255,0,140,194,130,204,131,116,131,64,131,67,131,139,130,240,131,82,131,115,129,91,130,181,130,220,130,181,130,189,0,130,177,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,29,12,0,0,0,0,195,1,13,195,58,14,0,0,0,0,195,197,12,255,255,195,102,16,195,255,14,195,75,19,64,40,35,41,118,101,114,115,105,111,110,32,50,46,52,53,32,98,121,32,82,105,110,103,46,10,13,36,62,1,50,229,51,50,179,51,58,169,51,183,196,198,34,225,251,195,137,14,243,151,50,241,11,62,32,50,165,51,6,12,62,3,17,25,63,205,41,17,6,68,151,17,88,51,205,41,17,58,193,252,33,45,0,205,12,0,254,3,62,0,50,171,51,56,12,58,177,252,203,127,40,5,62,1,50,171,51,205,80,17,205,93,16,205,154,15,205,46,17,205,26,16,205,179,16,58,66,243,50,129,18,17,214,17,205,113,14,17,204,61,6,128,62,32,205,41,17,205,49,19,58,119,48,183,32,18,58,239,11,183,194,187,12,195,187,12,62,1,50,168,51,195,157,12,195,187,12,151,50,239,11,58,240,11,183,192,58,241,11,183,192,225,251,195,137,14,151,50,116,48,50,119,48,60,50,241,11,205,54,12,151,50,241,11,201,58,175,51,183,32,31,17,231,12,205,223,16,225,55,201,195,222,176,192,32,182,222,32,77,76,79,65,68,32,187,218,195,178,207,190,221,0,225,34,27,51,243,62,184,50,231,48,58,239,11,183,204,35,14,205,26,16,58,230,48,183,194,136,13,205,23,17,205,187,17,205,134,15,205,188,17,62,1,50,230,48,58,119,48,183,194,167,13,17,207,48,6,12,62,1,205,41,17,58,169,51,183,40,7,151,50,215,48,50,214,48,58,158,51,183,194,91,13,58,39,51,183,194,91,13,205,80,17,205,114,17,33,50,51,17,80,48,1,24,0,237,176,42,27,51,58,39,51,183,202,127,13,58,224,58,198,207,79,6,48,10,183,6,6,202,230,16,62,1,50,157,51,229,195,29,12,205,14,19,62,1,50,240,11,205,58,14,151,50,240,11,58,158,51,50,39,51,183,202,41,13,205,46,17,195,41,13,42,27,51,35,35,126,254,34,202,71,13,254,42,202,239,13,205,146,8,254,65,202,0,14,254,66,202,0,14,254,67,202,0,14,254,60,202,5,14,254,62,202,19,14,254,82,202,27,14,254,48,218,171,13,254,58,210,171,13,214,49,198,207,79,6,48,62,1,2,195,171,13,17,207,48,6,12,62,1,205,41,17,151,50,39,51,195,85,13,214,7,195,226,13,17,207,48,6,9,62,1,18,19,16,252,195,171,13,17,216,48,6,3,195,10,14,17,213,48,6,3,195,10,14,62,1,50,241,11,151,50,119,48,229,213,197,205,164,12,151,50,241,11,193,209,225,201,243,205,154,15,205,93,16,151,50,157,51,58,240,11,183,192,225,195,137,14,33,0,0,84,95,25,16,253,201,229,42,166,51,190,48,2,225,201,119,24,251,241,221,33,111,64,205,89,1,79,5,129,16,253,201,229,235,94,35,86,35,122,254,254,40,6,48,7,120,18,24,241,67,24,238,225,201,183,201,58,242,51,183,62,0,192,58,119,48,183,40,241,35,126,183,40,236,254,58,40,232,24,245,126,254,36,200,95,229,14,2,205,5,0,225,35,24,241,205,171,18,151,50,222,58,221,33,164,94,205,180,18,201,221,229,197,229,205,188,17,225,205,176,14,229,213,205,187,17,209,225,193,221,225,201,35,126,183,200,254,58,200,254,32,40,245,201,58,193,252,245,253,225,42,102,246,201,126,254,45,202,251,14,254,48,218,253,14,254,58,210,253,14,55,201,183,201,151,50,122,48,50,123,48,253,33,122,48,126,50,191,51,254,45,204,74,15,214,48,253,119,2,35,205,235,14,48,47,214,48,253,119,3,35,205,235,14,48,44,214,48,253,119,4,253,33,124,48,217,205,108,15,125,217,245,58,191,51,254,45,202,67,15,241,201,241,197,71,151,144,193,201,35,126,201,253,33,122,48,43,195,50,15,253,33,123,48,195,81,15,197,213,22,0,106,6,8,41,48,1,25,16,250,209,193,201,253,94,0,22,0,38,100,205,92,15,229,253,94,1,38,10,205,92,15,193,9,253,94,2,25,201,6,12,33,80,48,94,44,126,254,255,202,151,15,87,44,151,18,16,242,201,33,30,18,205,23,17,17,246,15,205,113,14,62,7,30,184,205,26,34,61,30,0,205,26,34,6,9,62,48,30,53,205,3,34,60,16,250,33,32,5,34,183,61,62,22,93,205,3,34,198,16,92,205,3,34,33,80,5,34,185,61,62,23,93,205,3,34,198,16,92,205,3,34,33,192,1,34,187,61,62,24,93,205,3,34,198,16,92,205,3,34,201,184,254,231,48,0,254,176,51,223,58,222,58,64,48,38,51,65,48,210,51,213,51,212,51,250,50,22,254,213,50,217,50,221,50,0,255,33,225,58,6,12,54,30,44,54,0,44,16,248,33,180,48,17,128,60,6,12,54,0,44,54,30,44,62,76,18,28,62,52,18,28,28,28,16,238,151,50,240,51,50,233,51,50,234,51,58,169,51,183,200,62,54,6,3,30,85,205,3,34,60,16,250,201,17,207,48,151,6,12,205,41,17,62,48,6,9,30,15,205,3,34,60,16,250,58,169,51,183,194,136,16,62,32,6,9,30,0,205,3,34,60,16,250,195,160,16,62,32,6,6,30,0,205,3,34,60,16,250,30,255,62,54,6,3,205,3,34,60,16,250,62,8,6,3,30,0,205,26,34,60,16,250,201,4,184,216,5,120,201,229,33,80,48,6,24,62,255,119,35,16,252,33,0,0,34,254,51,225,201,229,213,197,245,205,188,17,241,193,209,225,201,32,105,110,32,84,82,75,0,10,13,39,0,26,183,200,19,223,24,249,205,199,16,17,15,17,205,223,16,120,254,20,48,18,254,10,48,5,198,48,223,55,201,62,49,223,120,214,10,195,248,16,62,50,223,120,214,20,195,248,16,7,69,82,82,79,82,32,0,94,35,86,35,122,183,200,70,35,126,35,18,19,16,252,195,23,17,18,19,16,252,201,33,137,33,17,3,34,1,23,0,237,176,33,179,33,17,26,34,1,31,0,237,176,33,195,33,17,57,34,1,10,0,237,176,201,33,114,33,17,3,34,1,23,0,237,176,33,148,33,17,26,34,1,31,0,237,176,33,190,33,17,57,34,1,10,0,237,176,201,33,120,51,6,9,203,166,44,16,251,58,102,51,230,224,50,102,51,33,88,51,151,94,205,3,34,44,60,254,25,204,180,17,254,41,204,180,17,254,57,56,236,151,50,153,51,50,154,51,50,155,51,33,145,51,6,10,94,205,26,34,44,60,16,248,201,198,7,17,7,0,25,201,201,201,35,126,254,32,192,195,189,17,42,254,51,35,34,254,51,201,42,254,51,43,24,246,195,165,8,26,254,73,62,255,254,74,62,75,62,0,254,216,58,217,58,159,51,158,51,157,51,87,51,168,51,210,51,240,11,230,48,39,51,160,51,161,51,162,51,228,51,62,63,251,50,229,51,255,62,32,254,169,51,183,254,31,63,185,254,32,63,187,254,33,63,120,254,241,51,0,255,1,48,12,0,38,48,24,15,40,51,9,0,141,48,12,3,154,48,9,5,163,48,3,10,167,48,12,0,25,48,9,48,215,51,12,8,181,51,9,0,27,50,12,0,235,51,5,5,75,51,9,1,0,59,200,0,200,59,184,0,128,56,60,0,176,58,12,0,128,60,48,32,37,63,24,0,68,48,12,0,12,63,12,0,188,58,12,0,106,62,84,0,27,50,183,0,0,0,247,0,75,19,201,213,205,147,18,123,203,127,209,200,47,60,246,128,201,205,171,18,221,33,47,84,24,24,221,33,178,47,24,34,221,33,58,48,24,28,34,27,51,253,42,192,252,221,34,29,51,201,205,28,0,221,42,29,51,201,205,28,0,42,27,51,24,243,33,210,18,17,117,249,1,26,0,237,176,195,117,249,58,193,252,38,64,205,36,0,221,34,130,249,205,0,0,34,149,249,58,66,243,38,64,195,36,0,62,1,50,240,11,205,178,12,151,50,240,11,201,0,32,32,32,32,32,32,32,32,79,80,88,30,5,195,100,14,30,24,24,249,151,50,251,50,221,33,226,50,6,12,221,126,12,183,32,9,221,54,0,15,221,35,16,242,201,221,54,0,0,221,54,12,15,24,241,17,226,50,62,15,6,12,205,41,17,151,6,12,205,41,17,201,229,193,33,117,249,237,176,201,201,243,58,157,51,183,202,193,34,62,1,50,24,63,58,176,51,183,32,22,58,240,51,60,50,240,51,254,60,56,11,151,50,240,51,42,233,51,35,34,233,51,151,50,0,48,58,38,51,183,40,78,58,37,51,61,50,37,51,32,69,58,36,51,50,37,51,17,226,50,6,12,14,0,26,214,1,56,3,194,158,19,12,151,18,28,44,16,241,121,254,12,194,189,19,62,1,50,240,11,205,58,14,62,1,50,176,51,50,251,50,151,50,240,11,62,1,50,179,51,50,229,51,58,169,51,183,196,198,34,58,0,48,198,16,50,177,51,198,11,50,196,34,198,5,50,178,51,198,43,50,194,34,198,132,111,38,48,126,183,202,43,21,125,214,206,111,126,183,194,241,20,58,0,48,135,198,80,111,38,48,34,250,51,94,44,86,213,221,225,42,196,34,126,230,254,119,58,0,48,198,181,111,38,51,30,0,115,221,126,0,221,35,50,116,48,230,63,254,47,210,152,34,135,79,6,0,33,54,20,9,94,35,86,235,233,64,24,121,24,137,24,156,24,183,24,226,24,102,27,184,27,202,27,88,28,157,28,202,28,11,30,45,30,99,30,122,30,140,30,150,30,160,30,177,30,194,30,216,30,229,30,10,31,49,31,93,31,120,31,147,31,169,31,182,31,203,31,225,31,250,31,10,32,26,32,34,32,41,32,71,32,99,32,134,32,149,32,201,32,211,32,224,32,249,32,17,33,45,33,151,50,64,48,50,250,50,42,250,51,221,229,209,115,44,114,58,179,51,183,196,68,26,58,0,48,60,50,0,48,254,7,194,197,20,71,58,169,51,183,120,202,197,20,62,9,50,0,48,254,12,218,204,19,14,6,219,170,230,240,129,211,170,219,169,203,95,202,225,20,58,39,51,183,194,88,19,58,231,48,95,62,7,205,26,34,151,50,229,51,195,193,34,61,119,95,58,39,51,183,194,164,20,205,136,34,218,43,21,229,58,0,48,60,111,38,51,126,147,38,58,190,218,42,21,205,202,36,210,76,21,6,50,205,250,33,95,203,163,58,178,51,205,3,34,42,194,34,54,1,225,151,50,87,51,237,75,196,34,10,203,71,194,198,21,203,79,194,108,22,203,87,194,118,23,205,202,36,210,223,28,195,164,20,42,194,34,126,183,194,42,21,58,0,48,214,9,135,135,198,211,111,38,50,62,3,119,44,62,1,119,44,94,22,61,28,28,28,28,26,183,194,37,21,58,0,48,61,30,0,205,26,34,195,37,21,58,210,51,183,202,164,20,58,211,51,60,50,211,51,95,58,67,48,203,191,187,194,164,20,58,67,48,95,62,6,205,57,34,203,123,194,190,21,60,254,32,210,185,21,95,62,6,205,26,34,151,50,211,51,195,164,20,62,31,195,172,21,61,242,172,21,151,195,172,21,50,40,50,6,1,205,245,33,203,127,245,203,191,87,6,14,205,245,33,79,45,37,37,241,126,194,1,22,129,39,119,30,0,203,19,125,198,25,111,78,198,12,111,70,123,130,38,0,111,9,205,30,22,58,40,50,195,57,21,145,39,119,14,0,203,17,125,198,25,111,94,198,12,111,70,121,130,38,0,111,80,235,183,237,82,195,248,21,58,0,48,254,9,48,50,93,58,177,51,205,3,34,237,91,194,34,26,183,92,40,18,58,178,51,205,3,34,235,198,18,111,38,48,114,214,12,111,115,201,217,6,226,205,245,33,217,183,202,53,22,203,227,195,53,22,214,9,135,93,205,26,34,60,92,205,26,34,235,58,0,48,198,50,195,62,22,50,40,50,203,95,194,151,22,58,0,48,60,111,38,51,126,147,87,6,115,205,245,33,95,122,147,218,145,22,6,27,205,245,33,246,8,119,58,40,50,195,62,21,6,79,205,245,33,183,40,22,61,202,37,23,205,30,22,195,145,22,205,202,36,218,145,22,58,40,50,195,111,22,205,18,23,194,145,22,253,86,232,6,38,205,250,33,79,125,198,12,111,70,203,122,194,13,23,38,0,106,9,205,202,36,210,163,22,203,122,32,25,203,68,40,195,125,254,89,218,163,22,198,82,111,124,230,14,254,14,210,163,22,36,195,163,22,203,68,194,163,22,125,254,163,210,163,22,214,94,111,124,230,14,202,163,22,37,195,163,22,38,255,195,208,22,6,127,205,245,33,60,119,229,253,225,253,190,196,192,151,253,119,0,201,205,18,23,194,145,22,6,55,205,245,33,60,119,229,253,225,253,190,36,194,70,23,253,126,84,47,253,119,84,151,253,119,0,6,38,205,250,33,95,125,198,12,111,86,253,78,48,253,126,84,183,32,7,205,107,23,25,195,163,22,205,107,23,183,235,237,82,195,163,22,105,203,121,40,3,38,255,201,38,0,201,50,40,50,203,111,194,155,23,203,103,194,161,23,36,36,36,126,147,87,6,175,205,245,33,95,122,147,56,8,6,27,205,245,33,246,16,119,58,40,50,195,67,21,6,187,205,245,33,60,119,95,125,214,36,111,126,187,32,234,125,198,36,111,30,0,115,198,12,111,126,238,1,119,202,250,23,125,214,36,111,126,79,205,202,36,210,240,23,6,154,205,250,33,129,205,222,36,95,205,202,36,210,17,24,6,25,205,250,33,131,95,58,0,48,198,48,205,3,34,195,155,23,58,0,48,61,205,57,34,195,211,23,205,202,36,210,5,24,14,0,195,200,23,198,198,111,38,51,94,214,199,79,195,37,24,123,183,202,46,24,58,0,48,198,198,111,38,51,214,199,79,205,57,34,119,121,205,26,34,195,155,23,151,201,237,91,196,34,26,203,239,18,30,0,58,0,48,61,79,195,37,24,205,202,36,210,115,24,205,136,34,218,86,24,205,213,24,30,1,6,75,205,221,33,30,0,6,207,205,231,33,33,207,48,151,6,12,134,44,16,252,183,194,148,20,62,1,50,176,51,195,148,20,205,117,34,195,86,24,221,94,0,221,35,6,154,205,231,33,50,179,51,195,26,20,205,228,34,221,126,0,221,35,2,12,221,126,0,221,35,2,195,26,20,221,126,0,221,35,95,6,141,205,231,33,195,26,20,58,0,48,198,12,111,38,63,54,1,195,26,20,205,136,34,218,7,31,6,75,30,1,205,221,33,205,202,36,48,6,205,213,24,195,46,25,205,117,34,195,46,25,6,50,205,250,33,95,58,178,51,205,3,34,201,205,208,36,194,112,26,58,0,48,198,176,111,38,58,54,1,205,202,36,210,226,26,42,196,34,126,230,199,119,58,179,51,183,196,68,26,205,192,25,58,226,48,95,58,177,51,205,3,34,58,227,48,95,58,178,51,205,3,34,6,226,205,245,33,183,202,46,25,203,227,58,178,51,205,3,34,205,11,26,21,58,0,48,60,111,38,48,114,38,51,114,38,48,198,67,111,115,214,67,79,20,221,126,0,254,7,202,242,25,58,116,48,230,63,254,8,194,97,25,221,126,1,254,7,202,242,25,6,215,205,240,33,71,38,0,108,90,84,25,16,253,30,8,205,39,8,93,105,38,58,115,58,116,48,230,63,254,4,202,148,20,205,208,36,194,177,25,38,50,125,198,54,111,30,0,115,198,72,111,115,198,12,111,115,198,48,111,115,198,12,111,115,214,124,111,36,115,42,196,34,126,230,7,119,195,148,20,254,2,202,137,25,6,75,30,0,205,221,33,195,148,20,221,126,0,221,35,79,58,0,48,111,38,63,113,58,223,58,183,194,229,25,205,244,34,237,91,226,48,6,38,205,231,33,198,12,111,114,201,205,238,34,151,50,223,58,205,196,32,195,215,25,30,255,195,117,25,205,228,34,10,95,12,10,87,195,33,26,30,0,221,86,0,221,35,24,22,58,116,48,203,127,202,247,25,203,119,32,235,221,94,0,221,86,1,221,35,221,35,229,6,68,205,250,33,225,131,95,71,58,165,51,184,40,3,56,1,201,20,79,120,145,95,58,165,51,187,192,20,30,0,201,20,201,58,229,51,183,32,4,151,50,179,51,205,202,36,208,205,136,34,218,198,34,58,0,48,198,154,111,38,48,94,214,129,111,126,179,95,58,0,48,198,48,205,3,34,201,58,223,58,183,194,142,26,58,0,48,198,12,111,38,63,126,54,0,183,125,214,12,111,126,221,190,0,202,221,26,205,202,36,210,197,26,58,179,51,183,196,68,26,6,75,205,240,33,183,14,16,202,168,26,14,0,197,205,192,25,58,226,48,95,58,177,51,205,3,34,58,227,48,193,177,95,58,178,51,205,3,34,195,46,25,205,192,25,237,91,226,48,58,0,48,214,9,135,205,26,34,90,60,205,26,34,195,46,25,221,35,195,46,25,8,205,208,36,32,32,8,214,9,135,135,198,211,111,38,50,22,0,114,44,114,44,94,44,114,22,61,26,205,77,27,58,0,48,61,205,26,34,205,192,25,237,91,226,48,58,0,48,214,9,135,205,26,34,90,60,205,26,34,58,210,51,183,202,46,25,58,0,48,71,58,66,48,184,194,46,25,205,208,36,194,62,27,58,65,48,95,62,6,205,26,34,151,50,211,51,195,46,25,42,196,34,126,230,231,119,201,203,127,194,99,27,8,58,0,48,198,154,111,38,48,94,8,28,187,29,208,95,201,30,0,201,221,126,0,221,35,203,127,194,137,27,135,135,135,135,95,221,86,255,6,25,205,231,33,38,63,122,119,62,1,50,179,51,195,26,20,203,191,38,0,111,6,52,79,41,41,41,9,151,6,8,94,205,3,34,35,60,16,248,221,126,0,221,35,50,212,51,221,126,0,221,35,50,213,51,30,0,221,86,253,195,120,27,58,250,50,183,32,8,62,1,50,64,48,195,26,20,62,2,24,246,221,35,6,27,205,245,33,246,1,119,6,13,30,0,205,231,33,205,202,36,210,39,28,221,126,255,221,78,0,230,192,202,20,28,254,128,194,0,28,205,244,34,205,26,28,205,238,34,205,216,35,195,226,24,62,1,50,223,58,205,144,32,205,238,34,205,26,28,205,244,34,195,250,27,205,244,34,195,11,28,42,226,48,34,234,48,221,126,255,230,63,79,201,221,78,0,205,244,34,221,126,255,230,192,202,11,28,254,128,194,73,28,205,196,32,205,26,28,205,244,34,205,144,32,195,250,27,205,144,32,205,26,28,205,244,34,205,196,32,195,250,27,205,38,37,6,27,205,245,33,246,2,230,247,119,221,126,0,221,35,95,6,79,205,226,33,123,183,229,253,225,194,146,28,221,126,0,253,119,24,221,126,1,253,119,244,221,126,2,253,119,36,1,3,0,221,9,195,26,20,221,126,0,221,35,253,119,12,195,120,28,205,38,37,6,27,205,245,33,246,4,230,239,119,58,0,48,198,151,111,38,50,229,253,225,221,126,0,253,119,0,221,126,1,253,119,12,221,126,2,253,119,24,195,138,28,58,0,48,214,9,135,135,198,213,111,38,50,221,126,0,221,35,119,195,26,20,58,0,48,214,9,135,135,198,211,111,38,50,126,254,1,202,46,29,254,2,202,161,29,254,3,202,215,29,58,0,48,61,205,57,34,95,35,35,78,6,61,10,131,95,6,154,229,205,250,33,225,187,210,36,29,71,30,1,45,45,115,30,0,44,115,44,44,115,88,58,0,48,61,205,26,34,195,128,21,44,44,94,22,61,28,26,183,202,128,29,45,126,60,119,79,28,26,203,191,185,194,101,29,58,0,48,61,205,57,34,79,26,203,127,194,124,29,13,121,205,222,36,75,95,58,0,48,61,205,26,34,89,151,119,44,44,126,60,119,79,29,26,185,194,128,21,45,45,151,119,45,62,2,119,195,128,21,12,195,85,29,58,0,48,61,205,57,34,79,28,26,203,127,194,155,29,95,121,147,205,222,36,71,30,2,195,25,29,203,191,129,195,146,29,35,126,60,119,95,35,78,6,61,12,12,12,10,203,191,187,194,128,21,43,151,119,58,0,48,61,205,57,34,95,10,203,127,194,206,29,29,123,205,222,36,95,195,36,29,28,123,205,222,36,95,195,36,29,35,126,60,119,95,35,78,6,61,12,12,12,12,10,60,187,194,128,21,43,151,119,58,0,48,61,205,57,34,61,202,255,29,205,222,36,95,195,36,29,6,75,30,1,205,221,33,30,0,195,36,29,205,68,34,60,254,7,210,40,30,119,205,99,34,221,126,0,221,35,119,35,221,229,209,115,35,114,195,26,20,62,17,195,157,34,205,99,34,183,202,94,30,126,183,202,62,30,61,119,202,86,30,205,99,34,44,44,44,221,229,209,27,115,35,114,45,45,86,45,94,213,221,225,195,26,20,205,68,34,61,119,195,26,20,62,11,195,157,34,221,126,0,221,35,205,110,30,195,26,20,50,36,51,50,37,51,62,1,50,38,51,201,221,126,0,221,35,95,58,0,48,198,40,38,51,111,115,195,26,20,205,213,36,10,203,143,2,195,26,20,205,213,36,10,203,151,2,195,26,20,221,126,0,221,35,50,65,48,95,62,6,205,26,34,195,26,20,221,126,0,221,35,50,231,48,95,62,7,205,26,34,195,26,20,221,126,0,221,35,50,67,48,58,0,48,50,66,48,62,1,50,210,51,195,26,20,221,94,0,221,35,6,215,205,221,33,195,26,20,62,1,50,182,58,58,179,51,183,196,198,34,58,232,50,183,202,5,31,30,32,62,14,205,3,34,221,94,0,205,3,34,221,35,195,46,25,221,126,0,221,35,111,38,61,94,221,126,0,221,35,205,3,34,198,16,35,94,205,3,34,221,126,255,198,9,111,38,63,221,126,254,119,195,26,20,221,126,0,221,35,183,202,76,31,61,198,235,111,38,51,221,126,0,221,35,119,205,198,34,195,26,20,221,126,0,221,35,33,235,51,6,5,119,35,16,252,195,70,31,205,155,8,221,126,0,119,221,35,44,221,126,0,119,221,35,221,126,0,50,241,51,221,35,195,26,20,221,78,0,221,70,1,197,221,225,237,75,245,51,221,9,58,0,48,198,188,111,38,58,52,195,26,20,6,154,205,250,33,183,202,26,20,61,95,205,231,33,62,1,50,179,51,195,26,20,6,154,205,250,33,60,254,16,210,26,20,24,231,6,5,33,235,51,126,183,202,197,31,50,179,51,61,119,44,16,243,195,26,20,6,5,33,235,51,126,60,50,179,51,254,16,210,219,31,119,44,16,242,195,26,20,58,39,51,183,202,26,20,151,50,39,51,205,80,17,205,114,17,62,1,50,158,51,195,26,20,221,126,0,221,35,221,94,0,221,35,205,3,34,195,26,20,221,126,0,221,35,221,94,0,221,35,205,26,34,195,26,20,62,1,50,227,51,195,26,20,151,50,210,51,195,26,20,205,57,32,60,119,221,229,193,11,44,113,44,112,195,26,20,58,0,48,71,135,135,128,198,128,111,38,56,126,201,205,57,32,183,40,17,254,1,202,26,20,44,44,44,78,44,70,197,221,225,195,26,20,62,13,195,157,34,205,57,32,183,40,245,254,2,202,129,32,44,78,44,70,197,221,43,221,229,193,44,113,44,112,221,225,195,26,20,151,119,195,26,20,58,176,51,60,50,176,51,195,26,20,62,1,50,222,58,6,141,205,250,33,60,119,254,9,210,173,32,58,222,58,183,202,170,24,151,50,222,58,201,58,222,58,183,62,14,202,157,34,193,58,223,58,183,62,14,202,157,34,193,195,157,34,62,1,50,222,58,6,141,205,250,33,61,119,195,156,32,221,94,0,221,35,6,167,205,231,33,195,26,20,58,0,48,135,198,37,111,38,63,221,126,0,221,35,119,221,126,0,221,35,44,119,195,26,20,205,99,34,183,202,94,30,126,61,194,26,20,44,44,44,94,44,86,213,221,225,195,26,20,205,89,33,183,202,40,33,205,107,33,94,44,86,213,221,225,42,224,50,53,195,26,20,62,19,195,157,34,205,89,33,60,254,4,48,31,119,205,107,33,221,229,193,3,113,44,112,221,126,0,221,35,135,198,190,111,38,62,94,44,86,213,221,225,195,26,20,62,20,195,157,34,58,0,48,71,135,135,135,144,198,106,111,38,62,126,34,224,50,201,45,71,44,44,16,252,201,245,197,254,48,212,113,36,211,124,205,204,33,123,211,125,205,204,33,193,241,195,137,33,229,198,88,111,38,51,115,214,88,225,201,254,8,202,173,33,254,9,202,173,33,254,10,202,173,33,211,160,245,123,211,161,241,195,179,33,205,139,36,195,163,33,229,198,145,111,38,51,115,214,145,225,201,211,160,219,162,201,229,198,145,111,38,51,126,225,201,58,171,51,183,200,6,7,219,230,79,219,230,145,184,56,250,201,38,51,195,233,33,38,50,195,233,33,38,48,58,0,48,128,111,115,201,38,51,195,252,33,38,50,195,252,33,38,48,58,0,48,128,111,126,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,201,58,0,48,6,0,33,0,59,254,8,210,93,34,135,135,135,135,135,79,9,126,50,206,51,201,214,8,4,195,81,34,205,68,34,61,79,135,135,129,79,6,0,9,35,58,206,51,71,201,58,0,48,214,9,135,135,198,211,79,6,50,62,3,2,151,12,2,201,58,169,51,183,200,58,0,48,254,6,40,2,183,201,55,201,62,12,195,157,34,50,217,58,58,0,48,50,218,58,62,1,50,240,11,205,58,14,151,50,240,11,195,193,34,97,98,111,114,116,32,105,110,32,84,82,75,201,0,51,0,50,33,235,51,62,54,94,205,3,34,6,2,44,60,87,78,44,126,135,135,135,135,177,95,122,205,3,34,16,238,201,58,0,48,135,198,180,79,6,48,201,33,49,58,195,247,34,33,25,58,34,14,51,151,50,117,48,6,167,205,250,33,87,205,202,36,210,123,35,198,25,38,48,111,126,50,221,58,183,194,50,35,58,0,48,198,37,111,38,63,126,205,173,35,44,70,58,213,51,128,50,228,51,58,212,51,205,173,35,121,135,42,14,51,205,149,35,6,141,205,250,33,71,58,221,58,183,120,194,89,35,58,228,51,128,71,58,117,48,128,203,127,32,23,254,8,48,22,135,79,125,214,101,111,38,51,126,177,71,58,227,48,128,50,227,48,201,151,24,235,62,14,24,231,121,254,5,62,249,192,13,201,6,141,205,250,33,71,58,117,48,128,135,135,135,71,135,128,71,121,135,128,33,62,63,195,149,35,6,0,79,9,78,44,70,106,203,125,32,7,38,0,9,34,226,48,201,38,255,195,163,35,203,127,202,199,35,237,68,71,121,144,218,188,35,79,201,198,12,79,58,117,48,61,50,117,48,201,129,254,12,218,186,35,214,12,79,58,117,48,60,50,117,48,201,42,226,48,237,91,234,48,151,237,82,34,236,48,221,229,221,35,205,11,26,221,225,122,61,50,238,48,95,203,124,62,0,202,7,36,124,47,103,125,47,111,35,34,236,48,62,128,50,191,51,205,39,8,125,50,239,48,58,238,48,71,58,239,48,205,5,8,205,39,8,125,50,240,48,58,238,48,71,58,240,48,205,5,8,205,39,8,69,58,240,48,135,135,135,135,176,95,6,14,205,226,33,58,239,48,71,58,191,51,176,95,6,1,195,226,33,0,95,58,0,48,198,226,111,38,50,126,135,135,135,135,201,22,255,195,103,36,147,218,92,36,22,0,95,33,143,55,25,94,62,15,147,201,254,54,210,158,36,8,123,217,79,230,15,205,77,36,205,97,36,95,121,230,240,179,217,95,8,201,8,123,217,205,77,36,131,95,22,0,33,128,55,25,126,217,95,8,201,8,58,169,51,183,202,119,36,123,217,79,230,15,205,77,36,205,97,36,71,121,203,63,203,63,203,63,203,63,205,77,36,205,97,36,135,135,135,135,176,217,95,8,201,58,0,48,254,9,201,58,64,48,183,201,58,0,48,198,27,6,50,79,201,197,71,205,202,36,210,12,37,120,254,16,210,8,37,58,0,48,213,198,154,95,22,48,26,183,202,4,37,61,60,209,184,210,2,37,120,193,201,209,120,193,201,62,15,193,201,203,120,194,35,37,58,0,48,198,154,213,95,22,48,26,209,184,218,2,37,120,193,201,151,193,201,62,1,50,250,50,201],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+1170434);allocate([78,111,116,32,97,32,111,112,120,32,102,105,108,101,46,0,58,64,130,61,33,1,0,25,119,50,64,130,193,12,12,33,2,0,25,113,33,18,0,57,126,60,60,33,18,0,57,119,33,3,0,25,119,33,18,0,57,235,34,68,130,235,94,22,0,105,38,0,197,205,141,117,41,41,41,205,211,115,229,42,68,130,235,33,4,0,25,235,34,68,130,235,209,115,35,114,33,20,0,57,94,22,0,225,38,0,125,50,65,130,205,141,117,41,41,41,205,211,115,235,42,68,130,77,68,33,6,0,9,115,35,114,33,6,0,9,229,105,96,34,68,130,225,197,78,35,70,197,42,68,130,235,33,4,0,25,78,35,70,197,33,24,0,57,110,229,33,65,130,78,33,64,130,94,58,63,130,205,203,74,193,193,193,33,2,0,57,77,68,30,0,62,32,205,1,72,175,50,66,130,42,65,130,189,210,189,77,30,0,33,67,130,115,123,33,20,0,57,190,210,179,77,213,42,66,130,44,45,194,225,76,28,29,194,225,76,62,24,195,115,77,44,45,194,247,76,229,33,24,0,57,126,61,225,187,194,247,76,62,26,195,115,77,58,65,130,61,189,194,9,77,28,29,194,9,77,62,25,195,115,77,58,65,130,61,189,194,34,77,229,33,24,0,57,126,61,225,187,194,34,77,62,27,195,115,77,44,45,202,47,77,58,65,130,61,189,194,52,77,62,22,195,115,77,28,29,202,69,77,229,33,24,0,57,126,61,225,187,194,74,77,62,23,195,115,77,125,50,66,130,33,24,0,57,110,229,33,6,0,57,229,14,1,197,58,64,130,131,95,58,63,130,42,66,130,133,14,1,205,199,73,193,193,193,195,170,77,30,0,245,125,50,66,130,241,33,12,0,57,77,68,205,1,72,33,24,0,57,110,229,33,14,0,57,229,14,1,197,58,64,130,42,67,130,133,95,58,63,130,33,66,130,78,129,14,1,205,199,73,193,193,193,209,28,33,67,130,115,195,197,76,58,66,130,60,50,66,130,195,184,76,225,235,33,16,0,57,249,235,201,235,33,6,0,25,78,35,70,213,197,33,4,0,25,78,35,70,197,33,3,0,25,110,229,33,2,0,25,78,197,33,1,0,25,75,66,94,10,193,205,99,74,193,193,193,193,33,4,0,9,126,35,102,111,197,205,213,114,80,105,97,51,52,53,54,55,0,0,14,0,0,0,0,0,34,27,240,15,0,0,0,0,33,0,240,15,0,0,0,0,0,115,108,111,116,32,60,32,48,120,49,48,0,47,85,115,101,114,115,47,111,107,97,122,97,107,105,47,103,105,116,47,100,105,103,105,116,97,108,45,115,111,117,110,100,45,97,110,116,105,113,117,101,115,47,109,115,120,112,108,97,121,45,106,115,47,109,111,100,117,108,101,115,47,108,105,98,107,115,115,47,115,114,99,47,118,109,47,109,109,97,112,46,99,0,77,77,65,80,95,115,101,116,95,98,97,110,107,95,97,116,116,114,0,98,97,110,107,32,60,32,48,120,49,48,48,0,77,77,65,80,95,115,101,108,101,99,116,95,98,97,110,107],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+1186818);allocate([77,77,65,80,95,115,101,116,95,98,97,110,107,95,100,97,116,97,0,77,77,65,80,95,117,110,115,101,116,95,98,97,110,107,0,97,100,114,32,60,32,48,120,49,48,48,48,48,0,77,77,65,80,95,114,101,97,100,95,109,101,109,111,114,121,0,77,77,65,80,95,119,114,105,116,101,95,109,101,109,111,114,121,0,118,109,45,62,109,109,97,112,0,47,85,115,101,114,115,47,111,107,97,122,97,107,105,47,103,105,116,47,100,105,103,105,116,97,108,45,115,111,117,110,100,45,97,110,116,105,113,117,101,115,47,109,115,120,112,108,97,121,45,106,115,47,109,111,100,117,108,101,115,47,108,105,98,107,115,115,47,115,114,99,47,118,109,47,118,109,46,99,0,86,77,95,110,101,119,0,118,109,0,86,77,95,105,110,105,116,95,109,101,109,111,114,121,0,48,0,195,1,0,195,9,0,0,211,160,219,162,201,0,86,77,95,105,110,105,116,95,98,97,110,107,0,66,84,79,0,254,0,0,69,19,0,0,66,84,79,32,75,73,78,82,79,85,32,53,116,104,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,195,114,96,195,53,97,195,55,97,195,153,103,195,217,101,195,15,99,195,37,99,195,57,99,195,180,99,195,210,99,195,169,100,195,211,100,195,215,100,195,230,100,195,237,96,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,243,50,113,96,183,32,34,60,50,113,96,33,0,128,6,128,58,162,252,230,7,135,33,217,96,22,0,95,25,94,35,86,235,17,199,113,1,0,2,237,176,17,228,102,33,16,96,205,151,102,17,50,103,33,17,96,205,151,102,175,50,83,96,33,45,0,58,193,252,205,12,0,33,164,101,254,3,56,3,33,134,101,34,132,101,205,217,101,33,89,96,17,90,96,1,17,0,54,0,243,237,176,201,199,113,70,115,15,116,138,116,139,117,48,118,213,118,199,113,15,116,139,117,251,205,37,99,183,192,33,199,113,17,0,176,62,1,205,55,97,243,33,159,253,17,48,97,1,5,0,237,176,62,195,50,159,253,33,45,97,34,160,253,251,205,37,99,183,32,250,205,217,101,243,33,48,97,17,159,253,1,5,0,237,176,251,201,205,153,103,0,0,0,0,0,229,209,243,205,96,97,216,33,1,0,34,108,96,125,50,111,96,58,17,96,230,3,15,15,95,15,15,179,50,123,102,58,17,96,230,12,135,135,50,136,102,183,201,50,78,96,34,84,96,229,213,205,222,101,42,84,96,14,0,205,230,100,62,0,50,188,105,56,1,125,50,112,96,209,225,126,50,110,96,254,2,63,216,183,237,82,34,86,96,205,215,98,42,84,96,221,33,70,115,6,17,35,197,94,35,86,35,123,178,40,7,235,237,75,86,96,9,235,221,115,0,221,114,1,1,32,0,221,9,193,16,226,58,16,96,183,33,70,115,6,9,204,203,98,58,17,96,183,33,198,116,6,5,204,203,98,6,17,221,33,70,115,197,205,42,98,1,32,0,221,9,193,16,244,205,101,98,17,102,117,62,8,1,9,0,33,194,98,237,176,61,32,245,33,77,115,1,1,17,126,183,40,7,17,32,0,25,16,246,13,121,50,77,96,58,17,96,183,200,33,254,191,30,0,205,115,102,33,0,144,30,63,205,115,102,33,143,152,30,31,205,115,102,183,201,221,110,0,221,102,1,221,117,2,221,116,3,124,181,62,3,40,1,175,221,119,7,94,35,86,35,126,235,237,75,86,96,9,221,117,4,221,116,5,221,119,6,221,229,225,17,8,0,25,235,33,175,98,1,19,0,237,176,201,58,112,96,183,200,230,2,40,5,62,33,50,188,105,58,112,96,230,1,200,42,84,96,17,37,0,25,6,17,221,33,70,115,197,221,126,0,221,182,1,40,21,94,35,86,43,123,178,40,13,235,237,75,86,96,9,221,117,0,221,116,1,235,35,35,1,32,0,221,9,193,16,216,201,0,0,0,0,8,0,0,0,0,10,0,1,0,0,0,0,0,0,0,31,31,15,31,0,8,0,0,0,54,0,35,54,0,17,31,0,25,16,245,201,58,110,96,183,32,28,33,1,99,6,7,126,35,94,35,205,131,101,16,247,33,27,116,17,28,116,1,4,0,54,0,237,176,201,62,14,30,0,205,131,101,201,14,32,22,84,23,84,24,84,38,8,39,8,40,4,254,64,218,22,99,62,64,183,32,1,60,243,50,81,96,50,82,96,50,79,96,201,58,107,96,47,230,2,42,77,96,44,45,42,108,96,40,2,60,201,175,201,243,58,107,96,47,50,107,96,183,40,108,221,33,102,116,6,3,62,8,30,0,205,195,104,60,17,32,0,221,25,16,243,58,16,96,183,40,44,221,33,70,115,14,48,42,84,96,126,183,6,9,245,32,2,6,6,197,205,115,106,246,15,95,193,197,121,205,131,101,1,32,0,221,9,193,12,16,234,241,204,161,99,58,17,96,183,40,15,6,5,33,138,152,197,30,0,205,115,102,35,193,16,246,201,6,3,62,54,30,255,197,205,131,101,60,193,16,248,201,205,235,99,201,254,16,208,243,33,90,96,17,91,96,1,16,0,119,237,176,58,77,96,183,40,7,58,107,96,183,204,235,99,201,254,16,208,95,121,254,17,208,33,89,96,6,0,12,9,115,243,58,107,96,183,204,235,99,201,58,16,96,183,40,57,33,90,96,34,167,100,58,110,96,183,38,6,40,2,38,9,8,221,33,70,115,46,48,205,151,100,205,115,106,95,125,205,131,101,1,32,0,221,9,44,37,32,236,8,221,33,6,116,58,96,96,50,89,96,204,200,106,253,33,102,117,221,33,102,116,33,99,96,34,167,100,38,3,46,8,205,151,100,205,3,105,95,125,205,195,104,1,32,0,221,9,1,9,0,253,9,44,37,32,231,58,17,96,183,200,33,254,191,30,0,205,115,102,33,0,144,30,63,205,115,102,33,102,96,34,167,100,33,138,152,6,5,221,33,198,116,253,33,129,117,197,205,151,100,205,3,105,95,205,115,102,35,1,32,0,221,9,1,9,0,253,9,193,16,231,201,229,245,42,167,100,126,50,89,96,35,34,167,100,241,225,201,0,0,243,33,115,116,203,150,203,64,40,2,203,214,33,147,116,203,150,203,72,40,2,203,214,33,179,116,203,150,203,80,40,2,203,214,62,7,30,191,205,131,106,201,33,3,113,201,221,33,70,115,33,32,0,253,33,102,117,17,9,0,201,34,68,101,205,70,101,123,178,235,55,200,17,100,0,183,237,82,216,33,78,0,237,91,68,101,25,126,15,61,185,216,42,68,101,17,80,0,25,89,25,25,121,183,40,11,61,40,8,61,40,11,61,40,8,55,201,94,35,86,235,183,201,229,42,68,101,14,1,205,230,100,235,42,68,101,183,237,82,235,225,78,35,70,33,0,0,121,176,55,200,235,9,183,201,0,0,17,73,0,25,30,0,126,254,66,192,35,126,254,84,192,35,126,254,79,192,197,35,205,109,101,126,205,116,101,35,205,109,101,126,205,116,101,193,201,126,230,240,15,15,15,15,230,15,235,41,229,41,41,193,9,133,111,235,208,20,201,195,134,101,197,245,211,124,6,2,205,154,101,123,211,125,6,7,205,154,101,241,193,201,219,230,79,219,230,145,184,56,250,201,245,211,124,0,0,123,211,125,0,0,241,201,229,245,111,125,211,160,123,211,161,241,225,201,58,83,96,31,31,31,31,48,238,241,225,201,58,83,96,135,135,135,135,48,226,241,225,201,211,160,219,162,201,243,205,222,101,201,62,14,211,171,62,9,211,171,175,50,77,96,50,79,96,50,80,96,50,107,96,50,108,96,50,109,96,6,14,95,205,176,101,60,16,250,62,7,30,191,205,176,101,175,95,6,4,205,108,102,62,4,30,255,6,4,205,108,102,62,16,30,0,205,106,102,62,32,30,0,205,106,102,62,14,30,0,205,131,101,62,48,30,255,205,106,102,62,14,30,32,205,131,101,62,54,30,255,6,3,205,108,102,58,17,96,183,200,33,254,191,30,0,205,115,102,33,0,144,30,63,205,115,102,6,144,33,0,152,30,0,197,205,115,102,35,193,16,248,201,6,9,205,131,101,60,16,250,201,219,168,50,147,102,230,15,246,0,211,168,58,255,255,47,50,142,102,230,207,246,0,50,255,255,115,62,0,50,255,255,62,0,211,168,201,237,83,196,102,237,83,216,102,34,199,102,34,219,102,54,0,6,4,197,62,4,144,79,33,193,252,133,111,126,135,48,28,6,4,197,62,36,144,7,7,177,50,227,102,205,0,0,58,0,0,183,193,32,20,16,234,193,16,215,201,121,50,227,102,205,0,0,58,0,0,183,202,207,102,193,201,0,6,8,33,42,103,17,24,64,205,14,103,208,6,4,33,46,103,17,28,64,205,14,103,216,33,246,127,245,229,205,12,0,246,1,95,225,241,205,20,0,183,201,58,227,102,79,197,229,213,121,235,205,12,0,209,225,193,190,55,192,35,19,16,238,121,50,16,96,183,201,65,80,82,76,79,80,76,76,42,67,243,189,55,200,58,227,102,71,230,3,15,15,95,15,15,179,50,123,102,95,219,168,50,149,103,230,15,179,211,168,120,230,12,7,7,50,136,102,95,58,255,255,47,50,144,103,230,207,179,50,255,255,33,0,144,17,0,152,78,54,63,235,126,47,119,190,47,119,235,55,32,18,54,0,235,126,47,119,190,47,119,235,55,40,5,120,50,17,96,183,113,62,0,50,255,255,62,0,211,168,201,58,172,103,183,192,243,62,1,50,172,103,205,173,103,175,50,172,103,201,0,58,111,96,183,202,185,103,61,50,111,96,201,58,77,96,183,200,58,107,96,183,192,58,79,96,183,196,168,104,58,77,96,183,200,62,9,50,88,96,221,33,102,116,253,33,102,117,6,3,197,205,204,107,1,32,0,221,9,1,9,0,253,9,33,88,96,52,193,16,235,58,16,96,183,40,43,175,50,88,96,221,33,70,115,58,110,96,183,245,6,6,40,2,6,9,197,205,204,107,1,32,0,221,9,33,88,96,52,193,16,240,241,221,33,6,116,204,247,106,58,17,96,183,40,52,33,254,191,30,0,205,115,102,33,0,144,30,63,205,115,102,62,12,50,88,96,221,33,198,116,253,33,129,117,6,5,197,205,204,107,1,32,0,221,9,1,9,0,253,9,33,88,96,52,193,16,235,33,77,115,6,17,126,230,1,200,17,32,0,25,16,246,42,108,96,35,34,108,96,33,78,96,126,183,40,11,53,32,8,205,222,101,175,50,77,96,201,58,112,96,230,1,202,145,97,6,17,221,33,70,115,17,32,0,221,126,0,221,182,1,40,4,175,221,119,7,221,25,16,240,201,33,82,96,53,192,58,80,96,60,50,80,96,254,15,210,222,101,58,81,96,50,82,96,205,235,99,201,221,203,13,86,202,176,101,201,221,110,4,221,102,5,126,35,221,117,4,221,116,5,201,71,58,89,96,128,254,15,218,231,104,62,15,201,71,58,80,96,128,254,15,216,62,15,201,237,75,89,96,145,48,2,175,201,237,75,80,96,145,208,175,201,221,126,16,205,242,104,71,62,15,144,71,253,126,8,144,208,175,201,58,88,96,254,9,56,41,254,12,56,21,214,12,135,198,128,111,38,152,221,94,14,205,115,102,35,221,94,15,195,115,102,214,9,135,221,94,14,205,195,104,60,221,94,15,195,195,104,205,98,106,93,58,88,96,198,16,205,131,101,198,16,92,195,131,101,58,88,96,254,9,56,30,254,12,56,15,205,3,105,95,58,88,96,198,126,111,38,152,195,115,102,205,3,105,95,58,88,96,61,195,195,104,205,115,106,95,58,88,96,198,48,195,131,101,221,203,12,246,24,4,221,203,12,182,33,0,0,235,205,203,104,235,22,0,95,25,60,40,244,17,0,0,221,126,12,71,230,96,32,46,120,230,15,254,8,40,39,28,183,40,35,229,229,71,84,93,33,0,0,25,16,253,203,60,203,29,203,60,203,29,203,60,203,29,124,181,32,1,44,235,225,183,237,82,235,225,43,221,117,8,221,116,9,221,115,10,221,114,11,201,221,126,6,61,40,20,221,119,6,221,110,2,221,102,3,205,85,106,221,115,4,221,114,5,55,201,221,110,2,221,102,3,35,35,35,221,117,2,221,116,3,205,85,106,35,126,221,115,4,221,114,5,221,119,6,229,42,86,96,205,241,106,225,55,192,62,3,221,119,7,58,112,96,230,1,200,221,110,0,221,102,1,221,117,2,221,116,3,62,1,221,119,7,205,85,106,35,126,221,115,4,221,114,5,221,119,6,55,201,94,35,86,197,235,237,75,86,96,9,235,193,201,221,110,14,221,126,13,135,135,135,135,230,48,221,182,15,103,201,221,126,16,205,218,104,71,221,126,17,135,135,135,135,176,201,62,7,205,212,101,95,58,115,116,203,87,32,11,123,230,246,95,58,107,117,230,9,179,95,58,147,116,203,87,32,12,123,230,237,95,58,116,117,230,9,135,179,95,58,179,116,203,87,32,13,123,230,219,95,58,125,117,230,9,135,135,179,95,62,7,205,176,101,201,237,75,27,116,38,54,205,222,106,237,75,28,116,36,205,222,106,237,75,30,116,36,120,205,218,104,135,135,135,135,111,121,205,218,104,181,95,124,195,131,101,229,183,237,82,225,201,221,126,7,230,2,192,221,203,13,190,58,96,96,50,89,96,221,110,8,221,102,9,125,180,40,8,43,221,117,8,221,116,9,201,205,203,104,221,119,26,254,255,40,100,254,192,40,103,254,193,202,136,105,203,127,194,157,107,245,30,32,62,14,205,131,101,241,245,230,31,246,32,95,62,14,205,131,101,205,142,105,221,203,13,254,62,15,221,119,16,241,31,237,75,29,116,220,123,107,31,237,75,30,116,220,123,107,31,237,75,31,116,220,123,107,31,237,75,28,116,220,123,107,31,237,75,27,116,220,123,107,201,245,121,221,190,16,48,3,221,113,16,241,201,205,232,105,218,25,107,201,205,203,104,71,205,203,104,95,120,205,131,101,195,25,107,71,205,203,104,230,15,203,96,40,3,50,27,116,203,88,40,3,50,28,116,203,80,40,3,50,31,116,203,72,40,3,50,30,116,203,64,40,3,50,29,116,205,200,106,195,25,107,221,126,7,230,2,192,221,203,13,190,33,89,96,84,93,237,75,88,96,6,0,9,35,126,18,221,110,8,221,102,9,221,94,10,221,86,11,205,241,106,32,27,221,126,12,230,96,32,20,221,203,13,134,58,88,96,254,9,48,6,205,21,105,195,17,108,205,103,109,221,110,8,221,102,9,124,181,40,10,43,221,117,8,221,116,9,195,115,108,205,203,104,221,119,26,254,255,40,62,254,96,218,11,110,254,112,218,134,111,254,128,218,145,111,214,128,254,14,48,225,135,22,0,95,33,81,108,25,94,35,86,235,233,173,111,180,111,187,111,4,112,122,112,129,112,136,112,154,112,163,112,188,112,201,112,204,112,216,112,136,105,205,232,105,218,37,108,221,203,12,118,32,16,205,153,108,205,126,109,58,88,96,254,9,56,3,205,191,108,221,126,20,183,32,6,221,126,19,221,119,20,221,53,20,201,221,126,21,183,200,221,126,20,183,192,221,126,22,237,68,221,119,22,95,7,159,87,221,110,23,221,102,24,25,221,117,14,221,116,15,195,21,105,253,126,6,61,202,239,108,61,200,61,202,18,109,61,202,87,105,253,53,7,192,253,126,0,205,48,109,253,112,7,253,134,8,254,15,56,5,205,78,109,62,15,253,119,8,195,87,105,253,53,7,192,253,126,1,205,48,109,253,112,7,71,253,126,8,144,253,119,8,56,6,253,190,2,210,87,105,205,92,109,195,87,105,253,53,7,192,253,126,3,205,48,109,253,112,7,71,253,126,8,144,48,4,205,117,109,175,253,119,8,195,87,105,79,31,31,31,31,230,15,71,121,230,15,201,253,126,0,205,48,109,253,112,7,253,54,6,0,253,54,8,0,201,253,126,1,205,48,109,253,112,7,253,54,6,1,201,253,54,6,2,253,126,2,253,119,8,201,253,126,3,205,48,109,253,112,7,253,54,6,3,201,253,54,6,4,253,54,8,0,201,221,126,25,183,200,221,126,20,183,192,221,94,14,221,86,15,221,110,23,221,102,24,205,241,106,202,2,110,218,206,109,221,110,25,38,0,25,58,88,96,254,9,48,22,229,124,230,1,103,17,86,1,183,237,82,225,56,8,124,230,14,198,2,103,46,171,221,94,23,221,86,24,205,241,106,56,55,195,1,110,221,110,25,38,0,235,183,237,82,58,88,96,254,9,48,24,229,124,230,1,103,17,171,0,183,237,82,225,48,10,124,230,14,214,2,246,1,103,46,85,221,94,23,221,86,24,205,241,106,48,1,235,221,117,14,221,116,15,195,21,105,221,203,12,110,32,7,183,40,4,221,203,13,254,71,58,88,96,254,9,120,210,182,110,183,40,106,61,111,38,0,6,8,41,124,214,12,56,2,44,103,16,246,229,203,36,92,22,0,33,156,110,25,78,35,70,35,94,35,86,221,126,21,183,40,8,213,205,98,111,209,221,119,22,221,126,18,183,33,0,0,40,6,205,98,111,38,0,111,9,209,123,135,180,103,221,117,23,221,116,24,221,203,13,198,205,142,105,221,126,25,183,194,115,108,221,126,23,221,119,14,221,126,24,221,119,15,205,21,105,195,115,108,221,203,13,134,205,142,105,205,21,105,195,115,108,171,0,182,0,192,0,204,0,216,0,229,0,242,0,1,1,16,1,32,1,50,1,68,1,86,1,183,202,56,111,61,111,38,0,6,8,41,124,214,12,56,2,44,103,16,246,229,203,36,92,22,0,33,72,111,25,78,35,70,35,94,35,86,225,44,45,40,11,203,56,203,25,203,58,203,27,195,221,110,221,126,21,183,40,8,213,205,105,111,209,221,119,22,221,126,18,183,33,0,0,40,6,205,105,111,38,0,111,9,221,117,23,221,116,24,221,203,13,70,32,3,205,60,109,221,203,13,198,205,142,105,221,126,25,183,194,115,108,221,126,23,221,119,14,221,126,24,221,119,15,205,21,105,195,115,108,221,203,13,134,205,103,109,205,87,105,205,142,105,195,115,108,93,13,156,12,231,11,60,11,155,10,2,10,115,9,235,8,107,8,242,7,128,7,26,7,175,6,235,183,237,66,195,110,111,96,105,183,237,82,235,33,0,0,183,40,12,203,63,48,1,25,203,35,203,18,195,114,111,124,183,192,60,201,214,96,221,119,16,205,87,105,195,37,108,214,112,221,119,17,58,88,96,254,9,210,37,108,205,115,106,95,58,88,96,198,48,205,131,101,195,37,108,221,203,13,142,195,37,108,221,203,13,206,195,37,108,205,203,104,254,6,210,37,108,135,95,22,0,33,248,111,25,94,35,86,235,233,219,170,230,16,32,7,62,9,211,171,195,37,108,62,8,211,171,195,37,108,219,170,230,128,40,7,62,14,211,171,195,37,108,62,15,211,171,195,37,108,208,111,214,111,221,111,228,111,234,111,241,111,205,203,104,95,205,203,104,87,235,197,237,75,86,96,9,193,58,88,96,254,12,48,49,254,9,48,15,175,94,205,131,101,60,35,254,8,218,32,112,195,37,108,253,229,209,1,6,0,237,176,205,131,106,253,126,5,230,8,194,37,108,253,94,4,62,6,205,195,104,195,37,108,253,229,209,1,4,0,237,176,235,58,88,96,214,12,254,4,32,2,62,3,135,135,135,135,135,111,38,152,6,32,197,213,26,95,205,115,102,209,193,19,35,16,243,195,37,108,221,203,12,174,195,37,108,221,203,12,238,195,37,108,205,203,104,230,31,71,221,126,12,230,224,176,221,119,12,195,37,108,205,203,104,221,119,18,195,37,108,205,203,104,221,119,25,221,54,21,0,221,110,23,221,102,24,221,117,14,221,116,15,195,37,108,205,203,104,221,119,21,221,54,25,0,195,37,108,195,37,108,205,203,104,221,119,19,221,119,20,195,37,108,205,203,104,71,205,203,104,95,58,88,96,254,12,48,17,254,9,120,48,6,205,131,101,195,37,108,205,195,104,195,37,108,104,203,253,38,152,205,115,102,195,37,108,75,73,78,82,79,85,32,53,116,104,46,32,86,101,114,115,105,111,110,32,50,46,48,48,13,10,80,114,111,103,114,97,109,109,101,100,32,66,121,32,75,46,75,117,114,111,100,97,46,13,10,70,97,110,102,97,114,101,32,67,111,109,112,111,115,101,100,32,66,121,32,74,105,61,68,111,114,117,13,10,67,111,112,121,114,105,103,104,116,32,40,67,41,32,49,57,57,54,44,49,57,57,55,32,75,101,105,105,99,104,105,32,75,117,114,111,100,97,32,47,32,66,84,79,40,77,117,83,73,67,65,32,76,97,98,111,114,97,116,111,114,121,41,13,10,67,111,112,121,114,105,103,104,116,32,40,67,41,32,49,57,57,55,32,74,105,61,68,111,114,117,13,10,65,108,108,32,114,105,103,104,116,115,32,114,101,115,101,114,118,101,100,46,13,10,36,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,35,176,46,176,57,176,0,0,0,0,0,0,0,0,0,0,68,176,1,69,176,1,74,176,1,0,0,68,176,1,111,176,1,74,176,1,0,0,68,176,1,120,176,1,125,176,1,0,0,255,131,111,177,109,255,37,10,39,10,41,10,44,10,49,10,51,10,53,10,56,10,54,10,56,10,54,10,53,10,51,10,49,10,54,20,53,80,0,80,0,80,255,131,111,177,109,135,20,0,5,255,131,119,177,109,255,135,20,29,6,135,0,108,29,7,135,20,107,29,6,135,0,106,29,7,135,20,105,29,7,135,0,104,29,6,135,20,103,29,7,135,0,102,29,7,135,20,101,29,6,135,0,109,29,7,135,20,108,29,7,135,0,107,29,6,109,135,20,30,7,135,0,108,30,7,135,20,107,30,6,135,0,106,30,7,135,20,105,30,7,135,0,104,30,6,135,20,103,30,7,135,0,102,30,7,135,20,101,30,6,135,0,109,30,7,135,20,108,30,7,135,0,107,30,6,135,20,109,29,7,135,0,108,29,7,135,20,107,29,6,135,0,106,29,7,135,20,105,29,7,135,0,104,29,6,135,20,103,29,7,135,0,102,29,7,135,20,101,29,6,135,0,100,29,7,135,20,99,29,7,135,0,98,29,6,135,20,109,25,7,135,0,108,25,7,135,20,107,25,6,135,0,106,25,7,135,20,105,25,7,135,0,104,25,6,135,20,103,25,7,135,0,102,25,7,135,20,101,25,6,135,0,100,25,7,135,20,99,25,7,135,0,98,25,6,0,80,255,31,113,13,65,18,8,0,0,20,81,8,145,8,8,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,35,176,43,176,51,176,0,0,0,0,0,0,0,0,0,0,59,176,1,60,176,1,0,0,59,176,1,100,176,1,0,0,59,176,1,137,176,1,0,0,255,131,177,176,109,46,80,48,60,49,20,133,49,80,132,49,80,49,20,0,20,135,20,131,185,176,13,10,13,10,13,10,13,10,13,10,0,10,0,80,255,131,193,176,109,137,2,139,1,25,80,24,60,20,20,20,80,20,80,13,20,0,20,13,10,13,10,13,10,13,10,13,10,0,10,0,80,255,131,177,176,108,49,80,51,60,53,20,53,120,54,40,53,20,0,20,0,2,135,10,131,185,176,13,10,13,10,13,10,13,10,13,10,0,8,0,80,255,31,113,13,65,18,8,0,0,31,114,7,17,17,8,0,0,20,81,8,145,8,8,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,35,176,43,176,54,176,0,0,0,0,0,0,0,0,0,0,65,176,1,66,176,1,0,0,65,176,1,107,176,1,66,176,1,0,0,65,176,1,110,176,1,66,176,1,0,0,255,131,115,176,109,25,10,27,10,29,10,30,10,32,10,34,10,36,10,37,10,39,10,41,10,42,10,44,10,46,10,48,10,53,10,51,10,49,20,0,60,255,135,20,255,0,5,135,10,255,31,114,7,17,17,8,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,35,176,46,176,57,176,0,0,0,0,0,0,0,0,0,0,68,176,1,69,176,1,74,176,1,0,0,68,176,1,127,176,1,134,176,1,0,0,68,176,1,187,176,1,196,176,1,0,0,255,131,249,176,109,255,49,15,46,15,48,15,44,15,46,7,42,8,44,7,41,8,42,7,39,8,41,7,37,8,39,15,0,45,37,7,37,8,39,7,39,8,41,7,41,8,44,7,44,8,37,7,0,90,37,8,0,120,255,131,249,176,101,0,5,255,61,15,58,15,60,15,56,15,58,7,54,8,56,7,53,8,54,7,51,8,53,7,49,8,51,15,0,45,49,7,49,8,51,7,51,8,53,7,53,8,56,7,56,8,49,7,0,90,49,8,0,120,255,131,249,176,107,0,2,135,20,255,49,15,46,15,48,15,44,15,46,8,42,7,44,8,41,7,42,8,39,7,41,8,37,7,39,15,0,45,37,8,37,7,39,8,39,7,41,8,41,7,44,8,44,7,37,8,0,90,37,7,0,120,255,31,52,7,82,17,8,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,35,176,43,176,54,176,0,0,0,0,0,0,0,0,0,0,62,176,1,63,176,1,0,0,62,176,1,94,176,1,63,176,1,0,0,62,176,1,97,176,1,0,0,255,131,149,176,109,46,20,46,2,48,3,49,2,51,3,53,2,54,3,56,2,58,20,58,15,58,15,58,80,0,80,255,135,20,255,131,157,176,98,0,60,133,41,10,99,41,10,100,41,10,101,41,10,102,41,10,103,41,10,104,41,10,105,41,10,106,41,10,107,41,10,108,41,10,109,41,10,41,10,41,10,41,10,132,41,10,255,31,114,7,17,17,8,0,0,24,31,15,31,0,8,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,35,176,43,176,0,0,0,0,0,0,0,0,0,0,0,0,51,176,1,52,176,1,0,0,51,176,1,67,176,1,0,0,255,131,84,176,109,133,41,7,136,1,132,42,53,0,120,255,131,84,176,109,135,80,133,41,7,136,1,132,42,53,0,120,255,31,113,13,65,18,8,0,0,80,255,135,20,255,131,157,176,98,0,60,133,41,10,99,41,10,100,41,10,101,41,10,102,41,10,103,41,10,104,41,10,105,41,10,106,41,10,107,41,10,108,41,10,109,41,10,41,10,41,10,41,10,132,41,10,255,31,114,7,17,17,8,0,0,24,31,15,31,0,8,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,35,176,40,176,45,176,0,0,0,0,0,0,0,0,0,0,50,176,1,0,0,59,176,1,0,0,76,176,1,0,0,131,91,176,109,44,60,0,120,255,131,91,176,109,135,10,0,7,44,56,136,4,48,120,0,120,255,131,91,176,109,135,20,44,60,136,6,37,120,0,120,255,31,113,13,65,18,8],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+1203906);allocate([205,32,96,62,63,50,16,96,50,17,96,33,7,128,237,91,1,128,62,0,205,38,96,175,205,56,96,62,127,211,64,175,211,65,211,66,201,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,205,41,96,205,50,96,230,1,175,211,65,43,125,211,66,201,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,15,255,15,255,15,31,63,31,31,31,255,255,15,255,255,73,76,76,50,0,0,0,0,0,0,0,0,0,0,0,0,97,97,30,23,240,127,0,23,0,0,0,0,0,0,0,0,19,65,23,14,255,255,35,19,0,0,0,0,0,0,0,0,35,1,154,4,163,244,240,35,0,0,0,0,0,0,0,0,17,97,14,7,250,100,112,23,0,0,0,0,0,0,0,0,34,33,30,6,240,118,0,40,0,0,0,0,0,0,0,0,33,34,22,5,240,113,0,24,0,0,0,0,0,0,0,0,33,97,29,7,130,128,16,7,0,0,0,0,0,0,0,0,35,33,45,22,144,144,0,7,0,0,0,0,0,0,0,0,33,33,27,6,100,101,16,23,0,0,0,0,0,0,0,0,33,33,11,26,133,160,112,7,0,0,0,0,0,0,0,0,35,1,131,16,255,180,16,244,0,0,0,0,0,0,0,0,151,193,32,7,255,244,34,34,0,0,0,0,0,0,0,0,97,0,12,5,210,246,64,67,0,0,0,0,0,0,0,0,1,1,86,3,244,240,3,2,0,0,0,0,0,0,0,0,33,65,137,3,241,244,240,35,0,0,0,0,0,0,0,0,7,33,20,0,238,248,255,248,0,0,0,0,0,0,0,0,1,49,0,0,248,247,248,247,0,0,0,0,0,0,0,0,37,17,0,0,248,250,248,85,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,51,1,9,14,148,144,64,1,0,0,0,0,0,0,0,0,19,65,15,13,206,211,67,19,0,0,0,0,0,0,0,0,1,18,27,6,255,210,0,50,0,0,0,0,0,0,0,0,97,97,27,7,175,99,32,40,0,0,0,0,0,0,0,0,34,33,30,6,240,118,8,40,0,0,0,0,0,0,0,0,102,33,21,0,147,148,32,248,0,0,0,0,0,0,0,0,33,97,28,7,130,129,16,23,0,0,0,0,0,0,0,0,35,33,32,31,192,113,7,71,0,0,0,0,0,0,0,0,37,49,38,5,100,65,24,248,0,0,0,0,0,0,0,0,23,33,40,7,255,131,2,248,0,0,0,0,0,0,0,0,151,129,37,7,207,200,2,20,0,0,0,0,0,0,0,0,33,33,84,15,128,127,7,7,0,0,0,0,0,0,0,0,1,1,86,3,211,178,67,88,0,0,0,0,0,0,0,0,49,33,12,3,130,192,64,7,0,0,0,0,0,0,0,0,33,1,12,3,212,211,64,132,0,0,0,0,0,0,0,0,7,33,20,0,238,248,255,248,0,0,0,0,0,0,0,0,1,49,0,0,248,247,248,247,0,0,0,0,0,0,0,0,37,17,0,0,248,250,248,85,0,0,0,0,0,0,0,0,73,76,76,50,0,0,0,0,0,0,0,0,0,0,0,0,98,33,26,7,240,111,0,22,0,0,0,0,0,0,0,0,0,16,68,2,246,244,84,35,0,0,0,0,0,0,0,0,3,1,151,4,243,243,19,243,0,0,0,0,0,0,0,0,1,97,10,15,250,100,112,23,0,0,0,0,0,0,0,0,34,33,30,6,240,118,0,40,0,0,0,0,0,0,0,0,0,97,138,14,192,97,0,7,0,0,0,0,0,0,0,0,33,97,27,7,132,128,23,23,0,0,0,0,0,0,0,0,55,50,201,1,102,100,64,40,0,0,0,0,0,0,0,0,1,33,6,3,165,113,81,7,0,0,0,0,0,0,0,0,6,17,94,7,243,242,246,17,0,0,0,0,0,0,0,0,0,32,24,6,245,243,32,38,0,0,0,0,0,0,0,0,151,65,32,7,255,244,34,34,0,0,0,0,0,0,0,0,101,97,21,0,247,243,22,244,0,0,0,0,0,0,0,0,1,49,14,7,250,243,255,255,0,0,0,0,0,0,0,0,72,97,9,7,241,148,240,245,0,0,0,0,0,0,0,0,7,33,20,0,238,248,255,248,0,0,0,0,0,0,0,0,1,49,0,0,248,247,248,247,0,0,0,0,0,0,0,0,37,17,0,0,248,250,248,85,0,0,0,0,0,0,0,0,40,95,116,104,105,115,45,62,114,101,103,91,48,120,48,52,93,32,38,32,48,120,56,48,41,32,61,61,32,48,0,47,85,115,101,114,115,47,111,107,97,122,97,107,105,47,103,105,116,47,100,105,103,105,116,97,108,45,115,111,117,110,100,45,97,110,116,105,113,117,101,115,47,109,115,120,112,108,97,121,45,106,115,47,109,111,100,117,108,101,115,47,108,105,98,107,115,115,47,109,111,100,117,108,101,115,47,101,109,117,56,57,53,48,47,101,109,117,97,100,112,99,109,46,99,0,65,68,80,67,77,95,119,114,105,116,101,82,101,103,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,58,0,1,3,59,11,9,5,20,14,9,2,0,8,8,0,17,0,23,0,39,0,0,0,70,18,8,0,0,2,0,3,58,0,2,3,59,11,9,5,19,9,14,2,0,8,8,0,17,0,23,0,38,0,0,0,70,19,8,0,0,3,0,3,58,0,3,3,59,11,10,5,20,14,10,2,0,8,8,0,17,0,23,0,39,0,0,0,71,8,20,0,0,4,0,3,58,0,4,3,59,11,10,5,19,10,14,2,0,8,8,0,17,0,23,0,39,0,0,0,72,8,21,0,0,5,0,3,58,0,5,3,59,11,11,5,20,14,11,2,0,8,8,0,17,0,23,0,39,0,0,0,70,7,7,5,54,6,0,3,58,0,6,3,59,11,11,5,19,11,14,2,0,8,8,0,17,0,23,0,39,0,0,0,70,7,7,5,53,0,0,3,58,0,22,3,59,11,13,5,20,14,13,2,0,8,8,0,17,0,23,0,39,0,0,0,71,0,0,0,0,8,0,3,58,0,8,3,59,11,13,5,19,13,14,2,0,8,8,0,17,0,23,0,39,0,0,0,72,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,23,0,0,0,25,0,0,3,60,0,0,3,61,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,0,0,0,26,0,0,3,62,0,0,3,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,22,0,0,23,23,0,0,25,21,0,3,60,21,0,3,61,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,22,0,0,24,23,0,0,26,21,0,3,62,21,0,3,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,77,0,0,0,0,0,0,0,2,0,0,0,0,0,7,0,2,0,0,0,0,1,0,0,2,0,0,0,0,5,7,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,7,0,2,0,0,0,0,0,0,0,2,1,1,0,0,0,7,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,1,1,0,0,0,0,1,0,1,1,0,0,0,0,1,0,1,1,0,0,0,0,0,0,1,1,0,0,3,0,1,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,1,0,1,1,2,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,7,0,2,0,0,0,0,1,0,0,2,0,0,0,0,5,7,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,7,0,2,0,0,0,0,0,0,0,2,5,5,2,0,0,7,0,2,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,5,0,5,5,5,5,5,5,0,5,0,0,0,0,0,0,5,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,5,0,1,0,0,0,0,1,0,1,1,0,0,0,0,1,0,1,1,0,0,0,0,1,0,1,1,0,0,0,0,0,0,1,1,0,0,3,0,1,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,1,0,1,1,2,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,7,0,0,0,0,1,1,0,7,0,0,0,0,1,1,0,7,0,0,0,0,1,1,0,7,0,0,0,0,1,1,0,7,0,0,0,0,4,1,0,7,0,0,0,0,4,1,0,7,0,0,0,0,0,1,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,5,1,1,0,0,0,0,2,5,1,1,0,0,0,0,2,5,1,1,0,0,0,0,2,5,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,1,0,5,0,0,0,0,0,5,0,5,0,0,0,86,18,18,22,18,22,22,18,26,30,30,26,30,26,26,30,18,22,22,18,22,18,18,22,30,26,26,30,26,30,30,26,50,54,54,50,54,50,50,54,62,58,58,62,58,62,62,58,54,50,50,54,50,54,54,50,58,62,62,58,62,58,58,62,18,22,22,18,22,18,18,22,30,26,26,30,26,30,30,26,22,18,18,22,18,22,22,18,26,30,30,26,30,26,26,30,54,50,50,54,50,54,54,50,58,62,62,58,62,58,58,62,50,54,54,50,54,50,50,54,62,58,58,62,58,62,62,58,146,150,150,146,150,146,146,150,158,154,154,158,154,158,158,154,150,146,146,150,146,150,150,146,154,158,158,154,158,154,154,158,182,178,178,182,178,182,182,178,186,190,190,186,190,186,186,190,178,182,182,178,182,178,178,182,190,186,186,190,186,190,190,186,150,146,146,150,146,150,150,146,154,158,158,154,158,154,154,158,146,150,150,146,150,146,146,150,158,154,154,158,154,158,158,154,178,182,182,178,182,178,178,182,190,186,186,190,186,190,190,186,182,178,178,182,178,182,182,178,186,190,190,186,190,186,186,190,87,19,19,23,19,23,23,19,27,31,31,27,31,27,27,31,19,23,23,19,23,19,19,23,31,27,27,31,27,31,31,27,51,55,55,51,55,51,51,55,63,59,59,63,59,63,63,59,55,51,51,55,51,55,55,51,59,63,63,59,63,59,59,63,19,23,23,19,23,19,19,23,31,27,27,31,27,31,31,27,23,19,19,23,19,23,23,19,27,31,31,27,31,27,27,31,55,51,51,55,51,55,55,51,59,63,63,59,63,59,59,63,51,55,55,51,55,51,51,55,63,59,59,63,59,63,63,59,147,151,151,147,151,147,147,151,159,155,155,159,155,159,159,155,151,147,147,151,147,151,151,147,155,159,159,155,159,155,155,159,183,179,179,183,179,183,183,179,187,191,191,187,191,187,187,191,179,183,183,179,183,179,179,183,191,187,187,191,187,191,191,187,151,147,147,151,147,151,151,147,155,159,159,155,159,155,155,159,147,151,151,147,151,147,147,151,159,155,155,159,155,159,159,155,179,183,183,179,183,179,179,183,191,187,187,191,187,191,191,187,183,179,179,183,179,183,183,179,187,191,191,187,191,187,187,191,0,0,0,0,9,16,0,0,7,8,3,0,9,9,0,21,1,1,0,13,1,1,0,14,1,15,0,0,8,8,0,41,12,12,0,1,15,9,6,18,8,7,3,0,9,9,0,22,2,2,0,13,2,2,0,14,2,15,0,0,8,8,0,42,0,15,0,32,10,16,0,0,7,8,4,0,10,10,0,21,3,3,0,13,3,3,0,14,3,15,0,0,8,8,0,43,0,15,0,30,15,10,6,18,8,7,4,0,10,10,0,22,4,4,0,13,4,4,0,14,4,15,0,0,8,8,0,44,0,15,0,31,15,16,0,0,14,17,2,0,15,17,0,21,16,18,0,13,16,18,0,14,16,15,0,0,8,8,0,15,0,15,0,31,15,17,6,18,15,14,2,0,15,17,0,22,17,19,0,13,17,19,0,14,17,15,0,0,8,8,0,16,0,15,0,31,13,16,0,0,7,8,2,0,13,13,0,21,7,7,7,13,7,7,7,14,7,15,7,0,0,0,0,65,0,15,0,31,15,13,6,18,8,7,2,0,13,13,0,22,8,8,0,13,8,8,0,14,8,15,0,0,0,0,0,64,1,1,0,0,1,2,0,0,1,3,0,0,1,4,0,0,1,18,0,0,1,19,0,0,1,7,7,0,1,8,0,0,2,1,0,0,2,2,0,0,2,3,0,0,2,4,0,0,2,18,0,0,2,19,0,0,2,7,7,0,2,8,0,0,3,1,0,0,3,2,0,0,3,3,0,0,3,4,0,0,3,18,0,0,3,19,0,0,3,7,7,0,3,8,0,0,4,1,0,0,4,2,0,0,4,3,0,0,4,4,0,0,4,18,0,0,4,19,0,0,4,7,7,0,4,8,0,0,16,1,0,0,16,2,0,0,16,3,0,0,16,4,0,0,16,18,0,0,16,19,0,0,5,7,7,0,16,8,0,0,17,1,0,0,17,2,0,0,17,3,0,0,17,4,0,0,17,18,0,0,17,19,0,0,6,7,7,0,17,8,0,0,7,1,7,0,7,2,7,0,7,3,7,0,7,4,7,0,7,5,7,0,7,6,7,0,0,0,0,66,7,8,7,0,8,1,0,0,8,2,0,0,8,3,0,0,8,4,0,0,8,18,0,0,8,19,0,0,8,7,7,0,8,8,0,0,8,1,0,5,8,2,0,5,8,3,0,5,8,4,0,5,8,18,0,5,8,19,0,5,8,7,7,5,8,8,0,5,8,1,0,6,8,2,0,6,8,3,0,6,8,4,0,6,8,18,0,6,8,19,0,6,8,7,7,6,8,8,0,6,8,1,0,7,8,2,0,7,8,3,0,7,8,4,0,7,8,18,0,7,8,19,0,7,8,7,7,7,8,8,0,7,8,1,0,8,8,2,0,8,8,3,0,8,8,4,0,8,8,18,0,8,8,19,0,8,8,7,7,8,8,8,0,8,8,1,0,9,8,2,0,9,8,3,0,9,8,4,0,9,8,18,0,9,8,19,0,9,8,7,7,9,8,8,0,9,8,1,0,11,8,2,0,11,8,3,0,11,8,4,0,11,8,18,0,11,8,19,0,11,8,7,7,11,8,8,0,11,8,1,0,10,8,2,0,10,8,3,0,10,8,4,0,10,8,18,0,10,8,19,0,10,8,7,7,10,8,8,0,10,0,1,0,12,0,2,0,12,0,3,0,12,0,4,0,12,0,18,0,12,0,19,0,12,0,7,7,12,0,8,0,12,0,0,0,36,9,23,0,0,0,16,0,28,0,16,0,27,0,16,0,34,24,9,0,0,8,15,0,5,0,0,0,40,0,0,0,36,0,23,0,27,0,16,0,28,0,0,0,73,0,16,0,34,0,16,0,33,8,15,0,6,0,0,0,40,0,0,0,36,10,23,0,0,0,16,0,28,0,8,1,59,0,16,0,34,24,10,0,0,8,15,0,7,0,0,0,40,0,0,0,36,0,0,0,2,0,16,0,28,8,0,1,58,0,16,0,34,0,0,0,74,8,15,0,8,0,0,0,40,0,0,0,37,15,23,0,0,0,16,0,29,15,17,0,4,0,16,0,35,24,17,0,0,8,15,0,9,0,0,0,40,0,0,0,37,0,17,0,27,0,16,0,29,0,10,0,3,0,16,0,35,0,0,0,75,8,15,0,11,0,0,0,40,0,0,0,37,12,23,0,0,0,16,0,29,0,0,0,68,0,16,0,35,24,12,0,0,8,15,0,10,0,0,0,40,0,0,0,37,13,17,0,0,0,16,0,29,0,0,0,69,0,16,0,35,0,0,0,76,0,15,0,12,0,0,0,40,45,46,47,48,49,50,51,52,55,55,55,55,55,55,55,55,56,56,56,56,56,56,56,56,57,57,57,57,57,57,57,57,84,33,34,25,13,1,2,3,17,75,28,12,16,4,11,29,18,30,39,104,110,111,112,113,98,32,5,6,15,19,20,21,26,8,22,7,40,36,23,24,9,10,14,27,31,37,35,131,130,125,38,42,43,60,61,62,63,67,71,74,77,88,89,90,91,92,93,94,95,96,97,99,100,101,102,103,105,106,107,108,114,115,116,121,122,123,124,0,73,108,108,101,103,97,108,32,98,121,116,101,32,115,101,113,117,101,110,99,101,0,68,111,109,97,105,110,32,101,114,114,111,114,0,82,101,115,117,108,116,32,110,111,116,32,114,101,112,114,101,115,101,110,116,97,98,108,101,0,78,111,116,32,97,32,116,116,121,0,80,101,114,109,105,115,115,105,111,110,32,100,101,110,105,101,100,0,79,112,101,114,97,116,105,111,110,32,110,111,116,32,112,101,114,109,105,116,116,101,100,0,78,111,32,115,117,99,104,32,102,105,108,101,32,111,114,32,100,105,114,101,99,116,111,114,121,0,78,111,32,115,117,99,104,32,112,114,111,99,101,115,115,0,70,105,108,101,32,101,120,105,115,116,115,0,86,97,108,117,101,32,116,111,111,32,108,97,114,103,101,32,102,111,114,32,100,97,116,97,32,116,121,112,101,0,78,111,32,115,112,97,99,101,32,108,101,102,116,32,111,110,32,100,101,118,105,99,101,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,82,101,115,111,117,114,99,101,32,98,117,115,121,0,73,110,116,101,114,114,117,112,116,101,100,32,115,121,115,116,101,109,32,99,97,108,108,0,82,101,115,111,117,114,99,101,32,116,101,109,112,111,114,97,114,105,108,121,32,117,110,97,118,97,105,108,97,98,108,101,0,73,110,118,97,108,105,100,32,115,101,101,107,0,67,114,111,115,115,45,100,101,118,105,99,101,32,108,105,110,107,0,82,101,97,100,45,111,110,108,121,32,102,105,108,101,32,115,121,115,116,101,109,0,68,105,114,101,99,116,111,114,121,32,110,111,116,32,101,109,112,116,121,0,67,111,110,110,101,99,116,105,111,110,32,114,101,115,101,116,32,98,121,32,112,101,101,114,0,79,112,101,114,97,116,105,111,110,32,116,105,109,101,100,32,111,117,116,0,67,111,110,110,101,99,116,105,111,110,32,114,101,102,117,115,101,100,0,72,111,115,116,32,105,115,32,100,111,119,110,0,72,111,115,116,32,105,115,32,117,110,114,101,97,99,104,97,98,108,101,0,65,100,100,114,101,115,115,32,105,110,32,117,115,101,0,66,114,111,107,101,110,32,112,105,112,101,0,73,47,79,32,101,114,114,111,114,0,78,111,32,115,117,99,104,32,100,101,118,105,99,101,32,111,114,32,97,100,100,114,101,115,115,0,66,108,111,99,107,32,100,101,118,105,99,101,32,114,101,113,117,105,114,101,100,0,78,111,32,115,117,99,104,32,100,101,118,105,99,101,0,78,111,116,32,97,32,100,105,114,101,99,116,111,114,121,0,73,115,32,97,32,100,105,114,101,99,116,111,114,121,0,84,101,120,116,32,102,105,108,101,32,98,117,115,121,0,69,120,101,99,32,102,111,114,109,97,116,32,101,114,114,111,114,0,73,110,118,97,108,105,100,32,97,114,103,117,109,101,110,116,0,65,114,103,117,109,101,110,116,32,108,105,115,116,32,116,111,111,32,108,111,110,103,0,83,121,109,98,111,108,105,99,32,108,105,110,107,32,108,111,111,112,0,70,105,108,101,110,97,109,101,32,116,111,111,32,108,111,110,103,0,84,111,111,32,109,97,110,121,32,111,112,101,110,32,102,105,108,101,115,32,105,110,32,115,121,115,116,101,109,0,78,111,32,102,105,108,101,32,100,101,115,99,114,105,112,116,111,114,115,32,97,118,97,105,108,97,98,108,101,0,66,97,100,32,102,105,108,101,32,100,101,115,99,114,105,112,116,111,114,0,78,111,32,99,104,105,108,100,32,112,114,111,99,101,115,115,0,66,97,100,32,97,100,100,114,101,115,115,0,70,105,108,101,32,116,111,111,32,108,97,114,103,101,0,84,111,111,32,109,97,110,121,32,108,105,110,107,115,0,78,111,32,108,111,99,107,115,32,97,118,97,105,108,97,98,108,101,0,82,101,115,111,117,114,99,101,32,100,101,97,100,108,111,99,107,32,119,111,117,108,100,32,111,99,99,117,114,0,83,116,97,116,101,32,110,111,116,32,114,101,99,111,118,101,114,97,98,108,101,0,80,114,101,118,105,111,117,115,32,111,119,110,101,114,32,100,105,101,100,0,79,112,101,114,97,116,105,111,110,32,99,97,110,99,101,108,101,100,0,70,117,110,99,116,105,111,110,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,78,111,32,109,101,115,115,97,103,101,32,111,102,32,100,101,115,105,114,101,100,32,116,121,112,101,0,73,100,101,110,116,105,102,105,101,114,32,114,101,109,111,118,101,100,0,68,101,118,105,99,101,32,110,111,116,32,97,32,115,116,114,101,97,109,0,78,111,32,100,97,116,97,32,97,118,97,105,108,97,98,108,101,0,68,101,118,105,99,101,32,116,105,109,101,111,117,116,0,79,117,116,32,111,102,32,115,116,114,101,97,109,115,32,114,101,115,111,117,114,99,101,115,0,76,105,110,107,32,104,97,115,32,98,101,101,110,32,115,101,118,101,114,101,100,0,80,114,111,116,111,99,111,108,32,101,114,114,111,114,0,66,97,100,32,109,101,115,115,97,103,101,0,70,105,108,101,32,100,101,115,99,114,105,112,116,111,114,32,105,110,32,98,97,100,32,115,116,97,116,101,0,78,111,116,32,97,32,115,111,99,107,101,116,0,68,101,115,116,105,110,97,116,105,111,110,32,97,100,100,114,101,115,115,32,114,101,113,117,105,114,101,100,0,77,101,115,115,97,103,101,32,116,111,111,32,108,97,114,103,101,0,80,114,111,116,111,99,111,108,32,119,114,111,110,103,32,116,121,112,101,32,102,111,114,32,115,111,99,107,101,116,0,80,114,111,116,111,99,111,108,32,110,111,116,32,97,118,97,105,108,97,98,108,101,0,80,114,111,116,111,99,111,108,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,83,111,99,107,101,116,32,116,121,112,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,78,111,116,32,115,117,112,112,111,114,116,101,100,0,80,114,111,116,111,99,111,108,32,102,97,109,105,108,121,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,65,100,100,114,101,115,115,32,102,97,109,105,108,121,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,98,121,32,112,114,111,116,111,99,111,108,0,65,100,100,114,101,115,115,32,110,111,116,32,97,118,97,105,108,97,98,108,101,0,78,101,116,119,111,114,107,32,105,115,32,100,111,119,110,0,78,101,116,119,111,114,107,32,117,110,114,101,97,99,104,97,98,108,101,0,67,111,110,110,101,99,116,105,111,110,32,114,101,115,101,116,32,98,121,32,110,101,116,119,111,114,107,0,67,111,110,110,101,99,116,105,111,110,32,97,98,111,114,116,101,100,0,78,111,32,98,117,102,102,101,114,32,115,112,97,99,101,32,97,118,97,105,108,97,98,108,101,0,83,111,99,107,101,116,32,105,115,32,99,111,110,110,101,99,116,101,100,0,83,111,99,107,101,116,32,110,111,116,32,99,111,110,110,101,99,116,101,100,0,67,97,110,110,111,116,32,115,101,110,100,32,97,102,116,101,114,32,115,111,99,107,101,116,32,115,104,117,116,100,111,119,110,0,79,112,101,114,97,116,105,111,110,32,97,108,114,101,97,100,121,32,105,110,32,112,114,111,103,114,101,115,115,0,79,112,101,114,97,116,105,111,110,32,105,110,32,112,114,111,103,114,101,115,115,0,83,116,97,108,101,32,102,105,108,101,32,104,97,110,100,108,101,0,82,101,109,111,116,101,32,73,47,79,32,101,114,114,111,114,0,81,117,111,116,97,32,101,120,99,101,101,100,101,100,0,78,111,32,109,101,100,105,117,109,32,102,111,117,110,100,0,87,114,111,110,103,32,109,101,100,105,117,109,32,116,121,112,101,0,78,111,32,101,114,114,111,114,32,105,110,102,111,114,109,97,116,105,111,110,0,0,114,119,97],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+1212584);allocate([17,0,10,0,17,17,17,0,0,0,0,5,0,0,0,0,0,0,9,0,0,0,0,11,0,0,0,0,0,0,0,0,17,0,15,10,17,17,17,3,10,7,0,1,19,9,11,11,0,0,9,6,11,0,0,11,0,6,17,0,0,0,17,17,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,17,0,10,10,17,17,17,0,10,0,0,2,0,9,11,0,0,0,9,0,11,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,12,0,0,0,0,9,12,0,0,0,0,0,12,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,4,13,0,0,0,0,9,14,0,0,0,0,0,14,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,0,15,0,0,0,0,9,16,0,0,0,0,0,16,0,0,16,0,0,18,0,0,0,18,18,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,18,18,18,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,10,0,0,0,0,9,11,0,0,0,0,0,11,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,12,0,0,0,0,9,12,0,0,0,0,0,12,0,0,12,0,0,48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,45,43,32,32,32,48,88,48,120,0,40,110,117,108,108,41,0,45,48,88,43,48,88,32,48,88,45,48,120,43,48,120,32,48,120,0,105,110,102,0,73,78,70,0,110,97,110,0,78,65,78,0,46,0],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+1220981);var tempDoublePtr=Runtime.alignMemory(allocate(12,"i8",ALLOC_STATIC),8);assert(tempDoublePtr%8==0);function copyTempFloat(ptr){HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1]=HEAP8[ptr+1];HEAP8[tempDoublePtr+2]=HEAP8[ptr+2];HEAP8[tempDoublePtr+3]=HEAP8[ptr+3]}function copyTempDouble(ptr){HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1]=HEAP8[ptr+1];HEAP8[tempDoublePtr+2]=HEAP8[ptr+2];HEAP8[tempDoublePtr+3]=HEAP8[ptr+3];HEAP8[tempDoublePtr+4]=HEAP8[ptr+4];HEAP8[tempDoublePtr+5]=HEAP8[ptr+5];HEAP8[tempDoublePtr+6]=HEAP8[ptr+6];HEAP8[tempDoublePtr+7]=HEAP8[ptr+7]}Module["_i64Subtract"]=_i64Subtract;function ___assert_fail(condition,filename,line,func){ABORT=true;throw"Assertion failed: "+Pointer_stringify(condition)+", at: "+[filename?Pointer_stringify(filename):"unknown filename",line,func?Pointer_stringify(func):"unknown function"]+" at "+stackTrace()}Module["_memset"]=_memset;var _BDtoILow=true;Module["_bitshift64Shl"]=_bitshift64Shl;function _abort(){Module["abort"]()}function ___lock(){}function ___unlock(){}Module["_i64Add"]=_i64Add;var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};function ___setErrNo(value){if(Module["___errno_location"])HEAP32[Module["___errno_location"]()>>2]=value;return value}var TTY={ttys:[],init:(function(){}),shutdown:(function(){}),register:(function(dev,ops){TTY.ttys[dev]={input:[],output:[],ops:ops};FS.registerDevice(dev,TTY.stream_ops)}),stream_ops:{open:(function(stream){var tty=TTY.ttys[stream.node.rdev];if(!tty){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}stream.tty=tty;stream.seekable=false}),close:(function(stream){stream.tty.ops.flush(stream.tty)}),flush:(function(stream){stream.tty.ops.flush(stream.tty)}),read:(function(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.get_char){throw new FS.ErrnoError(ERRNO_CODES.ENXIO)}var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=stream.tty.ops.get_char(stream.tty)}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EIO)}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result}if(bytesRead){stream.node.timestamp=Date.now()}return bytesRead}),write:(function(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.put_char){throw new FS.ErrnoError(ERRNO_CODES.ENXIO)}for(var i=0;i<length;i++){try{stream.tty.ops.put_char(stream.tty,buffer[offset+i])}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EIO)}}if(length){stream.node.timestamp=Date.now()}return i})},default_tty_ops:{get_char:(function(tty){if(!tty.input.length){var result=null;if(ENVIRONMENT_IS_NODE){var BUFSIZE=256;var buf=new Buffer(BUFSIZE);var bytesRead=0;var fd=process.stdin.fd;var usingDevice=false;try{fd=fs.openSync("/dev/stdin","r");usingDevice=true}catch(e){}bytesRead=fs.readSync(fd,buf,0,BUFSIZE,null);if(usingDevice){fs.closeSync(fd)}if(bytesRead>0){result=buf.slice(0,bytesRead).toString("utf-8")}else{result=null}}else if(typeof window!="undefined"&&typeof window.prompt=="function"){result=window.prompt("Input: ");if(result!==null){result+="\n"}}else if(typeof readline=="function"){result=readline();if(result!==null){result+="\n"}}if(!result){return null}tty.input=intArrayFromString(result,true)}return tty.input.shift()}),put_char:(function(tty,val){if(val===null||val===10){Module["print"](UTF8ArrayToString(tty.output,0));tty.output=[]}else{if(val!=0)tty.output.push(val)}}),flush:(function(tty){if(tty.output&&tty.output.length>0){Module["print"](UTF8ArrayToString(tty.output,0));tty.output=[]}})},default_tty1_ops:{put_char:(function(tty,val){if(val===null||val===10){Module["printErr"](UTF8ArrayToString(tty.output,0));tty.output=[]}else{if(val!=0)tty.output.push(val)}}),flush:(function(tty){if(tty.output&&tty.output.length>0){Module["printErr"](UTF8ArrayToString(tty.output,0));tty.output=[]}})}};var MEMFS={ops_table:null,mount:(function(mount){return MEMFS.createNode(null,"/",16384|511,0)}),createNode:(function(parent,name,mode,dev){if(FS.isBlkdev(mode)||FS.isFIFO(mode)){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(!MEMFS.ops_table){MEMFS.ops_table={dir:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,lookup:MEMFS.node_ops.lookup,mknod:MEMFS.node_ops.mknod,rename:MEMFS.node_ops.rename,unlink:MEMFS.node_ops.unlink,rmdir:MEMFS.node_ops.rmdir,readdir:MEMFS.node_ops.readdir,symlink:MEMFS.node_ops.symlink},stream:{llseek:MEMFS.stream_ops.llseek}},file:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:{llseek:MEMFS.stream_ops.llseek,read:MEMFS.stream_ops.read,write:MEMFS.stream_ops.write,allocate:MEMFS.stream_ops.allocate,mmap:MEMFS.stream_ops.mmap,msync:MEMFS.stream_ops.msync}},link:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,readlink:MEMFS.node_ops.readlink},stream:{}},chrdev:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:FS.chrdev_stream_ops}}}var node=FS.createNode(parent,name,mode,dev);if(FS.isDir(node.mode)){node.node_ops=MEMFS.ops_table.dir.node;node.stream_ops=MEMFS.ops_table.dir.stream;node.contents={}}else if(FS.isFile(node.mode)){node.node_ops=MEMFS.ops_table.file.node;node.stream_ops=MEMFS.ops_table.file.stream;node.usedBytes=0;node.contents=null}else if(FS.isLink(node.mode)){node.node_ops=MEMFS.ops_table.link.node;node.stream_ops=MEMFS.ops_table.link.stream}else if(FS.isChrdev(node.mode)){node.node_ops=MEMFS.ops_table.chrdev.node;node.stream_ops=MEMFS.ops_table.chrdev.stream}node.timestamp=Date.now();if(parent){parent.contents[name]=node}return node}),getFileDataAsRegularArray:(function(node){if(node.contents&&node.contents.subarray){var arr=[];for(var i=0;i<node.usedBytes;++i)arr.push(node.contents[i]);return arr}return node.contents}),getFileDataAsTypedArray:(function(node){if(!node.contents)return new Uint8Array;if(node.contents.subarray)return node.contents.subarray(0,node.usedBytes);return new Uint8Array(node.contents)}),expandFileStorage:(function(node,newCapacity){if(node.contents&&node.contents.subarray&&newCapacity>node.contents.length){node.contents=MEMFS.getFileDataAsRegularArray(node);node.usedBytes=node.contents.length}if(!node.contents||node.contents.subarray){var prevCapacity=node.contents?node.contents.buffer.byteLength:0;if(prevCapacity>=newCapacity)return;var CAPACITY_DOUBLING_MAX=1024*1024;newCapacity=Math.max(newCapacity,prevCapacity*(prevCapacity<CAPACITY_DOUBLING_MAX?2:1.125)|0);if(prevCapacity!=0)newCapacity=Math.max(newCapacity,256);var oldContents=node.contents;node.contents=new Uint8Array(newCapacity);if(node.usedBytes>0)node.contents.set(oldContents.subarray(0,node.usedBytes),0);return}if(!node.contents&&newCapacity>0)node.contents=[];while(node.contents.length<newCapacity)node.contents.push(0)}),resizeFileStorage:(function(node,newSize){if(node.usedBytes==newSize)return;if(newSize==0){node.contents=null;node.usedBytes=0;return}if(!node.contents||node.contents.subarray){var oldContents=node.contents;node.contents=new Uint8Array(new ArrayBuffer(newSize));if(oldContents){node.contents.set(oldContents.subarray(0,Math.min(newSize,node.usedBytes)))}node.usedBytes=newSize;return}if(!node.contents)node.contents=[];if(node.contents.length>newSize)node.contents.length=newSize;else while(node.contents.length<newSize)node.contents.push(0);node.usedBytes=newSize}),node_ops:{getattr:(function(node){var attr={};attr.dev=FS.isChrdev(node.mode)?node.id:1;attr.ino=node.id;attr.mode=node.mode;attr.nlink=1;attr.uid=0;attr.gid=0;attr.rdev=node.rdev;if(FS.isDir(node.mode)){attr.size=4096}else if(FS.isFile(node.mode)){attr.size=node.usedBytes}else if(FS.isLink(node.mode)){attr.size=node.link.length}else{attr.size=0}attr.atime=new Date(node.timestamp);attr.mtime=new Date(node.timestamp);attr.ctime=new Date(node.timestamp);attr.blksize=4096;attr.blocks=Math.ceil(attr.size/attr.blksize);return attr}),setattr:(function(node,attr){if(attr.mode!==undefined){node.mode=attr.mode}if(attr.timestamp!==undefined){node.timestamp=attr.timestamp}if(attr.size!==undefined){MEMFS.resizeFileStorage(node,attr.size)}}),lookup:(function(parent,name){throw FS.genericErrors[ERRNO_CODES.ENOENT]}),mknod:(function(parent,name,mode,dev){return MEMFS.createNode(parent,name,mode,dev)}),rename:(function(old_node,new_dir,new_name){if(FS.isDir(old_node.mode)){var new_node;try{new_node=FS.lookupNode(new_dir,new_name)}catch(e){}if(new_node){for(var i in new_node.contents){throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)}}}delete old_node.parent.contents[old_node.name];old_node.name=new_name;new_dir.contents[new_name]=old_node;old_node.parent=new_dir}),unlink:(function(parent,name){delete parent.contents[name]}),rmdir:(function(parent,name){var node=FS.lookupNode(parent,name);for(var i in node.contents){throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)}delete parent.contents[name]}),readdir:(function(node){var entries=[".",".."];for(var key in node.contents){if(!node.contents.hasOwnProperty(key)){continue}entries.push(key)}return entries}),symlink:(function(parent,newname,oldpath){var node=MEMFS.createNode(parent,newname,511|40960,0);node.link=oldpath;return node}),readlink:(function(node){if(!FS.isLink(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}return node.link})},stream_ops:{read:(function(stream,buffer,offset,length,position){var contents=stream.node.contents;if(position>=stream.node.usedBytes)return 0;var size=Math.min(stream.node.usedBytes-position,length);assert(size>=0);if(size>8&&contents.subarray){buffer.set(contents.subarray(position,position+size),offset)}else{for(var i=0;i<size;i++)buffer[offset+i]=contents[position+i]}return size}),write:(function(stream,buffer,offset,length,position,canOwn){if(!length)return 0;var node=stream.node;node.timestamp=Date.now();if(buffer.subarray&&(!node.contents||node.contents.subarray)){if(canOwn){node.contents=buffer.subarray(offset,offset+length);node.usedBytes=length;return length}else if(node.usedBytes===0&&position===0){node.contents=new Uint8Array(buffer.subarray(offset,offset+length));node.usedBytes=length;return length}else if(position+length<=node.usedBytes){node.contents.set(buffer.subarray(offset,offset+length),position);return length}}MEMFS.expandFileStorage(node,position+length);if(node.contents.subarray&&buffer.subarray)node.contents.set(buffer.subarray(offset,offset+length),position);else{for(var i=0;i<length;i++){node.contents[position+i]=buffer[offset+i]}}node.usedBytes=Math.max(node.usedBytes,position+length);return length}),llseek:(function(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position}else if(whence===2){if(FS.isFile(stream.node.mode)){position+=stream.node.usedBytes}}if(position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}return position}),allocate:(function(stream,offset,length){MEMFS.expandFileStorage(stream.node,offset+length);stream.node.usedBytes=Math.max(stream.node.usedBytes,offset+length)}),mmap:(function(stream,buffer,offset,length,position,prot,flags){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}var ptr;var allocated;var contents=stream.node.contents;if(!(flags&2)&&(contents.buffer===buffer||contents.buffer===buffer.buffer)){allocated=false;ptr=contents.byteOffset}else{if(position>0||position+length<stream.node.usedBytes){if(contents.subarray){contents=contents.subarray(position,position+length)}else{contents=Array.prototype.slice.call(contents,position,position+length)}}allocated=true;ptr=_malloc(length);if(!ptr){throw new FS.ErrnoError(ERRNO_CODES.ENOMEM)}buffer.set(contents,ptr)}return{ptr:ptr,allocated:allocated}}),msync:(function(stream,buffer,offset,length,mmapFlags){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}if(mmapFlags&2){return 0}var bytesWritten=MEMFS.stream_ops.write(stream,buffer,0,length,offset,false);return 0})}};var IDBFS={dbs:{},indexedDB:(function(){if(typeof indexedDB!=="undefined")return indexedDB;var ret=null;if(typeof window==="object")ret=window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB;assert(ret,"IDBFS used, but indexedDB not supported");return ret}),DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:(function(mount){return MEMFS.mount.apply(null,arguments)}),syncfs:(function(mount,populate,callback){IDBFS.getLocalSet(mount,(function(err,local){if(err)return callback(err);IDBFS.getRemoteSet(mount,(function(err,remote){if(err)return callback(err);var src=populate?remote:local;var dst=populate?local:remote;IDBFS.reconcile(src,dst,callback)}))}))}),getDB:(function(name,callback){var db=IDBFS.dbs[name];if(db){return callback(null,db)}var req;try{req=IDBFS.indexedDB().open(name,IDBFS.DB_VERSION)}catch(e){return callback(e)}req.onupgradeneeded=(function(e){var db=e.target.result;var transaction=e.target.transaction;var fileStore;if(db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)){fileStore=transaction.objectStore(IDBFS.DB_STORE_NAME)}else{fileStore=db.createObjectStore(IDBFS.DB_STORE_NAME)}if(!fileStore.indexNames.contains("timestamp")){fileStore.createIndex("timestamp","timestamp",{unique:false})}});req.onsuccess=(function(){db=req.result;IDBFS.dbs[name]=db;callback(null,db)});req.onerror=(function(e){callback(this.error);e.preventDefault()})}),getLocalSet:(function(mount,callback){var entries={};function isRealDir(p){return p!=="."&&p!==".."}function toAbsolute(root){return(function(p){return PATH.join2(root,p)})}var check=FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));while(check.length){var path=check.pop();var stat;try{stat=FS.stat(path)}catch(e){return callback(e)}if(FS.isDir(stat.mode)){check.push.apply(check,FS.readdir(path).filter(isRealDir).map(toAbsolute(path)))}entries[path]={timestamp:stat.mtime}}return callback(null,{type:"local",entries:entries})}),getRemoteSet:(function(mount,callback){var entries={};IDBFS.getDB(mount.mountpoint,(function(err,db){if(err)return callback(err);var transaction=db.transaction([IDBFS.DB_STORE_NAME],"readonly");transaction.onerror=(function(e){callback(this.error);e.preventDefault()});var store=transaction.objectStore(IDBFS.DB_STORE_NAME);var index=store.index("timestamp");index.openKeyCursor().onsuccess=(function(event){var cursor=event.target.result;if(!cursor){return callback(null,{type:"remote",db:db,entries:entries})}entries[cursor.primaryKey]={timestamp:cursor.key};cursor.continue()})}))}),loadLocalEntry:(function(path,callback){var stat,node;try{var lookup=FS.lookupPath(path);node=lookup.node;stat=FS.stat(path)}catch(e){return callback(e)}if(FS.isDir(stat.mode)){return callback(null,{timestamp:stat.mtime,mode:stat.mode})}else if(FS.isFile(stat.mode)){node.contents=MEMFS.getFileDataAsTypedArray(node);return callback(null,{timestamp:stat.mtime,mode:stat.mode,contents:node.contents})}else{return callback(new Error("node type not supported"))}}),storeLocalEntry:(function(path,entry,callback){try{if(FS.isDir(entry.mode)){FS.mkdir(path,entry.mode)}else if(FS.isFile(entry.mode)){FS.writeFile(path,entry.contents,{encoding:"binary",canOwn:true})}else{return callback(new Error("node type not supported"))}FS.chmod(path,entry.mode);FS.utime(path,entry.timestamp,entry.timestamp)}catch(e){return callback(e)}callback(null)}),removeLocalEntry:(function(path,callback){try{var lookup=FS.lookupPath(path);var stat=FS.stat(path);if(FS.isDir(stat.mode)){FS.rmdir(path)}else if(FS.isFile(stat.mode)){FS.unlink(path)}}catch(e){return callback(e)}callback(null)}),loadRemoteEntry:(function(store,path,callback){var req=store.get(path);req.onsuccess=(function(event){callback(null,event.target.result)});req.onerror=(function(e){callback(this.error);e.preventDefault()})}),storeRemoteEntry:(function(store,path,entry,callback){var req=store.put(entry,path);req.onsuccess=(function(){callback(null)});req.onerror=(function(e){callback(this.error);e.preventDefault()})}),removeRemoteEntry:(function(store,path,callback){var req=store.delete(path);req.onsuccess=(function(){callback(null)});req.onerror=(function(e){callback(this.error);e.preventDefault()})}),reconcile:(function(src,dst,callback){var total=0;var create=[];Object.keys(src.entries).forEach((function(key){var e=src.entries[key];var e2=dst.entries[key];if(!e2||e.timestamp>e2.timestamp){create.push(key);total++}}));var remove=[];Object.keys(dst.entries).forEach((function(key){var e=dst.entries[key];var e2=src.entries[key];if(!e2){remove.push(key);total++}}));if(!total){return callback(null)}var errored=false;var completed=0;var db=src.type==="remote"?src.db:dst.db;var transaction=db.transaction([IDBFS.DB_STORE_NAME],"readwrite");var store=transaction.objectStore(IDBFS.DB_STORE_NAME);function done(err){if(err){if(!done.errored){done.errored=true;return callback(err)}return}if(++completed>=total){return callback(null)}}transaction.onerror=(function(e){done(this.error);e.preventDefault()});create.sort().forEach((function(path){if(dst.type==="local"){IDBFS.loadRemoteEntry(store,path,(function(err,entry){if(err)return done(err);IDBFS.storeLocalEntry(path,entry,done)}))}else{IDBFS.loadLocalEntry(path,(function(err,entry){if(err)return done(err);IDBFS.storeRemoteEntry(store,path,entry,done)}))}}));remove.sort().reverse().forEach((function(path){if(dst.type==="local"){IDBFS.removeLocalEntry(path,done)}else{IDBFS.removeRemoteEntry(store,path,done)}}))})};var NODEFS={isWindows:false,staticInit:(function(){NODEFS.isWindows=!!process.platform.match(/^win/)}),mount:(function(mount){assert(ENVIRONMENT_IS_NODE);return NODEFS.createNode(null,"/",NODEFS.getMode(mount.opts.root),0)}),createNode:(function(parent,name,mode,dev){if(!FS.isDir(mode)&&!FS.isFile(mode)&&!FS.isLink(mode)){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var node=FS.createNode(parent,name,mode);node.node_ops=NODEFS.node_ops;node.stream_ops=NODEFS.stream_ops;return node}),getMode:(function(path){var stat;try{stat=fs.lstatSync(path);if(NODEFS.isWindows){stat.mode=stat.mode|(stat.mode&146)>>1}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}return stat.mode}),realPath:(function(node){var parts=[];while(node.parent!==node){parts.push(node.name);node=node.parent}parts.push(node.mount.opts.root);parts.reverse();return PATH.join.apply(null,parts)}),flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:(function(flags){flags&=~32768;if(flags in NODEFS.flagsToPermissionStringMap){return NODEFS.flagsToPermissionStringMap[flags]}else{throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}}),node_ops:{getattr:(function(node){var path=NODEFS.realPath(node);var stat;try{stat=fs.lstatSync(path)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}if(NODEFS.isWindows&&!stat.blksize){stat.blksize=4096}if(NODEFS.isWindows&&!stat.blocks){stat.blocks=(stat.size+stat.blksize-1)/stat.blksize|0}return{dev:stat.dev,ino:stat.ino,mode:stat.mode,nlink:stat.nlink,uid:stat.uid,gid:stat.gid,rdev:stat.rdev,size:stat.size,atime:stat.atime,mtime:stat.mtime,ctime:stat.ctime,blksize:stat.blksize,blocks:stat.blocks}}),setattr:(function(node,attr){var path=NODEFS.realPath(node);try{if(attr.mode!==undefined){fs.chmodSync(path,attr.mode);node.mode=attr.mode}if(attr.timestamp!==undefined){var date=new Date(attr.timestamp);fs.utimesSync(path,date,date)}if(attr.size!==undefined){fs.truncateSync(path,attr.size)}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),lookup:(function(parent,name){var path=PATH.join2(NODEFS.realPath(parent),name);var mode=NODEFS.getMode(path);return NODEFS.createNode(parent,name,mode)}),mknod:(function(parent,name,mode,dev){var node=NODEFS.createNode(parent,name,mode,dev);var path=NODEFS.realPath(node);try{if(FS.isDir(node.mode)){fs.mkdirSync(path,node.mode)}else{fs.writeFileSync(path,"",{mode:node.mode})}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}return node}),rename:(function(oldNode,newDir,newName){var oldPath=NODEFS.realPath(oldNode);var newPath=PATH.join2(NODEFS.realPath(newDir),newName);try{fs.renameSync(oldPath,newPath)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),unlink:(function(parent,name){var path=PATH.join2(NODEFS.realPath(parent),name);try{fs.unlinkSync(path)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),rmdir:(function(parent,name){var path=PATH.join2(NODEFS.realPath(parent),name);try{fs.rmdirSync(path)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),readdir:(function(node){var path=NODEFS.realPath(node);try{return fs.readdirSync(path)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),symlink:(function(parent,newName,oldPath){var newPath=PATH.join2(NODEFS.realPath(parent),newName);try{fs.symlinkSync(oldPath,newPath)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),readlink:(function(node){var path=NODEFS.realPath(node);try{path=fs.readlinkSync(path);path=NODEJS_PATH.relative(NODEJS_PATH.resolve(node.mount.opts.root),path);return path}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}})},stream_ops:{open:(function(stream){var path=NODEFS.realPath(stream.node);try{if(FS.isFile(stream.node.mode)){stream.nfd=fs.openSync(path,NODEFS.flagsToPermissionString(stream.flags))}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),close:(function(stream){try{if(FS.isFile(stream.node.mode)&&stream.nfd){fs.closeSync(stream.nfd)}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),read:(function(stream,buffer,offset,length,position){if(length===0)return 0;var nbuffer=new Buffer(length);var res;try{res=fs.readSync(stream.nfd,nbuffer,0,length,position)}catch(e){throw new FS.ErrnoError(ERRNO_CODES[e.code])}if(res>0){for(var i=0;i<res;i++){buffer[offset+i]=nbuffer[i]}}return res}),write:(function(stream,buffer,offset,length,position){var nbuffer=new Buffer(buffer.subarray(offset,offset+length));var res;try{res=fs.writeSync(stream.nfd,nbuffer,0,length,position)}catch(e){throw new FS.ErrnoError(ERRNO_CODES[e.code])}return res}),llseek:(function(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position}else if(whence===2){if(FS.isFile(stream.node.mode)){try{var stat=fs.fstatSync(stream.nfd);position+=stat.size}catch(e){throw new FS.ErrnoError(ERRNO_CODES[e.code])}}}if(position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}return position})}};var WORKERFS={DIR_MODE:16895,FILE_MODE:33279,reader:null,mount:(function(mount){assert(ENVIRONMENT_IS_WORKER);if(!WORKERFS.reader)WORKERFS.reader=new FileReaderSync;var root=WORKERFS.createNode(null,"/",WORKERFS.DIR_MODE,0);var createdParents={};function ensureParent(path){var parts=path.split("/");var parent=root;for(var i=0;i<parts.length-1;i++){var curr=parts.slice(0,i+1).join("/");if(!createdParents[curr]){createdParents[curr]=WORKERFS.createNode(parent,curr,WORKERFS.DIR_MODE,0)}parent=createdParents[curr]}return parent}function base(path){var parts=path.split("/");return parts[parts.length-1]}Array.prototype.forEach.call(mount.opts["files"]||[],(function(file){WORKERFS.createNode(ensureParent(file.name),base(file.name),WORKERFS.FILE_MODE,0,file,file.lastModifiedDate)}));(mount.opts["blobs"]||[]).forEach((function(obj){WORKERFS.createNode(ensureParent(obj["name"]),base(obj["name"]),WORKERFS.FILE_MODE,0,obj["data"])}));(mount.opts["packages"]||[]).forEach((function(pack){pack["metadata"].files.forEach((function(file){var name=file.filename.substr(1);WORKERFS.createNode(ensureParent(name),base(name),WORKERFS.FILE_MODE,0,pack["blob"].slice(file.start,file.end))}))}));return root}),createNode:(function(parent,name,mode,dev,contents,mtime){var node=FS.createNode(parent,name,mode);node.mode=mode;node.node_ops=WORKERFS.node_ops;node.stream_ops=WORKERFS.stream_ops;node.timestamp=(mtime||new Date).getTime();assert(WORKERFS.FILE_MODE!==WORKERFS.DIR_MODE);if(mode===WORKERFS.FILE_MODE){node.size=contents.size;node.contents=contents}else{node.size=4096;node.contents={}}if(parent){parent.contents[name]=node}return node}),node_ops:{getattr:(function(node){return{dev:1,ino:undefined,mode:node.mode,nlink:1,uid:0,gid:0,rdev:undefined,size:node.size,atime:new Date(node.timestamp),mtime:new Date(node.timestamp),ctime:new Date(node.timestamp),blksize:4096,blocks:Math.ceil(node.size/4096)}}),setattr:(function(node,attr){if(attr.mode!==undefined){node.mode=attr.mode}if(attr.timestamp!==undefined){node.timestamp=attr.timestamp}}),lookup:(function(parent,name){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}),mknod:(function(parent,name,mode,dev){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}),rename:(function(oldNode,newDir,newName){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}),unlink:(function(parent,name){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}),rmdir:(function(parent,name){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}),readdir:(function(node){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}),symlink:(function(parent,newName,oldPath){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}),readlink:(function(node){throw new FS.ErrnoError(ERRNO_CODES.EPERM)})},stream_ops:{read:(function(stream,buffer,offset,length,position){if(position>=stream.node.size)return 0;var chunk=stream.node.contents.slice(position,position+length);var ab=WORKERFS.reader.readAsArrayBuffer(chunk);buffer.set(new Uint8Array(ab),offset);return chunk.size}),write:(function(stream,buffer,offset,length,position){throw new FS.ErrnoError(ERRNO_CODES.EIO)}),llseek:(function(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position}else if(whence===2){if(FS.isFile(stream.node.mode)){position+=stream.node.size}}if(position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}return position})}};var _stdin=allocate(1,"i32*",ALLOC_STATIC);var _stdout=allocate(1,"i32*",ALLOC_STATIC);var _stderr=allocate(1,"i32*",ALLOC_STATIC);var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,trackingDelegate:{},tracking:{openFlags:{READ:1,WRITE:2}},ErrnoError:null,genericErrors:{},filesystems:null,handleFSError:(function(e){if(!(e instanceof FS.ErrnoError))throw e+" : "+stackTrace();return ___setErrNo(e.errno)}),lookupPath:(function(path,opts){path=PATH.resolve(FS.cwd(),path);opts=opts||{};if(!path)return{path:"",node:null};var defaults={follow_mount:true,recurse_count:0};for(var key in defaults){if(opts[key]===undefined){opts[key]=defaults[key]}}if(opts.recurse_count>8){throw new FS.ErrnoError(ERRNO_CODES.ELOOP)}var parts=PATH.normalizeArray(path.split("/").filter((function(p){return!!p})),false);var current=FS.root;var current_path="/";for(var i=0;i<parts.length;i++){var islast=i===parts.length-1;if(islast&&opts.parent){break}current=FS.lookupNode(current,parts[i]);current_path=PATH.join2(current_path,parts[i]);if(FS.isMountpoint(current)){if(!islast||islast&&opts.follow_mount){current=current.mounted.root}}if(!islast||opts.follow){var count=0;while(FS.isLink(current.mode)){var link=FS.readlink(current_path);current_path=PATH.resolve(PATH.dirname(current_path),link);var lookup=FS.lookupPath(current_path,{recurse_count:opts.recurse_count});current=lookup.node;if(count++>40){throw new FS.ErrnoError(ERRNO_CODES.ELOOP)}}}}return{path:current_path,node:current}}),getPath:(function(node){var path;while(true){if(FS.isRoot(node)){var mount=node.mount.mountpoint;if(!path)return mount;return mount[mount.length-1]!=="/"?mount+"/"+path:mount+path}path=path?node.name+"/"+path:node.name;node=node.parent}}),hashName:(function(parentid,name){var hash=0;for(var i=0;i<name.length;i++){hash=(hash<<5)-hash+name.charCodeAt(i)|0}return(parentid+hash>>>0)%FS.nameTable.length}),hashAddNode:(function(node){var hash=FS.hashName(node.parent.id,node.name);node.name_next=FS.nameTable[hash];FS.nameTable[hash]=node}),hashRemoveNode:(function(node){var hash=FS.hashName(node.parent.id,node.name);if(FS.nameTable[hash]===node){FS.nameTable[hash]=node.name_next}else{var current=FS.nameTable[hash];while(current){if(current.name_next===node){current.name_next=node.name_next;break}current=current.name_next}}}),lookupNode:(function(parent,name){var err=FS.mayLookup(parent);if(err){throw new FS.ErrnoError(err,parent)}var hash=FS.hashName(parent.id,name);for(var node=FS.nameTable[hash];node;node=node.name_next){var nodeName=node.name;if(node.parent.id===parent.id&&nodeName===name){return node}}return FS.lookup(parent,name)}),createNode:(function(parent,name,mode,rdev){if(!FS.FSNode){FS.FSNode=(function(parent,name,mode,rdev){if(!parent){parent=this}this.parent=parent;this.mount=parent.mount;this.mounted=null;this.id=FS.nextInode++;this.name=name;this.mode=mode;this.node_ops={};this.stream_ops={};this.rdev=rdev});FS.FSNode.prototype={};var readMode=292|73;var writeMode=146;Object.defineProperties(FS.FSNode.prototype,{read:{get:(function(){return(this.mode&readMode)===readMode}),set:(function(val){val?this.mode|=readMode:this.mode&=~readMode})},write:{get:(function(){return(this.mode&writeMode)===writeMode}),set:(function(val){val?this.mode|=writeMode:this.mode&=~writeMode})},isFolder:{get:(function(){return FS.isDir(this.mode)})},isDevice:{get:(function(){return FS.isChrdev(this.mode)})}})}var node=new FS.FSNode(parent,name,mode,rdev);FS.hashAddNode(node);return node}),destroyNode:(function(node){FS.hashRemoveNode(node)}),isRoot:(function(node){return node===node.parent}),isMountpoint:(function(node){return!!node.mounted}),isFile:(function(mode){return(mode&61440)===32768}),isDir:(function(mode){return(mode&61440)===16384}),isLink:(function(mode){return(mode&61440)===40960}),isChrdev:(function(mode){return(mode&61440)===8192}),isBlkdev:(function(mode){return(mode&61440)===24576}),isFIFO:(function(mode){return(mode&61440)===4096}),isSocket:(function(mode){return(mode&49152)===49152}),flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:(function(str){var flags=FS.flagModes[str];if(typeof flags==="undefined"){throw new Error("Unknown file open mode: "+str)}return flags}),flagsToPermissionString:(function(flag){var perms=["r","w","rw"][flag&3];if(flag&512){perms+="w"}return perms}),nodePermissions:(function(node,perms){if(FS.ignorePermissions){return 0}if(perms.indexOf("r")!==-1&&!(node.mode&292)){return ERRNO_CODES.EACCES}else if(perms.indexOf("w")!==-1&&!(node.mode&146)){return ERRNO_CODES.EACCES}else if(perms.indexOf("x")!==-1&&!(node.mode&73)){return ERRNO_CODES.EACCES}return 0}),mayLookup:(function(dir){var err=FS.nodePermissions(dir,"x");if(err)return err;if(!dir.node_ops.lookup)return ERRNO_CODES.EACCES;return 0}),mayCreate:(function(dir,name){try{var node=FS.lookupNode(dir,name);return ERRNO_CODES.EEXIST}catch(e){}return FS.nodePermissions(dir,"wx")}),mayDelete:(function(dir,name,isdir){var node;try{node=FS.lookupNode(dir,name)}catch(e){return e.errno}var err=FS.nodePermissions(dir,"wx");if(err){return err}if(isdir){if(!FS.isDir(node.mode)){return ERRNO_CODES.ENOTDIR}if(FS.isRoot(node)||FS.getPath(node)===FS.cwd()){return ERRNO_CODES.EBUSY}}else{if(FS.isDir(node.mode)){return ERRNO_CODES.EISDIR}}return 0}),mayOpen:(function(node,flags){if(!node){return ERRNO_CODES.ENOENT}if(FS.isLink(node.mode)){return ERRNO_CODES.ELOOP}else if(FS.isDir(node.mode)){if((flags&2097155)!==0||flags&512){return ERRNO_CODES.EISDIR}}return FS.nodePermissions(node,FS.flagsToPermissionString(flags))}),MAX_OPEN_FDS:4096,nextfd:(function(fd_start,fd_end){fd_start=fd_start||0;fd_end=fd_end||FS.MAX_OPEN_FDS;for(var fd=fd_start;fd<=fd_end;fd++){if(!FS.streams[fd]){return fd}}throw new FS.ErrnoError(ERRNO_CODES.EMFILE)}),getStream:(function(fd){return FS.streams[fd]}),createStream:(function(stream,fd_start,fd_end){if(!FS.FSStream){FS.FSStream=(function(){});FS.FSStream.prototype={};Object.defineProperties(FS.FSStream.prototype,{object:{get:(function(){return this.node}),set:(function(val){this.node=val})},isRead:{get:(function(){return(this.flags&2097155)!==1})},isWrite:{get:(function(){return(this.flags&2097155)!==0})},isAppend:{get:(function(){return this.flags&1024})}})}var newStream=new FS.FSStream;for(var p in stream){newStream[p]=stream[p]}stream=newStream;var fd=FS.nextfd(fd_start,fd_end);stream.fd=fd;FS.streams[fd]=stream;return stream}),closeStream:(function(fd){FS.streams[fd]=null}),chrdev_stream_ops:{open:(function(stream){var device=FS.getDevice(stream.node.rdev);stream.stream_ops=device.stream_ops;if(stream.stream_ops.open){stream.stream_ops.open(stream)}}),llseek:(function(){throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)})},major:(function(dev){return dev>>8}),minor:(function(dev){return dev&255}),makedev:(function(ma,mi){return ma<<8|mi}),registerDevice:(function(dev,ops){FS.devices[dev]={stream_ops:ops}}),getDevice:(function(dev){return FS.devices[dev]}),getMounts:(function(mount){var mounts=[];var check=[mount];while(check.length){var m=check.pop();mounts.push(m);check.push.apply(check,m.mounts)}return mounts}),syncfs:(function(populate,callback){if(typeof populate==="function"){callback=populate;populate=false}var mounts=FS.getMounts(FS.root.mount);var completed=0;function done(err){if(err){if(!done.errored){done.errored=true;return callback(err)}return}if(++completed>=mounts.length){callback(null)}}mounts.forEach((function(mount){if(!mount.type.syncfs){return done(null)}mount.type.syncfs(mount,populate,done)}))}),mount:(function(type,opts,mountpoint){var root=mountpoint==="/";var pseudo=!mountpoint;var node;if(root&&FS.root){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}else if(!root&&!pseudo){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});mountpoint=lookup.path;node=lookup.node;if(FS.isMountpoint(node)){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}if(!FS.isDir(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)}}var mount={type:type,opts:opts,mountpoint:mountpoint,mounts:[]};var mountRoot=type.mount(mount);mountRoot.mount=mount;mount.root=mountRoot;if(root){FS.root=mountRoot}else if(node){node.mounted=mount;if(node.mount){node.mount.mounts.push(mount)}}return mountRoot}),unmount:(function(mountpoint){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});if(!FS.isMountpoint(lookup.node)){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var node=lookup.node;var mount=node.mounted;var mounts=FS.getMounts(mount);Object.keys(FS.nameTable).forEach((function(hash){var current=FS.nameTable[hash];while(current){var next=current.name_next;if(mounts.indexOf(current.mount)!==-1){FS.destroyNode(current)}current=next}}));node.mounted=null;var idx=node.mount.mounts.indexOf(mount);assert(idx!==-1);node.mount.mounts.splice(idx,1)}),lookup:(function(parent,name){return parent.node_ops.lookup(parent,name)}),mknod:(function(path,mode,dev){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);if(!name||name==="."||name===".."){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var err=FS.mayCreate(parent,name);if(err){throw new FS.ErrnoError(err)}if(!parent.node_ops.mknod){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}return parent.node_ops.mknod(parent,name,mode,dev)}),create:(function(path,mode){mode=mode!==undefined?mode:438;mode&=4095;mode|=32768;return FS.mknod(path,mode,0)}),mkdir:(function(path,mode){mode=mode!==undefined?mode:511;mode&=511|512;mode|=16384;return FS.mknod(path,mode,0)}),mkdev:(function(path,mode,dev){if(typeof dev==="undefined"){dev=mode;mode=438}mode|=8192;return FS.mknod(path,mode,dev)}),symlink:(function(oldpath,newpath){if(!PATH.resolve(oldpath)){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}var lookup=FS.lookupPath(newpath,{parent:true});var parent=lookup.node;if(!parent){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}var newname=PATH.basename(newpath);var err=FS.mayCreate(parent,newname);if(err){throw new FS.ErrnoError(err)}if(!parent.node_ops.symlink){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}return parent.node_ops.symlink(parent,newname,oldpath)}),rename:(function(old_path,new_path){var old_dirname=PATH.dirname(old_path);var new_dirname=PATH.dirname(new_path);var old_name=PATH.basename(old_path);var new_name=PATH.basename(new_path);var lookup,old_dir,new_dir;try{lookup=FS.lookupPath(old_path,{parent:true});old_dir=lookup.node;lookup=FS.lookupPath(new_path,{parent:true});new_dir=lookup.node}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}if(!old_dir||!new_dir)throw new FS.ErrnoError(ERRNO_CODES.ENOENT);if(old_dir.mount!==new_dir.mount){throw new FS.ErrnoError(ERRNO_CODES.EXDEV)}var old_node=FS.lookupNode(old_dir,old_name);var relative=PATH.relative(old_path,new_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}relative=PATH.relative(new_path,old_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)}var new_node;try{new_node=FS.lookupNode(new_dir,new_name)}catch(e){}if(old_node===new_node){return}var isdir=FS.isDir(old_node.mode);var err=FS.mayDelete(old_dir,old_name,isdir);if(err){throw new FS.ErrnoError(err)}err=new_node?FS.mayDelete(new_dir,new_name,isdir):FS.mayCreate(new_dir,new_name);if(err){throw new FS.ErrnoError(err)}if(!old_dir.node_ops.rename){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(FS.isMountpoint(old_node)||new_node&&FS.isMountpoint(new_node)){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}if(new_dir!==old_dir){err=FS.nodePermissions(old_dir,"w");if(err){throw new FS.ErrnoError(err)}}try{if(FS.trackingDelegate["willMovePath"]){FS.trackingDelegate["willMovePath"](old_path,new_path)}}catch(e){console.log("FS.trackingDelegate['willMovePath']('"+old_path+"', '"+new_path+"') threw an exception: "+e.message)}FS.hashRemoveNode(old_node);try{old_dir.node_ops.rename(old_node,new_dir,new_name)}catch(e){throw e}finally{FS.hashAddNode(old_node)}try{if(FS.trackingDelegate["onMovePath"])FS.trackingDelegate["onMovePath"](old_path,new_path)}catch(e){console.log("FS.trackingDelegate['onMovePath']('"+old_path+"', '"+new_path+"') threw an exception: "+e.message)}}),rmdir:(function(path){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var err=FS.mayDelete(parent,name,true);if(err){throw new FS.ErrnoError(err)}if(!parent.node_ops.rmdir){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}try{if(FS.trackingDelegate["willDeletePath"]){FS.trackingDelegate["willDeletePath"](path)}}catch(e){console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: "+e.message)}parent.node_ops.rmdir(parent,name);FS.destroyNode(node);try{if(FS.trackingDelegate["onDeletePath"])FS.trackingDelegate["onDeletePath"](path)}catch(e){console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: "+e.message)}}),readdir:(function(path){var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;if(!node.node_ops.readdir){throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)}return node.node_ops.readdir(node)}),unlink:(function(path){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var err=FS.mayDelete(parent,name,false);if(err){if(err===ERRNO_CODES.EISDIR)err=ERRNO_CODES.EPERM;throw new FS.ErrnoError(err)}if(!parent.node_ops.unlink){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}try{if(FS.trackingDelegate["willDeletePath"]){FS.trackingDelegate["willDeletePath"](path)}}catch(e){console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: "+e.message)}parent.node_ops.unlink(parent,name);FS.destroyNode(node);try{if(FS.trackingDelegate["onDeletePath"])FS.trackingDelegate["onDeletePath"](path)}catch(e){console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: "+e.message)}}),readlink:(function(path){var lookup=FS.lookupPath(path);var link=lookup.node;if(!link){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}if(!link.node_ops.readlink){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}return PATH.resolve(FS.getPath(link.parent),link.node_ops.readlink(link))}),stat:(function(path,dontFollow){var lookup=FS.lookupPath(path,{follow:!dontFollow});var node=lookup.node;if(!node){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}if(!node.node_ops.getattr){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}return node.node_ops.getattr(node)}),lstat:(function(path){return FS.stat(path,true)}),chmod:(function(path,mode,dontFollow){var node;if(typeof path==="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node}else{node=path}if(!node.node_ops.setattr){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}node.node_ops.setattr(node,{mode:mode&4095|node.mode&~4095,timestamp:Date.now()})}),lchmod:(function(path,mode){FS.chmod(path,mode,true)}),fchmod:(function(fd,mode){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}FS.chmod(stream.node,mode)}),chown:(function(path,uid,gid,dontFollow){var node;if(typeof path==="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node}else{node=path}if(!node.node_ops.setattr){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}node.node_ops.setattr(node,{timestamp:Date.now()})}),lchown:(function(path,uid,gid){FS.chown(path,uid,gid,true)}),fchown:(function(fd,uid,gid){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}FS.chown(stream.node,uid,gid)}),truncate:(function(path,len){if(len<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var node;if(typeof path==="string"){var lookup=FS.lookupPath(path,{follow:true});node=lookup.node}else{node=path}if(!node.node_ops.setattr){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(FS.isDir(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EISDIR)}if(!FS.isFile(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var err=FS.nodePermissions(node,"w");if(err){throw new FS.ErrnoError(err)}node.node_ops.setattr(node,{size:len,timestamp:Date.now()})}),ftruncate:(function(fd,len){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}FS.truncate(stream.node,len)}),utime:(function(path,atime,mtime){var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;node.node_ops.setattr(node,{timestamp:Math.max(atime,mtime)})}),open:(function(path,flags,mode,fd_start,fd_end){if(path===""){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}flags=typeof flags==="string"?FS.modeStringToFlags(flags):flags;mode=typeof mode==="undefined"?438:mode;if(flags&64){mode=mode&4095|32768}else{mode=0}var node;if(typeof path==="object"){node=path}else{path=PATH.normalize(path);try{var lookup=FS.lookupPath(path,{follow:!(flags&131072)});node=lookup.node}catch(e){}}var created=false;if(flags&64){if(node){if(flags&128){throw new FS.ErrnoError(ERRNO_CODES.EEXIST)}}else{node=FS.mknod(path,mode,0);created=true}}if(!node){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}if(FS.isChrdev(node.mode)){flags&=~512}if(flags&65536&&!FS.isDir(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)}if(!created){var err=FS.mayOpen(node,flags);if(err){throw new FS.ErrnoError(err)}}if(flags&512){FS.truncate(node,0)}flags&=~(128|512);var stream=FS.createStream({node:node,path:FS.getPath(node),flags:flags,seekable:true,position:0,stream_ops:node.stream_ops,ungotten:[],error:false},fd_start,fd_end);if(stream.stream_ops.open){stream.stream_ops.open(stream)}if(Module["logReadFiles"]&&!(flags&1)){if(!FS.readFiles)FS.readFiles={};if(!(path in FS.readFiles)){FS.readFiles[path]=1;Module["printErr"]("read file: "+path)}}try{if(FS.trackingDelegate["onOpenFile"]){var trackingFlags=0;if((flags&2097155)!==1){trackingFlags|=FS.tracking.openFlags.READ}if((flags&2097155)!==0){trackingFlags|=FS.tracking.openFlags.WRITE}FS.trackingDelegate["onOpenFile"](path,trackingFlags)}}catch(e){console.log("FS.trackingDelegate['onOpenFile']('"+path+"', flags) threw an exception: "+e.message)}return stream}),close:(function(stream){if(stream.getdents)stream.getdents=null;try{if(stream.stream_ops.close){stream.stream_ops.close(stream)}}catch(e){throw e}finally{FS.closeStream(stream.fd)}}),llseek:(function(stream,offset,whence){if(!stream.seekable||!stream.stream_ops.llseek){throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)}stream.position=stream.stream_ops.llseek(stream,offset,whence);stream.ungotten=[];return stream.position}),read:(function(stream,buffer,offset,length,position){if(length<0||position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}if((stream.flags&2097155)===1){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EISDIR)}if(!stream.stream_ops.read){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var seeking=true;if(typeof position==="undefined"){position=stream.position;seeking=false}else if(!stream.seekable){throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)}var bytesRead=stream.stream_ops.read(stream,buffer,offset,length,position);if(!seeking)stream.position+=bytesRead;return bytesRead}),write:(function(stream,buffer,offset,length,position,canOwn){if(length<0||position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EISDIR)}if(!stream.stream_ops.write){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}if(stream.flags&1024){FS.llseek(stream,0,2)}var seeking=true;if(typeof position==="undefined"){position=stream.position;seeking=false}else if(!stream.seekable){throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)}var bytesWritten=stream.stream_ops.write(stream,buffer,offset,length,position,canOwn);if(!seeking)stream.position+=bytesWritten;try{if(stream.path&&FS.trackingDelegate["onWriteToFile"])FS.trackingDelegate["onWriteToFile"](stream.path)}catch(e){console.log("FS.trackingDelegate['onWriteToFile']('"+path+"') threw an exception: "+e.message)}return bytesWritten}),allocate:(function(stream,offset,length){if(offset<0||length<=0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}if(!FS.isFile(stream.node.mode)&&!FS.isDir(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}if(!stream.stream_ops.allocate){throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP)}stream.stream_ops.allocate(stream,offset,length)}),mmap:(function(stream,buffer,offset,length,position,prot,flags){if((stream.flags&2097155)===1){throw new FS.ErrnoError(ERRNO_CODES.EACCES)}if(!stream.stream_ops.mmap){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}return stream.stream_ops.mmap(stream,buffer,offset,length,position,prot,flags)}),msync:(function(stream,buffer,offset,length,mmapFlags){if(!stream||!stream.stream_ops.msync){return 0}return stream.stream_ops.msync(stream,buffer,offset,length,mmapFlags)}),munmap:(function(stream){return 0}),ioctl:(function(stream,cmd,arg){if(!stream.stream_ops.ioctl){throw new FS.ErrnoError(ERRNO_CODES.ENOTTY)}return stream.stream_ops.ioctl(stream,cmd,arg)}),readFile:(function(path,opts){opts=opts||{};opts.flags=opts.flags||"r";opts.encoding=opts.encoding||"binary";if(opts.encoding!=="utf8"&&opts.encoding!=="binary"){throw new Error('Invalid encoding type "'+opts.encoding+'"')}var ret;var stream=FS.open(path,opts.flags);var stat=FS.stat(path);var length=stat.size;var buf=new Uint8Array(length);FS.read(stream,buf,0,length,0);if(opts.encoding==="utf8"){ret=UTF8ArrayToString(buf,0)}else if(opts.encoding==="binary"){ret=buf}FS.close(stream);return ret}),writeFile:(function(path,data,opts){opts=opts||{};opts.flags=opts.flags||"w";opts.encoding=opts.encoding||"utf8";if(opts.encoding!=="utf8"&&opts.encoding!=="binary"){throw new Error('Invalid encoding type "'+opts.encoding+'"')}var stream=FS.open(path,opts.flags,opts.mode);if(opts.encoding==="utf8"){var buf=new Uint8Array(lengthBytesUTF8(data)+1);var actualNumBytes=stringToUTF8Array(data,buf,0,buf.length);FS.write(stream,buf,0,actualNumBytes,0,opts.canOwn)}else if(opts.encoding==="binary"){FS.write(stream,data,0,data.length,0,opts.canOwn)}FS.close(stream)}),cwd:(function(){return FS.currentPath}),chdir:(function(path){var lookup=FS.lookupPath(path,{follow:true});if(!FS.isDir(lookup.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)}var err=FS.nodePermissions(lookup.node,"x");if(err){throw new FS.ErrnoError(err)}FS.currentPath=lookup.path}),createDefaultDirectories:(function(){FS.mkdir("/tmp");FS.mkdir("/home");FS.mkdir("/home/web_user")}),createDefaultDevices:(function(){FS.mkdir("/dev");FS.registerDevice(FS.makedev(1,3),{read:(function(){return 0}),write:(function(stream,buffer,offset,length,pos){return length})});FS.mkdev("/dev/null",FS.makedev(1,3));TTY.register(FS.makedev(5,0),TTY.default_tty_ops);TTY.register(FS.makedev(6,0),TTY.default_tty1_ops);FS.mkdev("/dev/tty",FS.makedev(5,0));FS.mkdev("/dev/tty1",FS.makedev(6,0));var random_device;if(typeof crypto!=="undefined"){var randomBuffer=new Uint8Array(1);random_device=(function(){crypto.getRandomValues(randomBuffer);return randomBuffer[0]})}else if(ENVIRONMENT_IS_NODE){random_device=(function(){return require("crypto").randomBytes(1)[0]})}else{random_device=(function(){return Math.random()*256|0})}FS.createDevice("/dev","random",random_device);FS.createDevice("/dev","urandom",random_device);FS.mkdir("/dev/shm");FS.mkdir("/dev/shm/tmp")}),createSpecialDirectories:(function(){FS.mkdir("/proc");FS.mkdir("/proc/self");FS.mkdir("/proc/self/fd");FS.mount({mount:(function(){var node=FS.createNode("/proc/self","fd",16384|511,73);node.node_ops={lookup:(function(parent,name){var fd=+name;var stream=FS.getStream(fd);if(!stream)throw new FS.ErrnoError(ERRNO_CODES.EBADF);var ret={parent:null,mount:{mountpoint:"fake"},node_ops:{readlink:(function(){return stream.path})}};ret.parent=ret;return ret})};return node})},{},"/proc/self/fd")}),createStandardStreams:(function(){if(Module["stdin"]){FS.createDevice("/dev","stdin",Module["stdin"])}else{FS.symlink("/dev/tty","/dev/stdin")}if(Module["stdout"]){FS.createDevice("/dev","stdout",null,Module["stdout"])}else{FS.symlink("/dev/tty","/dev/stdout")}if(Module["stderr"]){FS.createDevice("/dev","stderr",null,Module["stderr"])}else{FS.symlink("/dev/tty1","/dev/stderr")}var stdin=FS.open("/dev/stdin","r");assert(stdin.fd===0,"invalid handle for stdin ("+stdin.fd+")");var stdout=FS.open("/dev/stdout","w");assert(stdout.fd===1,"invalid handle for stdout ("+stdout.fd+")");var stderr=FS.open("/dev/stderr","w");assert(stderr.fd===2,"invalid handle for stderr ("+stderr.fd+")")}),ensureErrnoError:(function(){if(FS.ErrnoError)return;FS.ErrnoError=function ErrnoError(errno,node){this.node=node;this.setErrno=(function(errno){this.errno=errno;for(var key in ERRNO_CODES){if(ERRNO_CODES[key]===errno){this.code=key;break}}});this.setErrno(errno);this.message=ERRNO_MESSAGES[errno]};FS.ErrnoError.prototype=new Error;FS.ErrnoError.prototype.constructor=FS.ErrnoError;[ERRNO_CODES.ENOENT].forEach((function(code){FS.genericErrors[code]=new FS.ErrnoError(code);FS.genericErrors[code].stack="<generic error, no stack>"}))}),staticInit:(function(){FS.ensureErrnoError();FS.nameTable=new Array(4096);FS.mount(MEMFS,{},"/");FS.createDefaultDirectories();FS.createDefaultDevices();FS.createSpecialDirectories();FS.filesystems={"MEMFS":MEMFS,"IDBFS":IDBFS,"NODEFS":NODEFS,"WORKERFS":WORKERFS}}),init:(function(input,output,error){assert(!FS.init.initialized,"FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");FS.init.initialized=true;FS.ensureErrnoError();Module["stdin"]=input||Module["stdin"];Module["stdout"]=output||Module["stdout"];Module["stderr"]=error||Module["stderr"];FS.createStandardStreams()}),quit:(function(){FS.init.initialized=false;var fflush=Module["_fflush"];if(fflush)fflush(0);for(var i=0;i<FS.streams.length;i++){var stream=FS.streams[i];if(!stream){continue}FS.close(stream)}}),getMode:(function(canRead,canWrite){var mode=0;if(canRead)mode|=292|73;if(canWrite)mode|=146;return mode}),joinPath:(function(parts,forceRelative){var path=PATH.join.apply(null,parts);if(forceRelative&&path[0]=="/")path=path.substr(1);return path}),absolutePath:(function(relative,base){return PATH.resolve(base,relative)}),standardizePath:(function(path){return PATH.normalize(path)}),findObject:(function(path,dontResolveLastLink){var ret=FS.analyzePath(path,dontResolveLastLink);if(ret.exists){return ret.object}else{___setErrNo(ret.error);return null}}),analyzePath:(function(path,dontResolveLastLink){try{var lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});path=lookup.path}catch(e){}var ret={isRoot:false,exists:false,error:0,name:null,path:null,object:null,parentExists:false,parentPath:null,parentObject:null};try{var lookup=FS.lookupPath(path,{parent:true});ret.parentExists=true;ret.parentPath=lookup.path;ret.parentObject=lookup.node;ret.name=PATH.basename(path);lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});ret.exists=true;ret.path=lookup.path;ret.object=lookup.node;ret.name=lookup.node.name;ret.isRoot=lookup.path==="/"}catch(e){ret.error=e.errno}return ret}),createFolder:(function(parent,name,canRead,canWrite){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);var mode=FS.getMode(canRead,canWrite);return FS.mkdir(path,mode)}),createPath:(function(parent,path,canRead,canWrite){parent=typeof parent==="string"?parent:FS.getPath(parent);var parts=path.split("/").reverse();while(parts.length){var part=parts.pop();if(!part)continue;var current=PATH.join2(parent,part);try{FS.mkdir(current)}catch(e){}parent=current}return current}),createFile:(function(parent,name,properties,canRead,canWrite){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);var mode=FS.getMode(canRead,canWrite);return FS.create(path,mode)}),createDataFile:(function(parent,name,data,canRead,canWrite,canOwn){var path=name?PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name):parent;var mode=FS.getMode(canRead,canWrite);var node=FS.create(path,mode);if(data){if(typeof data==="string"){var arr=new Array(data.length);for(var i=0,len=data.length;i<len;++i)arr[i]=data.charCodeAt(i);data=arr}FS.chmod(node,mode|146);var stream=FS.open(node,"w");FS.write(stream,data,0,data.length,0,canOwn);FS.close(stream);FS.chmod(node,mode)}return node}),createDevice:(function(parent,name,input,output){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);var mode=FS.getMode(!!input,!!output);if(!FS.createDevice.major)FS.createDevice.major=64;var dev=FS.makedev(FS.createDevice.major++,0);FS.registerDevice(dev,{open:(function(stream){stream.seekable=false}),close:(function(stream){if(output&&output.buffer&&output.buffer.length){output(10)}}),read:(function(stream,buffer,offset,length,pos){var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=input()}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EIO)}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result}if(bytesRead){stream.node.timestamp=Date.now()}return bytesRead}),write:(function(stream,buffer,offset,length,pos){for(var i=0;i<length;i++){try{output(buffer[offset+i])}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EIO)}}if(length){stream.node.timestamp=Date.now()}return i})});return FS.mkdev(path,mode,dev)}),createLink:(function(parent,name,target,canRead,canWrite){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);return FS.symlink(target,path)}),forceLoadFile:(function(obj){if(obj.isDevice||obj.isFolder||obj.link||obj.contents)return true;var success=true;if(typeof XMLHttpRequest!=="undefined"){throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")}else if(Module["read"]){try{obj.contents=intArrayFromString(Module["read"](obj.url),true);obj.usedBytes=obj.contents.length}catch(e){success=false}}else{throw new Error("Cannot load without read() or XMLHttpRequest.")}if(!success)___setErrNo(ERRNO_CODES.EIO);return success}),createLazyFile:(function(parent,name,url,canRead,canWrite){function LazyUint8Array(){this.lengthKnown=false;this.chunks=[]}LazyUint8Array.prototype.get=function LazyUint8Array_get(idx){if(idx>this.length-1||idx<0){return undefined}var chunkOffset=idx%this.chunkSize;var chunkNum=idx/this.chunkSize|0;return this.getter(chunkNum)[chunkOffset]};LazyUint8Array.prototype.setDataGetter=function LazyUint8Array_setDataGetter(getter){this.getter=getter};LazyUint8Array.prototype.cacheLength=function LazyUint8Array_cacheLength(){var xhr=new XMLHttpRequest;xhr.open("HEAD",url,false);xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))throw new Error("Couldn't load "+url+". Status: "+xhr.status);var datalength=Number(xhr.getResponseHeader("Content-length"));var header;var hasByteServing=(header=xhr.getResponseHeader("Accept-Ranges"))&&header==="bytes";var chunkSize=1024*1024;if(!hasByteServing)chunkSize=datalength;var doXHR=(function(from,to){if(from>to)throw new Error("invalid range ("+from+", "+to+") or no bytes requested!");if(to>datalength-1)throw new Error("only "+datalength+" bytes available! programmer error!");var xhr=new XMLHttpRequest;xhr.open("GET",url,false);if(datalength!==chunkSize)xhr.setRequestHeader("Range","bytes="+from+"-"+to);if(typeof Uint8Array!="undefined")xhr.responseType="arraybuffer";if(xhr.overrideMimeType){xhr.overrideMimeType("text/plain; charset=x-user-defined")}xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))throw new Error("Couldn't load "+url+". Status: "+xhr.status);if(xhr.response!==undefined){return new Uint8Array(xhr.response||[])}else{return intArrayFromString(xhr.responseText||"",true)}});var lazyArray=this;lazyArray.setDataGetter((function(chunkNum){var start=chunkNum*chunkSize;var end=(chunkNum+1)*chunkSize-1;end=Math.min(end,datalength-1);if(typeof lazyArray.chunks[chunkNum]==="undefined"){lazyArray.chunks[chunkNum]=doXHR(start,end)}if(typeof lazyArray.chunks[chunkNum]==="undefined")throw new Error("doXHR failed!");return lazyArray.chunks[chunkNum]}));this._length=datalength;this._chunkSize=chunkSize;this.lengthKnown=true};if(typeof XMLHttpRequest!=="undefined"){if(!ENVIRONMENT_IS_WORKER)throw"Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";var lazyArray=new LazyUint8Array;Object.defineProperty(lazyArray,"length",{get:(function(){if(!this.lengthKnown){this.cacheLength()}return this._length})});Object.defineProperty(lazyArray,"chunkSize",{get:(function(){if(!this.lengthKnown){this.cacheLength()}return this._chunkSize})});var properties={isDevice:false,contents:lazyArray}}else{var properties={isDevice:false,url:url}}var node=FS.createFile(parent,name,properties,canRead,canWrite);if(properties.contents){node.contents=properties.contents}else if(properties.url){node.contents=null;node.url=properties.url}Object.defineProperty(node,"usedBytes",{get:(function(){return this.contents.length})});var stream_ops={};var keys=Object.keys(node.stream_ops);keys.forEach((function(key){var fn=node.stream_ops[key];stream_ops[key]=function forceLoadLazyFile(){if(!FS.forceLoadFile(node)){throw new FS.ErrnoError(ERRNO_CODES.EIO)}return fn.apply(null,arguments)}}));stream_ops.read=function stream_ops_read(stream,buffer,offset,length,position){if(!FS.forceLoadFile(node)){throw new FS.ErrnoError(ERRNO_CODES.EIO)}var contents=stream.node.contents;if(position>=contents.length)return 0;var size=Math.min(contents.length-position,length);assert(size>=0);if(contents.slice){for(var i=0;i<size;i++){buffer[offset+i]=contents[position+i]}}else{for(var i=0;i<size;i++){buffer[offset+i]=contents.get(position+i)}}return size};node.stream_ops=stream_ops;return node}),createPreloadedFile:(function(parent,name,url,canRead,canWrite,onload,onerror,dontCreateFile,canOwn,preFinish){Browser.init();var fullname=name?PATH.resolve(PATH.join2(parent,name)):parent;var dep=getUniqueRunDependency("cp "+fullname);function processData(byteArray){function finish(byteArray){if(preFinish)preFinish();if(!dontCreateFile){FS.createDataFile(parent,name,byteArray,canRead,canWrite,canOwn)}if(onload)onload();removeRunDependency(dep)}var handled=false;Module["preloadPlugins"].forEach((function(plugin){if(handled)return;if(plugin["canHandle"](fullname)){plugin["handle"](byteArray,fullname,finish,(function(){if(onerror)onerror();removeRunDependency(dep)}));handled=true}}));if(!handled)finish(byteArray)}addRunDependency(dep);if(typeof url=="string"){Browser.asyncLoad(url,(function(byteArray){processData(byteArray)}),onerror)}else{processData(url)}}),indexedDB:(function(){return window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB}),DB_NAME:(function(){return"EM_FS_"+window.location.pathname}),DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:(function(paths,onload,onerror){onload=onload||(function(){});onerror=onerror||(function(){});var indexedDB=FS.indexedDB();try{var openRequest=indexedDB.open(FS.DB_NAME(),FS.DB_VERSION)}catch(e){return onerror(e)}openRequest.onupgradeneeded=function openRequest_onupgradeneeded(){console.log("creating db");var db=openRequest.result;db.createObjectStore(FS.DB_STORE_NAME)};openRequest.onsuccess=function openRequest_onsuccess(){var db=openRequest.result;var transaction=db.transaction([FS.DB_STORE_NAME],"readwrite");var files=transaction.objectStore(FS.DB_STORE_NAME);var ok=0,fail=0,total=paths.length;function finish(){if(fail==0)onload();else onerror()}paths.forEach((function(path){var putRequest=files.put(FS.analyzePath(path).object.contents,path);putRequest.onsuccess=function putRequest_onsuccess(){ok++;if(ok+fail==total)finish()};putRequest.onerror=function putRequest_onerror(){fail++;if(ok+fail==total)finish()}}));transaction.onerror=onerror};openRequest.onerror=onerror}),loadFilesFromDB:(function(paths,onload,onerror){onload=onload||(function(){});onerror=onerror||(function(){});var indexedDB=FS.indexedDB();try{var openRequest=indexedDB.open(FS.DB_NAME(),FS.DB_VERSION)}catch(e){return onerror(e)}openRequest.onupgradeneeded=onerror;openRequest.onsuccess=function openRequest_onsuccess(){var db=openRequest.result;try{var transaction=db.transaction([FS.DB_STORE_NAME],"readonly")}catch(e){onerror(e);return}var files=transaction.objectStore(FS.DB_STORE_NAME);var ok=0,fail=0,total=paths.length;function finish(){if(fail==0)onload();else onerror()}paths.forEach((function(path){var getRequest=files.get(path);getRequest.onsuccess=function getRequest_onsuccess(){if(FS.analyzePath(path).exists){FS.unlink(path)}FS.createDataFile(PATH.dirname(path),PATH.basename(path),getRequest.result,true,true,true);ok++;if(ok+fail==total)finish()};getRequest.onerror=function getRequest_onerror(){fail++;if(ok+fail==total)finish()}}));transaction.onerror=onerror};openRequest.onerror=onerror})};var PATH={splitPath:(function(filename){var splitPathRe=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;return splitPathRe.exec(filename).slice(1)}),normalizeArray:(function(parts,allowAboveRoot){var up=0;for(var i=parts.length-1;i>=0;i--){var last=parts[i];if(last==="."){parts.splice(i,1)}else if(last===".."){parts.splice(i,1);up++}else if(up){parts.splice(i,1);up--}}if(allowAboveRoot){for(;up--;up){parts.unshift("..")}}return parts}),normalize:(function(path){var isAbsolute=path.charAt(0)==="/",trailingSlash=path.substr(-1)==="/";path=PATH.normalizeArray(path.split("/").filter((function(p){return!!p})),!isAbsolute).join("/");if(!path&&!isAbsolute){path="."}if(path&&trailingSlash){path+="/"}return(isAbsolute?"/":"")+path}),dirname:(function(path){var result=PATH.splitPath(path),root=result[0],dir=result[1];if(!root&&!dir){return"."}if(dir){dir=dir.substr(0,dir.length-1)}return root+dir}),basename:(function(path){if(path==="/")return"/";var lastSlash=path.lastIndexOf("/");if(lastSlash===-1)return path;return path.substr(lastSlash+1)}),extname:(function(path){return PATH.splitPath(path)[3]}),join:(function(){var paths=Array.prototype.slice.call(arguments,0);return PATH.normalize(paths.join("/"))}),join2:(function(l,r){return PATH.normalize(l+"/"+r)}),resolve:(function(){var resolvedPath="",resolvedAbsolute=false;for(var i=arguments.length-1;i>=-1&&!resolvedAbsolute;i--){var path=i>=0?arguments[i]:FS.cwd();if(typeof path!=="string"){throw new TypeError("Arguments to path.resolve must be strings")}else if(!path){return""}resolvedPath=path+"/"+resolvedPath;resolvedAbsolute=path.charAt(0)==="/"}resolvedPath=PATH.normalizeArray(resolvedPath.split("/").filter((function(p){return!!p})),!resolvedAbsolute).join("/");return(resolvedAbsolute?"/":"")+resolvedPath||"."}),relative:(function(from,to){from=PATH.resolve(from).substr(1);to=PATH.resolve(to).substr(1);function trim(arr){var start=0;for(;start<arr.length;start++){if(arr[start]!=="")break}var end=arr.length-1;for(;end>=0;end--){if(arr[end]!=="")break}if(start>end)return[];return arr.slice(start,end-start+1)}var fromParts=trim(from.split("/"));var toParts=trim(to.split("/"));var length=Math.min(fromParts.length,toParts.length);var samePartsLength=length;for(var i=0;i<length;i++){if(fromParts[i]!==toParts[i]){samePartsLength=i;break}}var outputParts=[];for(var i=samePartsLength;i<fromParts.length;i++){outputParts.push("..")}outputParts=outputParts.concat(toParts.slice(samePartsLength));return outputParts.join("/")})};function _emscripten_set_main_loop_timing(mode,value){Browser.mainLoop.timingMode=mode;Browser.mainLoop.timingValue=value;if(!Browser.mainLoop.func){return 1}if(mode==0){Browser.mainLoop.scheduler=function Browser_mainLoop_scheduler_setTimeout(){setTimeout(Browser.mainLoop.runner,value)};Browser.mainLoop.method="timeout"}else if(mode==1){Browser.mainLoop.scheduler=function Browser_mainLoop_scheduler_rAF(){Browser.requestAnimationFrame(Browser.mainLoop.runner)};Browser.mainLoop.method="rAF"}else if(mode==2){if(!window["setImmediate"]){var setImmediates=[];var emscriptenMainLoopMessageId="__emcc";function Browser_setImmediate_messageHandler(event){if(event.source===window&&event.data===emscriptenMainLoopMessageId){event.stopPropagation();setImmediates.shift()()}}window.addEventListener("message",Browser_setImmediate_messageHandler,true);window["setImmediate"]=function Browser_emulated_setImmediate(func){setImmediates.push(func);window.postMessage(emscriptenMainLoopMessageId,"*")}}Browser.mainLoop.scheduler=function Browser_mainLoop_scheduler_setImmediate(){window["setImmediate"](Browser.mainLoop.runner)};Browser.mainLoop.method="immediate"}return 0}function _emscripten_set_main_loop(func,fps,simulateInfiniteLoop,arg,noSetTiming){Module["noExitRuntime"]=true;assert(!Browser.mainLoop.func,"emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");Browser.mainLoop.func=func;Browser.mainLoop.arg=arg;var thisMainLoopId=Browser.mainLoop.currentlyRunningMainloop;Browser.mainLoop.runner=function Browser_mainLoop_runner(){if(ABORT)return;if(Browser.mainLoop.queue.length>0){var start=Date.now();var blocker=Browser.mainLoop.queue.shift();blocker.func(blocker.arg);if(Browser.mainLoop.remainingBlockers){var remaining=Browser.mainLoop.remainingBlockers;var next=remaining%1==0?remaining-1:Math.floor(remaining);if(blocker.counted){Browser.mainLoop.remainingBlockers=next}else{next=next+.5;Browser.mainLoop.remainingBlockers=(8*remaining+next)/9}}console.log('main loop blocker "'+blocker.name+'" took '+(Date.now()-start)+" ms");Browser.mainLoop.updateStatus();setTimeout(Browser.mainLoop.runner,0);return}if(thisMainLoopId<Browser.mainLoop.currentlyRunningMainloop)return;Browser.mainLoop.currentFrameNumber=Browser.mainLoop.currentFrameNumber+1|0;if(Browser.mainLoop.timingMode==1&&Browser.mainLoop.timingValue>1&&Browser.mainLoop.currentFrameNumber%Browser.mainLoop.timingValue!=0){Browser.mainLoop.scheduler();return}if(Browser.mainLoop.method==="timeout"&&Module.ctx){Module.printErr("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!");Browser.mainLoop.method=""}Browser.mainLoop.runIter((function(){if(typeof arg!=="undefined"){Runtime.dynCall("vi",func,[arg])}else{Runtime.dynCall("v",func)}}));if(thisMainLoopId<Browser.mainLoop.currentlyRunningMainloop)return;if(typeof SDL==="object"&&SDL.audio&&SDL.audio.queueNewAudioData)SDL.audio.queueNewAudioData();Browser.mainLoop.scheduler()};if(!noSetTiming){if(fps&&fps>0)_emscripten_set_main_loop_timing(0,1e3/fps);else _emscripten_set_main_loop_timing(1,1);Browser.mainLoop.scheduler()}if(simulateInfiniteLoop){throw"SimulateInfiniteLoop"}}var Browser={mainLoop:{scheduler:null,method:"",currentlyRunningMainloop:0,func:null,arg:0,timingMode:0,timingValue:0,currentFrameNumber:0,queue:[],pause:(function(){Browser.mainLoop.scheduler=null;Browser.mainLoop.currentlyRunningMainloop++}),resume:(function(){Browser.mainLoop.currentlyRunningMainloop++;var timingMode=Browser.mainLoop.timingMode;var timingValue=Browser.mainLoop.timingValue;var func=Browser.mainLoop.func;Browser.mainLoop.func=null;_emscripten_set_main_loop(func,0,false,Browser.mainLoop.arg,true);_emscripten_set_main_loop_timing(timingMode,timingValue);Browser.mainLoop.scheduler()}),updateStatus:(function(){if(Module["setStatus"]){var message=Module["statusMessage"]||"Please wait...";var remaining=Browser.mainLoop.remainingBlockers;var expected=Browser.mainLoop.expectedBlockers;if(remaining){if(remaining<expected){Module["setStatus"](message+" ("+(expected-remaining)+"/"+expected+")")}else{Module["setStatus"](message)}}else{Module["setStatus"]("")}}}),runIter:(function(func){if(ABORT)return;if(Module["preMainLoop"]){var preRet=Module["preMainLoop"]();if(preRet===false){return}}try{func()}catch(e){if(e instanceof ExitStatus){return}else{if(e&&typeof e==="object"&&e.stack)Module.printErr("exception thrown: "+[e,e.stack]);throw e}}if(Module["postMainLoop"])Module["postMainLoop"]()})},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:(function(){if(!Module["preloadPlugins"])Module["preloadPlugins"]=[];if(Browser.initted)return;Browser.initted=true;try{new Blob;Browser.hasBlobConstructor=true}catch(e){Browser.hasBlobConstructor=false;console.log("warning: no blob constructor, cannot create blobs with mimetypes")}Browser.BlobBuilder=typeof MozBlobBuilder!="undefined"?MozBlobBuilder:typeof WebKitBlobBuilder!="undefined"?WebKitBlobBuilder:!Browser.hasBlobConstructor?console.log("warning: no BlobBuilder"):null;Browser.URLObject=typeof window!="undefined"?window.URL?window.URL:window.webkitURL:undefined;if(!Module.noImageDecoding&&typeof Browser.URLObject==="undefined"){console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");Module.noImageDecoding=true}var imagePlugin={};imagePlugin["canHandle"]=function imagePlugin_canHandle(name){return!Module.noImageDecoding&&/\.(jpg|jpeg|png|bmp)$/i.test(name)};imagePlugin["handle"]=function imagePlugin_handle(byteArray,name,onload,onerror){var b=null;if(Browser.hasBlobConstructor){try{b=new Blob([byteArray],{type:Browser.getMimetype(name)});if(b.size!==byteArray.length){b=new Blob([(new Uint8Array(byteArray)).buffer],{type:Browser.getMimetype(name)})}}catch(e){Runtime.warnOnce("Blob constructor present but fails: "+e+"; falling back to blob builder")}}if(!b){var bb=new Browser.BlobBuilder;bb.append((new Uint8Array(byteArray)).buffer);b=bb.getBlob()}var url=Browser.URLObject.createObjectURL(b);var img=new Image;img.onload=function img_onload(){assert(img.complete,"Image "+name+" could not be decoded");var canvas=document.createElement("canvas");canvas.width=img.width;canvas.height=img.height;var ctx=canvas.getContext("2d");ctx.drawImage(img,0,0);Module["preloadedImages"][name]=canvas;Browser.URLObject.revokeObjectURL(url);if(onload)onload(byteArray)};img.onerror=function img_onerror(event){console.log("Image "+url+" could not be decoded");if(onerror)onerror()};img.src=url};Module["preloadPlugins"].push(imagePlugin);var audioPlugin={};audioPlugin["canHandle"]=function audioPlugin_canHandle(name){return!Module.noAudioDecoding&&name.substr(-4)in{".ogg":1,".wav":1,".mp3":1}};audioPlugin["handle"]=function audioPlugin_handle(byteArray,name,onload,onerror){var done=false;function finish(audio){if(done)return;done=true;Module["preloadedAudios"][name]=audio;if(onload)onload(byteArray)}function fail(){if(done)return;done=true;Module["preloadedAudios"][name]=new Audio;if(onerror)onerror()}if(Browser.hasBlobConstructor){try{var b=new Blob([byteArray],{type:Browser.getMimetype(name)})}catch(e){return fail()}var url=Browser.URLObject.createObjectURL(b);var audio=new Audio;audio.addEventListener("canplaythrough",(function(){finish(audio)}),false);audio.onerror=function audio_onerror(event){if(done)return;console.log("warning: browser could not fully decode audio "+name+", trying slower base64 approach");function encode64(data){var BASE="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var PAD="=";var ret="";var leftchar=0;var leftbits=0;for(var i=0;i<data.length;i++){leftchar=leftchar<<8|data[i];leftbits+=8;while(leftbits>=6){var curr=leftchar>>leftbits-6&63;leftbits-=6;ret+=BASE[curr]}}if(leftbits==2){ret+=BASE[(leftchar&3)<<4];ret+=PAD+PAD}else if(leftbits==4){ret+=BASE[(leftchar&15)<<2];ret+=PAD}return ret}audio.src="data:audio/x-"+name.substr(-3)+";base64,"+encode64(byteArray);finish(audio)};audio.src=url;Browser.safeSetTimeout((function(){finish(audio)}),1e4)}else{return fail()}};Module["preloadPlugins"].push(audioPlugin);var canvas=Module["canvas"];function pointerLockChange(){Browser.pointerLock=document["pointerLockElement"]===canvas||document["mozPointerLockElement"]===canvas||document["webkitPointerLockElement"]===canvas||document["msPointerLockElement"]===canvas}if(canvas){canvas.requestPointerLock=canvas["requestPointerLock"]||canvas["mozRequestPointerLock"]||canvas["webkitRequestPointerLock"]||canvas["msRequestPointerLock"]||(function(){});canvas.exitPointerLock=document["exitPointerLock"]||document["mozExitPointerLock"]||document["webkitExitPointerLock"]||document["msExitPointerLock"]||(function(){});canvas.exitPointerLock=canvas.exitPointerLock.bind(document);document.addEventListener("pointerlockchange",pointerLockChange,false);document.addEventListener("mozpointerlockchange",pointerLockChange,false);document.addEventListener("webkitpointerlockchange",pointerLockChange,false);document.addEventListener("mspointerlockchange",pointerLockChange,false);if(Module["elementPointerLock"]){canvas.addEventListener("click",(function(ev){if(!Browser.pointerLock&&canvas.requestPointerLock){canvas.requestPointerLock();ev.preventDefault()}}),false)}}}),createContext:(function(canvas,useWebGL,setInModule,webGLContextAttributes){if(useWebGL&&Module.ctx&&canvas==Module.canvas)return Module.ctx;var ctx;var contextHandle;if(useWebGL){var contextAttributes={antialias:false,alpha:false};if(webGLContextAttributes){for(var attribute in webGLContextAttributes){contextAttributes[attribute]=webGLContextAttributes[attribute]}}contextHandle=GL.createContext(canvas,contextAttributes);if(contextHandle){ctx=GL.getContext(contextHandle).GLctx}canvas.style.backgroundColor="black"}else{ctx=canvas.getContext("2d")}if(!ctx)return null;if(setInModule){if(!useWebGL)assert(typeof GLctx==="undefined","cannot set in module if GLctx is used, but we are a non-GL context that would replace it");Module.ctx=ctx;if(useWebGL)GL.makeContextCurrent(contextHandle);Module.useWebGL=useWebGL;Browser.moduleContextCreatedCallbacks.forEach((function(callback){callback()}));Browser.init()}return ctx}),destroyContext:(function(canvas,useWebGL,setInModule){}),fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:(function(lockPointer,resizeCanvas,vrDevice){Browser.lockPointer=lockPointer;Browser.resizeCanvas=resizeCanvas;Browser.vrDevice=vrDevice;if(typeof Browser.lockPointer==="undefined")Browser.lockPointer=true;if(typeof Browser.resizeCanvas==="undefined")Browser.resizeCanvas=false;if(typeof Browser.vrDevice==="undefined")Browser.vrDevice=null;var canvas=Module["canvas"];function fullScreenChange(){Browser.isFullScreen=false;var canvasContainer=canvas.parentNode;if((document["webkitFullScreenElement"]||document["webkitFullscreenElement"]||document["mozFullScreenElement"]||document["mozFullscreenElement"]||document["fullScreenElement"]||document["fullscreenElement"]||document["msFullScreenElement"]||document["msFullscreenElement"]||document["webkitCurrentFullScreenElement"])===canvasContainer){canvas.cancelFullScreen=document["cancelFullScreen"]||document["mozCancelFullScreen"]||document["webkitCancelFullScreen"]||document["msExitFullscreen"]||document["exitFullscreen"]||(function(){});canvas.cancelFullScreen=canvas.cancelFullScreen.bind(document);if(Browser.lockPointer)canvas.requestPointerLock();Browser.isFullScreen=true;if(Browser.resizeCanvas)Browser.setFullScreenCanvasSize()}else{canvasContainer.parentNode.insertBefore(canvas,canvasContainer);canvasContainer.parentNode.removeChild(canvasContainer);if(Browser.resizeCanvas)Browser.setWindowedCanvasSize()}if(Module["onFullScreen"])Module["onFullScreen"](Browser.isFullScreen);Browser.updateCanvasDimensions(canvas)}if(!Browser.fullScreenHandlersInstalled){Browser.fullScreenHandlersInstalled=true;document.addEventListener("fullscreenchange",fullScreenChange,false);document.addEventListener("mozfullscreenchange",fullScreenChange,false);document.addEventListener("webkitfullscreenchange",fullScreenChange,false);document.addEventListener("MSFullscreenChange",fullScreenChange,false)}var canvasContainer=document.createElement("div");canvas.parentNode.insertBefore(canvasContainer,canvas);canvasContainer.appendChild(canvas);canvasContainer.requestFullScreen=canvasContainer["requestFullScreen"]||canvasContainer["mozRequestFullScreen"]||canvasContainer["msRequestFullscreen"]||(canvasContainer["webkitRequestFullScreen"]?(function(){canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"])}):null);if(vrDevice){canvasContainer.requestFullScreen({vrDisplay:vrDevice})}else{canvasContainer.requestFullScreen()}}),nextRAF:0,fakeRequestAnimationFrame:(function(func){var now=Date.now();if(Browser.nextRAF===0){Browser.nextRAF=now+1e3/60}else{while(now+2>=Browser.nextRAF){Browser.nextRAF+=1e3/60}}var delay=Math.max(Browser.nextRAF-now,0);setTimeout(func,delay)}),requestAnimationFrame:function requestAnimationFrame(func){if(typeof window==="undefined"){Browser.fakeRequestAnimationFrame(func)}else{if(!window.requestAnimationFrame){window.requestAnimationFrame=window["requestAnimationFrame"]||window["mozRequestAnimationFrame"]||window["webkitRequestAnimationFrame"]||window["msRequestAnimationFrame"]||window["oRequestAnimationFrame"]||Browser.fakeRequestAnimationFrame}window.requestAnimationFrame(func)}},safeCallback:(function(func){return(function(){if(!ABORT)return func.apply(null,arguments)})}),allowAsyncCallbacks:true,queuedAsyncCallbacks:[],pauseAsyncCallbacks:(function(){Browser.allowAsyncCallbacks=false}),resumeAsyncCallbacks:(function(){Browser.allowAsyncCallbacks=true;if(Browser.queuedAsyncCallbacks.length>0){var callbacks=Browser.queuedAsyncCallbacks;Browser.queuedAsyncCallbacks=[];callbacks.forEach((function(func){func()}))}}),safeRequestAnimationFrame:(function(func){return Browser.requestAnimationFrame((function(){if(ABORT)return;if(Browser.allowAsyncCallbacks){func()}else{Browser.queuedAsyncCallbacks.push(func)}}))}),safeSetTimeout:(function(func,timeout){Module["noExitRuntime"]=true;return setTimeout((function(){if(ABORT)return;if(Browser.allowAsyncCallbacks){func()}else{Browser.queuedAsyncCallbacks.push(func)}}),timeout)}),safeSetInterval:(function(func,timeout){Module["noExitRuntime"]=true;return setInterval((function(){if(ABORT)return;if(Browser.allowAsyncCallbacks){func()}}),timeout)}),getMimetype:(function(name){return{"jpg":"image/jpeg","jpeg":"image/jpeg","png":"image/png","bmp":"image/bmp","ogg":"audio/ogg","wav":"audio/wav","mp3":"audio/mpeg"}[name.substr(name.lastIndexOf(".")+1)]}),getUserMedia:(function(func){if(!window.getUserMedia){window.getUserMedia=navigator["getUserMedia"]||navigator["mozGetUserMedia"]}window.getUserMedia(func)}),getMovementX:(function(event){return event["movementX"]||event["mozMovementX"]||event["webkitMovementX"]||0}),getMovementY:(function(event){return event["movementY"]||event["mozMovementY"]||event["webkitMovementY"]||0}),getMouseWheelDelta:(function(event){var delta=0;switch(event.type){case"DOMMouseScroll":delta=event.detail;break;case"mousewheel":delta=event.wheelDelta;break;case"wheel":delta=event["deltaY"];break;default:throw"unrecognized mouse wheel event: "+event.type}return delta}),mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:(function(event){if(Browser.pointerLock){if(event.type!="mousemove"&&"mozMovementX"in event){Browser.mouseMovementX=Browser.mouseMovementY=0}else{Browser.mouseMovementX=Browser.getMovementX(event);Browser.mouseMovementY=Browser.getMovementY(event)}if(typeof SDL!="undefined"){Browser.mouseX=SDL.mouseX+Browser.mouseMovementX;Browser.mouseY=SDL.mouseY+Browser.mouseMovementY}else{Browser.mouseX+=Browser.mouseMovementX;Browser.mouseY+=Browser.mouseMovementY}}else{var rect=Module["canvas"].getBoundingClientRect();var cw=Module["canvas"].width;var ch=Module["canvas"].height;var scrollX=typeof window.scrollX!=="undefined"?window.scrollX:window.pageXOffset;var scrollY=typeof window.scrollY!=="undefined"?window.scrollY:window.pageYOffset;if(event.type==="touchstart"||event.type==="touchend"||event.type==="touchmove"){var touch=event.touch;if(touch===undefined){return}var adjustedX=touch.pageX-(scrollX+rect.left);var adjustedY=touch.pageY-(scrollY+rect.top);adjustedX=adjustedX*(cw/rect.width);adjustedY=adjustedY*(ch/rect.height);var coords={x:adjustedX,y:adjustedY};if(event.type==="touchstart"){Browser.lastTouches[touch.identifier]=coords;Browser.touches[touch.identifier]=coords}else if(event.type==="touchend"||event.type==="touchmove"){var last=Browser.touches[touch.identifier];if(!last)last=coords;Browser.lastTouches[touch.identifier]=last;Browser.touches[touch.identifier]=coords}return}var x=event.pageX-(scrollX+rect.left);var y=event.pageY-(scrollY+rect.top);x=x*(cw/rect.width);y=y*(ch/rect.height);Browser.mouseMovementX=x-Browser.mouseX;Browser.mouseMovementY=y-Browser.mouseY;Browser.mouseX=x;Browser.mouseY=y}}),xhrLoad:(function(url,onload,onerror){var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=function xhr_onload(){if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response)}else{onerror()}};xhr.onerror=onerror;xhr.send(null)}),asyncLoad:(function(url,onload,onerror,noRunDep){Browser.xhrLoad(url,(function(arrayBuffer){assert(arrayBuffer,'Loading data file "'+url+'" failed (no arrayBuffer).');onload(new Uint8Array(arrayBuffer));if(!noRunDep)removeRunDependency("al "+url)}),(function(event){if(onerror){onerror()}else{throw'Loading data file "'+url+'" failed.'}}));if(!noRunDep)addRunDependency("al "+url)}),resizeListeners:[],updateResizeListeners:(function(){var canvas=Module["canvas"];Browser.resizeListeners.forEach((function(listener){listener(canvas.width,canvas.height)}))}),setCanvasSize:(function(width,height,noUpdates){var canvas=Module["canvas"];Browser.updateCanvasDimensions(canvas,width,height);if(!noUpdates)Browser.updateResizeListeners()}),windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:(function(){if(typeof SDL!="undefined"){var flags=HEAPU32[SDL.screen+Runtime.QUANTUM_SIZE*0>>2];flags=flags|8388608;HEAP32[SDL.screen+Runtime.QUANTUM_SIZE*0>>2]=flags}Browser.updateResizeListeners()}),setWindowedCanvasSize:(function(){if(typeof SDL!="undefined"){var flags=HEAPU32[SDL.screen+Runtime.QUANTUM_SIZE*0>>2];flags=flags&~8388608;HEAP32[SDL.screen+Runtime.QUANTUM_SIZE*0>>2]=flags}Browser.updateResizeListeners()}),updateCanvasDimensions:(function(canvas,wNative,hNative){if(wNative&&hNative){canvas.widthNative=wNative;canvas.heightNative=hNative}else{wNative=canvas.widthNative;hNative=canvas.heightNative}var w=wNative;var h=hNative;if(Module["forcedAspectRatio"]&&Module["forcedAspectRatio"]>0){if(w/h<Module["forcedAspectRatio"]){w=Math.round(h*Module["forcedAspectRatio"])}else{h=Math.round(w/Module["forcedAspectRatio"])}}if((document["webkitFullScreenElement"]||document["webkitFullscreenElement"]||document["mozFullScreenElement"]||document["mozFullscreenElement"]||document["fullScreenElement"]||document["fullscreenElement"]||document["msFullScreenElement"]||document["msFullscreenElement"]||document["webkitCurrentFullScreenElement"])===canvas.parentNode&&typeof screen!="undefined"){var factor=Math.min(screen.width/w,screen.height/h);w=Math.round(w*factor);h=Math.round(h*factor)}if(Browser.resizeCanvas){if(canvas.width!=w)canvas.width=w;if(canvas.height!=h)canvas.height=h;if(typeof canvas.style!="undefined"){canvas.style.removeProperty("width");canvas.style.removeProperty("height")}}else{if(canvas.width!=wNative)canvas.width=wNative;if(canvas.height!=hNative)canvas.height=hNative;if(typeof canvas.style!="undefined"){if(w!=wNative||h!=hNative){canvas.style.setProperty("width",w+"px","important");canvas.style.setProperty("height",h+"px","important")}else{canvas.style.removeProperty("width");canvas.style.removeProperty("height")}}}}),wgetRequests:{},nextWgetRequestHandle:0,getNextWgetRequestHandle:(function(){var handle=Browser.nextWgetRequestHandle;Browser.nextWgetRequestHandle++;return handle})};var SYSCALLS={DEFAULT_POLLMASK:5,mappings:{},umask:511,calculateAt:(function(dirfd,path){if(path[0]!=="/"){var dir;if(dirfd===-100){dir=FS.cwd()}else{var dirstream=FS.getStream(dirfd);if(!dirstream)throw new FS.ErrnoError(ERRNO_CODES.EBADF);dir=dirstream.path}path=PATH.join2(dir,path)}return path}),doStat:(function(func,path,buf){try{var stat=func(path)}catch(e){if(e&&e.node&&PATH.normalize(path)!==PATH.normalize(FS.getPath(e.node))){return-ERRNO_CODES.ENOTDIR}throw e}HEAP32[buf>>2]=stat.dev;HEAP32[buf+4>>2]=0;HEAP32[buf+8>>2]=stat.ino;HEAP32[buf+12>>2]=stat.mode;HEAP32[buf+16>>2]=stat.nlink;HEAP32[buf+20>>2]=stat.uid;HEAP32[buf+24>>2]=stat.gid;HEAP32[buf+28>>2]=stat.rdev;HEAP32[buf+32>>2]=0;HEAP32[buf+36>>2]=stat.size;HEAP32[buf+40>>2]=4096;HEAP32[buf+44>>2]=stat.blocks;HEAP32[buf+48>>2]=stat.atime.getTime()/1e3|0;HEAP32[buf+52>>2]=0;HEAP32[buf+56>>2]=stat.mtime.getTime()/1e3|0;HEAP32[buf+60>>2]=0;HEAP32[buf+64>>2]=stat.ctime.getTime()/1e3|0;HEAP32[buf+68>>2]=0;HEAP32[buf+72>>2]=stat.ino;return 0}),doMsync:(function(addr,stream,len,flags){var buffer=new Uint8Array(HEAPU8.subarray(addr,addr+len));FS.msync(stream,buffer,0,len,flags)}),doMkdir:(function(path,mode){path=PATH.normalize(path);if(path[path.length-1]==="/")path=path.substr(0,path.length-1);FS.mkdir(path,mode,0);return 0}),doMknod:(function(path,mode,dev){switch(mode&61440){case 32768:case 8192:case 24576:case 4096:case 49152:break;default:return-ERRNO_CODES.EINVAL}FS.mknod(path,mode,dev);return 0}),doReadlink:(function(path,buf,bufsize){if(bufsize<=0)return-ERRNO_CODES.EINVAL;var ret=FS.readlink(path);ret=ret.slice(0,Math.max(0,bufsize));writeStringToMemory(ret,buf,true);return ret.length}),doAccess:(function(path,amode){if(amode&~7){return-ERRNO_CODES.EINVAL}var node;var lookup=FS.lookupPath(path,{follow:true});node=lookup.node;var perms="";if(amode&4)perms+="r";if(amode&2)perms+="w";if(amode&1)perms+="x";if(perms&&FS.nodePermissions(node,perms)){return-ERRNO_CODES.EACCES}return 0}),doDup:(function(path,flags,suggestFD){var suggest=FS.getStream(suggestFD);if(suggest)FS.close(suggest);return FS.open(path,flags,0,suggestFD,suggestFD).fd}),doReadv:(function(stream,iov,iovcnt,offset){var ret=0;for(var i=0;i<iovcnt;i++){var ptr=HEAP32[iov+i*8>>2];var len=HEAP32[iov+(i*8+4)>>2];var curr=FS.read(stream,HEAP8,ptr,len,offset);if(curr<0)return-1;ret+=curr;if(curr<len)break}return ret}),doWritev:(function(stream,iov,iovcnt,offset){var ret=0;for(var i=0;i<iovcnt;i++){var ptr=HEAP32[iov+i*8>>2];var len=HEAP32[iov+(i*8+4)>>2];var curr=FS.write(stream,HEAP8,ptr,len,offset);if(curr<0)return-1;ret+=curr}return ret}),varargs:0,get:(function(varargs){SYSCALLS.varargs+=4;var ret=HEAP32[SYSCALLS.varargs-4>>2];return ret}),getStr:(function(){var ret=Pointer_stringify(SYSCALLS.get());return ret}),getStreamFromFD:(function(){var stream=FS.getStream(SYSCALLS.get());if(!stream)throw new FS.ErrnoError(ERRNO_CODES.EBADF);return stream}),getSocketFromFD:(function(){var socket=SOCKFS.getSocket(SYSCALLS.get());if(!socket)throw new FS.ErrnoError(ERRNO_CODES.EBADF);return socket}),getSocketAddress:(function(allowNull){var addrp=SYSCALLS.get(),addrlen=SYSCALLS.get();if(allowNull&&addrp===0)return null;var info=__read_sockaddr(addrp,addrlen);if(info.errno)throw new FS.ErrnoError(info.errno);info.addr=DNS.lookup_addr(info.addr)||info.addr;return info}),get64:(function(){var low=SYSCALLS.get(),high=SYSCALLS.get();if(low>=0)assert(high===0);else assert(high===-1);return low}),getZero:(function(){assert(SYSCALLS.get()===0)})};function ___syscall6(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD();FS.close(stream);return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall54(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),op=SYSCALLS.get();switch(op){case 21505:{if(!stream.tty)return-ERRNO_CODES.ENOTTY;return 0};case 21506:{if(!stream.tty)return-ERRNO_CODES.ENOTTY;return 0};case 21519:{if(!stream.tty)return-ERRNO_CODES.ENOTTY;var argp=SYSCALLS.get();HEAP32[argp>>2]=0;return 0};case 21520:{if(!stream.tty)return-ERRNO_CODES.ENOTTY;return-ERRNO_CODES.EINVAL};case 21531:{var argp=SYSCALLS.get();return FS.ioctl(stream,op,argp)};default:abort("bad ioctl syscall "+op)}}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function _sysconf(name){switch(name){case 30:return PAGE_SIZE;case 85:return totalMemory/PAGE_SIZE;case 132:case 133:case 12:case 137:case 138:case 15:case 235:case 16:case 17:case 18:case 19:case 20:case 149:case 13:case 10:case 236:case 153:case 9:case 21:case 22:case 159:case 154:case 14:case 77:case 78:case 139:case 80:case 81:case 82:case 68:case 67:case 164:case 11:case 29:case 47:case 48:case 95:case 52:case 51:case 46:return 200809;case 79:return 0;case 27:case 246:case 127:case 128:case 23:case 24:case 160:case 161:case 181:case 182:case 242:case 183:case 184:case 243:case 244:case 245:case 165:case 178:case 179:case 49:case 50:case 168:case 169:case 175:case 170:case 171:case 172:case 97:case 76:case 32:case 173:case 35:return-1;case 176:case 177:case 7:case 155:case 8:case 157:case 125:case 126:case 92:case 93:case 129:case 130:case 131:case 94:case 91:return 1;case 74:case 60:case 69:case 70:case 4:return 1024;case 31:case 42:case 72:return 32;case 87:case 26:case 33:return 2147483647;case 34:case 1:return 47839;case 38:case 36:return 99;case 43:case 37:return 2048;case 0:return 2097152;case 3:return 65536;case 28:return 32768;case 44:return 32767;case 75:return 16384;case 39:return 1e3;case 89:return 700;case 71:return 256;case 40:return 255;case 2:return 100;case 180:return 64;case 25:return 20;case 5:return 16;case 6:return 6;case 73:return 4;case 84:{if(typeof navigator==="object")return navigator["hardwareConcurrency"]||1;return 1}}___setErrNo(ERRNO_CODES.EINVAL);return-1}Module["_bitshift64Lshr"]=_bitshift64Lshr;var _BDtoIHigh=true;function _pthread_cleanup_push(routine,arg){__ATEXIT__.push((function(){Runtime.dynCall("vi",routine,[arg])}));_pthread_cleanup_push.level=__ATEXIT__.length}function _pthread_cleanup_pop(){assert(_pthread_cleanup_push.level==__ATEXIT__.length,"cannot pop if something else added meanwhile!");__ATEXIT__.pop();_pthread_cleanup_push.level=__ATEXIT__.length}function ___syscall5(which,varargs){SYSCALLS.varargs=varargs;try{var pathname=SYSCALLS.getStr(),flags=SYSCALLS.get(),mode=SYSCALLS.get();var stream=FS.open(pathname,flags,mode);return stream.fd}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function _emscripten_memcpy_big(dest,src,num){HEAPU8.set(HEAPU8.subarray(src,src+num),dest);return dest}Module["_memcpy"]=_memcpy;var _log=Math_log;var _llvm_pow_f64=Math_pow;function _sbrk(bytes){var self=_sbrk;if(!self.called){DYNAMICTOP=alignMemoryPage(DYNAMICTOP);self.called=true;assert(Runtime.dynamicAlloc);self.alloc=Runtime.dynamicAlloc;Runtime.dynamicAlloc=(function(){abort("cannot dynamically allocate, sbrk now has control")})}var ret=DYNAMICTOP;if(bytes!=0){var success=self.alloc(bytes);if(!success)return-1>>>0}return ret}var _BItoD=true;var _sin=Math_sin;function _time(ptr){var ret=Date.now()/1e3|0;if(ptr){HEAP32[ptr>>2]=ret}return ret}function _pthread_self(){return 0}function ___syscall140(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),offset_high=SYSCALLS.get(),offset_low=SYSCALLS.get(),result=SYSCALLS.get(),whence=SYSCALLS.get();var offset=offset_low;assert(offset_high===0);FS.llseek(stream,offset,whence);HEAP32[result>>2]=stream.position;if(stream.getdents&&offset===0&&whence===0)stream.getdents=null;return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall146(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),iov=SYSCALLS.get(),iovcnt=SYSCALLS.get();return SYSCALLS.doWritev(stream,iov,iovcnt)}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall221(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),cmd=SYSCALLS.get();switch(cmd){case 0:{var arg=SYSCALLS.get();if(arg<0){return-ERRNO_CODES.EINVAL}var newStream;newStream=FS.open(stream.path,stream.flags,0,arg);return newStream.fd};case 1:case 2:return 0;case 3:return stream.flags;case 4:{var arg=SYSCALLS.get();stream.flags|=arg;return 0};case 12:case 12:{var arg=SYSCALLS.get();var offset=0;HEAP16[arg+offset>>1]=2;return 0};case 13:case 14:case 13:case 14:return 0;case 16:case 8:return-ERRNO_CODES.EINVAL;case 9:___setErrNo(ERRNO_CODES.EINVAL);return-1;default:{return-ERRNO_CODES.EINVAL}}}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall145(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),iov=SYSCALLS.get(),iovcnt=SYSCALLS.get();return SYSCALLS.doReadv(stream,iov,iovcnt)}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}Module["requestFullScreen"]=function Module_requestFullScreen(lockPointer,resizeCanvas,vrDevice){Browser.requestFullScreen(lockPointer,resizeCanvas,vrDevice)};Module["requestAnimationFrame"]=function Module_requestAnimationFrame(func){Browser.requestAnimationFrame(func)};Module["setCanvasSize"]=function Module_setCanvasSize(width,height,noUpdates){Browser.setCanvasSize(width,height,noUpdates)};Module["pauseMainLoop"]=function Module_pauseMainLoop(){Browser.mainLoop.pause()};Module["resumeMainLoop"]=function Module_resumeMainLoop(){Browser.mainLoop.resume()};Module["getUserMedia"]=function Module_getUserMedia(){Browser.getUserMedia()};Module["createContext"]=function Module_createContext(canvas,useWebGL,setInModule,webGLContextAttributes){return Browser.createContext(canvas,useWebGL,setInModule,webGLContextAttributes)};FS.staticInit();__ATINIT__.unshift((function(){if(!Module["noFSInit"]&&!FS.init.initialized)FS.init()}));__ATMAIN__.push((function(){FS.ignorePermissions=false}));__ATEXIT__.push((function(){FS.quit()}));Module["FS_createFolder"]=FS.createFolder;Module["FS_createPath"]=FS.createPath;Module["FS_createDataFile"]=FS.createDataFile;Module["FS_createPreloadedFile"]=FS.createPreloadedFile;Module["FS_createLazyFile"]=FS.createLazyFile;Module["FS_createLink"]=FS.createLink;Module["FS_createDevice"]=FS.createDevice;Module["FS_unlink"]=FS.unlink;__ATINIT__.unshift((function(){TTY.init()}));__ATEXIT__.push((function(){TTY.shutdown()}));if(ENVIRONMENT_IS_NODE){var fs=require("fs");var NODEJS_PATH=require("path");NODEFS.staticInit()}STACK_BASE=STACKTOP=Runtime.alignMemory(STATICTOP);staticSealed=true;STACK_MAX=STACK_BASE+TOTAL_STACK;DYNAMIC_BASE=DYNAMICTOP=Runtime.alignMemory(STACK_MAX);assert(DYNAMIC_BASE<TOTAL_MEMORY,"TOTAL_MEMORY not big enough for stack");var cttz_i8=allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0],"i8",ALLOC_DYNAMIC);function invoke_ii(index,a1){try{return Module["dynCall_ii"](index,a1)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_iiii(index,a1,a2,a3){try{return Module["dynCall_iiii"](index,a1,a2,a3)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_iii(index,a1,a2){try{return Module["dynCall_iii"](index,a1,a2)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_viii(index,a1,a2,a3){try{Module["dynCall_viii"](index,a1,a2,a3)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_vi(index,a1){try{Module["dynCall_vi"](index,a1)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}Module.asmGlobalArg={"Math":Math,"Int8Array":Int8Array,"Int16Array":Int16Array,"Int32Array":Int32Array,"Uint8Array":Uint8Array,"Uint16Array":Uint16Array,"Uint32Array":Uint32Array,"Float32Array":Float32Array,"Float64Array":Float64Array,"NaN":NaN,"Infinity":Infinity};Module.asmLibraryArg={"abort":abort,"assert":assert,"invoke_ii":invoke_ii,"invoke_iiii":invoke_iiii,"invoke_iii":invoke_iii,"invoke_viii":invoke_viii,"invoke_vi":invoke_vi,"_pthread_cleanup_pop":_pthread_cleanup_pop,"___syscall221":___syscall221,"_sin":_sin,"_llvm_pow_f64":_llvm_pow_f64,"___syscall54":___syscall54,"___syscall6":___syscall6,"___syscall5":___syscall5,"___assert_fail":___assert_fail,"_emscripten_set_main_loop_timing":_emscripten_set_main_loop_timing,"_sbrk":_sbrk,"_emscripten_memcpy_big":_emscripten_memcpy_big,"_sysconf":_sysconf,"___setErrNo":___setErrNo,"_pthread_self":_pthread_self,"_log":_log,"___unlock":___unlock,"_emscripten_set_main_loop":_emscripten_set_main_loop,"___lock":___lock,"_abort":_abort,"_pthread_cleanup_push":_pthread_cleanup_push,"_time":_time,"___syscall140":___syscall140,"___syscall145":___syscall145,"___syscall146":___syscall146,"STACKTOP":STACKTOP,"STACK_MAX":STACK_MAX,"tempDoublePtr":tempDoublePtr,"ABORT":ABORT,"cttz_i8":cttz_i8};// EMSCRIPTEN_START_ASM
	var asm=(function(global,env,buffer) {
	"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=0;var o=0;var p=0;var q=0;var r=global.NaN,s=global.Infinity;var t=0,u=0,v=0,w=0,x=0.0,y=0,z=0,A=0,B=0.0;var C=0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=global.Math.floor;var N=global.Math.abs;var O=global.Math.sqrt;var P=global.Math.pow;var Q=global.Math.cos;var R=global.Math.sin;var S=global.Math.tan;var T=global.Math.acos;var U=global.Math.asin;var V=global.Math.atan;var W=global.Math.atan2;var X=global.Math.exp;var Y=global.Math.log;var Z=global.Math.ceil;var _=global.Math.imul;var $=global.Math.min;var aa=global.Math.clz32;var ba=env.abort;var ca=env.assert;var da=env.invoke_ii;var ea=env.invoke_iiii;var fa=env.invoke_iii;var ga=env.invoke_viii;var ha=env.invoke_vi;var ia=env._pthread_cleanup_pop;var ja=env.___syscall221;var ka=env._sin;var la=env._llvm_pow_f64;var ma=env.___syscall54;var na=env.___syscall6;var oa=env.___syscall5;var pa=env.___assert_fail;var qa=env._emscripten_set_main_loop_timing;var ra=env._sbrk;var sa=env._emscripten_memcpy_big;var ta=env._sysconf;var ua=env.___setErrNo;var va=env._pthread_self;var wa=env._log;var xa=env.___unlock;var ya=env._emscripten_set_main_loop;var za=env.___lock;var Aa=env._abort;var Ba=env._pthread_cleanup_push;var Ca=env._time;var Da=env.___syscall140;var Ea=env.___syscall145;var Fa=env.___syscall146;var Ga=0.0;
	// EMSCRIPTEN_START_FUNCS
	function Ma(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+15&-16;return b|0}function Na(){return i|0}function Oa(a){a=a|0;i=a}function Pa(a,b){a=a|0;b=b|0;i=a;j=b}function Qa(a,b){a=a|0;b=b|0;if(!n){n=a;o=b}}function Ra(b){b=b|0;a[k>>0]=a[b>>0];a[k+1>>0]=a[b+1>>0];a[k+2>>0]=a[b+2>>0];a[k+3>>0]=a[b+3>>0]}function Sa(b){b=b|0;a[k>>0]=a[b>>0];a[k+1>>0]=a[b+1>>0];a[k+2>>0]=a[b+2>>0];a[k+3>>0]=a[b+3>>0];a[k+4>>0]=a[b+4>>0];a[k+5>>0]=a[b+5>>0];a[k+6>>0]=a[b+6>>0];a[k+7>>0]=a[b+7>>0]}function Ta(a){a=a|0;C=a}function Ua(){return C|0}function Va(b,f){b=b|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;if(!(c[f+288>>2]|0)){h=b+44|0;c[h>>2]=0;c[h+4>>2]=0;c[h+8>>2]=0;c[h+12>>2]=0;h=16}else{h=d[f+339>>0]|0;c[b+44>>2]=d[f+343>>0]<<1;c[b+48>>2]=d[f+344>>0]<<1;c[b+52>>2]=d[f+345>>0]<<1;c[b+56>>2]=d[f+346>>0]<<1;h=h+16|0}g=f+338|0;i=f+330|0;k=f+276|0;j=Xe(c[k>>2]|0,(e[i>>1]|0)+h+(d[f+337>>0]<<((a[g>>0]|0)==0?14:13))|0)|0;c[k>>2]=j;c[b>>2]=f;c[b+4>>2]=j+h;c[b+8>>2]=j+((e[i>>1]|0)+h);switch(c[f>>2]|0){case 2:{k=c[b+12>>2]|0;c[k+2016>>2]=1;j=f+324|0;j=c[j>>2]|0;k=k+2036|0;c[k>>2]=j;return 0}case 0:{if(!(a[g>>0]|0))g=c[f+308>>2]|0;else g=0;k=c[b+12>>2]|0;c[k+2016>>2]=g;j=f+324|0;j=c[j>>2]|0;k=k+2036|0;c[k>>2]=j;return 0}default:{k=c[b+12>>2]|0;c[k+2016>>2]=0;j=f+324|0;j=c[j>>2]|0;k=k+2036|0;c[k>>2]=j;return 0}}return 0}function Wa(b,f,g){b=b|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;h=c[b>>2]|0;if(!h)return;p=b+188|0;c[p>>2]=g;r=b+192|0;if(!(c[r>>2]|0))c[r>>2]=(c[h+320>>2]|0)!=0?50:60;q=b+12|0;ic(c[q>>2]|0,c[h+308>>2]|0,e[h+328>>1]|0,e[h+330>>1]|0,c[b+4>>2]|0);g=c[b>>2]|0;jc(c[q>>2]|0,d[g+338>>0]|0,d[g+337>>0]|0,d[g+336>>0]|0,c[b+8>>2]|0);g=b+92|0;h=c[g>>2]|0;i=c[q>>2]|0;if((((i|0)!=0?(ec(i,h),c[g>>2]=h,j=c[q>>2]|0,l=b+96|0,m=c[l>>2]|0,(j|0)!=0):0)?(fc(j,m),c[l>>2]=m,k=c[q>>2]|0,n=b+100|0,o=c[n>>2]|0,(k|0)!=0):0)?(gc(k,o),c[n>>2]=o,(c[q>>2]|0)!=0):0)g=c[q>>2]|0;else g=0;dc(g);h=c[q>>2]|0;g=c[p>>2]|0;if(!g){g=c[b>>2]|0;if(!(c[g+296>>2]|0))g=(c[g+312>>2]|0)==0?3579545:7159090;else g=7159090}else if(g>>>0<5)g=3579545<<g+-1;else g=3579545;p=c[b>>2]|0;hc(h,g,e[p+332>>1]|0,e[p+334>>1]|0,c[r>>2]|0,f,c[p+324>>2]|0);c[b+164>>2]=0;c[b+172>>2]=0;g=c[q>>2]|0;r=c[g+1996>>2]|0;f=c[b+16>>2]|0;c[b+28>>2]=(r>>>0)/(f>>>0)|0;c[b+32>>2]=(r>>>0)%(f>>>0)|0;c[b+36>>2]=0;c[b+184>>2]=0;c[b+176>>2]=0;if((c[c[b>>2]>>2]|0)==1)cc(g,68,4);g=1091656;h=g+128|0;do{a[g>>0]=0;g=g+1|0}while((g|0)<(h|0));return}function Xa(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0.0;if(!(c[1058]|0)){f=-256;do{e=~~(+$d(+(f|0)*.03125)*4096.0);if((f|0)>-1)c[4232+(f<<2)>>2]=e;else c[4232+(f+512<<2)>>2]=e;f=f+1|0}while((f|0)!=256)}if(b>>>0>2|(d|0)!=16){a=0;return a|0}e=Ue(204)|0;if(!e){a=0;return a|0}af(e|0,0,204)|0;f=$b(a)|0;c[e+12>>2]=f;if(!f){Ve(e);a=0;return a|0}else{c[e+16>>2]=a;c[e+20>>2]=b;c[e+24>>2]=16;c[e+180>>2]=5e3;g=+(a>>>0);a=jb()|0;c[e+108>>2]=a;kb(a);a=jb()|0;c[e+112>>2]=a;kb(a);a=jb()|0;c[e+116>>2]=a;kb(a);a=jb()|0;c[e+120>>2]=a;kb(a);a=nb()|0;c[e+140>>2]=a;ob(a,g,4700.0,1.0e-08);a=fb()|0;c[e+148>>2]=a;ib(a,g);a=jb()|0;c[e+124>>2]=a;kb(a);a=jb()|0;c[e+128>>2]=a;kb(a);a=jb()|0;c[e+132>>2]=a;kb(a);a=jb()|0;c[e+136>>2]=a;kb(a);a=nb()|0;c[e+144>>2]=a;ob(a,g,4700.0,1.0e-08);a=fb()|0;c[e+152>>2]=a;ib(a,g);a=e;return a|0}return 0}function Ya(a,b,d){a=a|0;b=b|0;d=d|0;switch(b|0){case 0:{a=a+12|0;tc(c[(c[a>>2]|0)+2048>>2]|0,d);qd(c[(c[a>>2]|0)+2064>>2]|0,d);return}case 1:{Dc(c[(c[a+12>>2]|0)+2052>>2]|0,d);return}case 2:{Rc(c[(c[a+12>>2]|0)+2056>>2]|0,d);return}default:return}}function Za(a){a=a|0;if(!a)return;ac(c[a+12>>2]|0);mb(c[a+108>>2]|0);mb(c[a+112>>2]|0);mb(c[a+116>>2]|0);mb(c[a+120>>2]|0);qb(c[a+140>>2]|0);hb(c[a+148>>2]|0);mb(c[a+124>>2]|0);mb(c[a+128>>2]|0);mb(c[a+132>>2]|0);mb(c[a+136>>2]|0);qb(c[a+144>>2]|0);hb(c[a+152>>2]|0);Ve(a);return}function _a(a){a=a|0;return c[a+172>>2]|0}function $a(a,b){a=a|0;b=b|0;var d=0;d=a+164|0;if(!b){c[d>>2]=0;b=2;a=a+172|0;c[a>>2]=b;return}else{c[d>>2]=-2147483648;b=~~(2147483648.0/+((((_(c[a+16>>2]|0,b)|0)>>>0)/1e3|0)>>>0))>>>0;b=b>>>((c[a+20>>2]|0)+-1|0);c[a+168>>2]=(b|0)==0?1:b;b=1;a=a+172|0;c[a>>2]=b;return}}function ab(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0;W=i;i=i+16|0;V=W;if((c[a+20>>2]|0)==1){j=c[a+40>>2]|0;f=(c[a+44>>2]|0)+j|0;g=(c[a+48>>2]|0)+j|0;h=(c[a+52>>2]|0)+j|0;j=(c[a+56>>2]|0)+j|0;if(!e){d=a+184|0;V=c[d>>2]|0;V=V+e|0;c[d>>2]=V;d=a+12|0;d=c[d>>2]|0;d=d+712|0;d=c[d>>2]|0;V=V*1e3|0;e=a+16|0;e=c[e>>2]|0;e=(V>>>0)/(e>>>0)|0;Sb(d,e,3e4,1e3)|0;i=W;return}B=a+32|0;C=a+36|0;D=a+16|0;E=a+12|0;F=a+28|0;G=a+60|0;H=a+108|0;y=4232+(((f|0)>255?255:(f|0)<-256?256:f&511)<<2)|0;z=a+64|0;A=a+112|0;o=4232+(((g|0)>255?255:(g|0)<-256?256:g&511)<<2)|0;p=a+156|0;q=a+176|0;r=a+148|0;s=a+172|0;t=a+140|0;u=a+164|0;v=a+168|0;w=a+68|0;x=a+116|0;l=4232+(((h|0)>255?255:(h|0)<-256?256:h&511)<<2)|0;m=a+72|0;n=a+120|0;j=4232+(((j|0)>255?255:(j|0)<-256?256:j&511)<<2)|0;k=0;do{f=(c[C>>2]|0)+(c[B>>2]|0)|0;c[C>>2]=f;g=c[D>>2]|0;if(f>>>0<g>>>0)bc(c[E>>2]|0,c[F>>2]|0);else{c[C>>2]=f-g;bc(c[E>>2]|0,(c[F>>2]|0)+1|0)}f=c[a>>2]|0;if((c[f+312>>2]|0)!=0?(c[m>>2]|0)==0:0){g=c[n>>2]|0;g=lb(g,(cd(c[(c[E>>2]|0)+2060>>2]|0)|0)<<16>>16)|0;g=(_(c[j>>2]|0,g)|0)>>12;f=c[a>>2]|0}else g=0;if((c[f+296>>2]|0)!=0?(c[w>>2]|0)==0:0){f=c[x>>2]|0;f=lb(f,(Sc(c[(c[E>>2]|0)+2056>>2]|0)|0)<<16>>16)|0;f=((_(c[l>>2]|0,f)|0)>>12)+g|0}else f=g;do if(!(c[G>>2]|0)){g=c[H>>2]|0;h=c[E>>2]|0;if(!(c[(c[a>>2]|0)+304>>2]|0)){V=(Bc(c[h+2048>>2]|0)|0)<<16>>16;V=lb(g,(c[(c[E>>2]|0)+2040>>2]|0)+V|0)|0;f=((_(c[y>>2]|0,V)|0)>>12)+f|0;break}else{V=lb(g,(vd(c[h+2064>>2]|0)|0)<<16>>16)|0;f=((_(c[y>>2]|0,V)|0)>>12)+f|0;break}}while(0);if(!(c[z>>2]|0)){U=c[A>>2]|0;V=(Hc(c[(c[E>>2]|0)+2052>>2]|0)|0)<<16>>16;V=lb(U,(c[(c[E>>2]|0)+2044>>2]|0)+V|0)|0;f=((_(c[o>>2]|0,V)|0)>>12)+f|0}if((c[p>>2]|0)==(f|0))g=(c[q>>2]|0)+1|0;else{c[p>>2]=f;g=0}c[q>>2]=g;f=gb(c[r>>2]|0,f)|0;a:do switch(c[s>>2]|0){case 1:{g=c[u>>2]|0;h=c[v>>2]|0;if(g>>>0>h>>>0){V=g-h|0;c[u>>2]=V;f=(_(V>>>23,f)|0)>>8;break a}else{c[u>>2]=0;c[s>>2]=2;f=0;break a}}case 2:{f=0;break}default:{}}while(0);f=pb(c[t>>2]|0,f)|0;if((f|0)>=-26214){if((f|0)>26214)f=(f+-26214>>2)+26214|0}else f=(f+26214>>2)+-26214|0;b[d+(k<<1)>>1]=(f|0)<-32767?-32767:(f|0)>32767?32767:f&65535;k=k+1|0}while((k|0)!=(e|0));d=a+184|0;V=c[d>>2]|0;V=V+e|0;c[d>>2]=V;d=a+12|0;d=c[d>>2]|0;d=d+712|0;d=c[d>>2]|0;V=V*1e3|0;e=a+16|0;e=c[e>>2]|0;e=(V>>>0)/(e>>>0)|0;Sb(d,e,3e4,1e3)|0;i=W;return}n=c[a+40>>2]|0;g=(c[a+44>>2]|0)+n|0;j=c[a+76>>2]|0;f=((j|0)<0?j:0)+g|0;g=((j|0)>0?0-j|0:0)+g|0;j=(c[a+48>>2]|0)+n|0;l=c[a+80>>2]|0;h=((l|0)<0?l:0)+j|0;j=((l|0)>0?0-l|0:0)+j|0;l=(c[a+52>>2]|0)+n|0;U=c[a+84>>2]|0;k=((U|0)<0?U:0)+l|0;l=((U|0)>0?0-U|0:0)+l|0;n=(c[a+56>>2]|0)+n|0;U=c[a+88>>2]|0;m=((U|0)<0?U:0)+n|0;n=((U|0)>0?0-U|0:0)+n|0;b:do if(e){O=a+32|0;P=a+36|0;Q=a+16|0;R=a+12|0;S=a+28|0;T=a+60|0;U=a+108|0;N=4232+(((f|0)>255?255:(f|0)<-256?256:f&511)<<2)|0;I=4232+(((g|0)>255?255:(g|0)<-256?256:g&511)<<2)|0;J=a+124|0;K=V+4|0;L=a+64|0;M=a+112|0;H=4232+(((h|0)>255?255:(h|0)<-256?256:h&511)<<2)|0;t=4232+(((j|0)>255?255:(j|0)<-256?256:j&511)<<2)|0;u=a+156|0;v=a+160|0;w=a+176|0;x=a+148|0;y=a+172|0;z=a+152|0;A=a+140|0;B=a+144|0;C=a+164|0;D=a+168|0;E=a+68|0;F=a+200|0;G=a+116|0;s=4232+(((k|0)>255?255:(k|0)<-256?256:k&511)<<2)|0;o=4232+(((l|0)>255?255:(l|0)<-256?256:l&511)<<2)|0;p=a+132|0;q=a+72|0;r=a+120|0;m=4232+(((m|0)>255?255:(m|0)<-256?256:m&511)<<2)|0;k=4232+(((n|0)>255?255:(n|0)<-256?256:n&511)<<2)|0;l=0;while(1){f=(c[P>>2]|0)+(c[O>>2]|0)|0;c[P>>2]=f;g=c[Q>>2]|0;if(f>>>0<g>>>0)bc(c[R>>2]|0,c[S>>2]|0);else{c[P>>2]=f-g;bc(c[R>>2]|0,(c[S>>2]|0)+1|0)}f=c[a>>2]|0;if((c[f+312>>2]|0)!=0?(c[q>>2]|0)==0:0){h=c[r>>2]|0;h=lb(h,(cd(c[(c[R>>2]|0)+2060>>2]|0)|0)<<16>>16)|0;g=(_(c[m>>2]|0,h)|0)>>12;h=(_(c[k>>2]|0,h)|0)>>12;f=c[a>>2]|0}else{g=0;h=0}do if((c[f+296>>2]|0)!=0?(c[E>>2]|0)==0:0)if(!(c[F>>2]|0)){n=c[G>>2]|0;n=lb(n,(Sc(c[(c[R>>2]|0)+2056>>2]|0)|0)<<16>>16)|0;g=((_(c[s>>2]|0,n)|0)>>12)+g|0;h=((_(c[o>>2]|0,n)|0)>>12)+h|0;break}else{Uc(c[(c[R>>2]|0)+2056>>2]|0,V);n=lb(c[G>>2]|0,c[V>>2]|0)|0;g=((_(c[s>>2]|0,n)|0)>>12)+g|0;n=lb(c[p>>2]|0,c[K>>2]|0)|0;h=((_(c[o>>2]|0,n)|0)>>12)+h|0;break}while(0);do if(!(c[T>>2]|0)){f=c[a>>2]|0;if(!(c[f+304>>2]|0)){n=c[U>>2]|0;f=(Bc(c[(c[R>>2]|0)+2048>>2]|0)|0)<<16>>16;f=lb(n,(c[(c[R>>2]|0)+2040>>2]|0)+f|0)|0;g=((_(c[N>>2]|0,f)|0)>>12)+g|0;f=((_(c[I>>2]|0,f)|0)>>12)+h|0;break}if(!(c[f+316>>2]|0)){f=c[U>>2]|0;f=lb(f,(vd(c[(c[R>>2]|0)+2064>>2]|0)|0)<<16>>16)|0;g=((_(c[N>>2]|0,f)|0)>>12)+g|0;f=((_(c[I>>2]|0,f)|0)>>12)+h|0;break}else{wd(c[(c[R>>2]|0)+2064>>2]|0,V);f=lb(c[U>>2]|0,c[V>>2]|0)|0;g=((_(c[N>>2]|0,f)|0)>>12)+g|0;f=lb(c[J>>2]|0,c[K>>2]|0)|0;f=((_(c[I>>2]|0,f)|0)>>12)+h|0;break}}else f=h;while(0);if(!(c[L>>2]|0)){j=c[M>>2]|0;n=(Hc(c[(c[R>>2]|0)+2052>>2]|0)|0)<<16>>16;n=lb(j,(c[(c[R>>2]|0)+2044>>2]|0)+n|0)|0;g=((_(c[H>>2]|0,n)|0)>>12)+g|0;f=((_(c[t>>2]|0,n)|0)>>12)+f|0}if((c[u>>2]|0)==(g|0)?(c[v>>2]|0)==(f|0):0)h=(c[w>>2]|0)+1|0;else{c[u>>2]=g;c[v>>2]=f;h=0}c[w>>2]=h;g=gb(c[x>>2]|0,g)|0;c:do switch(c[y>>2]|0){case 1:{h=c[C>>2]|0;j=c[D>>2]|0;if(h>>>0>j>>>0){n=h-j|0;c[C>>2]=n;g=(_(n>>>23,g)|0)>>8;break c}else{c[C>>2]=0;c[y>>2]=2;g=0;break c}}case 2:{g=0;break}default:{}}while(0);f=gb(c[z>>2]|0,f)|0;d:do switch(c[y>>2]|0){case 1:{h=c[C>>2]|0;j=c[D>>2]|0;if(h>>>0>j>>>0){h=h-j|0;c[C>>2]=h;h=(_(h>>>23,f)|0)>>8;break d}else{c[C>>2]=0;c[y>>2]=2;h=0;break d}}case 2:{h=0;break}default:h=f}while(0);f=pb(c[A>>2]|0,g)|0;if((f|0)>=-26214){if((f|0)>26214)f=(f+-26214>>2)+26214|0}else f=(f+26214>>2)+-26214|0;g=l<<1;b[d+(g<<1)>>1]=(f|0)<-32767?-32767:(f|0)>32767?32767:f&65535;f=pb(c[B>>2]|0,h)|0;if((f|0)>=-26214){if((f|0)>26214)f=(f+-26214>>2)+26214|0}else f=(f+26214>>2)+-26214|0;b[d+((g|1)<<1)>>1]=(f|0)<-32767?-32767:(f|0)>32767?32767:f&65535;l=l+1|0;if((l|0)==(e|0))break b}}while(0);d=a+184|0;V=c[d>>2]|0;V=V+e|0;c[d>>2]=V;d=a+12|0;d=c[d>>2]|0;d=d+712|0;d=c[d>>2]|0;V=V*1e3|0;e=a+16|0;e=c[e>>2]|0;e=(V>>>0)/(e>>>0)|0;Sb(d,e,3e4,1e3)|0;i=W;return}function bb(a){a=a|0;var b=0;b=c[a+12>>2]|0;if(!(c[c[a>>2]>>2]|0)){a=Rb(c[b+712>>2]|0,(((c[a+184>>2]|0)*1e3|0)>>>0)/((c[a+16>>2]|0)>>>0)|0)|0;return a|0}else{a=d[b+782>>0]|0;return a|0}return 0}function cb(a){a=a|0;var b=0;b=c[a+180>>2]|0;if((b|0)!=0?((((c[a+176>>2]|0)*1e3|0)>>>0)/((c[a+16>>2]|0)>>>0)|0)>>>0>b>>>0:0){b=1;return b|0}b=d[(c[a+12>>2]|0)+781>>0]|0;return b|0}function db(a,b){a=a|0;b=b|0;c[a+180>>2]=b;return}function eb(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0;j=i;i=i+128|0;h=j;e=h;f=e+128|0;do{a[e>>0]=0;e=e+1|0}while((e|0)<(f|0));g=(d[b+784>>0]|0)<<8|(d[b+783>>0]|0);if(!g){i=j;return 0}f=b+708|0;e=0;do{b=Xb(c[f>>2]|0,e+g|0)|0;a[h+e>>0]=b;if(!(b&255))break;e=e+1|0}while((e|0)<127);a[h+e>>0]=0;f=0;do{e=a[h+f>>0]|0;if(!(e<<24>>24)){k=7;break}switch(e<<24>>24|0){case 2:{f=f+1|0;e=((d[h+f>>0]|0)%80|0)&255;c[1570]=e;break}case 3:{f=f+1|0;b=(d[h+f>>0]|0)%80|0;e=b&255;c[1570]=e;if(b<<24>>24)af(1091656,32,(e>>>0>1?e:1)|0)|0;break}case 1:{c[1570]=0;e=0;break}default:{g=c[1570]|0;b=g+1|0;c[1570]=b;a[1091656+g>>0]=e;e=b}}f=f+1|0}while((f|0)<127);if((k|0)==7)e=c[1570]|0;a[1091656+e>>0]=0;a[1091736]=0;i=j;return 0}function fb(){return Ue(32)|0}function gb(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0;if(!(c[a>>2]|0)){a=b;return a|0}f=a+24|0;e=+(b|0);b=a+16|0;d=+h[a+8>>3]*(e+ +h[f>>3]-+h[b>>3]);h[f>>3]=d;h[b>>3]=e;a=~~d;return a|0}function hb(a){a=a|0;Ve(a);return}function ib(a,b){a=a|0;b=+b;h[a+8>>3]=1.0/(1.0/b/.047+1.0);a=a+16|0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;c[a+12>>2]=0;return}function jb(){var a=0;a=Ue(800)|0;if(!a)return a|0;af(a+520|0,0,260)|0;c[a+792>>2]=0;return a|0}function kb(a){a=a|0;af(a+520|0,0,260)|0;c[a+792>>2]=0;return}function lb(a,b){a=a|0;b=b|0;var d=0.0,e=0,f=0,g=0;f=c[a+792>>2]|0;if(!f){a=b;return a|0}e=f<<1;if(e)do{g=e;e=e+-1|0;c[a+520+(g<<2)>>2]=c[a+520+(e<<2)>>2]}while((e|0)!=0);c[a+520>>2]=b;e=1;d=+h[a>>3]*+(c[a+520+(f<<2)>>2]|0);do{d=d+ +h[a+(e<<3)>>3]*+((c[a+520+(f-e<<2)>>2]|0)+(c[a+520+(e+f<<2)>>2]|0)|0);e=e+1|0}while(f>>>0>=e>>>0);g=~~d;return g|0}function mb(a){a=a|0;if(!a)return;Ve(a);return}function nb(){return Ue(24)|0}function ob(a,b,d,e){a=a|0;b=+b;d=+d;e=+e;h[a+16>>3]=1.0/d/e/b;h[a+8>>3]=0.0;c[a>>2]=1;return}function pb(a,b){a=a|0;b=b|0;var d=0.0,e=0;if(!(c[a>>2]|0))return b|0;e=a+8|0;d=+h[e>>3];d=d+ +h[a+16>>3]*(+(b|0)-d);h[e>>3]=d;b=~~d;return b|0}function qb(a){a=a|0;Ve(a);return}function rb(b,d){b=b|0;d=d|0;var e=0,f=0;e=Ue(356)|0;if(!e){d=0;return d|0}af(e|0,0,356)|0;f=Ue(d)|0;c[e+276>>2]=f;if(!f){Ve(e);d=0;return d|0}else{ef(f|0,b|0,d|0)|0;c[e+280>>2]=d;a[e+268>>0]=0;c[e+284>>2]=0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;a[e+12>>0]=0;d=e;return d|0}return 0}function sb(a){a=a|0;return a+12|0}function tb(a){a=a|0;if(!a)return;Ve(c[a+276>>2]|0);Ve(c[a+284>>2]|0);Ve(c[a+352>>2]|0);Ve(a);return}function ub(a,b,c){a=a|0;b=b|0;c=c|0;var d=0;do if(b>>>0>=4)if(!(Cb(a,b)|0))if(!(Gb(a,b)|0))if(!(Fb(a,b)|0))if((Ke(1091912,a,4)|0)!=0?(Ke(1091917,a,4)|0)!=0:0)if(!(Kb(a,b)|0))if(!(qc(a,b)|0)){if((c|0)!=0?(d=Le(c,46)|0,(d|0)!=0):0){if(!(He(d,1091922)|0)){d=2;break}if(!(He(d,1091927)|0)){d=2;break}}d=8}else d=5;else d=6;else d=0;else d=4;else d=3;else d=1;else d=0;while(0);return d|0}function vb(b,c,d,e,f){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;a[b>>0]=75;a[b+1>>0]=83;a[b+2>>0]=83;a[b+3>>0]=88;a[b+4>>0]=c;a[b+5>>0]=(c&65535)>>>8;a[b+6>>0]=d;a[b+7>>0]=(d&65535)>>>8;a[b+8>>0]=e;a[b+9>>0]=(e&65535)>>>8;a[b+10>>0]=f;a[b+11>>0]=(f&65535)>>>8;a[b+12>>0]=0;a[b+13>>0]=0;a[b+14>>0]=16;a[b+15>>0]=5;f=b+28|0;a[f>>0]=0;a[f+1>>0]=0;a[f+2>>0]=0;a[f+3>>0]=0;return}function wb(f,g,h){f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if(!f){r=0;return r|0}i=ub(f,g,h)|0;a:do switch(i|0){case 2:{h=Ab(f,g)|0;if(!h){r=0;return r|0}else{Bb(h,f,g);break a}}case 1:{h=Eb(f,g)|0;if(!h){r=0;return r|0}else{Db(h,f,g);break a}}case 5:{h=sc(f,g)|0;if(!h){r=0;return r|0}else{rc(h,f,g);break a}}case 4:{h=Jb(f,g)|0;if(!h){r=0;return r|0}else{Hb(h,f,g);break a}}case 3:{h=Ib(f,g)|0;if(!h){r=0;return r|0}else{Hb(h,f,g);break a}}case 6:{h=Mb(f,g)|0;if(!h){r=0;return r|0}else{Lb(h,f,g);break a}}case 0:{h=yb(f,g)|0;if(!h){r=0;return r|0}else{xb(h,f,g);break a}}default:{r=0;return r|0}}while(0);c[h>>2]=i;j=h+12|0;b:while(1){i=a[j>>0]|0;switch(i<<24>>24){case 0:break b;case -127:{f=j+1|0;g=a[f>>0]|0;if((g+81&255)<10){a[j>>0]=-121;a[f>>0]=(g&255)+165;j=j+2|0;continue b}break}default:{}}q=i&255;if((q+-129|0)>>>0<31|(q+-224|0)>>>0<29){j=j+2|0;continue}else{j=j+1|0;continue}}q=h+276|0;m=c[q>>2]|0;if(!(Ke(1091912,m,4)|0)){c[h+288>>2]=0;b[h+328>>1]=d[m+5>>0]<<8|d[m+4>>0];b[h+330>>1]=d[m+7>>0]<<8|d[m+6>>0];b[h+332>>1]=d[m+9>>0]<<8|d[m+8>>0];b[h+334>>1]=d[m+11>>0]<<8|d[m+10>>0];a[h+336>>0]=a[m+12>>0]|0;j=m+13|0;a[h+337>>0]=d[j>>0]&127;a[h+338>>0]=(d[j>>0]|0)>>>7;a[h+339>>0]=a[m+14>>0]|0;j=a[m+15>>0]|0;a[h+340>>0]=j;j=j&255;r=j&2;c[h+304>>2]=r;if(!r){c[h+324>>2]=(j&24|0)==16&1;f=j>>>3&1;c[h+312>>2]=f;i=0;f=(f|0)==0?0:j>>>4&1;g=j>>>2}else{i=1;f=j>>>2&1;g=j>>>3}r=j&1;c[h+296>>2]=r;c[h+300>>2]=r;c[h+316>>2]=f;c[h+308>>2]=g&1;c[h+320>>2]=j>>>6&1;c[h+292>>2]=i;a[h+341>>0]=0;a[h+342>>0]=-1;r=h+343|0;a[r>>0]=-2139062144;a[r+1>>0]=-2139062144>>8;a[r+2>>0]=-2139062144>>16;a[r+3>>0]=-2139062144>>24;r=h;return r|0}if(Ke(1091917,m,4)|0){r=h;return r|0}c[h+288>>2]=1;b[h+328>>1]=d[m+5>>0]<<8|d[m+4>>0];b[h+330>>1]=d[m+7>>0]<<8|d[m+6>>0];b[h+332>>1]=d[m+9>>0]<<8|d[m+8>>0];b[h+334>>1]=d[m+11>>0]<<8|d[m+10>>0];a[h+336>>0]=a[m+12>>0]|0;j=m+13|0;a[h+337>>0]=d[j>>0]&127;a[h+338>>0]=(d[j>>0]|0)>>>7;j=m+14|0;k=a[j>>0]|0;a[h+339>>0]=k;l=a[m+15>>0]|0;a[h+340>>0]=l;l=l&255;p=l&2;c[h+304>>2]=p;if(!p){c[h+324>>2]=(l&24|0)==16&1;i=l>>>3&1;c[h+312>>2]=i;i=(i|0)==0?0:l>>>4&1;f=0;g=l>>>2}else{i=l>>>2&1;f=1;g=l>>>3}p=l&1;c[h+296>>2]=p;c[h+300>>2]=p;c[h+316>>2]=i;c[h+308>>2]=g&1;c[h+320>>2]=l>>>6&1;c[h+292>>2]=f;if((d[j>>0]|0)<16){a[h+341>>0]=0;a[h+342>>0]=-1;r=h+343|0;a[r>>0]=-2139062144;a[r+1>>0]=-2139062144>>8;a[r+2>>0]=-2139062144>>16;a[r+3>>0]=-2139062144>>24;r=h;return r|0}a[h+341>>0]=a[m+24>>0]|0;a[h+342>>0]=a[m+26>>0]|0;a[h+343>>0]=a[m+28>>0]|0;a[h+344>>0]=a[m+29>>0]|0;a[h+345>>0]=a[m+30>>0]|0;a[h+346>>0]=a[m+31>>0]|0;p=d[m+18>>0]<<16|d[m+19>>0]<<24|d[m+17>>0]<<8|d[m+16>>0];k=(k&255)+16+p|0;if(!p){r=h;return r|0}p=h+280|0;g=c[p>>2]|0;if((k+25|0)>>>0>g>>>0){r=h;return r|0}if(Ce(m+k|0,1091932,4)|0){r=h;return r|0}i=d[m+(k+9)>>0]<<8|d[m+(k+8)>>0];f=i&65535;o=h+348|0;b[o>>1]=f;if(!i){r=h;return r|0}m=i*272|0;i=Ue(m)|0;n=h+352|0;c[n>>2]=i;af(i|0,0,m|0)|0;if(!(f<<16>>16)){r=h;return r|0}f=k+20|0;if(f>>>0>g>>>0){r=h;return r|0}j=g;g=k+16|0;m=0;while(1){l=c[q>>2]|0;c[i+(m*272|0)>>2]=d[l+g>>0];c[i+(m*272|0)+4>>2]=d[l+(g+1)>>0];c[i+(m*272|0)+264>>2]=d[l+f>>0]<<16|d[l+(g+5)>>0]<<24|d[l+(g+3)>>0]<<8|d[l+(g+2)>>0];c[i+(m*272|0)+268>>2]=d[l+(g+8)>>0]<<16|d[l+(g+9)>>0]<<24|d[l+(g+7)>>0]<<8|d[l+(g+6)>>0];l=j;f=g+10|0;k=0;while(1){j=f+1|0;if(f>>>0<l>>>0)g=a[(c[q>>2]|0)+f>>0]|0;else g=0;a[i+(m*272|0)+8+k>>0]=g;i=c[n>>2]|0;if(!(a[i+(m*272|0)+8+k>>0]|0)){g=j;break}g=k+1|0;if(g>>>0>=255){r=50;break}l=c[p>>2]|0;f=j;k=g}if((r|0)==50){r=0;if(g>>>0>255){r=51;break}else g=j}m=m+1|0;if(m>>>0>=(e[o>>1]|0)>>>0){r=51;break}j=c[p>>2]|0;f=f+5|0;if(f>>>0>j>>>0){r=51;break}}if((r|0)==51)return h|0;return 0}function xb(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0;if(f>>>0<16)return;h=(d[e+14>>0]|0)+16|0;zb(b,e+h|0,f-h|0);h=b+12|0;g=a[h>>0]|0;if(f>>>0>8201&g<<24>>24==0){zb(b,e+8201|0,f+-8201|0);g=a[h>>0]|0}if(!(g<<24>>24))zb(b,e,f);a[b+268>>0]=a[e>>0]|0;a[b+269>>0]=a[e+1>>0]|0;a[b+270>>0]=a[e+2>>0]|0;a[b+271>>0]=a[e+3>>0]|0;a[b+272>>0]=0;c[b+8>>2]=0;c[b+4>>2]=0;c[b>>2]=0;return}function yb(a,b){a=a|0;b=b|0;if(b>>>0<16)a=0;else a=rb(a,b)|0;return a|0}function zb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if(!b)return;f=ub(d,e,0)|0;c[b>>2]=f;switch(f|0){case 1:{Db(b,d,e);return}case 3:case 4:{Hb(b,d,e);return}case 5:{rc(b,d,e);return}case 6:{Lb(b,d,e);return}default:{if(e>>>0>256?(Ke(d,1091937,3)|0)==0:0){e=0;do{a[b+12+e>>0]=a[d+(e+16)>>0]|0;e=e+1|0}while((e|0)!=40);a[b+52>>0]=0;return}a[b+12>>0]=0;return}}}function Ab(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;if(!(c[1573]|0)){d=0;return d|0}c[1572]=0;e=te(1091944,1091941)|0;if(!e){c[1572]=0;e=te(1092456,1091941)|0;if(!e){c[1572]=0;e=te(1092968,1091941)|0;if(!e){c[1572]=0;e=te(1093480,1091941)|0;if(!e)e=(c[1572]|0)!=0?-61:-55;else f=4}else f=4}else f=4}else f=4;if((f|0)==4){ue(1093992,1,32824,e)|0;re(e)|0;c[1572]=32824;e=-61}g=c[1574]|0;f=c[1575]|0;a[(c[1573]|0)+8>>0]=e;h=c[1571]|0;i=c[1572]|0;e=(i|0)!=0;j=h+512+(e?56:0)|0;a[1126822]=j;a[1126823]=j>>>8;a[1126828]=e?4:6;a[1126829]=e?3:1;switch(g|0){case 3:{a[1126831]=29;a[1126851]=50;e=93;break}case 1:{a[1126831]=5;a[1126851]=49;e=69;break}case 2:{a[1126831]=13;a[1126851]=50;e=77;break}default:{a[1126831]=12;a[1126851]=48;e=76}}if(!f)a[1126831]=e;e=1126864;g=e+48|0;do{a[e>>0]=0;e=e+1|0}while((e|0)<(g|0));e=1126864;f=b+207|0;g=e+40|0;do{a[e>>0]=a[f>>0]|0;e=e+1|0;f=f+1|0}while((e|0)<(g|0));e=Ue(d+544+h+i|0)|0;if(!e){j=0;return j|0}ef(e|0,1126816,544)|0;ef(e+544|0,c[1573]|0,h|0)|0;j=h+544|0;ef(e+j|0,1093992,i|0)|0;j=i+j|0;ef(e+j|0,b|0,d|0)|0;j=rb(e,j+d|0)|0;Ve(e);return j|0}function Bb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if(e>>>0<512)return;e=b+268|0;a[e>>0]=77;a[e+1>>0]=66;a[e+2>>0]=77;a[e+3>>0]=0;e=0;do{a[b+12+e>>0]=a[d+(e+207)>>0]|0;e=e+1|0}while((e|0)!=40);a[b+52>>0]=0;e=b+284|0;if(!(c[e>>2]|0)){h=Ue(64)|0;c[e>>2]=h;e=h;f=1127360;g=e+9|0;do{a[e>>0]=a[f>>0]|0;e=e+1|0;f=f+1|0}while((e|0)<(g|0));a[h+9>>0]=a[d+320>>0]|0;a[h+10>>0]=a[d+321>>0]|0;a[h+11>>0]=a[d+322>>0]|0;a[h+12>>0]=a[d+323>>0]|0;a[h+13>>0]=a[d+324>>0]|0;a[h+14>>0]=a[d+325>>0]|0;a[h+15>>0]=a[d+326>>0]|0;a[h+16>>0]=a[d+327>>0]|0;a[h+17>>0]=0;if(!(c[1572]|0)){e=h+(Je(h)|0)|0;f=1127370;g=e+21|0;do{a[e>>0]=a[f>>0]|0;e=e+1|0;f=f+1|0}while((e|0)<(g|0))}}c[b+8>>2]=0;c[b+4>>2]=0;return}function Cb(a,b){a=a|0;b=b|0;if(b>>>0>32?(Ke(a,1127391,3)|0)==0:0){b=1;return b|0}b=0;return b|0}function Db(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;a[b+268>>0]=a[d>>0]|0;a[b+269>>0]=a[d+1>>0]|0;a[b+270>>0]=a[d+2>>0]|0;a[b+271>>0]=a[d+3>>0]|0;a[b+272>>0]=a[d+4>>0]|0;a[b+273>>0]=a[d+5>>0]|0;a[b+274>>0]=0;e=0;while(1){f=a[d+(e+8)>>0]|0;if(f<<24>>24==13){f=4;break}a[b+12+e>>0]=f<<24>>24==9?32:f;e=e+1|0;if(e>>>0>=128){f=4;break}}if((f|0)==4){a[b+12+e>>0]=0;c[b+8>>2]=1;c[b+4>>2]=1;return}}function Eb(a,b){a=a|0;b=b|0;var d=0;if(!(c[1576]|0)){b=0;return b|0}d=Ue(32800)|0;if(!d){b=0;return b|0}vb(d,512,-32768,-32768,-32512);ef(d+32|0,a|0,b|0)|0;ef(d+24096|0,1127408,8192)|0;ef(d+32288|0,1135587,256)|0;ef(d+32544|0,1135843,256)|0;b=rb(d,32800)|0;Ve(d);return b|0}function Fb(b,d){b=b|0;d=d|0;var e=0,f=0;f=i;i=i+16|0;e=f;c[e>>2]=0;if(d>>>0<=5){e=0;i=f;return e|0}if(Ke(b,1136099,3)|0){e=0;i=f;return e|0}a[e>>0]=a[b+3>>0]|0;a[e+1>>0]=a[b+4>>0]|0;a[e+2>>0]=a[b+5>>0]|0;e=(Ae(e)|0)<104&1;i=f;return e|0}function Gb(b,d){b=b|0;d=d|0;var e=0,f=0;f=i;i=i+16|0;e=f;c[e>>2]=0;if(d>>>0<=5){e=0;i=f;return e|0}if(Ke(b,1136099,3)|0){e=0;i=f;return e|0}a[e>>0]=a[b+3>>0]|0;a[e+1>>0]=a[b+4>>0]|0;a[e+2>>0]=a[b+5>>0]|0;e=(Ae(e)|0)>103&1;i=f;return e|0}function Hb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;m=i;i=i+16|0;l=m;a[b+268>>0]=a[d>>0]|0;a[b+269>>0]=a[d+1>>0]|0;a[b+270>>0]=a[d+2>>0]|0;a[b+271>>0]=a[d+3>>0]|0;a[b+272>>0]=a[d+4>>0]|0;a[b+273>>0]=a[d+5>>0]|0;a[b+274>>0]=0;f=a[d+8>>0]|0;g=b+12|0;if(f<<24>>24!=13&e>>>0>8){h=0;while(1){a[g>>0]=f;j=h+1|0;k=h+9|0;f=a[d+k>>0]|0;g=b+12+j|0;if(!(f<<24>>24!=13&(j>>>0<255&k>>>0<e>>>0))){f=j;break}else h=j}}else f=0;a[g>>0]=0;if((a[d+(f+9)>>0]|0)==10){j=0;k=8}else{i=m;return}do{k=f+2+k|0;f=a[d+k>>0]|0;a:do if(f<<24>>24==13)f=0;else{h=k;g=f;f=0;do{if(h>>>0>=e>>>0)break a;a[1152487+(j<<8)+f>>0]=g;f=f+1|0;h=f+k|0;g=a[d+h>>0]|0}while(f>>>0<255&g<<24>>24!=13)}while(0);a[1152487+(j<<8)+f>>0]=0;j=j+1|0}while(j>>>0<3?(a[d+(k+1+f)>>0]|0)==10:0);e=Je(1152487)|0;f=Je(1152743)|0;f=Ue(e+256+f+(Je(1152999)|0)|0)|0;c[b+284>>2]=f;if(!f){i=m;return}c[l>>2]=1152487;c[l+4>>2]=1152743;c[l+8>>2]=1152999;we(f,1153255,l)|0;c[b+8>>2]=1;c[b+4>>2]=1;i=m;return}function Ib(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;if(d>>>0<16|(c[1577]|0)==0){d=0;return d|0}i=d>>>0<15872;g=i?512:25088;h=i?512:16384;i=i?24576:d+8704&65535;e=(i&65535)+32|0;f=Ue(e)|0;if(!f){d=0;return d|0}vb(f,h,i,24576,24832);i=h&65535;ef(f+(16416-i)|0,1136103,8192)|0;ef(f+(24608-i)|0,1153286,256)|0;ef(f+(24864-i)|0,1153542,256)|0;ef(f+((g|32)-i)|0,b|0,d|0)|0;a[f+(24622-i)>>0]=0;a[f+(24623-i)>>0]=g>>>8;d=rb(f,e)|0;Ve(f);return d|0}function Jb(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;if(d>>>0<16|(c[1578]|0)==0){d=0;return d|0}i=d>>>0<15872;g=i?512:25088;h=i?512:16384;i=i?24576:d+8704&65535;e=(i&65535)+32|0;f=Ue(e)|0;if(!f){d=0;return d|0}vb(f,h,i,24576,24832);a[f+15>>0]=5;i=h&65535;ef(f+(16416-i)|0,1144295,8192)|0;h=f+(17284-i)|0;a[h>>0]=a[1153798]|0;a[h+1>>0]=a[1153799]|0;a[h+2>>0]=a[1153800]|0;ef(f+(24608-i)|0,1153802,256)|0;ef(f+(24864-i)|0,1153542,256)|0;ef(f+((g|32)-i)|0,b|0,d|0)|0;a[f+(24614-i)>>0]=0;a[f+(24615-i)>>0]=g>>>8;d=rb(f,e)|0;Ve(f);return d|0}function Kb(b,c){b=b|0;c=c|0;if(c>>>0>160?(a[b+125>>0]|0)==26:0){c=1;return c|0}c=0;return c|0}function Lb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+268|0;a[f>>0]=79;a[f+1>>0]=80;a[f+2>>0]=88;a[f+3>>0]=0;f=b+12|0;if(e>>>0<128){g=1186826;h=f+16|0;do{a[f>>0]=a[g>>0]|0;f=f+1|0;g=g+1|0}while((f|0)<(h|0));return}g=d;h=f+53|0;do{a[f>>0]=a[g>>0]|0;f=f+1|0;g=g+1|0}while((f|0)<(h|0));e=52;while(1){f=b+12+e|0;if((a[f>>0]|0)!=32)break;a[f>>0]=0;if((e|0)>0)e=e+-1|0;else break}a[b+65>>0]=0;e=Ue(71)|0;c[b+284>>2]=e;if(e){f=e;g=d+55|0;h=f+55|0;do{a[f>>0]=a[g>>0]|0;f=f+1|0;g=g+1|0}while((f|0)<(h|0));f=e+55|0;g=d+110|0;h=f+15|0;do{a[f>>0]=a[g>>0]|0;f=f+1|0;g=g+1|0}while((f|0)<(h|0));a[e+70>>0]=0}c[b+8>>2]=1;c[b+4>>2]=1;return}function Mb(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;e=d+32512|0;if(d>>>0<16|(c[1580]|0)==0){d=0;return d|0}i=(e&65535)+32|0;j=Ue(i)|0;if(!j){d=0;return d|0}vb(j,256,e&65535,262,259);ef(j+32|0,1170442,c[1580]|0)|0;e=c[1579]|0;f=j+16160|0;if(!e){af(f|0,0,16384)|0;e=j+16188|0;a[e>>0]=79;a[e+1>>0]=80;a[e+2>>0]=76;a[e+3>>0]=76;ef(j+19232|0,1186842,512)|0;e=0;do{f=j+((e<<5)+25100)|0;g=1187354;h=f+32|0;do{a[f>>0]=a[g>>0]|0;f=f+1|0;g=g+1|0}while((f|0)<(h|0));e=e+1|0}while((e|0)!=62)}else ef(f|0,1154058,e|0)|0;ef(j+32544|0,b|0,d|0)|0;d=rb(j,i)|0;Ve(j);return d|0}function Nb(){var a=0,b=0,d=0;a=Ue(44)|0;b=a;d=b+44|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));c[a>>2]=65536;c[a+4>>2]=65535;c[a+8>>2]=Ue(262144)|0;c[a+12>>2]=Ue(262144)|0;return a|0}function Ob(a){a=a|0;if(!a)return;Ve(c[a+8>>2]|0);Ve(c[a+12>>2]|0);Ve(a);return}function Pb(a){a=a|0;var b=0,d=0,e=0;if((c[a>>2]|0)>0){b=c[a+8>>2]|0;d=c[a+12>>2]|0;e=0;do{c[b+(e<<2)>>2]=0-e;c[d+(e<<2)>>2]=0;e=e+1|0}while((e|0)<(c[a>>2]|0))}e=a+16|0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[a+32>>2]=-1;c[a+36>>2]=-1;c[a+40>>2]=1;return}function Qb(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;c[a+40>>2]=0;e=a+16|0;c[(c[a+12>>2]|0)+(c[e>>2]<<2)>>2]=c[a+28>>2];c[(c[a+8>>2]|0)+(c[e>>2]<<2)>>2]=b<<8&16776960|d&255;c[e>>2]=(c[e>>2]|0)+1&c[a+4>>2];return 0}function Rb(a,b){a=a|0;b=b|0;var d=0;d=c[a+36>>2]|0;a=d-(c[a+32>>2]|0)|0;if((d|0)>(b|0)|(a|0)<1){b=0;return b|0}b=((b-d|0)/(a|0)|0)+1|0;return b|0}function Sb(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;k=a+32|0;if((c[k>>2]|0)>-1){a=1;return a|0}f=a+28|0;if((b-(c[f>>2]|0)|0)<(e|0)){a=0;return a|0}c[f>>2]=b;j=c[a+16>>2]|0;b=a+20|0;f=c[b>>2]|0;if((j|0)<=(f|0)){a=0;return a|0}i=a+24|0;h=c[i>>2]|0;g=j-f|0;h=(h|0)==0?g:(g+h|0)/2|0;c[i>>2]=h;c[b>>2]=j;e=(_(h,d)|0)/(e|0)|0;h=(c[a>>2]|0)-e|0;if((h|0)<=0){a=0;return a|0}i=a+4|0;a:do if((e|0)>0){d=c[i>>2]|0;g=c[a+8>>2]|0;f=0;while(1){b=0;do{if((c[g+((b+h+j&d)<<2)>>2]|0)!=(c[g+((b+f+j&d)<<2)>>2]|0))break;b=b+1|0}while((b|0)<(e|0));if((b|0)==(e|0))break a;f=f+1|0;if((f|0)>=(h|0)){f=0;break}}return f|0}else{b=(e|0)==0;f=0;while(1){if(b)break a;f=f+1|0;if((f|0)>=(h|0)){f=0;break}}return f|0}while(0);i=c[i>>2]|0;g=c[a+12>>2]|0;c[k>>2]=c[g+((j+f&i)<<2)>>2];c[a+36>>2]=c[g+((j+h&i)<<2)>>2];a=1;return a|0}function Tb(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;if(b>>>0>=16)pa(1187387,1187399,67,1187481);if(d>>>0>=256)pa(1187500,1187399,68,1187481);f=c[a+(b<<10)+(d<<2)>>2]|0;if(f)c[f+8>>2]=e;if((c[a+16448>>2]|0)==(b|0)?(c[a+16480>>2]|0)==(d|0):0)Ub(a,0,b,d);if((c[a+16452>>2]|0)==(b|0)?(c[a+16484>>2]|0)==(d|0):0)Ub(a,1,b,d);if((c[a+16456>>2]|0)==(b|0)?(c[a+16488>>2]|0)==(d|0):0)Ub(a,2,b,d);if((c[a+16460>>2]|0)==(b|0)?(c[a+16492>>2]|0)==(d|0):0)Ub(a,3,b,d);if((c[a+16464>>2]|0)==(b|0)?(c[a+16496>>2]|0)==(d|0):0)Ub(a,4,b,d);if((c[a+16468>>2]|0)==(b|0)?(c[a+16500>>2]|0)==(d|0):0)Ub(a,5,b,d);if((c[a+16472>>2]|0)==(b|0)?(c[a+16504>>2]|0)==(d|0):0)Ub(a,6,b,d);if((c[a+16476>>2]|0)!=(b|0))return;if((c[a+16508>>2]|0)!=(d|0))return;Ub(a,7,b,d);return}function Ub(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;if(d>>>0>=16)pa(1187387,1187399,136,1187513);if(e>>>0>=256)pa(1187500,1187399,137,1187513);g=a+(d<<10)+(e<<2)|0;f=c[g>>2]|0;if(!f){c[a+16384+(b<<2)>>2]=1187530;c[a+16416+(b<<2)>>2]=1195722;c[a+16448+(b<<2)>>2]=d;c[a+16480+(b<<2)>>2]=e;return}switch(c[f+4>>2]|0){case 0:{b=b&6;if(!(c[f+8>>2]&1)){c[a+16384+(b<<2)>>2]=1187530;c[a+16384+((b|1)<<2)>>2]=1187530}else{c[a+16384+(b<<2)>>2]=c[f+12>>2];c[a+16384+((b|1)<<2)>>2]=(c[(c[g>>2]|0)+12>>2]|0)+8192}f=c[g>>2]|0;if(!(c[f+8>>2]&2)){c[a+16416+(b<<2)>>2]=1195722;f=b|1;c[a+16416+(f<<2)>>2]=1195722}else{c[a+16416+(b<<2)>>2]=c[f+12>>2];f=b|1;c[a+16416+(f<<2)>>2]=(c[(c[g>>2]|0)+12>>2]|0)+8192}c[a+16448+(f<<2)>>2]=d;c[a+16448+(b<<2)>>2]=d;c[a+16480+(f<<2)>>2]=e;c[a+16480+(b<<2)>>2]=e;return}case 1:{if(!(c[f+8>>2]&1))c[a+16384+(b<<2)>>2]=1187530;else c[a+16384+(b<<2)>>2]=c[f+12>>2];f=c[g>>2]|0;if(!(c[f+8>>2]&2))c[a+16416+(b<<2)>>2]=1195722;else c[a+16416+(b<<2)>>2]=c[f+12>>2];c[a+16448+(b<<2)>>2]=d;c[a+16480+(b<<2)>>2]=e;return}default:pa(1204112,1187399,182,1187513)}}function Vb(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;if(b>>>0>=16)pa(1187387,1187399,80,1203914);if(d>>>0>=256)pa(1187500,1187399,81,1203914);g=a+(b<<10)+(d<<2)|0;if(c[g>>2]|0)Wb(a,b,d);switch(e|0){case 0:{h=16384;break}case 1:{h=8192;break}default:{c[g>>2]=0;pa(1204112,1187399,86,1203914)}}d=Ue(16)|0;if(!d){c[g>>2]=0;pa(1204112,1187399,86,1203914)}b=Ue(h)|0;c[d+12>>2]=b;if(!b){Ve(d);c[g>>2]=0;pa(1204112,1187399,86,1203914)}c[d+4>>2]=e;c[d>>2]=0;c[d+8>>2]=1;if(f)ef(b|0,f|0,h|0)|0;c[g>>2]=d;Ub(a,0,c[a+16448>>2]|0,c[a+16480>>2]|0);Ub(a,1,c[a+16452>>2]|0,c[a+16484>>2]|0);Ub(a,2,c[a+16456>>2]|0,c[a+16488>>2]|0);Ub(a,3,c[a+16460>>2]|0,c[a+16492>>2]|0);Ub(a,4,c[a+16464>>2]|0,c[a+16496>>2]|0);Ub(a,5,c[a+16468>>2]|0,c[a+16500>>2]|0);Ub(a,6,c[a+16472>>2]|0,c[a+16504>>2]|0);Ub(a,7,c[a+16476>>2]|0,c[a+16508>>2]|0);return}function Wb(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if(b>>>0>=16)pa(1187387,1187399,98,1203933);if(d>>>0>=256)pa(1187500,1187399,99,1203933);d=a+(b<<10)+(d<<2)|0;b=c[d>>2]|0;if(b){e=c[b>>2]|0;if(!e){Ve(c[b+12>>2]|0);Ve(b)}else c[b>>2]=e+-1;c[d>>2]=0}Ub(a,0,c[a+16448>>2]|0,c[a+16480>>2]|0);Ub(a,1,c[a+16452>>2]|0,c[a+16484>>2]|0);Ub(a,2,c[a+16456>>2]|0,c[a+16488>>2]|0);Ub(a,3,c[a+16460>>2]|0,c[a+16492>>2]|0);Ub(a,4,c[a+16464>>2]|0,c[a+16496>>2]|0);Ub(a,5,c[a+16468>>2]|0,c[a+16500>>2]|0);Ub(a,6,c[a+16472>>2]|0,c[a+16504>>2]|0);Ub(a,7,c[a+16476>>2]|0,c[a+16508>>2]|0);return}function Xb(a,b){a=a|0;b=b|0;if(b>>>0<65536)return d[(c[a+16384+(b>>>13<<2)>>2]|0)+(b&8191)>>0]|0|0;else pa(1203949,1187399,187,1203963);return 0}function Yb(b,d,e){b=b|0;d=d|0;e=e|0;if(d>>>0<65536){a[(c[b+16416+(d>>>13<<2)>>2]|0)+(d&8191)>>0]=e;return}else pa(1203949,1187399,192,1203980)}function Zb(){var a=0;a=Ue(16512)|0;if(!a){a=0;return a|0}af(a|0,0,16512)|0;Ub(a,0,0,0);Ub(a,1,0,1);Ub(a,2,0,2);Ub(a,3,0,3);Ub(a,4,0,4);Ub(a,5,0,5);Ub(a,6,0,6);Ub(a,7,0,7);return a|0}function _b(a){a=a|0;var b=0;b=0;do{Wb(a,0,b);b=b+1|0}while((b|0)!=256);b=0;do{Wb(a,1,b);b=b+1|0}while((b|0)!=256);b=0;do{Wb(a,2,b);b=b+1|0}while((b|0)!=256);b=0;do{Wb(a,3,b);b=b+1|0}while((b|0)!=256);b=0;do{Wb(a,4,b);b=b+1|0}while((b|0)!=256);b=0;do{Wb(a,5,b);b=b+1|0}while((b|0)!=256);b=0;do{Wb(a,6,b);b=b+1|0}while((b|0)!=256);b=0;do{Wb(a,7,b);b=b+1|0}while((b|0)!=256);b=0;do{Wb(a,8,b);b=b+1|0}while((b|0)!=256);b=0;do{Wb(a,9,b);b=b+1|0}while((b|0)!=256);b=0;do{Wb(a,10,b);b=b+1|0}while((b|0)!=256);b=0;do{Wb(a,11,b);b=b+1|0}while((b|0)!=256);b=0;do{Wb(a,12,b);b=b+1|0}while((b|0)!=256);b=0;do{Wb(a,13,b);b=b+1|0}while((b|0)!=256);b=0;do{Wb(a,14,b);b=b+1|0}while((b|0)!=256);b=0;do{Wb(a,15,b);b=b+1|0}while((b|0)!=256);Ve(a);return}function $b(a){a=a|0;var b=0;b=Ue(2072)|0;if(!b){a=0;return a|0}af(b|0,0,2072)|0;c[b+2064>>2]=rd(3579545,a)|0;c[b+2048>>2]=uc(3579545,a)|0;c[b+2052>>2]=Ec(3579545,a)|0;c[b+2056>>2]=Mc(3579545,a)|0;c[b+2060>>2]=$c(3579545,a)|0;a=Zb()|0;c[b+708>>2]=a;c[b+712>>2]=Nb()|0;c[b+2012>>2]=0;c[b+2036>>2]=0;c[b+2e3>>2]=0;c[b+2020>>2]=0;c[b+2024>>2]=0;c[b+2028>>2]=0;if(!a)pa(1203998,1204007,194,1204087);else{a=b;return a|0}return 0}function ac(a){a=a|0;_b(c[a+708>>2]|0);Ob(c[a+712>>2]|0);td(c[a+2064>>2]|0);xc(c[a+2048>>2]|0);Gc(c[a+2052>>2]|0);Pc(c[a+2056>>2]|0);bd(c[a+2060>>2]|0);Cd(a+172|0,c[a+684>>2]|0);Ve(a);return}function bc(a,b){a=a|0;b=b|0;Ld(a,b)|0;return}function cc(a,b,d){a=a|0;b=b|0;d=d|0;c[a+972+(b<<2)>>2]=d;return}function dc(a){a=a|0;var b=0,d=0,e=0;e=a+2048|0;wc(c[e>>2]|0);b=a+2020|0;d=c[b>>2]|0;e=c[e>>2]|0;if(e){switch(d|0){case 0:{vc(e,1);break}case 1:{vc(e,1);break}case 2:{vc(e,0);break}default:{}}c[b>>2]=d}Fc(c[a+2052>>2]|0);fc(a,c[a+2024>>2]|0);e=a+2056|0;Nc(c[e>>2]|0);b=a+2028|0;d=c[b>>2]|0;e=c[e>>2]|0;if(!e){e=a+2060|0;e=c[e>>2]|0;ad(e);a=a+2064|0;a=c[a>>2]|0;sd(a);return}switch(d|0){case 0:{Oc(e,0);break}case 1:{Oc(e,1);break}case 2:{Oc(e,2);break}default:{}}c[b>>2]=d;e=a+2060|0;e=c[e>>2]|0;ad(e);a=a+2064|0;a=c[a>>2]|0;sd(a);return}function ec(a,b){a=a|0;b=b|0;var d=0;d=c[a+2048>>2]|0;if(!d)return;switch(b|0){case 0:{vc(d,1);break}case 1:{vc(d,1);break}case 2:{vc(d,0);break}default:{}}c[a+2020>>2]=b;return}function fc(a,b){a=a|0;b=b|0;var d=0,e=0;d=a+2052|0;e=c[d>>2]|0;if(!e)return;switch(b|0){case 0:{Kc(e,1);Jc(c[d>>2]|0,36864,63);break}case 1:{Kc(e,0);Jc(c[d>>2]|0,36864,63);break}case 2:{Kc(e,1);Jc(c[d>>2]|0,49150,32);Jc(c[d>>2]|0,45056,128);break}default:{}}c[a+2024>>2]=b;return}function gc(a,b){a=a|0;b=b|0;var d=0;d=c[a+2056>>2]|0;if(!d)return;switch(b|0){case 0:{Oc(d,0);break}case 1:{Oc(d,1);break}case 2:{Oc(d,2);break}default:{}}c[a+2028>>2]=b;return}function hc(b,d,e,f,g,h,i){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0;Hd(b);Pb(c[b+712>>2]|0);c[b+2040>>2]=0;af(b+716|0,0,512)|0;c[b+2036>>2]=i;c[b+136>>2]=b;c[b+140>>2]=1;c[b+144>>2]=1;c[b+148>>2]=2;c[b+152>>2]=2;c[b+156>>2]=3;a[b+21>>0]=2;a[b+7>>0]=h;h=b+20|0;a[h>>0]=0;c[b+120>>2]=3;a[b+15>>0]=0;a[b+16>>0]=0;a[b+19>>0]=0;a[b+17>>0]=1;i=b+1996|0;c[i>>2]=d;j=b+708|0;Yb(c[j>>2]|0,62335,0);Yb(c[j>>2]|0,62334,254);Yb(c[j>>2]|0,62333,24);Yb(c[j>>2]|0,62332,118);Yb(c[j>>2]|0,62331,243);Yb(c[j>>2]|0,62330,124);c[b+28>>2]=62330;c[b+32>>2]=e;a[h>>0]=0;c[b+704>>2]=f;e=b+172|0;Ad(e);f=Bd(e)|0;h=b+684|0;c[h>>2]=f;Fd(e,f,3,b);c[b+168>>2]=e;c[i>>2]=d;c[b+700>>2]=g;f=(d>>>0)/(g>>>0)|0;c[b+688>>2]=f;c[b+696>>2]=0;c[b+692>>2]=(d>>>0)%(g>>>0)|0;Dd(e,c[h>>2]|0,f);return}function ic(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0;if(!b)pa(1204094,1204007,331,1204097);h=b+708|0;i=c[h>>2]|0;if(!i)pa(1203998,1204007,332,1204097);c[b+2012>>2]=d;b=Ue(65536)|0;if(!b)pa(1204112,1204007,337,1204097);af(b|0,-55,16384)|0;j=b+147|0;a[j>>0]=a[1204114]|0;a[j+1>>0]=a[1204115]|0;a[j+2>>0]=a[1204116]|0;a[j+3>>0]=a[1204117]|0;a[j+4>>0]=a[1204118]|0;a[j+5>>0]=a[1204119]|0;j=b+1|0;k=j;a[k>>0]=211;a[k+1>>0]=160;a[k+2>>0]=245;a[k+3>>0]=123;j=j+4|0;a[j>>0]=-906911277;a[j+1>>0]=-906911277>>8;a[j+2>>0]=-906911277>>16;a[j+3>>0]=-906911277>>24;j=b+9|0;a[j>>0]=a[1204121]|0;a[j+1>>0]=a[1204122]|0;a[j+2>>0]=a[1204123]|0;a[j+3>>0]=a[1204124]|0;a[j+4>>0]=a[1204125]|0;j=b+16384|0;af(j|0,0,49152)|0;ef(b+e|0,g|0,((f+e|0)>>>0>65536?65536-e|0:f)|0)|0;Vb(i,0,0,0,b);Tb(c[h>>2]|0,0,0,3);Ub(c[h>>2]|0,0,0,0);Vb(c[h>>2]|0,0,1,0,j);Tb(c[h>>2]|0,0,1,3);Ub(c[h>>2]|0,2,0,1);Vb(c[h>>2]|0,0,2,0,b+32768|0);Tb(c[h>>2]|0,0,2,3);Ub(c[h>>2]|0,4,0,2);Vb(c[h>>2]|0,0,3,0,b+49152|0);Tb(c[h>>2]|0,0,3,3);Ub(c[h>>2]|0,6,0,3);if(d){Ve(b);return}Tb(c[h>>2]|0,0,2,1);Ve(b);return}function jc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;if(!a)pa(1204094,1204007,365,1204127);h=a+708|0;g=c[h>>2]|0;if(!g)pa(1203998,1204007,366,1204127);c[a+2e3>>2]=b;c[a+2004>>2]=e;c[a+2008>>2]=e+d;switch(b|0){case 0:{if(!d)return;Vb(g,1,e,0,f);if((d|0)==1)return;else g=1;do{Vb(c[h>>2]|0,1,g+e|0,0,f+(g<<14)|0);g=g+1|0}while((g|0)!=(d|0));return}case 1:{if(!d)return;Vb(g,1,e,1,f);if((d|0)==1)return;else g=1;do{Vb(c[h>>2]|0,1,g+e|0,1,f+(g<<13)|0);g=g+1|0}while((g|0)!=(d|0));return}default:pa(1204112,1204007,381,1204127)}}function kc(a,b){a=a|0;b=b|0;return Xb(c[a+708>>2]|0,b)|0}function lc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;f=b>>>13;a:do if(!(c[a+2016>>2]|0)){b:do if(!(c[a+2024>>2]|0)){c:do if((b|0)>=45056)if((b|0)<49150)switch(b|0){case 45056:break c;default:break b}else switch(b|0){case 49150:break c;default:break b}else switch(b|0){case 36864:break;default:break b}while(0);e=c[a+2052>>2]|0;if((b|0)==36864&(d|0)!=0){Jc(e,36864,63);break a}else{Jc(e,b,d);break a}}while(0);e=b&-256;if((e|0)<47104)switch(e|0){case 38912:break;default:break a}else switch(e|0){case 47104:break;default:break a}Jc(c[a+2052>>2]|0,b,d);Qb(c[a+712>>2]|0,b,d)|0}while(0);if((b&-4096|0)==20480&(c[a+2036>>2]|0)!=0){e=a+2044|0;c[e>>2]=(d<<3&2040)+-1024+(c[e>>2]>>1);Qb(c[a+712>>2]|0,b,d)|0}e=a+708|0;if(!((b&-8193|0)==36864?(c[a+2e3>>2]|0)==1:0)){a=c[e>>2]|0;Yb(a,b,d);return}Ub(c[e>>2]|0,f,1,d);a=c[e>>2]|0;Yb(a,b,d);return}function mc(a,b){a=a|0;b=b|0;var d=0;b=b&255;d=c[a+2048>>2]|0;if((b|0)==162&(d|0)!=0){a=(yc(d)|0)&255;return a|0}switch(b|0){case 193:{a=ed(c[a+2060>>2]|0)|0;return a|0}case 192:{a=gd(c[a+2060>>2]|0)|0;return a|0}default:{a=255;return a|0}}return 0}function nc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=d&255;if((f+-65|0)>>>0<4?(a[b+780>>0]|0)!=127:0)return;a[b+716+f>>0]=e;d=c[b+972+(f<<2)>>2]|0;if(d)Ia[d&7](b,f,e)|0;switch(f|0){case 6:{d=c[b+2064>>2]|0;if(!d)return;xd(d,e);Qb(c[b+712>>2]|0,6,e)|0;return}case 161:case 160:{d=c[b+2048>>2]|0;if(!d)return;zc(d,f,e);Qb(c[b+712>>2]|0,f,e)|0;return}case 170:{f=b+2040|0;c[f>>2]=(c[f>>2]>>1)+(e<<4&2048);Qb(c[b+712>>2]|0,170,e)|0;return}case 171:{f=b+2040|0;c[f>>2]=(c[f>>2]>>1)+(e<<11&2048);Qb(c[b+712>>2]|0,171,e)|0;return}case 127:case 126:{d=c[b+2064>>2]|0;if(!d)return;ud(d,e);Qb(c[b+712>>2]|0,f,e)|0;return}case 241:case 240:case 125:case 124:{d=c[b+2056>>2]|0;if(!d)return;Tc(d,f,e);Qb(c[b+712>>2]|0,f,e)|0;return}case 193:case 192:{d=c[b+2060>>2]|0;if(!d)return;fd(d,f,e);Qb(c[b+712>>2]|0,f,e)|0;return}default:{if(!((f|0)==254&(c[b+2e3>>2]|0)==0))return;if((c[b+2004>>2]|0)>>>0<=e>>>0?(c[b+2008>>2]|0)>>>0>e>>>0:0){Ub(c[b+708>>2]|0,4,1,e);return}Ub(c[b+708>>2]|0,4,0,2);return}}}function oc(a,b){a=a|0;b=b|0;return 56}function pc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;b=e+696|0;f=(c[b>>2]|0)+(c[e+692>>2]|0)|0;c[b>>2]=f;g=c[e+700>>2]|0;h=c[e+684>>2]|0;d=c[e+688>>2]|0;if(f>>>0<g>>>0)Dd(e+172|0,h,d);else{c[b>>2]=f-g;Dd(e+172|0,h,d+1|0)}d=e+20|0;if(!(a[d>>0]|0))return;h=c[e+704>>2]|0;g=e+708|0;Yb(c[g>>2]|0,62335,0);Yb(c[g>>2]|0,62334,254);Yb(c[g>>2]|0,62333,24);Yb(c[g>>2]|0,62332,118);Yb(c[g>>2]|0,62331,243);Yb(c[g>>2]|0,62330,124);c[e+28>>2]=62330;c[e+32>>2]=h;a[d>>0]=0;return}function qc(b,c){b=b|0;c=c|0;var e=0;if(c>>>0>7&(a[b>>0]|0)==-2){if(c>>>0>95?(Ke(b+80|0,1204140,3)|0)==0:0){c=1;return c|0}e=d[b+2>>0]<<8|d[b+1>>0];if((8-e+(d[b+4>>0]<<8|d[b+3>>0])|0)==(c|0)?(d[b+7>>0]|0)<2:0){c=1;return c|0}if((e|0)==42423?(d[b+7>>0]|0)<2:0){c=1;return c|0}}c=0;return c|0}function rc(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;if(f>>>0>96?(Ke(e+80|0,1204140,3)|0)==0:0){j=b+268|0;a[j>>0]=66;a[j+1>>0]=84;a[j+2>>0]=79;a[j+3>>0]=0;j=e+89|0;k=e+90|0;i=((d[e+92>>0]|0)<<8|(d[e+91>>0]|0))+7-((d[k>>0]|0)<<8|(d[j>>0]|0))|0;g=0;do{h=i+g|0;if(h>>>0>=f>>>0)break;h=a[e+h>>0]|0;if((h&255)<32)break;a[b+12+g>>0]=h;g=g+1|0}while(g>>>0<255);a[b+12+g>>0]=0;i=((d[e+94>>0]|0)<<8|(d[e+93>>0]|0))+7-((d[k>>0]|0)<<8|(d[j>>0]|0))|0;g=0;do{h=i+g|0;if(h>>>0>=f>>>0)break;h=a[e+h>>0]|0;if((h&255)<32)break;a[1212336+g>>0]=h;g=g+1|0}while(g>>>0<255);a[1212336+g>>0]=0;g=Ue((Je(1212336)|0)+1|0)|0;c[b+284>>2]=g;if(!g){f=b+8|0;c[f>>2]=1;b=b+4|0;c[b>>2]=1;return}Ie(g,1212336)|0;f=b+8|0;c[f>>2]=1;b=b+4|0;c[b>>2]=1;return}a[b+12>>0]=0;c[b+284>>2]=0;f=b+8|0;c[f>>2]=1;b=b+4|0;c[b>>2]=1;return}function sc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;e=d+8192|0;if(d>>>0<16|(c[1581]|0)==0){d=0;return d|0}f=(e&65535)+32|0;g=Ue(f)|0;if(!g){d=0;return d|0}vb(g,24576,e&65535,32256,32512);a[g+15>>0]=1;ef(g+32|0,1204151,(c[1581]|0)+-7|0)|0;ef(g+7712|0,1212592,256)|0;ef(g+7968|0,1212848,256)|0;ef(g+8224|0,b|0,d|0)|0;d=rb(g,f)|0;Ve(g);return d|0}function tc(a,b){a=a|0;b=b|0;var d=0,e=0;c[a+52>>2]=b;d=c[a+40>>2]|0;e=c[a+44>>2]|0;if(!b){e=~~(+(d>>>0)*16777216.0/+(e<<4>>>0))>>>0;b=a+48|0;c[b>>2]=e;return}else{c[a+192>>2]=2147483648/(e>>>0)|0;c[a+200>>2]=2147483648/(d>>>4>>>0)|0;c[a+196>>2]=0;e=16777216;b=a+48|0;c[b>>2]=e;return}}function uc(a,b){a=a|0;b=b|0;var d=0;d=Ue(208)|0;if(!d){b=0;return b|0}c[d>>2]=6328;c[d+40>>2]=a;b=(b|0)!=0?b:44100;c[d+44>>2]=b;c[d+52>>2]=0;c[d+48>>2]=~~(+(a>>>0)*16777216.0/+(b<<4>>>0))>>>0;b=d;return b|0}function vc(a,b){a=a|0;b=b|0;switch(b|0){case 1:{c[a>>2]=6328;return}case 2:{c[a>>2]=6456;return}default:{c[a>>2]=6456;return}}}function wc(b){b=b|0;var d=0,e=0;c[b+132>>2]=0;c[b+56>>2]=4096;c[b+80>>2]=0;c[b+92>>2]=0;c[b+68>>2]=0;c[b+60>>2]=4096;c[b+84>>2]=0;c[b+96>>2]=0;c[b+72>>2]=0;c[b+64>>2]=4096;c[b+88>>2]=0;c[b+100>>2]=0;c[b+76>>2]=0;c[b+128>>2]=0;d=b+4|0;e=d+16|0;do{a[d>>0]=0;d=d+1|0}while((d|0)<(e|0));c[b+204>>2]=0;c[b+180>>2]=65535;c[b+184>>2]=64;c[b+188>>2]=0;c[b+136>>2]=0;c[b+140>>2]=0;c[b+172>>2]=0;c[b+176>>2]=0;c[b+164>>2]=1;c[b+36>>2]=0;return}function xc(a){a=a|0;Ve(a);return}function yc(b){b=b|0;return a[(c[b+204>>2]|0)+(b+4)>>0]|0}function zc(a,b,d){a=a|0;b=b|0;d=d|0;if(!(b&1)){c[a+204>>2]=d&31;return}else{Ac(a,c[a+204>>2]|0,d);return}}function Ac(b,e,f){b=b|0;e=e|0;f=f|0;if(e>>>0>15)return;f=(d[1213104+e>>0]|0)&f;a[b+4+e>>0]=f;switch(e|0){case 5:case 3:case 1:case 4:case 2:case 0:{e=e>>>1;f=e<<1;c[b+80+(e<<2)>>2]=(d[(f|1)+(b+4)>>0]|0)<<8&3840|(d[b+4+f>>0]|0);return}case 6:{c[b+188>>2]=f<<1&62;return}case 7:{c[b+104>>2]=f&1;c[b+108>>2]=f&2;c[b+112>>2]=f&4;c[b+116>>2]=f&8;c[b+120>>2]=f&16;c[b+124>>2]=f&32;return}case 10:case 9:case 8:{c[b+68+(e+-8<<2)>>2]=f<<1;return}case 12:case 11:{c[b+172>>2]=(d[b+16>>0]|0)<<8|(d[b+15>>0]|0);return}case 13:{c[b+148>>2]=f>>>3&1;e=f>>>2&1;c[b+152>>2]=e;c[b+156>>2]=f>>>1&1;c[b+160>>2]=f&1;c[b+144>>2]=e;c[b+164>>2]=0;c[b+176>>2]=65536-(c[b+172>>2]|0);c[b+140>>2]=(e|0)!=0?0:31;return}default:return}}function Bc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0;if(!(c[a+52>>2]|0)){i=(Cc(a)|0)<<16>>16;i=i<<4;i=i&65535;return i|0}h=a+192|0;b=c[h>>2]|0;i=a+196|0;d=c[i>>2]|0;if(d>>>0<b>>>0){f=a+200|0;g=a+36|0;do{c[i>>2]=(c[f>>2]|0)+d;b=(Cc(a)|0)<<16>>16;b=(c[g>>2]|0)+b>>1;c[g>>2]=b;e=c[h>>2]|0;d=c[i>>2]|0}while(d>>>0<e>>>0)}else{e=b;b=c[a+36>>2]|0}c[i>>2]=d-e;i=b;i=i<<4;i=i&65535;return i|0}function Cc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;m=a+132|0;b=(c[m>>2]|0)+(c[a+48>>2]|0)|0;n=b>>>24;c[m>>2]=b&16777215;m=a+176|0;b=n+(c[m>>2]|0)|0;c[m>>2]=b;if(b>>>0>65535?(f=c[a+172>>2]|0,g=a+164|0,h=a+144|0,i=a+140|0,j=a+148|0,k=a+156|0,l=a+160|0,(f|0)!=0):0){do{do if(!(c[g>>2]|0)){d=c[i>>2]|0;if(!(c[h>>2]|0)){d=d+63&63;c[i>>2]=d;break}else{d=d+1&63;c[i>>2]=d;break}}else d=c[i>>2]|0;while(0);do if(d&32){if(!(c[j>>2]|0)){c[g>>2]=1;c[i>>2]=0;break}d=c[k>>2]|0;e=c[l>>2]|0;if((d|0)!=(e|0)){c[h>>2]=c[h>>2]^1;d=e}if(d)c[g>>2]=1;c[i>>2]=(c[h>>2]|0)!=0?0:31}while(0);b=b-f|0}while(b>>>0>65535);c[m>>2]=b}e=a+184|0;f=(c[e>>2]|0)+n|0;c[e>>2]=f;d=a+180|0;b=c[d>>2]|0;if(!(f&64))l=a+188|0;else{if(b&1){b=b^147456;c[d>>2]=b}b=b>>>1;c[d>>2]=b;l=a+188|0;m=c[l>>2]|0;c[e>>2]=f-((m|0)==0?2:m)}h=b&1;i=a+128|0;j=a+140|0;k=0;b=0;do{d=a+56+(k<<2)|0;e=(c[d>>2]|0)+n|0;c[d>>2]=e;do if(e&4096){f=c[a+80+(k<<2)>>2]|0;g=a+92+(k<<2)|0;if(f>>>0>1){c[g>>2]=(c[g>>2]|0)==0&1;c[d>>2]=e-f;break}else{c[g>>2]=1;break}}while(0);do if(!(c[i>>2]&1<<k)){if(!((c[a+80+(k<<2)>>2]|0)==0?(c[l>>2]|0)==0:0)){if((c[a+104+(k<<2)>>2]|0)==0?(c[a+92+(k<<2)>>2]|0)==0:0)break;if(!(c[a+116+(k<<2)>>2]|h))break}d=c[a+68+(k<<2)>>2]|0;if(!(d&32)){b=(c[(c[a>>2]|0)+((d&31)<<2)>>2]|0)+b|0;break}else{b=(c[(c[a>>2]|0)+(c[j>>2]<<2)>>2]|0)+b|0;break}}while(0);k=k+1|0}while((k|0)!=3);return b&65535|0}function Dc(a,b){a=a|0;b=b|0;var d=0,e=0;c[a+12>>2]=b;d=c[a>>2]|0;e=c[a+4>>2]|0;if(!b){b=~~(+(d>>>0)*4194304.0/+(e>>>0))>>>0;a=a+8|0;c[a>>2]=b;return}else{c[a+48>>2]=2147483648/(e>>>0)|0;c[a+56>>2]=2147483648/(d>>>1>>>0)|0;c[a+52>>2]=0;b=8388608;a=a+8|0;c[a>>2]=b;return}}function Ec(a,b){a=a|0;b=b|0;var d=0;d=Ue(444)|0;if(!d){b=0;return b|0}af(d|0,0,444)|0;c[d>>2]=a;b=(b|0)!=0?b:44100;c[d+4>>2]=b;c[d+12>>2]=0;c[d+8>>2]=~~(+(a>>>0)*4194304.0/+(b>>>0))>>>0;c[d+28>>2]=1;b=d;return b|0}function Fc(b){b=b|0;var d=0,e=0;if(!b)return;c[b+32>>2]=0;c[b+36>>2]=0;c[b+40>>2]=36864;d=b+80|0;a[d>>0]=0;a[d+1>>0]=0;a[d+2>>0]=0;a[d+3>>0]=0;a[d+4>>0]=0;d=b+424|0;e=b+112|0;a[e>>0]=0;a[e+1>>0]=0;a[e+2>>0]=0;a[e+3>>0]=0;a[e+4>>0]=0;e=b+144|0;a[e>>0]=0;a[e+1>>0]=0;a[e+2>>0]=0;a[e+3>>0]=0;a[e+4>>0]=0;e=b+176|0;a[e>>0]=0;a[e+1>>0]=0;a[e+2>>0]=0;a[e+3>>0]=0;a[e+4>>0]=0;e=b+208|0;a[e>>0]=0;a[e+1>>0]=0;a[e+2>>0]=0;a[e+3>>0]=0;a[e+4>>0]=0;c[b+44>>2]=0;af(b+240|0,0,164)|0;c[d>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+16>>2]=0;c[b+404>>2]=255;c[b+408>>2]=255;c[b+412>>2]=0;c[b+416>>2]=0;c[b+420>>2]=0;c[b+16>>2]=0;c[b+20>>2]=0;c[b+24>>2]=0;return}function Gc(a){a=a|0;if(!a)return;Ve(a);return}function Hc(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if(!(c[b+12>>2]|0)){h=b+404|0;i=b+44|0;j=b+408|0;k=0;d=0;do{g=b+240+(k<<2)|0;e=(c[b+60+(k<<2)>>2]|0)+(c[g>>2]|0)|0;c[g>>2]=e;if(!(e&134217728)){e=1<<k;f=c[h>>2]|0}else{c[g>>2]=e&134217727;e=b+320+(k<<2)|0;c[e>>2]=(c[e>>2]|0)+31&c[b+424+(k<<2)>>2];e=1<<k;f=c[j>>2]&e|c[h>>2]&~e;c[h>>2]=f}if((f&e|0)!=0?(l=((c[g>>2]|0)>>>22)+(c[b+320+(k<<2)>>2]|0)&31,c[b+280+(k<<2)>>2]=l,(c[i>>2]&e|0)==0):0)d=((_(c[b+300+(k<<2)>>2]<<24>>24,a[b+80+(k<<5)+l>>0]|0)|0)>>4)+d|0;k=k+1|0}while((k|0)!=5);b=d<<4&65535;return b|0}o=b+48|0;d=c[o>>2]|0;q=b+52|0;h=c[q>>2]|0;if(h>>>0<d>>>0){g=b+56|0;n=b+24|0;f=b+20|0;k=b+404|0;l=b+44|0;m=b+408|0;e=c[n>>2]|0;do{c[q>>2]=(c[g>>2]|0)+h;c[f>>2]=e;j=0;d=0;do{i=b+240+(j<<2)|0;e=(c[b+60+(j<<2)>>2]|0)+(c[i>>2]|0)|0;c[i>>2]=e;if(!(e&134217728)){e=1<<j;h=c[k>>2]|0}else{c[i>>2]=e&134217727;e=b+320+(j<<2)|0;c[e>>2]=(c[e>>2]|0)+31&c[b+424+(j<<2)>>2];e=1<<j;h=c[m>>2]&e|c[k>>2]&~e;c[k>>2]=h}if((h&e|0)!=0?(p=((c[i>>2]|0)>>>22)+(c[b+320+(j<<2)>>2]|0)&31,c[b+280+(j<<2)>>2]=p,(c[l>>2]&e|0)==0):0)d=((_(c[b+300+(j<<2)>>2]<<24>>24,a[b+80+(j<<5)+p>>0]|0)|0)>>4)+d|0;j=j+1|0}while((j|0)!=5);e=d<<20>>16;c[n>>2]=e;d=c[o>>2]|0;h=c[q>>2]|0}while(h>>>0<d>>>0)}else{g=b+56|0;f=b+20|0;e=c[b+24>>2]|0}p=h-d|0;c[q>>2]=p;q=c[g>>2]|0;q=~~((+(e|0)*+((q-p|0)>>>0)+ +(p>>>0)*+(c[f>>2]|0))/+(q>>>0));c[b+16>>2]=q<<16>>16;b=q;return b|0}function Ic(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;g=d&255;if(g>>>0<160){h=d>>>5&7;if(c[b+424+(h<<2)>>2]|0)return;g=e&255;f=d&31;a[b+80+(h<<5)+f>>0]=g;if(!((h|0)==3&(c[b+32>>2]|0)==0))return;a[b+208+f>>0]=g;return}f=g+-192|0;if(f>>>0<10){a[b+340+f>>0]=e;g=d>>>1&7;if(!(d&1)){d=b+260+(g<<2)|0;f=c[d>>2]&3840|e&255;c[d>>2]=f}else{d=b+260+(g<<2)|0;f=c[d>>2]&255|e<<8&3840;c[d>>2]=f}if(c[b+420>>2]|0)c[b+240+(g<<2)>>2]=0;f=(c[b+416>>2]|0)==0?f:f&255;f=(c[b+412>>2]|0)==0?f:f>>>8;if(f>>>0<9){c[b+60+(g<<2)>>2]=0;return}else{c[b+60+(g<<2)>>2]=((c[b+8>>2]|0)>>>0)/((f+1|0)>>>0)|0;return}}if((g+-208|0)>>>0<5){a[b+340+f>>0]=e;c[b+300+((d&15)<<2)>>2]=e&15;return}switch(g|0){case 224:{a[b+340+f>>0]=e;c[b+32>>2]=e&1;return}case 225:{a[b+340+f>>0]=e;c[b+408>>2]=e&31;return}case 226:{a[b+340+f>>0]=e;c[b+412>>2]=e&1;c[b+416>>2]=e&2;c[b+420>>2]=e&32;f=b+424|0;if(!(e&64)){c[f>>2]=0;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+16>>2]=0}else{c[f>>2]=31;c[b+428>>2]=31;c[b+432>>2]=31;c[b+436>>2]=31;c[b+440>>2]=31}if(!(e&128))return;c[b+440>>2]=31;c[b+436>>2]=31;return}default:return}}function Jc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;j=e&255;g=c[b+28>>2]|0;i=(g|0)==1;if((d&65534|0)==49150&i){c[b+40>>2]=e<<8&8192|36864;return}f=c[b+40>>2]|0;if(f>>>0>d>>>0)return;h=d-f|0;if((f|0)==(d|0)){if((j|0)==63){c[b+32>>2]=0;c[b+36>>2]=1;return}f=b+32|0;if((e&128|0)==0|i^1){c[f>>2]=0;c[b+36>>2]=0;return}else{c[f>>2]=1;c[b+36>>2]=1;return}}if((h&-256|0)!=2048|(c[b+36>>2]|0)==0)return;switch(g|0){case 0:{f=h&255;if(f>>>0<128){Ic(b,f,j);return}if(f>>>0<138){Ic(b,f+64|0,j);return}if(f>>>0<143){Ic(b,f+70|0,j);return}if((f|0)==143){a[b+373>>0]=e;c[b+408>>2]=e&31;return}if(f>>>0<=223)return;a[b+374>>0]=e;c[b+412>>2]=e&1;c[b+416>>2]=e&2;c[b+420>>2]=e&32;f=b+424|0;if(!(e&64)){c[f>>2]=0;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+16>>2]=0}else{c[f>>2]=31;c[b+428>>2]=31;c[b+432>>2]=31;c[b+436>>2]=31;c[b+440>>2]=31}if(!(e&128))return;c[b+440>>2]=31;c[b+436>>2]=31;return}case 1:{f=h&255;if(!(c[b+32>>2]|0)){if(f>>>0<128){Ic(b,f,j);return}if(f>>>0<138){Ic(b,f+64|0,j);return}if(f>>>0<143){Ic(b,f+70|0,j);return}if((f|0)==143){a[b+373>>0]=e;c[b+408>>2]=e&31;return}if(f>>>0<=223)return;a[b+374>>0]=e;c[b+412>>2]=e&1;c[b+416>>2]=e&2;c[b+420>>2]=e&32;f=b+424|0;if(!(e&64)){c[f>>2]=0;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+16>>2]=0}else{c[f>>2]=31;c[b+428>>2]=31;c[b+432>>2]=31;c[b+436>>2]=31;c[b+440>>2]=31}if(!(e&128))return;c[b+440>>2]=31;c[b+436>>2]=31;return}else{if(f>>>0<160){Ic(b,f,j);return}if(f>>>0<170){Ic(b,f+32|0,j);return}if(f>>>0<175){Ic(b,f+38|0,j);return}if((f|0)==175){a[b+373>>0]=e;c[b+408>>2]=e&31;return}if((h&224|0)!=192)return;a[b+374>>0]=e;c[b+412>>2]=e&1;c[b+416>>2]=e&2;c[b+420>>2]=e&32;f=b+424|0;if(!(e&64)){c[f>>2]=0;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+16>>2]=0}else{c[f>>2]=31;c[b+428>>2]=31;c[b+432>>2]=31;c[b+436>>2]=31;c[b+440>>2]=31}if(!(e&128))return;c[b+440>>2]=31;c[b+436>>2]=31;return}}default:return}}function Kc(a,b){a=a|0;b=b|0;c[a+28>>2]=b;return}function Lc(a,b){a=a|0;b=b|0;var e=0,f=0;c[b+40>>2]=(d[a>>0]|0)>>>7;e=a+1|0;c[b+92>>2]=(d[e>>0]|0)>>>7;c[b+44>>2]=(d[a>>0]|0)>>>6&1;c[b+96>>2]=(d[e>>0]|0)>>>6&1;c[b+8>>2]=(d[a>>0]|0)>>>5&1;c[b+60>>2]=(d[e>>0]|0)>>>5&1;c[b+32>>2]=(d[a>>0]|0)>>>4&1;c[b+84>>2]=(d[e>>0]|0)>>>4&1;c[b+12>>2]=(d[a>>0]|0)&15;c[b+64>>2]=(d[e>>0]|0)&15;e=a+2|0;c[b+36>>2]=(d[e>>0]|0)>>>6;f=a+3|0;c[b+88>>2]=(d[f>>0]|0)>>>6;c[b>>2]=(d[e>>0]|0)&63;c[b+4>>2]=(d[f>>0]|0)&7;c[b+48>>2]=(d[f>>0]|0)>>>3&1;c[b+100>>2]=(d[f>>0]|0)>>>4&1;f=a+4|0;c[b+16>>2]=(d[f>>0]|0)>>>4;e=a+5|0;c[b+68>>2]=(d[e>>0]|0)>>>4;c[b+20>>2]=(d[f>>0]|0)&15;c[b+72>>2]=(d[e>>0]|0)&15;e=a+6|0;c[b+24>>2]=(d[e>>0]|0)>>>4;a=a+7|0;c[b+76>>2]=(d[a>>0]|0)>>>4;c[b+28>>2]=(d[e>>0]|0)&15;c[b+80>>2]=(d[a>>0]|0)&15;return}function Mc(a,d){a=a|0;d=d|0;var f=0.0,g=0,i=0.0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;if((c[1646]|0)!=(a|0)){c[1646]=a;a=0;do{i=+(a|0)*6.283185307179586*.00390625;do if(!(i<=1.5707963267948966)){f=i*2.0/3.141592653589793;if(!(i<=4.71238898038469)){f=f+-4.0;break}else{f=2.0-f;break}}else f=i*2.0/3.141592653589793;while(0);c[6588+(a<<2)>>2]=~~(+$d(f*13.75/1200.0)*256.0);a=a+1|0}while((a|0)!=256);a=0;do{f=+(a|0)*6.283185307179586*.00390625;do if(!(f<=1.5707963267948966)){i=f*2.0/3.141592653589793;if(!(f<=4.71238898038469)){f=i+-4.0;break}else{f=2.0-i;break}}else f=f*2.0/3.141592653589793;while(0);c[7612+(a<<2)>>2]=~~((f+1.0)*13.0);a=a+1|0}while((a|0)!=256);a=0;do{q=~~(+P(10.0,+(+(a|0)*-.1875/20.0))*255.0);q=(a|0)>255?0:q;b[1087304+(a<<1)>>1]=q;b[1087304+(a+512<<1)>>1]=0-(q&65535);a=a+1|0}while((a|0)!=512);b[544676]=127;a=1;do{b[1089352+(a<<1)>>1]=~~(127.0-+Y(+(+(a|0)))*127.0/4.844187086458591);a=a+1|0}while((a|0)!=128);q=0;do{f=+h[8+(q<<3)>>3];p=0;do{n=~~(f-+(7-p|0)*6.0);k=(n|0)<1;l=~~(+(n|0)/.375)>>>0;m=~~(+(n>>1|0)/.375)>>>0;n=~~(+(n>>2|0)/.375)>>>0;o=0;do{a=o<<1;c[8764+(q<<13)+(p<<10)+(o<<4)>>2]=a;if(k){g=a;j=a}else{g=a+l|0;j=a+m|0;a=a+n|0}c[8764+(q<<13)+(p<<10)+(o<<4)+4>>2]=a;c[8764+(q<<13)+(p<<10)+(o<<4)+8>>2]=j;c[8764+(q<<13)+(p<<10)+(o<<4)+12>>2]=g;o=o+1|0}while((o|0)!=64);p=p+1|0}while((p|0)!=8);q=q+1|0}while((q|0)!=16);c[2159]=0;c[2160]=0;c[2161]=0;c[2162]=2;c[2163]=1;c[2164]=4;c[2165]=1;c[2166]=6;c[2167]=2;c[2168]=8;c[2169]=2;c[2170]=10;c[2171]=3;c[2172]=12;c[2173]=3;c[2174]=14;c[2175]=0;c[2176]=1;c[2177]=0;c[2178]=3;c[2179]=1;c[2180]=5;c[2181]=1;c[2182]=7;c[2183]=2;c[2184]=9;c[2185]=2;c[2186]=11;c[2187]=3;c[2188]=13;c[2189]=3;c[2190]=15;g=0;do{f=+R(+(+(g|0)*6.283185307179586*.001953125));if(f==0.0)a=255;else{a=0-~~(+ce(f)*20.0/.1875)|0;a=(a|0)<255?a:255}b[1089608+(g<<1)>>1]=a;g=g+1|0}while((g|0)!=128);a=0;do{b[1089608+(255-a<<1)>>1]=b[1089608+(a<<1)>>1]|0;a=a+1|0}while((a|0)!=128);a=0;do{b[1089608+(a+256<<1)>>1]=(e[1089608+(a<<1)>>1]|0)+512;a=a+1|0}while((a|0)!=256);ef(1090632,1089608,512)|0;a=b[544804]|0;g=256;do{b[1090632+(g<<1)>>1]=a;g=g+1|0}while((g|0)!=512);a=0;do{Lc(1213120+(a<<4)|0,139836+((a<<1)*52|0)|0);a=a+1|0}while((a|0)!=19);a=0;do{Lc(1213424+(a<<4)|0,141812+((a<<1)*52|0)|0);a=a+1|0}while((a|0)!=19);a=0;do{Lc(1213728+(a<<4)|0,143788+((a<<1)*52|0)|0);a=a+1|0}while((a|0)!=19)}if((c[36441]|0)!=(d|0)){c[36441]=d;Vc()}a=We(3696,1)|0;if(!a){d=0;return d|0}j=a+1708|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+1760|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+1812|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+1864|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+1916|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+1968|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+2020|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+2072|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+2124|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+2176|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+2228|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+2280|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+2332|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+2384|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+2436|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+2488|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+2540|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+2592|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+2644|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+2696|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+2748|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+2800|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+2852|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+2904|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+2956|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+3008|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+3060|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+3112|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+3164|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+3216|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+3268|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+3320|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+3372|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+3424|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+3476|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+3528|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+3580|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));j=a+3632|0;k=145768;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));c[a+3692>>2]=0;Nc(a);g=0;do{j=a+1708+(g*52|0)|0;k=139836+(g*52|0)|0;l=j+52|0;do{c[j>>2]=c[k>>2];j=j+4|0;k=k+4|0}while((j|0)<(l|0));g=g+1|0}while((g|0)!=38);return a|0}function Nc(a){a=a|0;var b=0,d=0;if(!a)return;c[a>>2]=0;c[a+4>>2]=0;c[a+244>>2]=0;c[a+252>>2]=0;c[a+264>>2]=65535;c[a+3692>>2]=0;b=0;do{c[a+340+(b*76|0)+4>>2]=(b|0)%2|0;c[a+340+(b*76|0)+20>>2]=1089608;c[a+340+(b*76|0)+24>>2]=0;c[a+340+(b*76|0)+28>>2]=0;c[a+340+(b*76|0)+12>>2]=0;c[a+340+(b*76|0)+16>>2]=0;c[a+340+(b*76|0)+8>>2]=0;c[a+340+(b*76|0)+60>>2]=7;c[a+340+(b*76|0)+64>>2]=4194304;c[a+340+(b*76|0)+68>>2]=0;d=a+340+(b*76|0)+32|0;c[a+340+(b*76|0)+72>>2]=0;c[d>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+16>>2]=0;c[d+20>>2]=0;c[d+24>>2]=0;c[a+340+(b*76|0)>>2]=145768;b=b+1|0}while((b|0)!=18);d=a+1708|0;b=a+1760|0;c[a+304>>2]=0;c[a+268>>2]=0;c[a+340>>2]=d;c[a+416>>2]=b;c[a+308>>2]=0;c[a+272>>2]=0;c[a+492>>2]=d;c[a+568>>2]=b;c[a+312>>2]=0;c[a+276>>2]=0;c[a+644>>2]=d;c[a+720>>2]=b;c[a+316>>2]=0;c[a+280>>2]=0;c[a+796>>2]=d;c[a+872>>2]=b;c[a+320>>2]=0;c[a+284>>2]=0;c[a+948>>2]=d;c[a+1024>>2]=b;c[a+324>>2]=0;c[a+288>>2]=0;c[a+1100>>2]=d;c[a+1176>>2]=b;c[a+328>>2]=0;c[a+292>>2]=0;c[a+1252>>2]=d;c[a+1328>>2]=b;c[a+332>>2]=0;c[a+296>>2]=0;c[a+1404>>2]=d;c[a+1480>>2]=b;c[a+336>>2]=0;c[a+300>>2]=0;c[a+1556>>2]=d;c[a+1632>>2]=b;b=0;do{Qc(a,b,0);b=b+1|0}while((b|0)!=64);c[a+8>>2]=2147483648/((c[36441]|0)>>>0)|0;c[a+16>>2]=2147483648/((((c[1646]|0)>>>0)/72|0)>>>0)|0;c[a+12>>2]=0;c[a+44>>2]=2;c[a+48>>2]=2;c[a+52>>2]=2;c[a+56>>2]=2;c[a+60>>2]=2;c[a+64>>2]=2;c[a+68>>2]=2;c[a+72>>2]=2;c[a+76>>2]=2;c[a+80>>2]=2;c[a+84>>2]=2;c[a+88>>2]=2;c[a+92>>2]=2;c[a+96>>2]=2;d=a+28|0;c[d>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;return}function Oc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;b=(b|0)%3|0;d=0;do{e=a+1708+(d*52|0)|0;f=139836+(b*1976|0)+(d*52|0)|0;g=e+52|0;do{c[e>>2]=c[f>>2];e=e+4|0;f=f+4|0}while((e|0)<(g|0));d=d+1|0}while((d|0)!=38);return}function Pc(a){a=a|0;Ve(a);return}function Qc(b,f,g){b=b|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;h=g&255;i=f&63;a[b+108+i>>0]=g;do switch(i|0){case 0:{c[b+1748>>2]=g>>>7&1;c[b+1752>>2]=g>>>6&1;c[b+1716>>2]=g>>>5&1;c[b+1740>>2]=g>>>4&1;c[b+1720>>2]=g&15;j=0;do{if(!(c[b+268+(j<<2)>>2]|0)){i=j<<1;f=c[b+340+(i*76|0)>>2]|0;h=c[b+340+(i*76|0)+40>>2]|0;g=c[b+340+(i*76|0)+36>>2]|0;c[b+340+(i*76|0)+28>>2]=c[145820+(g<<9)+(h<<6)+(c[f+12>>2]<<2)>>2];h=c[8636+(g>>8<<6)+(h<<3)+(c[f+32>>2]<<2)>>2]|0;c[b+340+(i*76|0)+56>>2]=h;a:do switch(c[b+340+(i*76|0)+60>>2]|0){case 1:{f=c[407964+(c[f+16>>2]<<6)+(h<<2)>>2]|0;break}case 2:{f=c[408988+(c[f+20>>2]<<6)+(h<<2)>>2]|0;break}case 6:{f=c[102487]|0;break}case 4:{f=c[408988+(c[f+28>>2]<<6)+(h<<2)>>2]|0;break}case 5:{if(c[b+340+(i*76|0)+48>>2]|0){f=c[409308+(h<<2)>>2]|0;break a}if(!(c[f+8>>2]|0)){f=c[409436+(h<<2)>>2]|0;break a}else{f=c[408988+(c[f+28>>2]<<6)+(h<<2)>>2]|0;break a}}default:f=0}while(0);c[b+340+(i*76|0)+68>>2]=f}j=j+1|0}while((j|0)!=9);return}case 1:{c[b+1800>>2]=g>>>7&1;c[b+1804>>2]=g>>>6&1;c[b+1768>>2]=g>>>5&1;c[b+1792>>2]=g>>>4&1;c[b+1772>>2]=g&15;j=0;do{if(!(c[b+268+(j<<2)>>2]|0)){i=j<<1|1;h=c[b+340+(i*76|0)>>2]|0;f=c[b+340+(i*76|0)+40>>2]|0;g=c[b+340+(i*76|0)+36>>2]|0;c[b+340+(i*76|0)+28>>2]=c[145820+(g<<9)+(f<<6)+(c[h+12>>2]<<2)>>2];f=c[8636+(g>>8<<6)+(f<<3)+(c[h+32>>2]<<2)>>2]|0;c[b+340+(i*76|0)+56>>2]=f;b:do switch(c[b+340+(i*76|0)+60>>2]|0){case 1:{f=c[407964+(c[h+16>>2]<<6)+(f<<2)>>2]|0;break}case 2:{f=c[408988+(c[h+20>>2]<<6)+(f<<2)>>2]|0;break}case 6:{f=c[102487]|0;break}case 4:{f=c[408988+(c[h+28>>2]<<6)+(f<<2)>>2]|0;break}case 5:{if(c[b+340+(i*76|0)+48>>2]|0){f=c[409308+(f<<2)>>2]|0;break b}if(!(c[h+8>>2]|0)){f=c[409436+(f<<2)>>2]|0;break b}else{f=c[408988+(c[h+28>>2]<<6)+(f<<2)>>2]|0;break b}}default:f=0}while(0);c[b+340+(i*76|0)+68>>2]=f}j=j+1|0}while((j|0)!=9);return}case 2:{c[b+1744>>2]=g>>>6&3;c[b+1708>>2]=g&63;l=0;do{do if(!(c[b+268+(l<<2)>>2]|0)){f=l<<1;h=c[b+340+(f*76|0)>>2]|0;i=c[h+36>>2]|0;j=c[b+340+(f*76|0)+40>>2]|0;k=c[b+340+(f*76|0)+36>>2]|0;if(!(c[b+340+(f*76|0)+4>>2]|0)){c[b+340+(f*76|0)+52>>2]=c[8764+(k>>5<<13)+(j<<10)+(c[h>>2]<<4)+(i<<2)>>2];break}else{c[b+340+(f*76|0)+52>>2]=c[8764+(k>>5<<13)+(j<<10)+(c[b+340+(f*76|0)+44>>2]<<4)+(i<<2)>>2];break}}while(0);l=l+1|0}while((l|0)!=9);return}case 3:{c[b+1796>>2]=g>>>6&3;c[b+1808>>2]=g>>>4&1;c[b+1756>>2]=g>>>3&1;c[b+1712>>2]=g&7;f=0;do{if(!(c[b+268+(f<<2)>>2]|0)){g=f<<1;c[b+340+(g*76|0)+20>>2]=c[410012+(c[(c[b+340+(g*76|0)>>2]|0)+48>>2]<<2)>>2];g=g|1;c[b+340+(g*76|0)+20>>2]=c[410012+(c[(c[b+340+(g*76|0)>>2]|0)+48>>2]<<2)>>2]}f=f+1|0}while((f|0)!=9);return}case 4:{c[b+1724>>2]=g>>>4&15;c[b+1728>>2]=g&15;j=0;do{if(!(c[b+268+(j<<2)>>2]|0)){i=j<<1;f=b+340+(i*76|0)|0;c:do switch(c[b+340+(i*76|0)+60>>2]|0){case 1:{f=c[407964+(c[(c[f>>2]|0)+16>>2]<<6)+(c[b+340+(i*76|0)+56>>2]<<2)>>2]|0;break}case 2:{f=c[408988+(c[(c[f>>2]|0)+20>>2]<<6)+(c[b+340+(i*76|0)+56>>2]<<2)>>2]|0;break}case 6:{f=c[102487]|0;break}case 4:{f=c[408988+(c[(c[f>>2]|0)+28>>2]<<6)+(c[b+340+(i*76|0)+56>>2]<<2)>>2]|0;break}case 5:{if(c[b+340+(i*76|0)+48>>2]|0){f=c[409308+(c[b+340+(i*76|0)+56>>2]<<2)>>2]|0;break c}f=c[f>>2]|0;h=c[b+340+(i*76|0)+56>>2]|0;if(!(c[f+8>>2]|0)){f=c[409436+(h<<2)>>2]|0;break c}else{f=c[408988+(c[f+28>>2]<<6)+(h<<2)>>2]|0;break c}}default:f=0}while(0);c[b+340+(i*76|0)+68>>2]=f}j=j+1|0}while((j|0)!=9);return}case 5:{c[b+1776>>2]=g>>>4&15;c[b+1780>>2]=g&15;j=0;do{if(!(c[b+268+(j<<2)>>2]|0)){i=j<<1|1;f=b+340+(i*76|0)|0;d:do switch(c[b+340+(i*76|0)+60>>2]|0){case 1:{f=c[407964+(c[(c[f>>2]|0)+16>>2]<<6)+(c[b+340+(i*76|0)+56>>2]<<2)>>2]|0;break}case 2:{f=c[408988+(c[(c[f>>2]|0)+20>>2]<<6)+(c[b+340+(i*76|0)+56>>2]<<2)>>2]|0;break}case 6:{f=c[102487]|0;break}case 4:{f=c[408988+(c[(c[f>>2]|0)+28>>2]<<6)+(c[b+340+(i*76|0)+56>>2]<<2)>>2]|0;break}case 5:{if(c[b+340+(i*76|0)+48>>2]|0){f=c[409308+(c[b+340+(i*76|0)+56>>2]<<2)>>2]|0;break d}f=c[f>>2]|0;h=c[b+340+(i*76|0)+56>>2]|0;if(!(c[f+8>>2]|0)){f=c[409436+(h<<2)>>2]|0;break d}else{f=c[408988+(c[f+28>>2]<<6)+(h<<2)>>2]|0;break d}}default:f=0}while(0);c[b+340+(i*76|0)+68>>2]=f}j=j+1|0}while((j|0)!=9);return}case 6:{c[b+1732>>2]=g>>>4&15;c[b+1736>>2]=g&15;j=0;do{if(!(c[b+268+(j<<2)>>2]|0)){i=j<<1;f=b+340+(i*76|0)|0;e:do switch(c[b+340+(i*76|0)+60>>2]|0){case 1:{f=c[407964+(c[(c[f>>2]|0)+16>>2]<<6)+(c[b+340+(i*76|0)+56>>2]<<2)>>2]|0;break}case 2:{f=c[408988+(c[(c[f>>2]|0)+20>>2]<<6)+(c[b+340+(i*76|0)+56>>2]<<2)>>2]|0;break}case 6:{f=c[102487]|0;break}case 4:{f=c[408988+(c[(c[f>>2]|0)+28>>2]<<6)+(c[b+340+(i*76|0)+56>>2]<<2)>>2]|0;break}case 5:{if(c[b+340+(i*76|0)+48>>2]|0){f=c[409308+(c[b+340+(i*76|0)+56>>2]<<2)>>2]|0;break e}f=c[f>>2]|0;h=c[b+340+(i*76|0)+56>>2]|0;if(!(c[f+8>>2]|0)){f=c[409436+(h<<2)>>2]|0;break e}else{f=c[408988+(c[f+28>>2]<<6)+(h<<2)>>2]|0;break e}}default:f=0}while(0);c[b+340+(i*76|0)+68>>2]=f}j=j+1|0}while((j|0)!=9);return}case 7:{c[b+1784>>2]=g>>>4&15;c[b+1788>>2]=g&15;j=0;do{if(!(c[b+268+(j<<2)>>2]|0)){i=j<<1|1;f=b+340+(i*76|0)|0;f:do switch(c[b+340+(i*76|0)+60>>2]|0){case 1:{f=c[407964+(c[(c[f>>2]|0)+16>>2]<<6)+(c[b+340+(i*76|0)+56>>2]<<2)>>2]|0;break}case 2:{f=c[408988+(c[(c[f>>2]|0)+20>>2]<<6)+(c[b+340+(i*76|0)+56>>2]<<2)>>2]|0;break}case 6:{f=c[102487]|0;break}case 4:{f=c[408988+(c[(c[f>>2]|0)+28>>2]<<6)+(c[b+340+(i*76|0)+56>>2]<<2)>>2]|0;break}case 5:{if(c[b+340+(i*76|0)+48>>2]|0){f=c[409308+(c[b+340+(i*76|0)+56>>2]<<2)>>2]|0;break f}f=c[f>>2]|0;h=c[b+340+(i*76|0)+56>>2]|0;if(!(c[f+8>>2]|0)){f=c[409436+(h<<2)>>2]|0;break f}else{f=c[408988+(c[f+28>>2]<<6)+(h<<2)>>2]|0;break f}}default:f=0}while(0);c[b+340+(i*76|0)+68>>2]=f}j=j+1|0}while((j|0)!=9);return}case 14:{Wc(b);do if(g&32){if(!(g&16)){if(c[b+224>>2]|0){f=b+1388|0;if((c[f>>2]|0)==1){q=b+1392|0;c[q>>2]=(e[1089352+((c[q>>2]|0)>>>15<<1)>>1]|0)<<15}c[f>>2]=5;do if(!(c[b+1376>>2]|0)){f=c[b+1328>>2]|0;h=c[b+1384>>2]|0;if(!(c[f+8>>2]|0)){f=409436+(h<<2)|0;break}else{f=408988+(c[f+28>>2]<<6)+(h<<2)|0;break}}else f=409308+(c[b+1384>>2]<<2)|0;while(0);c[b+1396>>2]=c[f>>2]}c[b+328>>2]=0}else{if(!(c[b+220>>2]|0)){c[b+1312>>2]=1;c[b+1316>>2]=0;c[b+1276>>2]=0;c[b+1320>>2]=c[407964+(c[(c[b+1252>>2]|0)+16>>2]<<6)+(c[b+1308>>2]<<2)>>2]}if(!(c[b+224>>2]|0)){c[b+1388>>2]=1;c[b+1392>>2]=0;c[b+1352>>2]=0;c[b+1396>>2]=c[407964+(c[(c[b+1328>>2]|0)+16>>2]<<6)+(c[b+1384>>2]<<2)>>2]}c[b+328>>2]=1}f=(c[b+232>>2]|0)==0;if(!(g&8)){if(!f){f=b+1540|0;if((c[f>>2]|0)==1){q=b+1544|0;c[q>>2]=(e[1089352+((c[q>>2]|0)>>>15<<1)>>1]|0)<<15}c[f>>2]=5;do if(!(c[b+1528>>2]|0)){f=c[b+1480>>2]|0;h=c[b+1536>>2]|0;if(!(c[f+8>>2]|0)){f=409436+(h<<2)|0;break}else{f=408988+(c[f+28>>2]<<6)+(h<<2)|0;break}}else f=409308+(c[b+1536>>2]<<2)|0;while(0);c[b+1548>>2]=c[f>>2]}}else if(f){c[b+1540>>2]=1;c[b+1544>>2]=0;c[b+1504>>2]=0;c[b+1548>>2]=c[407964+(c[(c[b+1480>>2]|0)+16>>2]<<6)+(c[b+1536>>2]<<2)>>2]}f=(c[b+236>>2]|0)==0;if(!(g&4)){if(!f){f=b+1616|0;if((c[f>>2]|0)==1){q=b+1620|0;c[q>>2]=(e[1089352+((c[q>>2]|0)>>>15<<1)>>1]|0)<<15}c[f>>2]=5;do if(!(c[b+1604>>2]|0)){f=c[b+1556>>2]|0;h=c[b+1612>>2]|0;if(!(c[f+8>>2]|0)){f=409436+(h<<2)|0;break}else{f=408988+(c[f+28>>2]<<6)+(h<<2)|0;break}}else f=409308+(c[b+1612>>2]<<2)|0;while(0);c[b+1624>>2]=c[f>>2]}}else if(f){c[b+1616>>2]=1;c[b+1620>>2]=0;c[b+1580>>2]=0;c[b+1624>>2]=c[407964+(c[(c[b+1556>>2]|0)+16>>2]<<6)+(c[b+1612>>2]<<2)>>2]}f=(c[b+240>>2]|0)==0;if(!(g&2)){if(!f){f=b+1692|0;if((c[f>>2]|0)==1){q=b+1696|0;c[q>>2]=(e[1089352+((c[q>>2]|0)>>>15<<1)>>1]|0)<<15}c[f>>2]=5;do if(!(c[b+1680>>2]|0)){f=c[b+1632>>2]|0;h=c[b+1688>>2]|0;if(!(c[f+8>>2]|0)){f=409436+(h<<2)|0;break}else{f=408988+(c[f+28>>2]<<6)+(h<<2)|0;break}}else f=409308+(c[b+1688>>2]<<2)|0;while(0);c[b+1700>>2]=c[f>>2]}}else if(f){c[b+1692>>2]=1;c[b+1696>>2]=0;c[b+1700>>2]=c[407964+(c[(c[b+1632>>2]|0)+16>>2]<<6)+(c[b+1688>>2]<<2)>>2]}f=(c[b+228>>2]|0)==0;if(g&1){if(!f)break;c[b+1464>>2]=1;c[b+1468>>2]=0;c[b+1472>>2]=c[407964+(c[(c[b+1404>>2]|0)+16>>2]<<6)+(c[b+1460>>2]<<2)>>2];break}if(!f){f=b+1464|0;if((c[f>>2]|0)==1){g=b+1468|0;c[g>>2]=(e[1089352+((c[g>>2]|0)>>>15<<1)>>1]|0)<<15}c[f>>2]=5;do if(!(c[b+1452>>2]|0)){f=c[b+1404>>2]|0;h=c[b+1460>>2]|0;if(!(c[f+8>>2]|0)){f=409436+(h<<2)|0;break}else{f=408988+(c[f+28>>2]<<6)+(h<<2)|0;break}}else f=409308+(c[b+1460>>2]<<2)|0;while(0);c[b+1472>>2]=c[f>>2]}}while(0);Xc(b);j=c[b+1252>>2]|0;h=c[b+1292>>2]|0;i=c[b+1288>>2]|0;c[b+1280>>2]=c[145820+(i<<9)+(h<<6)+(c[j+12>>2]<<2)>>2];f=c[j+36>>2]|0;if(!(c[b+1256>>2]|0))f=8764+(i>>5<<13)+(h<<10)+(c[j>>2]<<4)+(f<<2)|0;else f=8764+(i>>5<<13)+(h<<10)+(c[b+1296>>2]<<4)+(f<<2)|0;c[b+1304>>2]=c[f>>2];f=c[8636+(i>>8<<6)+(h<<3)+(c[j+32>>2]<<2)>>2]|0;c[b+1308>>2]=f;c[b+1272>>2]=c[410012+(c[j+48>>2]<<2)>>2];g:do switch(c[b+1312>>2]|0){case 1:{f=c[407964+(c[j+16>>2]<<6)+(f<<2)>>2]|0;break}case 2:{f=c[408988+(c[j+20>>2]<<6)+(f<<2)>>2]|0;break}case 6:{f=c[102487]|0;break}case 4:{f=c[408988+(c[j+28>>2]<<6)+(f<<2)>>2]|0;break}case 5:{if(c[b+1300>>2]|0){f=c[409308+(f<<2)>>2]|0;break g}if(!(c[j+8>>2]|0)){f=c[409436+(f<<2)>>2]|0;break g}else{f=c[408988+(c[j+28>>2]<<6)+(f<<2)>>2]|0;break g}}default:f=0}while(0);c[b+1320>>2]=f;j=c[b+1328>>2]|0;h=c[b+1368>>2]|0;i=c[b+1364>>2]|0;c[b+1356>>2]=c[145820+(i<<9)+(h<<6)+(c[j+12>>2]<<2)>>2];f=c[j+36>>2]|0;if(!(c[b+1332>>2]|0))f=8764+(i>>5<<13)+(h<<10)+(c[j>>2]<<4)+(f<<2)|0;else f=8764+(i>>5<<13)+(h<<10)+(c[b+1372>>2]<<4)+(f<<2)|0;c[b+1380>>2]=c[f>>2];f=c[8636+(i>>8<<6)+(h<<3)+(c[j+32>>2]<<2)>>2]|0;c[b+1384>>2]=f;c[b+1348>>2]=c[410012+(c[j+48>>2]<<2)>>2];h:do switch(c[b+1388>>2]|0){case 1:{f=c[407964+(c[j+16>>2]<<6)+(f<<2)>>2]|0;break}case 2:{f=c[408988+(c[j+20>>2]<<6)+(f<<2)>>2]|0;break}case 6:{f=c[102487]|0;break}case 4:{f=c[408988+(c[j+28>>2]<<6)+(f<<2)>>2]|0;break}case 5:{if(c[b+1376>>2]|0){f=c[409308+(f<<2)>>2]|0;break h}if(!(c[j+8>>2]|0)){f=c[409436+(f<<2)>>2]|0;break h}else{f=c[408988+(c[j+28>>2]<<6)+(f<<2)>>2]|0;break h}}default:f=0}while(0);c[b+1396>>2]=f;j=c[b+1404>>2]|0;h=c[b+1444>>2]|0;i=c[b+1440>>2]|0;c[b+1432>>2]=c[145820+(i<<9)+(h<<6)+(c[j+12>>2]<<2)>>2];f=c[j+36>>2]|0;if(!(c[b+1408>>2]|0))f=8764+(i>>5<<13)+(h<<10)+(c[j>>2]<<4)+(f<<2)|0;else f=8764+(i>>5<<13)+(h<<10)+(c[b+1448>>2]<<4)+(f<<2)|0;c[b+1456>>2]=c[f>>2];f=c[8636+(i>>8<<6)+(h<<3)+(c[j+32>>2]<<2)>>2]|0;c[b+1460>>2]=f;c[b+1424>>2]=c[410012+(c[j+48>>2]<<2)>>2];i:do switch(c[b+1464>>2]|0){case 1:{f=c[407964+(c[j+16>>2]<<6)+(f<<2)>>2]|0;break}case 2:{f=c[408988+(c[j+20>>2]<<6)+(f<<2)>>2]|0;break}case 6:{f=c[102487]|0;break}case 4:{f=c[408988+(c[j+28>>2]<<6)+(f<<2)>>2]|0;break}case 5:{if(c[b+1452>>2]|0){f=c[409308+(f<<2)>>2]|0;break i}if(!(c[j+8>>2]|0)){f=c[409436+(f<<2)>>2]|0;break i}else{f=c[408988+(c[j+28>>2]<<6)+(f<<2)>>2]|0;break i}}default:f=0}while(0);c[b+1472>>2]=f;j=c[b+1480>>2]|0;h=c[b+1520>>2]|0;i=c[b+1516>>2]|0;c[b+1508>>2]=c[145820+(i<<9)+(h<<6)+(c[j+12>>2]<<2)>>2];f=c[j+36>>2]|0;if(!(c[b+1484>>2]|0))f=8764+(i>>5<<13)+(h<<10)+(c[j>>2]<<4)+(f<<2)|0;else f=8764+(i>>5<<13)+(h<<10)+(c[b+1524>>2]<<4)+(f<<2)|0;c[b+1532>>2]=c[f>>2];f=c[8636+(i>>8<<6)+(h<<3)+(c[j+32>>2]<<2)>>2]|0;c[b+1536>>2]=f;c[b+1500>>2]=c[410012+(c[j+48>>2]<<2)>>2];j:do switch(c[b+1540>>2]|0){case 1:{f=c[407964+(c[j+16>>2]<<6)+(f<<2)>>2]|0;break}case 2:{f=c[408988+(c[j+20>>2]<<6)+(f<<2)>>2]|0;break}case 6:{f=c[102487]|0;break}case 4:{f=c[408988+(c[j+28>>2]<<6)+(f<<2)>>2]|0;break}case 5:{if(c[b+1528>>2]|0){f=c[409308+(f<<2)>>2]|0;break j}if(!(c[j+8>>2]|0)){f=c[409436+(f<<2)>>2]|0;break j}else{f=c[408988+(c[j+28>>2]<<6)+(f<<2)>>2]|0;break j}}default:f=0}while(0);c[b+1548>>2]=f;j=c[b+1556>>2]|0;h=c[b+1596>>2]|0;i=c[b+1592>>2]|0;c[b+1584>>2]=c[145820+(i<<9)+(h<<6)+(c[j+12>>2]<<2)>>2];f=c[j+36>>2]|0;if(!(c[b+1560>>2]|0))f=8764+(i>>5<<13)+(h<<10)+(c[j>>2]<<4)+(f<<2)|0;else f=8764+(i>>5<<13)+(h<<10)+(c[b+1600>>2]<<4)+(f<<2)|0;c[b+1608>>2]=c[f>>2];f=c[8636+(i>>8<<6)+(h<<3)+(c[j+32>>2]<<2)>>2]|0;c[b+1612>>2]=f;c[b+1576>>2]=c[410012+(c[j+48>>2]<<2)>>2];k:do switch(c[b+1616>>2]|0){case 1:{f=c[407964+(c[j+16>>2]<<6)+(f<<2)>>2]|0;break}case 2:{f=c[408988+(c[j+20>>2]<<6)+(f<<2)>>2]|0;break}case 6:{f=c[102487]|0;break}case 4:{f=c[408988+(c[j+28>>2]<<6)+(f<<2)>>2]|0;break}case 5:{if(c[b+1604>>2]|0){f=c[409308+(f<<2)>>2]|0;break k}if(!(c[j+8>>2]|0)){f=c[409436+(f<<2)>>2]|0;break k}else{f=c[408988+(c[j+28>>2]<<6)+(f<<2)>>2]|0;break k}}default:f=0}while(0);c[b+1624>>2]=f;j=c[b+1632>>2]|0;h=c[b+1672>>2]|0;i=c[b+1668>>2]|0;c[b+1660>>2]=c[145820+(i<<9)+(h<<6)+(c[j+12>>2]<<2)>>2];f=c[j+36>>2]|0;if(!(c[b+1636>>2]|0))f=8764+(i>>5<<13)+(h<<10)+(c[j>>2]<<4)+(f<<2)|0;else f=8764+(i>>5<<13)+(h<<10)+(c[b+1676>>2]<<4)+(f<<2)|0;c[b+1684>>2]=c[f>>2];f=c[8636+(i>>8<<6)+(h<<3)+(c[j+32>>2]<<2)>>2]|0;c[b+1688>>2]=f;c[b+1652>>2]=c[410012+(c[j+48>>2]<<2)>>2];l:do switch(c[b+1692>>2]|0){case 1:{f=c[407964+(c[j+16>>2]<<6)+(f<<2)>>2]|0;break}case 2:{f=c[408988+(c[j+20>>2]<<6)+(f<<2)>>2]|0;break}case 6:{f=c[102487]|0;break}case 4:{f=c[408988+(c[j+28>>2]<<6)+(f<<2)>>2]|0;break}case 5:{if(c[b+1680>>2]|0){f=c[409308+(f<<2)>>2]|0;break l}if(!(c[j+8>>2]|0)){f=c[409436+(f<<2)>>2]|0;break l}else{f=c[408988+(c[j+28>>2]<<6)+(f<<2)>>2]|0;break l}}default:f=0}while(0);c[b+1700>>2]=f;return}case 55:case 54:case 53:case 52:case 51:case 50:case 49:case 48:case 56:{f=g>>>4&15;m:do if(i>>>0>53&(a[b+122>>0]&32)!=0)switch(i|0){case 55:{c[b+1448>>2]=f<<2;break m}case 56:{c[b+1600>>2]=f<<2;break m}default:break m}else{q=i+-48|0;c[b+268+(q<<2)>>2]=f;p=f<<1;q=q<<1;c[b+340+(q*76|0)>>2]=b+1708+(p*52|0);c[b+340+((q|1)*76|0)>>2]=b+1708+((p|1)*52|0)}while(0);l=g<<2&60;k=(i<<1)+-96|0;m=k|1;c[b+340+(m*76|0)+44>>2]=l;j=c[b+340+(k*76|0)>>2]|0;h=c[b+340+(k*76|0)+40>>2]|0;i=c[b+340+(k*76|0)+36>>2]|0;c[b+340+(k*76|0)+28>>2]=c[145820+(i<<9)+(h<<6)+(c[j+12>>2]<<2)>>2];f=c[j+36>>2]|0;if(!(c[b+340+(k*76|0)+4>>2]|0))f=8764+(i>>5<<13)+(h<<10)+(c[j>>2]<<4)+(f<<2)|0;else f=8764+(i>>5<<13)+(h<<10)+(c[b+340+(k*76|0)+44>>2]<<4)+(f<<2)|0;c[b+340+(k*76|0)+52>>2]=c[f>>2];f=c[8636+(i>>8<<6)+(h<<3)+(c[j+32>>2]<<2)>>2]|0;c[b+340+(k*76|0)+56>>2]=f;c[b+340+(k*76|0)+20>>2]=c[410012+(c[j+48>>2]<<2)>>2];n:do switch(c[b+340+(k*76|0)+60>>2]|0){case 1:{f=c[407964+(c[j+16>>2]<<6)+(f<<2)>>2]|0;break}case 2:{f=c[408988+(c[j+20>>2]<<6)+(f<<2)>>2]|0;break}case 6:{f=c[102487]|0;break}case 4:{f=c[408988+(c[j+28>>2]<<6)+(f<<2)>>2]|0;break}case 5:{if(c[b+340+(k*76|0)+48>>2]|0){f=c[409308+(f<<2)>>2]|0;break n}if(!(c[j+8>>2]|0)){f=c[409436+(f<<2)>>2]|0;break n}else{f=c[408988+(c[j+28>>2]<<6)+(f<<2)>>2]|0;break n}}default:f=0}while(0);c[b+340+(k*76|0)+68>>2]=f;j=c[b+340+(m*76|0)>>2]|0;h=c[b+340+(m*76|0)+40>>2]|0;i=c[b+340+(m*76|0)+36>>2]|0;c[b+340+(m*76|0)+28>>2]=c[145820+(i<<9)+(h<<6)+(c[j+12>>2]<<2)>>2];f=c[j+36>>2]|0;if(!(c[b+340+(m*76|0)+4>>2]|0))f=8764+(i>>5<<13)+(h<<10)+(c[j>>2]<<4)+(f<<2)|0;else f=8764+(i>>5<<13)+(h<<10)+(l<<4)+(f<<2)|0;c[b+340+(m*76|0)+52>>2]=c[f>>2];f=c[8636+(i>>8<<6)+(h<<3)+(c[j+32>>2]<<2)>>2]|0;c[b+340+(m*76|0)+56>>2]=f;c[b+340+(m*76|0)+20>>2]=c[410012+(c[j+48>>2]<<2)>>2];o:do switch(c[b+340+(m*76|0)+60>>2]|0){case 1:{f=c[407964+(c[j+16>>2]<<6)+(f<<2)>>2]|0;break}case 2:{f=c[408988+(c[j+20>>2]<<6)+(f<<2)>>2]|0;break}case 6:{f=c[102487]|0;break}case 4:{f=c[408988+(c[j+28>>2]<<6)+(f<<2)>>2]|0;break}case 5:{if(c[b+340+(m*76|0)+48>>2]|0){f=c[409308+(f<<2)>>2]|0;break o}if(!(c[j+8>>2]|0)){f=c[409436+(f<<2)>>2]|0;break o}else{f=c[408988+(c[j+28>>2]<<6)+(f<<2)>>2]|0;break o}}default:f=0}while(0);c[b+340+(m*76|0)+68>>2]=f;return}case 24:case 23:case 22:case 21:case 20:case 19:case 18:case 17:case 16:{j=(d[i+16+(b+108)>>0]|0)<<8&256;l=j|h;k=(i<<1)+-32|0;m=k|1;c[b+340+(m*76|0)+36>>2]=l;c[b+340+(k*76|0)+36>>2]=l;i=c[b+340+(k*76|0)>>2]|0;h=c[b+340+(k*76|0)+40>>2]|0;c[b+340+(k*76|0)+28>>2]=c[145820+(l<<9)+(h<<6)+(c[i+12>>2]<<2)>>2];f=c[i+36>>2]|0;if(!(c[b+340+(k*76|0)+4>>2]|0))f=8764+(l>>>5<<13)+(h<<10)+(c[i>>2]<<4)+(f<<2)|0;else f=8764+(l>>>5<<13)+(h<<10)+(c[b+340+(k*76|0)+44>>2]<<4)+(f<<2)|0;c[b+340+(k*76|0)+52>>2]=c[f>>2];j=j>>>8;f=c[8636+(j<<6)+(h<<3)+(c[i+32>>2]<<2)>>2]|0;c[b+340+(k*76|0)+56>>2]=f;c[b+340+(k*76|0)+20>>2]=c[410012+(c[i+48>>2]<<2)>>2];p:do switch(c[b+340+(k*76|0)+60>>2]|0){case 1:{f=c[407964+(c[i+16>>2]<<6)+(f<<2)>>2]|0;break}case 2:{f=c[408988+(c[i+20>>2]<<6)+(f<<2)>>2]|0;break}case 6:{f=c[102487]|0;break}case 4:{f=c[408988+(c[i+28>>2]<<6)+(f<<2)>>2]|0;break}case 5:{if(c[b+340+(k*76|0)+48>>2]|0){f=c[409308+(f<<2)>>2]|0;break p}if(!(c[i+8>>2]|0)){f=c[409436+(f<<2)>>2]|0;break p}else{f=c[408988+(c[i+28>>2]<<6)+(f<<2)>>2]|0;break p}}default:f=0}while(0);c[b+340+(k*76|0)+68>>2]=f;i=c[b+340+(m*76|0)>>2]|0;h=c[b+340+(m*76|0)+40>>2]|0;c[b+340+(m*76|0)+28>>2]=c[145820+(l<<9)+(h<<6)+(c[i+12>>2]<<2)>>2];f=c[i+36>>2]|0;if(!(c[b+340+(m*76|0)+4>>2]|0))f=8764+(l>>>5<<13)+(h<<10)+(c[i>>2]<<4)+(f<<2)|0;else f=8764+(l>>>5<<13)+(h<<10)+(c[b+340+(m*76|0)+44>>2]<<4)+(f<<2)|0;c[b+340+(m*76|0)+52>>2]=c[f>>2];f=c[8636+(j<<6)+(h<<3)+(c[i+32>>2]<<2)>>2]|0;c[b+340+(m*76|0)+56>>2]=f;c[b+340+(m*76|0)+20>>2]=c[410012+(c[i+48>>2]<<2)>>2];q:do switch(c[b+340+(m*76|0)+60>>2]|0){case 1:{f=c[407964+(c[i+16>>2]<<6)+(f<<2)>>2]|0;break}case 2:{f=c[408988+(c[i+20>>2]<<6)+(f<<2)>>2]|0;break}case 6:{f=c[102487]|0;break}case 4:{f=c[408988+(c[i+28>>2]<<6)+(f<<2)>>2]|0;break}case 5:{if(c[b+340+(m*76|0)+48>>2]|0){f=c[409308+(f<<2)>>2]|0;break q}if(!(c[i+8>>2]|0)){f=c[409436+(f<<2)>>2]|0;break q}else{f=c[408988+(c[i+28>>2]<<6)+(f<<2)>>2]|0;break q}}default:f=0}while(0);c[b+340+(m*76|0)+68>>2]=f;return}case 40:case 39:case 38:case 37:case 36:case 35:case 34:case 33:case 32:{j=i+-32|0;h=d[i+-16+(b+108)>>0]|0|g<<8&256;m=j<<1;q=m|1;o=b+340+(q*76|0)+36|0;c[o>>2]=h;k=b+340+(m*76|0)+36|0;c[k>>2]=h;h=g>>>1&7;n=b+340+(q*76|0)+40|0;c[n>>2]=h;i=b+340+(m*76|0)+40|0;c[i>>2]=h;h=g>>>5&1;p=b+340+(q*76|0)+48|0;c[p>>2]=h;l=b+340+(m*76|0)+4|0;if(c[l>>2]|0)c[b+340+(m*76|0)+48>>2]=h;if(!(g&16)){if(c[b+172+(q<<2)>>2]|0){f=b+340+(q*76|0)+60|0;if((c[f>>2]|0)==1){g=b+340+(q*76|0)+64|0;c[g>>2]=(e[1089352+((c[g>>2]|0)>>>15<<1)>>1]|0)<<15}c[f>>2]=5;do if(!h){f=c[b+340+(q*76|0)>>2]|0;h=c[b+340+(q*76|0)+56>>2]|0;if(!(c[f+8>>2]|0)){f=409436+(h<<2)|0;break}else{f=408988+(c[f+28>>2]<<6)+(h<<2)|0;break}}else f=409308+(c[b+340+(q*76|0)+56>>2]<<2)|0;while(0);c[b+340+(q*76|0)+68>>2]=c[f>>2]}c[b+304+(j<<2)>>2]=0}else{if(!(c[b+172+(m<<2)>>2]|0)){c[b+340+(m*76|0)+60>>2]=1;c[b+340+(m*76|0)+64>>2]=0;c[b+340+(m*76|0)+24>>2]=0;c[b+340+(m*76|0)+68>>2]=c[407964+(c[(c[b+340+(m*76|0)>>2]|0)+16>>2]<<6)+(c[b+340+(m*76|0)+56>>2]<<2)>>2]}if(!(c[b+172+(q<<2)>>2]|0)){c[b+340+(q*76|0)+60>>2]=1;c[b+340+(q*76|0)+64>>2]=0;c[b+340+(q*76|0)+24>>2]=0;c[b+340+(q*76|0)+68>>2]=c[407964+(c[(c[b+340+(q*76|0)>>2]|0)+16>>2]<<6)+(c[b+340+(q*76|0)+56>>2]<<2)>>2]}c[b+304+(j<<2)>>2]=1}j=c[b+340+(m*76|0)>>2]|0;i=c[i>>2]|0;h=c[k>>2]|0;c[b+340+(m*76|0)+28>>2]=c[145820+(h<<9)+(i<<6)+(c[j+12>>2]<<2)>>2];f=c[j+36>>2]|0;if(!(c[l>>2]|0))f=8764+(h>>5<<13)+(i<<10)+(c[j>>2]<<4)+(f<<2)|0;else f=8764+(h>>5<<13)+(i<<10)+(c[b+340+(m*76|0)+44>>2]<<4)+(f<<2)|0;c[b+340+(m*76|0)+52>>2]=c[f>>2];f=c[8636+(h>>8<<6)+(i<<3)+(c[j+32>>2]<<2)>>2]|0;c[b+340+(m*76|0)+56>>2]=f;c[b+340+(m*76|0)+20>>2]=c[410012+(c[j+48>>2]<<2)>>2];r:do switch(c[b+340+(m*76|0)+60>>2]|0){case 1:{f=c[407964+(c[j+16>>2]<<6)+(f<<2)>>2]|0;break}case 2:{f=c[408988+(c[j+20>>2]<<6)+(f<<2)>>2]|0;break}case 6:{f=c[102487]|0;break}case 4:{f=c[408988+(c[j+28>>2]<<6)+(f<<2)>>2]|0;break}case 5:{if(c[b+340+(m*76|0)+48>>2]|0){f=c[409308+(f<<2)>>2]|0;break r}if(!(c[j+8>>2]|0)){f=c[409436+(f<<2)>>2]|0;break r}else{f=c[408988+(c[j+28>>2]<<6)+(f<<2)>>2]|0;break r}}default:f=0}while(0);c[b+340+(m*76|0)+68>>2]=f;j=c[b+340+(q*76|0)>>2]|0;i=c[n>>2]|0;h=c[o>>2]|0;c[b+340+(q*76|0)+28>>2]=c[145820+(h<<9)+(i<<6)+(c[j+12>>2]<<2)>>2];f=c[j+36>>2]|0;if(!(c[b+340+(q*76|0)+4>>2]|0))f=8764+(h>>5<<13)+(i<<10)+(c[j>>2]<<4)+(f<<2)|0;else f=8764+(h>>5<<13)+(i<<10)+(c[b+340+(q*76|0)+44>>2]<<4)+(f<<2)|0;c[b+340+(q*76|0)+52>>2]=c[f>>2];f=c[8636+(h>>8<<6)+(i<<3)+(c[j+32>>2]<<2)>>2]|0;c[b+340+(q*76|0)+56>>2]=f;c[b+340+(q*76|0)+20>>2]=c[410012+(c[j+48>>2]<<2)>>2];s:do switch(c[b+340+(q*76|0)+60>>2]|0){case 1:{f=c[407964+(c[j+16>>2]<<6)+(f<<2)>>2]|0;break}case 2:{f=c[408988+(c[j+20>>2]<<6)+(f<<2)>>2]|0;break}case 6:{f=c[102487]|0;break}case 4:{f=c[408988+(c[j+28>>2]<<6)+(f<<2)>>2]|0;break}case 5:{if(c[p>>2]|0){f=c[409308+(f<<2)>>2]|0;break s}if(!(c[j+8>>2]|0)){f=c[409436+(f<<2)>>2]|0;break s}else{f=c[408988+(c[j+28>>2]<<6)+(f<<2)>>2]|0;break s}}default:f=0}while(0);c[b+340+(q*76|0)+68>>2]=f;Xc(b);Wc(b);return}default:return}while(0)}function Rc(a,b){a=a|0;b=b|0;c[a+260>>2]=b;a=c[36441]|0;c[36441]=(b|0)==0?a:49716;Vc();c[36441]=a;return}function Sc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;if(!(c[a+260>>2]|0)){a=Yc(a)|0;return a|0}i=a+8|0;b=c[i>>2]|0;j=a+12|0;d=c[j>>2]|0;if(d>>>0<b>>>0){e=a+16|0;h=a+24|0;f=a+20|0;b=d;d=c[h>>2]|0;while(1){c[j>>2]=(c[e>>2]|0)+b;c[f>>2]=d;d=(Yc(a)|0)<<16>>16;c[h>>2]=d;b=c[i>>2]|0;g=c[j>>2]|0;if(g>>>0<b>>>0)b=g;else break}}else{g=d;f=a+20|0;e=a+16|0;d=c[a+24>>2]|0}i=g-b|0;c[j>>2]=i;j=c[e>>2]|0;j=~~((+(d|0)*+((j-i|0)>>>0)+ +(i>>>0)*+(c[f>>2]|0))/+(j>>>0));c[a+4>>2]=j<<16>>16;a=j;return a|0}function Tc(a,b,d){a=a|0;b=b|0;d=d|0;if(!(b&1)){c[a>>2]=d;return}else{Qc(a,c[a>>2]|0,d);return}}function Uc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;if(!(c[a+260>>2]|0)){Zc(a,b);return}k=a+8|0;d=c[k>>2]|0;l=a+12|0;h=c[l>>2]|0;if(h>>>0<d>>>0){f=a+16|0;e=a+36|0;j=a+28|0;i=a+40|0;g=a+32|0;d=h;while(1){c[l>>2]=(c[f>>2]|0)+d;c[j>>2]=c[e>>2];c[g>>2]=c[i>>2];Zc(a,e);d=c[k>>2]|0;h=c[l>>2]|0;if(h>>>0<d>>>0)d=h;else break}}else{j=a+28|0;i=a+40|0;g=a+32|0;f=a+16|0;e=a+36|0}k=h-d|0;c[l>>2]=k;a=c[f>>2]|0;c[b>>2]=~~((+(c[e>>2]|0)*+((a-k|0)>>>0)+ +(k>>>0)*+(c[j>>2]|0))/+(a>>>0))<<16>>16;a=c[f>>2]|0;l=c[l>>2]|0;c[b+4>>2]=~~((+(c[i>>2]|0)*+((a-l|0)>>>0)+ +(l>>>0)*+(c[g>>2]|0))/+(a>>>0))<<16>>16;return}function Vc(){var a=0.0,b=0.0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0.0,u=0.0,v=0;q=c[36441]|0;s=(q|0)==49716;r=c[1646]|0;t=+(r>>>0);u=+(q>>>0);q=0;do{if(s){k=q<<1;l=q<<2;m=q*6|0;n=q<<3;o=q*10|0;d=q*12|0;e=q*14|0;f=q<<4;g=q*18|0;h=q*20|0;i=q*24|0;j=q*30|0;p=0;do{c[145820+(q<<9)+(p<<6)>>2]=q<<p>>>2;c[145820+(q<<9)+(p<<6)+4>>2]=k<<p>>>2;c[145820+(q<<9)+(p<<6)+8>>2]=l<<p>>>2;c[145820+(q<<9)+(p<<6)+12>>2]=m<<p>>>2;c[145820+(q<<9)+(p<<6)+16>>2]=n<<p>>>2;c[145820+(q<<9)+(p<<6)+20>>2]=o<<p>>>2;c[145820+(q<<9)+(p<<6)+24>>2]=d<<p>>>2;c[145820+(q<<9)+(p<<6)+28>>2]=e<<p>>>2;c[145820+(q<<9)+(p<<6)+32>>2]=f<<p>>>2;c[145820+(q<<9)+(p<<6)+36>>2]=g<<p>>>2;v=h<<p>>>2;c[145820+(q<<9)+(p<<6)+40>>2]=v;c[145820+(q<<9)+(p<<6)+44>>2]=v;v=i<<p>>>2;c[145820+(q<<9)+(p<<6)+48>>2]=v;c[145820+(q<<9)+(p<<6)+52>>2]=v;v=j<<p>>>2;c[145820+(q<<9)+(p<<6)+56>>2]=v;c[145820+(q<<9)+(p<<6)+60>>2]=v;p=p+1|0}while((p|0)!=8)}else{d=0;do{c[145820+(q<<9)+(d<<2)>>2]=~~(t*+((_(c[1086340+(d<<2)>>2]|0,q)|0)>>>2>>>0)/72.0/u+.5)>>>0;d=d+1|0}while((d|0)!=16);d=0;do{c[145820+(q<<9)+64+(d<<2)>>2]=~~(t*+(((_(c[1086340+(d<<2)>>2]|0,q)|0)>>>1&1073741823)>>>0)/72.0/u+.5)>>>0;d=d+1|0}while((d|0)!=16);d=0;do{c[145820+(q<<9)+128+(d<<2)>>2]=~~(t*+(((_(c[1086340+(d<<2)>>2]|0,q)|0)&1073741823)>>>0)/72.0/u+.5)>>>0;d=d+1|0}while((d|0)!=16);d=0;do{c[145820+(q<<9)+192+(d<<2)>>2]=~~(t*+(((_(c[1086340+(d<<2)>>2]|0,q)|0)<<1&1073741822)>>>0)/72.0/u+.5)>>>0;d=d+1|0}while((d|0)!=16);d=0;do{c[145820+(q<<9)+256+(d<<2)>>2]=~~(t*+(((_(c[1086340+(d<<2)>>2]|0,q)|0)<<2&1073741820)>>>0)/72.0/u+.5)>>>0;d=d+1|0}while((d|0)!=16);d=0;do{c[145820+(q<<9)+320+(d<<2)>>2]=~~(t*+(((_(c[1086340+(d<<2)>>2]|0,q)|0)<<3&1073741816)>>>0)/72.0/u+.5)>>>0;d=d+1|0}while((d|0)!=16);d=0;do{c[145820+(q<<9)+384+(d<<2)>>2]=~~(t*+(((_(c[1086340+(d<<2)>>2]|0,q)|0)<<4&1073741808)>>>0)/72.0/u+.5)>>>0;d=d+1|0}while((d|0)!=16);d=0;do{c[145820+(q<<9)+448+(d<<2)>>2]=~~(t*+(((_(c[1086340+(d<<2)>>2]|0,q)|0)<<5&1073741792)>>>0)/72.0/u+.5)>>>0;d=d+1|0}while((d|0)!=16)}q=q+1|0}while((q|0)!=512);e=0;while(1){if(!e){d=407964;e=d+64|0;do{c[d>>2]=0;d=d+4|0}while((d|0)<(e|0));e=1;continue}g=(e|0)==15;f=0;do{d=(f>>2)+e|0;if(g)c[408924+(f<<2)>>2]=0;else{d=(f&3|4)*3<<((d|0)>15?16:d+1|0);if(!s)d=~~(t*+(d|0)/72.0/u+.5)>>>0;c[407964+(e<<6)+(f<<2)>>2]=d}f=f+1|0}while((f|0)!=16);e=e+1|0;if((e|0)==16){e=0;break}}do{g=(e|0)==0;f=0;do{d=(f>>2)+e|0;if(g)c[408988+(f<<2)>>2]=0;else{d=(f&3|4)<<((d|0)>15?14:d+-1|0);if(!s)d=~~(t*+(d|0)/72.0/u+.5)>>>0;c[408988+(e<<6)+(f<<2)>>2]=d}f=f+1|0}while((f|0)!=16);e=e+1|0}while((e|0)!=16);a=+(((r>>>0)/72|0)>>>0);b=397727.2222222222/a;if(s){c[102505]=~~b>>>0;u=238636.2368/a;v=~~u>>>0;c[102506]=v;return}else{c[102505]=~~(t*b/72.0/u+.5)>>>0;u=+(~~(t*(238636.2368/a)/72.0/u+.5)>>>0>>>0);v=~~u>>>0;c[102506]=v;return}}function Wc(b){b=b|0;var e=0,f=0,g=0;f=b+292|0;if(!(c[f>>2]&16)){e=a[b+122>>0]|0;if(e&32){c[f>>2]=16;c[b+1312>>2]=7;c[b+1388>>2]=7;c[b+1252>>2]=b+3372;c[b+1328>>2]=b+3424}}else{e=a[b+122>>0]|0;if(!(e&32|c[b+224>>2])){c[b+1312>>2]=7;c[b+1388>>2]=7;g=(d[b+162>>0]|0)>>>4;c[f>>2]=g;g=g<<1;c[b+1252>>2]=b+1708+(g*52|0);c[b+1328>>2]=b+1708+((g|1)*52|0)}}f=b+296|0;if(!(c[f>>2]&16)){if(e&32){c[f>>2]=17;c[b+1408>>2]=1;c[b+1464>>2]=7;c[b+1540>>2]=7;c[b+1404>>2]=b+3476;c[b+1480>>2]=b+3528}}else{if(!(c[b+228>>2]|0))g=0;else g=(c[b+232>>2]|0)!=0;if(!(e&32|g&1)){c[b+1408>>2]=0;c[b+1464>>2]=7;c[b+1540>>2]=7;g=(d[b+163>>0]|0)>>>4;c[f>>2]=g;g=g<<1;c[b+1404>>2]=b+1708+(g*52|0);c[b+1480>>2]=b+1708+((g|1)*52|0)}}f=b+300|0;if(!(c[f>>2]&16)){if(!(e&32))return;c[f>>2]=18;c[b+1560>>2]=1;c[b+1616>>2]=7;c[b+1692>>2]=7;c[b+1556>>2]=b+3580;c[b+1632>>2]=b+3632;return}if(!(c[b+240>>2]|0))g=0;else g=(c[b+236>>2]|0)!=0;if(e&32|g&1)return;c[b+1560>>2]=0;c[b+1616>>2]=7;c[b+1692>>2]=7;g=(d[b+164>>0]|0)>>>4;c[f>>2]=g;g=g<<1;c[b+1556>>2]=b+1708+(g*52|0);c[b+1632>>2]=b+1708+((g|1)*52|0);return}function Xc(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;b=(d[a+140>>0]|0)&16;c[a+176>>2]=b;c[a+172>>2]=b;b=(d[a+141>>0]|0)&16;c[a+184>>2]=b;c[a+180>>2]=b;b=(d[a+142>>0]|0)&16;c[a+192>>2]=b;c[a+188>>2]=b;b=(d[a+143>>0]|0)&16;c[a+200>>2]=b;c[a+196>>2]=b;b=(d[a+144>>0]|0)&16;c[a+208>>2]=b;c[a+204>>2]=b;b=(d[a+145>>0]|0)&16;c[a+216>>2]=b;c[a+212>>2]=b;b=(d[a+146>>0]|0)&16;e=a+224|0;c[e>>2]=b;f=a+220|0;c[f>>2]=b;g=(d[a+147>>0]|0)&16;h=a+232|0;c[h>>2]=g;i=a+228|0;c[i>>2]=g;j=(d[a+148>>0]|0)&16;k=a+240|0;c[k>>2]=j;l=a+236|0;c[l>>2]=j;a=d[a+122>>0]|0;if(!(a&32))return;b=b|a&16;c[f>>2]=b;c[e>>2]=b;c[h>>2]=a&8|g;c[i>>2]=a&1|g;c[l>>2]=a&4|j;c[k>>2]=a&2|j;return}function Yc(a){a=a|0;var d=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;i=a+244|0;p=(c[102505]|0)+(c[i>>2]|0)&65535;c[i>>2]=p;i=a+252|0;j=(c[102506]|0)+(c[i>>2]|0)&65535;c[i>>2]=j;i=a+256|0;c[i>>2]=c[7612+(j>>>8<<2)>>2];j=a+248|0;c[j>>2]=c[6588+(p>>>8<<2)>>2];p=a+264|0;d=c[p>>2]|0;if(d&1){d=d^134230048;c[p>>2]=d}c[p>>2]=d>>>1;h=0;do{g=a+340+(h*76|0)|0;d=c[a+340+(h*76|0)+28>>2]|0;if(!(c[(c[g>>2]|0)+44>>2]|0)){m=a+340+(h*76|0)+24|0;f=(c[m>>2]|0)+d|0;c[m>>2]=f;d=m}else{f=(_(c[j>>2]|0,d)|0)>>>8;d=a+340+(h*76|0)+24|0;f=f+(c[d>>2]|0)|0;c[d>>2]=f}m=f&262143;c[d>>2]=m;c[a+340+(h*76|0)+32>>2]=m>>>9;_c(g,c[i>>2]|0);h=h+1|0}while((h|0)!=18);m=a+3692|0;l=0;d=0;do{if((c[m>>2]&1<<l|0)==0?(n=l<<1,o=n|1,(c[a+340+(o*76|0)+60>>2]|0)!=7):0){f=a+340+(n*76|0)+12|0;k=c[f>>2]|0;c[a+340+(n*76|0)+16>>2]=k;g=c[a+340+(n*76|0)+72>>2]|0;do if(g>>>0<=254){h=c[(c[a+340+(n*76|0)>>2]|0)+4>>2]|0;i=c[a+340+(n*76|0)+32>>2]|0;j=c[a+340+(n*76|0)+20>>2]|0;if(!h){j=b[1087304+((e[j+(i<<1)>>1]|0)+g<<1)>>1]|0;c[f>>2]=j;f=j;break}else{j=b[1087304+((e[j+(((c[a+340+(n*76|0)+8>>2]<<2>>7-h)+i&511)<<1)>>1]|0)+g<<1)>>1]|0;c[f>>2]=j;f=j;break}}else{c[f>>2]=0;f=0}while(0);f=f+k>>1;c[a+340+(n*76|0)+8>>2]=f;g=c[a+340+(o*76|0)+72>>2]|0;if(g>>>0>254)f=0;else f=b[1087304+((e[(c[a+340+(o*76|0)+20>>2]|0)+(((c[a+340+(o*76|0)+32>>2]|0)+(f<<3)&511)<<1)>>1]|0)+g<<1)>>1]|0;c[a+340+(o*76|0)+12>>2]=f;j=a+340+(o*76|0)+16|0;k=(c[j>>2]|0)+f>>1;c[j>>2]=k;d=k+d|0}l=l+1|0}while((l|0)!=6);l=d;m=c[m>>2]|0;if((c[a+292>>2]|0)<16)if((m&64|0)==0?(c[a+1388>>2]|0)!=7:0){d=a+1264|0;j=c[d>>2]|0;c[a+1268>>2]=j;f=c[a+1324>>2]|0;do if(f>>>0<=254){g=c[(c[a+1252>>2]|0)+4>>2]|0;h=c[a+1284>>2]|0;i=c[a+1272>>2]|0;if(!g){o=b[1087304+((e[i+(h<<1)>>1]|0)+f<<1)>>1]|0;c[d>>2]=o;d=o;break}else{o=b[1087304+((e[i+(((c[a+1260>>2]<<2>>7-g)+h&511)<<1)>>1]|0)+f<<1)>>1]|0;c[d>>2]=o;d=o;break}}else{c[d>>2]=0;d=0}while(0);d=d+j>>1;c[a+1260>>2]=d;f=c[a+1400>>2]|0;if(f>>>0>254)d=0;else d=b[1087304+((e[(c[a+1348>>2]|0)+(((c[a+1360>>2]|0)+(d<<3)&511)<<1)>>1]|0)+f<<1)>>1]|0;c[a+1340>>2]=d;o=a+1344|0;g=(c[o>>2]|0)+d>>1;c[o>>2]=g;l=g+l|0;g=0}else g=0;else if((m&8192|0)==0?(c[a+1388>>2]|0)!=7:0){d=a+1264|0;j=c[d>>2]|0;c[a+1268>>2]=j;f=c[a+1324>>2]|0;do if(f>>>0<=254){g=c[(c[a+1252>>2]|0)+4>>2]|0;h=c[a+1284>>2]|0;i=c[a+1272>>2]|0;if(!g){o=b[1087304+((e[i+(h<<1)>>1]|0)+f<<1)>>1]|0;c[d>>2]=o;d=o;break}else{o=b[1087304+((e[i+(((c[a+1260>>2]<<2>>7-g)+h&511)<<1)>>1]|0)+f<<1)>>1]|0;c[d>>2]=o;d=o;break}}else{c[d>>2]=0;d=0}while(0);d=d+j>>1;c[a+1260>>2]=d;f=c[a+1400>>2]|0;if(f>>>0>254)d=0;else d=b[1087304+((e[(c[a+1348>>2]|0)+(((c[a+1360>>2]|0)+(d<<3)&511)<<1)>>1]|0)+f<<1)>>1]|0;c[a+1340>>2]=d;o=a+1344|0;g=(c[o>>2]|0)+d>>1;c[o>>2]=g}else g=0;if((c[a+296>>2]|0)<16){if((m&128|0)==0?(c[a+1540>>2]|0)!=7:0){d=a+1416|0;k=c[d>>2]|0;c[a+1420>>2]=k;f=c[a+1476>>2]|0;do if(f>>>0<=254){h=c[(c[a+1404>>2]|0)+4>>2]|0;i=c[a+1436>>2]|0;j=c[a+1424>>2]|0;if(!h){p=b[1087304+((e[j+(i<<1)>>1]|0)+f<<1)>>1]|0;c[d>>2]=p;d=p;break}else{p=b[1087304+((e[j+(((c[a+1412>>2]<<2>>7-h)+i&511)<<1)>>1]|0)+f<<1)>>1]|0;c[d>>2]=p;d=p;break}}else{c[d>>2]=0;d=0}while(0);d=d+k>>1;c[a+1412>>2]=d;f=c[a+1552>>2]|0;if(f>>>0>254)d=0;else d=b[1087304+((e[(c[a+1500>>2]|0)+(((c[a+1512>>2]|0)+(d<<3)&511)<<1)>>1]|0)+f<<1)>>1]|0;c[a+1492>>2]=d;o=a+1496|0;p=(c[o>>2]|0)+d>>1;c[o>>2]=p;l=p+l|0}}else{if((m&512|0)==0?(c[a+1464>>2]|0)!=7:0){d=c[a+1664>>2]|0;f=c[a+1476>>2]|0;if(f>>>0>254)d=0;else{o=c[a+1436>>2]|0;d=b[1087304+((c[p>>2]<<6&64^64)+(((o>>>1^o>>>8|o>>>2)&1|0)==((d>>>4&1^1)&d>>>2|0)?64:576)+f<<1)>>1]|0}g=d+g|0}if((m&4096|0)==0?(c[a+1540>>2]|0)!=7:0){f=c[a+1552>>2]|0;do if(f>>>0<=254){d=(c[p>>2]&1|0)!=0;if(!(c[a+1512>>2]&128)){d=b[1087304+((d?512:592)+f<<1)>>1]|0;break}else{d=b[1087304+((d?0:80)+f<<1)>>1]|0;break}}else d=0;while(0);g=g-d|0}}if((c[a+300>>2]|0)<16){if(m&256){a=l;p=g;p=p<<1;a=p+a|0;a=a<<3;a=a&65535;return a|0}if((c[a+1692>>2]|0)==7){a=l;p=g;p=p<<1;a=p+a|0;a=a<<3;a=a&65535;return a|0}d=a+1568|0;k=c[d>>2]|0;c[a+1572>>2]=k;f=c[a+1628>>2]|0;do if(f>>>0<=254){h=c[(c[a+1556>>2]|0)+4>>2]|0;i=c[a+1588>>2]|0;j=c[a+1576>>2]|0;if(!h){p=b[1087304+((e[j+(i<<1)>>1]|0)+f<<1)>>1]|0;c[d>>2]=p;d=p;break}else{p=b[1087304+((e[j+(((c[a+1564>>2]<<2>>7-h)+i&511)<<1)>>1]|0)+f<<1)>>1]|0;c[d>>2]=p;d=p;break}}else{c[d>>2]=0;d=0}while(0);d=d+k>>1;c[a+1564>>2]=d;f=c[a+1704>>2]|0;if(f>>>0>254)d=0;else d=b[1087304+((e[(c[a+1652>>2]|0)+(((c[a+1664>>2]|0)+(d<<3)&511)<<1)>>1]|0)+f<<1)>>1]|0;c[a+1644>>2]=d;p=a+1648|0;a=(c[p>>2]|0)+d>>1;c[p>>2]=a;a=a+l|0;p=g;p=p<<1;a=p+a|0;a=a<<3;a=a&65535;return a|0}else{if((m&2048|0)==0?(c[a+1616>>2]|0)!=7:0){d=c[a+1628>>2]|0;if(d>>>0>254)d=0;else d=b[1087304+((e[(c[a+1576>>2]|0)+(c[a+1588>>2]<<1)>>1]|0)+d<<1)>>1]|0;g=d+g|0}if(m&1024){a=l;p=g;p=p<<1;a=p+a|0;a=a<<3;a=a&65535;return a|0}if((c[a+1692>>2]|0)==7){a=l;p=g;p=p<<1;a=p+a|0;a=a<<3;a=a&65535;return a|0}d=c[a+1436>>2]|0;f=c[a+1704>>2]|0;if(f>>>0>254)d=0;else{a=c[a+1664>>2]|0;d=b[1087304+((((d>>>1^d>>>8|d>>>2)&1|0)==((a>>>4&1^1)&a>>>2|0)?16:528)+f<<1)>>1]|0}a=l;p=g-d|0;p=p<<1;a=p+a|0;a=a<<3;a=a&65535;return a|0}return 0}function Zc(a,d){a=a|0;d=d|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;t=i;i=i+32|0;r=t+16|0;s=t;c[r>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;c[r+12>>2]=0;c[s>>2]=0;c[s+4>>2]=0;c[s+8>>2]=0;c[s+12>>2]=0;k=a+244|0;q=(c[102505]|0)+(c[k>>2]|0)&65535;c[k>>2]=q;k=a+252|0;l=(c[102506]|0)+(c[k>>2]|0)&65535;c[k>>2]=l;k=a+256|0;c[k>>2]=c[7612+(l>>>8<<2)>>2];l=a+248|0;c[l>>2]=c[6588+(q>>>8<<2)>>2];q=a+264|0;f=c[q>>2]|0;if(f&1){f=f^134230048;c[q>>2]=f}c[q>>2]=f>>>1;j=0;do{h=a+340+(j*76|0)|0;f=c[a+340+(j*76|0)+28>>2]|0;if(!(c[(c[h>>2]|0)+44>>2]|0)){n=a+340+(j*76|0)+24|0;g=(c[n>>2]|0)+f|0;c[n>>2]=g;f=n}else{g=(_(c[l>>2]|0,f)|0)>>>8;f=a+340+(j*76|0)+24|0;g=g+(c[f>>2]|0)|0;c[f>>2]=g}n=g&262143;c[f>>2]=n;c[a+340+(j*76|0)+32>>2]=n>>>9;_c(h,c[k>>2]|0);j=j+1|0}while((j|0)!=18);m=a+3692|0;n=0;do{if((c[m>>2]&1<<n|0)==0?(o=n<<1,p=o|1,(c[a+340+(p*76|0)+60>>2]|0)!=7):0){f=a+340+(o*76|0)+12|0;l=c[f>>2]|0;c[a+340+(o*76|0)+16>>2]=l;g=c[a+340+(o*76|0)+72>>2]|0;do if(g>>>0<=254){h=c[(c[a+340+(o*76|0)>>2]|0)+4>>2]|0;j=c[a+340+(o*76|0)+32>>2]|0;k=c[a+340+(o*76|0)+20>>2]|0;if(!h){k=b[1087304+((e[k+(j<<1)>>1]|0)+g<<1)>>1]|0;c[f>>2]=k;f=k;break}else{k=b[1087304+((e[k+(((c[a+340+(o*76|0)+8>>2]<<2>>7-h)+j&511)<<1)>>1]|0)+g<<1)>>1]|0;c[f>>2]=k;f=k;break}}else{c[f>>2]=0;f=0}while(0);f=f+l>>1;c[a+340+(o*76|0)+8>>2]=f;g=c[a+340+(p*76|0)+72>>2]|0;if(g>>>0>254)f=0;else f=b[1087304+((e[(c[a+340+(p*76|0)+20>>2]|0)+(((c[a+340+(p*76|0)+32>>2]|0)+(f<<3)&511)<<1)>>1]|0)+g<<1)>>1]|0;c[a+340+(p*76|0)+12>>2]=f;l=a+340+(p*76|0)+16|0;k=(c[l>>2]|0)+f>>1;c[l>>2]=k;l=r+(c[a+44+(n<<2)>>2]<<2)|0;c[l>>2]=(c[l>>2]|0)+k}n=n+1|0}while((n|0)!=6);m=c[m>>2]|0;if((c[a+292>>2]|0)<16){if((m&64|0)==0?(c[a+1388>>2]|0)!=7:0){f=a+1264|0;l=c[f>>2]|0;c[a+1268>>2]=l;g=c[a+1324>>2]|0;do if(g>>>0<=254){h=c[(c[a+1252>>2]|0)+4>>2]|0;j=c[a+1284>>2]|0;k=c[a+1272>>2]|0;if(!h){p=b[1087304+((e[k+(j<<1)>>1]|0)+g<<1)>>1]|0;c[f>>2]=p;f=p;break}else{p=b[1087304+((e[k+(((c[a+1260>>2]<<2>>7-h)+j&511)<<1)>>1]|0)+g<<1)>>1]|0;c[f>>2]=p;f=p;break}}else{c[f>>2]=0;f=0}while(0);f=f+l>>1;c[a+1260>>2]=f;g=c[a+1400>>2]|0;if(g>>>0>254)f=0;else f=b[1087304+((e[(c[a+1348>>2]|0)+(((c[a+1360>>2]|0)+(f<<3)&511)<<1)>>1]|0)+g<<1)>>1]|0;c[a+1340>>2]=f;p=a+1344|0;o=(c[p>>2]|0)+f>>1;c[p>>2]=o;p=r+(c[a+68>>2]<<2)|0;c[p>>2]=(c[p>>2]|0)+o}}else if((m&8192|0)==0?(c[a+1388>>2]|0)!=7:0){f=a+1264|0;l=c[f>>2]|0;c[a+1268>>2]=l;g=c[a+1324>>2]|0;do if(g>>>0<=254){h=c[(c[a+1252>>2]|0)+4>>2]|0;j=c[a+1284>>2]|0;k=c[a+1272>>2]|0;if(!h){p=b[1087304+((e[k+(j<<1)>>1]|0)+g<<1)>>1]|0;c[f>>2]=p;f=p;break}else{p=b[1087304+((e[k+(((c[a+1260>>2]<<2>>7-h)+j&511)<<1)>>1]|0)+g<<1)>>1]|0;c[f>>2]=p;f=p;break}}else{c[f>>2]=0;f=0}while(0);f=f+l>>1;c[a+1260>>2]=f;g=c[a+1400>>2]|0;if(g>>>0>254)f=0;else f=b[1087304+((e[(c[a+1348>>2]|0)+(((c[a+1360>>2]|0)+(f<<3)&511)<<1)>>1]|0)+g<<1)>>1]|0;c[a+1340>>2]=f;p=a+1344|0;o=(c[p>>2]|0)+f>>1;c[p>>2]=o;p=s+(c[a+80>>2]<<2)|0;c[p>>2]=(c[p>>2]|0)+o}if((c[a+296>>2]|0)<16){if((m&128|0)==0?(c[a+1540>>2]|0)!=7:0){f=a+1416|0;l=c[f>>2]|0;c[a+1420>>2]=l;g=c[a+1476>>2]|0;do if(g>>>0<=254){h=c[(c[a+1404>>2]|0)+4>>2]|0;j=c[a+1436>>2]|0;k=c[a+1424>>2]|0;if(!h){q=b[1087304+((e[k+(j<<1)>>1]|0)+g<<1)>>1]|0;c[f>>2]=q;f=q;break}else{q=b[1087304+((e[k+(((c[a+1412>>2]<<2>>7-h)+j&511)<<1)>>1]|0)+g<<1)>>1]|0;c[f>>2]=q;f=q;break}}else{c[f>>2]=0;f=0}while(0);f=f+l>>1;c[a+1412>>2]=f;g=c[a+1552>>2]|0;if(g>>>0>254)f=0;else f=b[1087304+((e[(c[a+1500>>2]|0)+(((c[a+1512>>2]|0)+(f<<3)&511)<<1)>>1]|0)+g<<1)>>1]|0;c[a+1492>>2]=f;q=a+1496|0;p=(c[q>>2]|0)+f>>1;c[q>>2]=p;q=r+(c[a+72>>2]<<2)|0;c[q>>2]=(c[q>>2]|0)+p}}else{if((m&512|0)==0?(c[a+1464>>2]|0)!=7:0){f=c[a+1664>>2]|0;g=c[a+1476>>2]|0;if(g>>>0>254)f=0;else{p=c[a+1436>>2]|0;f=b[1087304+((c[q>>2]<<6&64^64)+(((p>>>1^p>>>8|p>>>2)&1|0)==((f>>>4&1^1)&f>>>2|0)?64:576)+g<<1)>>1]|0}p=s+(c[a+84>>2]<<2)|0;c[p>>2]=(c[p>>2]|0)+f}if((m&4096|0)==0?(c[a+1540>>2]|0)!=7:0){g=c[a+1552>>2]|0;do if(g>>>0<=254){f=(c[q>>2]&1|0)!=0;if(!(c[a+1512>>2]&128)){f=b[1087304+((f?512:592)+g<<1)>>1]|0;break}else{f=b[1087304+((f?0:80)+g<<1)>>1]|0;break}}else f=0;while(0);q=s+(c[a+88>>2]<<2)|0;c[q>>2]=(c[q>>2]|0)-f}}if((c[a+300>>2]|0)<16){if(m&256){a=r+4|0;a=c[a>>2]|0;p=r+12|0;p=c[p>>2]|0;a=p+a|0;o=s+4|0;o=c[o>>2]|0;q=s+12|0;q=c[q>>2]|0;o=q+o|0;o=o<<1;o=a+o|0;o=o<<3;a=d+4|0;c[a>>2]=o;a=r+8|0;a=c[a>>2]|0;a=p+a|0;s=s+8|0;s=c[s>>2]|0;s=q+s|0;s=s<<1;s=a+s|0;s=s<<3;c[d>>2]=s;i=t;return}if((c[a+1692>>2]|0)==7){a=r+4|0;a=c[a>>2]|0;p=r+12|0;p=c[p>>2]|0;a=p+a|0;o=s+4|0;o=c[o>>2]|0;q=s+12|0;q=c[q>>2]|0;o=q+o|0;o=o<<1;o=a+o|0;o=o<<3;a=d+4|0;c[a>>2]=o;a=r+8|0;a=c[a>>2]|0;a=p+a|0;s=s+8|0;s=c[s>>2]|0;s=q+s|0;s=s<<1;s=a+s|0;s=s<<3;c[d>>2]=s;i=t;return}f=a+1568|0;l=c[f>>2]|0;c[a+1572>>2]=l;g=c[a+1628>>2]|0;do if(g>>>0<=254){h=c[(c[a+1556>>2]|0)+4>>2]|0;j=c[a+1588>>2]|0;k=c[a+1576>>2]|0;if(!h){q=b[1087304+((e[k+(j<<1)>>1]|0)+g<<1)>>1]|0;c[f>>2]=q;f=q;break}else{q=b[1087304+((e[k+(((c[a+1564>>2]<<2>>7-h)+j&511)<<1)>>1]|0)+g<<1)>>1]|0;c[f>>2]=q;f=q;break}}else{c[f>>2]=0;f=0}while(0);f=f+l>>1;c[a+1564>>2]=f;g=c[a+1704>>2]|0;if(g>>>0>254)f=0;else f=b[1087304+((e[(c[a+1652>>2]|0)+(((c[a+1664>>2]|0)+(f<<3)&511)<<1)>>1]|0)+g<<1)>>1]|0;c[a+1644>>2]=f;o=a+1648|0;p=(c[o>>2]|0)+f>>1;c[o>>2]=p;a=r+(c[a+76>>2]<<2)|0;c[a>>2]=(c[a>>2]|0)+p;a=r+4|0;a=c[a>>2]|0;p=r+12|0;p=c[p>>2]|0;a=p+a|0;o=s+4|0;o=c[o>>2]|0;q=s+12|0;q=c[q>>2]|0;o=q+o|0;o=o<<1;o=a+o|0;o=o<<3;a=d+4|0;c[a>>2]=o;a=r+8|0;a=c[a>>2]|0;a=p+a|0;s=s+8|0;s=c[s>>2]|0;s=q+s|0;s=s<<1;s=a+s|0;s=s<<3;c[d>>2]=s;i=t;return}else{if((m&2048|0)==0?(c[a+1616>>2]|0)!=7:0){f=c[a+1628>>2]|0;if(f>>>0>254)f=0;else f=b[1087304+((e[(c[a+1576>>2]|0)+(c[a+1588>>2]<<1)>>1]|0)+f<<1)>>1]|0;q=s+(c[a+92>>2]<<2)|0;c[q>>2]=(c[q>>2]|0)+f}if(m&1024){a=r+4|0;a=c[a>>2]|0;p=r+12|0;p=c[p>>2]|0;a=p+a|0;o=s+4|0;o=c[o>>2]|0;q=s+12|0;q=c[q>>2]|0;o=q+o|0;o=o<<1;o=a+o|0;o=o<<3;a=d+4|0;c[a>>2]=o;a=r+8|0;a=c[a>>2]|0;a=p+a|0;s=s+8|0;s=c[s>>2]|0;s=q+s|0;s=s<<1;s=a+s|0;s=s<<3;c[d>>2]=s;i=t;return}if((c[a+1692>>2]|0)==7){a=r+4|0;a=c[a>>2]|0;p=r+12|0;p=c[p>>2]|0;a=p+a|0;o=s+4|0;o=c[o>>2]|0;q=s+12|0;q=c[q>>2]|0;o=q+o|0;o=o<<1;o=a+o|0;o=o<<3;a=d+4|0;c[a>>2]=o;a=r+8|0;a=c[a>>2]|0;a=p+a|0;s=s+8|0;s=c[s>>2]|0;s=q+s|0;s=s<<1;s=a+s|0;s=s<<3;c[d>>2]=s;i=t;return}f=c[a+1436>>2]|0;g=c[a+1704>>2]|0;if(g>>>0>254)f=0;else{q=c[a+1664>>2]|0;f=b[1087304+((((f>>>1^f>>>8|f>>>2)&1|0)==((q>>>4&1^1)&q>>>2|0)?16:528)+g<<1)>>1]|0}a=s+(c[a+96>>2]<<2)|0;c[a>>2]=(c[a>>2]|0)-f;a=r+4|0;a=c[a>>2]|0;p=r+12|0;p=c[p>>2]|0;a=p+a|0;o=s+4|0;o=c[o>>2]|0;q=s+12|0;q=c[q>>2]|0;o=q+o|0;o=o<<1;o=a+o|0;o=o<<3;a=d+4|0;c[a>>2]=o;a=r+8|0;a=c[a>>2]|0;a=p+a|0;s=s+8|0;s=c[s>>2]|0;s=q+s|0;s=s<<1;s=a+s|0;s=s<<3;c[d>>2]=s;i=t;return}}function _c(a,d){a=a|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;j=a+60|0;a:do switch(c[j>>2]|0){case 1:{g=a+64|0;i=c[g>>2]|0;f=b[1089352+(i>>>15<<1)>>1]|0;h=a+68|0;i=(c[h>>2]|0)+i|0;c[g>>2]=i;if(!(i&4194304)){e=c[a>>2]|0;if((c[e+16>>2]|0)!=15){e=f&65535;break a}}else e=c[a>>2]|0;c[g>>2]=0;c[j>>2]=2;c[h>>2]=c[408988+(c[e+20>>2]<<6)+(c[a+56>>2]<<2)>>2];e=0;break}case 2:{f=a+64|0;k=c[f>>2]|0;e=k>>>15;g=a+68|0;k=(c[g>>2]|0)+k|0;c[f>>2]=k;h=c[a>>2]|0;i=c[410028+(c[h+24>>2]<<2)>>2]|0;if(k>>>0>=i>>>0){k=(c[h+8>>2]|0)==0;c[f>>2]=i;if(k){c[j>>2]=4;c[g>>2]=c[408988+(c[h+28>>2]<<6)+(c[a+56>>2]<<2)>>2];break a}else{c[j>>2]=3;c[g>>2]=0;break a}}break}case 3:{e=(c[a+64>>2]|0)>>>15;f=c[a>>2]|0;if(!(c[f+8>>2]|0)){c[j>>2]=4;c[a+68>>2]=c[408988+(c[f+28>>2]<<6)+(c[a+56>>2]<<2)>>2]}break}case 5:case 4:{k=a+64|0;e=c[k>>2]|0;c[k>>2]=(c[a+68>>2]|0)+e;if(e>>>0>4194303){c[j>>2]=7;e=127}else e=e>>>15;break}case 6:{k=a+64|0;e=c[k>>2]|0;f=a+68|0;c[k>>2]=(c[f>>2]|0)+e;if(e>>>0>4194303){c[j>>2]=1;c[f>>2]=c[407964+(c[(c[a>>2]|0)+16>>2]<<6)+(c[a+56>>2]<<2)>>2];e=127}else e=e>>>15;break}default:e=127}while(0);k=((c[a+52>>2]|0)+e<<1)+((c[(c[a>>2]|0)+40>>2]|0)==0?0:d)|0;c[a+72>>2]=k>>>0>255?255:k|3;return}function $c(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0.0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;p=i;i=i+48|0;n=p;if((c[102523]|0)!=(a|0)){c[102523]=a;d=0;do{c[410096+(d<<2)>>2]=~~(+$d(+R(+(+(d|0)*6.283185307179586*.00390625))*6.875/1200.0)*256.0);d=d+1|0}while((d|0)!=256);d=0;do{c[411120+(d<<2)>>2]=~~(+$d(+R(+(+(d|0)*6.283185307179586*.00390625))*13.75/1200.0)*256.0);d=d+1|0}while((d|0)!=256);d=0;do{c[412144+(d<<2)>>2]=~~((+R(+(+(d|0)*6.283185307179586*.00390625))+1.0)*2.6666666666666665);d=d+1|0}while((d|0)!=256);d=0;do{c[413168+(d<<2)>>2]=~~((+R(+(+(d|0)*6.283185307179586*.00390625))+1.0)*12.799999999999999);d=d+1|0}while((d|0)!=256);d=0;do{m=~~(+P(10.0,+(+(d|0)*-.1875/20.0))*2047.0);m=(d|0)>511?0:m;c[414192+(d<<2)>>2]=m;c[414192+(d+1024<<2)>>2]=0-m;d=d+1|0}while((d|0)!=1024);c[105596]=512;d=1;do{c[422384+(d<<2)>>2]=~~(511.0-+Y(+(+(d|0)))*512.0/6.238324625039508)>>>0>>>1;d=d+1|0}while((d|0)!=512);l=0;do{j=c[424432+(l<<2)>>2]|0;k=0;do{m=j+(_(7-k|0,-6)|0)|0;d=~~(+(m|0)/.1875)>>>0;e=~~(+(m>>1|0)/.1875)>>>0;f=~~(+(m>>2|0)/.1875)>>>0;if((m|0)<1){d=0;do{m=d<<2;c[424496+(l<<13)+(k<<10)+(d<<4)>>2]=m;c[424496+(l<<13)+(k<<10)+(d<<4)+4>>2]=m;c[424496+(l<<13)+(k<<10)+(d<<4)+8>>2]=m;c[424496+(l<<13)+(k<<10)+(d<<4)+12>>2]=m;d=d+1|0}while((d|0)!=64)}else{g=0;do{m=g<<2;c[424496+(l<<13)+(k<<10)+(g<<4)>>2]=m;c[424496+(l<<13)+(k<<10)+(g<<4)+4>>2]=m+f;c[424496+(l<<13)+(k<<10)+(g<<4)+8>>2]=m+e;c[424496+(l<<13)+(k<<10)+(g<<4)+12>>2]=m+d;g=g+1|0}while((g|0)!=64)}k=k+1|0}while((k|0)!=8);l=l+1|0}while((l|0)!=16);c[138892]=0;c[138893]=0;c[138894]=0;c[138895]=2;c[138896]=1;c[138897]=4;c[138898]=1;c[138899]=6;c[138900]=2;c[138901]=8;c[138902]=2;c[138903]=10;c[138904]=3;c[138905]=12;c[138906]=3;c[138907]=14;c[138908]=0;c[138909]=1;c[138910]=0;c[138911]=3;c[138912]=1;c[138913]=5;c[138914]=1;c[138915]=7;c[138916]=2;c[138917]=9;c[138918]=2;c[138919]=11;c[138920]=3;c[138921]=13;c[138922]=3;c[138923]=15;e=0;do{h=+R(+(+(e|0)*6.283185307179586*.0009765625));if(h==0.0)d=511;else{d=0-~~(+ce(h)*20.0/.1875)|0;d=(d|0)<511?d:511}c[555696+(e<<2)>>2]=d;e=e+1|0}while((e|0)!=256);d=0;do{c[555696+(511-d<<2)>>2]=c[555696+(d<<2)>>2];d=d+1|0}while((d|0)!=256);d=0;do{c[555696+(d+512<<2)>>2]=(c[555696+(d<<2)>>2]|0)+1024;d=d+1|0}while((d|0)!=512)}if((c[139948]|0)!=(b|0)){c[139948]=b;hd()}m=We(488,1)|0;if(!m){o=0;i=p;return o|0}else d=0;while(1){e=Ue(52)|0;if(!e)break;f=Ue(88)|0;if(!f){o=28;break}g=f+84|0;c[g>>2]=e;k=Ue(52)|0;if(!k){o=33;break}l=Ue(88)|0;if(!l){e=k;o=31;break}j=l+84|0;c[j>>2]=k;g=Ue(16)|0;if(!g){g=l;o=34;break}c[f>>2]=1;c[l>>2]=1;c[g+8>>2]=f;c[g+12>>2]=l;id(g);c[n+(d<<2)>>2]=g;d=d+1|0;if((d|0)>=9){o=25;break}}if((o|0)==25){o=c[n>>2]|0;c[m+376>>2]=o;c[m+412>>2]=c[o+8>>2];c[m+416>>2]=c[o+12>>2];o=c[n+4>>2]|0;c[m+380>>2]=o;c[m+420>>2]=c[o+8>>2];c[m+424>>2]=c[o+12>>2];o=c[n+8>>2]|0;c[m+384>>2]=o;c[m+428>>2]=c[o+8>>2];c[m+432>>2]=c[o+12>>2];o=c[n+12>>2]|0;c[m+388>>2]=o;c[m+436>>2]=c[o+8>>2];c[m+440>>2]=c[o+12>>2];o=c[n+16>>2]|0;c[m+392>>2]=o;c[m+444>>2]=c[o+8>>2];c[m+448>>2]=c[o+12>>2];o=c[n+20>>2]|0;c[m+396>>2]=o;c[m+452>>2]=c[o+8>>2];c[m+456>>2]=c[o+12>>2];o=c[n+24>>2]|0;c[m+400>>2]=o;c[m+460>>2]=c[o+8>>2];c[m+464>>2]=c[o+12>>2];o=c[n+28>>2]|0;c[m+404>>2]=o;c[m+468>>2]=c[o+8>>2];c[m+472>>2]=c[o+12>>2];o=c[n+32>>2]|0;c[m+408>>2]=o;c[m+476>>2]=c[o+8>>2];c[m+480>>2]=c[o+12>>2];c[m+484>>2]=0;c[m+12>>2]=kd(a,b)|0;ad(m);o=m;i=p;return o|0}else if((o|0)==28)Ve(e);else if((o|0)==31){Ve(e);e=c[g>>2]|0;o=33}else if((o|0)==34){Ve(e);Ve(f);Ve(c[j>>2]|0);Ve(g)}if((o|0)==33){Ve(e);Ve(f)}c[n+(d<<2)>>2]=0;if((d|0)>0){e=c[n+(d+-1<<2)>>2]|0;f=e+8|0;g=e+12|0;while(1){o=c[f>>2]|0;Ve(c[o+84>>2]|0);Ve(o);o=c[g>>2]|0;Ve(c[o+84>>2]|0);Ve(o);Ve(e);if((d|0)>-1)d=d+1|0;else break}}Ve(m);o=0;i=p;return o|0}function ad(a){a=a|0;var b=0,d=0;if(!a)return;id(c[a+376>>2]|0);id(c[a+380>>2]|0);id(c[a+384>>2]|0);id(c[a+388>>2]|0);id(c[a+392>>2]|0);id(c[a+396>>2]|0);id(c[a+400>>2]|0);id(c[a+404>>2]|0);id(c[a+408>>2]|0);c[a+20>>2]=0;b=a+352|0;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+16>>2]=0;c[a+372>>2]=65535;af(a+24|0,0,255)|0;b=a+280|0;d=b+72|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));ld(c[a+12>>2]|0);return}function bd(a){a=a|0;var b=0,d=0,e=0;md(c[a+12>>2]|0);b=0;do{d=c[a+376+(b<<2)>>2]|0;e=c[d+8>>2]|0;Ve(c[e+84>>2]|0);Ve(e);e=c[d+12>>2]|0;Ve(c[e+84>>2]|0);Ve(e);Ve(d);b=b+1|0}while((b|0)!=9);Ve(a);return}function cd(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;t=a+360|0;c[t>>2]=(c[139949]|0)+(c[t>>2]|0)&65535;b=a+368|0;p=(c[139950]|0)+(c[b>>2]|0)&65535;c[b>>2]=p;c[139951]=c[412144+(c[a+364>>2]<<10)+(p>>>8<<2)>>2];c[139952]=c[410096+(c[a+356>>2]<<10)+((c[t>>2]|0)>>>8<<2)>>2];t=a+372|0;p=c[t>>2]|0;c[t>>2]=p>>>12&1^p>>>15|p<<1&65534;t=a+484|0;p=0;b=0;do{do if((c[t>>2]&1<<p|0)==0?(m=a+376+(p<<2)|0,n=c[m>>2]|0,o=c[n+12>>2]|0,(c[o+60>>2]|0)!=6):0)if(!(c[n+4>>2]|0)){k=c[n+8>>2]|0;h=k+8|0;j=k+12|0;c[j>>2]=c[h>>2];i=jd(k)|0;c[k+72>>2]=i;g=c[k+84>>2]|0;d=c[k+36>>2]|0;if(!(c[g+44>>2]|0)){l=k+32|0;e=(c[l>>2]|0)+d|0;c[l>>2]=e;d=l}else{e=(_(c[139952]|0,d)|0)>>>8;d=k+32|0;e=e+(c[d>>2]|0)|0;c[d>>2]=e}f=e&524287;c[d>>2]=f;f=f>>>9;c[k+40>>2]=f;do if(i>>>0<=510){d=c[g+4>>2]|0;e=c[k+28>>2]|0;if(!d){d=c[414192+((c[e+(f<<2)>>2]|0)+i<<2)>>2]|0;c[h>>2]=d;break}else{d=c[414192+((c[e+(((c[k+4>>2]>>7-d)+f&1023)<<2)>>2]|0)+i<<2)>>2]|0;c[h>>2]=d;break}}else{c[h>>2]=0;d=0}while(0);g=(c[j>>2]|0)+d>>1;c[k+4>>2]=g;f=jd(o)|0;c[o+72>>2]=f;d=c[o+36>>2]|0;if(!(c[(c[o+84>>2]|0)+44>>2]|0)){l=o+32|0;e=(c[l>>2]|0)+d|0;c[l>>2]=e;d=l}else{e=(_(c[139952]|0,d)|0)>>>8;d=o+32|0;e=e+(c[d>>2]|0)|0;c[d>>2]=e}l=e&524287;c[d>>2]=l;d=l>>>9;c[o+40>>2]=d;if(f>>>0>510)d=0;else d=c[414192+((c[(c[o+28>>2]|0)+((d+(g<<1)&1023)<<2)>>2]|0)+f<<2)>>2]|0;b=d+b|0;break}else{f=jd(o)|0;c[o+72>>2]=f;d=c[o+36>>2]|0;if(!(c[(c[o+84>>2]|0)+44>>2]|0)){l=o+32|0;e=(c[l>>2]|0)+d|0;c[l>>2]=e;d=l}else{e=(_(c[139952]|0,d)|0)>>>8;d=o+32|0;e=e+(c[d>>2]|0)|0;c[d>>2]=e}l=e&524287;c[d>>2]=l;d=l>>>9;c[o+40>>2]=d;if(f>>>0>510)j=0;else j=c[414192+((c[(c[o+28>>2]|0)+(d<<2)>>2]|0)+f<<2)>>2]|0;k=c[(c[m>>2]|0)+8>>2]|0;h=k+8|0;l=k+12|0;c[l>>2]=c[h>>2];i=jd(k)|0;c[k+72>>2]=i;g=c[k+84>>2]|0;d=c[k+36>>2]|0;if(!(c[g+44>>2]|0)){f=k+32|0;e=(c[f>>2]|0)+d|0;c[f>>2]=e;d=f}else{e=(_(c[139952]|0,d)|0)>>>8;d=k+32|0;e=e+(c[d>>2]|0)|0;c[d>>2]=e}f=e&524287;c[d>>2]=f;f=f>>>9;c[k+40>>2]=f;do if(i>>>0<=510){d=c[g+4>>2]|0;e=c[k+28>>2]|0;if(!d){d=c[414192+((c[e+(f<<2)>>2]|0)+i<<2)>>2]|0;c[h>>2]=d;break}else{d=c[414192+((c[e+(((c[k+4>>2]>>7-d)+f&1023)<<2)>>2]|0)+i<<2)>>2]|0;c[h>>2]=d;break}}else{c[h>>2]=0;d=0}while(0);l=(c[l>>2]|0)+d>>1;c[k+4>>2]=l;b=j+b+l|0;break}while(0);p=p+1|0}while((p|0)!=6);if(!(c[a+352>>2]|0)){m=6;do{do if((c[t>>2]&1<<m|0)==0?(q=a+376+(m<<2)|0,r=c[q>>2]|0,s=c[r+12>>2]|0,(c[s+60>>2]|0)!=6):0)if(!(c[r+4>>2]|0)){k=c[r+8>>2]|0;h=k+8|0;j=k+12|0;c[j>>2]=c[h>>2];i=jd(k)|0;c[k+72>>2]=i;g=c[k+84>>2]|0;d=c[k+36>>2]|0;if(!(c[g+44>>2]|0)){p=k+32|0;e=(c[p>>2]|0)+d|0;c[p>>2]=e;d=p}else{e=(_(c[139952]|0,d)|0)>>>8;d=k+32|0;e=e+(c[d>>2]|0)|0;c[d>>2]=e}f=e&524287;c[d>>2]=f;f=f>>>9;c[k+40>>2]=f;do if(i>>>0<=510){d=c[g+4>>2]|0;e=c[k+28>>2]|0;if(!d){d=c[414192+((c[e+(f<<2)>>2]|0)+i<<2)>>2]|0;c[h>>2]=d;break}else{d=c[414192+((c[e+(((c[k+4>>2]>>7-d)+f&1023)<<2)>>2]|0)+i<<2)>>2]|0;c[h>>2]=d;break}}else{c[h>>2]=0;d=0}while(0);g=(c[j>>2]|0)+d>>1;c[k+4>>2]=g;f=jd(s)|0;c[s+72>>2]=f;d=c[s+36>>2]|0;if(!(c[(c[s+84>>2]|0)+44>>2]|0)){p=s+32|0;e=(c[p>>2]|0)+d|0;c[p>>2]=e;d=p}else{e=(_(c[139952]|0,d)|0)>>>8;d=s+32|0;e=e+(c[d>>2]|0)|0;c[d>>2]=e}p=e&524287;c[d>>2]=p;d=p>>>9;c[s+40>>2]=d;if(f>>>0>510)d=0;else d=c[414192+((c[(c[s+28>>2]|0)+((d+(g<<1)&1023)<<2)>>2]|0)+f<<2)>>2]|0;b=d+b|0;break}else{f=jd(s)|0;c[s+72>>2]=f;d=c[s+36>>2]|0;if(!(c[(c[s+84>>2]|0)+44>>2]|0)){p=s+32|0;e=(c[p>>2]|0)+d|0;c[p>>2]=e;d=p}else{e=(_(c[139952]|0,d)|0)>>>8;d=s+32|0;e=e+(c[d>>2]|0)|0;c[d>>2]=e}p=e&524287;c[d>>2]=p;d=p>>>9;c[s+40>>2]=d;if(f>>>0>510)j=0;else j=c[414192+((c[(c[s+28>>2]|0)+(d<<2)>>2]|0)+f<<2)>>2]|0;k=c[(c[q>>2]|0)+8>>2]|0;h=k+8|0;l=k+12|0;c[l>>2]=c[h>>2];i=jd(k)|0;c[k+72>>2]=i;g=c[k+84>>2]|0;d=c[k+36>>2]|0;if(!(c[g+44>>2]|0)){p=k+32|0;e=(c[p>>2]|0)+d|0;c[p>>2]=e;d=p}else{e=(_(c[139952]|0,d)|0)>>>8;d=k+32|0;e=e+(c[d>>2]|0)|0;c[d>>2]=e}f=e&524287;c[d>>2]=f;f=f>>>9;c[k+40>>2]=f;do if(i>>>0<=510){d=c[g+4>>2]|0;e=c[k+28>>2]|0;if(!d){d=c[414192+((c[e+(f<<2)>>2]|0)+i<<2)>>2]|0;c[h>>2]=d;break}else{d=c[414192+((c[e+(((c[k+4>>2]>>7-d)+f&1023)<<2)>>2]|0)+i<<2)>>2]|0;c[h>>2]=d;break}}else{c[h>>2]=0;d=0}while(0);p=(c[l>>2]|0)+d>>1;c[k+4>>2]=p;b=j+b+p|0;break}while(0);m=m+1|0}while((m|0)!=9)}if(!(c[t>>2]&16384))b=((nd(c[a+12>>2]|0)|0)<<16>>16)+b|0;if((b|0)>32767)return 32767;else return ((b|0)<-32768?-32768:b&65535)|0;return 0}function dd(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;g=f&255;p=e&255;if((p+-7|0)>>>0<12){od(c[b+12>>2]|0,p,g);f=f&255;b=b+24+p|0;a[b>>0]=f;return}switch(e&224|0){case 32:{e=p+-32|0;if(!(4144959>>>e&1)){f=f&255;b=b+24+p|0;a[b>>0]=f;return}i=c[b+412+(c[559812+(e<<2)>>2]<<2)>>2]|0;e=c[i+84>>2]|0;c[e+40>>2]=f>>>7&1;c[e+44>>2]=f>>>6&1;g=f>>>5&1;c[e+8>>2]=g;h=f>>>4&1;c[e+32>>2]=h;m=f&15;c[e+12>>2]=m;o=c[i+48>>2]|0;n=c[i+44>>2]|0;c[i+36>>2]=c[559940+(n<<9)+(o<<6)+(m<<2)>>2];c[i+52>>2]=c[424496+(n>>6<<13)+(o<<10)+(c[e>>2]<<4)+(c[e+36>>2]<<2)>>2];h=c[555568+(n>>9<<6)+(o<<3)+(h<<2)>>2]|0;c[i+56>>2]=h;a:do switch(c[i+60>>2]|0){case 1:{e=c[1084228+(c[e+16>>2]<<6)+(h<<2)>>2]|0;break}case 2:{e=c[1085252+(c[e+20>>2]<<6)+(h<<2)>>2]|0;break}case 5:if(!g){e=c[1085700+(h<<2)>>2]|0;break a}else{e=c[1085252+(c[e+28>>2]<<6)+(h<<2)>>2]|0;break a}case 4:{e=c[1085252+(c[e+28>>2]<<6)+(h<<2)>>2]|0;break}default:e=0}while(0);c[i+68>>2]=e;f=f&255;b=b+24+p|0;a[b>>0]=f;return}case 64:{e=p+-64|0;if(!(4144959>>>e&1)){f=f&255;b=b+24+p|0;a[b>>0]=f;return}n=f>>>6&3;h=c[b+412+(c[559812+(e<<2)>>2]<<2)>>2]|0;g=c[h+84>>2]|0;c[g+36>>2]=n;m=f&63;c[g>>2]=m;e=c[h+48>>2]|0;o=c[h+44>>2]|0;c[h+36>>2]=c[559940+(o<<9)+(e<<6)+(c[g+12>>2]<<2)>>2];c[h+52>>2]=c[424496+(o>>6<<13)+(e<<10)+(m<<4)+(n<<2)>>2];e=c[555568+(o>>9<<6)+(e<<3)+(c[g+32>>2]<<2)>>2]|0;c[h+56>>2]=e;b:do switch(c[h+60>>2]|0){case 1:{e=c[1084228+(c[g+16>>2]<<6)+(e<<2)>>2]|0;break}case 2:{e=c[1085252+(c[g+20>>2]<<6)+(e<<2)>>2]|0;break}case 5:if(!(c[g+8>>2]|0)){e=c[1085700+(e<<2)>>2]|0;break b}else{e=c[1085252+(c[g+28>>2]<<6)+(e<<2)>>2]|0;break b}case 4:{e=c[1085252+(c[g+28>>2]<<6)+(e<<2)>>2]|0;break}default:e=0}while(0);c[h+68>>2]=e;f=f&255;b=b+24+p|0;a[b>>0]=f;return}case 96:{e=p+-96|0;if(!(4144959>>>e&1)){f=f&255;b=b+24+p|0;a[b>>0]=f;return}g=f>>>4&15;i=c[b+412+(c[559812+(e<<2)>>2]<<2)>>2]|0;h=c[i+84>>2]|0;c[h+16>>2]=g;e=f&15;c[h+20>>2]=e;c:do switch(c[i+60>>2]|0){case 1:{e=c[1084228+(g<<6)+(c[i+56>>2]<<2)>>2]|0;break}case 2:{e=c[1085252+(e<<6)+(c[i+56>>2]<<2)>>2]|0;break}case 5:{e=c[i+56>>2]|0;if(!(c[h+8>>2]|0)){e=c[1085700+(e<<2)>>2]|0;break c}else{e=c[1085252+(c[h+28>>2]<<6)+(e<<2)>>2]|0;break c}}case 4:{e=c[1085252+(c[h+28>>2]<<6)+(c[i+56>>2]<<2)>>2]|0;break}default:e=0}while(0);c[i+68>>2]=e;f=f&255;b=b+24+p|0;a[b>>0]=f;return}case 128:{e=p+-128|0;if(!(4144959>>>e&1)){f=f&255;b=b+24+p|0;a[b>>0]=f;return}i=c[b+412+(c[559812+(e<<2)>>2]<<2)>>2]|0;e=c[i+84>>2]|0;c[e+24>>2]=f>>>4&15;g=f&15;c[e+28>>2]=g;d:do switch(c[i+60>>2]|0){case 1:{e=c[1084228+(c[e+16>>2]<<6)+(c[i+56>>2]<<2)>>2]|0;break}case 2:{e=c[1085252+(c[e+20>>2]<<6)+(c[i+56>>2]<<2)>>2]|0;break}case 5:{h=c[i+56>>2]|0;if(!(c[e+8>>2]|0)){e=c[1085700+(h<<2)>>2]|0;break d}else{e=c[1085252+(g<<6)+(h<<2)>>2]|0;break d}}case 4:{e=c[1085252+(g<<6)+(c[i+56>>2]<<2)>>2]|0;break}default:e=0}while(0);c[i+68>>2]=e;f=f&255;b=b+24+p|0;a[b>>0]=f;return}default:{e=p+-160|0;if(e>>>0<9){j=(d[p+16+(b+24)>>0]|0)<<8&768;i=j|g;k=c[b+376+(e<<2)>>2]|0;h=c[k+12>>2]|0;o=h+44|0;c[o>>2]=i;k=c[k+8>>2]|0;c[k+44>>2]=i;e=c[h+84>>2]|0;g=c[h+48>>2]|0;o=c[o>>2]|0;c[h+36>>2]=c[559940+(o<<9)+(g<<6)+(c[e+12>>2]<<2)>>2];c[h+52>>2]=c[424496+(o>>6<<13)+(g<<10)+(c[e>>2]<<4)+(c[e+36>>2]<<2)>>2];g=c[555568+(o>>9<<6)+(g<<3)+(c[e+32>>2]<<2)>>2]|0;c[h+56>>2]=g;e:do switch(c[h+60>>2]|0){case 1:{e=c[1084228+(c[e+16>>2]<<6)+(g<<2)>>2]|0;break}case 2:{e=c[1085252+(c[e+20>>2]<<6)+(g<<2)>>2]|0;break}case 5:if(!(c[e+8>>2]|0)){e=c[1085700+(g<<2)>>2]|0;break e}else{e=c[1085252+(c[e+28>>2]<<6)+(g<<2)>>2]|0;break e}case 4:{e=c[1085252+(c[e+28>>2]<<6)+(g<<2)>>2]|0;break}default:e=0}while(0);c[h+68>>2]=e;g=c[k+84>>2]|0;e=c[k+48>>2]|0;c[k+36>>2]=c[559940+(i<<9)+(e<<6)+(c[g+12>>2]<<2)>>2];c[k+52>>2]=c[424496+(i>>>6<<13)+(e<<10)+(c[g>>2]<<4)+(c[g+36>>2]<<2)>>2];e=c[555568+(j>>>9<<6)+(e<<3)+(c[g+32>>2]<<2)>>2]|0;c[k+56>>2]=e;f:do switch(c[k+60>>2]|0){case 1:{e=c[1084228+(c[g+16>>2]<<6)+(e<<2)>>2]|0;break}case 2:{e=c[1085252+(c[g+20>>2]<<6)+(e<<2)>>2]|0;break}case 5:if(!(c[g+8>>2]|0)){e=c[1085700+(e<<2)>>2]|0;break f}else{e=c[1085252+(c[g+28>>2]<<6)+(e<<2)>>2]|0;break f}case 4:{e=c[1085252+(c[g+28>>2]<<6)+(e<<2)>>2]|0;break}default:e=0}while(0);c[k+68>>2]=e;f=f&255;b=b+24+p|0;a[b>>0]=f;return}e=p+-176|0;if(e>>>0>=9){e=p+-192|0;if(e>>>0<9){c[(c[(c[b+412+(e<<1<<2)>>2]|0)+84>>2]|0)+4>>2]=f>>>1&7;c[(c[b+376+(e<<2)>>2]|0)+4>>2]=f&1;f=f&255;b=b+24+p|0;a[b>>0]=f;return}if((p|0)!=189){f=f&255;b=b+24+p|0;a[b>>0]=f;return}c[b+352>>2]=f&32;c[b+364>>2]=f>>>7&1;c[b+356>>2]=f>>>6&1;f=f&255;b=b+24+p|0;a[b>>0]=f;return}i=f<<8&768;j=d[p+-16+(b+24)>>0]|0|i;g=c[b+376+(e<<2)>>2]|0;o=c[g+12>>2]|0;m=o+44|0;c[m>>2]=j;l=c[g+8>>2]|0;c[l+44>>2]=j;h=f>>>2&7;n=o+48|0;c[n>>2]=h;c[l+48>>2]=h;e=(f&32|0)==0;k=l+60|0;if(e|(a[b+24+p>>0]&32)!=0){if(e){if((c[k>>2]|0)==1){e=l+64|0;c[e>>2]=c[422384+((c[e>>2]|0)>>>14<<2)>>2]<<14}c[k>>2]=5;e=o+60|0;if((c[e>>2]|0)==1){q=o+64|0;c[q>>2]=c[422384+((c[q>>2]|0)>>>14<<2)>>2]<<14}c[e>>2]=5;c[g>>2]=0}}else{c[k>>2]=1;c[l+32>>2]=0;c[l+64>>2]=0;c[o+60>>2]=1;c[o+32>>2]=0;c[o+64>>2]=0;c[g>>2]=1}g=c[l+84>>2]|0;c[l+36>>2]=c[559940+(j<<9)+(h<<6)+(c[g+12>>2]<<2)>>2];c[l+52>>2]=c[424496+(j>>>6<<13)+(h<<10)+(c[g>>2]<<4)+(c[g+36>>2]<<2)>>2];e=c[555568+(i>>>9<<6)+(h<<3)+(c[g+32>>2]<<2)>>2]|0;c[l+56>>2]=e;g:do switch(c[k>>2]|0){case 1:{e=c[1084228+(c[g+16>>2]<<6)+(e<<2)>>2]|0;break}case 2:{e=c[1085252+(c[g+20>>2]<<6)+(e<<2)>>2]|0;break}case 5:if(!(c[g+8>>2]|0)){e=c[1085700+(e<<2)>>2]|0;break g}else{e=c[1085252+(c[g+28>>2]<<6)+(e<<2)>>2]|0;break g}case 4:{e=c[1085252+(c[g+28>>2]<<6)+(e<<2)>>2]|0;break}default:e=0}while(0);c[l+68>>2]=e;g=c[o+84>>2]|0;e=c[n>>2]|0;q=c[m>>2]|0;c[o+36>>2]=c[559940+(q<<9)+(e<<6)+(c[g+12>>2]<<2)>>2];c[o+52>>2]=c[424496+(q>>6<<13)+(e<<10)+(c[g>>2]<<4)+(c[g+36>>2]<<2)>>2];e=c[555568+(q>>9<<6)+(e<<3)+(c[g+32>>2]<<2)>>2]|0;c[o+56>>2]=e;h:do switch(c[o+60>>2]|0){case 1:{e=c[1084228+(c[g+16>>2]<<6)+(e<<2)>>2]|0;break}case 2:{e=c[1085252+(c[g+20>>2]<<6)+(e<<2)>>2]|0;break}case 5:if(!(c[g+8>>2]|0)){e=c[1085700+(e<<2)>>2]|0;break h}else{e=c[1085252+(c[g+28>>2]<<6)+(e<<2)>>2]|0;break h}case 4:{e=c[1085252+(c[g+28>>2]<<6)+(e<<2)>>2]|0;break}default:e=0}while(0);c[o+68>>2]=e;f=f&255;q=b+24+p|0;a[q>>0]=f;return}}}function ed(a){a=a|0;return d[(c[a+16>>2]|0)+(a+24)>>0]|0|0}function fd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=a+16|0;if(!(b&1)){c[e>>2]=d;return}else{dd(a,c[e>>2]|0,d);return}}function gd(a){a=a|0;return pd(c[a+12>>2]|0)|0}function hd(){var a=0,b=0,d=0,e=0,f=0,g=0.0,h=0.0,i=0.0;f=c[102523]|0;g=+(f>>>0);h=+((c[139948]|0)>>>0);d=0;do{a=0;do{c[559940+(d<<9)+(a<<2)>>2]=~~(g*+((_(c[1086340+(a<<2)>>2]|0,d)|0)>>>2>>>0)/72.0/h+.5)>>>0;a=a+1|0}while((a|0)!=16);a=0;do{c[559940+(d<<9)+64+(a<<2)>>2]=~~(g*+(((_(c[1086340+(a<<2)>>2]|0,d)|0)>>>1&1073741823)>>>0)/72.0/h+.5)>>>0;a=a+1|0}while((a|0)!=16);a=0;do{c[559940+(d<<9)+128+(a<<2)>>2]=~~(g*+(((_(c[1086340+(a<<2)>>2]|0,d)|0)&1073741823)>>>0)/72.0/h+.5)>>>0;a=a+1|0}while((a|0)!=16);a=d<<1;b=0;do{c[559940+(d<<9)+192+(b<<2)>>2]=~~(g*+(((_(a,c[1086340+(b<<2)>>2]|0)|0)&1073741822)>>>0)/72.0/h+.5)>>>0;b=b+1|0}while((b|0)!=16);a=d<<2;b=0;do{c[559940+(d<<9)+256+(b<<2)>>2]=~~(g*+(((_(a,c[1086340+(b<<2)>>2]|0)|0)&1073741820)>>>0)/72.0/h+.5)>>>0;b=b+1|0}while((b|0)!=16);a=d<<3;b=0;do{c[559940+(d<<9)+320+(b<<2)>>2]=~~(g*+(((_(a,c[1086340+(b<<2)>>2]|0)|0)&1073741816)>>>0)/72.0/h+.5)>>>0;b=b+1|0}while((b|0)!=16);a=d<<4;b=0;do{c[559940+(d<<9)+384+(b<<2)>>2]=~~(g*+(((_(a,c[1086340+(b<<2)>>2]|0)|0)&1073741808)>>>0)/72.0/h+.5)>>>0;b=b+1|0}while((b|0)!=16);a=d<<5;b=0;do{c[559940+(d<<9)+448+(b<<2)>>2]=~~(g*+(((_(a,c[1086340+(b<<2)>>2]|0)|0)&1073741792)>>>0)/72.0/h+.5)>>>0;b=b+1|0}while((b|0)!=16);d=d+1|0}while((d|0)!=1024);a=0;a:while(1){switch(a|0){case 15:{e=18;break a}case 0:{a=1084228;b=a+64|0;do{c[a>>2]=0;a=a+4|0}while((a|0)<(b|0));a=1;continue a}default:b=0}do{d=(b>>2)+a|0;c[1084228+(a<<6)+(b<<2)>>2]=~~(g*+((b&3|4)*3<<((d|0)>15?16:d+1|0)|0)/72.0/h+.5)>>>0;b=b+1|0}while((b|0)!=16);a=a+1|0;if((a|0)==16){b=0;break}}if((e|0)==18){c[271297]=8388608;c[271298]=8388608;c[271299]=8388608;c[271300]=8388608;c[271301]=8388608;c[271302]=8388608;c[271303]=8388608;c[271304]=8388608;c[271305]=8388608;c[271306]=8388608;c[271307]=8388608;c[271308]=8388608;c[271309]=8388608;c[271310]=8388608;c[271311]=8388608;c[271312]=8388608;b=0}while(1){if(!b){a=1085252;b=a+64|0;do{c[a>>2]=0;a=a+4|0}while((a|0)<(b|0));b=1;continue}else a=0;do{e=(a>>2)+b|0;c[1085252+(b<<6)+(a<<2)>>2]=~~(g*+((a&3|4)<<((e|0)>15?14:e+-1|0)|0)/72.0/h+.5)>>>0;a=a+1|0}while((a|0)!=16);b=b+1|0;if((b|0)==16)break}i=+(((f>>>0)/72|0)>>>0);c[139949]=~~(g*(419430.4/i)/72.0/h+.5)>>>0;c[139950]=~~(g*(242483.2/i)/72.0/h+.5)>>>0;return}function id(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;b=c[a+8>>2]|0;c[b+28>>2]=555696;c[b+32>>2]=0;h=b+36|0;c[h>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+4>>2]=0;j=b+60|0;c[j>>2]=6;c[b+64>>2]=8388608;k=b+68|0;c[k>>2]=0;i=b+56|0;e=b+52|0;f=b+44|0;g=b+48|0;d=b+40|0;c[b+72>>2]=0;b=b+84|0;c[d>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+16>>2]=0;d=c[b>>2]|0;l=d+52|0;do{c[d>>2]=0;d=d+4|0}while((d|0)<(l|0));d=c[b>>2]|0;b=c[g>>2]|0;l=c[f>>2]|0;c[h>>2]=c[559940+(l<<9)+(b<<6)+(c[d+12>>2]<<2)>>2];c[e>>2]=c[424496+(l>>6<<13)+(b<<10)+(c[d>>2]<<4)+(c[d+36>>2]<<2)>>2];b=c[555568+(l>>9<<6)+(b<<3)+(c[d+32>>2]<<2)>>2]|0;c[i>>2]=b;a:do switch(c[j>>2]|0){case 1:{b=c[1084228+(c[d+16>>2]<<6)+(b<<2)>>2]|0;break}case 2:{b=c[1085252+(c[d+20>>2]<<6)+(b<<2)>>2]|0;break}case 5:if(!(c[d+8>>2]|0)){b=c[1085700+(b<<2)>>2]|0;break a}else{b=c[1085252+(c[d+28>>2]<<6)+(b<<2)>>2]|0;break a}case 4:{b=c[1085252+(c[d+28>>2]<<6)+(b<<2)>>2]|0;break}default:b=0}while(0);c[k>>2]=b;b=c[a+12>>2]|0;c[b+28>>2]=555696;c[b+32>>2]=0;e=b+36|0;c[e>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+4>>2]=0;i=b+60|0;c[i>>2]=6;c[b+64>>2]=8388608;j=b+68|0;c[j>>2]=0;k=b+56|0;f=b+52|0;g=b+44|0;h=b+48|0;d=b+40|0;c[b+72>>2]=0;b=b+84|0;c[d>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+16>>2]=0;d=c[b>>2]|0;l=d+52|0;do{c[d>>2]=0;d=d+4|0}while((d|0)<(l|0));d=c[b>>2]|0;b=c[h>>2]|0;l=c[g>>2]|0;c[e>>2]=c[559940+(l<<9)+(b<<6)+(c[d+12>>2]<<2)>>2];c[f>>2]=c[424496+(l>>6<<13)+(b<<10)+(c[d>>2]<<4)+(c[d+36>>2]<<2)>>2];b=c[555568+(l>>9<<6)+(b<<3)+(c[d+32>>2]<<2)>>2]|0;c[k>>2]=b;switch(c[i>>2]|0){case 1:{l=c[1084228+(c[d+16>>2]<<6)+(b<<2)>>2]|0;c[j>>2]=l;c[a>>2]=0;a=a+4|0;c[a>>2]=0;return}case 2:{l=c[1085252+(c[d+20>>2]<<6)+(b<<2)>>2]|0;c[j>>2]=l;c[a>>2]=0;a=a+4|0;c[a>>2]=0;return}case 5:if(!(c[d+8>>2]|0)){l=c[1085700+(b<<2)>>2]|0;c[j>>2]=l;c[a>>2]=0;a=a+4|0;c[a>>2]=0;return}else{l=c[1085252+(c[d+28>>2]<<6)+(b<<2)>>2]|0;c[j>>2]=l;c[a>>2]=0;a=a+4|0;c[a>>2]=0;return}case 4:{l=c[1085252+(c[d+28>>2]<<6)+(b<<2)>>2]|0;c[j>>2]=l;c[a>>2]=0;a=a+4|0;c[a>>2]=0;return}default:{l=0;c[j>>2]=l;c[a>>2]=0;a=a+4|0;c[a>>2]=0;return}}}function jd(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;h=a+60|0;a:do switch(c[h>>2]|0){case 1:{b=a+68|0;d=a+64|0;e=(c[d>>2]|0)+(c[b>>2]|0)|0;c[d>>2]=e;if(!(e&8388608)){b=c[422384+(e>>>14<<2)>>2]|0;break a}else{c[d>>2]=0;c[h>>2]=2;c[b>>2]=c[1085252+(c[(c[a+84>>2]|0)+20>>2]<<6)+(c[a+56>>2]<<2)>>2];b=0;break a}}case 2:{f=a+68|0;b=a+64|0;d=(c[b>>2]|0)+(c[f>>2]|0)|0;c[b>>2]=d;e=c[a+84>>2]|0;g=c[1086276+(c[e+24>>2]<<2)>>2]|0;if(d>>>0<g>>>0)b=d>>>14;else{d=(c[e+8>>2]|0)==0;c[b>>2]=g;if(d){c[h>>2]=4;b=c[1085252+(c[e+28>>2]<<6)+(c[a+56>>2]<<2)>>2]|0}else{c[h>>2]=3;b=0}c[f>>2]=b;b=g>>>14}break}case 3:{b=(c[a+64>>2]|0)>>>14;d=c[a+84>>2]|0;if(!(c[d+8>>2]|0)){c[h>>2]=4;c[a+68>>2]=c[1085252+(c[d+28>>2]<<6)+(c[a+56>>2]<<2)>>2]}break}case 5:case 4:{g=a+64|0;b=(c[g>>2]|0)+(c[a+68>>2]|0)|0;c[g>>2]=b;if(b>>>0>8388607){c[h>>2]=6;b=511}else b=b>>>14;break}default:b=511}while(0);a=(c[a+52>>2]|0)+b+((c[(c[a+84>>2]|0)+40>>2]|0)==0?0:c[139951]|0)|0;return (a>>>0>511?511:a)|0}function kd(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;g=Ue(112)|0;if(!g){g=0;return g|0}c[g>>2]=b;c[g+4>>2]=(d|0)!=0?d:44100;b=Ue(262144)|0;c[g+44>>2]=b;e=b;if((b|0)!=0?(af(b|0,0,262144)|0,f=Ue(262144)|0,c[g+48>>2]=f,(f|0)!=0):0){af(f|0,0,262144)|0;b=g+8|0;d=b+32|0;do{a[b>>0]=0;b=b+1|0}while((b|0)<(d|0));c[g+80>>2]=0;a[g+52>>0]=0;f=g+56|0;c[f>>2]=0;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+16>>2]=0;c[g+40>>2]=e;c[g+76>>2]=524287;c[g+88>>2]=0;c[g+84>>2]=0;a[g+12>>0]=24;return g|0}Ve(b);Ve(g);g=0;return g|0}function ld(b){b=b|0;var d=0,e=0;d=b+8|0;e=d+32|0;do{a[d>>0]=0;d=d+1|0}while((d|0)<(e|0));c[b+80>>2]=0;a[b+52>>0]=0;e=b+56|0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+16>>2]=0;c[b+40>>2]=c[b+44>>2];c[b+76>>2]=524287;c[b+88>>2]=0;c[b+84>>2]=0;a[b+12>>0]=24;return}function md(a){a=a|0;if(!a)return;Ve(c[a+44>>2]|0);Ve(c[a+48>>2]|0);Ve(a);return}function nd(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;h=a[b+15>>0]|0;if(h&8){b=0;return b|0}i=b+80|0;if((c[i>>2]|0)!=0?(f=b+68|0,e=(c[f>>2]|0)+(c[b+72>>2]|0)|0,c[f>>2]=e,(e&1073741824|0)!=0):0){c[f>>2]=e&1073741823;f=b+64|0;g=c[b+76>>2]|0;e=(c[f>>2]|0)+1&g;c[f>>2]=e;do if((e|0)==(c[b+60>>2]&g|0))if(!(h&16)){c[i>>2]=0;i=b+52|0;a[i>>0]=d[i>>0]|0|144;break}else{e=c[b+56>>2]&g;c[f>>2]=e;break}else a[b+23>>0]=a[(c[b+40>>2]|0)+(e>>>1)>>0]|0;while(0);k=d[b+23>>0]|0;k=(e&1|0)==0?k>>>4:k&15;f=b+84|0;e=c[f>>2]|0;c[b+88>>2]=e;i=b+92|0;h=c[i>>2]|0;g=k&7;j=(_(g<<1|1,h)|0)>>>3;e=((k&8|0)==0?j:0-j|0)+e|0;c[f>>2]=(e|0)<-32768?-32768:(e|0)>32767?32767:e;h=_(c[1086404+(g<<2)>>2]|0,h)|0;c[i>>2]=h>>>0<8128?127:h>>>0>1572863?24575:h>>>6}k=(_(d[b+26>>0]|0,(c[b+88>>2]|0)+(c[b+84>>2]|0)|0)|0)>>>13&65535;return k|0}function od(b,e,f){b=b|0;e=e|0;f=f|0;e=e&31;do switch(e|0){case 0:{a[b+8>>0]=f;return}case 1:{a[b+9>>0]=f;return}case 2:{a[b+10>>0]=f;return}case 3:{a[b+11>>0]=f;return}case 4:{if(!(f&128)){e=f&255;a[b+12>>0]=e}else{e=b+52|0;a[e>>0]=f&120&(d[e>>0]|0);e=a[b+12>>0]|0}if(e<<24>>24>-1)return;else pa(1214032,1214063,243,1214158);break}case 5:{a[b+13>>0]=f;return}case 6:{a[b+14>>0]=f;return}case 7:{if(f&1){c[b+80>>2]=0;return}if(f&128){c[b+80>>2]=1;c[b+64>>2]=c[b+76>>2]&c[b+56>>2];c[b+68>>2]=0;c[b+84>>2]=0;c[b+88>>2]=0;c[b+92>>2]=127}a[b+15>>0]=f;return}case 8:{e=f&255;a[b+16>>0]=e;c[b+40>>2]=c[((f&1|0)==0?b+44|0:b+48|0)>>2];c[b+76>>2]=(e&2)!=0?131071:524287;return}case 10:case 9:{a[b+8+e>>0]=f;c[b+56>>2]=((d[b+18>>0]|0)<<8|(d[b+17>>0]|0))<<3;return}case 12:case 11:{a[b+8+e>>0]=f;c[b+60>>2]=((d[b+20>>0]|0)<<8|(d[b+19>>0]|0))<<3;return}case 13:{a[b+21>>0]=f;return}case 14:{a[b+22>>0]=f;return}case 15:{e=f&255;a[b+23>>0]=e;if((a[b+15>>0]&96)==96){f=b+64|0;a[(c[b+40>>2]|0)+((c[f>>2]|0)>>>1)>>0]=e;c[f>>2]=(c[f>>2]|0)+2&c[b+76>>2]}b=b+52|0;a[b>>0]=d[b>>0]|0|136;return}case 17:case 16:{a[b+8+e>>0]=f;c[b+72>>2]=~~(+((c[b>>2]|0)>>>0)*+(((d[b+25>>0]|0)<<8|(d[b+24>>0]|0))<<14|0)/72.0/+((c[b+4>>2]|0)>>>0)+.5)>>>0;return}case 18:{a[b+26>>0]=f;return}default:return}while(0)}function pd(a){a=a|0;return d[a+52>>0]|0|0}function qd(a,b){a=a|0;b=b|0;var d=0,e=0;c[a+16>>2]=b;d=c[a+4>>2]|0;e=c[a+8>>2]|0;if(!b){b=~~(+(d>>>0)*16777216.0/+(e<<4>>>0))>>>0;a=a+12|0;c[a>>2]=b;return}else{c[a+108>>2]=2147483648/(e>>>0)|0;c[a+116>>2]=2147483648/(d>>>4>>>0)|0;c[a+112>>2]=0;b=16777216;a=a+12|0;c[a>>2]=b;return}}function rd(a,b){a=a|0;b=b|0;var d=0;d=Ue(132)|0;if(!d){b=0;return b|0}c[d+4>>2]=a;b=(b|0)!=0?b:44100;c[d+8>>2]=b;c[d+16>>2]=0;c[d+12>>2]=~~(+(a>>>0)*16777216.0/+(b<<4>>>0))>>>0;b=d;return b|0}function sd(a){a=a|0;c[a+104>>2]=0;c[a+20>>2]=0;c[a+44>>2]=0;c[a+56>>2]=0;c[a+32>>2]=15;c[a+68>>2]=0;c[a+24>>2]=0;c[a+48>>2]=0;c[a+60>>2]=0;c[a+36>>2]=15;c[a+72>>2]=0;c[a+28>>2]=0;c[a+52>>2]=0;c[a+64>>2]=0;c[a+40>>2]=15;c[a+76>>2]=0;c[a+120>>2]=0;c[a+80>>2]=32768;c[a+84>>2]=0;c[a+88>>2]=0;c[a+92>>2]=15;c[a+96>>2]=0;c[a+100>>2]=0;c[a>>2]=0;c[a+128>>2]=0;c[a+124>>2]=255;return}function td(a){a=a|0;Ve(a);return}function ud(a,b){a=a|0;b=b|0;var d=0,e=0;if(!(b&128)){a=a+44+((c[a+120>>2]|0)>>>1<<2)|0;c[a>>2]=c[a>>2]&15|b<<4&1008;return}d=b>>>4&7;c[a+120>>2]=d;switch(d|0){case 4:case 2:case 0:{a=a+44+(d>>>1<<2)|0;c[a>>2]=c[a>>2]&1008|b&15;return}case 5:case 3:case 1:{c[a+32+((d+-1|0)>>>1<<2)>>2]=b&15;return}case 6:{c[a+96>>2]=b>>>2&1;d=b&3;if((d|0)==3){e=1;d=c[a+52>>2]|0}else{e=0;d=32<<d}b=a+88|0;c[b>>2]=d;c[a+100>>2]=e;if(!d)c[b>>2]=1;c[a+80>>2]=32768;return}case 7:{c[a+92>>2]=b&15;return}default:return}}function vd(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;if(!(c[a+16>>2]|0)){h=(yd(a)|0)<<16>>16;h=h<<4;h=h&65535;return h|0}g=a+108|0;d=c[g>>2]|0;h=a+112|0;b=c[h>>2]|0;if(b>>>0<d>>>0){f=a+116|0;while(1){c[h>>2]=(c[f>>2]|0)+b;b=(yd(a)|0)<<16>>16;b=(c[a>>2]|0)+b>>1;c[a>>2]=b;d=c[g>>2]|0;e=c[h>>2]|0;if(e>>>0<d>>>0)b=e;else break}}else{e=b;b=c[a>>2]|0}c[h>>2]=e-d;h=b;h=h<<4;h=h&65535;return h|0}
	function wd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;if(!(c[a+16>>2]|0)){zd(a,b);c[b>>2]=c[b>>2]<<4;b=b+4|0;c[b>>2]=c[b>>2]<<4;return}j=a+108|0;d=c[j>>2]|0;k=a+112|0;e=c[k>>2]|0;if(e>>>0<d>>>0){i=a+116|0;g=b+4|0;f=a+128|0;d=e;while(1){c[k>>2]=(c[i>>2]|0)+d;zd(a,b);e=(c[a>>2]|0)+(c[b>>2]|0)|0;c[a>>2]=e;d=(c[f>>2]|0)+(c[g>>2]|0)|0;e=e>>1;c[a>>2]=e;c[f>>2]=d>>>1;d=c[j>>2]|0;h=c[k>>2]|0;if(h>>>0<d>>>0)d=h;else break}}else{h=e;g=b+4|0;f=a+128|0;e=c[a>>2]|0}c[k>>2]=h-d;c[b>>2]=e<<20>>16;c[g>>2]=c[f>>2]<<20>>16;return}function xd(a,b){a=a|0;b=b|0;c[a+124>>2]=b;return}function yd(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;d=a+104|0;e=(c[d>>2]|0)+(c[a+12>>2]|0)|0;i=e>>>24;c[d>>2]=e&16777215;d=a+84|0;e=i+(c[d>>2]|0)|0;c[d>>2]=e;do if(e&256){h=a+80|0;b=c[h>>2]|0;b=(b^((c[a+96>>2]|0)==0?0:b>>>3))<<15&32768|b>>>1;c[h>>2]=b;if(!(c[a+100>>2]|0)){c[d>>2]=e-(c[a+88>>2]|0);break}else{c[d>>2]=e-(c[a+52>>2]|0);break}}else b=c[a+80>>2]|0;while(0);if(!(b&1))g=0;else g=c[1086436+(c[a+92>>2]<<2)>>2]|0;b=a+20|0;d=(c[b>>2]|0)+i|0;c[b>>2]=d;do if(d&1024){e=c[a+44>>2]|0;f=a+56|0;if(e>>>0>1){h=(c[f>>2]|0)==0&1;c[f>>2]=h;c[b>>2]=d-e;b=h;h=13;break}else{c[f>>2]=1;h=14;break}}else{b=c[a+56>>2]|0;h=13}while(0);if((h|0)==13)if(b)h=14;if((h|0)==14)if(!(c[a+68>>2]|0))g=(c[1086436+(c[a+32>>2]<<2)>>2]|0)+g|0;b=a+24|0;d=(c[b>>2]|0)+i|0;c[b>>2]=d;do if(d&1024){e=c[a+48>>2]|0;f=a+60|0;if(e>>>0>1){h=(c[f>>2]|0)==0&1;c[f>>2]=h;c[b>>2]=d-e;b=h;h=21;break}else{c[f>>2]=1;h=22;break}}else{b=c[a+60>>2]|0;h=21}while(0);if((h|0)==21)if(b)h=22;if((h|0)==22)if(!(c[a+72>>2]|0))g=(c[1086436+(c[a+36>>2]<<2)>>2]|0)+g|0;f=a+28|0;b=(c[f>>2]|0)+i|0;c[f>>2]=b;do if(b&1024){d=c[a+52>>2]|0;e=a+64|0;if(d>>>0>1){j=(c[e>>2]|0)==0&1;c[e>>2]=j;c[f>>2]=b-d;h=29;break}else{c[e>>2]=1;break}}else{j=c[a+64>>2]|0;h=29}while(0);if((h|0)==29?(j|0)==0:0){a=g;a=a&65535;return a|0}if(c[a+76>>2]|0){a=g;a=a&65535;return a|0}a=(c[1086436+(c[a+40>>2]<<2)>>2]|0)+g|0;a=a&65535;return a|0}function zd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;e=a+104|0;f=(c[e>>2]|0)+(c[a+12>>2]|0)|0;l=f>>>24;c[e>>2]=f&16777215;e=a+84|0;f=l+(c[e>>2]|0)|0;c[e>>2]=f;do if(f&256){k=a+80|0;d=c[k>>2]|0;d=(d^((c[a+96>>2]|0)==0?0:d>>>3))<<15&32768|d>>>1;c[k>>2]=d;if(!(c[a+100>>2]|0)){c[e>>2]=f-(c[a+88>>2]|0);break}else{c[e>>2]=f-(c[a+52>>2]|0);break}}else d=c[a+80>>2]|0;while(0);k=a+124|0;if(d&1){d=c[k>>2]|0;if(!(d&128))e=0;else e=c[1086436+(c[a+92>>2]<<2)>>2]|0;if(!(d&8)){j=0;d=0}else{j=0;d=c[1086436+(c[a+92>>2]<<2)>>2]|0}}else{j=0;e=0;d=0}do{f=a+20+(j<<2)|0;g=(c[f>>2]|0)+l|0;c[f>>2]=g;do if(g&1024){h=c[a+44+(j<<2)>>2]|0;i=a+56+(j<<2)|0;if(h>>>0>1){m=(c[i>>2]|0)==0&1;c[i>>2]=m;c[f>>2]=g-h;f=m;g=16;break}else{c[i>>2]=1;g=17;break}}else{f=c[a+56+(j<<2)>>2]|0;g=16}while(0);if((g|0)==16){g=0;if(f)g=17}if((g|0)==17)if(!(c[a+68+(j<<2)>>2]|0)){f=c[k>>2]|0;if(f&1<<j+4)e=(c[1086436+(c[a+32+(j<<2)>>2]<<2)>>2]|0)+e|0;if(f&1<<j)d=(c[1086436+(c[a+32+(j<<2)>>2]<<2)>>2]|0)+d|0}j=j+1|0}while((j|0)!=3);c[b>>2]=e;c[b+4>>2]=d;return}function Ad(b){b=b|0;var e=0,f=0;a[b+14>>0]=0;a[b+30>>0]=0;a[b+46>>0]=0;a[b+62>>0]=0;a[b+78>>0]=0;a[b+94>>0]=0;a[b+110>>0]=0;a[b+126>>0]=0;a[b+142>>0]=0;a[b+158>>0]=0;a[b+174>>0]=0;a[b+190>>0]=0;a[b+206>>0]=0;a[b+222>>0]=0;a[b+238>>0]=0;a[b+254>>0]=0;a[b+270>>0]=0;a[b+286>>0]=0;a[b+302>>0]=0;a[b+318>>0]=0;a[b+334>>0]=0;a[b+350>>0]=0;a[b+366>>0]=0;a[b+382>>0]=0;a[b+398>>0]=0;a[b+414>>0]=0;a[b+430>>0]=0;a[b+446>>0]=0;a[b+462>>0]=0;a[b+478>>0]=0;a[b+494>>0]=0;a[b+510>>0]=0;c[b+8>>2]=0;a[b+14>>0]=0;c[b+8>>2]=0;a[b+13>>0]=0;a[b+12>>0]=0;e=1;do{a[b+(e<<4)+14>>0]=(d[b+(e<<4)+14>>0]|0)&127;c[b+(e<<4)+8>>2]=0;f=e&255;a[b+(e<<4)+13>>0]=f;a[b+(e<<4)+12>>0]=f;e=e+1|0}while((e|0)!=32);return}function Bd(b){b=b|0;var c=0,d=0,e=0;c=1;while(1){d=b+(c<<4)+14|0;if(!(a[d>>0]|0))break;c=c+1|0;if(c>>>0>=32){c=0;e=5;break}}if((e|0)==5)return c|0;a[d>>0]=-128;e=c;return e|0}function Cd(b,c){b=b|0;c=c|0;var d=0,e=0;e=a[b+(c<<4)+13>>0]|0;d=a[b+(c<<4)+12>>0]|0;a[b+((e&255)<<4)+12>>0]=d;a[b+((d&255)<<4)+13>>0]=e;a[b+(c<<4)+14>>0]=0;return}function Dd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;h=b+(d<<4)+13|0;f=a[h>>0]|0;i=b+(d<<4)+12|0;g=a[i>>0]|0;a[b+((f&255)<<4)+12>>0]=g;a[b+((g&255)<<4)+13>>0]=f;if(!e){c[b+(d<<4)+8>>2]=0;return}g=(c[b+8>>2]|0)+e|0;c[b+(d<<4)+8>>2]=g;if(!g)return;e=a[b+13>>0]|0;f=e&255;a:do if(!(e<<24>>24))e=0;else while(1){j=c[b+(f<<4)+8>>2]|0;if((j|0)!=0&j>>>0>g>>>0)break a;e=a[b+(f<<4)+13>>0]|0;f=e&255;if(!(e<<24>>24)){e=0;break}}while(0);j=b+(f<<4)+12|0;g=a[j>>0]|0;a[h>>0]=e;a[i>>0]=g;d=d&255;a[b+((g&255)<<4)+13>>0]=d;a[j>>0]=d;return}function Ed(a,b,e){a=a|0;b=b|0;e=e|0;if(!b)b=d[a+13>>0]|0;b=c[a+(b<<4)+8>>2]|0;if(!b){e=0;return e|0}if(!e){e=1;return e|0}c[e>>2]=b-(c[a+8>>2]|0);e=1;return e|0}function Fd(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;c[a+(b<<4)+4>>2]=d;c[a+(b<<4)>>2]=e;return}function Gd(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;l=b+8|0;f=(c[l>>2]|0)+e|0;c[l>>2]=f;k=b+13|0;e=a[k>>0]|0;if(!(e<<24>>24)){c[l>>2]=0;return}g=c[b+((e&255)<<4)+8>>2]|0;if((g+-1|0)>>>0<f>>>0)j=g;else return;while(1){i=e<<24>>24==0;if(!i){g=e&255;while(1){h=b+(g<<4)+14|0;a[h>>0]=(d[h>>0]|0)&252;g=a[b+(g<<4)+13>>0]|0;if(!(g<<24>>24))break;else g=g&255}c[l>>2]=f-j;if(!i){g=e&255;while(1){f=b+(g<<4)+8|0;h=c[f>>2]|0;if((h|0)!=0?(c[f>>2]=h-j,(h|0)==(j|0)):0){h=b+(g<<4)+14|0;a[h>>0]=d[h>>0]|0|1}f=a[b+(g<<4)+13>>0]|0;if(!(f<<24>>24))break;else g=f&255}if(!i){e=e&255;while(1){f=b+(e<<4)+14|0;g=d[f>>0]|0;if((g&2|0)==0?(a[f>>0]=g|2,(g&1|0)!=0):0){Ka[c[b+(e<<4)+4>>2]&7](b,e,c[b+(e<<4)>>2]|0);e=0}e=a[b+(e<<4)+13>>0]|0;if(!(e<<24>>24))break;else e=e&255}}}}else c[l>>2]=f-j;e=a[k>>0]|0;j=c[b+((e&255)<<4)+8>>2]|0;if(!j){e=22;break}f=c[l>>2]|0;if(f>>>0<j>>>0){e=22;break}}if((e|0)==22)return}function Hd(b){b=b|0;Kd(b);c[b+120>>2]=1;a[b+21>>0]=1;a[b+22>>0]=3;a[b+23>>0]=4;c[b+76>>2]=1217005;c[b+80>>2]=1218029;c[b+84>>2]=1214173;c[b+88>>2]=1215197;c[b+128>>2]=4;c[b+132>>2]=4;return}function Id(a,b){a=a|0;b=b|0;var e=0;e=a+72|0;c[e>>2]=(c[e>>2]|0)+(d[a+22>>0]|0);return Ja[c[a+140>>2]&7](c[a+136>>2]|0,b)|0}function Jd(a,b,e){a=a|0;b=b|0;e=e|0;var f=0;f=a+72|0;c[f>>2]=(c[f>>2]|0)+(d[a+22>>0]|0);Ka[c[a+144>>2]&7](c[a+136>>2]|0,b,e);return}function Kd(b){b=b|0;var d=0,e=0,f=0,g=0;a[b+25>>0]=0;a[b+24>>0]=0;d=b+15|0;e=b+22|0;f=b;g=f+14|0;do{a[f>>0]=0;f=f+1|0}while((f|0)<(g|0));a[d>>0]=0;a[d+1>>0]=0;a[d+2>>0]=0;a[d+3>>0]=0;a[d+4>>0]=0;a[d+5>>0]=0;a[d+6>>0]=0;a[e>>0]=3;a[b+23>>0]=4;c[b+92>>2]=0;c[b+116>>2]=0;c[b+120>>2]=0;d=b+124|0;f=b+28|0;g=f+48|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(g|0));c[d>>2]=10;c[b+168>>2]=0;c[b+160>>2]=0;c[b+164>>2]=0;return}function Ld(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0;va=i;i=i+16|0;ta=va+4|0;sa=va;ua=b+72|0;c[ua>>2]=0;n=b+136|0;if(!e){ta=0;c[ua>>2]=0;i=va;return ta|0}J=b+160|0;U=b+32|0;ea=b+60|0;la=b+24|0;oa=b+12|0;pa=b+21|0;qa=b+124|0;o=b+88|0;p=b+76|0;q=b+132|0;r=b+68|0;s=b+64|0;t=b+25|0;u=b+7|0;v=b+52|0;w=b+6|0;x=b+1|0;y=b+3|0;z=b+2|0;B=b+5|0;C=b+4|0;D=b+28|0;E=b+10|0;F=b+11|0;G=b+8|0;H=b+9|0;I=b+13|0;K=b+18|0;L=b+15|0;M=b+19|0;N=b+36|0;O=b+40|0;P=b+44|0;Q=b+48|0;R=b+128|0;S=b+120|0;T=b+56|0;V=b+16|0;W=b+116|0;X=b+23|0;Y=b+148|0;Z=b+152|0;$=b+20|0;aa=b+17|0;ba=ta+2|0;ca=ta+1|0;da=b+80|0;fa=ta+3|0;ga=b+84|0;ha=b+164|0;ia=b+168|0;ja=b+22|0;ka=b+156|0;f=0;ra=0;while(1){g=c[J>>2]|0;if(g){l=(Ja[g&7](c[n>>2]|0,b)|0)==0;f=c[ua>>2]|0;if(!l){m=273;break}}c[ea>>2]=c[U>>2];a[la>>0]=0;a[oa>>0]=(a[oa>>0]|0)+1<<24>>24;c[ua>>2]=f+(d[pa>>0]|0);l=Ha[c[qa>>2]&15](b)|0;c[ua>>2]=(c[ua>>2]|0)+(d[(c[o>>2]|0)+l>>0]|0);h=a[la>>0]|0;f=l;l=(c[p>>2]|0)+(l<<2)|0;while(1){g=h&255;a[la>>0]=g&254;k=l+2|0;a:do switch(d[k>>0]|0){case 14:{c[r>>2]=c[D>>2];break}case 1:{c[r>>2]=(Ha[c[qa>>2]&15](b)|0)+(d[u>>0]<<8);break}case 2:{c[r>>2]=Ha[c[qa>>2]&15](b)|0;c[r>>2]=((Ha[c[qa>>2]&15](b)|0)<<8)+(c[r>>2]|0);break}case 3:{c[r>>2]=d[b>>0]<<8|d[x>>0];break}case 4:{c[r>>2]=d[z>>0]<<8|d[y>>0];break}case 5:{c[r>>2]=d[C>>0]<<8|d[B>>0];break}case 6:{do if(!(g&2))if(!(g&4)){g=d[C>>0]<<8|d[B>>0];break}else{g=d[F>>0]<<8|d[E>>0];break}else g=d[H>>0]<<8|d[G>>0];while(0);c[r>>2]=g;break}case 7:{if(g&2){j=Ha[c[qa>>2]&15](b)|0;j=(j^128)+65408+(d[H>>0]<<8|d[G>>0])&65535;c[T>>2]=j;c[r>>2]=j;break a}if(!(g&4)){c[r>>2]=d[C>>0]<<8|d[B>>0];break a}else{j=Ha[c[qa>>2]&15](b)|0;j=(j^128)+65408+(d[F>>0]<<8|d[E>>0])&65535;c[T>>2]=j;c[r>>2]=j;break a}}case 8:{c[r>>2]=Ha[c[qa>>2]&15](b)|0;break}case 9:{c[r>>2]=d[x>>0];break}case 10:{h=d[B>>0]|0;j=d[C>>0]<<8|h;c[r>>2]=j;a[B>>0]=h+1;a[C>>0]=(j+1|0)>>>8;break}case 11:{h=d[B>>0]|0;j=d[C>>0]<<8|h;c[r>>2]=j;a[B>>0]=h+255;a[C>>0]=(j+65535|0)>>>8;break}case 12:{c[r>>2]=(Ha[c[qa>>2]&15](b)|0)+65280;break}case 13:{c[r>>2]=d[x>>0]|65280;break}default:{}}while(0);j=l+1|0;g=d[j>>0]|0;do switch(g|0){case 25:{g=d[t>>0]&15|d[u>>0]<<8;c[s>>2]=g;h=a[w>>0]|0;if(h&64){g=g|128;c[s>>2]=g}if(h&2){g=g+64|0;c[s>>2]=g}if(h&16){g=g+32|0;c[s>>2]=g}if(h&1)c[s>>2]=g+16;break}case 8:case 6:case 5:case 4:case 3:case 2:case 1:{c[s>>2]=d[b+(g+-1)>>0];break}case 7:{c[s>>2]=Ja[c[R>>2]&7](b,c[r>>2]|0)|0;break}case 9:{c[s>>2]=d[b>>0]<<8|d[x>>0];break}case 10:{c[s>>2]=d[z>>0]<<8|d[y>>0];break}case 11:{c[s>>2]=d[C>>0]<<8|d[B>>0];break}case 12:{c[s>>2]=d[u>>0]<<8|d[w>>0];break}case 13:{c[s>>2]=c[D>>2];break}case 14:{c[s>>2]=Ja[c[R>>2]&7](b,c[r>>2]|0)|0;c[s>>2]=((Ja[c[R>>2]&7](b,(c[r>>2]|0)+1&65535)|0)<<8)+(c[s>>2]|0);break}case 15:{c[s>>2]=Ha[c[qa>>2]&15](b)|0;break}case 16:{c[s>>2]=Ha[c[qa>>2]&15](b)|0;c[s>>2]=((Ha[c[qa>>2]&15](b)|0)<<8)+(c[s>>2]|0);break}case 17:{g=d[la>>0]|0;do if(!(g&2))if(!(g&4)){g=d[C>>0]<<8|d[B>>0];break}else{g=d[F>>0]<<8|d[E>>0];break}else g=d[H>>0]<<8|d[G>>0];while(0);c[s>>2]=g;break}case 18:{g=d[la>>0]|0;if(!(g&2))g=(g&4|0)==0?C:F;else g=H;c[s>>2]=d[g>>0];break}case 19:{g=d[la>>0]|0;if(!(g&2))g=(g&4|0)==0?B:E;else g=G;c[s>>2]=d[g>>0];break}case 20:{h=d[I>>0]|0;c[s>>2]=h;h=d[1216493+h>>0]&232|d[w>>0]&1|((a[V>>0]|0)!=0?4:0);c[v>>2]=h;a[w>>0]=h;break}case 21:{h=d[I>>0]&128|d[oa>>0]&127;c[s>>2]=h;h=d[1216493+h>>0]&232|d[w>>0]&1|((a[V>>0]|0)!=0?4:0);c[v>>2]=h;a[w>>0]=h;break}case 22:{c[s>>2]=0;break}case 23:{c[s>>2]=Ja[c[R>>2]&7](b,c[D>>2]|0)|0;c[s>>2]=((Ja[c[R>>2]&7](b,(c[D>>2]|0)+1&65535)|0)<<8)+(c[s>>2]|0);c[D>>2]=(c[D>>2]|0)+2&65535;break}case 24:{c[s>>2]=((Ha[c[qa>>2]&15](b)|0)^128)+65408&65535;break}default:{}}while(0);b:do switch(d[l+3>>0]|0){case 85:{m=c[s>>2]|0;m=m>>>4&15|m<<4&240;c[s>>2]=m;m=(m|0)!=0?0:64;c[v>>2]=m;a[w>>0]=m;m=187;break}case 1:{m=c[s>>2]|0;c[s>>2]=c[N>>2];c[N>>2]=m;m=187;break}case 2:{m=d[b>>0]<<8|d[x>>0];k=c[O>>2]|0;a[x>>0]=k;a[b>>0]=k>>>8;c[O>>2]=m;m=d[z>>0]<<8|d[y>>0];k=c[P>>2]|0;a[y>>0]=k;a[z>>0]=k>>>8;c[P>>2]=m;m=d[C>>0]<<8|d[B>>0];k=c[Q>>2]|0;a[B>>0]=k;a[C>>0]=k>>>8;c[Q>>2]=m;m=187;break}case 3:{a[y>>0]=a[B>>0]|0;a[z>>0]=a[C>>0]|0;m=c[s>>2]|0;a[B>>0]=m;a[C>>0]=m>>>8;m=187;break}case 4:{m=(Ja[c[R>>2]&7](b,c[D>>2]|0)|0)+((Ja[c[R>>2]&7](b,(c[D>>2]|0)+1&65535)|0)<<8)|0;Ka[c[q>>2]&7](b,c[D>>2]|0,c[s>>2]&255);Ka[c[q>>2]&7](b,(c[D>>2]|0)+1&65535,(c[s>>2]|0)>>>8&255);c[s>>2]=m;m=187;break}case 5:{k=d[u>>0]|0;j=c[s>>2]|0;m=j^k;j=j+k|0;c[s>>2]=j;m=d[1216493+j>>0]&233|(j^m)&16|((j^k)&(m^128))>>>5&4;c[v>>2]=m;a[w>>0]=m;m=187;break}case 6:{k=d[u>>0]|0;j=c[s>>2]|0;m=j^k;j=j+k+(d[w>>0]&1)|0;c[s>>2]=j;m=(j^m)&16|d[1216493+j>>0]&233|((j^k)&(m^128))>>>5&4;c[v>>2]=m;a[w>>0]=m;m=187;break}case 7:{j=c[s>>2]^255;k=d[u>>0]|0;m=k^j;j=k+j+1|0;c[s>>2]=j;m=((j^m)&16|d[1216493+j>>0]&235|((j^k)&(m^128))>>>5&4)^1;c[v>>2]=m;a[w>>0]=m;m=187;break}case 8:{j=c[s>>2]^255;k=d[u>>0]|0;m=k^j;j=k+j+(d[w>>0]&1^1)|0;c[s>>2]=j;m=((j^m)&16|d[1216493+j>>0]&235|((j^k)&(m^128))>>>5&4)^1;c[v>>2]=m;a[w>>0]=m;m=187;break}case 9:{m=d[u>>0]&c[s>>2];c[s>>2]=m;m=d[1216493+m>>0]&252;c[v>>2]=m;a[w>>0]=m;m=187;break}case 10:{m=d[u>>0]|c[s>>2];c[s>>2]=m;m=d[1216493+m>>0]&236;c[v>>2]=m;a[w>>0]=m;m=187;break}case 11:{m=d[u>>0]^c[s>>2];c[s>>2]=m;m=d[1216493+m>>0]&236;c[v>>2]=m;a[w>>0]=m;m=187;break}case 12:{j=c[s>>2]^255;m=d[u>>0]|0;k=m^j;j=m+j+1|0;c[s>>2]=j;k=((j^k)&16|d[1216493+j>>0]&195|((j^m)&(k^128))>>>5&4)^1;c[v>>2]=k;a[w>>0]=k|m&40;m=187;break}case 13:{m=c[s>>2]|0;k=m+1|0;c[s>>2]=k;m=d[1216493+k>>0]&233|(k^m)&16|(k&(m^128))>>>5&4;c[v>>2]=m;a[w>>0]=m&252|d[w>>0]&1;m=187;break}case 14:{m=c[s>>2]|0;k=m+255|0;c[s>>2]=k;m=(m^16^k)&16|d[1216493+k>>0]&235|((k^128)&m)>>>5&4;c[v>>2]=m^1;a[w>>0]=m&254|d[w>>0]&1;m=187;break}case 15:{if(!(c[S>>2]&1)){g=d[w>>0]|0;c[v>>2]=g}else g=c[v>>2]|0;h=a[w>>0]|0;j=g&1;if(!(h&2)){c[v>>2]=0;if((h&16)==0?(na=c[s>>2]|0,(na&14)>>>0<=9):0){h=na;g=0}else{h=(c[s>>2]|0)+6|0;c[s>>2]=h;c[v>>2]=16;g=16}if((j|0)!=0|h>>>0>153){h=h+96|0;c[s>>2]=h;g=g|1;c[v>>2]=g}}else{c[v>>2]=2;if((h&16)==0?(ma=c[s>>2]|0,(ma&14)>>>0<=9):0){h=ma;g=2}else{h=(c[s>>2]|0)+250^256;c[s>>2]=h;c[v>>2]=18;g=18}if((j|0)!=0|h>>>0>153){h=h+160^256;c[s>>2]=h;g=g|1;c[v>>2]=g}}a[w>>0]=(d[1216493+h>>0]&236)+g;m=187;break}case 16:{m=c[s>>2]^255;c[s>>2]=m;m=d[1216493+m>>0]&58|d[w>>0]&197;c[v>>2]=m;a[w>>0]=m;m=187;break}case 17:{m=c[s>>2]|0;j=m^255;a[u>>0]=0;k=j+1|0;c[s>>2]=k;m=((k^j)&16|d[1216493+k>>0]&235|(k&m)>>>5&4)^1;c[v>>2]=m;a[w>>0]=m;m=187;break}case 18:{m=c[r>>2]|0;c[T>>2]=m;k=c[s>>2]|0;j=k+m|0;c[s>>2]=j;m=d[w>>0]&196|d[1216493+(j>>>8)>>0]&41|(j^(k^m))>>>8&16;c[v>>2]=m;a[w>>0]=m;m=187;break}case 19:{m=d[w>>0]&1;j=c[r>>2]|0;c[T>>2]=j;h=c[s>>2]|0;k=h^j;m=h+j+m|0;c[s>>2]=m;m=(m^k)>>>8&16|d[1216493+(m>>>8)>>0]&169|((m^j)&(k^32768))>>>13&4|((m&65535|0)!=0?0:64);c[v>>2]=m;a[w>>0]=m;m=187;break}case 20:{m=d[w>>0]&1^1;h=c[s>>2]^65535;j=c[r>>2]|0;c[T>>2]=j;k=h^j;m=h+j+m|0;c[s>>2]=m;m=((m^k)>>>8&16|d[1216493+(m>>>8)>>0]&171|((m^j)&(k^32768))>>>13&4|((m&65535|0)!=0?0:64))^1;c[v>>2]=m;a[w>>0]=m;m=187;break}case 21:{c[s>>2]=(c[s>>2]|0)+1&65535;m=187;break}case 22:{c[s>>2]=(c[s>>2]|0)+65535&65535;m=187;break}case 23:{c[v>>2]=d[w>>0]&193;k=Ja[c[R>>2]&7](b,d[C>>0]<<8|d[B>>0])|0;c[s>>2]=k;Ka[c[q>>2]&7](b,d[z>>0]<<8|d[y>>0],k);k=(c[s>>2]|0)+(d[u>>0]|0)|0;c[s>>2]=k;m=(d[C>>0]<<8|d[B>>0])+1|0;a[B>>0]=m;a[C>>0]=m>>>8;m=(d[z>>0]<<8|d[y>>0])+1|0;a[y>>0]=m;a[z>>0]=m>>>8;m=(d[b>>0]<<8|d[x>>0])+-1|0;a[x>>0]=m;a[b>>0]=m>>>8;a[w>>0]=k<<4&32|k&8|d[w>>0]&193|((m&65535|0)!=0?4:0);m=187;break}case 24:{c[v>>2]=d[w>>0]&193;k=Ja[c[R>>2]&7](b,d[C>>0]<<8|d[B>>0])|0;c[s>>2]=k;Ka[c[q>>2]&7](b,d[z>>0]<<8|d[y>>0],k);k=(c[s>>2]|0)+(d[u>>0]|0)|0;c[s>>2]=k;m=(d[C>>0]<<8|d[B>>0])+-1|0;a[B>>0]=m;a[C>>0]=m>>>8;m=(d[z>>0]<<8|d[y>>0])+-1|0;a[y>>0]=m;a[z>>0]=m>>>8;m=(d[b>>0]<<8|d[x>>0])+-1|0;a[x>>0]=m;a[b>>0]=m>>>8;a[w>>0]=k<<4&32|k&8|d[w>>0]&193|((m&65535|0)!=0?4:0);m=187;break}case 25:{c[v>>2]=1;m=(Ja[c[R>>2]&7](b,d[C>>0]<<8|d[B>>0])|0)^255;g=d[u>>0]|0;h=g^m;m=g+m+(c[v>>2]&1)|0;k=m^h;j=k&16|d[1216493+m>>0]&194;c[v>>2]=j|((m^g)&(h^128))>>>5&4;k=m-(k>>>4&1)|0;c[s>>2]=k;m=(d[C>>0]<<8|d[B>>0])+1|0;a[B>>0]=m;a[C>>0]=m>>>8;m=(d[b>>0]<<8|d[x>>0])+-1|0;a[x>>0]=m;a[b>>0]=m>>>8;a[w>>0]=j|k&8|k<<4&32|d[w>>0]&1|((m&65535|0)!=0?4:0);m=187;break}case 26:{c[v>>2]=1;m=(Ja[c[R>>2]&7](b,d[C>>0]<<8|d[B>>0])|0)^255;g=d[u>>0]|0;h=g^m;m=g+m+(c[v>>2]&1)|0;k=m^h;j=k&16|d[1216493+m>>0]&194;c[v>>2]=j|((m^g)&(h^128))>>>5&4;k=m-(k>>>4&1)|0;c[s>>2]=k;m=(d[C>>0]<<8|d[B>>0])+-1|0;a[B>>0]=m;a[C>>0]=m>>>8;m=(d[b>>0]<<8|d[x>>0])+-1|0;a[x>>0]=m;a[b>>0]=m>>>8;a[w>>0]=j|k&8|k<<4&32|d[w>>0]&1|((m&65535|0)!=0?4:0);m=187;break}case 27:{c[ea>>2]=c[s>>2];m=187;break}case 28:{if(!(Ha[c[1086500+((f>>>3&3)<<2)>>2]&15](b)|0))m=187;else{c[ua>>2]=(c[ua>>2]|0)+(d[(c[o>>2]|0)+1286>>0]|0);c[ea>>2]=c[s>>2];m=187}break}case 29:{if(!(Ha[c[1086516+((f>>>3&3)<<2)>>2]&15](b)|0))m=187;else{c[ua>>2]=(c[ua>>2]|0)+(d[(c[o>>2]|0)+1286>>0]|0);c[ea>>2]=c[s>>2];m=187}break}case 30:{m=(c[ea>>2]|0)+65408+(c[s>>2]^128)&65535;c[T>>2]=m;c[ea>>2]=m;m=187;break}case 31:{if(!(Ha[c[1086500+((f>>>3&3)<<2)>>2]&15](b)|0))m=187;else{c[ua>>2]=(c[ua>>2]|0)+(d[(c[o>>2]|0)+1284>>0]|0);m=(c[ea>>2]|0)+65408+(c[s>>2]^128)&65535;c[T>>2]=m;c[ea>>2]=m;m=187}break}case 32:{m=(d[b>>0]|0)+255&255;a[b>>0]=m;if(!(m<<24>>24))m=187;else{c[ua>>2]=(c[ua>>2]|0)+(d[(c[o>>2]|0)+1280>>0]|0);m=(c[ea>>2]|0)+65408+(c[s>>2]^128)&65535;c[T>>2]=m;c[ea>>2]=m;m=187}break}case 33:{m=(c[D>>2]|0)+65534&65535;c[D>>2]=m;Ka[c[q>>2]&7](b,m,c[ea>>2]&255);Ka[c[q>>2]&7](b,(c[D>>2]|0)+1&65535,(c[ea>>2]|0)>>>8&255);c[ea>>2]=c[s>>2];m=187;break}case 34:{if(!(Ha[c[1086500+((f>>>3&3)<<2)>>2]&15](b)|0))m=187;else{c[ua>>2]=(c[ua>>2]|0)+(d[(c[o>>2]|0)+1282>>0]|0);m=(c[D>>2]|0)+65534&65535;c[D>>2]=m;Ka[c[q>>2]&7](b,m,c[ea>>2]&255);Ka[c[q>>2]&7](b,(c[D>>2]|0)+1&65535,(c[ea>>2]|0)>>>8&255);c[ea>>2]=c[s>>2];m=187}break}case 35:{if(!(Ha[c[1086516+((f>>>3&3)<<2)>>2]&15](b)|0))m=187;else{c[ua>>2]=(c[ua>>2]|0)+(d[(c[o>>2]|0)+1282>>0]|0);m=(c[D>>2]|0)+65534&65535;c[D>>2]=m;Ka[c[q>>2]&7](b,m,c[ea>>2]&255);Ka[c[q>>2]&7](b,(c[D>>2]|0)+1&65535,(c[ea>>2]|0)>>>8&255);c[ea>>2]=c[s>>2];m=187}break}case 36:{if(!(Ha[c[1086500+((f>>>3&3)<<2)>>2]&15](b)|0))m=187;else{c[ua>>2]=(c[ua>>2]|0)+(d[(c[o>>2]|0)+1288>>0]|0);c[ea>>2]=Ja[c[R>>2]&7](b,c[D>>2]|0)|0;m=(Ja[c[R>>2]&7](b,(c[D>>2]|0)+1&65535)|0)<<8;c[ea>>2]=(c[ea>>2]|0)+m;c[D>>2]=(c[D>>2]|0)+2&65535;m=187}break}case 37:{if(!(Ha[c[1086516+((f>>>3&3)<<2)>>2]&15](b)|0))m=187;else{c[ua>>2]=(c[ua>>2]|0)+(d[(c[o>>2]|0)+1288>>0]|0);c[ea>>2]=Ja[c[R>>2]&7](b,c[D>>2]|0)|0;m=(Ja[c[R>>2]&7](b,(c[D>>2]|0)+1&65535)|0)<<8;c[ea>>2]=(c[ea>>2]|0)+m;c[D>>2]=(c[D>>2]|0)+2&65535;m=187}break}case 39:case 38:{c[ea>>2]=c[s>>2];a[L>>0]=a[V>>0]|0;m=187;break}case 40:{m=(c[D>>2]|0)+65534&65535;c[D>>2]=m;Ka[c[q>>2]&7](b,m,c[ea>>2]&255);Ka[c[q>>2]&7](b,(c[D>>2]|0)+1&65535,(c[ea>>2]|0)>>>8&255);c[ea>>2]=(c[W>>2]|0)+(f&56);m=187;break}case 41:{m=c[s>>2]|0;m=m>>>7&1|m<<1;c[s>>2]=m;m=d[1216493+m>>0]&41|d[w>>0]&212;c[v>>2]=m;a[w>>0]=m;m=187;break}case 42:{k=c[s>>2]|0;m=k&1;m=(m<<7)+(k>>>1)+(m<<8)|0;c[s>>2]=m;m=d[1216493+m>>0]&41|d[w>>0]&212;c[v>>2]=m;a[w>>0]=m;m=187;break}case 43:{m=d[w>>0]|0;k=m&1|c[s>>2]<<1;c[s>>2]=k;m=d[1216493+k>>0]&41|m&212;c[v>>2]=m;a[w>>0]=m;m=187;break}case 44:{k=c[s>>2]|0;m=d[w>>0]|0;k=(k<<8&256)+(k>>>1)+(m<<7&128)|0;c[s>>2]=k;m=d[1216493+k>>0]&41|m&212;c[v>>2]=m;a[w>>0]=m;m=187;break}case 45:{m=c[s>>2]|0;m=m>>>7&1|m<<1;c[s>>2]=m;m=d[1216493+m>>0]&237;c[v>>2]=m;a[w>>0]=m;m=187;break}case 46:{k=c[s>>2]|0;m=k&1;m=(m<<7)+(k>>>1)+(m<<8)|0;c[s>>2]=m;m=d[1216493+m>>0]&237;c[v>>2]=m;a[w>>0]=m;m=187;break}case 47:{m=d[w>>0]&1|c[s>>2]<<1;c[s>>2]=m;m=d[1216493+m>>0]&237;c[v>>2]=m;a[w>>0]=m;m=187;break}case 48:{m=c[s>>2]|0;m=(m<<8&256)+(m>>>1)+(d[w>>0]<<7&128)|0;c[s>>2]=m;m=d[1216493+m>>0]&237;c[v>>2]=m;a[w>>0]=m;m=187;break}case 49:{m=c[s>>2]<<1;c[s>>2]=m;m=d[1216493+m>>0]&237;c[v>>2]=m;a[w>>0]=m;m=187;break}case 50:{m=c[s>>2]|0;m=(m>>>1)+(m&128)+(m<<8&256)|0;c[s>>2]=m;m=d[1216493+m>>0]&237;c[v>>2]=m;a[w>>0]=m;m=187;break}case 51:{m=c[s>>2]<<1|1;c[s>>2]=m;m=d[1216493+m>>0]&237;c[v>>2]=m;a[w>>0]=m;m=187;break}case 52:{m=c[s>>2]|0;m=(m<<8&256)+(m>>>1)|0;c[s>>2]=m;m=d[1216493+m>>0]&237;c[v>>2]=m;a[w>>0]=m;m=187;break}case 53:{k=c[s>>2]|0;j=d[u>>0]|0;m=j&240|k>>>4&15;a[u>>0]=m;c[s>>2]=j&15|k<<4&240;m=d[1216493+m>>0]&236|d[w>>0]&1;c[v>>2]=m;a[w>>0]=m;m=187;break}case 54:{m=d[u>>0]|0;k=(m<<8)+(c[s>>2]|0)|0;m=k&15|m&240;a[u>>0]=m;c[s>>2]=k>>>4&255;m=d[1216493+m>>0]&236|d[w>>0]&1;c[v>>2]=m;a[w>>0]=m;m=187;break}case 55:{g=c[s>>2]&1<<(f>>>3&7);h=d[w>>0]&1|((g|0)!=0?0:68);c[v>>2]=h;if((a[j>>0]|0)==7){a[w>>0]=h|g&128|(c[T>>2]|0)>>>8&40;m=187;break b}else{a[w>>0]=h|g&168;m=187;break b}}case 56:{c[s>>2]=c[s>>2]&~(1<<(f>>>3&7));m=187;break}case 57:{c[s>>2]=c[s>>2]|1<<(f>>>3&7);m=187;break}case 58:{c[ua>>2]=(c[ua>>2]|0)+(d[X>>0]|0);g=Ja[c[Y>>2]&7](c[n>>2]|0,c[r>>2]|0)|0;c[s>>2]=g;if((a[k>>0]|0)==1)m=187;else{m=d[1216493+g>>0]&236|d[w>>0]&1;c[v>>2]=m;a[w>>0]=m;m=187}break}case 59:{c[ua>>2]=(c[ua>>2]|0)+(d[X>>0]|0);Ka[c[Z>>2]&7](c[n>>2]|0,c[r>>2]|0,c[s>>2]|0);m=187;break}case 60:{c[ua>>2]=(c[ua>>2]|0)+(d[X>>0]|0);m=Ja[c[Y>>2]&7](c[n>>2]|0,c[r>>2]|0)|0;c[s>>2]=m;Ka[c[q>>2]&7](b,d[C>>0]<<8|d[B>>0],m);Nd(b,1);m=187;break}case 62:{c[ua>>2]=(c[ua>>2]|0)+(d[X>>0]|0);m=Ja[c[Y>>2]&7](c[n>>2]|0,c[r>>2]|0)|0;c[s>>2]=m;Ka[c[q>>2]&7](b,d[C>>0]<<8|d[B>>0],m);Nd(b,-1);m=187;break}case 61:{m=Ja[c[R>>2]&7](b,d[C>>0]<<8|d[B>>0])|0;c[s>>2]=m;c[ua>>2]=(c[ua>>2]|0)+(d[X>>0]|0);Ka[c[Z>>2]&7](c[n>>2]|0,c[r>>2]|0,m);Nd(b,1);m=187;break}case 63:{m=Ja[c[R>>2]&7](b,d[C>>0]<<8|d[B>>0])|0;c[s>>2]=m;c[ua>>2]=(c[ua>>2]|0)+(d[X>>0]|0);Ka[c[Z>>2]&7](c[n>>2]|0,c[r>>2]|0,m);Nd(b,-1);m=187;break}case 64:{m=d[w>>0]|0;m=(d[u>>0]&40|m&197|m<<4&16)^1;c[v>>2]=m;a[w>>0]=m;m=187;break}case 65:{m=d[w>>0]&196|d[u>>0]&40|1;c[v>>2]=m;a[w>>0]=m;m=187;break}case 66:{c[ea>>2]=c[U>>2];a[$>>0]=1;m=187;break}case 67:{c[ea>>2]=c[U>>2];a[$>>0]=2;m=187;break}case 68:{a[V>>0]=0;a[L>>0]=0;c[U>>2]=c[ea>>2];a[la>>0]=1;a[oa>>0]=(a[oa>>0]|0)+1<<24>>24;c[ua>>2]=(c[ua>>2]|0)+(d[pa>>0]|0);g=Ha[c[qa>>2]&15](b)|0;c[ua>>2]=(c[ua>>2]|0)+(d[(c[o>>2]|0)+g>>0]|0);f=g;g=(c[p>>2]|0)+(g<<2)|0;break}case 69:{a[V>>0]=1;a[L>>0]=1;c[U>>2]=c[ea>>2];a[la>>0]=1;a[oa>>0]=(a[oa>>0]|0)+1<<24>>24;c[ua>>2]=(c[ua>>2]|0)+(d[pa>>0]|0);g=Ha[c[qa>>2]&15](b)|0;c[ua>>2]=(c[ua>>2]|0)+(d[(c[o>>2]|0)+g>>0]|0);f=g;g=(c[p>>2]|0)+(g<<2)|0;break}case 70:{if((d[aa>>0]|0)<3){a[aa>>0]=0;m=187}else m=187;break}case 71:{if((d[aa>>0]|0)<3){a[aa>>0]=1;m=187}else m=187;break}case 72:{if((d[aa>>0]|0)<3){a[aa>>0]=2;m=187}else m=187;break}case 73:{f=d[la>>0]|0;c:do if(!(f&2)){if(!(f&4)){c[r>>2]=d[C>>0]<<8|d[B>>0];a[oa>>0]=(a[oa>>0]|0)+1<<24>>24;c[ua>>2]=(c[ua>>2]|0)+(d[pa>>0]|0);f=Ha[c[qa>>2]&15](b)|0;c[ua>>2]=(c[ua>>2]|0)+(d[(c[o>>2]|0)+(f+512)>>0]|0);a[ba>>0]=0;l=(f&7)+1&255;a[ca>>0]=l;k=a[(c[da>>2]|0)+(f>>>3&31)>>0]|0;a[fa>>0]=k;a[ta>>0]=k<<24>>24==55?0:l;break}f=Ha[c[qa>>2]&15](b)|0;f=(f^128)+65408+(d[F>>0]<<8|d[E>>0])&65535;c[T>>2]=f;c[r>>2]=f;f=Ha[c[qa>>2]&15](b)|0;c[ua>>2]=(c[ua>>2]|0)+(d[(c[o>>2]|0)+(f+768)>>0]|0);a[ba>>0]=0;a[ca>>0]=7;l=a[(c[da>>2]|0)+(f>>>3&31)>>0]|0;a[fa>>0]=l;l=l<<24>>24==55?0:(f&7)+1|0;a[ta>>0]=l;switch(l|0){case 7:case 0:break c;default:{}}a[la>>0]=d[la>>0]|8}else{f=Ha[c[qa>>2]&15](b)|0;f=(f^128)+65408+(d[H>>0]<<8|d[G>>0])&65535;c[T>>2]=f;c[r>>2]=f;f=Ha[c[qa>>2]&15](b)|0;c[ua>>2]=(c[ua>>2]|0)+(d[(c[o>>2]|0)+(f+768)>>0]|0);a[ba>>0]=0;a[ca>>0]=7;l=a[(c[da>>2]|0)+(f>>>3&31)>>0]|0;a[fa>>0]=l;l=l<<24>>24==55?0:(f&7)+1|0;a[ta>>0]=l;switch(l|0){case 7:case 0:break c;default:{}}a[la>>0]=d[la>>0]|8}while(0);a[la>>0]=d[la>>0]|1;g=ta;break}case 74:{c[U>>2]=(c[ea>>2]|0)+65535&65535;a[la>>0]=3;a[oa>>0]=(a[oa>>0]|0)+1<<24>>24;c[ua>>2]=(c[ua>>2]|0)+(d[pa>>0]|0);g=Ha[c[qa>>2]&15](b)|0;c[ua>>2]=(c[ua>>2]|0)+(d[(c[o>>2]|0)+(g+256)>>0]|0);f=g;g=(c[p>>2]|0)+(g<<2)|0;break}case 75:{c[U>>2]=(c[ea>>2]|0)+65535&65535;a[la>>0]=1;a[oa>>0]=(a[oa>>0]|0)+1<<24>>24;c[ua>>2]=(c[ua>>2]|0)+(d[pa>>0]|0);g=Ha[c[qa>>2]&15](b)|0;c[ua>>2]=(c[ua>>2]|0)+(d[(c[o>>2]|0)+(g+1024)>>0]|0);f=g;g=(c[ga>>2]|0)+(g<<2)|0;break}case 76:{c[U>>2]=(c[ea>>2]|0)+65535&65535;a[la>>0]=5;a[oa>>0]=(a[oa>>0]|0)+1<<24>>24;c[ua>>2]=(c[ua>>2]|0)+(d[pa>>0]|0);g=Ha[c[qa>>2]&15](b)|0;c[ua>>2]=(c[ua>>2]|0)+(d[(c[o>>2]|0)+(g+256)>>0]|0);f=g;g=(c[p>>2]|0)+(g<<2)|0;break}case 77:{g=c[ha>>2]|0;if(!g)m=187;else{Ja[g&7](c[n>>2]|0,b)|0;m=187}break}case 78:{m=d[u>>0]&c[s>>2];c[s>>2]=m;m=d[1216493+m>>0]&252;c[v>>2]=m;a[w>>0]=m;m=187;break}case 79:{c[ua>>2]=(c[ua>>2]|0)+(d[X>>0]|0);m=c[s>>2]&(Ja[c[Y>>2]&7](c[n>>2]|0,c[r>>2]|0)|0);c[s>>2]=m;m=d[1216493+m>>0]&252;c[v>>2]=m;a[w>>0]=m;m=187;break}case 80:{k=Ja[c[R>>2]&7](b,d[C>>0]<<8|d[B>>0])|0;c[s>>2]=k;c[ua>>2]=(c[ua>>2]|0)+(d[X>>0]|0);Ka[c[Z>>2]&7](c[n>>2]|0,c[r>>2]|0,k);k=(d[C>>0]<<8|d[B>>0])+1|0;a[B>>0]=k;a[C>>0]=k>>>8;a[x>>0]=(d[x>>0]|0)+1;k=d[b>>0]|0;m=k+255|0;a[b>>0]=m;m=((m^k)&16|(c[s>>2]|0)>>>6&2|d[1216493+(m&255)>>0]&237)^16;c[v>>2]=m;a[w>>0]=m;m=187;break}case 81:{k=Ja[c[R>>2]&7](b,d[C>>0]<<8|d[B>>0])|0;c[s>>2]=k;c[ua>>2]=(c[ua>>2]|0)+(d[X>>0]|0);Ka[c[Z>>2]&7](c[n>>2]|0,c[r>>2]|0,k);k=(d[C>>0]<<8|d[B>>0])+-1|0;a[B>>0]=k;a[C>>0]=k>>>8;a[x>>0]=(d[x>>0]|0)+1;k=d[b>>0]|0;m=k+255|0;a[b>>0]=m;m=((m^k)&16|(c[s>>2]|0)>>>6&2|d[1216493+(m&255)>>0]&237)^16;c[v>>2]=m;a[w>>0]=m;m=187;break}case 82:{m=c[s>>2]|0;c[s>>2]=_(m>>>8&255,m&255)|0;m=187;break}case 83:{m=_(d[u>>0]|0,c[s>>2]|0)|0;c[s>>2]=m;m=m>>>0>255|d[w>>0]&20|((m|0)==0&1)<<6;c[v>>2]=m;a[w>>0]=m;m=187;break}case 84:{m=_(c[r>>2]|0,c[s>>2]|0)|0;c[s>>2]=m;m=d[w>>0]&20|m>>>0>65535|((m|0)==0&1)<<6;c[v>>2]=m;a[w>>0]=m;m=187;break}default:m=187}while(0);if((m|0)==187){m=0;g=d[l>>0]|0;d:do switch(g|0){case 25:{j=c[s>>2]|0;a[t>>0]=j&15;a[u>>0]=j>>>8;g=j>>>1&64;wa=j&64;h=wa>>>5|g;xa=j&32;k=xa>>>1|h;j=j&16;c[v>>2]=(j|0)==0?((xa|0)==0?wa>>>5|g:h|16):k|1;a[w>>0]=j>>>4|k;break}case 8:case 6:case 5:case 4:case 3:case 2:case 1:{a[b+(g+-1)>>0]=c[s>>2];break}case 7:{Ka[c[q>>2]&7](b,c[r>>2]|0,c[s>>2]|0);break}case 9:{xa=c[s>>2]|0;a[x>>0]=xa;a[b>>0]=xa>>>8;break}case 10:{xa=c[s>>2]|0;a[y>>0]=xa;a[z>>0]=xa>>>8;break}case 11:{xa=c[s>>2]|0;a[B>>0]=xa;a[C>>0]=xa>>>8;break}case 12:{xa=c[s>>2]|0;a[w>>0]=xa;a[u>>0]=xa>>>8;break}case 13:{c[D>>2]=c[s>>2]&65535;break}case 14:{Ka[c[q>>2]&7](b,c[r>>2]|0,c[s>>2]&255);Ka[c[q>>2]&7](b,(c[r>>2]|0)+1&65535,(c[s>>2]|0)>>>8&255);break}case 15:{g=d[la>>0]|0;if(g&2){xa=c[s>>2]|0;a[G>>0]=xa;a[H>>0]=xa>>>8;break d}h=c[s>>2]|0;j=h&255;if(!(g&4)){a[B>>0]=j;a[C>>0]=h>>>8;break d}else{a[E>>0]=j;a[F>>0]=h>>>8;break d}}case 16:{g=d[la>>0]|0;if(g&2){a[H>>0]=c[s>>2];break d}h=c[s>>2]&255;if(!(g&4)){a[C>>0]=h;break d}else{a[F>>0]=h;break d}}case 17:{g=d[la>>0]|0;if(g&2){a[G>>0]=c[s>>2];break d}h=c[s>>2]&255;if(!(g&4)){a[B>>0]=h;break d}else{a[E>>0]=h;break d}}case 18:{a[I>>0]=c[s>>2];break}case 19:{xa=c[s>>2]|0;a[oa>>0]=xa&127;a[I>>0]=xa&128;break}case 20:{if(!(a[b>>0]|0)){xa=d[w>>0]&42|68;c[v>>2]=xa;a[w>>0]=xa;break d}if(!(a[K>>0]|0)){if((a[L>>0]|0)!=0?(a[M>>0]|0)!=0:0)break d;c[ea>>2]=c[U>>2]}break}case 21:{if(a[b>>0]|0){c[ea>>2]=c[U>>2];c[ua>>2]=(c[ua>>2]|0)+(d[(c[o>>2]|0)+1290>>0]|0)}break}case 22:{if(d[b>>0]<<8|d[x>>0]){c[ea>>2]=c[U>>2];c[ua>>2]=(c[ua>>2]|0)+(d[(c[o>>2]|0)+1290>>0]|0)}break}case 23:{if((d[b>>0]<<8|d[x>>0]|0)!=0?(a[w>>0]&64)==0:0){c[ea>>2]=c[U>>2];c[ua>>2]=(c[ua>>2]|0)+(d[(c[o>>2]|0)+1290>>0]|0)}break}case 24:{xa=(c[D>>2]|0)+65534&65535;c[D>>2]=xa;Ka[c[q>>2]&7](b,xa,c[s>>2]&255);Ka[c[q>>2]&7](b,(c[D>>2]|0)+1&65535,(c[s>>2]|0)>>>8&255);break}default:{}}while(0);g=d[la>>0]|0;if(g&8){a[la>>0]=g&247;Ka[c[q>>2]&7](b,c[r>>2]|0,c[s>>2]&255)}c[U>>2]=c[ea>>2];g=l}h=a[la>>0]|0;if(!(h&1))break;else l=g}f=c[ia>>2]|0;if(f){do if(((a[$>>0]|0)!=0?(a[K>>0]|0)==0:0)?(a[M>>0]|0)==0:0){if(!(Ed(f,0,sa)|0)){c[ua>>2]=e;break}f=(c[sa>>2]|0)+(c[ua>>2]|0)|0;if(f>>>0<e>>>0){c[ua>>2]=f;break}else{c[ua>>2]=e;break}}while(0);Gd(c[ia>>2]|0,(c[ua>>2]|0)-ra|0)}ra=c[ua>>2]|0;f=a[K>>0]|0;e:do if(!(f<<24>>24)){if((a[L>>0]|0)!=0?(A=a[M>>0]|0,A<<24>>24!=0):0){f=a[$>>0]|0;if(f<<24>>24){c[U>>2]=(c[U>>2]|0)+(f&255)&65535;a[$>>0]=0}switch(d[aa>>0]|0){case 0:{if(c[S>>2]&2)a[M>>0]=A&254;a[L>>0]=0;a[V>>0]=0;c[qa>>2]=11;c[ua>>2]=ra+2;break e}case 1:{if(c[S>>2]&2)a[M>>0]=A&254;a[L>>0]=0;a[V>>0]=0;xa=(c[D>>2]|0)+65534&65535;c[D>>2]=xa;Ka[c[q>>2]&7](b,xa,c[U>>2]&255);Ka[c[q>>2]&7](b,(c[D>>2]|0)+1&65535,(c[U>>2]|0)>>>8&255);c[U>>2]=56;a[oa>>0]=(a[oa>>0]|0)+1<<24>>24;xa=(c[ua>>2]|0)+(d[pa>>0]|0)|0;c[ua>>2]=xa;c[ua>>2]=xa+2+(d[ja>>0]|0)+(d[(c[o>>2]|0)+255>>0]|0);break e}case 2:{if(c[S>>2]&2)a[M>>0]=A&254;a[L>>0]=0;a[V>>0]=0;xa=(c[D>>2]|0)+65534&65535;c[D>>2]=xa;Ka[c[q>>2]&7](b,xa,c[U>>2]&255);Ka[c[q>>2]&7](b,(c[D>>2]|0)+1&65535,(c[U>>2]|0)>>>8&255);xa=(d[I>>0]<<8)+(Ja[c[ka>>2]&7](c[n>>2]|0,2)|0)|0;c[r>>2]=xa;c[U>>2]=Ja[c[R>>2]&7](b,xa)|0;c[U>>2]=((Ja[c[R>>2]&7](b,(c[r>>2]|0)+1&65535)|0)<<8)+(c[U>>2]|0);a[oa>>0]=(a[oa>>0]|0)+1<<24>>24;xa=(c[ua>>2]|0)+(d[pa>>0]|0)|0;c[ua>>2]=xa;c[ua>>2]=xa+2+(d[ja>>0]|0)+(d[(c[o>>2]|0)+255>>0]|0);break e}case 3:{a[L>>0]=0;a[V>>0]=0;g=(c[D>>2]|0)+65534&65535;c[D>>2]=g;Ka[c[q>>2]&7](b,g,c[U>>2]&255);Ka[c[q>>2]&7](b,(c[D>>2]|0)+1&65535,(c[U>>2]|0)>>>8&255);g=d[M>>0]|0;if(!(g&1))if(!(g&2))if(!(g&4))if(!(g&8))if(!(g&16))break e;else{f=239;h=96}else{f=247;h=88}else{f=251;h=80}else{f=253;h=72}else{f=254;h=64}if(c[S>>2]&2)a[M>>0]=g&f;c[U>>2]=h;break e}case 4:{a[L>>0]=0;a[V>>0]=0;m=266;break}case 5:{m=266;break}case 6:{f=A;break}default:break e}if((m|0)==266){m=0;f=(c[D>>2]|0)+65534&65535;c[D>>2]=f;Ka[c[q>>2]&7](b,f,c[U>>2]&255);Ka[c[q>>2]&7](b,(c[D>>2]|0)+1&65535,(c[U>>2]|0)>>>8&255);f=a[M>>0]|0}g=f&255;if(!(g&1))if(!(g&2))if(!(g&4))if(!(g&8))if(!(g&16))break;else{f=239;h=4}else{f=247;h=3}else{f=251;h=2}else{f=253;h=1}else{f=254;h=0}if(c[S>>2]&2)a[M>>0]=g&f;c[U>>2]=c[b+96+(h<<2)>>2]}}else{g=a[$>>0]|0;if(g<<24>>24){c[U>>2]=(c[U>>2]|0)+(g&255)&65535;a[$>>0]=0}a[K>>0]=f&254;a[V>>0]=a[L>>0]|0;a[L>>0]=0;xa=(c[D>>2]|0)+65534&65535;c[D>>2]=xa;Ka[c[q>>2]&7](b,xa,c[s>>2]&255);Ka[c[q>>2]&7](b,(c[D>>2]|0)+1&65535,(c[s>>2]|0)>>>8&255);c[U>>2]=102;a[oa>>0]=(a[oa>>0]|0)+1<<24>>24;xa=(c[ua>>2]|0)+(d[pa>>0]|0)|0;c[ua>>2]=xa;c[ua>>2]=(d[ja>>0]|0)+xa+(d[(c[o>>2]|0)+255>>0]|0)}while(0);f=c[ua>>2]|0;if(f>>>0>=e>>>0){m=273;break}}if((m|0)==273){c[ua>>2]=0;i=va;return f|0}return 0}function Md(a){a=a|0;var b=0;b=a+60|0;a=Ja[c[a+128>>2]&7](a,c[b>>2]|0)|0;c[b>>2]=(c[b>>2]|0)+1&65535;return a|0}function Nd(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;h=b+5|0;f=b+4|0;g=((d[f>>0]|0)<<8|(d[h>>0]|0))+e|0;a[h>>0]=g;a[f>>0]=g>>>8;f=(d[b>>0]|0)+255|0;a[b>>0]=f;g=d[b+1>>0]|0;h=c[b+64>>2]|0;i=b+52|0;j=f&255;k=d[1216493+j>>0]|0;l=k&232|h>>>6&2|0-(((g+e&255)+h|0)>>>8&1)&17;c[i>>2]=l;e=((e|0)>0?168520:112272)>>>(g<<2&12|h&3);if(!(f&15)){j=j>>>4&~(j>>>3)|j>>>2;k=e^k;k=k^j;k=k^h;k=k^g;k=k&4;l=k|l;c[i>>2]=l;l=l&255;b=b+6|0;a[b>>0]=l;return}else{j=(f<<1^254)&j|j<<2;k=e^k;k=k^j;k=k^h;k=k^g;k=k&4;l=k|l;c[i>>2]=l;l=l&255;b=b+6|0;a[b>>0]=l;return}}function Od(a){a=a|0;var b=0;b=a+72|0;c[b>>2]=(c[b>>2]|0)+(d[a+23>>0]|0);b=Ja[c[a+156>>2]&7](c[a+136>>2]|0,0)|0;if(b&256)c[a+124>>2]=10;if(!(b&512)){a=b;a=a&255;return a|0}b=a+60|0;a=Ja[c[a+128>>2]&7](a,c[b>>2]|0)|0;c[b>>2]=(c[b>>2]|0)+1&65535;a=a&255;return a|0}function Pd(a){a=a|0;return ((d[a+6>>0]|0)>>>2&1^1)&255|0}function Qd(a){a=a|0;return (d[a+6>>0]|0)&4|0}function Rd(a){a=a|0;return (d[a+6>>0]|0)>>>7&255^1|0}function Sd(a){a=a|0;return (d[a+6>>0]|0)&128|0}function Td(a){a=a|0;return ((d[a+6>>0]|0)>>>6&1^1)&255|0}function Ud(a){a=a|0;return (d[a+6>>0]|0)&64|0}function Vd(b){b=b|0;return (a[b+6>>0]&1^1)&255|0}function Wd(a){a=a|0;return (d[a+6>>0]|0)&1|0}function Xd(a){a=a|0;return ((a|0)==32|(a+-9|0)>>>0<5)&1|0}function Yd(){var a=0;if(!(c[271633]|0))a=1086580;else a=c[(va()|0)+60>>2]|0;return a|0}function Zd(b){b=b|0;var c=0,e=0;c=0;while(1){if((d[1218061+c>>0]|0)==(b|0)){e=2;break}c=c+1|0;if((c|0)==87){c=87;b=1218149;e=5;break}}if((e|0)==2)if(!c)b=1218149;else{b=1218149;e=5}if((e|0)==5)while(1){e=b;while(1){b=e+1|0;if(!(a[e>>0]|0))break;else e=b}c=c+-1|0;if(!c)break;else e=5}return b|0}function _d(a){a=a|0;if(a>>>0>4294963200){c[(Yd()|0)>>2]=0-a;a=-1}return a|0}function $d(a){a=+a;var b=0,d=0,e=0,f=0.0,g=0.0;h[k>>3]=a;b=c[k+4>>2]|0;d=b&2147483647;do if(d>>>0>1083174911){b=(b|0)>-1|(b|0)==-1&(c[k>>2]|0)>>>0>4294967295;if(b&d>>>0>1083179007){a=a*8988465674311579538646525.0e283;break}if(d>>>0<=2146435071)if(!(a<=-1075.0)|b){e=9;break}else{a=0.0;break}else{a=-1.0/a;break}}else if(d>>>0<1016070144)a=a+1.0;else e=9;while(0);if((e|0)==9){g=a+26388279066624.0;h[k>>3]=g;e=(c[k>>2]|0)+128|0;d=e<<1&510;f=+h[136+(d<<3)>>3];a=a-(g+-26388279066624.0)-+h[136+((d|1)<<3)>>3];a=+de(f+f*a*(a*(a*(a*(a*1.3333559164630223e-03+.009618129842126066)+.0555041086648214)+.2402265069591)+.6931471805599453),(e&-256|0)/256|0)}return +a}function ae(a,b){a=+a;b=b|0;var d=0,e=0,f=0;h[k>>3]=a;d=c[k>>2]|0;e=c[k+4>>2]|0;f=df(d|0,e|0,52)|0;f=f&2047;switch(f|0){case 0:{if(a!=0.0){a=+ae(a*18446744073709551616.0,b);d=(c[b>>2]|0)+-64|0}else d=0;c[b>>2]=d;break}case 2047:break;default:{c[b>>2]=f+-1022;c[k>>2]=d;c[k+4>>2]=e&-2146435073|1071644672;a=+h[k>>3]}}return +a}function be(a,b){a=+a;b=b|0;return +(+ae(a,b))}function ce(a){a=+a;var b=0,d=0,e=0,f=0,g=0.0,i=0.0,j=0.0,l=0.0,m=0.0;h[k>>3]=a;d=c[k>>2]|0;b=c[k+4>>2]|0;e=(b|0)<0;do if(e|b>>>0<1048576){if((d|0)==0&(b&2147483647|0)==0){a=-1.0/(a*a);break}if(e){a=(a-a)/0.0;break}else{h[k>>3]=a*18014398509481984.0;b=c[k+4>>2]|0;e=c[k>>2]|0;d=-1077;f=9;break}}else if(b>>>0<=2146435071)if((d|0)==0&0==0&(b|0)==1072693248)a=0.0;else{e=d;d=-1023;f=9}while(0);if((f|0)==9){f=b+614242|0;c[k>>2]=e;c[k+4>>2]=(f&1048575)+1072079006;m=+h[k>>3]+-1.0;a=m*(m*.5);j=m/(m+2.0);l=j*j;i=l*l;h[k>>3]=m-a;e=c[k+4>>2]|0;c[k>>2]=0;c[k+4>>2]=e;g=+h[k>>3];a=j*(a+(i*(i*(i*.15313837699209373+.22222198432149784)+.3999999999940942)+l*(i*(i*(i*.14798198605116586+.1818357216161805)+.2857142874366239)+.6666666666666735)))+(m-g-a);m=g*.4342944818781689;i=+(d+(f>>>20)|0);l=i*.30102999566361177;j=l+m;a=j+(m+(l-j)+(a*.4342944818781689+(i*3.694239077158931e-13+(g+a)*2.5082946711645275e-11)))}return +a}function de(a,b){a=+a;b=b|0;var d=0;if((b|0)>1023){a=a*8988465674311579538646525.0e283;d=b+-1023|0;if((d|0)>1023){d=b+-2046|0;d=(d|0)>1023?1023:d;a=a*8988465674311579538646525.0e283}}else if((b|0)<-1022){a=a*2.2250738585072014e-308;d=b+1022|0;if((d|0)<-1022){d=b+2044|0;d=(d|0)<-1022?-1022:d;a=a*2.2250738585072014e-308}}else d=b;d=bf(d+1023|0,0,52)|0;b=C;c[k>>2]=d;c[k+4>>2]=b;return +(a*+h[k>>3])}function ee(b,d,e){b=b|0;d=d|0;e=e|0;do if(b){if(d>>>0<128){a[b>>0]=d;b=1;break}if(d>>>0<2048){a[b>>0]=d>>>6|192;a[b+1>>0]=d&63|128;b=2;break}if(d>>>0<55296|(d&-8192|0)==57344){a[b>>0]=d>>>12|224;a[b+1>>0]=d>>>6&63|128;a[b+2>>0]=d&63|128;b=3;break}if((d+-65536|0)>>>0<1048576){a[b>>0]=d>>>18|240;a[b+1>>0]=d>>>12&63|128;a[b+2>>0]=d>>>6&63|128;a[b+3>>0]=d&63|128;b=4;break}else{c[(Yd()|0)>>2]=84;b=-1;break}}else b=1;while(0);return b|0}function fe(a,b){a=a|0;b=b|0;if(!a)a=0;else a=ee(a,b,0)|0;return a|0}function ge(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;o=i;i=i+112|0;n=o+40|0;l=o+24|0;k=o+16|0;g=o;m=o+52|0;f=a[d>>0]|0;if(Be(1219953,f<<24>>24,4)|0){e=Ue(1144)|0;if(!e)e=0;else{h=e;j=h+112|0;do{c[h>>2]=0;h=h+4|0}while((h|0)<(j|0));if(!(Fe(d,43)|0))c[e>>2]=f<<24>>24==114?8:4;if(Fe(d,101)|0){c[g>>2]=b;c[g+4>>2]=2;c[g+8>>2]=1;ja(221,g|0)|0;f=a[d>>0]|0}if(f<<24>>24==97){c[k>>2]=b;c[k+4>>2]=3;f=ja(221,k|0)|0;if(!(f&1024)){c[l>>2]=b;c[l+4>>2]=4;c[l+8>>2]=f|1024;ja(221,l|0)|0}d=c[e>>2]|128;c[e>>2]=d}else d=c[e>>2]|0;c[e+60>>2]=b;c[e+44>>2]=e+120;c[e+48>>2]=1024;f=e+75|0;a[f>>0]=-1;if((d&8|0)==0?(c[n>>2]=b,c[n+4>>2]=21505,c[n+8>>2]=m,(ma(54,n|0)|0)==0):0)a[f>>0]=10;c[e+32>>2]=5;c[e+36>>2]=6;c[e+40>>2]=3;c[e+12>>2]=9;if(!(c[271634]|0))c[e+76>>2]=-1;za(1086560);f=c[271639]|0;c[e+56>>2]=f;if(f)c[f+52>>2]=e;c[271639]=e;xa(1086560)}}else{c[(Yd()|0)>>2]=22;e=0}i=o;return e|0}function he(b){b=b|0;var c=0,d=0,e=0;d=(Fe(b,43)|0)==0;c=a[b>>0]|0;d=d?c<<24>>24!=114&1:2;e=(Fe(b,120)|0)==0;d=e?d:d|128;b=(Fe(b,101)|0)==0;b=b?d:d|524288;b=c<<24>>24==114?b:b|64;b=c<<24>>24==119?b|512:b;return (c<<24>>24==97?b|1024:b)|0}function ie(a){a=a|0;return 0}function je(a){a=a|0;return}function ke(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=c[a+60>>2];a=_d(na(6,d|0)|0)|0;i=b;return a|0}function le(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;m=i;i=i+48|0;h=m+16|0;g=m;f=m+32|0;c[f>>2]=d;j=f+4|0;l=b+48|0;n=c[l>>2]|0;c[j>>2]=e-((n|0)!=0&1);k=b+44|0;c[f+8>>2]=c[k>>2];c[f+12>>2]=n;if(!(c[271633]|0)){c[h>>2]=c[b+60>>2];c[h+4>>2]=f;c[h+8>>2]=2;f=_d(Ea(145,h|0)|0)|0}else{Ba(1,b|0);c[g>>2]=c[b+60>>2];c[g+4>>2]=f;c[g+8>>2]=2;f=_d(Ea(145,g|0)|0)|0;ia(0)}if((f|0)>=1){j=c[j>>2]|0;if(f>>>0>j>>>0){h=c[k>>2]|0;g=b+4|0;c[g>>2]=h;c[b+8>>2]=h+(f-j);if(!(c[l>>2]|0))f=e;else{c[g>>2]=h+1;a[d+(e+-1)>>0]=a[h>>0]|0;f=e}}}else{c[b>>2]=c[b>>2]|f&48^16;c[b+8>>2]=0;c[b+4>>2]=0}i=m;return f|0}function me(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;f=i;i=i+32|0;g=f;e=f+20|0;c[g>>2]=c[a+60>>2];c[g+4>>2]=0;c[g+8>>2]=b;c[g+12>>2]=e;c[g+16>>2]=d;if((_d(Da(140,g|0)|0)|0)<0){c[e>>2]=-1;a=-1}else a=c[e>>2]|0;i=f;return a|0}function ne(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;q=i;i=i+48|0;n=q+16|0;m=q;e=q+32|0;o=a+28|0;f=c[o>>2]|0;c[e>>2]=f;p=a+20|0;f=(c[p>>2]|0)-f|0;c[e+4>>2]=f;c[e+8>>2]=b;c[e+12>>2]=d;k=a+60|0;l=a+44|0;b=2;f=f+d|0;while(1){if(!(c[271633]|0)){c[n>>2]=c[k>>2];c[n+4>>2]=e;c[n+8>>2]=b;h=_d(Fa(146,n|0)|0)|0}else{Ba(2,a|0);c[m>>2]=c[k>>2];c[m+4>>2]=e;c[m+8>>2]=b;h=_d(Fa(146,m|0)|0)|0;ia(0)}if((f|0)==(h|0)){f=6;break}if((h|0)<0){f=8;break}f=f-h|0;g=c[e+4>>2]|0;if(h>>>0<=g>>>0)if((b|0)==2){c[o>>2]=(c[o>>2]|0)+h;j=g;b=2}else j=g;else{j=c[l>>2]|0;c[o>>2]=j;c[p>>2]=j;j=c[e+12>>2]|0;h=h-g|0;e=e+8|0;b=b+-1|0}c[e>>2]=(c[e>>2]|0)+h;c[e+4>>2]=j-h}if((f|0)==6){n=c[l>>2]|0;c[a+16>>2]=n+(c[a+48>>2]|0);a=n;c[o>>2]=a;c[p>>2]=a}else if((f|0)==8){c[a+16>>2]=0;c[o>>2]=0;c[p>>2]=0;c[a>>2]=c[a>>2]|32;if((b|0)==2)d=0;else d=d-(c[e+4>>2]|0)|0}i=q;return d|0}function oe(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;g=i;i=i+80|0;f=g;c[b+36>>2]=6;if((c[b>>2]&64|0)==0?(c[f>>2]=c[b+60>>2],c[f+4>>2]=21505,c[f+8>>2]=g+12,(ma(54,f|0)|0)!=0):0)a[b+75>>0]=-1;f=ne(b,d,e)|0;i=g;return f|0}function pe(b){b=b|0;var d=0,e=0;d=b+74|0;e=a[d>>0]|0;a[d>>0]=e+255|e;d=b+20|0;e=b+44|0;if((c[d>>2]|0)>>>0>(c[e>>2]|0)>>>0)Ia[c[b+36>>2]&7](b,0,0)|0;c[b+16>>2]=0;c[b+28>>2]=0;c[d>>2]=0;d=c[b>>2]|0;if(d&20)if(!(d&4))d=-1;else{c[b>>2]=d|32;d=-1}else{d=c[e>>2]|0;c[b+8>>2]=d;c[b+4>>2]=d;d=0}return d|0}function qe(b){b=b|0;var d=0,e=0;d=b+74|0;e=a[d>>0]|0;a[d>>0]=e+255|e;d=c[b>>2]|0;if(!(d&8)){c[b+8>>2]=0;c[b+4>>2]=0;d=c[b+44>>2]|0;c[b+28>>2]=d;c[b+20>>2]=d;c[b+16>>2]=d+(c[b+48>>2]|0);d=0}else{c[b>>2]=d|32;d=-1}return d|0}function re(a){a=a|0;var b=0,d=0,e=0;e=(c[a>>2]&1|0)!=0;if(!e){za(1086560);d=c[a+52>>2]|0;b=a+56|0;if(d)c[d+56>>2]=c[b>>2];b=c[b>>2]|0;if(b)c[b+52>>2]=d;if((c[271639]|0)==(a|0))c[271639]=b;xa(1086560)}b=se(a)|0;b=Ha[c[a+12>>2]&15](a)|0|b;d=c[a+92>>2]|0;if(d)Ve(d);if(!e)Ve(a);return b|0}function se(a){a=a|0;var b=0,d=0;do if(a){if((c[a+76>>2]|0)<=-1){b=Oe(a)|0;break}d=(ie(a)|0)==0;b=Oe(a)|0;if(!d)je(a)}else{if(!(c[271644]|0))b=0;else b=se(c[271644]|0)|0;za(1086560);a=c[271639]|0;if(a)do{if((c[a+76>>2]|0)>-1)d=ie(a)|0;else d=0;if((c[a+20>>2]|0)>>>0>(c[a+28>>2]|0)>>>0)b=Oe(a)|0|b;if(d)je(a);a=c[a+56>>2]|0}while((a|0)!=0);xa(1086560)}while(0);return b|0}function te(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;g=i;i=i+32|0;f=g+16|0;e=g;if(Be(1219953,a[d>>0]|0,4)|0){h=he(d)|0|32768;c[e>>2]=b;c[e+4>>2]=h;c[e+8>>2]=438;e=_d(oa(5,e|0)|0)|0;if((e|0)>=0){b=ge(e,d)|0;if(!b){c[f>>2]=e;na(6,f|0)|0;b=0}}else b=0}else{c[(Yd()|0)>>2]=22;b=0}i=g;return b|0}function ue(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;j=_(e,d)|0;if((c[f+76>>2]|0)>-1)k=ie(f)|0;else k=0;g=f+74|0;h=a[g>>0]|0;a[g>>0]=h+255|h;g=f+4|0;h=c[g>>2]|0;i=(c[f+8>>2]|0)-h|0;if((i|0)>0){i=i>>>0<j>>>0?i:j;ef(b|0,h|0,i|0)|0;c[g>>2]=h+i;b=b+i|0;g=j-i|0}else g=j;a:do if(!g)l=13;else{i=f+32|0;h=g;while(1){if(pe(f)|0){e=h;break}g=Ia[c[i>>2]&7](f,b,h)|0;if((g+1|0)>>>0<2){e=h;break}if((h|0)==(g|0)){l=13;break a}else{b=b+g|0;h=h-g|0}}if(k)je(f);e=((j-e|0)>>>0)/(d>>>0)|0}while(0);if((l|0)==13)if(k)je(f);return e|0}function ve(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=e+16|0;g=c[f>>2]|0;if(!g)if(!(qe(e)|0)){g=c[f>>2]|0;h=4}else f=0;else h=4;a:do if((h|0)==4){i=e+20|0;h=c[i>>2]|0;if((g-h|0)>>>0<d>>>0){f=Ia[c[e+36>>2]&7](e,b,d)|0;break}b:do if((a[e+75>>0]|0)>-1){f=d;while(1){if(!f){g=h;f=0;break b}g=f+-1|0;if((a[b+g>>0]|0)==10)break;else f=g}if((Ia[c[e+36>>2]&7](e,b,f)|0)>>>0<f>>>0)break a;d=d-f|0;b=b+f|0;g=c[i>>2]|0}else{g=h;f=0}while(0);ef(g|0,b|0,d|0)|0;c[i>>2]=(c[i>>2]|0)+d;f=f+d|0}while(0);return f|0}function we(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+16|0;f=e;c[f>>2]=d;d=ze(a,b,f)|0;i=e;return d|0}function xe(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;s=i;i=i+224|0;o=s+80|0;r=s+96|0;q=s;p=s+136|0;f=r;g=f+40|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(g|0));c[o>>2]=c[e>>2];if((Pe(0,d,o,q,r)|0)<0)e=-1;else{if((c[b+76>>2]|0)>-1)m=ie(b)|0;else m=0;e=c[b>>2]|0;n=e&32;if((a[b+74>>0]|0)<1)c[b>>2]=e&-33;e=b+48|0;if(!(c[e>>2]|0)){g=b+44|0;h=c[g>>2]|0;c[g>>2]=p;j=b+28|0;c[j>>2]=p;k=b+20|0;c[k>>2]=p;c[e>>2]=80;l=b+16|0;c[l>>2]=p+80;f=Pe(b,d,o,q,r)|0;if(h){Ia[c[b+36>>2]&7](b,0,0)|0;f=(c[k>>2]|0)==0?-1:f;c[g>>2]=h;c[e>>2]=0;c[l>>2]=0;c[j>>2]=0;c[k>>2]=0}}else f=Pe(b,d,o,q,r)|0;e=c[b>>2]|0;c[b>>2]=e|n;if(m)je(b);e=(e&32|0)==0?f:-1}i=s;return e|0}function ye(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;n=i;i=i+128|0;g=n+112|0;m=n;h=m;j=1086584;k=h+112|0;do{c[h>>2]=c[j>>2];h=h+4|0;j=j+4|0}while((h|0)<(k|0));if((d+-1|0)>>>0>2147483646)if(!d){d=1;l=4}else{c[(Yd()|0)>>2]=75;d=-1}else{g=b;l=4}if((l|0)==4){l=-2-g|0;l=d>>>0>l>>>0?l:d;c[m+48>>2]=l;b=m+20|0;c[b>>2]=g;c[m+44>>2]=g;d=g+l|0;g=m+16|0;c[g>>2]=d;c[m+28>>2]=d;d=xe(m,e,f)|0;if(l){e=c[b>>2]|0;a[e+(((e|0)==(c[g>>2]|0))<<31>>31)>>0]=0}}i=n;return d|0}function ze(a,b,c){a=a|0;b=b|0;c=c|0;return ye(a,2147483647,b,c)|0}function Ae(b){b=b|0;var c=0,d=0,e=0,f=0;while(1){c=b+1|0;if(!(Xd(a[b>>0]|0)|0))break;else b=c}d=a[b>>0]|0;switch(d<<24>>24|0){case 45:{e=1;f=5;break}case 43:{e=0;f=5;break}default:e=0}if((f|0)==5){b=c;d=a[c>>0]|0}c=(d<<24>>24)+-48|0;if(c>>>0<10){d=b;b=0;do{d=d+1|0;b=(b*10|0)-c|0;c=(a[d>>0]|0)+-48|0}while(c>>>0<10)}else b=0;return ((e|0)!=0?b:0-b|0)|0}function Be(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;h=d&255;f=(e|0)!=0;a:do if(f&(b&3|0)!=0){g=d&255;while(1){if((a[b>>0]|0)==g<<24>>24){i=6;break a}b=b+1|0;e=e+-1|0;f=(e|0)!=0;if(!(f&(b&3|0)!=0)){i=5;break}}}else i=5;while(0);if((i|0)==5)if(f)i=6;else e=0;b:do if((i|0)==6){g=d&255;if((a[b>>0]|0)!=g<<24>>24){f=_(h,16843009)|0;c:do if(e>>>0>3)while(1){h=c[b>>2]^f;if((h&-2139062144^-2139062144)&h+-16843009)break;b=b+4|0;e=e+-4|0;if(e>>>0<=3){i=11;break c}}else i=11;while(0);if((i|0)==11)if(!e){e=0;break}while(1){if((a[b>>0]|0)==g<<24>>24)break b;b=b+1|0;e=e+-1|0;if(!e){e=0;break}}}}while(0);return ((e|0)!=0?b:0)|0}function Ce(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0;a:do if(!d)d=0;else{f=d;e=b;while(1){b=a[e>>0]|0;d=a[c>>0]|0;if(b<<24>>24!=d<<24>>24)break;f=f+-1|0;if(!f){d=0;break a}else{e=e+1|0;c=c+1|0}}d=(b&255)-(d&255)|0}while(0);return d|0}function De(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;e=c&255;do{if(!d){c=0;break}d=d+-1|0;c=b+d|0}while((a[c>>0]|0)!=e<<24>>24);return c|0}function Ee(b,d){b=b|0;d=d|0;var e=0,f=0;e=d;a:do if(!((e^b)&3)){if(e&3)do{e=a[d>>0]|0;a[b>>0]=e;if(!(e<<24>>24))break a;d=d+1|0;b=b+1|0}while((d&3|0)!=0);e=c[d>>2]|0;if(!((e&-2139062144^-2139062144)&e+-16843009)){f=b;while(1){d=d+4|0;b=f+4|0;c[f>>2]=e;e=c[d>>2]|0;if((e&-2139062144^-2139062144)&e+-16843009)break;else f=b}}f=8}else f=8;while(0);if((f|0)==8){f=a[d>>0]|0;a[b>>0]=f;if(f<<24>>24)do{d=d+1|0;b=b+1|0;f=a[d>>0]|0;a[b>>0]=f}while(f<<24>>24!=0)}return b|0}function Fe(b,c){b=b|0;c=c|0;b=Ge(b,c)|0;return ((a[b>>0]|0)==(c&255)<<24>>24?b:0)|0}function Ge(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;f=d&255;a:do if(!f)b=b+(Je(b)|0)|0;else{if(b&3){e=d&255;do{g=a[b>>0]|0;if(g<<24>>24==0?1:g<<24>>24==e<<24>>24)break a;b=b+1|0}while((b&3|0)!=0)}f=_(f,16843009)|0;e=c[b>>2]|0;b:do if(!((e&-2139062144^-2139062144)&e+-16843009))do{g=e^f;if((g&-2139062144^-2139062144)&g+-16843009)break b;b=b+4|0;e=c[b>>2]|0}while(((e&-2139062144^-2139062144)&e+-16843009|0)==0);while(0);e=d&255;while(1){g=a[b>>0]|0;if(g<<24>>24==0?1:g<<24>>24==e<<24>>24)break;else b=b+1|0}}while(0);return b|0}function He(b,c){b=b|0;c=c|0;var d=0,e=0;e=a[b>>0]|0;d=a[c>>0]|0;if(e<<24>>24==0?1:e<<24>>24!=d<<24>>24)c=e;else{do{b=b+1|0;c=c+1|0;e=a[b>>0]|0;d=a[c>>0]|0}while(!(e<<24>>24==0?1:e<<24>>24!=d<<24>>24));c=e}return (c&255)-(d&255)|0}function Ie(a,b){a=a|0;b=b|0;Ee(a,b)|0;return a|0}function Je(b){b=b|0;var d=0,e=0,f=0;f=b;a:do if(!(f&3))e=4;else{d=b;b=f;while(1){if(!(a[d>>0]|0))break a;d=d+1|0;b=d;if(!(b&3)){b=d;e=4;break}}}while(0);if((e|0)==4){while(1){d=c[b>>2]|0;if(!((d&-2139062144^-2139062144)&d+-16843009))b=b+4|0;else break}if((d&255)<<24>>24)do b=b+1|0;while((a[b>>0]|0)!=0)}return b-f|0}function Ke(b,c,e){b=b|0;c=c|0;e=e|0;var f=0,g=0;if(!e)c=0;else{f=a[b>>0]|0;a:do if(!(f<<24>>24))f=0;else while(1){e=e+-1|0;g=a[c>>0]|0;if(!(f<<24>>24==g<<24>>24&((e|0)!=0&g<<24>>24!=0)))break a;b=b+1|0;c=c+1|0;f=a[b>>0]|0;if(!(f<<24>>24)){f=0;break}}while(0);c=(f&255)-(d[c>>0]|0)|0}return c|0}function Le(a,b){a=a|0;b=b|0;return De(a,b,(Je(a)|0)+1|0)|0}function Me(a){a=a|0;if(!(c[a+68>>2]|0))je(a);return}function Ne(a){a=a|0;if(!(c[a+68>>2]|0))je(a);return}function Oe(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;b=a+20|0;g=a+28|0;if((c[b>>2]|0)>>>0>(c[g>>2]|0)>>>0?(Ia[c[a+36>>2]&7](a,0,0)|0,(c[b>>2]|0)==0):0)b=-1;else{h=a+4|0;d=c[h>>2]|0;e=a+8|0;f=c[e>>2]|0;if(d>>>0<f>>>0)Ia[c[a+40>>2]&7](a,d-f|0,1)|0;c[a+16>>2]=0;c[g>>2]=0;c[b>>2]=0;c[e>>2]=0;c[h>>2]=0;b=0}return b|0}function Pe(e,f,g,j,l){e=e|0;f=f|0;g=g|0;j=j|0;l=l|0;var m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,u=0,v=0.0,w=0,x=0,y=0,z=0,A=0,B=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0;ha=i;i=i+624|0;ca=ha+24|0;ea=ha+16|0;da=ha+588|0;Y=ha+576|0;ba=ha;V=ha+536|0;ga=ha+8|0;fa=ha+528|0;M=(e|0)!=0;N=V+40|0;U=N;V=V+39|0;W=ga+4|0;X=Y+12|0;Y=Y+11|0;Z=da;$=X;aa=$-Z|0;O=-2-Z|0;P=$+2|0;Q=ca+288|0;R=da+9|0;S=R;T=da+8|0;m=0;w=f;n=0;f=0;a:while(1){do if((m|0)>-1)if((n|0)>(2147483647-m|0)){c[(Yd()|0)>>2]=75;m=-1;break}else{m=n+m|0;break}while(0);n=a[w>>0]|0;if(!(n<<24>>24)){L=245;break}else o=w;b:while(1){switch(n<<24>>24){case 37:{n=o;L=9;break b}case 0:{n=o;break b}default:{}}K=o+1|0;n=a[K>>0]|0;o=K}c:do if((L|0)==9)while(1){L=0;if((a[n+1>>0]|0)!=37)break c;o=o+1|0;n=n+2|0;if((a[n>>0]|0)==37)L=9;else break}while(0);y=o-w|0;if(M?(c[e>>2]&32|0)==0:0)ve(w,y,e)|0;if((o|0)!=(w|0)){w=n;n=y;continue}r=n+1|0;o=a[r>>0]|0;p=(o<<24>>24)+-48|0;if(p>>>0<10){K=(a[n+2>>0]|0)==36;r=K?n+3|0:r;o=a[r>>0]|0;u=K?p:-1;f=K?1:f}else u=-1;n=o<<24>>24;d:do if((n&-32|0)==32){p=0;while(1){if(!(1<<n+-32&75913)){s=p;n=r;break d}p=1<<(o<<24>>24)+-32|p;r=r+1|0;o=a[r>>0]|0;n=o<<24>>24;if((n&-32|0)!=32){s=p;n=r;break}}}else{s=0;n=r}while(0);do if(o<<24>>24==42){p=n+1|0;o=(a[p>>0]|0)+-48|0;if(o>>>0<10?(a[n+2>>0]|0)==36:0){c[l+(o<<2)>>2]=10;f=1;n=n+3|0;o=c[j+((a[p>>0]|0)+-48<<3)>>2]|0}else{if(f){m=-1;break a}if(!M){x=s;n=p;f=0;K=0;break}f=(c[g>>2]|0)+(4-1)&~(4-1);o=c[f>>2]|0;c[g>>2]=f+4;f=0;n=p}if((o|0)<0){x=s|8192;K=0-o|0}else{x=s;K=o}}else{p=(o<<24>>24)+-48|0;if(p>>>0<10){o=0;do{o=(o*10|0)+p|0;n=n+1|0;p=(a[n>>0]|0)+-48|0}while(p>>>0<10);if((o|0)<0){m=-1;break a}else{x=s;K=o}}else{x=s;K=0}}while(0);e:do if((a[n>>0]|0)==46){p=n+1|0;o=a[p>>0]|0;if(o<<24>>24!=42){r=(o<<24>>24)+-48|0;if(r>>>0<10){n=p;o=0}else{n=p;r=0;break}while(1){o=(o*10|0)+r|0;n=n+1|0;r=(a[n>>0]|0)+-48|0;if(r>>>0>=10){r=o;break e}}}p=n+2|0;o=(a[p>>0]|0)+-48|0;if(o>>>0<10?(a[n+3>>0]|0)==36:0){c[l+(o<<2)>>2]=10;n=n+4|0;r=c[j+((a[p>>0]|0)+-48<<3)>>2]|0;break}if(f){m=-1;break a}if(M){n=(c[g>>2]|0)+(4-1)&~(4-1);r=c[n>>2]|0;c[g>>2]=n+4;n=p}else{n=p;r=0}}else r=-1;while(0);t=0;while(1){o=(a[n>>0]|0)+-65|0;if(o>>>0>57){m=-1;break a}p=n+1|0;o=a[1220989+(t*58|0)+o>>0]|0;s=o&255;if((s+-1|0)>>>0<8){n=p;t=s}else{J=p;break}}if(!(o<<24>>24)){m=-1;break}p=(u|0)>-1;do if(o<<24>>24==19)if(p){m=-1;break a}else L=52;else{if(p){c[l+(u<<2)>>2]=s;H=j+(u<<3)|0;I=c[H+4>>2]|0;L=ba;c[L>>2]=c[H>>2];c[L+4>>2]=I;L=52;break}if(!M){m=0;break a}Re(ba,s,g)}while(0);if((L|0)==52?(L=0,!M):0){w=J;n=y;continue}u=a[n>>0]|0;u=(t|0)!=0&(u&15|0)==3?u&-33:u;p=x&-65537;I=(x&8192|0)==0?x:p;f:do switch(u|0){case 110:switch(t|0){case 0:{c[c[ba>>2]>>2]=m;w=J;n=y;continue a}case 1:{c[c[ba>>2]>>2]=m;w=J;n=y;continue a}case 2:{w=c[ba>>2]|0;c[w>>2]=m;c[w+4>>2]=((m|0)<0)<<31>>31;w=J;n=y;continue a}case 3:{b[c[ba>>2]>>1]=m;w=J;n=y;continue a}case 4:{a[c[ba>>2]>>0]=m;w=J;n=y;continue a}case 6:{c[c[ba>>2]>>2]=m;w=J;n=y;continue a}case 7:{w=c[ba>>2]|0;c[w>>2]=m;c[w+4>>2]=((m|0)<0)<<31>>31;w=J;n=y;continue a}default:{w=J;n=y;continue a}}case 112:{t=I|8;r=r>>>0>8?r:8;u=120;L=64;break}case 88:case 120:{t=I;L=64;break}case 111:{p=ba;o=c[p>>2]|0;p=c[p+4>>2]|0;if((o|0)==0&(p|0)==0)n=N;else{n=N;do{n=n+-1|0;a[n>>0]=o&7|48;o=df(o|0,p|0,3)|0;p=C}while(!((o|0)==0&(p|0)==0))}if(!(I&8)){o=I;t=0;s=1221469;L=77}else{t=U-n+1|0;o=I;r=(r|0)<(t|0)?t:r;t=0;s=1221469;L=77}break}case 105:case 100:{o=ba;n=c[o>>2]|0;o=c[o+4>>2]|0;if((o|0)<0){n=$e(0,0,n|0,o|0)|0;o=C;p=ba;c[p>>2]=n;c[p+4>>2]=o;p=1;s=1221469;L=76;break f}if(!(I&2048)){s=I&1;p=s;s=(s|0)==0?1221469:1221471;L=76}else{p=1;s=1221470;L=76}break}case 117:{o=ba;n=c[o>>2]|0;o=c[o+4>>2]|0;p=0;s=1221469;L=76;break}case 99:{a[V>>0]=c[ba>>2];w=V;o=1;t=0;u=1221469;n=N;break}case 109:{n=Zd(c[(Yd()|0)>>2]|0)|0;L=82;break}case 115:{n=c[ba>>2]|0;n=(n|0)!=0?n:1221479;L=82;break}case 67:{c[ga>>2]=c[ba>>2];c[W>>2]=0;c[ba>>2]=ga;r=-1;L=86;break}case 83:{if(!r){Te(e,32,K,0,I);n=0;L=98}else L=86;break}case 65:case 71:case 70:case 69:case 97:case 103:case 102:case 101:{q=+h[ba>>3];c[ea>>2]=0;h[k>>3]=q;if((c[k+4>>2]|0)>=0)if(!(I&2048)){H=I&1;G=H;H=(H|0)==0?1221487:1221492}else{G=1;H=1221489}else{q=-q;G=1;H=1221486}h[k>>3]=q;F=c[k+4>>2]&2146435072;do if(F>>>0<2146435072|(F|0)==2146435072&0<0){v=+be(q,ea)*2.0;o=v!=0.0;if(o)c[ea>>2]=(c[ea>>2]|0)+-1;D=u|32;if((D|0)==97){w=u&32;y=(w|0)==0?H:H+9|0;x=G|2;n=12-r|0;do if(!(r>>>0>11|(n|0)==0)){q=8.0;do{n=n+-1|0;q=q*16.0}while((n|0)!=0);if((a[y>>0]|0)==45){q=-(q+(-v-q));break}else{q=v+q-q;break}}else q=v;while(0);o=c[ea>>2]|0;n=(o|0)<0?0-o|0:o;n=Se(n,((n|0)<0)<<31>>31,X)|0;if((n|0)==(X|0)){a[Y>>0]=48;n=Y}a[n+-1>>0]=(o>>31&2)+43;t=n+-2|0;a[t>>0]=u+15;s=(r|0)<1;p=(I&8|0)==0;o=da;while(1){H=~~q;n=o+1|0;a[o>>0]=d[1221453+H>>0]|w;q=(q-+(H|0))*16.0;do if((n-Z|0)==1){if(p&(s&q==0.0))break;a[n>>0]=46;n=o+2|0}while(0);if(!(q!=0.0))break;else o=n}r=(r|0)!=0&(O+n|0)<(r|0)?P+r-t|0:aa-t+n|0;p=r+x|0;Te(e,32,K,p,I);if(!(c[e>>2]&32))ve(y,x,e)|0;Te(e,48,K,p,I^65536);n=n-Z|0;if(!(c[e>>2]&32))ve(da,n,e)|0;o=$-t|0;Te(e,48,r-(n+o)|0,0,0);if(!(c[e>>2]&32))ve(t,o,e)|0;Te(e,32,K,p,I^8192);n=(p|0)<(K|0)?K:p;break}n=(r|0)<0?6:r;if(o){o=(c[ea>>2]|0)+-28|0;c[ea>>2]=o;q=v*268435456.0}else{q=v;o=c[ea>>2]|0}F=(o|0)<0?ca:Q;E=F;o=F;do{B=~~q>>>0;c[o>>2]=B;o=o+4|0;q=(q-+(B>>>0))*1.0e9}while(q!=0.0);p=o;o=c[ea>>2]|0;if((o|0)>0){s=F;while(1){t=(o|0)>29?29:o;r=p+-4|0;do if(r>>>0<s>>>0)r=s;else{o=0;do{B=bf(c[r>>2]|0,0,t|0)|0;B=cf(B|0,C|0,o|0,0)|0;o=C;A=nf(B|0,o|0,1e9,0)|0;c[r>>2]=A;o=mf(B|0,o|0,1e9,0)|0;r=r+-4|0}while(r>>>0>=s>>>0);if(!o){r=s;break}r=s+-4|0;c[r>>2]=o}while(0);while(1){if(p>>>0<=r>>>0)break;o=p+-4|0;if(!(c[o>>2]|0))p=o;else break}o=(c[ea>>2]|0)-t|0;c[ea>>2]=o;if((o|0)>0)s=r;else break}}else r=F;if((o|0)<0){y=((n+25|0)/9|0)+1|0;z=(D|0)==102;w=r;while(1){x=0-o|0;x=(x|0)>9?9:x;do if(w>>>0<p>>>0){o=(1<<x)+-1|0;s=1e9>>>x;r=0;t=w;do{B=c[t>>2]|0;c[t>>2]=(B>>>x)+r;r=_(B&o,s)|0;t=t+4|0}while(t>>>0<p>>>0);o=(c[w>>2]|0)==0?w+4|0:w;if(!r){r=o;break}c[p>>2]=r;r=o;p=p+4|0}else r=(c[w>>2]|0)==0?w+4|0:w;while(0);o=z?F:r;p=(p-o>>2|0)>(y|0)?o+(y<<2)|0:p;o=(c[ea>>2]|0)+x|0;c[ea>>2]=o;if((o|0)>=0){w=r;break}else w=r}}else w=r;do if(w>>>0<p>>>0){o=(E-w>>2)*9|0;s=c[w>>2]|0;if(s>>>0<10)break;else r=10;do{r=r*10|0;o=o+1|0}while(s>>>0>=r>>>0)}else o=0;while(0);A=(D|0)==103;B=(n|0)!=0;r=n-((D|0)!=102?o:0)+((B&A)<<31>>31)|0;if((r|0)<(((p-E>>2)*9|0)+-9|0)){t=r+9216|0;z=(t|0)/9|0;r=F+(z+-1023<<2)|0;t=((t|0)%9|0)+1|0;if((t|0)<9){s=10;do{s=s*10|0;t=t+1|0}while((t|0)!=9)}else s=10;x=c[r>>2]|0;y=(x>>>0)%(s>>>0)|0;if((y|0)==0?(F+(z+-1022<<2)|0)==(p|0):0)s=w;else L=163;do if((L|0)==163){L=0;v=(((x>>>0)/(s>>>0)|0)&1|0)==0?9007199254740992.0:9007199254740994.0;t=(s|0)/2|0;do if(y>>>0<t>>>0)q=.5;else{if((y|0)==(t|0)?(F+(z+-1022<<2)|0)==(p|0):0){q=1.0;break}q=1.5}while(0);do if(G){if((a[H>>0]|0)!=45)break;v=-v;q=-q}while(0);t=x-y|0;c[r>>2]=t;if(!(v+q!=v)){s=w;break}D=t+s|0;c[r>>2]=D;if(D>>>0>999999999){o=w;while(1){s=r+-4|0;c[r>>2]=0;if(s>>>0<o>>>0){o=o+-4|0;c[o>>2]=0}D=(c[s>>2]|0)+1|0;c[s>>2]=D;if(D>>>0>999999999)r=s;else{w=o;r=s;break}}}o=(E-w>>2)*9|0;t=c[w>>2]|0;if(t>>>0<10){s=w;break}else s=10;do{s=s*10|0;o=o+1|0}while(t>>>0>=s>>>0);s=w}while(0);D=r+4|0;w=s;p=p>>>0>D>>>0?D:p}y=0-o|0;while(1){if(p>>>0<=w>>>0){z=0;D=p;break}r=p+-4|0;if(!(c[r>>2]|0))p=r;else{z=1;D=p;break}}do if(A){n=(B&1^1)+n|0;if((n|0)>(o|0)&(o|0)>-5){u=u+-1|0;n=n+-1-o|0}else{u=u+-2|0;n=n+-1|0}p=I&8;if(p)break;do if(z){p=c[D+-4>>2]|0;if(!p){r=9;break}if(!((p>>>0)%10|0)){s=10;r=0}else{r=0;break}do{s=s*10|0;r=r+1|0}while(((p>>>0)%(s>>>0)|0|0)==0)}else r=9;while(0);p=((D-E>>2)*9|0)+-9|0;if((u|32|0)==102){p=p-r|0;p=(p|0)<0?0:p;n=(n|0)<(p|0)?n:p;p=0;break}else{p=p+o-r|0;p=(p|0)<0?0:p;n=(n|0)<(p|0)?n:p;p=0;break}}else p=I&8;while(0);x=n|p;s=(x|0)!=0&1;t=(u|32|0)==102;if(t){o=(o|0)>0?o:0;u=0}else{r=(o|0)<0?y:o;r=Se(r,((r|0)<0)<<31>>31,X)|0;if(($-r|0)<2)do{r=r+-1|0;a[r>>0]=48}while(($-r|0)<2);a[r+-1>>0]=(o>>31&2)+43;E=r+-2|0;a[E>>0]=u;o=$-E|0;u=E}y=G+1+n+s+o|0;Te(e,32,K,y,I);if(!(c[e>>2]&32))ve(H,G,e)|0;Te(e,48,K,y,I^65536);do if(t){r=w>>>0>F>>>0?F:w;o=r;do{p=Se(c[o>>2]|0,0,R)|0;do if((o|0)==(r|0)){if((p|0)!=(R|0))break;a[T>>0]=48;p=T}else{if(p>>>0<=da>>>0)break;do{p=p+-1|0;a[p>>0]=48}while(p>>>0>da>>>0)}while(0);if(!(c[e>>2]&32))ve(p,S-p|0,e)|0;o=o+4|0}while(o>>>0<=F>>>0);do if(x){if(c[e>>2]&32)break;ve(1221521,1,e)|0}while(0);if((n|0)>0&o>>>0<D>>>0){p=o;while(1){o=Se(c[p>>2]|0,0,R)|0;if(o>>>0>da>>>0)do{o=o+-1|0;a[o>>0]=48}while(o>>>0>da>>>0);if(!(c[e>>2]&32))ve(o,(n|0)>9?9:n,e)|0;p=p+4|0;o=n+-9|0;if(!((n|0)>9&p>>>0<D>>>0)){n=o;break}else n=o}}Te(e,48,n+9|0,9,0)}else{t=z?D:w+4|0;if((n|0)>-1){s=(p|0)==0;r=w;do{o=Se(c[r>>2]|0,0,R)|0;if((o|0)==(R|0)){a[T>>0]=48;o=T}do if((r|0)==(w|0)){p=o+1|0;if(!(c[e>>2]&32))ve(o,1,e)|0;if(s&(n|0)<1){o=p;break}if(c[e>>2]&32){o=p;break}ve(1221521,1,e)|0;o=p}else{if(o>>>0<=da>>>0)break;do{o=o+-1|0;a[o>>0]=48}while(o>>>0>da>>>0)}while(0);p=S-o|0;if(!(c[e>>2]&32))ve(o,(n|0)>(p|0)?p:n,e)|0;n=n-p|0;r=r+4|0}while(r>>>0<t>>>0&(n|0)>-1)}Te(e,48,n+18|0,18,0);if(c[e>>2]&32)break;ve(u,$-u|0,e)|0}while(0);Te(e,32,K,y,I^8192);n=(y|0)<(K|0)?K:y}else{t=(u&32|0)!=0;s=q!=q|0.0!=0.0;o=s?0:G;r=o+3|0;Te(e,32,K,r,p);n=c[e>>2]|0;if(!(n&32)){ve(H,o,e)|0;n=c[e>>2]|0}if(!(n&32))ve(s?(t?1221513:1221517):t?1221505:1221509,3,e)|0;Te(e,32,K,r,I^8192);n=(r|0)<(K|0)?K:r}while(0);w=J;continue a}default:{p=I;o=r;t=0;u=1221469;n=N}}while(0);g:do if((L|0)==64){p=ba;o=c[p>>2]|0;p=c[p+4>>2]|0;s=u&32;if(!((o|0)==0&(p|0)==0)){n=N;do{n=n+-1|0;a[n>>0]=d[1221453+(o&15)>>0]|s;o=df(o|0,p|0,4)|0;p=C}while(!((o|0)==0&(p|0)==0));L=ba;if((t&8|0)==0|(c[L>>2]|0)==0&(c[L+4>>2]|0)==0){o=t;t=0;s=1221469;L=77}else{o=t;t=2;s=1221469+(u>>4)|0;L=77}}else{n=N;o=t;t=0;s=1221469;L=77}}else if((L|0)==76){n=Se(n,o,N)|0;o=I;t=p;L=77}else if((L|0)==82){L=0;I=Be(n,0,r)|0;H=(I|0)==0;w=n;o=H?r:I-n|0;t=0;u=1221469;n=H?n+r|0:I}else if((L|0)==86){L=0;o=0;n=0;s=c[ba>>2]|0;while(1){p=c[s>>2]|0;if(!p)break;n=fe(fa,p)|0;if((n|0)<0|n>>>0>(r-o|0)>>>0)break;o=n+o|0;if(r>>>0>o>>>0)s=s+4|0;else break}if((n|0)<0){m=-1;break a}Te(e,32,K,o,I);if(!o){n=0;L=98}else{p=0;r=c[ba>>2]|0;while(1){n=c[r>>2]|0;if(!n){n=o;L=98;break g}n=fe(fa,n)|0;p=n+p|0;if((p|0)>(o|0)){n=o;L=98;break g}if(!(c[e>>2]&32))ve(fa,n,e)|0;if(p>>>0>=o>>>0){n=o;L=98;break}else r=r+4|0}}}while(0);if((L|0)==98){L=0;Te(e,32,K,n,I^8192);w=J;n=(K|0)>(n|0)?K:n;continue}if((L|0)==77){L=0;p=(r|0)>-1?o&-65537:o;o=ba;o=(c[o>>2]|0)!=0|(c[o+4>>2]|0)!=0;if((r|0)!=0|o){o=(o&1^1)+(U-n)|0;w=n;o=(r|0)>(o|0)?r:o;u=s;n=N}else{w=N;o=0;u=s;n=N}}s=n-w|0;o=(o|0)<(s|0)?s:o;r=t+o|0;n=(K|0)<(r|0)?r:K;Te(e,32,n,r,p);if(!(c[e>>2]&32))ve(u,t,e)|0;Te(e,48,n,r,p^65536);Te(e,48,o,s,0);if(!(c[e>>2]&32))ve(w,s,e)|0;Te(e,32,n,r,p^8192);w=J}h:do if((L|0)==245)if(!e)if(f){m=1;while(1){f=c[l+(m<<2)>>2]|0;if(!f)break;Re(j+(m<<3)|0,f,g);m=m+1|0;if((m|0)>=10){m=1;break h}}if((m|0)<10)while(1){if(c[l+(m<<2)>>2]|0){m=-1;break h}m=m+1|0;if((m|0)>=10){m=1;break}}else m=1}else m=0;while(0);i=ha;return m|0}function Qe(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=a+20|0;f=c[e>>2]|0;a=(c[a+16>>2]|0)-f|0;a=a>>>0>d>>>0?d:a;ef(f|0,b|0,a|0)|0;c[e>>2]=(c[e>>2]|0)+a;return d|0}function Re(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0.0;a:do if(b>>>0<=20)do switch(b|0){case 9:{e=(c[d>>2]|0)+(4-1)&~(4-1);b=c[e>>2]|0;c[d>>2]=e+4;c[a>>2]=b;break a}case 10:{e=(c[d>>2]|0)+(4-1)&~(4-1);b=c[e>>2]|0;c[d>>2]=e+4;e=a;c[e>>2]=b;c[e+4>>2]=((b|0)<0)<<31>>31;break a}case 11:{e=(c[d>>2]|0)+(4-1)&~(4-1);b=c[e>>2]|0;c[d>>2]=e+4;e=a;c[e>>2]=b;c[e+4>>2]=0;break a}case 12:{e=(c[d>>2]|0)+(8-1)&~(8-1);b=e;f=c[b>>2]|0;b=c[b+4>>2]|0;c[d>>2]=e+8;e=a;c[e>>2]=f;c[e+4>>2]=b;break a}case 13:{f=(c[d>>2]|0)+(4-1)&~(4-1);e=c[f>>2]|0;c[d>>2]=f+4;e=(e&65535)<<16>>16;f=a;c[f>>2]=e;c[f+4>>2]=((e|0)<0)<<31>>31;break a}case 14:{f=(c[d>>2]|0)+(4-1)&~(4-1);e=c[f>>2]|0;c[d>>2]=f+4;f=a;c[f>>2]=e&65535;c[f+4>>2]=0;break a}case 15:{f=(c[d>>2]|0)+(4-1)&~(4-1);e=c[f>>2]|0;c[d>>2]=f+4;e=(e&255)<<24>>24;f=a;c[f>>2]=e;c[f+4>>2]=((e|0)<0)<<31>>31;break a}case 16:{f=(c[d>>2]|0)+(4-1)&~(4-1);e=c[f>>2]|0;c[d>>2]=f+4;f=a;c[f>>2]=e&255;c[f+4>>2]=0;break a}case 17:{f=(c[d>>2]|0)+(8-1)&~(8-1);g=+h[f>>3];c[d>>2]=f+8;h[a>>3]=g;break a}case 18:{f=(c[d>>2]|0)+(8-1)&~(8-1);g=+h[f>>3];c[d>>2]=f+8;h[a>>3]=g;break a}default:break a}while(0);while(0);return}function Se(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;if(c>>>0>0|(c|0)==0&b>>>0>4294967295)while(1){e=nf(b|0,c|0,10,0)|0;d=d+-1|0;a[d>>0]=e|48;e=mf(b|0,c|0,10,0)|0;if(c>>>0>9|(c|0)==9&b>>>0>4294967295){b=e;c=C}else{b=e;break}}if(b)while(1){d=d+-1|0;a[d>>0]=(b>>>0)%10|0|48;if(b>>>0<10)break;else b=(b>>>0)/10|0}return d|0}function Te(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;j=i;i=i+256|0;h=j;do if((d|0)>(e|0)&(f&73728|0)==0){f=d-e|0;af(h|0,b|0,(f>>>0>256?256:f)|0)|0;b=c[a>>2]|0;g=(b&32|0)==0;if(f>>>0>255){e=d-e|0;do{if(g){ve(h,256,a)|0;b=c[a>>2]|0}f=f+-256|0;g=(b&32|0)==0}while(f>>>0>255);if(g)f=e&255;else break}else if(!g)break;ve(h,f,a)|0}while(0);i=j;return}function Ue(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;do if(a>>>0<245){o=a>>>0<11?16:a+11&-8;a=o>>>3;i=c[271702]|0;d=i>>>a;if(d&3){a=(d&1^1)+a|0;e=a<<1;d=1086848+(e<<2)|0;e=1086848+(e+2<<2)|0;f=c[e>>2]|0;g=f+8|0;h=c[g>>2]|0;do if((d|0)!=(h|0)){if(h>>>0<(c[271706]|0)>>>0)Aa();b=h+12|0;if((c[b>>2]|0)==(f|0)){c[b>>2]=d;c[e>>2]=h;break}else Aa()}else c[271702]=i&~(1<<a);while(0);M=a<<3;c[f+4>>2]=M|3;M=f+(M|4)|0;c[M>>2]=c[M>>2]|1;M=g;return M|0}h=c[271704]|0;if(o>>>0>h>>>0){if(d){e=2<<a;e=d<<a&(e|0-e);e=(e&0-e)+-1|0;j=e>>>12&16;e=e>>>j;f=e>>>5&8;e=e>>>f;g=e>>>2&4;e=e>>>g;d=e>>>1&2;e=e>>>d;a=e>>>1&1;a=(f|j|g|d|a)+(e>>>a)|0;e=a<<1;d=1086848+(e<<2)|0;e=1086848+(e+2<<2)|0;g=c[e>>2]|0;j=g+8|0;f=c[j>>2]|0;do if((d|0)!=(f|0)){if(f>>>0<(c[271706]|0)>>>0)Aa();b=f+12|0;if((c[b>>2]|0)==(g|0)){c[b>>2]=d;c[e>>2]=f;k=c[271704]|0;break}else Aa()}else{c[271702]=i&~(1<<a);k=h}while(0);M=a<<3;h=M-o|0;c[g+4>>2]=o|3;i=g+o|0;c[g+(o|4)>>2]=h|1;c[g+M>>2]=h;if(k){f=c[271707]|0;d=k>>>3;b=d<<1;e=1086848+(b<<2)|0;a=c[271702]|0;d=1<<d;if(a&d){a=1086848+(b+2<<2)|0;b=c[a>>2]|0;if(b>>>0<(c[271706]|0)>>>0)Aa();else{l=a;m=b}}else{c[271702]=a|d;l=1086848+(b+2<<2)|0;m=e}c[l>>2]=f;c[m+12>>2]=f;c[f+8>>2]=m;c[f+12>>2]=e}c[271704]=h;c[271707]=i;M=j;return M|0}a=c[271703]|0;if(a){d=(a&0-a)+-1|0;L=d>>>12&16;d=d>>>L;K=d>>>5&8;d=d>>>K;M=d>>>2&4;d=d>>>M;a=d>>>1&2;d=d>>>a;e=d>>>1&1;e=c[1087112+((K|L|M|a|e)+(d>>>e)<<2)>>2]|0;d=(c[e+4>>2]&-8)-o|0;a=e;while(1){b=c[a+16>>2]|0;if(!b){b=c[a+20>>2]|0;if(!b){j=d;break}}a=(c[b+4>>2]&-8)-o|0;M=a>>>0<d>>>0;d=M?a:d;a=b;e=M?b:e}g=c[271706]|0;if(e>>>0<g>>>0)Aa();i=e+o|0;if(e>>>0>=i>>>0)Aa();h=c[e+24>>2]|0;d=c[e+12>>2]|0;do if((d|0)==(e|0)){a=e+20|0;b=c[a>>2]|0;if(!b){a=e+16|0;b=c[a>>2]|0;if(!b){n=0;break}}while(1){d=b+20|0;f=c[d>>2]|0;if(f){b=f;a=d;continue}d=b+16|0;f=c[d>>2]|0;if(!f)break;else{b=f;a=d}}if(a>>>0<g>>>0)Aa();else{c[a>>2]=0;n=b;break}}else{f=c[e+8>>2]|0;if(f>>>0<g>>>0)Aa();b=f+12|0;if((c[b>>2]|0)!=(e|0))Aa();a=d+8|0;if((c[a>>2]|0)==(e|0)){c[b>>2]=d;c[a>>2]=f;n=d;break}else Aa()}while(0);do if(h){b=c[e+28>>2]|0;a=1087112+(b<<2)|0;if((e|0)==(c[a>>2]|0)){c[a>>2]=n;if(!n){c[271703]=c[271703]&~(1<<b);break}}else{if(h>>>0<(c[271706]|0)>>>0)Aa();b=h+16|0;if((c[b>>2]|0)==(e|0))c[b>>2]=n;else c[h+20>>2]=n;if(!n)break}a=c[271706]|0;if(n>>>0<a>>>0)Aa();c[n+24>>2]=h;b=c[e+16>>2]|0;do if(b)if(b>>>0<a>>>0)Aa();else{c[n+16>>2]=b;c[b+24>>2]=n;break}while(0);b=c[e+20>>2]|0;if(b)if(b>>>0<(c[271706]|0)>>>0)Aa();else{c[n+20>>2]=b;c[b+24>>2]=n;break}}while(0);if(j>>>0<16){M=j+o|0;c[e+4>>2]=M|3;M=e+(M+4)|0;c[M>>2]=c[M>>2]|1}else{c[e+4>>2]=o|3;c[e+(o|4)>>2]=j|1;c[e+(j+o)>>2]=j;b=c[271704]|0;if(b){g=c[271707]|0;d=b>>>3;b=d<<1;f=1086848+(b<<2)|0;a=c[271702]|0;d=1<<d;if(a&d){b=1086848+(b+2<<2)|0;a=c[b>>2]|0;if(a>>>0<(c[271706]|0)>>>0)Aa();else{p=b;q=a}}else{c[271702]=a|d;p=1086848+(b+2<<2)|0;q=f}c[p>>2]=g;c[q+12>>2]=g;c[g+8>>2]=q;c[g+12>>2]=f}c[271704]=j;c[271707]=i}M=e+8|0;return M|0}else q=o}else q=o}else if(a>>>0<=4294967231){a=a+11|0;m=a&-8;l=c[271703]|0;if(l){d=0-m|0;a=a>>>8;if(a)if(m>>>0>16777215)k=31;else{q=(a+1048320|0)>>>16&8;v=a<<q;p=(v+520192|0)>>>16&4;v=v<<p;k=(v+245760|0)>>>16&2;k=14-(p|q|k)+(v<<k>>>15)|0;k=m>>>(k+7|0)&1|k<<1}else k=0;a=c[1087112+(k<<2)>>2]|0;a:do if(!a){f=0;a=0;v=86}else{h=d;f=0;i=m<<((k|0)==31?0:25-(k>>>1)|0);j=a;a=0;while(1){g=c[j+4>>2]&-8;d=g-m|0;if(d>>>0<h>>>0)if((g|0)==(m|0)){g=j;a=j;v=90;break a}else a=j;else d=h;v=c[j+20>>2]|0;j=c[j+16+(i>>>31<<2)>>2]|0;f=(v|0)==0|(v|0)==(j|0)?f:v;if(!j){v=86;break}else{h=d;i=i<<1}}}while(0);if((v|0)==86){if((f|0)==0&(a|0)==0){a=2<<k;a=l&(a|0-a);if(!a){q=m;break}a=(a&0-a)+-1|0;n=a>>>12&16;a=a>>>n;l=a>>>5&8;a=a>>>l;p=a>>>2&4;a=a>>>p;q=a>>>1&2;a=a>>>q;f=a>>>1&1;f=c[1087112+((l|n|p|q|f)+(a>>>f)<<2)>>2]|0;a=0}if(!f){i=d;j=a}else{g=f;v=90}}if((v|0)==90)while(1){v=0;q=(c[g+4>>2]&-8)-m|0;f=q>>>0<d>>>0;d=f?q:d;a=f?g:a;f=c[g+16>>2]|0;if(f){g=f;v=90;continue}g=c[g+20>>2]|0;if(!g){i=d;j=a;break}else v=90}if((j|0)!=0?i>>>0<((c[271704]|0)-m|0)>>>0:0){f=c[271706]|0;if(j>>>0<f>>>0)Aa();h=j+m|0;if(j>>>0>=h>>>0)Aa();g=c[j+24>>2]|0;d=c[j+12>>2]|0;do if((d|0)==(j|0)){a=j+20|0;b=c[a>>2]|0;if(!b){a=j+16|0;b=c[a>>2]|0;if(!b){o=0;break}}while(1){d=b+20|0;e=c[d>>2]|0;if(e){b=e;a=d;continue}d=b+16|0;e=c[d>>2]|0;if(!e)break;else{b=e;a=d}}if(a>>>0<f>>>0)Aa();else{c[a>>2]=0;o=b;break}}else{e=c[j+8>>2]|0;if(e>>>0<f>>>0)Aa();b=e+12|0;if((c[b>>2]|0)!=(j|0))Aa();a=d+8|0;if((c[a>>2]|0)==(j|0)){c[b>>2]=d;c[a>>2]=e;o=d;break}else Aa()}while(0);do if(g){b=c[j+28>>2]|0;a=1087112+(b<<2)|0;if((j|0)==(c[a>>2]|0)){c[a>>2]=o;if(!o){c[271703]=c[271703]&~(1<<b);break}}else{if(g>>>0<(c[271706]|0)>>>0)Aa();b=g+16|0;if((c[b>>2]|0)==(j|0))c[b>>2]=o;else c[g+20>>2]=o;if(!o)break}a=c[271706]|0;if(o>>>0<a>>>0)Aa();c[o+24>>2]=g;b=c[j+16>>2]|0;do if(b)if(b>>>0<a>>>0)Aa();else{c[o+16>>2]=b;c[b+24>>2]=o;break}while(0);b=c[j+20>>2]|0;if(b)if(b>>>0<(c[271706]|0)>>>0)Aa();else{c[o+20>>2]=b;c[b+24>>2]=o;break}}while(0);b:do if(i>>>0>=16){c[j+4>>2]=m|3;c[j+(m|4)>>2]=i|1;c[j+(i+m)>>2]=i;b=i>>>3;if(i>>>0<256){a=b<<1;e=1086848+(a<<2)|0;d=c[271702]|0;b=1<<b;if(d&b){b=1086848+(a+2<<2)|0;a=c[b>>2]|0;if(a>>>0<(c[271706]|0)>>>0)Aa();else{s=b;t=a}}else{c[271702]=d|b;s=1086848+(a+2<<2)|0;t=e}c[s>>2]=h;c[t+12>>2]=h;c[j+(m+8)>>2]=t;c[j+(m+12)>>2]=e;break}b=i>>>8;if(b)if(i>>>0>16777215)e=31;else{L=(b+1048320|0)>>>16&8;M=b<<L;K=(M+520192|0)>>>16&4;M=M<<K;e=(M+245760|0)>>>16&2;e=14-(K|L|e)+(M<<e>>>15)|0;e=i>>>(e+7|0)&1|e<<1}else e=0;b=1087112+(e<<2)|0;c[j+(m+28)>>2]=e;c[j+(m+20)>>2]=0;c[j+(m+16)>>2]=0;a=c[271703]|0;d=1<<e;if(!(a&d)){c[271703]=a|d;c[b>>2]=h;c[j+(m+24)>>2]=b;c[j+(m+12)>>2]=h;c[j+(m+8)>>2]=h;break}b=c[b>>2]|0;c:do if((c[b+4>>2]&-8|0)!=(i|0)){e=i<<((e|0)==31?0:25-(e>>>1)|0);while(1){a=b+16+(e>>>31<<2)|0;d=c[a>>2]|0;if(!d)break;if((c[d+4>>2]&-8|0)==(i|0)){y=d;break c}else{e=e<<1;b=d}}if(a>>>0<(c[271706]|0)>>>0)Aa();else{c[a>>2]=h;c[j+(m+24)>>2]=b;c[j+(m+12)>>2]=h;c[j+(m+8)>>2]=h;break b}}else y=b;while(0);b=y+8|0;a=c[b>>2]|0;M=c[271706]|0;if(a>>>0>=M>>>0&y>>>0>=M>>>0){c[a+12>>2]=h;c[b>>2]=h;c[j+(m+8)>>2]=a;c[j+(m+12)>>2]=y;c[j+(m+24)>>2]=0;break}else Aa()}else{M=i+m|0;c[j+4>>2]=M|3;M=j+(M+4)|0;c[M>>2]=c[M>>2]|1}while(0);M=j+8|0;return M|0}else q=m}else q=m}else q=-1;while(0);d=c[271704]|0;if(d>>>0>=q>>>0){b=d-q|0;a=c[271707]|0;if(b>>>0>15){c[271707]=a+q;c[271704]=b;c[a+(q+4)>>2]=b|1;c[a+d>>2]=b;c[a+4>>2]=q|3}else{c[271704]=0;c[271707]=0;c[a+4>>2]=d|3;M=a+(d+4)|0;c[M>>2]=c[M>>2]|1}M=a+8|0;return M|0}a=c[271705]|0;if(a>>>0>q>>>0){L=a-q|0;c[271705]=L;M=c[271708]|0;c[271708]=M+q;c[M+(q+4)>>2]=L|1;c[M+4>>2]=q|3;M=M+8|0;return M|0}do if(!(c[271820]|0)){a=ta(30)|0;if(!(a+-1&a)){c[271822]=a;c[271821]=a;c[271823]=-1;c[271824]=-1;c[271825]=0;c[271813]=0;c[271820]=(Ca(0)|0)&-16^1431655768;break}else Aa()}while(0);j=q+48|0;i=c[271822]|0;k=q+47|0;h=i+k|0;i=0-i|0;l=h&i;if(l>>>0<=q>>>0){M=0;return M|0}a=c[271812]|0;if((a|0)!=0?(t=c[271810]|0,y=t+l|0,y>>>0<=t>>>0|y>>>0>a>>>0):0){M=0;return M|0}d:do if(!(c[271813]&4)){a=c[271708]|0;e:do if(a){f=1087256;while(1){d=c[f>>2]|0;if(d>>>0<=a>>>0?(r=f+4|0,(d+(c[r>>2]|0)|0)>>>0>a>>>0):0){g=f;a=r;break}f=c[f+8>>2]|0;if(!f){v=174;break e}}d=h-(c[271705]|0)&i;if(d>>>0<2147483647){f=ra(d|0)|0;y=(f|0)==((c[g>>2]|0)+(c[a>>2]|0)|0);a=y?d:0;if(y){if((f|0)!=(-1|0)){w=f;p=a;v=194;break d}}else v=184}else a=0}else v=174;while(0);do if((v|0)==174){g=ra(0)|0;if((g|0)!=(-1|0)){a=g;d=c[271821]|0;f=d+-1|0;if(!(f&a))d=l;else d=l-a+(f+a&0-d)|0;a=c[271810]|0;f=a+d|0;if(d>>>0>q>>>0&d>>>0<2147483647){y=c[271812]|0;if((y|0)!=0?f>>>0<=a>>>0|f>>>0>y>>>0:0){a=0;break}f=ra(d|0)|0;y=(f|0)==(g|0);a=y?d:0;if(y){w=g;p=a;v=194;break d}else v=184}else a=0}else a=0}while(0);f:do if((v|0)==184){g=0-d|0;do if(j>>>0>d>>>0&(d>>>0<2147483647&(f|0)!=(-1|0))?(u=c[271822]|0,u=k-d+u&0-u,u>>>0<2147483647):0)if((ra(u|0)|0)==(-1|0)){ra(g|0)|0;break f}else{d=u+d|0;break}while(0);if((f|0)!=(-1|0)){w=f;p=d;v=194;break d}}while(0);c[271813]=c[271813]|4;v=191}else{a=0;v=191}while(0);if((((v|0)==191?l>>>0<2147483647:0)?(w=ra(l|0)|0,x=ra(0)|0,w>>>0<x>>>0&((w|0)!=(-1|0)&(x|0)!=(-1|0))):0)?(z=x-w|0,A=z>>>0>(q+40|0)>>>0,A):0){p=A?z:a;v=194}if((v|0)==194){a=(c[271810]|0)+p|0;c[271810]=a;if(a>>>0>(c[271811]|0)>>>0)c[271811]=a;h=c[271708]|0;g:do if(h){g=1087256;do{a=c[g>>2]|0;d=g+4|0;f=c[d>>2]|0;if((w|0)==(a+f|0)){B=a;C=d;D=f;E=g;v=204;break}g=c[g+8>>2]|0}while((g|0)!=0);if(((v|0)==204?(c[E+12>>2]&8|0)==0:0)?h>>>0<w>>>0&h>>>0>=B>>>0:0){c[C>>2]=D+p;M=(c[271705]|0)+p|0;L=h+8|0;L=(L&7|0)==0?0:0-L&7;K=M-L|0;c[271708]=h+L;c[271705]=K;c[h+(L+4)>>2]=K|1;c[h+(M+4)>>2]=40;c[271709]=c[271824];break}a=c[271706]|0;if(w>>>0<a>>>0){c[271706]=w;a=w}d=w+p|0;g=1087256;while(1){if((c[g>>2]|0)==(d|0)){f=g;d=g;v=212;break}g=c[g+8>>2]|0;if(!g){d=1087256;break}}if((v|0)==212)if(!(c[d+12>>2]&8)){c[f>>2]=w;n=d+4|0;c[n>>2]=(c[n>>2]|0)+p;n=w+8|0;n=(n&7|0)==0?0:0-n&7;k=w+(p+8)|0;k=(k&7|0)==0?0:0-k&7;b=w+(k+p)|0;m=n+q|0;o=w+m|0;l=b-(w+n)-q|0;c[w+(n+4)>>2]=q|3;h:do if((b|0)!=(h|0)){if((b|0)==(c[271707]|0)){M=(c[271704]|0)+l|0;c[271704]=M;c[271707]=o;c[w+(m+4)>>2]=M|1;c[w+(M+m)>>2]=M;break}i=p+4|0;d=c[w+(i+k)>>2]|0;if((d&3|0)==1){j=d&-8;g=d>>>3;i:do if(d>>>0>=256){h=c[w+((k|24)+p)>>2]|0;e=c[w+(p+12+k)>>2]|0;do if((e|0)==(b|0)){f=k|16;e=w+(i+f)|0;d=c[e>>2]|0;if(!d){e=w+(f+p)|0;d=c[e>>2]|0;if(!d){J=0;break}}while(1){f=d+20|0;g=c[f>>2]|0;if(g){d=g;e=f;continue}f=d+16|0;g=c[f>>2]|0;if(!g)break;else{d=g;e=f}}if(e>>>0<a>>>0)Aa();else{c[e>>2]=0;J=d;break}}else{f=c[w+((k|8)+p)>>2]|0;if(f>>>0<a>>>0)Aa();a=f+12|0;if((c[a>>2]|0)!=(b|0))Aa();d=e+8|0;if((c[d>>2]|0)==(b|0)){c[a>>2]=e;c[d>>2]=f;J=e;break}else Aa()}while(0);if(!h)break;a=c[w+(p+28+k)>>2]|0;d=1087112+(a<<2)|0;do if((b|0)!=(c[d>>2]|0)){if(h>>>0<(c[271706]|0)>>>0)Aa();a=h+16|0;if((c[a>>2]|0)==(b|0))c[a>>2]=J;else c[h+20>>2]=J;if(!J)break i}else{c[d>>2]=J;if(J)break;c[271703]=c[271703]&~(1<<a);break i}while(0);d=c[271706]|0;if(J>>>0<d>>>0)Aa();c[J+24>>2]=h;b=k|16;a=c[w+(b+p)>>2]|0;do if(a)if(a>>>0<d>>>0)Aa();else{c[J+16>>2]=a;c[a+24>>2]=J;break}while(0);b=c[w+(i+b)>>2]|0;if(!b)break;if(b>>>0<(c[271706]|0)>>>0)Aa();else{c[J+20>>2]=b;c[b+24>>2]=J;break}}else{e=c[w+((k|8)+p)>>2]|0;f=c[w+(p+12+k)>>2]|0;d=1086848+(g<<1<<2)|0;do if((e|0)!=(d|0)){if(e>>>0<a>>>0)Aa();if((c[e+12>>2]|0)==(b|0))break;Aa()}while(0);if((f|0)==(e|0)){c[271702]=c[271702]&~(1<<g);break}do if((f|0)==(d|0))F=f+8|0;else{if(f>>>0<a>>>0)Aa();a=f+8|0;if((c[a>>2]|0)==(b|0)){F=a;break}Aa()}while(0);c[e+12>>2]=f;c[F>>2]=e}while(0);b=w+((j|k)+p)|0;f=j+l|0}else f=l;b=b+4|0;c[b>>2]=c[b>>2]&-2;c[w+(m+4)>>2]=f|1;c[w+(f+m)>>2]=f;b=f>>>3;if(f>>>0<256){a=b<<1;e=1086848+(a<<2)|0;d=c[271702]|0;b=1<<b;do if(!(d&b)){c[271702]=d|b;K=1086848+(a+2<<2)|0;L=e}else{b=1086848+(a+2<<2)|0;a=c[b>>2]|0;if(a>>>0>=(c[271706]|0)>>>0){K=b;L=a;break}Aa()}while(0);c[K>>2]=o;c[L+12>>2]=o;c[w+(m+8)>>2]=L;c[w+(m+12)>>2]=e;break}b=f>>>8;do if(!b)e=0;else{if(f>>>0>16777215){e=31;break}K=(b+1048320|0)>>>16&8;L=b<<K;J=(L+520192|0)>>>16&4;L=L<<J;e=(L+245760|0)>>>16&2;e=14-(J|K|e)+(L<<e>>>15)|0;e=f>>>(e+7|0)&1|e<<1}while(0);b=1087112+(e<<2)|0;c[w+(m+28)>>2]=e;c[w+(m+20)>>2]=0;c[w+(m+16)>>2]=0;a=c[271703]|0;d=1<<e;if(!(a&d)){c[271703]=a|d;c[b>>2]=o;c[w+(m+24)>>2]=b;c[w+(m+12)>>2]=o;c[w+(m+8)>>2]=o;break}b=c[b>>2]|0;j:do if((c[b+4>>2]&-8|0)!=(f|0)){e=f<<((e|0)==31?0:25-(e>>>1)|0);while(1){a=b+16+(e>>>31<<2)|0;d=c[a>>2]|0;if(!d)break;if((c[d+4>>2]&-8|0)==(f|0)){M=d;break j}else{e=e<<1;b=d}}if(a>>>0<(c[271706]|0)>>>0)Aa();else{c[a>>2]=o;c[w+(m+24)>>2]=b;c[w+(m+12)>>2]=o;c[w+(m+8)>>2]=o;break h}}else M=b;while(0);b=M+8|0;a=c[b>>2]|0;L=c[271706]|0;if(a>>>0>=L>>>0&M>>>0>=L>>>0){c[a+12>>2]=o;c[b>>2]=o;c[w+(m+8)>>2]=a;c[w+(m+12)>>2]=M;c[w+(m+24)>>2]=0;break}else Aa()}else{M=(c[271705]|0)+l|0;c[271705]=M;c[271708]=o;c[w+(m+4)>>2]=M|1}while(0);M=w+(n|8)|0;return M|0}else d=1087256;while(1){a=c[d>>2]|0;if(a>>>0<=h>>>0?(b=c[d+4>>2]|0,e=a+b|0,e>>>0>h>>>0):0)break;d=c[d+8>>2]|0}f=a+(b+-39)|0;a=a+(b+-47+((f&7|0)==0?0:0-f&7))|0;f=h+16|0;a=a>>>0<f>>>0?h:a;b=a+8|0;d=w+8|0;d=(d&7|0)==0?0:0-d&7;M=p+-40-d|0;c[271708]=w+d;c[271705]=M;c[w+(d+4)>>2]=M|1;c[w+(p+-36)>>2]=40;c[271709]=c[271824];d=a+4|0;c[d>>2]=27;c[b>>2]=c[271814];c[b+4>>2]=c[271815];c[b+8>>2]=c[271816];c[b+12>>2]=c[271817];c[271814]=w;c[271815]=p;c[271817]=0;c[271816]=b;b=a+28|0;c[b>>2]=7;if((a+32|0)>>>0<e>>>0)do{M=b;b=b+4|0;c[b>>2]=7}while((M+8|0)>>>0<e>>>0);if((a|0)!=(h|0)){g=a-h|0;c[d>>2]=c[d>>2]&-2;c[h+4>>2]=g|1;c[a>>2]=g;b=g>>>3;if(g>>>0<256){a=b<<1;e=1086848+(a<<2)|0;d=c[271702]|0;b=1<<b;if(d&b){b=1086848+(a+2<<2)|0;a=c[b>>2]|0;if(a>>>0<(c[271706]|0)>>>0)Aa();else{G=b;H=a}}else{c[271702]=d|b;G=1086848+(a+2<<2)|0;H=e}c[G>>2]=h;c[H+12>>2]=h;c[h+8>>2]=H;c[h+12>>2]=e;break}b=g>>>8;if(b)if(g>>>0>16777215)e=31;else{L=(b+1048320|0)>>>16&8;M=b<<L;K=(M+520192|0)>>>16&4;M=M<<K;e=(M+245760|0)>>>16&2;e=14-(K|L|e)+(M<<e>>>15)|0;e=g>>>(e+7|0)&1|e<<1}else e=0;d=1087112+(e<<2)|0;c[h+28>>2]=e;c[h+20>>2]=0;c[f>>2]=0;b=c[271703]|0;a=1<<e;if(!(b&a)){c[271703]=b|a;c[d>>2]=h;c[h+24>>2]=d;c[h+12>>2]=h;c[h+8>>2]=h;break}b=c[d>>2]|0;k:do if((c[b+4>>2]&-8|0)!=(g|0)){e=g<<((e|0)==31?0:25-(e>>>1)|0);while(1){a=b+16+(e>>>31<<2)|0;d=c[a>>2]|0;if(!d)break;if((c[d+4>>2]&-8|0)==(g|0)){I=d;break k}else{e=e<<1;b=d}}if(a>>>0<(c[271706]|0)>>>0)Aa();else{c[a>>2]=h;c[h+24>>2]=b;c[h+12>>2]=h;c[h+8>>2]=h;break g}}else I=b;while(0);b=I+8|0;a=c[b>>2]|0;M=c[271706]|0;if(a>>>0>=M>>>0&I>>>0>=M>>>0){c[a+12>>2]=h;c[b>>2]=h;c[h+8>>2]=a;c[h+12>>2]=I;c[h+24>>2]=0;break}else Aa()}}else{M=c[271706]|0;if((M|0)==0|w>>>0<M>>>0)c[271706]=w;c[271814]=w;c[271815]=p;c[271817]=0;c[271711]=c[271820];c[271710]=-1;b=0;do{M=b<<1;L=1086848+(M<<2)|0;c[1086848+(M+3<<2)>>2]=L;c[1086848+(M+2<<2)>>2]=L;b=b+1|0}while((b|0)!=32);M=w+8|0;M=(M&7|0)==0?0:0-M&7;L=p+-40-M|0;c[271708]=w+M;c[271705]=L;c[w+(M+4)>>2]=L|1;c[w+(p+-36)>>2]=40;c[271709]=c[271824]}while(0);b=c[271705]|0;if(b>>>0>q>>>0){L=b-q|0;c[271705]=L;M=c[271708]|0;c[271708]=M+q;c[M+(q+4)>>2]=L|1;c[M+4>>2]=q|3;M=M+8|0;return M|0}}c[(Yd()|0)>>2]=12;M=0;return M|0}function Ve(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if(!a)return;b=a+-8|0;i=c[271706]|0;if(b>>>0<i>>>0)Aa();d=c[a+-4>>2]|0;e=d&3;if((e|0)==1)Aa();o=d&-8;q=a+(o+-8)|0;do if(!(d&1)){b=c[b>>2]|0;if(!e)return;j=-8-b|0;l=a+j|0;m=b+o|0;if(l>>>0<i>>>0)Aa();if((l|0)==(c[271707]|0)){b=a+(o+-4)|0;d=c[b>>2]|0;if((d&3|0)!=3){u=l;g=m;break}c[271704]=m;c[b>>2]=d&-2;c[a+(j+4)>>2]=m|1;c[q>>2]=m;return}f=b>>>3;if(b>>>0<256){e=c[a+(j+8)>>2]|0;d=c[a+(j+12)>>2]|0;b=1086848+(f<<1<<2)|0;if((e|0)!=(b|0)){if(e>>>0<i>>>0)Aa();if((c[e+12>>2]|0)!=(l|0))Aa()}if((d|0)==(e|0)){c[271702]=c[271702]&~(1<<f);u=l;g=m;break}if((d|0)!=(b|0)){if(d>>>0<i>>>0)Aa();b=d+8|0;if((c[b>>2]|0)==(l|0))h=b;else Aa()}else h=d+8|0;c[e+12>>2]=d;c[h>>2]=e;u=l;g=m;break}h=c[a+(j+24)>>2]|0;e=c[a+(j+12)>>2]|0;do if((e|0)==(l|0)){d=a+(j+20)|0;b=c[d>>2]|0;if(!b){d=a+(j+16)|0;b=c[d>>2]|0;if(!b){k=0;break}}while(1){e=b+20|0;f=c[e>>2]|0;if(f){b=f;d=e;continue}e=b+16|0;f=c[e>>2]|0;if(!f)break;else{b=f;d=e}}if(d>>>0<i>>>0)Aa();else{c[d>>2]=0;k=b;break}}else{f=c[a+(j+8)>>2]|0;if(f>>>0<i>>>0)Aa();b=f+12|0;if((c[b>>2]|0)!=(l|0))Aa();d=e+8|0;if((c[d>>2]|0)==(l|0)){c[b>>2]=e;c[d>>2]=f;k=e;break}else Aa()}while(0);if(h){b=c[a+(j+28)>>2]|0;d=1087112+(b<<2)|0;if((l|0)==(c[d>>2]|0)){c[d>>2]=k;if(!k){c[271703]=c[271703]&~(1<<b);u=l;g=m;break}}else{if(h>>>0<(c[271706]|0)>>>0)Aa();b=h+16|0;if((c[b>>2]|0)==(l|0))c[b>>2]=k;else c[h+20>>2]=k;if(!k){u=l;g=m;break}}d=c[271706]|0;if(k>>>0<d>>>0)Aa();c[k+24>>2]=h;b=c[a+(j+16)>>2]|0;do if(b)if(b>>>0<d>>>0)Aa();else{c[k+16>>2]=b;c[b+24>>2]=k;break}while(0);b=c[a+(j+20)>>2]|0;if(b)if(b>>>0<(c[271706]|0)>>>0)Aa();else{c[k+20>>2]=b;c[b+24>>2]=k;u=l;g=m;break}else{u=l;g=m}}else{u=l;g=m}}else{u=b;g=o}while(0);if(u>>>0>=q>>>0)Aa();b=a+(o+-4)|0;d=c[b>>2]|0;if(!(d&1))Aa();if(!(d&2)){if((q|0)==(c[271708]|0)){t=(c[271705]|0)+g|0;c[271705]=t;c[271708]=u;c[u+4>>2]=t|1;if((u|0)!=(c[271707]|0))return;c[271707]=0;c[271704]=0;return}if((q|0)==(c[271707]|0)){t=(c[271704]|0)+g|0;c[271704]=t;c[271707]=u;c[u+4>>2]=t|1;c[u+t>>2]=t;return}g=(d&-8)+g|0;f=d>>>3;do if(d>>>0>=256){h=c[a+(o+16)>>2]|0;b=c[a+(o|4)>>2]|0;do if((b|0)==(q|0)){d=a+(o+12)|0;b=c[d>>2]|0;if(!b){d=a+(o+8)|0;b=c[d>>2]|0;if(!b){p=0;break}}while(1){e=b+20|0;f=c[e>>2]|0;if(f){b=f;d=e;continue}e=b+16|0;f=c[e>>2]|0;if(!f)break;else{b=f;d=e}}if(d>>>0<(c[271706]|0)>>>0)Aa();else{c[d>>2]=0;p=b;break}}else{d=c[a+o>>2]|0;if(d>>>0<(c[271706]|0)>>>0)Aa();e=d+12|0;if((c[e>>2]|0)!=(q|0))Aa();f=b+8|0;if((c[f>>2]|0)==(q|0)){c[e>>2]=b;c[f>>2]=d;p=b;break}else Aa()}while(0);if(h){b=c[a+(o+20)>>2]|0;d=1087112+(b<<2)|0;if((q|0)==(c[d>>2]|0)){c[d>>2]=p;if(!p){c[271703]=c[271703]&~(1<<b);break}}else{if(h>>>0<(c[271706]|0)>>>0)Aa();b=h+16|0;if((c[b>>2]|0)==(q|0))c[b>>2]=p;else c[h+20>>2]=p;if(!p)break}d=c[271706]|0;if(p>>>0<d>>>0)Aa();c[p+24>>2]=h;b=c[a+(o+8)>>2]|0;do if(b)if(b>>>0<d>>>0)Aa();else{c[p+16>>2]=b;c[b+24>>2]=p;break}while(0);b=c[a+(o+12)>>2]|0;if(b)if(b>>>0<(c[271706]|0)>>>0)Aa();else{c[p+20>>2]=b;c[b+24>>2]=p;break}}}else{e=c[a+o>>2]|0;d=c[a+(o|4)>>2]|0;b=1086848+(f<<1<<2)|0;if((e|0)!=(b|0)){if(e>>>0<(c[271706]|0)>>>0)Aa();if((c[e+12>>2]|0)!=(q|0))Aa()}if((d|0)==(e|0)){c[271702]=c[271702]&~(1<<f);break}if((d|0)!=(b|0)){if(d>>>0<(c[271706]|0)>>>0)Aa();b=d+8|0;if((c[b>>2]|0)==(q|0))n=b;else Aa()}else n=d+8|0;c[e+12>>2]=d;c[n>>2]=e}while(0);c[u+4>>2]=g|1;c[u+g>>2]=g;if((u|0)==(c[271707]|0)){c[271704]=g;return}}else{c[b>>2]=d&-2;c[u+4>>2]=g|1;c[u+g>>2]=g}b=g>>>3;if(g>>>0<256){d=b<<1;f=1086848+(d<<2)|0;e=c[271702]|0;b=1<<b;if(e&b){b=1086848+(d+2<<2)|0;d=c[b>>2]|0;if(d>>>0<(c[271706]|0)>>>0)Aa();else{r=b;s=d}}else{c[271702]=e|b;r=1086848+(d+2<<2)|0;s=f}c[r>>2]=u;c[s+12>>2]=u;c[u+8>>2]=s;c[u+12>>2]=f;return}b=g>>>8;if(b)if(g>>>0>16777215)f=31;else{r=(b+1048320|0)>>>16&8;s=b<<r;q=(s+520192|0)>>>16&4;s=s<<q;f=(s+245760|0)>>>16&2;f=14-(q|r|f)+(s<<f>>>15)|0;f=g>>>(f+7|0)&1|f<<1}else f=0;b=1087112+(f<<2)|0;c[u+28>>2]=f;c[u+20>>2]=0;c[u+16>>2]=0;d=c[271703]|0;e=1<<f;a:do if(d&e){b=c[b>>2]|0;b:do if((c[b+4>>2]&-8|0)!=(g|0)){f=g<<((f|0)==31?0:25-(f>>>1)|0);while(1){d=b+16+(f>>>31<<2)|0;e=c[d>>2]|0;if(!e)break;if((c[e+4>>2]&-8|0)==(g|0)){t=e;break b}else{f=f<<1;b=e}}if(d>>>0<(c[271706]|0)>>>0)Aa();else{c[d>>2]=u;c[u+24>>2]=b;c[u+12>>2]=u;c[u+8>>2]=u;break a}}else t=b;while(0);b=t+8|0;d=c[b>>2]|0;s=c[271706]|0;if(d>>>0>=s>>>0&t>>>0>=s>>>0){c[d+12>>2]=u;c[b>>2]=u;c[u+8>>2]=d;c[u+12>>2]=t;c[u+24>>2]=0;break}else Aa()}else{c[271703]=d|e;c[b>>2]=u;c[u+24>>2]=b;c[u+12>>2]=u;c[u+8>>2]=u}while(0);u=(c[271710]|0)+-1|0;c[271710]=u;if(!u)b=1087264;else return;while(1){b=c[b>>2]|0;if(!b)break;else b=b+8|0}c[271710]=-1;return}function We(a,b){a=a|0;b=b|0;var d=0;if(a){d=_(b,a)|0;if((b|a)>>>0>65535)d=((d>>>0)/(a>>>0)|0|0)==(b|0)?d:-1}else d=0;b=Ue(d)|0;if(!b)return b|0;if(!(c[b+-4>>2]&3))return b|0;af(b|0,0,d|0)|0;return b|0}function Xe(a,b){a=a|0;b=b|0;var d=0,e=0;if(!a){a=Ue(b)|0;return a|0}if(b>>>0>4294967231){c[(Yd()|0)>>2]=12;a=0;return a|0}d=Ye(a+-8|0,b>>>0<11?16:b+11&-8)|0;if(d){a=d+8|0;return a|0}d=Ue(b)|0;if(!d){a=0;return a|0}e=c[a+-4>>2]|0;e=(e&-8)-((e&3|0)==0?8:4)|0;ef(d|0,a|0,(e>>>0<b>>>0?e:b)|0)|0;Ve(a);a=d;return a|0}function Ye(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;o=a+4|0;p=c[o>>2]|0;j=p&-8;l=a+j|0;i=c[271706]|0;d=p&3;if(!((d|0)!=1&a>>>0>=i>>>0&a>>>0<l>>>0))Aa();e=a+(j|4)|0;f=c[e>>2]|0;if(!(f&1))Aa();if(!d){if(b>>>0<256){a=0;return a|0}if(j>>>0>=(b+4|0)>>>0?(j-b|0)>>>0<=c[271822]<<1>>>0:0)return a|0;a=0;return a|0}if(j>>>0>=b>>>0){d=j-b|0;if(d>>>0<=15)return a|0;c[o>>2]=p&1|b|2;c[a+(b+4)>>2]=d|3;c[e>>2]=c[e>>2]|1;Ze(a+b|0,d);return a|0}if((l|0)==(c[271708]|0)){d=(c[271705]|0)+j|0;if(d>>>0<=b>>>0){a=0;return a|0}n=d-b|0;c[o>>2]=p&1|b|2;c[a+(b+4)>>2]=n|1;c[271708]=a+b;c[271705]=n;return a|0}if((l|0)==(c[271707]|0)){e=(c[271704]|0)+j|0;if(e>>>0<b>>>0){a=0;return a|0}d=e-b|0;if(d>>>0>15){c[o>>2]=p&1|b|2;c[a+(b+4)>>2]=d|1;c[a+e>>2]=d;e=a+(e+4)|0;c[e>>2]=c[e>>2]&-2;e=a+b|0}else{c[o>>2]=p&1|e|2;e=a+(e+4)|0;c[e>>2]=c[e>>2]|1;e=0;d=0}c[271704]=d;c[271707]=e;return a|0}if(f&2){a=0;return a|0}m=(f&-8)+j|0;if(m>>>0<b>>>0){a=0;return a|0}n=m-b|0;g=f>>>3;do if(f>>>0>=256){h=c[a+(j+24)>>2]|0;g=c[a+(j+12)>>2]|0;do if((g|0)==(l|0)){e=a+(j+20)|0;d=c[e>>2]|0;if(!d){e=a+(j+16)|0;d=c[e>>2]|0;if(!d){k=0;break}}while(1){f=d+20|0;g=c[f>>2]|0;if(g){d=g;e=f;continue}f=d+16|0;g=c[f>>2]|0;if(!g)break;else{d=g;e=f}}if(e>>>0<i>>>0)Aa();else{c[e>>2]=0;k=d;break}}else{f=c[a+(j+8)>>2]|0;if(f>>>0<i>>>0)Aa();d=f+12|0;if((c[d>>2]|0)!=(l|0))Aa();e=g+8|0;if((c[e>>2]|0)==(l|0)){c[d>>2]=g;c[e>>2]=f;k=g;break}else Aa()}while(0);if(h){d=c[a+(j+28)>>2]|0;e=1087112+(d<<2)|0;if((l|0)==(c[e>>2]|0)){c[e>>2]=k;if(!k){c[271703]=c[271703]&~(1<<d);break}}else{if(h>>>0<(c[271706]|0)>>>0)Aa();d=h+16|0;if((c[d>>2]|0)==(l|0))c[d>>2]=k;else c[h+20>>2]=k;if(!k)break}e=c[271706]|0;if(k>>>0<e>>>0)Aa();c[k+24>>2]=h;d=c[a+(j+16)>>2]|0;do if(d)if(d>>>0<e>>>0)Aa();else{c[k+16>>2]=d;c[d+24>>2]=k;break}while(0);d=c[a+(j+20)>>2]|0;if(d)if(d>>>0<(c[271706]|0)>>>0)Aa();else{c[k+20>>2]=d;c[d+24>>2]=k;break}}}else{f=c[a+(j+8)>>2]|0;e=c[a+(j+12)>>2]|0;d=1086848+(g<<1<<2)|0;if((f|0)!=(d|0)){if(f>>>0<i>>>0)Aa();if((c[f+12>>2]|0)!=(l|0))Aa()}if((e|0)==(f|0)){c[271702]=c[271702]&~(1<<g);break}if((e|0)!=(d|0)){if(e>>>0<i>>>0)Aa();d=e+8|0;if((c[d>>2]|0)==(l|0))h=d;else Aa()}else h=e+8|0;c[f+12>>2]=e;c[h>>2]=f}while(0);if(n>>>0<16){c[o>>2]=m|p&1|2;b=a+(m|4)|0;c[b>>2]=c[b>>2]|1;return a|0}else{c[o>>2]=p&1|b|2;c[a+(b+4)>>2]=n|3;p=a+(m|4)|0;c[p>>2]=c[p>>2]|1;Ze(a+b|0,n);return a|0}return 0}function Ze(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;q=a+b|0;d=c[a+4>>2]|0;do if(!(d&1)){k=c[a>>2]|0;if(!(d&3))return;n=a+(0-k)|0;m=k+b|0;j=c[271706]|0;if(n>>>0<j>>>0)Aa();if((n|0)==(c[271707]|0)){e=a+(b+4)|0;d=c[e>>2]|0;if((d&3|0)!=3){t=n;h=m;break}c[271704]=m;c[e>>2]=d&-2;c[a+(4-k)>>2]=m|1;c[q>>2]=m;return}g=k>>>3;if(k>>>0<256){f=c[a+(8-k)>>2]|0;e=c[a+(12-k)>>2]|0;d=1086848+(g<<1<<2)|0;if((f|0)!=(d|0)){if(f>>>0<j>>>0)Aa();if((c[f+12>>2]|0)!=(n|0))Aa()}if((e|0)==(f|0)){c[271702]=c[271702]&~(1<<g);t=n;h=m;break}if((e|0)!=(d|0)){if(e>>>0<j>>>0)Aa();d=e+8|0;if((c[d>>2]|0)==(n|0))i=d;else Aa()}else i=e+8|0;c[f+12>>2]=e;c[i>>2]=f;t=n;h=m;break}i=c[a+(24-k)>>2]|0;f=c[a+(12-k)>>2]|0;do if((f|0)==(n|0)){f=16-k|0;e=a+(f+4)|0;d=c[e>>2]|0;if(!d){e=a+f|0;d=c[e>>2]|0;if(!d){l=0;break}}while(1){f=d+20|0;g=c[f>>2]|0;if(g){d=g;e=f;continue}f=d+16|0;g=c[f>>2]|0;if(!g)break;else{d=g;e=f}}if(e>>>0<j>>>0)Aa();else{c[e>>2]=0;l=d;break}}else{g=c[a+(8-k)>>2]|0;if(g>>>0<j>>>0)Aa();d=g+12|0;if((c[d>>2]|0)!=(n|0))Aa();e=f+8|0;if((c[e>>2]|0)==(n|0)){c[d>>2]=f;c[e>>2]=g;l=f;break}else Aa()}while(0);if(i){d=c[a+(28-k)>>2]|0;e=1087112+(d<<2)|0;if((n|0)==(c[e>>2]|0)){c[e>>2]=l;if(!l){c[271703]=c[271703]&~(1<<d);t=n;h=m;break}}else{if(i>>>0<(c[271706]|0)>>>0)Aa();d=i+16|0;if((c[d>>2]|0)==(n|0))c[d>>2]=l;else c[i+20>>2]=l;if(!l){t=n;h=m;break}}f=c[271706]|0;if(l>>>0<f>>>0)Aa();c[l+24>>2]=i;d=16-k|0;e=c[a+d>>2]|0;do if(e)if(e>>>0<f>>>0)Aa();else{c[l+16>>2]=e;c[e+24>>2]=l;break}while(0);d=c[a+(d+4)>>2]|0;if(d)if(d>>>0<(c[271706]|0)>>>0)Aa();else{c[l+20>>2]=d;c[d+24>>2]=l;t=n;h=m;break}else{t=n;h=m}}else{t=n;h=m}}else{t=a;h=b}while(0);j=c[271706]|0;if(q>>>0<j>>>0)Aa();d=a+(b+4)|0;e=c[d>>2]|0;if(!(e&2)){if((q|0)==(c[271708]|0)){s=(c[271705]|0)+h|0;c[271705]=s;c[271708]=t;c[t+4>>2]=s|1;if((t|0)!=(c[271707]|0))return;c[271707]=0;c[271704]=0;return}if((q|0)==(c[271707]|0)){s=(c[271704]|0)+h|0;c[271704]=s;c[271707]=t;c[t+4>>2]=s|1;c[t+s>>2]=s;return}h=(e&-8)+h|0;g=e>>>3;do if(e>>>0>=256){i=c[a+(b+24)>>2]|0;f=c[a+(b+12)>>2]|0;do if((f|0)==(q|0)){e=a+(b+20)|0;d=c[e>>2]|0;if(!d){e=a+(b+16)|0;d=c[e>>2]|0;if(!d){p=0;break}}while(1){f=d+20|0;g=c[f>>2]|0;if(g){d=g;e=f;continue}f=d+16|0;g=c[f>>2]|0;if(!g)break;else{d=g;e=f}}if(e>>>0<j>>>0)Aa();else{c[e>>2]=0;p=d;break}}else{g=c[a+(b+8)>>2]|0;if(g>>>0<j>>>0)Aa();d=g+12|0;if((c[d>>2]|0)!=(q|0))Aa();e=f+8|0;if((c[e>>2]|0)==(q|0)){c[d>>2]=f;c[e>>2]=g;p=f;break}else Aa()}while(0);if(i){d=c[a+(b+28)>>2]|0;e=1087112+(d<<2)|0;if((q|0)==(c[e>>2]|0)){c[e>>2]=p;if(!p){c[271703]=c[271703]&~(1<<d);break}}else{if(i>>>0<(c[271706]|0)>>>0)Aa();d=i+16|0;if((c[d>>2]|0)==(q|0))c[d>>2]=p;else c[i+20>>2]=p;if(!p)break}e=c[271706]|0;if(p>>>0<e>>>0)Aa();c[p+24>>2]=i;d=c[a+(b+16)>>2]|0;do if(d)if(d>>>0<e>>>0)Aa();else{c[p+16>>2]=d;c[d+24>>2]=p;break}while(0);d=c[a+(b+20)>>2]|0;if(d)if(d>>>0<(c[271706]|0)>>>0)Aa();else{c[p+20>>2]=d;c[d+24>>2]=p;break}}}else{f=c[a+(b+8)>>2]|0;e=c[a+(b+12)>>2]|0;d=1086848+(g<<1<<2)|0;if((f|0)!=(d|0)){if(f>>>0<j>>>0)Aa();if((c[f+12>>2]|0)!=(q|0))Aa()}if((e|0)==(f|0)){c[271702]=c[271702]&~(1<<g);break}if((e|0)!=(d|0)){if(e>>>0<j>>>0)Aa();d=e+8|0;if((c[d>>2]|0)==(q|0))o=d;else Aa()}else o=e+8|0;c[f+12>>2]=e;c[o>>2]=f}while(0);c[t+4>>2]=h|1;c[t+h>>2]=h;if((t|0)==(c[271707]|0)){c[271704]=h;return}}else{c[d>>2]=e&-2;c[t+4>>2]=h|1;c[t+h>>2]=h}d=h>>>3;if(h>>>0<256){e=d<<1;g=1086848+(e<<2)|0;f=c[271702]|0;d=1<<d;if(f&d){d=1086848+(e+2<<2)|0;e=c[d>>2]|0;if(e>>>0<(c[271706]|0)>>>0)Aa();else{r=d;s=e}}else{c[271702]=f|d;r=1086848+(e+2<<2)|0;s=g}c[r>>2]=t;c[s+12>>2]=t;c[t+8>>2]=s;c[t+12>>2]=g;return}d=h>>>8;if(d)if(h>>>0>16777215)g=31;else{r=(d+1048320|0)>>>16&8;s=d<<r;q=(s+520192|0)>>>16&4;s=s<<q;g=(s+245760|0)>>>16&2;g=14-(q|r|g)+(s<<g>>>15)|0;g=h>>>(g+7|0)&1|g<<1}else g=0;d=1087112+(g<<2)|0;c[t+28>>2]=g;c[t+20>>2]=0;c[t+16>>2]=0;e=c[271703]|0;f=1<<g;if(!(e&f)){c[271703]=e|f;c[d>>2]=t;c[t+24>>2]=d;c[t+12>>2]=t;c[t+8>>2]=t;return}d=c[d>>2]|0;a:do if((c[d+4>>2]&-8|0)!=(h|0)){g=h<<((g|0)==31?0:25-(g>>>1)|0);while(1){e=d+16+(g>>>31<<2)|0;f=c[e>>2]|0;if(!f)break;if((c[f+4>>2]&-8|0)==(h|0)){d=f;break a}else{g=g<<1;d=f}}if(e>>>0<(c[271706]|0)>>>0)Aa();c[e>>2]=t;c[t+24>>2]=d;c[t+12>>2]=t;c[t+8>>2]=t;return}while(0);e=d+8|0;f=c[e>>2]|0;s=c[271706]|0;if(!(f>>>0>=s>>>0&d>>>0>=s>>>0))Aa();c[f+12>>2]=t;c[e>>2]=t;c[t+8>>2]=f;c[t+12>>2]=d;c[t+24>>2]=0;return}function _e(){}function $e(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;d=b-d-(c>>>0>a>>>0|0)>>>0;return (C=d,a-c>>>0|0)|0}function af(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;h=b&3;i=d|d<<8|d<<16|d<<24;g=f&~3;if(h){h=b+4-h|0;while((b|0)<(h|0)){a[b>>0]=d;b=b+1|0}}while((b|0)<(g|0)){c[b>>2]=i;b=b+4|0}}while((b|0)<(f|0)){a[b>>0]=d;b=b+1|0}return b-e|0}function bf(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){C=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}C=a<<c-32;return 0}function cf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;c=a+c>>>0;return (C=b+d+(c>>>0<a>>>0|0)>>>0,c|0)|0}function df(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){C=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}C=0;return b>>>c-32|0}function ef(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)>=4096)return sa(b|0,d|0,e|0)|0;f=b|0;if((b&3)==(d&3)){while(b&3){if(!e)return f|0;a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function ff(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){C=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}C=(b|0)<0?-1:0;return b>>c-32|0}function gf(b){b=b|0;var c=0;c=a[m+(b&255)>>0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)>>0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)>>0]|0;if((c|0)<8)return c+16|0;return (a[m+(b>>>24)>>0]|0)+24|0}function hf(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;f=a&65535;e=b&65535;c=_(e,f)|0;d=a>>>16;a=(c>>>16)+(_(e,d)|0)|0;e=b>>>16;b=_(e,f)|0;return (C=(a>>>16)+(_(e,d)|0)+(((a&65535)+b|0)>>>16)|0,a+b<<16|c&65535|0)|0}function jf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;j=b>>31|((b|0)<0?-1:0)<<1;i=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;f=d>>31|((d|0)<0?-1:0)<<1;e=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;h=$e(j^a,i^b,j,i)|0;g=C;a=f^j;b=e^i;return $e((of(h,g,$e(f^c,e^d,f,e)|0,C,0)|0)^a,C^b,a,b)|0}function kf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;i=i+16|0;j=f|0;h=b>>31|((b|0)<0?-1:0)<<1;g=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;l=e>>31|((e|0)<0?-1:0)<<1;k=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;a=$e(h^a,g^b,h,g)|0;b=C;of(a,b,$e(l^d,k^e,l,k)|0,C,j)|0;e=$e(c[j>>2]^h,c[j+4>>2]^g,h,g)|0;d=C;i=f;return (C=d,e)|0}function lf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;f=c;c=hf(e,f)|0;a=C;return (C=(_(b,f)|0)+(_(d,e)|0)+a|a&0,c|0|0)|0}function mf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return of(a,b,c,d,0)|0}function nf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;g=i;i=i+16|0;f=g|0;of(a,b,d,e,f)|0;i=g;return (C=c[f+4>>2]|0,c[f>>2]|0)|0}function of(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;l=a;j=b;k=j;h=d;n=e;i=n;if(!k){g=(f|0)!=0;if(!i){if(g){c[f>>2]=(l>>>0)%(h>>>0);c[f+4>>2]=0}n=0;f=(l>>>0)/(h>>>0)>>>0;return (C=n,f)|0}else{if(!g){n=0;f=0;return (C=n,f)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;n=0;f=0;return (C=n,f)|0}}g=(i|0)==0;do if(h){if(!g){g=(aa(i|0)|0)-(aa(k|0)|0)|0;if(g>>>0<=31){m=g+1|0;i=31-g|0;b=g-31>>31;h=m;a=l>>>(m>>>0)&b|k<<i;b=k>>>(m>>>0)&b;g=0;i=l<<i;break}if(!f){n=0;f=0;return (C=n,f)|0}c[f>>2]=a|0;c[f+4>>2]=j|b&0;n=0;f=0;return (C=n,f)|0}g=h-1|0;if(g&h){i=(aa(h|0)|0)+33-(aa(k|0)|0)|0;p=64-i|0;m=32-i|0;j=m>>31;o=i-32|0;b=o>>31;h=i;a=m-1>>31&k>>>(o>>>0)|(k<<m|l>>>(i>>>0))&b;b=b&k>>>(i>>>0);g=l<<p&j;i=(k<<p|l>>>(o>>>0))&j|l<<m&i-33>>31;break}if(f){c[f>>2]=g&l;c[f+4>>2]=0}if((h|0)==1){o=j|b&0;p=a|0|0;return (C=o,p)|0}else{p=gf(h|0)|0;o=k>>>(p>>>0)|0;p=k<<32-p|l>>>(p>>>0)|0;return (C=o,p)|0}}else{if(g){if(f){c[f>>2]=(k>>>0)%(h>>>0);c[f+4>>2]=0}o=0;p=(k>>>0)/(h>>>0)>>>0;return (C=o,p)|0}if(!l){if(f){c[f>>2]=0;c[f+4>>2]=(k>>>0)%(i>>>0)}o=0;p=(k>>>0)/(i>>>0)>>>0;return (C=o,p)|0}g=i-1|0;if(!(g&i)){if(f){c[f>>2]=a|0;c[f+4>>2]=g&k|b&0}o=0;p=k>>>((gf(i|0)|0)>>>0);return (C=o,p)|0}g=(aa(i|0)|0)-(aa(k|0)|0)|0;if(g>>>0<=30){b=g+1|0;i=31-g|0;h=b;a=k<<i|l>>>(b>>>0);b=k>>>(b>>>0);g=0;i=l<<i;break}if(!f){o=0;p=0;return (C=o,p)|0}c[f>>2]=a|0;c[f+4>>2]=j|b&0;o=0;p=0;return (C=o,p)|0}while(0);if(!h){k=i;j=0;i=0}else{m=d|0|0;l=n|e&0;k=cf(m|0,l|0,-1,-1)|0;d=C;j=i;i=0;do{e=j;j=g>>>31|j<<1;g=i|g<<1;e=a<<1|e>>>31|0;n=a>>>31|b<<1|0;$e(k,d,e,n)|0;p=C;o=p>>31|((p|0)<0?-1:0)<<1;i=o&1;a=$e(e,n,o&m,(((p|0)<0?-1:0)>>31|((p|0)<0?-1:0)<<1)&l)|0;b=C;h=h-1|0}while((h|0)!=0);k=j;j=0}h=0;if(f){c[f>>2]=a;c[f+4>>2]=b}o=(g|0)>>>31|(k|h)<<1|(h<<1|g>>>31)&0|j;p=(g<<1|0>>>31)&-2|i;return (C=o,p)|0}function pf(a,b){a=a|0;b=b|0;return Ha[a&15](b|0)|0}function qf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return Ia[a&7](b|0,c|0,d|0)|0}function rf(a,b,c){a=a|0;b=b|0;c=c|0;return Ja[a&7](b|0,c|0)|0}function sf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Ka[a&7](b|0,c|0,d|0)}function tf(a,b){a=a|0;b=b|0;La[a&3](b|0)}function uf(a){a=a|0;ba(0);return 0}function vf(a,b,c){a=a|0;b=b|0;c=c|0;ba(1);return 0}function wf(a,b){a=a|0;b=b|0;ba(2);return 0}function xf(a,b,c){a=a|0;b=b|0;c=c|0;ba(3)}function yf(a){a=a|0;ba(4)}

	// EMSCRIPTEN_END_FUNCS
	var Ha=[uf,Td,Ud,Vd,Wd,Pd,Qd,Rd,Sd,ke,Md,Od,uf,uf,uf,uf];var Ia=[vf,Qe,oe,me,eb,le,ne,vf];var Ja=[wf,kc,mc,oc,Id,wf,wf,wf];var Ka=[xf,lc,nc,pc,Jd,xf,xf,xf];var La=[yf,Me,Ne,yf];return{_KSSPLAY_set_device_quality:Ya,_KSSPLAY_fade_start:$a,_KSSPLAY_get_stop_flag:cb,_bitshift64Lshr:df,_bitshift64Shl:bf,_KSS_bin2kss:wb,_KSSPLAY_new:Xa,_KSSPLAY_delete:Za,_fflush:se,_KSS_new:rb,_KSS_get_title:sb,_memset:af,_memcpy:ef,_i64Subtract:$e,_i64Add:cf,_KSSPLAY_calc:ab,_KSSPLAY_set_data:Va,___errno_location:Yd,_free:Ve,_KSSPLAY_get_fade_flag:_a,_KSSPLAY_set_silent_limit:db,_malloc:Ue,_KSSPLAY_get_loop_count:bb,_KSS_delete:tb,_KSSPLAY_reset:Wa,runPostSets:_e,stackAlloc:Ma,stackSave:Na,stackRestore:Oa,establishStackSpace:Pa,setThrew:Qa,setTempRet0:Ta,getTempRet0:Ua,dynCall_ii:pf,dynCall_iiii:qf,dynCall_iii:rf,dynCall_viii:sf,dynCall_vi:tf}})


	// EMSCRIPTEN_END_ASM
	(Module.asmGlobalArg,Module.asmLibraryArg,buffer);var _KSSPLAY_set_device_quality=Module["_KSSPLAY_set_device_quality"]=asm["_KSSPLAY_set_device_quality"];var _KSSPLAY_fade_start=Module["_KSSPLAY_fade_start"]=asm["_KSSPLAY_fade_start"];var _KSSPLAY_get_stop_flag=Module["_KSSPLAY_get_stop_flag"]=asm["_KSSPLAY_get_stop_flag"];var _bitshift64Lshr=Module["_bitshift64Lshr"]=asm["_bitshift64Lshr"];var _bitshift64Shl=Module["_bitshift64Shl"]=asm["_bitshift64Shl"];var _KSSPLAY_new=Module["_KSSPLAY_new"]=asm["_KSSPLAY_new"];var _KSSPLAY_delete=Module["_KSSPLAY_delete"]=asm["_KSSPLAY_delete"];var _fflush=Module["_fflush"]=asm["_fflush"];var _KSS_new=Module["_KSS_new"]=asm["_KSS_new"];var _KSS_get_title=Module["_KSS_get_title"]=asm["_KSS_get_title"];var _memset=Module["_memset"]=asm["_memset"];var _memcpy=Module["_memcpy"]=asm["_memcpy"];var _i64Subtract=Module["_i64Subtract"]=asm["_i64Subtract"];var _i64Add=Module["_i64Add"]=asm["_i64Add"];var _KSS_bin2kss=Module["_KSS_bin2kss"]=asm["_KSS_bin2kss"];var _KSSPLAY_set_data=Module["_KSSPLAY_set_data"]=asm["_KSSPLAY_set_data"];var _KSSPLAY_calc=Module["_KSSPLAY_calc"]=asm["_KSSPLAY_calc"];var ___errno_location=Module["___errno_location"]=asm["___errno_location"];var _free=Module["_free"]=asm["_free"];var runPostSets=Module["runPostSets"]=asm["runPostSets"];var _KSSPLAY_get_fade_flag=Module["_KSSPLAY_get_fade_flag"]=asm["_KSSPLAY_get_fade_flag"];var _KSSPLAY_set_silent_limit=Module["_KSSPLAY_set_silent_limit"]=asm["_KSSPLAY_set_silent_limit"];var _malloc=Module["_malloc"]=asm["_malloc"];var _KSSPLAY_get_loop_count=Module["_KSSPLAY_get_loop_count"]=asm["_KSSPLAY_get_loop_count"];var _KSS_delete=Module["_KSS_delete"]=asm["_KSS_delete"];var _KSSPLAY_reset=Module["_KSSPLAY_reset"]=asm["_KSSPLAY_reset"];var dynCall_ii=Module["dynCall_ii"]=asm["dynCall_ii"];var dynCall_iiii=Module["dynCall_iiii"]=asm["dynCall_iiii"];var dynCall_iii=Module["dynCall_iii"]=asm["dynCall_iii"];var dynCall_viii=Module["dynCall_viii"]=asm["dynCall_viii"];var dynCall_vi=Module["dynCall_vi"]=asm["dynCall_vi"];Runtime.stackAlloc=asm["stackAlloc"];Runtime.stackSave=asm["stackSave"];Runtime.stackRestore=asm["stackRestore"];Runtime.establishStackSpace=asm["establishStackSpace"];Runtime.setTempRet0=asm["setTempRet0"];Runtime.getTempRet0=asm["getTempRet0"];function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}ExitStatus.prototype=new Error;ExitStatus.prototype.constructor=ExitStatus;var initialStackTop;var preloadStartTime=null;var calledMain=false;dependenciesFulfilled=function runCaller(){if(!Module["calledRun"])run();if(!Module["calledRun"])dependenciesFulfilled=runCaller};Module["callMain"]=Module.callMain=function callMain(args){assert(runDependencies==0,"cannot call main when async dependencies remain! (listen on __ATMAIN__)");assert(__ATPRERUN__.length==0,"cannot call main when preRun functions remain to be called");args=args||[];ensureInitRuntime();var argc=args.length+1;function pad(){for(var i=0;i<4-1;i++){argv.push(0)}}var argv=[allocate(intArrayFromString(Module["thisProgram"]),"i8",ALLOC_NORMAL)];pad();for(var i=0;i<argc-1;i=i+1){argv.push(allocate(intArrayFromString(args[i]),"i8",ALLOC_NORMAL));pad()}argv.push(0);argv=allocate(argv,"i32",ALLOC_NORMAL);try{var ret=Module["_main"](argc,argv,0);exit(ret,true)}catch(e){if(e instanceof ExitStatus){return}else if(e=="SimulateInfiniteLoop"){Module["noExitRuntime"]=true;return}else{if(e&&typeof e==="object"&&e.stack)Module.printErr("exception thrown: "+[e,e.stack]);throw e}}finally{calledMain=true}};function run(args){args=args||Module["arguments"];if(preloadStartTime===null)preloadStartTime=Date.now();if(runDependencies>0){return}preRun();if(runDependencies>0)return;if(Module["calledRun"])return;function doRun(){if(Module["calledRun"])return;Module["calledRun"]=true;if(ABORT)return;ensureInitRuntime();preMain();if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();if(Module["_main"]&&shouldRunNow)Module["callMain"](args);postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout((function(){setTimeout((function(){Module["setStatus"]("")}),1);doRun()}),1)}else{doRun()}}Module["run"]=Module.run=run;function exit(status,implicit){if(implicit&&Module["noExitRuntime"]){return}if(Module["noExitRuntime"]){}else{ABORT=true;EXITSTATUS=status;STACKTOP=initialStackTop;exitRuntime();if(Module["onExit"])Module["onExit"](status)}if(ENVIRONMENT_IS_NODE){process["stdout"]["once"]("drain",(function(){process["exit"](status)}));console.log(" ");setTimeout((function(){process["exit"](status)}),500)}else if(ENVIRONMENT_IS_SHELL&&typeof quit==="function"){quit(status)}throw new ExitStatus(status)}Module["exit"]=Module.exit=exit;var abortDecorators=[];function abort(what){if(what!==undefined){Module.print(what);Module.printErr(what);what=JSON.stringify(what)}else{what=""}ABORT=true;EXITSTATUS=1;var extra="\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.";var output="abort("+what+") at "+stackTrace()+extra;if(abortDecorators){abortDecorators.forEach((function(decorator){output=decorator(output,what)}))}throw output}Module["abort"]=Module.abort=abort;if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}var shouldRunNow=true;if(Module["noInitialRun"]){shouldRunNow=false}run()






	/*** EXPORTS FROM exports-loader ***/
	module.exports = Module;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Encoding.js
	 *
	 * @description    Converts character encoding.
	 * @fileoverview   Encoding library
	 * @author         polygon planet
	 * @version        1.0.24
	 * @date           2015-09-22
	 * @link           https://github.com/polygonplanet/encoding.js
	 * @copyright      Copyright (c) 2013-2015 polygon planet <polygon.planet.aqua@gmail.com>
	 * @license        licensed under the MIT license.
	 *
	 * Based:
	 *   - mbstring library
	 *   - posql charset library
	 *   - libxml2
	 *   - pot.js
	 */

	/*jshint bitwise:false,eqnull:true,newcap:false */

	(function (name, context, factory) {

	// Supports UMD. AMD, CommonJS/Node.js and browser context
	if (true) {
	  if (typeof module !== 'undefined' && module.exports) {
	    module.exports = factory();
	  } else {
	    exports[name] = factory();
	  }
	} else if (typeof define === 'function' && define.amd) {
	  define(factory);
	} else {
	  context[name] = factory();
	}

	})('Encoding', this, function () {
	'use strict';

	var UTF8_UNKNOWN = '?'.charCodeAt(0);

	var fromCharCode = String.fromCharCode;
	var slice = Array.prototype.slice;
	var toString = Object.prototype.toString;
	var hasOwnProperty = Object.prototype.hasOwnProperty;

	var HAS_TYPED = typeof Uint8Array !== 'undefined' &&
	                typeof Uint16Array !== 'undefined';

	// Test for String.fromCharCode.apply.
	var CAN_CHARCODE_APPLY = false;
	var CAN_CHARCODE_APPLY_TYPED = false;

	try {
	  if (fromCharCode.apply(null, [0x61]) === 'a') {
	    CAN_CHARCODE_APPLY = true;
	  }
	} catch (e) {}

	if (HAS_TYPED) {
	  try {
	    if (fromCharCode.apply(null, new Uint8Array([0x61])) === 'a') {
	      CAN_CHARCODE_APPLY_TYPED = true;
	    }
	  } catch (e) {}
	}

	// Function.prototype.apply stack max range
	var APPLY_BUFFER_SIZE = 65533;
	var APPLY_BUFFER_SIZE_OK = null;


	/**
	 * Encoding names.
	 *
	 * @ignore
	 */
	var EncodingNames = {
	  UTF32: {
	    order: 0
	  },
	  UTF32BE: {
	    alias: ['UCS4']
	  },
	  UTF32LE: null,
	  UTF16: {
	    order: 1
	  },
	  UTF16BE: {
	    alias: ['UCS2']
	  },
	  UTF16LE: null,
	  BINARY: {
	    order: 2
	  },
	  ASCII: {
	    order: 3,
	    alias: ['ISO646', 'CP367']
	  },
	  JIS: {
	    order: 4,
	    alias: ['ISO2022JP']
	  },
	  UTF8: {
	    order: 5
	  },
	  EUCJP: {
	    order: 6
	  },
	  SJIS: {
	    order: 7,
	    alias: ['CP932', 'MSKANJI', 'WINDOWS31J']
	  },
	  UNICODE: {
	    order: 8
	  }
	};

	/**
	 * Encoding alias names.
	 *
	 * @ignore
	 */
	var EncodingAliases = {};

	/**
	 * Encoding orders.
	 *
	 * @ignore
	 */
	var EncodingOrders = (function() {
	  var aliases = EncodingAliases;

	  var names = getKeys(EncodingNames);
	  var orders = [];
	  var name, encoding, j, l;

	  for (var i = 0, len = names.length; i < len; i++) {
	    name = names[i];
	    aliases[name] = name;

	    encoding = EncodingNames[name];
	    if (encoding != null) {
	      if (typeof encoding.order !== 'undefined') {
	        orders[orders.length] = name;
	      }

	      if (encoding.alias) {
	        // Create the encoding aliases.
	        for (j = 0, l = encoding.alias.length; j < l; j++) {
	          aliases[encoding.alias[j]] = name;
	        }
	      }
	    }
	  }

	  orders.sort(function(a, b) {
	    return EncodingNames[a].order - EncodingNames[b].order;
	  });

	  return orders;
	}());


	/**
	 * Encoding.
	 *
	 * @name Encoding
	 * @type {Object}
	 * @public
	 * @class
	 */
	var Encoding = {
	  /**
	   * @lends Encoding
	   */
	  /**
	   * Encoding orders.
	   *
	   * @ignore
	   */
	  orders: EncodingOrders,
	  /**
	   * Detects character encoding.
	   *
	   * If encodings is "AUTO", or the encoding-list as an array, or
	   *   comma separated list string it will be detected automatically.
	   *
	   * @param {Array.<number>|TypedArray|string} data The data being detected.
	   * @param {(Object|string|Array.<string>)=} [encodings] The encoding-list of
	   *   character encoding.
	   * @return {string|boolean} The detected character encoding, or false.
	   *
	   * @public
	   * @function
	   */
	  detect: function(data, encodings) {
	    if (data == null || data.length === 0) {
	      return false;
	    }

	    if (isObject(encodings)) {
	      encodings = encodings.encoding;
	    }

	    if (isString(data)) {
	      data = stringToBuffer(data);
	    }

	    if (encodings == null) {
	      encodings = Encoding.orders;
	    } else {
	      if (isString(encodings)) {
	        encodings = encodings.toUpperCase();
	        if (encodings === 'AUTO') {
	          encodings = Encoding.orders;
	        } else if (~encodings.indexOf(',')) {
	          encodings = encodings.split(/\s*,\s*/);
	        } else {
	          encodings = [encodings];
	        }
	      }
	    }

	    var len = encodings.length;
	    var e, encoding, method;
	    for (var i = 0; i < len; i++) {
	      e = encodings[i];
	      encoding = assignEncodingName(e);
	      if (!encoding) {
	        continue;
	      }

	      method = 'is' + encoding;
	      if (!hasOwnProperty.call(EncodingDetect, method)) {
	        throw new Error('Undefined encoding: ' + e);
	      }

	      if (EncodingDetect[method](data)) {
	        return encoding;
	      }
	    }

	    return false;
	  },
	  /**
	   * Convert character encoding.
	   *
	   * If `from` is "AUTO", or the encoding-list as an array, or
	   *   comma separated list string it will be detected automatically.
	   *
	   * @param {Array.<number>|TypedArray|string} data The data being converted.
	   * @param {(string|Object)} to The name of encoding to.
	   * @param {(string|Array.<string>)=} [from] The encoding-list of
	   *   character encoding.
	   * @return {Array|TypedArray|string} The converted data.
	   *
	   * @public
	   * @function
	   */
	  convert: function(data, to, from) {
	    var result;
	    var type;
	    var options = {};

	    if (isObject(to)) {
	      options = to;
	      from = options.from;
	      to = options.to;
	      if (options.type) {
	        type = options.type;
	      }
	    }

	    if (isString(data)) {
	      type = type || 'string';
	      data = stringToBuffer(data);
	    } else if (data == null || data.length === 0) {
	      data = [];
	    }

	    var encodingFrom;
	    if (from != null && isString(from) &&
	        from.toUpperCase() !== 'AUTO' && !~from.indexOf(',')) {
	      encodingFrom = assignEncodingName(from);
	    } else {
	      encodingFrom = Encoding.detect(data);
	    }

	    var encodingTo = assignEncodingName(to);
	    var method = encodingFrom + 'To' + encodingTo;

	    if (hasOwnProperty.call(EncodingConvert, method)) {
	      result = EncodingConvert[method](data, options);
	    } else {
	      // Returns the raw data if the method is undefined.
	      result = data;
	    }

	    switch (('' + type).toLowerCase()) {
	      case 'string':
	        return codeToString_fast(result);
	      case 'arraybuffer':
	        return codeToBuffer(result);
	      case 'array':
	        /* falls through */
	      default:
	        return bufferToCode(result);
	    }
	  },
	  /**
	   * Encode a character code array to URL string like encodeURIComponent.
	   *
	   * @param {Array.<number>|TypedArray} data The data being encoded.
	   * @return {string} The percent encoded string.
	   *
	   * @public
	   * @function
	   */
	  urlEncode: function(data) {
	    if (isString(data)) {
	      data = stringToBuffer(data);
	    }

	    var alpha = stringToCode('0123456789ABCDEF');
	    var results = [];
	    var i = 0;
	    var len = data && data.length;
	    var b;

	    for (; i < len; i++) {
	      b = data[i];

	      //FIXME: JavaScript UTF-16 encoding
	      if (b > 0xFF) {
	        return encodeURIComponent(codeToString_fast(data));
	      }

	      if ((b >= 0x61 /*a*/ && b <= 0x7A /*z*/) ||
	          (b >= 0x41 /*A*/ && b <= 0x5A /*Z*/) ||
	          (b >= 0x30 /*0*/ && b <= 0x39 /*9*/) ||
	          b === 0x21 /*!*/ ||
	          (b >= 0x27 /*'*/ && b <= 0x2A /***/) ||
	          b === 0x2D /*-*/ || b === 0x2E /*.*/ ||
	          b === 0x5F /*_*/ || b === 0x7E /*~*/
	      ) {
	        results[results.length] = b;
	      } else {
	        results[results.length] = 0x25; /*%*/
	        if (b < 0x10) {
	          results[results.length] = 0x30; /*0*/
	          results[results.length] = alpha[b];
	        } else {
	          results[results.length] = alpha[b >> 4 & 0xF];
	          results[results.length] = alpha[b & 0xF];
	        }
	      }
	    }

	    return codeToString_fast(results);
	  },
	  /**
	   * Decode a percent encoded string to
	   *  character code array like decodeURIComponent.
	   *
	   * @param {string} string The data being decoded.
	   * @return {Array.<number>} The decoded array.
	   *
	   * @public
	   * @function
	   */
	  urlDecode: function(string) {
	    var results = [];
	    var i = 0;
	    var len = string && string.length;
	    var c;

	    while (i < len) {
	      c = string.charCodeAt(i++);
	      if (c === 0x25 /*%*/) {
	        results[results.length] = parseInt(
	          string.charAt(i++) + string.charAt(i++), 16);
	      } else {
	        results[results.length] = c;
	      }
	    }

	    return results;
	  },
	  /**
	   * Encode a character code array to Base64 encoded string.
	   *
	   * @param {Array.<number>|TypedArray} data The data being encoded.
	   * @return {string} The Base64 encoded string.
	   *
	   * @public
	   * @function
	   */
	  base64Encode: function(data) {
	    if (isString(data)) {
	      data = stringToBuffer(data);
	    }
	    return base64encode(data);
	  },
	  /**
	   * Decode a Base64 encoded string to character code array.
	   *
	   * @param {string} string The data being decoded.
	   * @return {Array.<number>} The decoded array.
	   *
	   * @public
	   * @function
	   */
	  base64Decode: function(string) {
	    return base64decode(string);
	  },
	  /**
	   * Joins a character code array to string.
	   *
	   * @param {Array.<number>|TypedArray} data The data being joined.
	   * @return {String} The joined string.
	   *
	   * @public
	   * @function
	   */
	  codeToString: codeToString_fast,
	  /**
	   * Splits string to an array of character codes.
	   *
	   * @param {string} string The input string.
	   * @return {Array.<number>} The character code array.
	   *
	   * @public
	   * @function
	   */
	  stringToCode: stringToCode,
	  /**
	   * 全角英数記号文字を半角英数記号文字に変換
	   *
	   * Convert the ascii symbols and alphanumeric characters to
	   *   the zenkaku symbols and alphanumeric characters.
	   *
	   * @example
	   *   console.log(Encoding.toHankakuCase('Ｈｅｌｌｏ Ｗｏｒｌｄ！ １２３４５'));
	   *   // 'Hello World! 12345'
	   *
	   * @param {Array.<number>|TypedArray|string} data The input unicode data.
	   * @return {Array.<number>|string} The conveted data.
	   *
	   * @public
	   * @function
	   */
	  toHankakuCase: function(data) {
	    var asString = false;
	    if (isString(data)) {
	      asString = true;
	      data = stringToBuffer(data);
	    }

	    var results = [];
	    var len = data && data.length;
	    var i = 0;
	    var c;

	    while (i < len) {
	      c = data[i++];
	      if (c >= 0xFF01 && c <= 0xFF5E) {
	        c -= 0xFEE0;
	      }
	      results[results.length] = c;
	    }

	    return asString ? codeToString_fast(results) : results;
	  },
	  /**
	   * 半角英数記号文字を全角英数記号文字に変換
	   *
	   * Convert to the zenkaku symbols and alphanumeric characters
	   *  from the ascii symbols and alphanumeric characters.
	   *
	   * @example
	   *   console.log(Encoding.toZenkakuCase('Hello World! 12345'));
	   *   // 'Ｈｅｌｌｏ Ｗｏｒｌｄ！ １２３４５'
	   *
	   * @param {Array.<number>|TypedArray|string} data The input unicode data.
	   * @return {Array.<number>|string} The conveted data.
	   *
	   * @public
	   * @function
	   */
	  toZenkakuCase: function(data) {
	    var asString = false;
	    if (isString(data)) {
	      asString = true;
	      data = stringToBuffer(data);
	    }

	    var results = [];
	    var len = data && data.length;
	    var i = 0;
	    var c;

	    while (i < len) {
	      c = data[i++];
	      if (c >= 0x21 && c <= 0x7E) {
	        c += 0xFEE0;
	      }
	      results[results.length] = c;
	    }

	    return asString ? codeToString_fast(results) : results;
	  },
	  /**
	   * 全角カタカナを全角ひらがなに変換
	   *
	   * Convert to the zenkaku hiragana from the zenkaku katakana.
	   *
	   * @example
	   *   console.log(Encoding.toHiraganaCase('ボポヴァアィイゥウェエォオ'));
	   *   // 'ぼぽう゛ぁあぃいぅうぇえぉお'
	   *
	   * @param {Array.<number>|TypedArray|string} data The input unicode data.
	   * @return {Array.<number>|string} The conveted data.
	   *
	   * @public
	   * @function
	   */
	  toHiraganaCase: function(data) {
	    var asString = false;
	    if (isString(data)) {
	      asString = true;
	      data = stringToBuffer(data);
	    }

	    var results = [];
	    var len = data && data.length;
	    var i = 0;
	    var c;

	    while (i < len) {
	      c = data[i++];
	      if (c >= 0x30A1 && c <= 0x30F6) {
	        c -= 0x0060;
	      // 「ワ゛」 => 「わ」 + 「゛」
	      } else if (c === 0x30F7) {
	        results[results.length] = 0x308F;
	        c = 0x309B;
	      // 「ヲ゛」 => 「を」 + 「゛」
	      } else if (c === 0x30FA) {
	        results[results.length] = 0x3092;
	        c = 0x309B;
	      }
	      results[results.length] = c;
	    }

	    return asString ? codeToString_fast(results) : results;
	  },
	  /**
	   * 全角ひらがなを全角カタカナに変換
	   *
	   * Convert to the zenkaku katakana from the zenkaku hiragana.
	   *
	   * @example
	   *   console.log(Encoding.toKatakanaCase('ぼぽう゛ぁあぃいぅうぇえぉお'));
	   *   // 'ボポヴァアィイゥウェエォオ'
	   *
	   * @param {Array.<number>|TypedArray|string} data The input unicode data.
	   * @return {Array.<number>|string} The conveted data.
	   *
	   * @public
	   * @function
	   */
	  toKatakanaCase: function(data) {
	    var asString = false;
	    if (isString(data)) {
	      asString = true;
	      data = stringToBuffer(data);
	    }

	    var results = [];
	    var len = data && data.length;
	    var i = 0;
	    var c;

	    while (i < len) {
	      c = data[i++];
	      if (c >= 0x3041 && c <= 0x3096) {
	        if ((c === 0x308F || // 「わ」 + 「゛」 => 「ワ゛」
	             c === 0x3092) && // 「を」 + 「゛」 => 「ヲ゛」
	            i < len && data[i] === 0x309B) {
	          c = c === 0x308F ? 0x30F7 : 0x30FA;
	          i++;
	        } else {
	          c += 0x0060;
	        }
	      }
	      results[results.length] = c;
	    }

	    return asString ? codeToString_fast(results) : results;
	  },
	  /**
	   * 全角カタカナを半角ｶﾀｶﾅに変換
	   *
	   * Convert to the hankaku katakana from the zenkaku katakana.
	   *
	   * @example
	   *   console.log(Encoding.toHankanaCase('ボポヴァアィイゥウェエォオ'));
	   *   // 'ﾎﾞﾎﾟｳﾞｧｱｨｲｩｳｪｴｫｵ'
	   *
	   * @param {Array.<number>|TypedArray|string} data The input unicode data.
	   * @return {Array.<number>|string} The conveted data.
	   *
	   * @public
	   * @function
	   */
	  toHankanaCase: function(data) {
	    var asString = false;
	    if (isString(data)) {
	      asString = true;
	      data = stringToBuffer(data);
	    }

	    var results = [];
	    var len = data && data.length;
	    var i = 0;
	    var c, d, t;

	    while (i < len) {
	      c = data[i++];

	      if (c >= 0x3001 && c <= 0x30FC) {
	        t = hankanaCase_table[c];
	        if (t !== void 0) {
	          results[results.length] = t;
	          continue;
	        }
	      }

	      // 「ヴ」, 「ワ」+「゛」, 「ヲ」+「゛」
	      if (c === 0x30F4 || c === 0x30F7 || c === 0x30FA) {
	        results[results.length] = hankanaCase_sonants[c];
	        results[results.length] = 0xFF9E;
	        // 「カ」 - 「ド」
	      } else if (c >= 0x30AB && c <= 0x30C9) {
	        results[results.length] = hankanaCase_table[c - 1];
	        results[results.length] = 0xFF9E;
	        // 「ハ」 - 「ポ」
	      } else if (c >= 0x30CF && c <= 0x30DD) {
	        d = c % 3;
	        results[results.length] = hankanaCase_table[c - d];
	        results[results.length] = hankanaCase_marks[d - 1];
	      } else {
	        results[results.length] = c;
	      }
	    }

	    return asString ? codeToString_fast(results) : results;
	  },
	  /**
	   * 半角ｶﾀｶﾅを全角カタカナに変換 (濁音含む)
	   *
	   * Convert to the zenkaku katakana from the hankaku katakana.
	   *
	   * @example
	   *   console.log(Encoding.toZenkanaCase('ﾎﾞﾎﾟｳﾞｧｱｨｲｩｳｪｴｫｵ'));
	   *   // 'ボポヴァアィイゥウェエォオ'
	   *
	   * @param {Array.<number>|TypedArray|string} data The input unicode data.
	   * @return {Array.<number>|string} The conveted data.
	   *
	   * @public
	   * @function
	   */
	  toZenkanaCase: function(data) {
	    var asString = false;
	    if (isString(data)) {
	      asString = true;
	      data = stringToBuffer(data);
	    }

	    var results = [];
	    var len = data && data.length;
	    var i = 0;
	    var c, code, next;

	    for (i = 0; i < len; i++) {
	      c = data[i];
	      // Hankaku katakana
	      if (c > 0xFF60 && c < 0xFFA0) {
	        code = zenkanaCase_table[c - 0xFF61];
	        if (i + 1 < len) {
	          next = data[i + 1];
	          // 「ﾞ」 + 「ヴ」
	          if (next === 0xFF9E && c === 0xFF73) {
	            code = 0x30F4;
	            i++;
	          // 「ﾞ」 + 「ワ゛」
	          } else if (next === 0xFF9E && c === 0xFF9C) {
	            code = 0x30F7;
	            i++;
	          // 「ﾞ」 + 「ｦ゛」
	          } else if (next === 0xFF9E && c === 0xFF66) {
	            code = 0x30FA;
	            i++;
	            // 「ﾞ」 + 「カ」 - 「コ」 or 「ハ」 - 「ホ」
	          } else if (next === 0xFF9E &&
	                     ((c > 0xFF75 && c < 0xFF85) ||
	                      (c > 0xFF89 && c < 0xFF8F))) {
	            code++;
	            i++;
	            // 「ﾟ」 + 「ハ」 - 「ホ」
	          } else if (next === 0xFF9F &&
	                     (c > 0xFF89 && c < 0xFF8F)) {
	            code += 2;
	            i++;
	          }
	        }
	        c = code;
	      }
	      results[results.length] = c;
	    }

	    return asString ? codeToString_fast(results) : results;
	  },
	  /**
	   * 全角スペースを半角スペースに変換
	   *
	   * Convert the em space(U+3000) to the single space(U+0020).
	   *
	   * @param {Array.<number>|TypedArray|string} data The input unicode data.
	   * @return {Array.<number>|string} The conveted data.
	   *
	   * @public
	   * @function
	   */
	  toHankakuSpace: function(data) {
	    if (isString(data)) {
	      return data.replace(/\u3000/g, ' ');
	    }

	    var results = [];
	    var len = data && data.length;
	    var i = 0;
	    var c;

	    while (i < len) {
	      c = data[i++];
	      if (c === 0x3000) {
	        c = 0x20;
	      }
	      results[results.length] = c;
	    }

	    return results;
	  },
	  /**
	   * 半角スペースを全角スペースに変換
	   *
	   * Convert the single space(U+0020) to the em space(U+3000).
	   *
	   * @param {Array.<number>|TypedArray|string} data The input unicode data.
	   * @return {Array.<number>|string} The conveted data.
	   *
	   * @public
	   * @function
	   */
	  toZenkakuSpace: function(data) {
	    if (isString(data)) {
	      return data.replace(/\u0020/g, '\u3000');
	    }

	    var results = [];
	    var len = data && data.length;
	    var i = 0;
	    var c;

	    while (i < len) {
	      c = data[i++];
	      if (c === 0x20) {
	        c = 0x3000;
	      }
	      results[results.length] = c;
	    }

	    return results;
	  }
	};


	/**
	 * @private
	 * @ignore
	 */
	var EncodingDetect = {
	  isBINARY: isBINARY,
	  isASCII: isASCII,
	  isJIS: isJIS,
	  isEUCJP: isEUCJP,
	  isSJIS: isSJIS,
	  isUTF8: isUTF8,
	  isUTF16: isUTF16,
	  isUTF16BE: isUTF16BE,
	  isUTF16LE: isUTF16LE,
	  isUTF32: isUTF32,
	  isUNICODE: isUNICODE
	};

	/**
	 * @private
	 * @ignore
	 */
	var EncodingConvert = {
	  // JIS, EUCJP, SJIS
	  JISToEUCJP: JISToEUCJP,
	  EUCJPToJIS: EUCJPToJIS,
	  JISToSJIS: JISToSJIS,
	  SJISToJIS: SJISToJIS,
	  EUCJPToSJIS: EUCJPToSJIS,
	  SJISToEUCJP: SJISToEUCJP,

	  // UTF8
	  JISToUTF8: JISToUTF8,
	  UTF8ToJIS: UTF8ToJIS,
	  EUCJPToUTF8: EUCJPToUTF8,
	  UTF8ToEUCJP: UTF8ToEUCJP,
	  SJISToUTF8: SJISToUTF8,
	  UTF8ToSJIS: UTF8ToSJIS,

	  // UNICODE
	  UNICODEToUTF8: UNICODEToUTF8,
	  UTF8ToUNICODE: UTF8ToUNICODE,
	  UNICODEToJIS: UNICODEToJIS,
	  JISToUNICODE: JISToUNICODE,
	  UNICODEToEUCJP: UNICODEToEUCJP,
	  EUCJPToUNICODE: EUCJPToUNICODE,
	  UNICODEToSJIS: UNICODEToSJIS,
	  SJISToUNICODE: SJISToUNICODE,

	  // UTF16, UNICODE
	  UNICODEToUTF16: UNICODEToUTF16,
	  UTF16ToUNICODE: UTF16ToUNICODE,
	  UNICODEToUTF16BE: UNICODEToUTF16BE,
	  UTF16BEToUNICODE: UTF16BEToUNICODE,
	  UNICODEToUTF16LE: UNICODEToUTF16LE,
	  UTF16LEToUNICODE: UTF16LEToUNICODE,

	  // UTF16, UTF16BE, UTF16LE
	  UTF8ToUTF16: UTF8ToUTF16,
	  UTF16ToUTF8: UTF16ToUTF8,
	  UTF8ToUTF16BE: UTF8ToUTF16BE,
	  UTF16BEToUTF8: UTF16BEToUTF8,
	  UTF8ToUTF16LE: UTF8ToUTF16LE,
	  UTF16LEToUTF8: UTF16LEToUTF8,
	  UTF16ToUTF16BE: UTF16ToUTF16BE,
	  UTF16BEToUTF16: UTF16BEToUTF16,
	  UTF16ToUTF16LE: UTF16ToUTF16LE,
	  UTF16LEToUTF16: UTF16LEToUTF16,
	  UTF16BEToUTF16LE: UTF16BEToUTF16LE,
	  UTF16LEToUTF16BE: UTF16LEToUTF16BE,

	  // UTF16, JIS
	  JISToUTF16: JISToUTF16,
	  UTF16ToJIS: UTF16ToJIS,
	  JISToUTF16BE: JISToUTF16BE,
	  UTF16BEToJIS: UTF16BEToJIS,
	  JISToUTF16LE: JISToUTF16LE,
	  UTF16LEToJIS: UTF16LEToJIS,

	  // UTF16, EUCJP
	  EUCJPToUTF16: EUCJPToUTF16,
	  UTF16ToEUCJP: UTF16ToEUCJP,
	  EUCJPToUTF16BE: EUCJPToUTF16BE,
	  UTF16BEToEUCJP: UTF16BEToEUCJP,
	  EUCJPToUTF16LE: EUCJPToUTF16LE,
	  UTF16LEToEUCJP: UTF16LEToEUCJP,

	  // UTF16, SJIS
	  SJISToUTF16: SJISToUTF16,
	  UTF16ToSJIS: UTF16ToSJIS,
	  SJISToUTF16BE: SJISToUTF16BE,
	  UTF16BEToSJIS: UTF16BEToSJIS,
	  SJISToUTF16LE: SJISToUTF16LE,
	  UTF16LEToSJIS: UTF16LEToSJIS
	};


	/**
	 * Binary (exe, images and so, etc.)
	 *
	 * Note:
	 *   This function is not considered for Unicode
	 *
	 * @private
	 * @ignore
	 */
	function isBINARY(data) {
	  var i = 0;
	  var len = data && data.length;
	  var c;

	  for (; i < len; i++) {
	    c = data[i];
	    if (c > 0xFF) {
	      return false;
	    }

	    if ((c >= 0x00 && c <= 0x07) || c === 0xFF) {
	      return true;
	    }
	  }

	  return false;
	}

	/**
	 * ASCII (ISO-646)
	 *
	 * @private
	 * @ignore
	 */
	function isASCII(data) {
	  var i = 0;
	  var len = data && data.length;
	  var b;

	  for (; i < len; i++) {
	    b = data[i];
	    if (b > 0xFF ||
	        (b >= 0x80 && b <= 0xFF) ||
	        b === 0x1B) {
	      return false;
	    }
	  }

	  return true;
	}

	/**
	 * ISO-2022-JP (JIS)
	 *
	 * RFC1468 Japanese Character Encoding for Internet Messages
	 * RFC1554 ISO-2022-JP-2: Multilingual Extension of ISO-2022-JP
	 * RFC2237 Japanese Character Encoding for Internet Messages
	 *
	 * @private
	 * @ignore
	 */
	function isJIS(data) {
	  var i = 0;
	  var len = data && data.length;
	  var b, esc1, esc2;

	  for (; i < len; i++) {
	    b = data[i];
	    if (b > 0xFF || (b >= 0x80 && b <= 0xFF)) {
	      return false;
	    }

	    if (b === 0x1B) {
	      if (i + 2 >= len) {
	        return false;
	      }

	      esc1 = data[i + 1];
	      esc2 = data[i + 2];
	      if (esc1 === 0x24) {
	        if (esc2 === 0x28 ||  // JIS X 0208-1990/2000/2004
	            esc2 === 0x40 ||  // JIS X 0208-1978
	            esc2 === 0x42) {  // JIS X 0208-1983
	          return true;
	        }
	      } else if (esc1 === 0x26 && // JIS X 0208-1990
	                 esc2 === 0x40) {
	        return true;
	      } else if (esc1 === 0x28) {
	        if (esc2 === 0x42 || // ASCII
	            esc2 === 0x49 || // JIS X 0201 Halfwidth Katakana
	            esc2 === 0x4A) { // JIS X 0201-1976 Roman set
	          return true;
	        }
	      }
	    }
	  }

	  return false;
	}

	/**
	 * EUC-JP
	 *
	 * @private
	 * @ignore
	 */
	function isEUCJP(data) {
	  var i = 0;
	  var len = data && data.length;
	  var b;

	  for (; i < len; i++) {
	    b = data[i];
	    if (b < 0x80) {
	      continue;
	    }

	    if (b > 0xFF || b < 0x8E) {
	      return false;
	    }

	    if (b === 0x8E) {
	      if (i + 1 >= len) {
	        return false;
	      }

	      b = data[++i];
	      if (b < 0xA1 || 0xDF < b) {
	        return false;
	      }
	    } else if (b === 0x8F) {
	      if (i + 2 >= len) {
	        return false;
	      }

	      b = data[++i];
	      if (b < 0xA2 || 0xED < b) {
	        return false;
	      }

	      b = data[++i];
	      if (b < 0xA1 || 0xFE < b) {
	        return false;
	      }
	    } else if (0xA1 <= b && b <= 0xFE) {
	      if (i + 1 >= len) {
	        return false;
	      }

	      b = data[++i];
	      if (b < 0xA1 || 0xFE < b) {
	        return false;
	      }
	    } else {
	      return false;
	    }
	  }

	  return true;
	}

	/**
	 * Shift-JIS (SJIS)
	 *
	 * @private
	 * @ignore
	 */
	function isSJIS(data) {
	  var i = 0;
	  var len = data && data.length;
	  var b;

	  while (i < len && data[i] > 0x80) {
	    if (data[i++] > 0xFF) {
	      return false;
	    }
	  }

	  for (; i < len; i++) {
	    b = data[i];
	    if (b <= 0x80 ||
	        (0xA1 <= b && b <= 0xDF)) {
	      continue;
	    }

	    if (b === 0xA0 || b > 0xEF || i + 1 >= len) {
	      return false;
	    }

	    b = data[++i];
	    if (b < 0x40 || b === 0x7F || b > 0xFC) {
	      return false;
	    }
	  }

	  return true;
	}

	/**
	 * UTF-8
	 *
	 * @private
	 * @ignore
	 */
	function isUTF8(data) {
	  var i = 0;
	  var len = data && data.length;
	  var b;

	  for (; i < len; i++) {
	    b = data[i];
	    if (b > 0xFF) {
	      return false;
	    }

	    if (b === 0x09 || b === 0x0A || b === 0x0D ||
	        (b >= 0x20 && b <= 0x7E)) {
	      continue;
	    }

	    if (b >= 0xC2 && b <= 0xDF) {
	      if (i + 1 >= len || data[i + 1] < 0x80 || data[i + 1] > 0xBF) {
	        return false;
	      }
	      i++;
	    } else if (b === 0xE0) {
	      if (i + 2 >= len ||
	          data[i + 1] < 0xA0 || data[i + 1] > 0xBF ||
	          data[i + 2] < 0x80 || data[i + 2] > 0xBF) {
	        return false;
	      }
	      i += 2;
	    } else if ((b >= 0xE1 && b <= 0xEC) ||
	                b === 0xEE || b === 0xEF) {
	      if (i + 2 >= len ||
	          data[i + 1] < 0x80 || data[i + 1] > 0xBF ||
	          data[i + 2] < 0x80 || data[i + 2] > 0xBF) {
	        return false;
	      }
	      i += 2;
	    } else if (b === 0xED) {
	      if (i + 2 >= len ||
	          data[i + 1] < 0x80 || data[i + 1] > 0x9F ||
	          data[i + 2] < 0x80 || data[i + 2] > 0xBF) {
	        return false;
	      }
	      i += 2;
	    } else if (b === 0xF0) {
	      if (i + 3 >= len ||
	          data[i + 1] < 0x90 || data[i + 1] > 0xBF ||
	          data[i + 2] < 0x80 || data[i + 2] > 0xBF ||
	          data[i + 3] < 0x80 || data[i + 3] > 0xBF) {
	        return false;
	      }
	      i += 3;
	    } else if (b >= 0xF1 && b <= 0xF3) {
	      if (i + 3 >= len ||
	          data[i + 1] < 0x80 || data[i + 1] > 0xBF ||
	          data[i + 2] < 0x80 || data[i + 2] > 0xBF ||
	          data[i + 3] < 0x80 || data[i + 3] > 0xBF) {
	        return false;
	      }
	      i += 3;
	    } else if (b === 0xF4) {
	      if (i + 3 >= len ||
	          data[i + 1] < 0x80 || data[i + 1] > 0x8F ||
	          data[i + 2] < 0x80 || data[i + 2] > 0xBF ||
	          data[i + 3] < 0x80 || data[i + 3] > 0xBF) {
	        return false;
	      }
	      i += 3;
	    } else {
	      return false;
	    }
	  }

	  return true;
	}

	/**
	 * UTF-16 (LE or BE)
	 *
	 * RFC2781: UTF-16, an encoding of ISO 10646
	 *
	 * @link http://www.ietf.org/rfc/rfc2781.txt
	 * @private
	 * @ignore
	 */
	function isUTF16(data) {
	  var i = 0;
	  var len = data && data.length;
	  var pos = null;
	  var b1, b2, next, prev;

	  if (len < 2) {
	    if (data[0] > 0xFF) {
	      return false;
	    }
	  } else {
	    b1 = data[0];
	    b2 = data[1];
	    if (b1 === 0xFF && // BOM (little-endian)
	        b2 === 0xFE) {
	      return true;
	    }
	    if (b1 === 0xFE && // BOM (big-endian)
	        b2 === 0xFF) {
	      return true;
	    }

	    for (; i < len; i++) {
	      if (data[i] === 0x00) {
	        pos = i;
	        break;
	      } else if (data[i] > 0xFF) {
	        return false;
	      }
	    }

	    if (pos === null) {
	      return false; // Non ASCII
	    }

	    next = data[pos + 1]; // BE
	    if (next !== void 0 && next > 0x00 && next < 0x80) {
	      return true;
	    }

	    prev = data[pos - 1]; // LE
	    if (prev !== void 0 && prev > 0x00 && prev < 0x80) {
	      return true;
	    }
	  }

	  return false;
	}

	/**
	 * UTF-16BE (big-endian)
	 *
	 * RFC 2781 4.3 Interpreting text labelled as UTF-16
	 * Text labelled "UTF-16BE" can always be interpreted as being big-endian
	 *  when BOM does not founds (SHOULD)
	 *
	 * @link http://www.ietf.org/rfc/rfc2781.txt
	 * @private
	 * @ignore
	 */
	function isUTF16BE(data) {
	  var i = 0;
	  var len = data && data.length;
	  var pos = null;
	  var b1, b2;

	  if (len < 2) {
	    if (data[0] > 0xFF) {
	      return false;
	    }
	  } else {
	    b1 = data[0];
	    b2 = data[1];
	    if (b1 === 0xFE && // BOM
	        b2 === 0xFF) {
	      return true;
	    }

	    for (; i < len; i++) {
	      if (data[i] === 0x00) {
	        pos = i;
	        break;
	      } else if (data[i] > 0xFF) {
	        return false;
	      }
	    }

	    if (pos === null) {
	      return false; // Non ASCII
	    }

	    if (pos % 2 === 0) {
	      return true;
	    }
	  }

	  return false;
	}

	/**
	 * UTF-16LE (little-endian)
	 *
	 * @see isUTF16BE
	 * @private
	 * @ignore
	 */
	function isUTF16LE(data) {
	  var i = 0;
	  var len = data && data.length;
	  var pos = null;
	  var b1, b2;

	  if (len < 2) {
	    if (data[0] > 0xFF) {
	      return false;
	    }
	  } else {
	    b1 = data[0];
	    b2 = data[1];
	    if (b1 === 0xFF && // BOM
	        b2 === 0xFE) {
	      return true;
	    }

	    for (; i < len; i++) {
	      if (data[i] === 0x00) {
	        pos = i;
	        break;
	      } else if (data[i] > 0xFF) {
	        return false;
	      }
	    }

	    if (pos === null) {
	      return false; // Non ASCII
	    }

	    if (pos % 2 !== 0) {
	      return true;
	    }
	  }

	  return false;
	}

	/**
	 * UTF-32
	 *
	 * Unicode 3.2.0: Unicode Standard Annex #19
	 *
	 * @link http://www.iana.org/assignments/charset-reg/UTF-32
	 * @link http://www.unicode.org/reports/tr19/tr19-9.html
	 * @private
	 * @ignore
	 */
	function isUTF32(data) {
	  var i = 0;
	  var len = data && data.length;
	  var pos = null;
	  var b1, b2, b3, b4;
	  var next, prev;

	  if (len < 4) {
	    for (; i < len; i++) {
	      if (data[i] > 0xFF) {
	        return false;
	      }
	    }
	  } else {
	    b1 = data[0];
	    b2 = data[1];
	    b3 = data[2];
	    b4 = data[3];
	    if (b1 === 0x00 && b2 === 0x00 && // BOM (big-endian)
	        b3 === 0xFE && b4 === 0xFF) {
	      return true;
	    }

	    if (b1 === 0xFF && b2 === 0xFE && // BOM (little-endian)
	        b3 === 0x00 && b4 === 0x00) {
	      return true;
	    }

	    for (; i < len; i++) {
	      if (data[i] === 0x00 && data[i + 1] === 0x00 && data[i + 2] === 0x00) {
	        pos = i;
	        break;
	      } else if (data[i] > 0xFF) {
	        return false;
	      }
	    }

	    if (pos === null) {
	      return false;
	    }

	    // The byte order should be the big-endian when BOM is not detected.
	    next = data[pos + 3];
	    if (next !== void 0 && next > 0x00 && next <= 0x7F) {
	      // big-endian
	      return data[pos + 2] === 0x00 && data[pos + 1] === 0x00;
	    }

	    prev = data[pos - 1];
	    if (prev !== void 0 && prev > 0x00 && prev <= 0x7F) {
	      // little-endian
	      return data[pos + 1] === 0x00 && data[pos + 2] === 0x00;
	    }
	  }

	  return false;
	}

	/**
	 * JavaScript Unicode array
	 *
	 * @private
	 * @ignore
	 */
	function isUNICODE(data) {
	  var i = 0;
	  var len = data && data.length;
	  var c;

	  for (; i < len; i++) {
	    c = data[i];
	    if (c < 0 || c > 0x10FFFF) {
	      return false;
	    }
	  }

	  return true;
	}


	/**
	 * JIS to SJIS
	 *
	 * @private
	 * @ignore
	 */
	function JISToSJIS(data) {
	  var results = [];
	  var index = 0;
	  var i = 0;
	  var len = data && data.length;
	  var b1, b2;

	  for (; i < len; i++) {
	    // escape sequence
	    while (data[i] === 0x1B) {
	      if ((data[i + 1] === 0x24 && data[i + 2] === 0x42) ||
	          (data[i + 1] === 0x24 && data[i + 2] === 0x40)) {
	        index = 1;
	      } else if ((data[i + 1] === 0x28 && data[i + 2] === 0x49)) {
	        index = 2;
	      } else if (data[i + 1] === 0x24 && data[i + 2] === 0x28 &&
	                 data[i + 3] === 0x44) {
	        index = 3;
	        i++;
	      } else {
	        index = 0;
	      }

	      i += 3;
	      if (data[i] === void 0) {
	        return results;
	      }
	    }

	    if (index === 1) {
	      b1 = data[i];
	      b2 = data[++i];
	      if (b1 & 0x01) {
	        b1 >>= 1;
	        if (b1 < 0x2F) {
	          b1 += 0x71;
	        } else {
	          b1 -= 0x4F;
	        }
	        if (b2 > 0x5F) {
	          b2 += 0x20;
	        } else {
	          b2 += 0x1F;
	        }
	      } else {
	        b1 >>= 1;
	        if (b1 <= 0x2F) {
	          b1 += 0x70;
	        } else {
	          b1 -= 0x50;
	        }
	        b2 += 0x7E;
	      }
	      results[results.length] = b1 & 0xFF;
	      results[results.length] = b2 & 0xFF;
	    } else if (index === 2) {
	      results[results.length] = data[i] + 0x80 & 0xFF;
	    } else if (index === 3) {
	      // Shift_JIS cannot convert JIS X 0212:1990.
	      results[results.length] = UTF8_UNKNOWN;
	    } else {
	      results[results.length] = data[i] & 0xFF;
	    }
	  }

	  return results;
	}

	/**
	 * JIS to EUCJP
	 *
	 * @private
	 * @ignore
	 */
	function JISToEUCJP(data) {
	  var results = [];
	  var index = 0;
	  var len = data && data.length;
	  var i = 0;

	  for (; i < len; i++) {

	    // escape sequence
	    while (data[i] === 0x1B) {
	      if ((data[i + 1] === 0x24 && data[i + 2] === 0x42) ||
	          (data[i + 1] === 0x24 && data[i + 2] === 0x40)) {
	        index = 1;
	      } else if ((data[i + 1] === 0x28 && data[i + 2] === 0x49)) {
	        index = 2;
	      } else if (data[i + 1] === 0x24 && data[i + 2] === 0x28 &&
	                 data[i + 3] === 0x44) {
	        index = 3;
	        i++;
	      } else {
	        index = 0;
	      }

	      i += 3;
	      if (data[i] === void 0) {
	        return results;
	      }
	    }

	    if (index === 1) {
	      results[results.length] = data[i] + 0x80 & 0xFF;
	      results[results.length] = data[++i] + 0x80 & 0xFF;
	    } else if (index === 2) {
	      results[results.length] = 0x8E;
	      results[results.length] = data[i] + 0x80 & 0xFF;
	    } else if (index === 3) {
	      results[results.length] = 0x8F;
	      results[results.length] = data[i] + 0x80 & 0xFF;
	      results[results.length] = data[++i] + 0x80 & 0xFF;
	    } else {
	      results[results.length] = data[i] & 0xFF;
	    }
	  }

	  return results;
	}

	/**
	 * SJIS to JIS
	 *
	 * @private
	 * @ignore
	 */
	function SJISToJIS(data) {
	  var results = [];
	  var index = 0;
	  var len = data && data.length;
	  var i = 0;
	  var b1, b2;

	  var esc = [
	    0x1B, 0x28, 0x42,
	    0x1B, 0x24, 0x42,
	    0x1B, 0x28, 0x49
	  ];

	  for (; i < len; i++) {
	    b1 = data[i];
	    if (b1 >= 0xA1 && b1 <= 0xDF) {
	      if (index !== 2) {
	        index = 2;
	        results[results.length] = esc[6];
	        results[results.length] = esc[7];
	        results[results.length] = esc[8];
	      }
	      results[results.length] = b1 - 0x80 & 0xFF;
	    } else if (b1 >= 0x80) {
	      if (index !== 1) {
	        index = 1;
	        results[results.length] = esc[3];
	        results[results.length] = esc[4];
	        results[results.length] = esc[5];
	      }

	      b1 <<= 1;
	      b2 = data[++i];
	      if (b2 < 0x9F) {
	        if (b1 < 0x13F) {
	          b1 -= 0xE1;
	        } else {
	          b1 -= 0x61;
	        }
	        if (b2 > 0x7E) {
	          b2 -= 0x20;
	        } else {
	          b2 -= 0x1F;
	        }
	      } else {
	        if (b1 < 0x13F) {
	          b1 -= 0xE0;
	        } else {
	          b1 -= 0x60;
	        }
	        b2 -= 0x7E;
	      }
	      results[results.length] = b1 & 0xFF;
	      results[results.length] = b2 & 0xFF;
	    } else {
	      if (index !== 0) {
	        index = 0;
	        results[results.length] = esc[0];
	        results[results.length] = esc[1];
	        results[results.length] = esc[2];
	      }
	      results[results.length] = b1 & 0xFF;
	    }
	  }

	  if (index !== 0) {
	    results[results.length] = esc[0];
	    results[results.length] = esc[1];
	    results[results.length] = esc[2];
	  }

	  return results;
	}

	/**
	 * SJIS to EUCJP
	 *
	 * @private
	 * @ignore
	 */
	function SJISToEUCJP(data) {
	  var results = [];
	  var len = data && data.length;
	  var i = 0;
	  var b1, b2;

	  for (; i < len; i++) {
	    b1 = data[i];
	    if (b1 >= 0xA1 && b1 <= 0xDF) {
	      results[results.length] = 0x8E;
	      results[results.length] = b1;
	    } else if (b1 >= 0x81) {
	      b2 = data[++i];
	      b1 <<= 1;
	      if (b2 < 0x9F) {
	        if (b1 < 0x13F) {
	          b1 -= 0x61;
	        } else {
	          b1 -= 0xE1;
	        }

	        if (b2 > 0x7E) {
	          b2 += 0x60;
	        } else {
	          b2 += 0x61;
	        }
	      } else {
	        if (b1 < 0x13F) {
	          b1 -= 0x60;
	        } else {
	          b1 -= 0xE0;
	        }
	        b2 += 0x02;
	      }
	      results[results.length] = b1 & 0xFF;
	      results[results.length] = b2 & 0xFF;
	    } else {
	      results[results.length] = b1 & 0xFF;
	    }
	  }

	  return results;
	}

	/**
	 * EUCJP to JIS
	 *
	 * @private
	 * @ignore
	 */
	function EUCJPToJIS(data) {
	  var results = [];
	  var index = 0;
	  var len = data && data.length;
	  var i = 0;
	  var b;

	  // escape sequence
	  var esc = [
	    0x1B, 0x28, 0x42,
	    0x1B, 0x24, 0x42,
	    0x1B, 0x28, 0x49,
	    0x1B, 0x24, 0x28, 0x44
	  ];

	  for (; i < len; i++) {
	    b = data[i];
	    if (b === 0x8E) {
	      if (index !== 2) {
	        index = 2;
	        results[results.length] = esc[6];
	        results[results.length] = esc[7];
	        results[results.length] = esc[8];
	      }
	      results[results.length] = data[++i] - 0x80 & 0xFF;
	    } else if (b === 0x8F) {
	      if (index !== 3) {
	        index = 3;
	        results[results.length] = esc[9];
	        results[results.length] = esc[10];
	        results[results.length] = esc[11];
	        results[results.length] = esc[12];
	      }
	      results[results.length] = data[++i] - 0x80 & 0xFF;
	      results[results.length] = data[++i] - 0x80 & 0xFF;
	    } else if (b > 0x8E) {
	      if (index !== 1) {
	        index = 1;
	        results[results.length] = esc[3];
	        results[results.length] = esc[4];
	        results[results.length] = esc[5];
	      }
	      results[results.length] = b - 0x80 & 0xFF;
	      results[results.length] = data[++i] - 0x80 & 0xFF;
	    } else {
	      if (index !== 0) {
	        index = 0;
	        results[results.length] = esc[0];
	        results[results.length] = esc[1];
	        results[results.length] = esc[2];
	      }
	      results[results.length] = b & 0xFF;
	    }
	  }

	  if (index !== 0) {
	    results[results.length] = esc[0];
	    results[results.length] = esc[1];
	    results[results.length] = esc[2];
	  }

	  return results;
	}

	/**
	 * EUCJP to SJIS
	 *
	 * @private
	 * @ignore
	 */
	function EUCJPToSJIS(data) {
	  var results = [];
	  var len = data && data.length;
	  var i = 0;
	  var b1, b2;

	  for (; i < len; i++) {
	    b1 = data[i];
	    if (b1 === 0x8F) {
	      results[results.length] = UTF8_UNKNOWN;
	      i += 2;
	    } else if (b1 > 0x8E) {
	      b2 = data[++i];
	      if (b1 & 0x01) {
	        b1 >>= 1;
	        if (b1 < 0x6F) {
	          b1 += 0x31;
	        } else {
	          b1 += 0x71;
	        }

	        if (b2 > 0xDF) {
	          b2 -= 0x60;
	        } else {
	          b2 -= 0x61;
	        }
	      } else {
	        b1 >>= 1;
	        if (b1 <= 0x6F) {
	          b1 += 0x30;
	        } else {
	          b1 += 0x70;
	        }
	        b2 -= 0x02;
	      }
	      results[results.length] = b1 & 0xFF;
	      results[results.length] = b2 & 0xFF;
	    } else if (b1 === 0x8E) {
	      results[results.length] = data[++i] & 0xFF;
	    } else {
	      results[results.length] = b1 & 0xFF;
	    }
	  }

	  return results;
	}

	/**
	 * SJIS To UTF-8
	 *
	 * @private
	 * @ignore
	 */
	function SJISToUTF8(data) {
	  init_JIS_TO_UTF8_TABLE();

	  var results = [];
	  var i = 0;
	  var len = data && data.length;
	  var b, b1, b2, u2, u3, jis, utf8;

	  for (; i < len; i++) {
	    b = data[i];
	    if (b >= 0xA1 && b <= 0xDF) {
	      b2 = b - 0x40;
	      u2 = 0xBC | ((b2 >> 6) & 0x03);
	      u3 = 0x80 | (b2 & 0x3F);

	      results[results.length] = 0xEF;
	      results[results.length] = u2 & 0xFF;
	      results[results.length] = u3 & 0xFF;
	    } else if (b >= 0x80) {
	      b1 = b << 1;
	      b2 = data[++i];

	      if (b2 < 0x9F) {
	        if (b1 < 0x13F) {
	          b1 -= 0xE1;
	        } else {
	          b1 -= 0x61;
	        }

	        if (b2 > 0x7E) {
	          b2 -= 0x20;
	        } else {
	          b2 -= 0x1F;
	        }
	      } else {
	        if (b1 < 0x13F) {
	          b1 -= 0xE0;
	        } else {
	          b1 -= 0x60;
	        }
	        b2 -= 0x7E;
	      }

	      b1 &= 0xFF;
	      jis = (b1 << 8) + b2;

	      utf8 = JIS_TO_UTF8_TABLE[jis];
	      if (utf8 === void 0) {
	        results[results.length] = UTF8_UNKNOWN;
	      } else {
	        if (utf8 < 0xFFFF) {
	          results[results.length] = utf8 >> 8 & 0xFF;
	          results[results.length] = utf8 & 0xFF;
	        } else {
	          results[results.length] = utf8 >> 16 & 0xFF;
	          results[results.length] = utf8 >> 8 & 0xFF;
	          results[results.length] = utf8 & 0xFF;
	        }
	      }
	    } else {
	      results[results.length] = data[i] & 0xFF;
	    }
	  }

	  return results;
	}

	/**
	 * EUC-JP to UTF-8
	 *
	 * @private
	 * @ignore
	 */
	function EUCJPToUTF8(data) {
	  init_JIS_TO_UTF8_TABLE();

	  var results = [];
	  var i = 0;
	  var len = data && data.length;
	  var b, b2, u2, u3, j2, j3, jis, utf8;

	  for (; i < len; i++) {
	    b = data[i];
	    if (b === 0x8E) {
	      b2 = data[++i] - 0x40;
	      u2 = 0xBC | ((b2 >> 6) & 0x03);
	      u3 = 0x80 | (b2 & 0x3F);

	      results[results.length] = 0xEF;
	      results[results.length] = u2 & 0xFF;
	      results[results.length] = u3 & 0xFF;
	    } else if (b === 0x8F) {
	      j2 = data[++i] - 0x80;
	      j3 = data[++i] - 0x80;
	      jis = (j2 << 8) + j3;

	      utf8 = JISX0212_TO_UTF8_TABLE[jis];
	      if (utf8 === void 0) {
	        results[results.length] = UTF8_UNKNOWN;
	      } else {
	        if (utf8 < 0xFFFF) {
	          results[results.length] = utf8 >> 8 & 0xFF;
	          results[results.length] = utf8 & 0xFF;
	        } else {
	          results[results.length] = utf8 >> 16 & 0xFF;
	          results[results.length] = utf8 >>  8 & 0xFF;
	          results[results.length] = utf8 & 0xFF;
	        }
	      }
	    } else if (b >= 0x80) {
	      jis = ((b - 0x80) << 8) + (data[++i] - 0x80);

	      utf8 = JIS_TO_UTF8_TABLE[jis];
	      if (utf8 === void 0) {
	        results[results.length] = UTF8_UNKNOWN;
	      } else {
	        if (utf8 < 0xFFFF) {
	          results[results.length] = utf8 >> 8 & 0xFF;
	          results[results.length] = utf8 & 0xFF;
	        } else {
	          results[results.length] = utf8 >> 16 & 0xFF;
	          results[results.length] = utf8 >>  8 & 0xFF;
	          results[results.length] = utf8 & 0xFF;
	        }
	      }
	    } else {
	      results[results.length] = data[i] & 0xFF;
	    }
	  }

	  return results;
	}

	/**
	 * JIS to UTF-8
	 *
	 * @private
	 * @ignore
	 */
	function JISToUTF8(data) {
	  init_JIS_TO_UTF8_TABLE();

	  var results = [];
	  var index = 0;
	  var i = 0;
	  var len = data && data.length;
	  var b2, u2, u3, jis, utf8;

	  for (; i < len; i++) {
	    while (data[i] === 0x1B) {
	      if ((data[i + 1] === 0x24 && data[i + 2] === 0x42) ||
	          (data[i + 1] === 0x24 && data[i + 2] === 0x40)) {
	        index = 1;
	      } else if (data[i + 1] === 0x28 && data[i + 2] === 0x49) {
	        index = 2;
	      } else if (data[i + 1] === 0x24 && data[i + 2] === 0x28 &&
	                 data[i + 3] === 0x44) {
	        index = 3;
	        i++;
	      } else {
	        index = 0;
	      }

	      i += 3;
	      if (data[i] === void 0) {
	        return results;
	      }
	    }

	    if (index === 1) {
	      jis = (data[i] << 8) + data[++i];

	      utf8 = JIS_TO_UTF8_TABLE[jis];
	      if (utf8 === void 0) {
	        results[results.length] = UTF8_UNKNOWN;
	      } else {
	        if (utf8 < 0xFFFF) {
	          results[results.length] = utf8 >> 8 & 0xFF;
	          results[results.length] = utf8 & 0xFF;
	        } else {
	          results[results.length] = utf8 >> 16 & 0xFF;
	          results[results.length] = utf8 >>  8 & 0xFF;
	          results[results.length] = utf8 & 0xFF;
	        }
	      }
	    } else if (index === 2) {
	      b2 = data[i] + 0x40;
	      u2 = 0xBC | ((b2 >> 6) & 0x03);
	      u3 = 0x80 | (b2 & 0x3F);

	      results[results.length] = 0xEF;
	      results[results.length] = u2 & 0xFF;
	      results[results.length] = u3 & 0xFF;
	    } else if (index === 3) {
	      jis = (data[i] << 8) + data[++i];

	      utf8 = JISX0212_TO_UTF8_TABLE[jis];
	      if (utf8 === void 0) {
	        results[results.length] = UTF8_UNKNOWN;
	      } else {
	        if (utf8 < 0xFFFF) {
	          results[results.length] = utf8 >> 8 & 0xFF;
	          results[results.length] = utf8 & 0xFF;
	        } else {
	          results[results.length] = utf8 >> 16 & 0xFF;
	          results[results.length] = utf8 >>  8 & 0xFF;
	          results[results.length] = utf8 & 0xFF;
	        }
	      }
	    } else {
	      results[results.length] = data[i] & 0xFF;
	    }
	  }

	  return results;
	}

	/**
	 * UTF-8 to SJIS
	 *
	 * @private
	 * @ignore
	 */
	function UTF8ToSJIS(data) {
	  var results = [];
	  var i = 0;
	  var len = data && data.length;
	  var b, b1, b2, utf8, jis;

	  for (; i < len; i++) {
	    b = data[i];
	    if (b >= 0x80) {
	      if (b <= 0xDF) {
	        // 2 bytes.
	        utf8 = (b << 8) + data[++i];
	      } else {
	        // 3 bytes.
	        utf8 = (b << 16) +
	               (data[++i] << 8) +
	               (data[++i] & 0xFF);
	      }

	      jis = UTF8_TO_JIS_TABLE[utf8];
	      if (jis === void 0) {
	        results[results.length] = UTF8_UNKNOWN;
	      } else {
	        if (jis < 0xFF) {
	          results[results.length] = jis + 0x80;
	        } else {
	          if (jis > 0x10000) {
	            jis -= 0x10000;
	          }

	          b1 = jis >> 8;
	          b2 = jis & 0xFF;
	          if (b1 & 0x01) {
	            b1 >>= 1;
	            if (b1 < 0x2F) {
	              b1 += 0x71;
	            } else {
	              b1 -= 0x4F;
	            }

	            if (b2 > 0x5F) {
	              b2 += 0x20;
	            } else {
	              b2 += 0x1F;
	            }
	          } else {
	            b1 >>= 1;
	            if (b1 <= 0x2F) {
	              b1 += 0x70;
	            } else {
	              b1 -= 0x50;
	            }
	            b2 += 0x7E;
	          }
	          results[results.length] = b1 & 0xFF;
	          results[results.length] = b2 & 0xFF;
	        }
	      }
	    } else {
	      results[results.length] = data[i] & 0xFF;
	    }
	  }

	  return results;
	}

	/**
	 * UTF-8 to EUC-JP
	 *
	 * @private
	 * @ignore
	 */
	function UTF8ToEUCJP(data) {
	  var results = [];
	  var i = 0;
	  var len = data && data.length;
	  var b, utf8, jis;

	  for (; i < len; i++) {
	    b = data[i];
	    if (b >= 0x80) {
	      if (b <= 0xDF) {
	        utf8 = (data[i++] << 8) + data[i];
	      } else {
	        utf8 = (data[i++] << 16) +
	               (data[i++] << 8) +
	               (data[i] & 0xFF);
	      }

	      jis = UTF8_TO_JIS_TABLE[utf8];
	      if (jis === void 0) {
	        jis = UTF8_TO_JISX0212_TABLE[utf8];
	        if (jis === void 0) {
	          results[results.length] = UTF8_UNKNOWN;
	        } else {
	          results[results.length] = 0x8F;
	          results[results.length] = (jis >> 8) - 0x80 & 0xFF;
	          results[results.length] = (jis & 0xFF) - 0x80 & 0xFF;
	        }
	      } else {
	        if (jis > 0x10000) {
	          jis -= 0x10000;
	        }
	        if (jis < 0xFF) {
	          results[results.length] = 0x8E;
	          results[results.length] = jis - 0x80 & 0xFF;
	        } else {
	          results[results.length] = (jis >> 8) - 0x80 & 0xFF;
	          results[results.length] = (jis & 0xFF) - 0x80 & 0xFF;
	        }
	      }
	    } else {
	      results[results.length] = data[i] & 0xFF;
	    }
	  }

	  return results;
	}

	/**
	 * UTF-8 to JIS
	 *
	 * @private
	 * @ignore
	 */
	function UTF8ToJIS(data) {
	  var results = [];
	  var index = 0;
	  var len = data && data.length;
	  var i = 0;
	  var b, utf8, jis;
	  var esc = [
	    0x1B, 0x28, 0x42,
	    0x1B, 0x24, 0x42,
	    0x1B, 0x28, 0x49,
	    0x1B, 0x24, 0x28, 0x44
	  ];

	  for (; i < len; i++) {
	    b = data[i];
	    if (b < 0x80) {
	      if (index !== 0) {
	        index = 0;
	        results[results.length] = esc[0];
	        results[results.length] = esc[1];
	        results[results.length] = esc[2];
	      }
	      results[results.length] = b & 0xFF;
	    } else {
	      if (b <= 0xDF) {
	        utf8 = (data[i] << 8) + data[++i];
	      } else {
	        utf8 = (data[i] << 16) + (data[++i] << 8) + data[++i];
	      }

	      jis = UTF8_TO_JIS_TABLE[utf8];
	      if (jis === void 0) {
	        jis = UTF8_TO_JISX0212_TABLE[utf8];
	        if (jis === void 0) {
	          if (index !== 0) {
	            index = 0;
	            results[results.length] = esc[0];
	            results[results.length] = esc[1];
	            results[results.length] = esc[2];
	          }
	          results[results.length] = UTF8_UNKNOWN;
	        } else {
	          // JIS X 0212:1990
	          if (index !== 3) {
	            index = 3;
	            results[results.length] = esc[9];
	            results[results.length] = esc[10];
	            results[results.length] = esc[11];
	            results[results.length] = esc[12];
	          }
	          results[results.length] = jis >> 8 & 0xFF;
	          results[results.length] = jis & 0xFF;
	        }
	      } else {
	        if (jis > 0x10000) {
	          jis -= 0x10000;
	        }
	        if (jis < 0xFF) {
	          // Halfwidth Katakana
	          if (index !== 2) {
	            index = 2;
	            results[results.length] = esc[6];
	            results[results.length] = esc[7];
	            results[results.length] = esc[8];
	          }
	          results[results.length] = jis & 0xFF;
	        } else {
	          if (index !== 1) {
	            index = 1;
	            results[results.length] = esc[3];
	            results[results.length] = esc[4];
	            results[results.length] = esc[5];
	          }
	          results[results.length] = jis >> 8 & 0xFF;
	          results[results.length] = jis & 0xFF;
	        }
	      }
	    }
	  }

	  if (index !== 0) {
	    results[results.length] = esc[0];
	    results[results.length] = esc[1];
	    results[results.length] = esc[2];
	  }

	  return results;
	}

	/**
	 * UTF-16 (JavaScript Unicode array) to UTF-8
	 *
	 * @private
	 * @ignore
	 */
	function UNICODEToUTF8(data) {
	  var results = [];
	  var i = 0;
	  var len = data && data.length;
	  var c, second;

	  for (; i < len; i++) {
	    c = data[i];

	    // high surrogate
	    if (c >= 0xD800 && c <= 0xDBFF && i + 1 < len) {
	      second = data[i + 1];
	      // low surrogate
	      if (second >= 0xDC00 && second <= 0xDFFF) {
	        c = (c - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
	        i++;
	      }
	    }

	    if (c < 0x80) {
	      results[results.length] = c;
	    } else if (c < 0x800) {
	      results[results.length] = 0xC0 | ((c >> 6) & 0x1F);
	      results[results.length] = 0x80 | (c & 0x3F);
	    } else if (c < 0x10000) {
	      results[results.length] = 0xE0 | ((c >> 12) & 0xF);
	      results[results.length] = 0x80 | ((c >> 6) & 0x3F);
	      results[results.length] = 0x80 | (c & 0x3F);
	    } else if (c < 0x200000) {
	      results[results.length] = 0xF0 | ((c >> 18) & 0xF);
	      results[results.length] = 0x80 | ((c >> 12) & 0x3F);
	      results[results.length] = 0x80 | ((c >> 6) & 0x3F);
	      results[results.length] = 0x80 | (c & 0x3F);
	    }
	  }

	  return results;
	}

	/**
	 * UTF-8 to UTF-16 (JavaScript Unicode array)
	 *
	 * @private
	 * @ignore
	 */
	function UTF8ToUNICODE(data) {
	  var results = [];
	  var i = 0;
	  var len = data && data.length;
	  var n, c, c2, c3, c4, code;

	  while (i < len) {
	    c = data[i++];
	    n = c >> 4;
	    if (n >= 0 && n <= 7) {
	      // 0xxx xxxx
	      code = c;
	    } else if (n === 12 || n === 13) {
	      // 110x xxxx
	      // 10xx xxxx
	      c2 = data[i++];
	      code = ((c & 0x1F) << 6) | (c2 & 0x3F);
	    } else if (n === 14) {
	      // 1110 xxxx
	      // 10xx xxxx
	      // 10xx xxxx
	      c2 = data[i++];
	      c3 = data[i++];
	      code = ((c & 0x0F) << 12) |
	             ((c2 & 0x3F) << 6) |
	              (c3 & 0x3F);
	    } else if (n === 15) {
	      // 1111 0xxx
	      // 10xx xxxx
	      // 10xx xxxx
	      // 10xx xxxx
	      c2 = data[i++];
	      c3 = data[i++];
	      c4 = data[i++];
	      code = ((c & 0x7) << 18)   |
	             ((c2 & 0x3F) << 12) |
	             ((c3 & 0x3F) << 6)  |
	              (c4 & 0x3F);
	    }

	    if (code <= 0xFFFF) {
	      results[results.length] = code;
	    } else {
	      // Split in surrogate halves
	      code -= 0x10000;
	      results[results.length] = (code >> 10) + 0xD800; // High surrogate
	      results[results.length] = (code % 0x400) + 0xDC00; // Low surrogate
	    }
	  }

	  return results;
	}

	/**
	 * UTF-16 (JavaScript Unicode array) to UTF-16
	 *
	 * UTF-16BE (big-endian)
	 * Note: this function does not prepend the BOM by default.
	 *
	 * RFC 2781 4.3 Interpreting text labelled as UTF-16
	 *   If the first two octets of the text is not 0xFE followed by
	 *   0xFF, and is not 0xFF followed by 0xFE, then the text SHOULD be
	 *   interpreted as being big-endian.
	 *
	 * @link https://www.ietf.org/rfc/rfc2781.txt
	 * UTF-16, an encoding of ISO 10646
	 *
	 * @private
	 * @ignore
	 */
	function UNICODEToUTF16(data, options) {
	  var results;

	  if (options && options.bom) {
	    var optBom = options.bom;
	    if (!isString(optBom)) {
	      optBom = 'BE';
	    }

	    var bom, utf16;
	    if (optBom.charAt(0).toUpperCase() === 'B') {
	      // Big-endian
	      bom = [0xFE, 0xFF];
	      utf16 = UNICODEToUTF16BE(data);
	    } else {
	      // Little-endian
	      bom = [0xFF, 0xFE];
	      utf16 = UNICODEToUTF16LE(data);
	    }

	    results = [];
	    results[0] = bom[0];
	    results[1] = bom[1];

	    for (var i = 0, len = utf16.length; i < len; i++) {
	      results[results.length] = utf16[i];
	    }
	  } else {
	    // Without BOM: Convert as BE (SHOULD).
	    results = UNICODEToUTF16BE(data);
	  }

	  return results;
	}

	/**
	 * UTF-16 (JavaScript Unicode array) to UTF-16BE
	 *
	 * @link https://www.ietf.org/rfc/rfc2781.txt
	 * UTF-16, an encoding of ISO 10646
	 *
	 * @private
	 * @ignore
	 */
	function UNICODEToUTF16BE(data) {
	  var results = [];
	  var i = 0;
	  var len = data && data.length;
	  var c;

	  while (i < len) {
	    c = data[i++];
	    if (c <= 0xFF) {
	      results[results.length] = 0;
	      results[results.length] = c;
	    } else if (c <= 0xFFFF) {
	      results[results.length] = c >> 8 & 0xFF;
	      results[results.length] = c & 0xFF;
	    }
	  }

	  return results;
	}

	/**
	 * UTF-16 (JavaScript Unicode array) to UTF-16LE
	 *
	 * @link https://www.ietf.org/rfc/rfc2781.txt
	 * UTF-16, an encoding of ISO 10646
	 *
	 * @private
	 * @ignore
	 */
	function UNICODEToUTF16LE(data) {
	  var results = [];
	  var i = 0;
	  var len = data && data.length;
	  var c;

	  while (i < len) {
	    c = data[i++];
	    if (c <= 0xFF) {
	      results[results.length] = c;
	      results[results.length] = 0;
	    } else if (c <= 0xFFFF) {
	      results[results.length] = c & 0xFF;
	      results[results.length] = c >> 8 & 0xFF;
	    }
	  }

	  return results;
	}

	/**
	 * UTF-16BE to UTF-16 (JavaScript Unicode array)
	 *
	 * @link https://www.ietf.org/rfc/rfc2781.txt
	 * UTF-16, an encoding of ISO 10646
	 *
	 * @private
	 * @ignore
	 */
	function UTF16BEToUNICODE(data) {
	  var results = [];
	  var i = 0;
	  var len = data && data.length;
	  var c1, c2;

	  if (len >= 2 &&
	      ((data[0] === 0xFE && data[1] === 0xFF) ||
	       (data[0] === 0xFF && data[1] === 0xFE))
	  ) {
	    i = 2;
	  }

	  while (i < len) {
	    c1 = data[i++];
	    c2 = data[i++];
	    if (c1 === 0) {
	      results[results.length] = c2;
	    } else {
	      results[results.length] = ((c1 & 0xFF) << 8) | (c2 & 0xFF);
	    }
	  }

	  return results;
	}

	/**
	 * UTF-16LE to UTF-16 (JavaScript Unicode array)
	 *
	 * @link https://www.ietf.org/rfc/rfc2781.txt
	 * UTF-16, an encoding of ISO 10646
	 *
	 * @private
	 * @ignore
	 */
	function UTF16LEToUNICODE(data) {
	  var results = [];
	  var i = 0;
	  var len = data && data.length;
	  var c1, c2;

	  if (len >= 2 &&
	      ((data[0] === 0xFE && data[1] === 0xFF) ||
	       (data[0] === 0xFF && data[1] === 0xFE))
	  ) {
	    i = 2;
	  }

	  while (i < len) {
	    c1 = data[i++];
	    c2 = data[i++];
	    if (c2 === 0) {
	      results[results.length] = c1;
	    } else {
	      results[results.length] = ((c2 & 0xFF) << 8) | (c1 & 0xFF);
	    }
	  }

	  return results;
	}

	/**
	 * UTF-16 to UTF-16 (JavaScript Unicode array)
	 *
	 * @link https://www.ietf.org/rfc/rfc2781.txt
	 * UTF-16, an encoding of ISO 10646
	 *
	 * @private
	 * @ignore
	 */
	function UTF16ToUNICODE(data) {
	  var results = [];
	  var i = 0;
	  var len = data && data.length;
	  var isLE = false;
	  var first = true;
	  var c1, c2;

	  while (i < len) {
	    c1 = data[i++];
	    c2 = data[i++];

	    if (first && i === 2) {
	      first = false;
	      if (c1 === 0xFE && c2 === 0xFF) {
	        isLE = false;
	      } else if (c1 === 0xFF && c2 === 0xFE) {
	        // Little-endian
	        isLE = true;
	      } else {
	        isLE = isUTF16LE(data);
	        i = 0;
	      }
	      continue;
	    }

	    if (isLE) {
	      if (c2 === 0) {
	        results[results.length] = c1;
	      } else {
	        results[results.length] = ((c2 & 0xFF) << 8) | (c1 & 0xFF);
	      }
	    } else {
	      if (c1 === 0) {
	        results[results.length] = c2;
	      } else {
	        results[results.length] = ((c1 & 0xFF) << 8) | (c2 & 0xFF);
	      }
	    }
	  }

	  return results;
	}

	/**
	 * UTF-16 to UTF-16BE
	 *
	 * @private
	 * @ignore
	 */
	function UTF16ToUTF16BE(data) {
	  var results = [];
	  var i = 0;
	  var len = data && data.length;
	  var isLE = false;
	  var first = true;
	  var c1, c2;

	  while (i < len) {
	    c1 = data[i++];
	    c2 = data[i++];

	    if (first && i === 2) {
	      first = false;
	      if (c1 === 0xFE && c2 === 0xFF) {
	        isLE = false;
	      } else if (c1 === 0xFF && c2 === 0xFE) {
	        // Little-endian
	        isLE = true;
	      } else {
	        isLE = isUTF16LE(data);
	        i = 0;
	      }
	      continue;
	    }

	    if (isLE) {
	      results[results.length] = c2;
	      results[results.length] = c1;
	    } else {
	      results[results.length] = c1;
	      results[results.length] = c2;
	    }
	  }

	  return results;
	}

	/**
	 * UTF-16BE to UTF-16
	 *
	 * @private
	 * @ignore
	 */
	function UTF16BEToUTF16(data, options) {
	  var isLE = false;
	  var bom;

	  if (options && options.bom) {
	    var optBom = options.bom;
	    if (!isString(optBom)) {
	      optBom = 'BE';
	    }

	    if (optBom.charAt(0).toUpperCase() === 'B') {
	      // Big-endian
	      bom = [0xFE, 0xFF];
	    } else {
	      // Little-endian
	      bom = [0xFF, 0xFE];
	      isLE = true;
	    }
	  }

	  var results = [];
	  var len = data && data.length;
	  var i = 0;

	  if (len >= 2 &&
	      ((data[0] === 0xFE && data[1] === 0xFF) ||
	       (data[0] === 0xFF && data[1] === 0xFE))
	  ) {
	    i = 2;
	  }

	  if (bom) {
	    results[0] = bom[0];
	    results[1] = bom[1];
	  }

	  var c1, c2;
	  while (i < len) {
	    c1 = data[i++];
	    c2 = data[i++];

	    if (isLE) {
	      results[results.length] = c2;
	      results[results.length] = c1;
	    } else {
	      results[results.length] = c1;
	      results[results.length] = c2;
	    }
	  }

	  return results;
	}

	/**
	 * UTF-16 to UTF-16LE
	 *
	 * @private
	 * @ignore
	 */
	function UTF16ToUTF16LE(data) {
	  var results = [];
	  var i = 0;
	  var len = data && data.length;
	  var isLE = false;
	  var first = true;
	  var c1, c2;

	  while (i < len) {
	    c1 = data[i++];
	    c2 = data[i++];

	    if (first && i === 2) {
	      first = false;
	      if (c1 === 0xFE && c2 === 0xFF) {
	        isLE = false;
	      } else if (c1 === 0xFF && c2 === 0xFE) {
	        // Little-endian
	        isLE = true;
	      } else {
	        isLE = isUTF16LE(data);
	        i = 0;
	      }
	      continue;
	    }

	    if (isLE) {
	      results[results.length] = c1;
	      results[results.length] = c2;
	    } else {
	      results[results.length] = c2;
	      results[results.length] = c1;
	    }
	  }

	  return results;
	}

	/**
	 * UTF-16LE to UTF-16
	 *
	 * @private
	 * @ignore
	 */
	function UTF16LEToUTF16(data, options) {
	  var isLE = false;
	  var bom;

	  if (options && options.bom) {
	    var optBom = options.bom;
	    if (!isString(optBom)) {
	      optBom = 'BE';
	    }

	    if (optBom.charAt(0).toUpperCase() === 'B') {
	      // Big-endian
	      bom = [0xFE, 0xFF];
	    } else {
	      // Little-endian
	      bom = [0xFF, 0xFE];
	      isLE = true;
	    }
	  }

	  var results = [];
	  var len = data && data.length;
	  var i = 0;

	  if (len >= 2 &&
	      ((data[0] === 0xFE && data[1] === 0xFF) ||
	       (data[0] === 0xFF && data[1] === 0xFE))
	  ) {
	    i = 2;
	  }

	  if (bom) {
	    results[0] = bom[0];
	    results[1] = bom[1];
	  }

	  var c1, c2;
	  while (i < len) {
	    c1 = data[i++];
	    c2 = data[i++];

	    if (isLE) {
	      results[results.length] = c1;
	      results[results.length] = c2;
	    } else {
	      results[results.length] = c2;
	      results[results.length] = c1;
	    }
	  }

	  return results;
	}

	/**
	 * UTF-16BE to UTF-16LE
	 *
	 * @private
	 * @ignore
	 */
	function UTF16BEToUTF16LE(data) {
	  var results = [];
	  var i = 0;
	  var len = data && data.length;
	  var c1, c2;

	  if (len >= 2 &&
	      ((data[0] === 0xFE && data[1] === 0xFF) ||
	       (data[0] === 0xFF && data[1] === 0xFE))
	  ) {
	    i = 2;
	  }

	  while (i < len) {
	    c1 = data[i++];
	    c2 = data[i++];
	    results[results.length] = c2;
	    results[results.length] = c1;
	  }

	  return results;
	}

	/**
	 * UTF-16LE to UTF-16BE
	 *
	 * @private
	 * @ignore
	 */
	function UTF16LEToUTF16BE(data) {
	  return UTF16BEToUTF16LE(data);
	}


	/**
	 * UTF-16 (JavaScript Unicode array) to JIS
	 *
	 * @private
	 * @ignore
	 */
	function UNICODEToJIS(data) {
	  return UTF8ToJIS(UNICODEToUTF8(data));
	}

	/**
	 * JIS to UTF-16 (JavaScript Unicode array)
	 *
	 * @private
	 * @ignore
	 */
	function JISToUNICODE(data) {
	  return UTF8ToUNICODE(JISToUTF8(data));
	}

	/**
	 * UTF-16 (JavaScript Unicode array) to EUCJP
	 *
	 * @private
	 * @ignore
	 */
	function UNICODEToEUCJP(data) {
	  return UTF8ToEUCJP(UNICODEToUTF8(data));
	}

	/**
	 * EUCJP to UTF-16 (JavaScript Unicode array)
	 *
	 * @private
	 * @ignore
	 */
	function EUCJPToUNICODE(data) {
	  return UTF8ToUNICODE(EUCJPToUTF8(data));
	}

	/**
	 * UTF-16 (JavaScript Unicode array) to SJIS
	 *
	 * @private
	 * @ignore
	 */
	function UNICODEToSJIS(data) {
	  return UTF8ToSJIS(UNICODEToUTF8(data));
	}

	/**
	 * SJIS to UTF-16 (JavaScript Unicode array)
	 *
	 * @private
	 * @ignore
	 */
	function SJISToUNICODE(data) {
	  return UTF8ToUNICODE(SJISToUTF8(data));
	}

	/**
	 * UTF-8 to UTF-16
	 *
	 * @private
	 * @ignore
	 */
	function UTF8ToUTF16(data, options) {
	  return UNICODEToUTF16(UTF8ToUNICODE(data), options);
	}

	/**
	 * UTF-16 to UTF-8
	 *
	 * @private
	 * @ignore
	 */
	function UTF16ToUTF8(data) {
	  return UNICODEToUTF8(UTF16ToUNICODE(data));
	}

	/**
	 * UTF-8 to UTF-16BE
	 *
	 * @private
	 * @ignore
	 */
	function UTF8ToUTF16BE(data) {
	  return UNICODEToUTF16BE(UTF8ToUNICODE(data));
	}

	/**
	 * UTF-16BE to UTF-8
	 *
	 * @private
	 * @ignore
	 */
	function UTF16BEToUTF8(data) {
	  return UNICODEToUTF8(UTF16BEToUNICODE(data));
	}

	/**
	 * UTF-8 to UTF-16LE
	 *
	 * @private
	 * @ignore
	 */
	function UTF8ToUTF16LE(data) {
	  return UNICODEToUTF16LE(UTF8ToUNICODE(data));
	}

	/**
	 * UTF-16LE to UTF-8
	 *
	 * @private
	 * @ignore
	 */
	function UTF16LEToUTF8(data) {
	  return UNICODEToUTF8(UTF16LEToUNICODE(data));
	}

	/**
	 * JIS to UTF-16
	 *
	 * @private
	 * @ignore
	 */
	function JISToUTF16(data, options) {
	  return UTF8ToUTF16(JISToUTF8(data), options);
	}

	/**
	 * UTF-16 to JIS
	 *
	 * @private
	 * @ignore
	 */
	function UTF16ToJIS(data) {
	  return UTF8ToJIS(UTF16ToUTF8(data));
	}

	/**
	 * JIS to UTF-16BE
	 *
	 * @private
	 * @ignore
	 */
	function JISToUTF16BE(data) {
	  return UTF8ToUTF16BE(JISToUTF8(data));
	}

	/**
	 * UTF-16BE to JIS
	 *
	 * @private
	 * @ignore
	 */
	function UTF16BEToJIS(data) {
	  return UTF8ToJIS(UTF16BEToUTF8(data));
	}

	/**
	 * JIS to UTF-16LE
	 *
	 * @private
	 * @ignore
	 */
	function JISToUTF16LE(data) {
	  return UTF8ToUTF16LE(JISToUTF8(data));
	}

	/**
	 * UTF-16LE to JIS
	 *
	 * @private
	 * @ignore
	 */
	function UTF16LEToJIS(data) {
	  return UTF8ToJIS(UTF16LEToUTF8(data));
	}

	/**
	 * EUC-JP to UTF-16
	 *
	 * @private
	 * @ignore
	 */
	function EUCJPToUTF16(data, options) {
	  return UTF8ToUTF16(EUCJPToUTF8(data), options);
	}

	/**
	 * UTF-16 to EUC-JP
	 *
	 * @private
	 * @ignore
	 */
	function UTF16ToEUCJP(data) {
	  return UTF8ToEUCJP(UTF16ToUTF8(data));
	}

	/**
	 * EUC-JP to UTF-16BE
	 *
	 * @private
	 * @ignore
	 */
	function EUCJPToUTF16BE(data) {
	  return UTF8ToUTF16BE(EUCJPToUTF8(data));
	}

	/**
	 * UTF-16BE to EUC-JP
	 *
	 * @private
	 * @ignore
	 */
	function UTF16BEToEUCJP(data) {
	  return UTF8ToEUCJP(UTF16BEToUTF8(data));
	}

	/**
	 * EUC-JP to UTF-16LE
	 *
	 * @private
	 * @ignore
	 */
	function EUCJPToUTF16LE(data) {
	  return UTF8ToUTF16LE(EUCJPToUTF8(data));
	}

	/**
	 * UTF-16LE to EUC-JP
	 *
	 * @private
	 * @ignore
	 */
	function UTF16LEToEUCJP(data) {
	  return UTF8ToEUCJP(UTF16LEToUTF8(data));
	}

	/**
	 * SJIS to UTF-16
	 *
	 * @private
	 * @ignore
	 */
	function SJISToUTF16(data, options) {
	  return UTF8ToUTF16(SJISToUTF8(data), options);
	}

	/**
	 * UTF-16 to SJIS
	 *
	 * @private
	 * @ignore
	 */
	function UTF16ToSJIS(data) {
	  return UTF8ToSJIS(UTF16ToUTF8(data));
	}

	/**
	 * SJIS to UTF-16BE
	 *
	 * @private
	 * @ignore
	 */
	function SJISToUTF16BE(data) {
	  return UTF8ToUTF16BE(SJISToUTF8(data));
	}

	/**
	 * UTF-16BE to SJIS
	 *
	 * @private
	 * @ignore
	 */
	function UTF16BEToSJIS(data) {
	  return UTF8ToSJIS(UTF16BEToUTF8(data));
	}

	/**
	 * SJIS to UTF-16LE
	 *
	 * @private
	 * @ignore
	 */
	function SJISToUTF16LE(data) {
	  return UTF8ToUTF16LE(SJISToUTF8(data));
	}

	/**
	 * UTF-16LE to SJIS
	 *
	 * @private
	 * @ignore
	 */
	function UTF16LEToSJIS(data) {
	  return UTF8ToSJIS(UTF16LEToUTF8(data));
	}


	/**
	 * Assign the internal encoding name from the argument encoding name.
	 *
	 * @private
	 * @ignore
	 */
	function assignEncodingName(target) {
	  var name = '';
	  var expect = ('' + target).toUpperCase().replace(/[^A-Z0-9]+/g, '');
	  var aliasNames = getKeys(EncodingAliases);
	  var len = aliasNames.length;
	  var hit = 0;
	  var encoding, encodingLen, j;

	  for (var i = 0; i < len; i++) {
	    encoding = aliasNames[i];
	    if (encoding === expect) {
	      name = encoding;
	      break;
	    }

	    encodingLen = encoding.length;
	    for (j = hit; j < encodingLen; j++) {
	      if (encoding.slice(0, j) === expect.slice(0, j) ||
	          encoding.slice(-j) === expect.slice(-j)) {
	        name = encoding;
	        hit = j;
	      }
	    }
	  }

	  if (hasOwnProperty.call(EncodingAliases, name)) {
	    return EncodingAliases[name];
	  }

	  return name;
	}


	// Helpers

	function isObject(x) {
	  var type = typeof x;
	  return type === 'function' || type === 'object' && !!x;
	}

	function isArray(x) {
	  return Array.isArray ? Array.isArray(x) :
	    toString.call(x) === '[object Array]';
	}

	function isString(x) {
	  return typeof x === 'string' || toString.call(x) === '[object String]';
	}


	function getKeys(object) {
	  if (Object.keys) {
	    return Object.keys(object);
	  }

	  var keys = [];
	  for (var key in object) {
	    if (hasOwnProperty.call(object, key)) {
	      keys[keys.length] = key;
	    }
	  }

	  return keys;
	}


	function createBuffer(bits, size) {
	  if (!HAS_TYPED) {
	    return new Array(size);
	  }

	  switch (bits) {
	    case 8: return new Uint8Array(size);
	    case 16: return new Uint16Array(size);
	  }
	}


	function stringToBuffer(string) {
	  var length = string.length;
	  var buffer = createBuffer(16, length);

	  for (var i = 0; i < length; i++) {
	    buffer[i] = string.charCodeAt(i);
	  }

	  return buffer;
	}


	function codeToString_fast(code) {
	  if (CAN_CHARCODE_APPLY && CAN_CHARCODE_APPLY_TYPED) {
	    var len = code && code.length;
	    if (len < APPLY_BUFFER_SIZE) {
	      if (APPLY_BUFFER_SIZE_OK) {
	        return fromCharCode.apply(null, code);
	      }

	      if (APPLY_BUFFER_SIZE_OK === null) {
	        try {
	          var s = fromCharCode.apply(null, code);
	          if (len > APPLY_BUFFER_SIZE) {
	            APPLY_BUFFER_SIZE_OK = true;
	          }
	          return s;
	        } catch (e) {
	          // Ignore RangeError: arguments too large
	          APPLY_BUFFER_SIZE_OK = false;
	        }
	      }
	    }
	  }

	  return codeToString_chunked(code);
	}


	function codeToString_chunked(code) {
	  var string = '';
	  var length = code && code.length;
	  var i = 0;
	  var sub;

	  while (i < length) {
	    if (code.subarray) {
	      sub = code.subarray(i, i + APPLY_BUFFER_SIZE);
	    } else {
	      sub = code.slice(i, i + APPLY_BUFFER_SIZE);
	    }
	    i += APPLY_BUFFER_SIZE;

	    if (APPLY_BUFFER_SIZE_OK) {
	      string += fromCharCode.apply(null, sub);
	      continue;
	    }

	    if (APPLY_BUFFER_SIZE_OK === null) {
	      try {
	        string += fromCharCode.apply(null, sub);
	        if (sub.length > APPLY_BUFFER_SIZE) {
	          APPLY_BUFFER_SIZE_OK = true;
	        }
	        continue;
	      } catch (e) {
	        APPLY_BUFFER_SIZE_OK = false;
	      }
	    }

	    return codeToString_slow(code);
	  }

	  return string;
	}


	function codeToString_slow(code) {
	  var string = '';
	  var length = code && code.length;

	  for (var i = 0; i < length; i++) {
	    string += fromCharCode(code[i]);
	  }

	  return string;
	}


	function stringToCode(string) {
	  var code = [];
	  var len = string && string.length;

	  for (var i = 0; i < len; i++) {
	    code[i] = string.charCodeAt(i);
	  }

	  return code;
	}


	function codeToBuffer(code) {
	  if (HAS_TYPED) {
	    // Use Uint16Array for Unicode codepoint.
	    return new Uint16Array(code);
	  } else {
	    if (isArray(code)) {
	      return code;
	    }
	  }

	  var length = code && code.length;
	  var buffer = [];

	  for (var i = 0; i < length; i++) {
	    buffer[i] = code[i];
	  }

	  return buffer;
	}


	function bufferToCode(buffer) {
	  if (isArray(buffer)) {
	    return buffer;
	  }

	  return slice.call(buffer);
	}

	// Base64
	/* Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
	 * Version: 1.0
	 * LastModified: Dec 25 1999
	 * This library is free.  You can redistribute it and/or modify it.
	 */
	// -- Masanao Izumo Copyright 1999 "free"
	// Modified to add support for Binary Array for Encoding.js

	var base64EncodeChars = [
	  65,  66,  67,  68,  69,  70,  71,  72,  73,  74,  75,  76,  77,
	  78,  79,  80,  81,  82,  83,  84,  85,  86,  87,  88,  89,  90,
	  97,  98,  99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109,
	 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122,
	  48,  49,  50,  51,  52,  53,  54,  55,  56,  57,  43,  47
	];

	var base64DecodeChars = [
	  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
	  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
	  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
	  52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
	  -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
	  15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
	  -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
	  41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
	];

	var base64EncodePadding = '='.charCodeAt(0);


	function base64encode(data) {
	  var out, i, len;
	  var c1, c2, c3;

	  len = data && data.length;
	  i = 0;
	  out = [];

	  while (i < len) {
	    c1 = data[i++];
	    if (i == len) {
	      out[out.length] = base64EncodeChars[c1 >> 2];
	      out[out.length] = base64EncodeChars[(c1 & 0x3) << 4];
	      out[out.length] = base64EncodePadding;
	      out[out.length] = base64EncodePadding;
	      break;
	    }

	    c2 = data[i++];
	    if (i == len) {
	      out[out.length] = base64EncodeChars[c1 >> 2];
	      out[out.length] = base64EncodeChars[((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4)];
	      out[out.length] = base64EncodeChars[(c2 & 0xF) << 2];
	      out[out.length] = base64EncodePadding;
	      break;
	    }

	    c3 = data[i++];
	    out[out.length] = base64EncodeChars[c1 >> 2];
	    out[out.length] = base64EncodeChars[((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4)];
	    out[out.length] = base64EncodeChars[((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6)];
	    out[out.length] = base64EncodeChars[c3 & 0x3F];
	  }

	  return codeToString_fast(out);
	}


	function base64decode(str) {
	  var c1, c2, c3, c4;
	  var i, len, out;

	  len = str && str.length;
	  i = 0;
	  out = [];

	  while (i < len) {
	    /* c1 */
	    do {
	      c1 = base64DecodeChars[str.charCodeAt(i++) & 0xFF];
	    } while (i < len && c1 == -1);

	    if (c1 == -1) {
	      break;
	    }

	    /* c2 */
	    do {
	      c2 = base64DecodeChars[str.charCodeAt(i++) & 0xFF];
	    } while (i < len && c2 == -1);

	    if (c2 == -1) {
	      break;
	    }

	    out[out.length] = (c1 << 2) | ((c2 & 0x30) >> 4);

	    /* c3 */
	    do {
	      c3 = str.charCodeAt(i++) & 0xFF;
	      if (c3 == 61) {
	        return out;
	      }
	      c3 = base64DecodeChars[c3];
	    } while (i < len && c3 == -1);

	    if (c3 == -1) {
	      break;
	    }

	    out[out.length] = ((c2 & 0xF) << 4) | ((c3 & 0x3C) >> 2);

	    /* c4 */
	    do {
	      c4 = str.charCodeAt(i++) & 0xFF;
	      if (c4 == 61) {
	        return out;
	      }
	      c4 = base64DecodeChars[c4];
	    } while (i < len && c4 == -1);

	    if (c4 == -1) {
	      break;
	    }

	    out[out.length] = ((c3 & 0x03) << 6) | c4;
	  }

	  return out;
	}


	/**
	 * Encoding conversion table for UTF-8 to JIS.
	 *
	 * @ignore
	 */
	var UTF8_TO_JIS_TABLE = {
	0xEFBDA1:0x21,0xEFBDA2:0x22,0xEFBDA3:0x23,0xEFBDA4:0x24,0xEFBDA5:0x25,
	0xEFBDA6:0x26,0xEFBDA7:0x27,0xEFBDA8:0x28,0xEFBDA9:0x29,0xEFBDAA:0x2A,
	0xEFBDAB:0x2B,0xEFBDAC:0x2C,0xEFBDAD:0x2D,0xEFBDAE:0x2E,0xEFBDAF:0x2F,
	0xEFBDB0:0x30,0xEFBDB1:0x31,0xEFBDB2:0x32,0xEFBDB3:0x33,0xEFBDB4:0x34,
	0xEFBDB5:0x35,0xEFBDB6:0x36,0xEFBDB7:0x37,0xEFBDB8:0x38,0xEFBDB9:0x39,
	0xEFBDBA:0x3A,0xEFBDBB:0x3B,0xEFBDBC:0x3C,0xEFBDBD:0x3D,0xEFBDBE:0x3E,
	0xEFBDBF:0x3F,0xEFBE80:0x40,0xEFBE81:0x41,0xEFBE82:0x42,0xEFBE83:0x43,
	0xEFBE84:0x44,0xEFBE85:0x45,0xEFBE86:0x46,0xEFBE87:0x47,0xEFBE88:0x48,
	0xEFBE89:0x49,0xEFBE8A:0x4A,0xEFBE8B:0x4B,0xEFBE8C:0x4C,0xEFBE8D:0x4D,
	0xEFBE8E:0x4E,0xEFBE8F:0x4F,0xEFBE90:0x50,0xEFBE91:0x51,0xEFBE92:0x52,
	0xEFBE93:0x53,0xEFBE94:0x54,0xEFBE95:0x55,0xEFBE96:0x56,0xEFBE97:0x57,
	0xEFBE98:0x58,0xEFBE99:0x59,0xEFBE9A:0x5A,0xEFBE9B:0x5B,0xEFBE9C:0x5C,
	0xEFBE9D:0x5D,0xEFBE9E:0x5E,0xEFBE9F:0x5F,

	0xE291A0:0x2D21,0xE291A1:0x2D22,0xE291A2:0x2D23,0xE291A3:0x2D24,0xE291A4:0x2D25,
	0xE291A5:0x2D26,0xE291A6:0x2D27,0xE291A7:0x2D28,0xE291A8:0x2D29,0xE291A9:0x2D2A,
	0xE291AA:0x2D2B,0xE291AB:0x2D2C,0xE291AC:0x2D2D,0xE291AD:0x2D2E,0xE291AE:0x2D2F,
	0xE291AF:0x2D30,0xE291B0:0x2D31,0xE291B1:0x2D32,0xE291B2:0x2D33,0xE291B3:0x2D34,
	0xE285A0:0x2D35,0xE285A1:0x2D36,0xE285A2:0x2D37,0xE285A3:0x2D38,0xE285A4:0x2D39,
	0xE285A5:0x2D3A,0xE285A6:0x2D3B,0xE285A7:0x2D3C,0xE285A8:0x2D3D,0xE285A9:0x2D3E,
	0xE38D89:0x2D40,0xE38C94:0x2D41,0xE38CA2:0x2D42,0xE38D8D:0x2D43,0xE38C98:0x2D44,
	0xE38CA7:0x2D45,0xE38C83:0x2D46,0xE38CB6:0x2D47,0xE38D91:0x2D48,0xE38D97:0x2D49,
	0xE38C8D:0x2D4A,0xE38CA6:0x2D4B,0xE38CA3:0x2D4C,0xE38CAB:0x2D4D,0xE38D8A:0x2D4E,
	0xE38CBB:0x2D4F,0xE38E9C:0x2D50,0xE38E9D:0x2D51,0xE38E9E:0x2D52,0xE38E8E:0x2D53,
	0xE38E8F:0x2D54,0xE38F84:0x2D55,0xE38EA1:0x2D56,0xE38DBB:0x2D5F,0xE3809D:0x2D60,
	0xE3809F:0x2D61,0xE28496:0x2D62,0xE38F8D:0x2D63,0xE284A1:0x2D64,0xE38AA4:0x2D65,
	0xE38AA5:0x2D66,0xE38AA6:0x2D67,0xE38AA7:0x2D68,0xE38AA8:0x2D69,0xE388B1:0x2D6A,
	0xE388B2:0x2D6B,0xE388B9:0x2D6C,0xE38DBE:0x2D6D,0xE38DBD:0x2D6E,0xE38DBC:0x2D6F,
	0xE288AE:0x2D73,0xE28891:0x2D74,0xE2889F:0x2D78,0xE28ABF:0x2D79,

	0xE38080:0x2121,0xE38081:0x2122,0xE38082:0x2123,0xEFBC8C:0x2124,0xEFBC8E:0x2125,
	0xE383BB:0x2126,0xEFBC9A:0x2127,0xEFBC9B:0x2128,0xEFBC9F:0x2129,0xEFBC81:0x212A,
	0xE3829B:0x212B,0xE3829C:0x212C,0xC2B4:0x212D,0xEFBD80:0x212E,0xC2A8:0x212F,
	0xEFBCBE:0x2130,0xEFBFA3:0x2131,0xEFBCBF:0x2132,0xE383BD:0x2133,0xE383BE:0x2134,
	0xE3829D:0x2135,0xE3829E:0x2136,0xE38083:0x2137,0xE4BB9D:0x2138,0xE38085:0x2139,
	0xE38086:0x213A,0xE38087:0x213B,0xE383BC:0x213C,0xE28095:0x213D,0xE28090:0x213E,
	0xEFBC8F:0x213F,0xEFBCBC:0x2140,0xEFBD9E:0x2141,0xE28096:0x2142,0xEFBD9C:0x2143,
	0xE280A6:0x2144,0xE280A5:0x2145,0xE28098:0x2146,0xE28099:0x2147,0xE2809C:0x2148,
	0xE2809D:0x2149,0xEFBC88:0x214A,0xEFBC89:0x214B,0xE38094:0x214C,0xE38095:0x214D,
	0xEFBCBB:0x214E,0xEFBCBD:0x214F,0xEFBD9B:0x2150,0xEFBD9D:0x2151,0xE38088:0x2152,
	0xE38089:0x2153,0xE3808A:0x2154,0xE3808B:0x2155,0xE3808C:0x2156,0xE3808D:0x2157,
	0xE3808E:0x2158,0xE3808F:0x2159,0xE38090:0x215A,0xE38091:0x215B,0xEFBC8B:0x215C,
	0xEFBC8D:0x215D,0xC2B1:0x215E,0xC397:0x215F,0xC3B7:0x2160,0xEFBC9D:0x2161,
	0xE289A0:0x2162,0xEFBC9C:0x2163,0xEFBC9E:0x2164,0xE289A6:0x2165,0xE289A7:0x2166,
	0xE2889E:0x2167,0xE288B4:0x2168,0xE29982:0x2169,0xE29980:0x216A,0xC2B0:0x216B,
	0xE280B2:0x216C,0xE280B3:0x216D,0xE28483:0x216E,0xEFBFA5:0x216F,0xEFBC84:0x2170,
	0xEFBFA0:0x2171,0xEFBFA1:0x2172,0xEFBC85:0x2173,0xEFBC83:0x2174,0xEFBC86:0x2175,
	0xEFBC8A:0x2176,0xEFBCA0:0x2177,0xC2A7:0x2178,0xE29886:0x2179,0xE29885:0x217A,
	0xE2978B:0x217B,0xE2978F:0x217C,0xE2978E:0x217D,0xE29787:0x217E,0xE29786:0x2221,
	0xE296A1:0x2222,0xE296A0:0x2223,0xE296B3:0x2224,0xE296B2:0x2225,0xE296BD:0x2226,
	0xE296BC:0x2227,0xE280BB:0x2228,0xE38092:0x2229,0xE28692:0x222A,0xE28690:0x222B,
	0xE28691:0x222C,0xE28693:0x222D,0xE38093:0x222E,0xE28888:0x223A,0xE2888B:0x223B,
	0xE28A86:0x223C,0xE28A87:0x223D,0xE28A82:0x223E,0xE28A83:0x223F,0xE288AA:0x2240,
	0xE288A9:0x2241,0xE288A7:0x224A,0xE288A8:0x224B,0xC2AC:0x224C,0xE28792:0x224D,
	0xE28794:0x224E,0xE28880:0x224F,0xE28883:0x2250,0xE288A0:0x225C,0xE28AA5:0x225D,
	0xE28C92:0x225E,0xE28882:0x225F,0xE28887:0x2260,0xE289A1:0x2261,0xE28992:0x2262,
	0xE289AA:0x2263,0xE289AB:0x2264,0xE2889A:0x2265,0xE288BD:0x2266,0xE2889D:0x2267,
	0xE288B5:0x2268,0xE288AB:0x2269,0xE288AC:0x226A,0xE284AB:0x2272,0xE280B0:0x2273,
	0xE299AF:0x2274,0xE299AD:0x2275,0xE299AA:0x2276,0xE280A0:0x2277,0xE280A1:0x2278,
	0xC2B6:0x2279,0xE297AF:0x227E,0xEFBC90:0x2330,0xEFBC91:0x2331,0xEFBC92:0x2332,
	0xEFBC93:0x2333,0xEFBC94:0x2334,0xEFBC95:0x2335,0xEFBC96:0x2336,0xEFBC97:0x2337,
	0xEFBC98:0x2338,0xEFBC99:0x2339,0xEFBCA1:0x2341,0xEFBCA2:0x2342,0xEFBCA3:0x2343,
	0xEFBCA4:0x2344,0xEFBCA5:0x2345,0xEFBCA6:0x2346,0xEFBCA7:0x2347,0xEFBCA8:0x2348,
	0xEFBCA9:0x2349,0xEFBCAA:0x234A,0xEFBCAB:0x234B,0xEFBCAC:0x234C,0xEFBCAD:0x234D,
	0xEFBCAE:0x234E,0xEFBCAF:0x234F,0xEFBCB0:0x2350,0xEFBCB1:0x2351,0xEFBCB2:0x2352,
	0xEFBCB3:0x2353,0xEFBCB4:0x2354,0xEFBCB5:0x2355,0xEFBCB6:0x2356,0xEFBCB7:0x2357,
	0xEFBCB8:0x2358,0xEFBCB9:0x2359,0xEFBCBA:0x235A,0xEFBD81:0x2361,0xEFBD82:0x2362,
	0xEFBD83:0x2363,0xEFBD84:0x2364,0xEFBD85:0x2365,0xEFBD86:0x2366,0xEFBD87:0x2367,
	0xEFBD88:0x2368,0xEFBD89:0x2369,0xEFBD8A:0x236A,0xEFBD8B:0x236B,0xEFBD8C:0x236C,
	0xEFBD8D:0x236D,0xEFBD8E:0x236E,0xEFBD8F:0x236F,0xEFBD90:0x2370,0xEFBD91:0x2371,
	0xEFBD92:0x2372,0xEFBD93:0x2373,0xEFBD94:0x2374,0xEFBD95:0x2375,0xEFBD96:0x2376,
	0xEFBD97:0x2377,0xEFBD98:0x2378,0xEFBD99:0x2379,0xEFBD9A:0x237A,0xE38181:0x2421,
	0xE38182:0x2422,0xE38183:0x2423,0xE38184:0x2424,0xE38185:0x2425,0xE38186:0x2426,
	0xE38187:0x2427,0xE38188:0x2428,0xE38189:0x2429,0xE3818A:0x242A,0xE3818B:0x242B,
	0xE3818C:0x242C,0xE3818D:0x242D,0xE3818E:0x242E,0xE3818F:0x242F,0xE38190:0x2430,
	0xE38191:0x2431,0xE38192:0x2432,0xE38193:0x2433,0xE38194:0x2434,0xE38195:0x2435,
	0xE38196:0x2436,0xE38197:0x2437,0xE38198:0x2438,0xE38199:0x2439,0xE3819A:0x243A,
	0xE3819B:0x243B,0xE3819C:0x243C,0xE3819D:0x243D,0xE3819E:0x243E,0xE3819F:0x243F,
	0xE381A0:0x2440,0xE381A1:0x2441,0xE381A2:0x2442,0xE381A3:0x2443,0xE381A4:0x2444,
	0xE381A5:0x2445,0xE381A6:0x2446,0xE381A7:0x2447,0xE381A8:0x2448,0xE381A9:0x2449,
	0xE381AA:0x244A,0xE381AB:0x244B,0xE381AC:0x244C,0xE381AD:0x244D,0xE381AE:0x244E,
	0xE381AF:0x244F,0xE381B0:0x2450,0xE381B1:0x2451,0xE381B2:0x2452,0xE381B3:0x2453,
	0xE381B4:0x2454,0xE381B5:0x2455,0xE381B6:0x2456,0xE381B7:0x2457,0xE381B8:0x2458,
	0xE381B9:0x2459,0xE381BA:0x245A,0xE381BB:0x245B,0xE381BC:0x245C,0xE381BD:0x245D,
	0xE381BE:0x245E,0xE381BF:0x245F,0xE38280:0x2460,0xE38281:0x2461,0xE38282:0x2462,
	0xE38283:0x2463,0xE38284:0x2464,0xE38285:0x2465,0xE38286:0x2466,0xE38287:0x2467,
	0xE38288:0x2468,0xE38289:0x2469,0xE3828A:0x246A,0xE3828B:0x246B,0xE3828C:0x246C,
	0xE3828D:0x246D,0xE3828E:0x246E,0xE3828F:0x246F,0xE38290:0x2470,0xE38291:0x2471,
	0xE38292:0x2472,0xE38293:0x2473,0xE382A1:0x2521,0xE382A2:0x2522,0xE382A3:0x2523,
	0xE382A4:0x2524,0xE382A5:0x2525,0xE382A6:0x2526,0xE382A7:0x2527,0xE382A8:0x2528,
	0xE382A9:0x2529,0xE382AA:0x252A,0xE382AB:0x252B,0xE382AC:0x252C,0xE382AD:0x252D,
	0xE382AE:0x252E,0xE382AF:0x252F,0xE382B0:0x2530,0xE382B1:0x2531,0xE382B2:0x2532,
	0xE382B3:0x2533,0xE382B4:0x2534,0xE382B5:0x2535,0xE382B6:0x2536,0xE382B7:0x2537,
	0xE382B8:0x2538,0xE382B9:0x2539,0xE382BA:0x253A,0xE382BB:0x253B,0xE382BC:0x253C,
	0xE382BD:0x253D,0xE382BE:0x253E,0xE382BF:0x253F,0xE38380:0x2540,0xE38381:0x2541,
	0xE38382:0x2542,0xE38383:0x2543,0xE38384:0x2544,0xE38385:0x2545,0xE38386:0x2546,
	0xE38387:0x2547,0xE38388:0x2548,0xE38389:0x2549,0xE3838A:0x254A,0xE3838B:0x254B,
	0xE3838C:0x254C,0xE3838D:0x254D,0xE3838E:0x254E,0xE3838F:0x254F,0xE38390:0x2550,
	0xE38391:0x2551,0xE38392:0x2552,0xE38393:0x2553,0xE38394:0x2554,0xE38395:0x2555,
	0xE38396:0x2556,0xE38397:0x2557,0xE38398:0x2558,0xE38399:0x2559,0xE3839A:0x255A,
	0xE3839B:0x255B,0xE3839C:0x255C,0xE3839D:0x255D,0xE3839E:0x255E,0xE3839F:0x255F,
	0xE383A0:0x2560,0xE383A1:0x2561,0xE383A2:0x2562,0xE383A3:0x2563,0xE383A4:0x2564,
	0xE383A5:0x2565,0xE383A6:0x2566,0xE383A7:0x2567,0xE383A8:0x2568,0xE383A9:0x2569,
	0xE383AA:0x256A,0xE383AB:0x256B,0xE383AC:0x256C,0xE383AD:0x256D,0xE383AE:0x256E,
	0xE383AF:0x256F,0xE383B0:0x2570,0xE383B1:0x2571,0xE383B2:0x2572,0xE383B3:0x2573,
	0xE383B4:0x2574,0xE383B5:0x2575,0xE383B6:0x2576,0xCE91:0x2621,0xCE92:0x2622,
	0xCE93:0x2623,0xCE94:0x2624,0xCE95:0x2625,0xCE96:0x2626,0xCE97:0x2627,
	0xCE98:0x2628,0xCE99:0x2629,0xCE9A:0x262A,0xCE9B:0x262B,0xCE9C:0x262C,
	0xCE9D:0x262D,0xCE9E:0x262E,0xCE9F:0x262F,0xCEA0:0x2630,0xCEA1:0x2631,
	0xCEA3:0x2632,0xCEA4:0x2633,0xCEA5:0x2634,0xCEA6:0x2635,0xCEA7:0x2636,
	0xCEA8:0x2637,0xCEA9:0x2638,0xCEB1:0x2641,0xCEB2:0x2642,0xCEB3:0x2643,
	0xCEB4:0x2644,0xCEB5:0x2645,0xCEB6:0x2646,0xCEB7:0x2647,0xCEB8:0x2648,
	0xCEB9:0x2649,0xCEBA:0x264A,0xCEBB:0x264B,0xCEBC:0x264C,0xCEBD:0x264D,
	0xCEBE:0x264E,0xCEBF:0x264F,0xCF80:0x2650,0xCF81:0x2651,0xCF83:0x2652,
	0xCF84:0x2653,0xCF85:0x2654,0xCF86:0x2655,0xCF87:0x2656,0xCF88:0x2657,
	0xCF89:0x2658,0xD090:0x2721,0xD091:0x2722,0xD092:0x2723,0xD093:0x2724,
	0xD094:0x2725,0xD095:0x2726,0xD081:0x2727,0xD096:0x2728,0xD097:0x2729,
	0xD098:0x272A,0xD099:0x272B,0xD09A:0x272C,0xD09B:0x272D,0xD09C:0x272E,
	0xD09D:0x272F,0xD09E:0x2730,0xD09F:0x2731,0xD0A0:0x2732,0xD0A1:0x2733,
	0xD0A2:0x2734,0xD0A3:0x2735,0xD0A4:0x2736,0xD0A5:0x2737,0xD0A6:0x2738,
	0xD0A7:0x2739,0xD0A8:0x273A,0xD0A9:0x273B,0xD0AA:0x273C,0xD0AB:0x273D,
	0xD0AC:0x273E,0xD0AD:0x273F,0xD0AE:0x2740,0xD0AF:0x2741,0xD0B0:0x2751,
	0xD0B1:0x2752,0xD0B2:0x2753,0xD0B3:0x2754,0xD0B4:0x2755,0xD0B5:0x2756,
	0xD191:0x2757,0xD0B6:0x2758,0xD0B7:0x2759,0xD0B8:0x275A,0xD0B9:0x275B,
	0xD0BA:0x275C,0xD0BB:0x275D,0xD0BC:0x275E,0xD0BD:0x275F,0xD0BE:0x2760,
	0xD0BF:0x2761,0xD180:0x2762,0xD181:0x2763,0xD182:0x2764,0xD183:0x2765,
	0xD184:0x2766,0xD185:0x2767,0xD186:0x2768,0xD187:0x2769,0xD188:0x276A,
	0xD189:0x276B,0xD18A:0x276C,0xD18B:0x276D,0xD18C:0x276E,0xD18D:0x276F,
	0xD18E:0x2770,0xD18F:0x2771,0xE29480:0x2821,0xE29482:0x2822,0xE2948C:0x2823,
	0xE29490:0x2824,0xE29498:0x2825,0xE29494:0x2826,0xE2949C:0x2827,0xE294AC:0x2828,
	0xE294A4:0x2829,0xE294B4:0x282A,0xE294BC:0x282B,0xE29481:0x282C,0xE29483:0x282D,
	0xE2948F:0x282E,0xE29493:0x282F,0xE2949B:0x2830,0xE29497:0x2831,0xE294A3:0x2832,
	0xE294B3:0x2833,0xE294AB:0x2834,0xE294BB:0x2835,0xE2958B:0x2836,0xE294A0:0x2837,
	0xE294AF:0x2838,0xE294A8:0x2839,0xE294B7:0x283A,0xE294BF:0x283B,0xE2949D:0x283C,
	0xE294B0:0x283D,0xE294A5:0x283E,0xE294B8:0x283F,0xE29582:0x2840,0xE4BA9C:0x3021,
	0xE59496:0x3022,0xE5A883:0x3023,0xE998BF:0x3024,0xE59380:0x3025,0xE6849B:0x3026,
	0xE68CA8:0x3027,0xE5A7B6:0x3028,0xE980A2:0x3029,0xE891B5:0x302A,0xE88C9C:0x302B,
	0xE7A990:0x302C,0xE682AA:0x302D,0xE68FA1:0x302E,0xE6B8A5:0x302F,0xE697AD:0x3030,
	0xE891A6:0x3031,0xE88AA6:0x3032,0xE9AFB5:0x3033,0xE6A293:0x3034,0xE59CA7:0x3035,
	0xE696A1:0x3036,0xE689B1:0x3037,0xE5AE9B:0x3038,0xE5A790:0x3039,0xE899BB:0x303A,
	0xE9A3B4:0x303B,0xE7B5A2:0x303C,0xE7B6BE:0x303D,0xE9AE8E:0x303E,0xE68896:0x303F,
	0xE7B29F:0x3040,0xE8A2B7:0x3041,0xE5AE89:0x3042,0xE5BAB5:0x3043,0xE68C89:0x3044,
	0xE69A97:0x3045,0xE6A188:0x3046,0xE99787:0x3047,0xE99E8D:0x3048,0xE69D8F:0x3049,
	0xE4BBA5:0x304A,0xE4BC8A:0x304B,0xE4BD8D:0x304C,0xE4BE9D:0x304D,0xE58189:0x304E,
	0xE59BB2:0x304F,0xE5A4B7:0x3050,0xE5A794:0x3051,0xE5A881:0x3052,0xE5B089:0x3053,
	0xE6839F:0x3054,0xE6848F:0x3055,0xE685B0:0x3056,0xE69893:0x3057,0xE6A485:0x3058,
	0xE782BA:0x3059,0xE7958F:0x305A,0xE795B0:0x305B,0xE7A7BB:0x305C,0xE7B6AD:0x305D,
	0xE7B7AF:0x305E,0xE88383:0x305F,0xE8908E:0x3060,0xE8A1A3:0x3061,0xE8AC82:0x3062,
	0xE98195:0x3063,0xE981BA:0x3064,0xE58CBB:0x3065,0xE4BA95:0x3066,0xE4BAA5:0x3067,
	0xE59F9F:0x3068,0xE882B2:0x3069,0xE98381:0x306A,0xE7A3AF:0x306B,0xE4B880:0x306C,
	0xE5A3B1:0x306D,0xE6BAA2:0x306E,0xE980B8:0x306F,0xE7A8B2:0x3070,0xE88CA8:0x3071,
	0xE88A8B:0x3072,0xE9B0AF:0x3073,0xE58581:0x3074,0xE58DB0:0x3075,0xE592BD:0x3076,
	0xE593A1:0x3077,0xE59BA0:0x3078,0xE5A7BB:0x3079,0xE5BC95:0x307A,0xE9A3B2:0x307B,
	0xE6B7AB:0x307C,0xE883A4:0x307D,0xE894AD:0x307E,0xE999A2:0x3121,0xE999B0:0x3122,
	0xE99AA0:0x3123,0xE99FBB:0x3124,0xE5908B:0x3125,0xE58FB3:0x3126,0xE5AE87:0x3127,
	0xE7838F:0x3128,0xE7BEBD:0x3129,0xE8BF82:0x312A,0xE99BA8:0x312B,0xE58DAF:0x312C,
	0xE9B59C:0x312D,0xE7AABA:0x312E,0xE4B891:0x312F,0xE7A293:0x3130,0xE887BC:0x3131,
	0xE6B8A6:0x3132,0xE59898:0x3133,0xE59484:0x3134,0xE6AC9D:0x3135,0xE8949A:0x3136,
	0xE9B0BB:0x3137,0xE5A7A5:0x3138,0xE58EA9:0x3139,0xE6B5A6:0x313A,0xE7939C:0x313B,
	0xE9968F:0x313C,0xE59982:0x313D,0xE4BA91:0x313E,0xE9818B:0x313F,0xE99BB2:0x3140,
	0xE88D8F:0x3141,0xE9A48C:0x3142,0xE58FA1:0x3143,0xE596B6:0x3144,0xE5ACB0:0x3145,
	0xE5BDB1:0x3146,0xE698A0:0x3147,0xE69BB3:0x3148,0xE6A084:0x3149,0xE6B0B8:0x314A,
	0xE6B3B3:0x314B,0xE6B4A9:0x314C,0xE7919B:0x314D,0xE79B88:0x314E,0xE7A98E:0x314F,
	0xE9A0B4:0x3150,0xE88BB1:0x3151,0xE8A19B:0x3152,0xE8A9A0:0x3153,0xE98BAD:0x3154,
	0xE6B6B2:0x3155,0xE796AB:0x3156,0xE79B8A:0x3157,0xE9A785:0x3158,0xE682A6:0x3159,
	0xE8AC81:0x315A,0xE8B68A:0x315B,0xE996B2:0x315C,0xE6A68E:0x315D,0xE58EAD:0x315E,
	0xE58686:0x315F,0xE59C92:0x3160,0xE5A0B0:0x3161,0xE5A584:0x3162,0xE5AEB4:0x3163,
	0xE5BBB6:0x3164,0xE680A8:0x3165,0xE68EA9:0x3166,0xE68FB4:0x3167,0xE6B2BF:0x3168,
	0xE6BC94:0x3169,0xE7828E:0x316A,0xE78494:0x316B,0xE78599:0x316C,0xE78795:0x316D,
	0xE78CBF:0x316E,0xE7B881:0x316F,0xE889B6:0x3170,0xE88B91:0x3171,0xE89697:0x3172,
	0xE981A0:0x3173,0xE9899B:0x3174,0xE9B49B:0x3175,0xE5A1A9:0x3176,0xE696BC:0x3177,
	0xE6B19A:0x3178,0xE794A5:0x3179,0xE587B9:0x317A,0xE5A4AE:0x317B,0xE5A5A5:0x317C,
	0xE5BE80:0x317D,0xE5BF9C:0x317E,0xE68ABC:0x3221,0xE697BA:0x3222,0xE6A8AA:0x3223,
	0xE6ACA7:0x3224,0xE6AEB4:0x3225,0xE78E8B:0x3226,0xE7BF81:0x3227,0xE8A596:0x3228,
	0xE9B4AC:0x3229,0xE9B48E:0x322A,0xE9BB84:0x322B,0xE5B2A1:0x322C,0xE6B296:0x322D,
	0xE88DBB:0x322E,0xE58484:0x322F,0xE5B18B:0x3230,0xE686B6:0x3231,0xE88786:0x3232,
	0xE6A1B6:0x3233,0xE789A1:0x3234,0xE4B999:0x3235,0xE4BFBA:0x3236,0xE58DB8:0x3237,
	0xE681A9:0x3238,0xE6B8A9:0x3239,0xE7A98F:0x323A,0xE99FB3:0x323B,0xE4B88B:0x323C,
	0xE58C96:0x323D,0xE4BBAE:0x323E,0xE4BD95:0x323F,0xE4BCBD:0x3240,0xE4BEA1:0x3241,
	0xE4BDB3:0x3242,0xE58AA0:0x3243,0xE58FAF:0x3244,0xE59889:0x3245,0xE5A48F:0x3246,
	0xE5AB81:0x3247,0xE5AEB6:0x3248,0xE5AFA1:0x3249,0xE7A791:0x324A,0xE69A87:0x324B,
	0xE69E9C:0x324C,0xE69EB6:0x324D,0xE6AD8C:0x324E,0xE6B2B3:0x324F,0xE781AB:0x3250,
	0xE78F82:0x3251,0xE7A68D:0x3252,0xE7A6BE:0x3253,0xE7A8BC:0x3254,0xE7AE87:0x3255,
	0xE88AB1:0x3256,0xE88B9B:0x3257,0xE88C84:0x3258,0xE88DB7:0x3259,0xE88FAF:0x325A,
	0xE88F93:0x325B,0xE89DA6:0x325C,0xE8AAB2:0x325D,0xE598A9:0x325E,0xE8B2A8:0x325F,
	0xE8BFA6:0x3260,0xE9818E:0x3261,0xE99C9E:0x3262,0xE89A8A:0x3263,0xE4BF84:0x3264,
	0xE5B3A8:0x3265,0xE68891:0x3266,0xE78999:0x3267,0xE794BB:0x3268,0xE887A5:0x3269,
	0xE88ABD:0x326A,0xE89BBE:0x326B,0xE8B380:0x326C,0xE99B85:0x326D,0xE9A493:0x326E,
	0xE9A795:0x326F,0xE4BB8B:0x3270,0xE4BC9A:0x3271,0xE8A7A3:0x3272,0xE59B9E:0x3273,
	0xE5A18A:0x3274,0xE5A38A:0x3275,0xE5BBBB:0x3276,0xE5BFAB:0x3277,0xE680AA:0x3278,
	0xE68294:0x3279,0xE681A2:0x327A,0xE68790:0x327B,0xE68892:0x327C,0xE68B90:0x327D,
	0xE694B9:0x327E,0xE9AD81:0x3321,0xE699A6:0x3322,0xE6A2B0:0x3323,0xE6B5B7:0x3324,
	0xE781B0:0x3325,0xE7958C:0x3326,0xE79A86:0x3327,0xE7B5B5:0x3328,0xE88AA5:0x3329,
	0xE89FB9:0x332A,0xE9968B:0x332B,0xE99A8E:0x332C,0xE8B29D:0x332D,0xE587B1:0x332E,
	0xE58ABE:0x332F,0xE5A496:0x3330,0xE592B3:0x3331,0xE5AEB3:0x3332,0xE5B496:0x3333,
	0xE685A8:0x3334,0xE6A682:0x3335,0xE6B6AF:0x3336,0xE7A28D:0x3337,0xE8938B:0x3338,
	0xE8A197:0x3339,0xE8A9B2:0x333A,0xE98EA7:0x333B,0xE9AAB8:0x333C,0xE6B5AC:0x333D,
	0xE9A6A8:0x333E,0xE89B99:0x333F,0xE59EA3:0x3340,0xE69FBF:0x3341,0xE89B8E:0x3342,
	0xE9888E:0x3343,0xE58A83:0x3344,0xE59A87:0x3345,0xE59084:0x3346,0xE5BB93:0x3347,
	0xE68BA1:0x3348,0xE692B9:0x3349,0xE6A0BC:0x334A,0xE6A0B8:0x334B,0xE6AEBB:0x334C,
	0xE78DB2:0x334D,0xE7A2BA:0x334E,0xE7A9AB:0x334F,0xE8A69A:0x3350,0xE8A792:0x3351,
	0xE8B5AB:0x3352,0xE8BC83:0x3353,0xE983AD:0x3354,0xE996A3:0x3355,0xE99A94:0x3356,
	0xE99DA9:0x3357,0xE5ADA6:0x3358,0xE5B2B3:0x3359,0xE6A5BD:0x335A,0xE9A18D:0x335B,
	0xE9A18E:0x335C,0xE68E9B:0x335D,0xE7ACA0:0x335E,0xE6A8AB:0x335F,0xE6A9BF:0x3360,
	0xE6A2B6:0x3361,0xE9B08D:0x3362,0xE6BD9F:0x3363,0xE589B2:0x3364,0xE5969D:0x3365,
	0xE681B0:0x3366,0xE68BAC:0x3367,0xE6B4BB:0x3368,0xE6B887:0x3369,0xE6BB91:0x336A,
	0xE8919B:0x336B,0xE8A490:0x336C,0xE8BD84:0x336D,0xE4B894:0x336E,0xE9B0B9:0x336F,
	0xE58FB6:0x3370,0xE6A49B:0x3371,0xE6A8BA:0x3372,0xE99E84:0x3373,0xE6A0AA:0x3374,
	0xE5859C:0x3375,0xE7AB83:0x3376,0xE892B2:0x3377,0xE9879C:0x3378,0xE98E8C:0x3379,
	0xE5999B:0x337A,0xE9B4A8:0x337B,0xE6A0A2:0x337C,0xE88C85:0x337D,0xE890B1:0x337E,
	0xE7B2A5:0x3421,0xE58888:0x3422,0xE88B85:0x3423,0xE793A6:0x3424,0xE4B9BE:0x3425,
	0xE4BE83:0x3426,0xE586A0:0x3427,0xE5AF92:0x3428,0xE5888A:0x3429,0xE58B98:0x342A,
	0xE58BA7:0x342B,0xE5B7BB:0x342C,0xE5969A:0x342D,0xE5A0AA:0x342E,0xE5A7A6:0x342F,
	0xE5AE8C:0x3430,0xE5AE98:0x3431,0xE5AF9B:0x3432,0xE5B9B2:0x3433,0xE5B9B9:0x3434,
	0xE682A3:0x3435,0xE6849F:0x3436,0xE685A3:0x3437,0xE686BE:0x3438,0xE68F9B:0x3439,
	0xE695A2:0x343A,0xE69F91:0x343B,0xE6A193:0x343C,0xE6A3BA:0x343D,0xE6ACBE:0x343E,
	0xE6AD93:0x343F,0xE6B197:0x3440,0xE6BCA2:0x3441,0xE6BE97:0x3442,0xE6BD85:0x3443,
	0xE792B0:0x3444,0xE79498:0x3445,0xE79BA3:0x3446,0xE79C8B:0x3447,0xE7ABBF:0x3448,
	0xE7AEA1:0x3449,0xE7B0A1:0x344A,0xE7B7A9:0x344B,0xE7BCB6:0x344C,0xE7BFB0:0x344D,
	0xE8829D:0x344E,0xE889A6:0x344F,0xE88E9E:0x3450,0xE8A6B3:0x3451,0xE8AB8C:0x3452,
	0xE8B2AB:0x3453,0xE98284:0x3454,0xE99191:0x3455,0xE99693:0x3456,0xE99691:0x3457,
	0xE996A2:0x3458,0xE999A5:0x3459,0xE99F93:0x345A,0xE9A4A8:0x345B,0xE88898:0x345C,
	0xE4B8B8:0x345D,0xE590AB:0x345E,0xE5B2B8:0x345F,0xE5B78C:0x3460,0xE78EA9:0x3461,
	0xE7998C:0x3462,0xE79CBC:0x3463,0xE5B2A9:0x3464,0xE7BFAB:0x3465,0xE8B48B:0x3466,
	0xE99B81:0x3467,0xE9A091:0x3468,0xE9A194:0x3469,0xE9A198:0x346A,0xE4BC81:0x346B,
	0xE4BC8E:0x346C,0xE58DB1:0x346D,0xE5969C:0x346E,0xE599A8:0x346F,0xE59FBA:0x3470,
	0xE5A587:0x3471,0xE5AC89:0x3472,0xE5AF84:0x3473,0xE5B290:0x3474,0xE5B88C:0x3475,
	0xE5B9BE:0x3476,0xE5BF8C:0x3477,0xE68FAE:0x3478,0xE69CBA:0x3479,0xE69797:0x347A,
	0xE697A2:0x347B,0xE69C9F:0x347C,0xE6A38B:0x347D,0xE6A384:0x347E,0xE6A99F:0x3521,
	0xE5B8B0:0x3522,0xE6AF85:0x3523,0xE6B097:0x3524,0xE6B1BD:0x3525,0xE795BF:0x3526,
	0xE7A588:0x3527,0xE5ADA3:0x3528,0xE7A880:0x3529,0xE7B480:0x352A,0xE5BEBD:0x352B,
	0xE8A68F:0x352C,0xE8A898:0x352D,0xE8B2B4:0x352E,0xE8B5B7:0x352F,0xE8BB8C:0x3530,
	0xE8BC9D:0x3531,0xE9A3A2:0x3532,0xE9A88E:0x3533,0xE9ACBC:0x3534,0xE4BA80:0x3535,
	0xE581BD:0x3536,0xE58480:0x3537,0xE5A693:0x3538,0xE5AE9C:0x3539,0xE688AF:0x353A,
	0xE68A80:0x353B,0xE693AC:0x353C,0xE6ACBA:0x353D,0xE78AA0:0x353E,0xE79691:0x353F,
	0xE7A587:0x3540,0xE7BEA9:0x3541,0xE89FBB:0x3542,0xE8AABC:0x3543,0xE8ADB0:0x3544,
	0xE68EAC:0x3545,0xE88F8A:0x3546,0xE99EA0:0x3547,0xE59089:0x3548,0xE59083:0x3549,
	0xE596AB:0x354A,0xE6A194:0x354B,0xE6A998:0x354C,0xE8A9B0:0x354D,0xE7A0A7:0x354E,
	0xE69DB5:0x354F,0xE9BB8D:0x3550,0xE58DB4:0x3551,0xE5AEA2:0x3552,0xE8849A:0x3553,
	0xE89990:0x3554,0xE98086:0x3555,0xE4B898:0x3556,0xE4B985:0x3557,0xE4BB87:0x3558,
	0xE4BC91:0x3559,0xE58F8A:0x355A,0xE590B8:0x355B,0xE5AEAE:0x355C,0xE5BC93:0x355D,
	0xE680A5:0x355E,0xE69591:0x355F,0xE69CBD:0x3560,0xE6B182:0x3561,0xE6B1B2:0x3562,
	0xE6B3A3:0x3563,0xE781B8:0x3564,0xE79083:0x3565,0xE7A9B6:0x3566,0xE7AAAE:0x3567,
	0xE7AC88:0x3568,0xE7B49A:0x3569,0xE7B3BE:0x356A,0xE7B5A6:0x356B,0xE697A7:0x356C,
	0xE7899B:0x356D,0xE58EBB:0x356E,0xE5B185:0x356F,0xE5B7A8:0x3570,0xE68B92:0x3571,
	0xE68BA0:0x3572,0xE68C99:0x3573,0xE6B8A0:0x3574,0xE8999A:0x3575,0xE8A8B1:0x3576,
	0xE8B79D:0x3577,0xE98BB8:0x3578,0xE6BC81:0x3579,0xE7A6A6:0x357A,0xE9AD9A:0x357B,
	0xE4BAA8:0x357C,0xE4BAAB:0x357D,0xE4BAAC:0x357E,0xE4BE9B:0x3621,0xE4BEA0:0x3622,
	0xE58391:0x3623,0xE58587:0x3624,0xE7ABB6:0x3625,0xE585B1:0x3626,0xE587B6:0x3627,
	0xE58D94:0x3628,0xE58CA1:0x3629,0xE58DBF:0x362A,0xE58FAB:0x362B,0xE596AC:0x362C,
	0xE5A283:0x362D,0xE5B3A1:0x362E,0xE5BCB7:0x362F,0xE5BD8A:0x3630,0xE680AF:0x3631,
	0xE68190:0x3632,0xE681AD:0x3633,0xE68C9F:0x3634,0xE69599:0x3635,0xE6A98B:0x3636,
	0xE6B381:0x3637,0xE78B82:0x3638,0xE78BAD:0x3639,0xE79FAF:0x363A,0xE883B8:0x363B,
	0xE88485:0x363C,0xE88888:0x363D,0xE8958E:0x363E,0xE983B7:0x363F,0xE98FA1:0x3640,
	0xE99FBF:0x3641,0xE9A597:0x3642,0xE9A99A:0x3643,0xE4BBB0:0x3644,0xE5879D:0x3645,
	0xE5B0AD:0x3646,0xE69A81:0x3647,0xE6A5AD:0x3648,0xE5B180:0x3649,0xE69BB2:0x364A,
	0xE6A5B5:0x364B,0xE78E89:0x364C,0xE6A190:0x364D,0xE7B281:0x364E,0xE58385:0x364F,
	0xE58BA4:0x3650,0xE59D87:0x3651,0xE5B7BE:0x3652,0xE98CA6:0x3653,0xE696A4:0x3654,
	0xE6ACA3:0x3655,0xE6ACBD:0x3656,0xE790B4:0x3657,0xE7A681:0x3658,0xE7A6BD:0x3659,
	0xE7AD8B:0x365A,0xE7B78A:0x365B,0xE88AB9:0x365C,0xE88F8C:0x365D,0xE8A1BF:0x365E,
	0xE8A59F:0x365F,0xE8ACB9:0x3660,0xE8BF91:0x3661,0xE98791:0x3662,0xE5909F:0x3663,
	0xE98A80:0x3664,0xE4B99D:0x3665,0xE580B6:0x3666,0xE58FA5:0x3667,0xE58CBA:0x3668,
	0xE78B97:0x3669,0xE78E96:0x366A,0xE79FA9:0x366B,0xE88BA6:0x366C,0xE8BAAF:0x366D,
	0xE9A786:0x366E,0xE9A788:0x366F,0xE9A792:0x3670,0xE585B7:0x3671,0xE6849A:0x3672,
	0xE8999E:0x3673,0xE596B0:0x3674,0xE7A9BA:0x3675,0xE581B6:0x3676,0xE5AF93:0x3677,
	0xE98187:0x3678,0xE99A85:0x3679,0xE4B8B2:0x367A,0xE6AB9B:0x367B,0xE987A7:0x367C,
	0xE5B191:0x367D,0xE5B188:0x367E,0xE68E98:0x3721,0xE7AA9F:0x3722,0xE6B293:0x3723,
	0xE99DB4:0x3724,0xE8BDA1:0x3725,0xE7AAAA:0x3726,0xE7868A:0x3727,0xE99A88:0x3728,
	0xE7B282:0x3729,0xE6A097:0x372A,0xE7B9B0:0x372B,0xE6A191:0x372C,0xE98DAC:0x372D,
	0xE58BB2:0x372E,0xE5909B:0x372F,0xE896AB:0x3730,0xE8A893:0x3731,0xE7BEA4:0x3732,
	0xE8BB8D:0x3733,0xE983A1:0x3734,0xE58DA6:0x3735,0xE8A288:0x3736,0xE7A581:0x3737,
	0xE4BF82:0x3738,0xE582BE:0x3739,0xE58891:0x373A,0xE58584:0x373B,0xE59593:0x373C,
	0xE59CAD:0x373D,0xE78FAA:0x373E,0xE59E8B:0x373F,0xE5A591:0x3740,0xE5BDA2:0x3741,
	0xE5BE84:0x3742,0xE681B5:0x3743,0xE685B6:0x3744,0xE685A7:0x3745,0xE686A9:0x3746,
	0xE68EB2:0x3747,0xE690BA:0x3748,0xE695AC:0x3749,0xE699AF:0x374A,0xE6A182:0x374B,
	0xE6B893:0x374C,0xE795A6:0x374D,0xE7A8BD:0x374E,0xE7B3BB:0x374F,0xE7B58C:0x3750,
	0xE7B699:0x3751,0xE7B98B:0x3752,0xE7BDAB:0x3753,0xE88C8E:0x3754,0xE88D8A:0x3755,
	0xE89B8D:0x3756,0xE8A888:0x3757,0xE8A9A3:0x3758,0xE8ADA6:0x3759,0xE8BBBD:0x375A,
	0xE9A09A:0x375B,0xE9B68F:0x375C,0xE88AB8:0x375D,0xE8BF8E:0x375E,0xE9AFA8:0x375F,
	0xE58A87:0x3760,0xE6889F:0x3761,0xE69283:0x3762,0xE6BF80:0x3763,0xE99A99:0x3764,
	0xE6A181:0x3765,0xE58291:0x3766,0xE6ACA0:0x3767,0xE6B1BA:0x3768,0xE6BD94:0x3769,
	0xE7A9B4:0x376A,0xE7B590:0x376B,0xE8A180:0x376C,0xE8A8A3:0x376D,0xE69C88:0x376E,
	0xE4BBB6:0x376F,0xE580B9:0x3770,0xE580A6:0x3771,0xE581A5:0x3772,0xE585BC:0x3773,
	0xE588B8:0x3774,0xE589A3:0x3775,0xE596A7:0x3776,0xE59C8F:0x3777,0xE5A085:0x3778,
	0xE5AB8C:0x3779,0xE5BBBA:0x377A,0xE686B2:0x377B,0xE687B8:0x377C,0xE68BB3:0x377D,
	0xE68DB2:0x377E,0xE6A49C:0x3821,0xE6A8A9:0x3822,0xE789BD:0x3823,0xE78AAC:0x3824,
	0xE78CAE:0x3825,0xE7A094:0x3826,0xE7A1AF:0x3827,0xE7B5B9:0x3828,0xE79C8C:0x3829,
	0xE882A9:0x382A,0xE8A68B:0x382B,0xE8AC99:0x382C,0xE8B3A2:0x382D,0xE8BB92:0x382E,
	0xE981A3:0x382F,0xE98DB5:0x3830,0xE999BA:0x3831,0xE9A195:0x3832,0xE9A893:0x3833,
	0xE9B9B8:0x3834,0xE58583:0x3835,0xE58E9F:0x3836,0xE58EB3:0x3837,0xE5B9BB:0x3838,
	0xE5BCA6:0x3839,0xE6B89B:0x383A,0xE6BA90:0x383B,0xE78E84:0x383C,0xE78FBE:0x383D,
	0xE7B583:0x383E,0xE888B7:0x383F,0xE8A880:0x3840,0xE8ABBA:0x3841,0xE99990:0x3842,
	0xE4B98E:0x3843,0xE5808B:0x3844,0xE58FA4:0x3845,0xE591BC:0x3846,0xE59BBA:0x3847,
	0xE5A791:0x3848,0xE5ADA4:0x3849,0xE5B7B1:0x384A,0xE5BAAB:0x384B,0xE5BCA7:0x384C,
	0xE688B8:0x384D,0xE69585:0x384E,0xE69EAF:0x384F,0xE6B996:0x3850,0xE78B90:0x3851,
	0xE7B38A:0x3852,0xE8A2B4:0x3853,0xE882A1:0x3854,0xE883A1:0x3855,0xE88FB0:0x3856,
	0xE8998E:0x3857,0xE8AA87:0x3858,0xE8B7A8:0x3859,0xE988B7:0x385A,0xE99B87:0x385B,
	0xE9A1A7:0x385C,0xE9BC93:0x385D,0xE4BA94:0x385E,0xE4BA92:0x385F,0xE4BC8D:0x3860,
	0xE58D88:0x3861,0xE59189:0x3862,0xE590BE:0x3863,0xE5A8AF:0x3864,0xE5BE8C:0x3865,
	0xE5BEA1:0x3866,0xE6829F:0x3867,0xE6A2A7:0x3868,0xE6AA8E:0x3869,0xE7919A:0x386A,
	0xE7A281:0x386B,0xE8AA9E:0x386C,0xE8AAA4:0x386D,0xE8ADB7:0x386E,0xE98690:0x386F,
	0xE4B99E:0x3870,0xE9AF89:0x3871,0xE4BAA4:0x3872,0xE4BDBC:0x3873,0xE4BEAF:0x3874,
	0xE58099:0x3875,0xE58096:0x3876,0xE58589:0x3877,0xE585AC:0x3878,0xE58A9F:0x3879,
	0xE58AB9:0x387A,0xE58BBE:0x387B,0xE58E9A:0x387C,0xE58FA3:0x387D,0xE59091:0x387E,
	0xE5908E:0x3921,0xE59689:0x3922,0xE59D91:0x3923,0xE59EA2:0x3924,0xE5A5BD:0x3925,
	0xE5AD94:0x3926,0xE5AD9D:0x3927,0xE5AE8F:0x3928,0xE5B7A5:0x3929,0xE5B7A7:0x392A,
	0xE5B7B7:0x392B,0xE5B9B8:0x392C,0xE5BA83:0x392D,0xE5BA9A:0x392E,0xE5BAB7:0x392F,
	0xE5BC98:0x3930,0xE68192:0x3931,0xE6858C:0x3932,0xE68A97:0x3933,0xE68B98:0x3934,
	0xE68EA7:0x3935,0xE694BB:0x3936,0xE69882:0x3937,0xE69983:0x3938,0xE69BB4:0x3939,
	0xE69DAD:0x393A,0xE6A0A1:0x393B,0xE6A297:0x393C,0xE6A78B:0x393D,0xE6B19F:0x393E,
	0xE6B4AA:0x393F,0xE6B5A9:0x3940,0xE6B8AF:0x3941,0xE6BA9D:0x3942,0xE794B2:0x3943,
	0xE79A87:0x3944,0xE7A1AC:0x3945,0xE7A8BF:0x3946,0xE7B3A0:0x3947,0xE7B485:0x3948,
	0xE7B498:0x3949,0xE7B59E:0x394A,0xE7B6B1:0x394B,0xE88095:0x394C,0xE88083:0x394D,
	0xE882AF:0x394E,0xE882B1:0x394F,0xE88594:0x3950,0xE8868F:0x3951,0xE888AA:0x3952,
	0xE88D92:0x3953,0xE8A18C:0x3954,0xE8A1A1:0x3955,0xE8AC9B:0x3956,0xE8B2A2:0x3957,
	0xE8B3BC:0x3958,0xE9838A:0x3959,0xE985B5:0x395A,0xE989B1:0x395B,0xE7A0BF:0x395C,
	0xE98BBC:0x395D,0xE996A4:0x395E,0xE9998D:0x395F,0xE9A085:0x3960,0xE9A699:0x3961,
	0xE9AB98:0x3962,0xE9B4BB:0x3963,0xE5899B:0x3964,0xE58AAB:0x3965,0xE58FB7:0x3966,
	0xE59088:0x3967,0xE5A395:0x3968,0xE68BB7:0x3969,0xE6BFA0:0x396A,0xE8B1AA:0x396B,
	0xE8BD9F:0x396C,0xE9BAB9:0x396D,0xE5858B:0x396E,0xE588BB:0x396F,0xE5918A:0x3970,
	0xE59BBD:0x3971,0xE7A980:0x3972,0xE985B7:0x3973,0xE9B5A0:0x3974,0xE9BB92:0x3975,
	0xE78D84:0x3976,0xE6BC89:0x3977,0xE885B0:0x3978,0xE79491:0x3979,0xE5BFBD:0x397A,
	0xE6839A:0x397B,0xE9AAA8:0x397C,0xE78B9B:0x397D,0xE8BEBC:0x397E,0xE6ADA4:0x3A21,
	0xE9A083:0x3A22,0xE4BB8A:0x3A23,0xE59BB0:0x3A24,0xE59DA4:0x3A25,0xE5A2BE:0x3A26,
	0xE5A99A:0x3A27,0xE681A8:0x3A28,0xE68787:0x3A29,0xE6988F:0x3A2A,0xE69886:0x3A2B,
	0xE6A0B9:0x3A2C,0xE6A2B1:0x3A2D,0xE6B7B7:0x3A2E,0xE79795:0x3A2F,0xE7B4BA:0x3A30,
	0xE889AE:0x3A31,0xE9AD82:0x3A32,0xE4BA9B:0x3A33,0xE4BD90:0x3A34,0xE58F89:0x3A35,
	0xE59486:0x3A36,0xE5B5AF:0x3A37,0xE5B7A6:0x3A38,0xE5B7AE:0x3A39,0xE69FBB:0x3A3A,
	0xE6B299:0x3A3B,0xE791B3:0x3A3C,0xE7A082:0x3A3D,0xE8A990:0x3A3E,0xE98E96:0x3A3F,
	0xE8A39F:0x3A40,0xE59D90:0x3A41,0xE5BAA7:0x3A42,0xE68CAB:0x3A43,0xE582B5:0x3A44,
	0xE582AC:0x3A45,0xE5868D:0x3A46,0xE69C80:0x3A47,0xE59389:0x3A48,0xE5A19E:0x3A49,
	0xE5A6BB:0x3A4A,0xE5AEB0:0x3A4B,0xE5BDA9:0x3A4C,0xE6898D:0x3A4D,0xE68EA1:0x3A4E,
	0xE6A0BD:0x3A4F,0xE6ADB3:0x3A50,0xE6B888:0x3A51,0xE781BD:0x3A52,0xE98787:0x3A53,
	0xE78A80:0x3A54,0xE7A095:0x3A55,0xE7A0A6:0x3A56,0xE7A5AD:0x3A57,0xE6968E:0x3A58,
	0xE7B4B0:0x3A59,0xE88F9C:0x3A5A,0xE8A381:0x3A5B,0xE8BC89:0x3A5C,0xE99A9B:0x3A5D,
	0xE589A4:0x3A5E,0xE59CA8:0x3A5F,0xE69D90:0x3A60,0xE7BDAA:0x3A61,0xE8B2A1:0x3A62,
	0xE586B4:0x3A63,0xE59D82:0x3A64,0xE998AA:0x3A65,0xE5A0BA:0x3A66,0xE6A68A:0x3A67,
	0xE882B4:0x3A68,0xE592B2:0x3A69,0xE5B48E:0x3A6A,0xE59FBC:0x3A6B,0xE7A295:0x3A6C,
	0xE9B7BA:0x3A6D,0xE4BD9C:0x3A6E,0xE5898A:0x3A6F,0xE5928B:0x3A70,0xE690BE:0x3A71,
	0xE698A8:0x3A72,0xE69C94:0x3A73,0xE69FB5:0x3A74,0xE7AA84:0x3A75,0xE7AD96:0x3A76,
	0xE7B4A2:0x3A77,0xE98CAF:0x3A78,0xE6A19C:0x3A79,0xE9AEAD:0x3A7A,0xE7ACB9:0x3A7B,
	0xE58C99:0x3A7C,0xE5868A:0x3A7D,0xE588B7:0x3A7E,0xE5AF9F:0x3B21,0xE68BB6:0x3B22,
	0xE692AE:0x3B23,0xE693A6:0x3B24,0xE69CAD:0x3B25,0xE6AEBA:0x3B26,0xE896A9:0x3B27,
	0xE99B91:0x3B28,0xE79A90:0x3B29,0xE9AF96:0x3B2A,0xE68D8C:0x3B2B,0xE98C86:0x3B2C,
	0xE9AEAB:0x3B2D,0xE79ABF:0x3B2E,0xE69992:0x3B2F,0xE4B889:0x3B30,0xE58298:0x3B31,
	0xE58F82:0x3B32,0xE5B1B1:0x3B33,0xE683A8:0x3B34,0xE69292:0x3B35,0xE695A3:0x3B36,
	0xE6A19F:0x3B37,0xE787A6:0x3B38,0xE78F8A:0x3B39,0xE794A3:0x3B3A,0xE7AE97:0x3B3B,
	0xE7BA82:0x3B3C,0xE89A95:0x3B3D,0xE8AE83:0x3B3E,0xE8B39B:0x3B3F,0xE985B8:0x3B40,
	0xE9A490:0x3B41,0xE696AC:0x3B42,0xE69AAB:0x3B43,0xE6AE8B:0x3B44,0xE4BB95:0x3B45,
	0xE4BB94:0x3B46,0xE4BCBA:0x3B47,0xE4BDBF:0x3B48,0xE588BA:0x3B49,0xE58FB8:0x3B4A,
	0xE58FB2:0x3B4B,0xE597A3:0x3B4C,0xE59B9B:0x3B4D,0xE5A3AB:0x3B4E,0xE5A78B:0x3B4F,
	0xE5A789:0x3B50,0xE5A7BF:0x3B51,0xE5AD90:0x3B52,0xE5B18D:0x3B53,0xE5B882:0x3B54,
	0xE5B8AB:0x3B55,0xE5BF97:0x3B56,0xE6809D:0x3B57,0xE68C87:0x3B58,0xE694AF:0x3B59,
	0xE5AD9C:0x3B5A,0xE696AF:0x3B5B,0xE696BD:0x3B5C,0xE697A8:0x3B5D,0xE69E9D:0x3B5E,
	0xE6ADA2:0x3B5F,0xE6ADBB:0x3B60,0xE6B08F:0x3B61,0xE78D85:0x3B62,0xE7A589:0x3B63,
	0xE7A781:0x3B64,0xE7B3B8:0x3B65,0xE7B499:0x3B66,0xE7B4AB:0x3B67,0xE882A2:0x3B68,
	0xE88482:0x3B69,0xE887B3:0x3B6A,0xE8A696:0x3B6B,0xE8A99E:0x3B6C,0xE8A9A9:0x3B6D,
	0xE8A9A6:0x3B6E,0xE8AA8C:0x3B6F,0xE8ABAE:0x3B70,0xE8B387:0x3B71,0xE8B39C:0x3B72,
	0xE99B8C:0x3B73,0xE9A3BC:0x3B74,0xE6ADAF:0x3B75,0xE4BA8B:0x3B76,0xE4BCBC:0x3B77,
	0xE4BE8D:0x3B78,0xE58590:0x3B79,0xE5AD97:0x3B7A,0xE5AFBA:0x3B7B,0xE68588:0x3B7C,
	0xE68C81:0x3B7D,0xE69982:0x3B7E,0xE6ACA1:0x3C21,0xE6BB8B:0x3C22,0xE6B2BB:0x3C23,
	0xE788BE:0x3C24,0xE792BD:0x3C25,0xE79794:0x3C26,0xE7A381:0x3C27,0xE7A4BA:0x3C28,
	0xE8808C:0x3C29,0xE880B3:0x3C2A,0xE887AA:0x3C2B,0xE89294:0x3C2C,0xE8BE9E:0x3C2D,
	0xE6B190:0x3C2E,0xE9B9BF:0x3C2F,0xE5BC8F:0x3C30,0xE8AD98:0x3C31,0xE9B4AB:0x3C32,
	0xE7ABBA:0x3C33,0xE8BBB8:0x3C34,0xE5AE8D:0x3C35,0xE99BAB:0x3C36,0xE4B883:0x3C37,
	0xE58FB1:0x3C38,0xE59FB7:0x3C39,0xE5A4B1:0x3C3A,0xE5AB89:0x3C3B,0xE5AEA4:0x3C3C,
	0xE68289:0x3C3D,0xE6B9BF:0x3C3E,0xE6BC86:0x3C3F,0xE796BE:0x3C40,0xE8B3AA:0x3C41,
	0xE5AE9F:0x3C42,0xE89480:0x3C43,0xE7AFA0:0x3C44,0xE581B2:0x3C45,0xE69FB4:0x3C46,
	0xE88A9D:0x3C47,0xE5B1A1:0x3C48,0xE8958A:0x3C49,0xE7B89E:0x3C4A,0xE8888E:0x3C4B,
	0xE58699:0x3C4C,0xE5B084:0x3C4D,0xE68DA8:0x3C4E,0xE8B5A6:0x3C4F,0xE6969C:0x3C50,
	0xE785AE:0x3C51,0xE7A4BE:0x3C52,0xE7B497:0x3C53,0xE88085:0x3C54,0xE8AC9D:0x3C55,
	0xE8BB8A:0x3C56,0xE981AE:0x3C57,0xE89B87:0x3C58,0xE982AA:0x3C59,0xE5809F:0x3C5A,
	0xE58BBA:0x3C5B,0xE5B0BA:0x3C5C,0xE69D93:0x3C5D,0xE781BC:0x3C5E,0xE788B5:0x3C5F,
	0xE9858C:0x3C60,0xE98788:0x3C61,0xE98CAB:0x3C62,0xE88BA5:0x3C63,0xE5AF82:0x3C64,
	0xE5BCB1:0x3C65,0xE683B9:0x3C66,0xE4B8BB:0x3C67,0xE58F96:0x3C68,0xE5AE88:0x3C69,
	0xE6898B:0x3C6A,0xE69CB1:0x3C6B,0xE6AE8A:0x3C6C,0xE78BA9:0x3C6D,0xE78FA0:0x3C6E,
	0xE7A8AE:0x3C6F,0xE885AB:0x3C70,0xE8B6A3:0x3C71,0xE98592:0x3C72,0xE9A696:0x3C73,
	0xE58492:0x3C74,0xE58F97:0x3C75,0xE591AA:0x3C76,0xE5AFBF:0x3C77,0xE68E88:0x3C78,
	0xE6A8B9:0x3C79,0xE7B6AC:0x3C7A,0xE99C80:0x3C7B,0xE59B9A:0x3C7C,0xE58F8E:0x3C7D,
	0xE591A8:0x3C7E,0xE5AE97:0x3D21,0xE5B0B1:0x3D22,0xE5B79E:0x3D23,0xE4BFAE:0x3D24,
	0xE68481:0x3D25,0xE68BBE:0x3D26,0xE6B4B2:0x3D27,0xE7A780:0x3D28,0xE7A78B:0x3D29,
	0xE7B582:0x3D2A,0xE7B98D:0x3D2B,0xE7BF92:0x3D2C,0xE887AD:0x3D2D,0xE8889F:0x3D2E,
	0xE89290:0x3D2F,0xE8A186:0x3D30,0xE8A5B2:0x3D31,0xE8AE90:0x3D32,0xE8B9B4:0x3D33,
	0xE8BCAF:0x3D34,0xE980B1:0x3D35,0xE9858B:0x3D36,0xE985AC:0x3D37,0xE99B86:0x3D38,
	0xE9869C:0x3D39,0xE4BB80:0x3D3A,0xE4BD8F:0x3D3B,0xE58585:0x3D3C,0xE58D81:0x3D3D,
	0xE5BE93:0x3D3E,0xE6888E:0x3D3F,0xE69F94:0x3D40,0xE6B181:0x3D41,0xE6B88B:0x3D42,
	0xE78DA3:0x3D43,0xE7B8A6:0x3D44,0xE9878D:0x3D45,0xE98A83:0x3D46,0xE58F94:0x3D47,
	0xE5A499:0x3D48,0xE5AEBF:0x3D49,0xE6B791:0x3D4A,0xE7A59D:0x3D4B,0xE7B8AE:0x3D4C,
	0xE7B29B:0x3D4D,0xE5A1BE:0x3D4E,0xE7869F:0x3D4F,0xE587BA:0x3D50,0xE8A193:0x3D51,
	0xE8BFB0:0x3D52,0xE4BF8A:0x3D53,0xE5B3BB:0x3D54,0xE698A5:0x3D55,0xE79EAC:0x3D56,
	0xE7ABA3:0x3D57,0xE8889C:0x3D58,0xE9A7BF:0x3D59,0xE58786:0x3D5A,0xE5BEAA:0x3D5B,
	0xE697AC:0x3D5C,0xE6A5AF:0x3D5D,0xE6AE89:0x3D5E,0xE6B7B3:0x3D5F,0xE6BA96:0x3D60,
	0xE6BDA4:0x3D61,0xE79BBE:0x3D62,0xE7B494:0x3D63,0xE5B7A1:0x3D64,0xE981B5:0x3D65,
	0xE98687:0x3D66,0xE9A086:0x3D67,0xE587A6:0x3D68,0xE5889D:0x3D69,0xE68980:0x3D6A,
	0xE69A91:0x3D6B,0xE69B99:0x3D6C,0xE6B89A:0x3D6D,0xE5BAB6:0x3D6E,0xE7B792:0x3D6F,
	0xE7BDB2:0x3D70,0xE69BB8:0x3D71,0xE896AF:0x3D72,0xE897B7:0x3D73,0xE8ABB8:0x3D74,
	0xE58AA9:0x3D75,0xE58F99:0x3D76,0xE5A5B3:0x3D77,0xE5BA8F:0x3D78,0xE5BE90:0x3D79,
	0xE68195:0x3D7A,0xE98BA4:0x3D7B,0xE999A4:0x3D7C,0xE582B7:0x3D7D,0xE5849F:0x3D7E,
	0xE58B9D:0x3E21,0xE58CA0:0x3E22,0xE58D87:0x3E23,0xE58FAC:0x3E24,0xE593A8:0x3E25,
	0xE59586:0x3E26,0xE594B1:0x3E27,0xE59897:0x3E28,0xE5A5A8:0x3E29,0xE5A6BE:0x3E2A,
	0xE5A8BC:0x3E2B,0xE5AEB5:0x3E2C,0xE5B086:0x3E2D,0xE5B08F:0x3E2E,0xE5B091:0x3E2F,
	0xE5B09A:0x3E30,0xE5BA84:0x3E31,0xE5BA8A:0x3E32,0xE5BBA0:0x3E33,0xE5BDB0:0x3E34,
	0xE689BF:0x3E35,0xE68A84:0x3E36,0xE68B9B:0x3E37,0xE68E8C:0x3E38,0xE68DB7:0x3E39,
	0xE69887:0x3E3A,0xE6988C:0x3E3B,0xE698AD:0x3E3C,0xE699B6:0x3E3D,0xE69DBE:0x3E3E,
	0xE6A2A2:0x3E3F,0xE6A89F:0x3E40,0xE6A8B5:0x3E41,0xE6B2BC:0x3E42,0xE6B688:0x3E43,
	0xE6B889:0x3E44,0xE6B998:0x3E45,0xE784BC:0x3E46,0xE784A6:0x3E47,0xE785A7:0x3E48,
	0xE79787:0x3E49,0xE79C81:0x3E4A,0xE7A19D:0x3E4B,0xE7A481:0x3E4C,0xE7A5A5:0x3E4D,
	0xE7A7B0:0x3E4E,0xE7ABA0:0x3E4F,0xE7AC91:0x3E50,0xE7B2A7:0x3E51,0xE7B4B9:0x3E52,
	0xE88296:0x3E53,0xE88F96:0x3E54,0xE8928B:0x3E55,0xE89589:0x3E56,0xE8A19D:0x3E57,
	0xE8A3B3:0x3E58,0xE8A89F:0x3E59,0xE8A8BC:0x3E5A,0xE8A994:0x3E5B,0xE8A9B3:0x3E5C,
	0xE8B1A1:0x3E5D,0xE8B39E:0x3E5E,0xE986A4:0x3E5F,0xE989A6:0x3E60,0xE98DBE:0x3E61,
	0xE99098:0x3E62,0xE99A9C:0x3E63,0xE99E98:0x3E64,0xE4B88A:0x3E65,0xE4B888:0x3E66,
	0xE4B89E:0x3E67,0xE4B997:0x3E68,0xE58697:0x3E69,0xE589B0:0x3E6A,0xE59F8E:0x3E6B,
	0xE5A0B4:0x3E6C,0xE5A38C:0x3E6D,0xE5ACA2:0x3E6E,0xE5B8B8:0x3E6F,0xE68385:0x3E70,
	0xE693BE:0x3E71,0xE69DA1:0x3E72,0xE69D96:0x3E73,0xE6B584:0x3E74,0xE78AB6:0x3E75,
	0xE795B3:0x3E76,0xE7A9A3:0x3E77,0xE892B8:0x3E78,0xE8ADB2:0x3E79,0xE986B8:0x3E7A,
	0xE98CA0:0x3E7B,0xE598B1:0x3E7C,0xE59FB4:0x3E7D,0xE9A3BE:0x3E7E,0xE68BAD:0x3F21,
	0xE6A48D:0x3F22,0xE6AE96:0x3F23,0xE787AD:0x3F24,0xE7B994:0x3F25,0xE881B7:0x3F26,
	0xE889B2:0x3F27,0xE8A7A6:0x3F28,0xE9A39F:0x3F29,0xE89D95:0x3F2A,0xE8BEB1:0x3F2B,
	0xE5B0BB:0x3F2C,0xE4BCB8:0x3F2D,0xE4BFA1:0x3F2E,0xE4BEB5:0x3F2F,0xE59487:0x3F30,
	0xE5A8A0:0x3F31,0xE5AF9D:0x3F32,0xE5AFA9:0x3F33,0xE5BF83:0x3F34,0xE6858E:0x3F35,
	0xE68CAF:0x3F36,0xE696B0:0x3F37,0xE6998B:0x3F38,0xE6A3AE:0x3F39,0xE6A69B:0x3F3A,
	0xE6B5B8:0x3F3B,0xE6B7B1:0x3F3C,0xE794B3:0x3F3D,0xE796B9:0x3F3E,0xE79C9F:0x3F3F,
	0xE7A59E:0x3F40,0xE7A7A6:0x3F41,0xE7B4B3:0x3F42,0xE887A3:0x3F43,0xE88AAF:0x3F44,
	0xE896AA:0x3F45,0xE8A6AA:0x3F46,0xE8A8BA:0x3F47,0xE8BAAB:0x3F48,0xE8BE9B:0x3F49,
	0xE980B2:0x3F4A,0xE9879D:0x3F4B,0xE99C87:0x3F4C,0xE4BABA:0x3F4D,0xE4BB81:0x3F4E,
	0xE58883:0x3F4F,0xE5A1B5:0x3F50,0xE5A3AC:0x3F51,0xE5B08B:0x3F52,0xE7949A:0x3F53,
	0xE5B0BD:0x3F54,0xE8858E:0x3F55,0xE8A88A:0x3F56,0xE8BF85:0x3F57,0xE999A3:0x3F58,
	0xE99DAD:0x3F59,0xE7ACA5:0x3F5A,0xE8AB8F:0x3F5B,0xE9A088:0x3F5C,0xE985A2:0x3F5D,
	0xE59BB3:0x3F5E,0xE58EA8:0x3F5F,0xE98097:0x3F60,0xE590B9:0x3F61,0xE59E82:0x3F62,
	0xE5B8A5:0x3F63,0xE68EA8:0x3F64,0xE6B0B4:0x3F65,0xE7828A:0x3F66,0xE79DA1:0x3F67,
	0xE7B28B:0x3F68,0xE7BFA0:0x3F69,0xE8A1B0:0x3F6A,0xE98182:0x3F6B,0xE98594:0x3F6C,
	0xE98C90:0x3F6D,0xE98C98:0x3F6E,0xE99A8F:0x3F6F,0xE7919E:0x3F70,0xE9AB84:0x3F71,
	0xE5B487:0x3F72,0xE5B5A9:0x3F73,0xE695B0:0x3F74,0xE69EA2:0x3F75,0xE8B6A8:0x3F76,
	0xE99B9B:0x3F77,0xE68DAE:0x3F78,0xE69D89:0x3F79,0xE6A499:0x3F7A,0xE88F85:0x3F7B,
	0xE9A097:0x3F7C,0xE99B80:0x3F7D,0xE8A3BE:0x3F7E,0xE6BE84:0x4021,0xE691BA:0x4022,
	0xE5AFB8:0x4023,0xE4B896:0x4024,0xE780AC:0x4025,0xE7959D:0x4026,0xE698AF:0x4027,
	0xE58784:0x4028,0xE588B6:0x4029,0xE58BA2:0x402A,0xE5A793:0x402B,0xE5BE81:0x402C,
	0xE680A7:0x402D,0xE68890:0x402E,0xE694BF:0x402F,0xE695B4:0x4030,0xE6989F:0x4031,
	0xE699B4:0x4032,0xE6A3B2:0x4033,0xE6A096:0x4034,0xE6ADA3:0x4035,0xE6B885:0x4036,
	0xE789B2:0x4037,0xE7949F:0x4038,0xE79B9B:0x4039,0xE7B2BE:0x403A,0xE88196:0x403B,
	0xE5A3B0:0x403C,0xE8A3BD:0x403D,0xE8A5BF:0x403E,0xE8AAA0:0x403F,0xE8AA93:0x4040,
	0xE8AB8B:0x4041,0xE9809D:0x4042,0xE98692:0x4043,0xE99D92:0x4044,0xE99D99:0x4045,
	0xE69689:0x4046,0xE7A88E:0x4047,0xE88486:0x4048,0xE99ABB:0x4049,0xE5B8AD:0x404A,
	0xE6839C:0x404B,0xE6889A:0x404C,0xE696A5:0x404D,0xE69894:0x404E,0xE69E90:0x404F,
	0xE79FB3:0x4050,0xE7A98D:0x4051,0xE7B18D:0x4052,0xE7B8BE:0x4053,0xE8848A:0x4054,
	0xE8B2AC:0x4055,0xE8B5A4:0x4056,0xE8B7A1:0x4057,0xE8B99F:0x4058,0xE7A2A9:0x4059,
	0xE58887:0x405A,0xE68B99:0x405B,0xE68EA5:0x405C,0xE69182:0x405D,0xE68A98:0x405E,
	0xE8A8AD:0x405F,0xE7AA83:0x4060,0xE7AF80:0x4061,0xE8AAAC:0x4062,0xE99BAA:0x4063,
	0xE7B5B6:0x4064,0xE8888C:0x4065,0xE89D89:0x4066,0xE4BB99:0x4067,0xE58588:0x4068,
	0xE58D83:0x4069,0xE58DA0:0x406A,0xE5AEA3:0x406B,0xE5B082:0x406C,0xE5B096:0x406D,
	0xE5B79D:0x406E,0xE688A6:0x406F,0xE68987:0x4070,0xE692B0:0x4071,0xE6A093:0x4072,
	0xE6A0B4:0x4073,0xE6B389:0x4074,0xE6B585:0x4075,0xE6B497:0x4076,0xE69F93:0x4077,
	0xE6BD9C:0x4078,0xE7858E:0x4079,0xE785BD:0x407A,0xE6978B:0x407B,0xE7A9BF:0x407C,
	0xE7AEAD:0x407D,0xE7B79A:0x407E,0xE7B98A:0x4121,0xE7BEA8:0x4122,0xE885BA:0x4123,
	0xE8889B:0x4124,0xE888B9:0x4125,0xE896A6:0x4126,0xE8A9AE:0x4127,0xE8B38E:0x4128,
	0xE8B7B5:0x4129,0xE981B8:0x412A,0xE981B7:0x412B,0xE98AAD:0x412C,0xE98A91:0x412D,
	0xE99683:0x412E,0xE9AEAE:0x412F,0xE5898D:0x4130,0xE59684:0x4131,0xE6BCB8:0x4132,
	0xE784B6:0x4133,0xE585A8:0x4134,0xE7A685:0x4135,0xE7B995:0x4136,0xE886B3:0x4137,
	0xE7B38E:0x4138,0xE5998C:0x4139,0xE5A191:0x413A,0xE5B2A8:0x413B,0xE68EAA:0x413C,
	0xE69BBE:0x413D,0xE69BBD:0x413E,0xE6A59A:0x413F,0xE78B99:0x4140,0xE7968F:0x4141,
	0xE7968E:0x4142,0xE7A48E:0x4143,0xE7A596:0x4144,0xE7A79F:0x4145,0xE7B297:0x4146,
	0xE7B4A0:0x4147,0xE7B584:0x4148,0xE89887:0x4149,0xE8A8B4:0x414A,0xE998BB:0x414B,
	0xE981A1:0x414C,0xE9BCA0:0x414D,0xE583A7:0x414E,0xE589B5:0x414F,0xE58F8C:0x4150,
	0xE58FA2:0x4151,0xE58089:0x4152,0xE596AA:0x4153,0xE5A3AE:0x4154,0xE5A58F:0x4155,
	0xE788BD:0x4156,0xE5AE8B:0x4157,0xE5B1A4:0x4158,0xE58C9D:0x4159,0xE683A3:0x415A,
	0xE683B3:0x415B,0xE68D9C:0x415C,0xE68E83:0x415D,0xE68CBF:0x415E,0xE68EBB:0x415F,
	0xE6938D:0x4160,0xE697A9:0x4161,0xE69BB9:0x4162,0xE5B7A3:0x4163,0xE6A78D:0x4164,
	0xE6A7BD:0x4165,0xE6BC95:0x4166,0xE787A5:0x4167,0xE4BA89:0x4168,0xE797A9:0x4169,
	0xE79BB8:0x416A,0xE7AA93:0x416B,0xE7B39F:0x416C,0xE7B78F:0x416D,0xE7B69C:0x416E,
	0xE881A1:0x416F,0xE88D89:0x4170,0xE88D98:0x4171,0xE891AC:0x4172,0xE892BC:0x4173,
	0xE897BB:0x4174,0xE8A385:0x4175,0xE8B5B0:0x4176,0xE98081:0x4177,0xE981AD:0x4178,
	0xE98E97:0x4179,0xE99C9C:0x417A,0xE9A892:0x417B,0xE5838F:0x417C,0xE5A297:0x417D,
	0xE6868E:0x417E,0xE88793:0x4221,0xE894B5:0x4222,0xE8B488:0x4223,0xE980A0:0x4224,
	0xE4BF83:0x4225,0xE581B4:0x4226,0xE58987:0x4227,0xE58DB3:0x4228,0xE681AF:0x4229,
	0xE68D89:0x422A,0xE69D9F:0x422B,0xE6B8AC:0x422C,0xE8B6B3:0x422D,0xE9809F:0x422E,
	0xE4BF97:0x422F,0xE5B19E:0x4230,0xE8B38A:0x4231,0xE6978F:0x4232,0xE7B69A:0x4233,
	0xE58D92:0x4234,0xE8A296:0x4235,0xE585B6:0x4236,0xE68F83:0x4237,0xE5AD98:0x4238,
	0xE5ADAB:0x4239,0xE5B08A:0x423A,0xE6908D:0x423B,0xE69D91:0x423C,0xE9819C:0x423D,
	0xE4BB96:0x423E,0xE5A49A:0x423F,0xE5A4AA:0x4240,0xE6B1B0:0x4241,0xE8A991:0x4242,
	0xE594BE:0x4243,0xE5A095:0x4244,0xE5A6A5:0x4245,0xE683B0:0x4246,0xE68993:0x4247,
	0xE69F81:0x4248,0xE888B5:0x4249,0xE6A595:0x424A,0xE99980:0x424B,0xE9A784:0x424C,
	0xE9A8A8:0x424D,0xE4BD93:0x424E,0xE5A086:0x424F,0xE5AFBE:0x4250,0xE88090:0x4251,
	0xE5B2B1:0x4252,0xE5B8AF:0x4253,0xE5BE85:0x4254,0xE680A0:0x4255,0xE6858B:0x4256,
	0xE688B4:0x4257,0xE69BBF:0x4258,0xE6B3B0:0x4259,0xE6BB9E:0x425A,0xE8838E:0x425B,
	0xE885BF:0x425C,0xE88B94:0x425D,0xE8A28B:0x425E,0xE8B2B8:0x425F,0xE98080:0x4260,
	0xE980AE:0x4261,0xE99A8A:0x4262,0xE9BB9B:0x4263,0xE9AF9B:0x4264,0xE4BBA3:0x4265,
	0xE58FB0:0x4266,0xE5A4A7:0x4267,0xE7ACAC:0x4268,0xE9868D:0x4269,0xE9A18C:0x426A,
	0xE9B7B9:0x426B,0xE6BB9D:0x426C,0xE780A7:0x426D,0xE58D93:0x426E,0xE59584:0x426F,
	0xE5AE85:0x4270,0xE68998:0x4271,0xE68A9E:0x4272,0xE68B93:0x4273,0xE6B2A2:0x4274,
	0xE6BFAF:0x4275,0xE790A2:0x4276,0xE8A897:0x4277,0xE990B8:0x4278,0xE6BF81:0x4279,
	0xE8ABBE:0x427A,0xE88CB8:0x427B,0xE587A7:0x427C,0xE89BB8:0x427D,0xE58FAA:0x427E,
	0xE58FA9:0x4321,0xE4BD86:0x4322,0xE98194:0x4323,0xE8BEB0:0x4324,0xE5A5AA:0x4325,
	0xE884B1:0x4326,0xE5B7BD:0x4327,0xE7ABAA:0x4328,0xE8BEBF:0x4329,0xE6A39A:0x432A,
	0xE8B0B7:0x432B,0xE78BB8:0x432C,0xE9B188:0x432D,0xE6A8BD:0x432E,0xE8AAB0:0x432F,
	0xE4B8B9:0x4330,0xE58D98:0x4331,0xE59886:0x4332,0xE59DA6:0x4333,0xE68B85:0x4334,
	0xE68EA2:0x4335,0xE697A6:0x4336,0xE6AD8E:0x4337,0xE6B7A1:0x4338,0xE6B99B:0x4339,
	0xE782AD:0x433A,0xE79FAD:0x433B,0xE7ABAF:0x433C,0xE7AEAA:0x433D,0xE7B6BB:0x433E,
	0xE880BD:0x433F,0xE88386:0x4340,0xE89B8B:0x4341,0xE8AA95:0x4342,0xE98D9B:0x4343,
	0xE59BA3:0x4344,0xE5A387:0x4345,0xE5BCBE:0x4346,0xE696AD:0x4347,0xE69A96:0x4348,
	0xE6AA80:0x4349,0xE6AEB5:0x434A,0xE794B7:0x434B,0xE8AB87:0x434C,0xE580A4:0x434D,
	0xE79FA5:0x434E,0xE59CB0:0x434F,0xE5BC9B:0x4350,0xE681A5:0x4351,0xE699BA:0x4352,
	0xE6B1A0:0x4353,0xE797B4:0x4354,0xE7A89A:0x4355,0xE7BDAE:0x4356,0xE887B4:0x4357,
	0xE89C98:0x4358,0xE98185:0x4359,0xE9A6B3:0x435A,0xE7AF89:0x435B,0xE7959C:0x435C,
	0xE7ABB9:0x435D,0xE7AD91:0x435E,0xE89384:0x435F,0xE98090:0x4360,0xE7A7A9:0x4361,
	0xE7AA92:0x4362,0xE88CB6:0x4363,0xE5ABA1:0x4364,0xE79D80:0x4365,0xE4B8AD:0x4366,
	0xE4BBB2:0x4367,0xE5AE99:0x4368,0xE5BFA0:0x4369,0xE68ABD:0x436A,0xE698BC:0x436B,
	0xE69FB1:0x436C,0xE6B3A8:0x436D,0xE899AB:0x436E,0xE8A1B7:0x436F,0xE8A8BB:0x4370,
	0xE9858E:0x4371,0xE98BB3:0x4372,0xE9A790:0x4373,0xE6A897:0x4374,0xE780A6:0x4375,
	0xE78CAA:0x4376,0xE88BA7:0x4377,0xE89197:0x4378,0xE8B2AF:0x4379,0xE4B881:0x437A,
	0xE58586:0x437B,0xE5878B:0x437C,0xE5968B:0x437D,0xE5AFB5:0x437E,0xE5B896:0x4421,
	0xE5B8B3:0x4422,0xE5BA81:0x4423,0xE5BC94:0x4424,0xE5BCB5:0x4425,0xE5BDAB:0x4426,
	0xE5BEB4:0x4427,0xE687B2:0x4428,0xE68C91:0x4429,0xE69AA2:0x442A,0xE69C9D:0x442B,
	0xE6BDAE:0x442C,0xE78992:0x442D,0xE794BA:0x442E,0xE79CBA:0x442F,0xE881B4:0x4430,
	0xE884B9:0x4431,0xE885B8:0x4432,0xE89DB6:0x4433,0xE8AABF:0x4434,0xE8AB9C:0x4435,
	0xE8B685:0x4436,0xE8B7B3:0x4437,0xE98A9A:0x4438,0xE995B7:0x4439,0xE9A082:0x443A,
	0xE9B3A5:0x443B,0xE58B85:0x443C,0xE68D97:0x443D,0xE79BB4:0x443E,0xE69C95:0x443F,
	0xE6B288:0x4440,0xE78F8D:0x4441,0xE8B383:0x4442,0xE98EAE:0x4443,0xE999B3:0x4444,
	0xE6B4A5:0x4445,0xE5A29C:0x4446,0xE6A48E:0x4447,0xE6A78C:0x4448,0xE8BFBD:0x4449,
	0xE98E9A:0x444A,0xE7979B:0x444B,0xE9809A:0x444C,0xE5A19A:0x444D,0xE6A082:0x444E,
	0xE68EB4:0x444F,0xE6A7BB:0x4450,0xE4BD83:0x4451,0xE6BCAC:0x4452,0xE69F98:0x4453,
	0xE8BEBB:0x4454,0xE894A6:0x4455,0xE7B6B4:0x4456,0xE98D94:0x4457,0xE6A4BF:0x4458,
	0xE6BDB0:0x4459,0xE59DAA:0x445A,0xE5A3B7:0x445B,0xE5ACAC:0x445C,0xE7B4AC:0x445D,
	0xE788AA:0x445E,0xE5908A:0x445F,0xE987A3:0x4460,0xE9B6B4:0x4461,0xE4BAAD:0x4462,
	0xE4BD8E:0x4463,0xE5819C:0x4464,0xE581B5:0x4465,0xE58983:0x4466,0xE8B29E:0x4467,
	0xE59188:0x4468,0xE5A0A4:0x4469,0xE5AE9A:0x446A,0xE5B89D:0x446B,0xE5BA95:0x446C,
	0xE5BAAD:0x446D,0xE5BBB7:0x446E,0xE5BC9F:0x446F,0xE6828C:0x4470,0xE68AB5:0x4471,
	0xE68CBA:0x4472,0xE68F90:0x4473,0xE6A2AF:0x4474,0xE6B180:0x4475,0xE7A287:0x4476,
	0xE7A68E:0x4477,0xE7A88B:0x4478,0xE7B7A0:0x4479,0xE88987:0x447A,0xE8A882:0x447B,
	0xE8ABA6:0x447C,0xE8B984:0x447D,0xE98093:0x447E,0xE982B8:0x4521,0xE984AD:0x4522,
	0xE98798:0x4523,0xE9BC8E:0x4524,0xE6B3A5:0x4525,0xE69198:0x4526,0xE693A2:0x4527,
	0xE695B5:0x4528,0xE6BBB4:0x4529,0xE79A84:0x452A,0xE7AC9B:0x452B,0xE981A9:0x452C,
	0xE98F91:0x452D,0xE6BABA:0x452E,0xE593B2:0x452F,0xE5BEB9:0x4530,0xE692A4:0x4531,
	0xE8BD8D:0x4532,0xE8BFAD:0x4533,0xE98984:0x4534,0xE585B8:0x4535,0xE5A1AB:0x4536,
	0xE5A4A9:0x4537,0xE5B195:0x4538,0xE5BA97:0x4539,0xE6B7BB:0x453A,0xE7BA8F:0x453B,
	0xE7949C:0x453C,0xE8B2BC:0x453D,0xE8BBA2:0x453E,0xE9A19B:0x453F,0xE782B9:0x4540,
	0xE4BC9D:0x4541,0xE6AEBF:0x4542,0xE6BEB1:0x4543,0xE794B0:0x4544,0xE99BBB:0x4545,
	0xE5858E:0x4546,0xE59090:0x4547,0xE5A0B5:0x4548,0xE5A197:0x4549,0xE5A6AC:0x454A,
	0xE5B1A0:0x454B,0xE5BE92:0x454C,0xE69697:0x454D,0xE69D9C:0x454E,0xE6B8A1:0x454F,
	0xE799BB:0x4550,0xE88F9F:0x4551,0xE8B3AD:0x4552,0xE98094:0x4553,0xE983BD:0x4554,
	0xE98D8D:0x4555,0xE7A0A5:0x4556,0xE7A0BA:0x4557,0xE58AAA:0x4558,0xE5BAA6:0x4559,
	0xE59C9F:0x455A,0xE5A5B4:0x455B,0xE68092:0x455C,0xE58092:0x455D,0xE5859A:0x455E,
	0xE586AC:0x455F,0xE5878D:0x4560,0xE58880:0x4561,0xE59490:0x4562,0xE5A194:0x4563,
	0xE5A198:0x4564,0xE5A597:0x4565,0xE5AE95:0x4566,0xE5B3B6:0x4567,0xE5B68B:0x4568,
	0xE682BC:0x4569,0xE68A95:0x456A,0xE690AD:0x456B,0xE69DB1:0x456C,0xE6A183:0x456D,
	0xE6A2BC:0x456E,0xE6A39F:0x456F,0xE79B97:0x4570,0xE6B798:0x4571,0xE6B9AF:0x4572,
	0xE6B69B:0x4573,0xE781AF:0x4574,0xE78788:0x4575,0xE5BD93:0x4576,0xE79798:0x4577,
	0xE7A5B7:0x4578,0xE7AD89:0x4579,0xE7AD94:0x457A,0xE7AD92:0x457B,0xE7B396:0x457C,
	0xE7B5B1:0x457D,0xE588B0:0x457E,0xE891A3:0x4621,0xE895A9:0x4622,0xE897A4:0x4623,
	0xE8A88E:0x4624,0xE8AC84:0x4625,0xE8B186:0x4626,0xE8B88F:0x4627,0xE98083:0x4628,
	0xE9808F:0x4629,0xE99099:0x462A,0xE999B6:0x462B,0xE9A0AD:0x462C,0xE9A8B0:0x462D,
	0xE99798:0x462E,0xE5838D:0x462F,0xE58B95:0x4630,0xE5908C:0x4631,0xE5A082:0x4632,
	0xE5B08E:0x4633,0xE686A7:0x4634,0xE6929E:0x4635,0xE6B49E:0x4636,0xE79EB3:0x4637,
	0xE7ABA5:0x4638,0xE883B4:0x4639,0xE89084:0x463A,0xE98193:0x463B,0xE98A85:0x463C,
	0xE5B3A0:0x463D,0xE9B487:0x463E,0xE58CBF:0x463F,0xE5BE97:0x4640,0xE5BEB3:0x4641,
	0xE6B69C:0x4642,0xE789B9:0x4643,0xE79DA3:0x4644,0xE7A6BF:0x4645,0xE7AFA4:0x4646,
	0xE6AF92:0x4647,0xE78BAC:0x4648,0xE8AAAD:0x4649,0xE6A083:0x464A,0xE6A9A1:0x464B,
	0xE587B8:0x464C,0xE7AA81:0x464D,0xE6A4B4:0x464E,0xE5B18A:0x464F,0xE9B3B6:0x4650,
	0xE88BAB:0x4651,0xE5AF85:0x4652,0xE98589:0x4653,0xE7809E:0x4654,0xE599B8:0x4655,
	0xE5B1AF:0x4656,0xE68387:0x4657,0xE695A6:0x4658,0xE6B28C:0x4659,0xE8B19A:0x465A,
	0xE98181:0x465B,0xE9A093:0x465C,0xE59191:0x465D,0xE69B87:0x465E,0xE9888D:0x465F,
	0xE5A588:0x4660,0xE982A3:0x4661,0xE58685:0x4662,0xE4B98D:0x4663,0xE587AA:0x4664,
	0xE89699:0x4665,0xE8AC8E:0x4666,0xE78198:0x4667,0xE68DBA:0x4668,0xE98D8B:0x4669,
	0xE6A5A2:0x466A,0xE9A6B4:0x466B,0xE7B884:0x466C,0xE795B7:0x466D,0xE58D97:0x466E,
	0xE6A5A0:0x466F,0xE8BB9F:0x4670,0xE99BA3:0x4671,0xE6B19D:0x4672,0xE4BA8C:0x4673,
	0xE5B0BC:0x4674,0xE5BC90:0x4675,0xE8BFA9:0x4676,0xE58C82:0x4677,0xE8B391:0x4678,
	0xE88289:0x4679,0xE899B9:0x467A,0xE5BBBF:0x467B,0xE697A5:0x467C,0xE4B9B3:0x467D,
	0xE585A5:0x467E,0xE5A682:0x4721,0xE5B0BF:0x4722,0xE99FAE:0x4723,0xE4BBBB:0x4724,
	0xE5A68A:0x4725,0xE5BF8D:0x4726,0xE8AA8D:0x4727,0xE6BFA1:0x4728,0xE7A6B0:0x4729,
	0xE7A5A2:0x472A,0xE5AFA7:0x472B,0xE891B1:0x472C,0xE78CAB:0x472D,0xE786B1:0x472E,
	0xE5B9B4:0x472F,0xE5BFB5:0x4730,0xE68DBB:0x4731,0xE6929A:0x4732,0xE78783:0x4733,
	0xE7B298:0x4734,0xE4B983:0x4735,0xE5BBBC:0x4736,0xE4B98B:0x4737,0xE59F9C:0x4738,
	0xE59AA2:0x4739,0xE682A9:0x473A,0xE6BF83:0x473B,0xE7B48D:0x473C,0xE883BD:0x473D,
	0xE884B3:0x473E,0xE886BF:0x473F,0xE8BEB2:0x4740,0xE8A697:0x4741,0xE89AA4:0x4742,
	0xE5B7B4:0x4743,0xE68A8A:0x4744,0xE692AD:0x4745,0xE8A687:0x4746,0xE69DB7:0x4747,
	0xE6B3A2:0x4748,0xE6B4BE:0x4749,0xE790B6:0x474A,0xE7A0B4:0x474B,0xE5A986:0x474C,
	0xE7BDB5:0x474D,0xE88AAD:0x474E,0xE9A6AC:0x474F,0xE4BFB3:0x4750,0xE5BB83:0x4751,
	0xE68B9D:0x4752,0xE68E92:0x4753,0xE69597:0x4754,0xE69DAF:0x4755,0xE79B83:0x4756,
	0xE7898C:0x4757,0xE8838C:0x4758,0xE882BA:0x4759,0xE8BCA9:0x475A,0xE9858D:0x475B,
	0xE5808D:0x475C,0xE59FB9:0x475D,0xE5AA92:0x475E,0xE6A285:0x475F,0xE6A5B3:0x4760,
	0xE785A4:0x4761,0xE78BBD:0x4762,0xE8B2B7:0x4763,0xE5A3B2:0x4764,0xE8B3A0:0x4765,
	0xE999AA:0x4766,0xE98099:0x4767,0xE89DBF:0x4768,0xE7A7A4:0x4769,0xE79FA7:0x476A,
	0xE890A9:0x476B,0xE4BCAF:0x476C,0xE589A5:0x476D,0xE58D9A:0x476E,0xE68B8D:0x476F,
	0xE69F8F:0x4770,0xE6B38A:0x4771,0xE799BD:0x4772,0xE7AE94:0x4773,0xE7B295:0x4774,
	0xE888B6:0x4775,0xE89684:0x4776,0xE8BFAB:0x4777,0xE69B9D:0x4778,0xE6BCA0:0x4779,
	0xE78886:0x477A,0xE7B89B:0x477B,0xE88EAB:0x477C,0xE9A781:0x477D,0xE9BAA6:0x477E,
	0xE587BD:0x4821,0xE7AEB1:0x4822,0xE7A1B2:0x4823,0xE7AEB8:0x4824,0xE88287:0x4825,
	0xE7AD88:0x4826,0xE6ABA8:0x4827,0xE5B9A1:0x4828,0xE8828C:0x4829,0xE79591:0x482A,
	0xE795A0:0x482B,0xE585AB:0x482C,0xE989A2:0x482D,0xE6BA8C:0x482E,0xE799BA:0x482F,
	0xE98697:0x4830,0xE9ABAA:0x4831,0xE4BC90:0x4832,0xE7BDB0:0x4833,0xE68A9C:0x4834,
	0xE7AD8F:0x4835,0xE996A5:0x4836,0xE9B3A9:0x4837,0xE599BA:0x4838,0xE5A199:0x4839,
	0xE89BA4:0x483A,0xE99ABC:0x483B,0xE4BCB4:0x483C,0xE588A4:0x483D,0xE58D8A:0x483E,
	0xE58F8D:0x483F,0xE58F9B:0x4840,0xE5B886:0x4841,0xE690AC:0x4842,0xE69691:0x4843,
	0xE69DBF:0x4844,0xE6B0BE:0x4845,0xE6B18E:0x4846,0xE78988:0x4847,0xE78AAF:0x4848,
	0xE78FAD:0x4849,0xE79594:0x484A,0xE7B981:0x484B,0xE888AC:0x484C,0xE897A9:0x484D,
	0xE8B2A9:0x484E,0xE7AF84:0x484F,0xE98786:0x4850,0xE785A9:0x4851,0xE9A092:0x4852,
	0xE9A3AF:0x4853,0xE68CBD:0x4854,0xE699A9:0x4855,0xE795AA:0x4856,0xE79BA4:0x4857,
	0xE7A390:0x4858,0xE89583:0x4859,0xE89BAE:0x485A,0xE58CAA:0x485B,0xE58D91:0x485C,
	0xE590A6:0x485D,0xE5A683:0x485E,0xE5BA87:0x485F,0xE5BDBC:0x4860,0xE682B2:0x4861,
	0xE68989:0x4862,0xE689B9:0x4863,0xE68AAB:0x4864,0xE69690:0x4865,0xE6AF94:0x4866,
	0xE6B38C:0x4867,0xE796B2:0x4868,0xE79AAE:0x4869,0xE7A291:0x486A,0xE7A798:0x486B,
	0xE7B78B:0x486C,0xE7BDB7:0x486D,0xE882A5:0x486E,0xE8A2AB:0x486F,0xE8AAB9:0x4870,
	0xE8B2BB:0x4871,0xE981BF:0x4872,0xE99D9E:0x4873,0xE9A39B:0x4874,0xE6A88B:0x4875,
	0xE7B0B8:0x4876,0xE58299:0x4877,0xE5B0BE:0x4878,0xE5BEAE:0x4879,0xE69E87:0x487A,
	0xE6AF98:0x487B,0xE790B5:0x487C,0xE79C89:0x487D,0xE7BE8E:0x487E,0xE9BCBB:0x4921,
	0xE69F8A:0x4922,0xE7A897:0x4923,0xE58CB9:0x4924,0xE7968B:0x4925,0xE9ABAD:0x4926,
	0xE5BDA6:0x4927,0xE8869D:0x4928,0xE88FB1:0x4929,0xE88298:0x492A,0xE5BCBC:0x492B,
	0xE5BF85:0x492C,0xE795A2:0x492D,0xE7AD86:0x492E,0xE980BC:0x492F,0xE6A1A7:0x4930,
	0xE5A7AB:0x4931,0xE5AA9B:0x4932,0xE7B490:0x4933,0xE799BE:0x4934,0xE8ACAC:0x4935,
	0xE4BFB5:0x4936,0xE5BDAA:0x4937,0xE6A899:0x4938,0xE6B0B7:0x4939,0xE6BC82:0x493A,
	0xE793A2:0x493B,0xE7A5A8:0x493C,0xE8A1A8:0x493D,0xE8A995:0x493E,0xE8B1B9:0x493F,
	0xE5BB9F:0x4940,0xE68F8F:0x4941,0xE79785:0x4942,0xE7A792:0x4943,0xE88B97:0x4944,
	0xE98CA8:0x4945,0xE98BB2:0x4946,0xE8929C:0x4947,0xE89BAD:0x4948,0xE9B0AD:0x4949,
	0xE59381:0x494A,0xE5BDAC:0x494B,0xE6968C:0x494C,0xE6B59C:0x494D,0xE78095:0x494E,
	0xE8B2A7:0x494F,0xE8B393:0x4950,0xE9A0BB:0x4951,0xE6958F:0x4952,0xE793B6:0x4953,
	0xE4B88D:0x4954,0xE4BB98:0x4955,0xE59FA0:0x4956,0xE5A4AB:0x4957,0xE5A9A6:0x4958,
	0xE5AF8C:0x4959,0xE586A8:0x495A,0xE5B883:0x495B,0xE5BA9C:0x495C,0xE68096:0x495D,
	0xE689B6:0x495E,0xE695B7:0x495F,0xE696A7:0x4960,0xE699AE:0x4961,0xE6B5AE:0x4962,
	0xE788B6:0x4963,0xE7ACA6:0x4964,0xE88590:0x4965,0xE8869A:0x4966,0xE88A99:0x4967,
	0xE8AD9C:0x4968,0xE8B2A0:0x4969,0xE8B3A6:0x496A,0xE8B5B4:0x496B,0xE9989C:0x496C,
	0xE99984:0x496D,0xE4BEAE:0x496E,0xE692AB:0x496F,0xE6ADA6:0x4970,0xE8889E:0x4971,
	0xE891A1:0x4972,0xE895AA:0x4973,0xE983A8:0x4974,0xE5B081:0x4975,0xE6A593:0x4976,
	0xE9A2A8:0x4977,0xE891BA:0x4978,0xE89597:0x4979,0xE4BC8F:0x497A,0xE589AF:0x497B,
	0xE5BEA9:0x497C,0xE5B985:0x497D,0xE69C8D:0x497E,0xE7A68F:0x4A21,0xE885B9:0x4A22,
	0xE8A487:0x4A23,0xE8A686:0x4A24,0xE6B7B5:0x4A25,0xE5BC97:0x4A26,0xE68995:0x4A27,
	0xE6B2B8:0x4A28,0xE4BB8F:0x4A29,0xE789A9:0x4A2A,0xE9AE92:0x4A2B,0xE58886:0x4A2C,
	0xE590BB:0x4A2D,0xE599B4:0x4A2E,0xE5A2B3:0x4A2F,0xE686A4:0x4A30,0xE689AE:0x4A31,
	0xE7849A:0x4A32,0xE5A5AE:0x4A33,0xE7B289:0x4A34,0xE7B39E:0x4A35,0xE7B49B:0x4A36,
	0xE99BB0:0x4A37,0xE69687:0x4A38,0xE8819E:0x4A39,0xE4B899:0x4A3A,0xE4BDB5:0x4A3B,
	0xE585B5:0x4A3C,0xE5A180:0x4A3D,0xE5B9A3:0x4A3E,0xE5B9B3:0x4A3F,0xE5BC8A:0x4A40,
	0xE69F84:0x4A41,0xE4B8A6:0x4A42,0xE894BD:0x4A43,0xE99689:0x4A44,0xE9999B:0x4A45,
	0xE7B1B3:0x4A46,0xE9A081:0x4A47,0xE583BB:0x4A48,0xE5A381:0x4A49,0xE79996:0x4A4A,
	0xE7A2A7:0x4A4B,0xE588A5:0x4A4C,0xE79EA5:0x4A4D,0xE89491:0x4A4E,0xE7AE86:0x4A4F,
	0xE5818F:0x4A50,0xE5A489:0x4A51,0xE78987:0x4A52,0xE7AF87:0x4A53,0xE7B7A8:0x4A54,
	0xE8BEBA:0x4A55,0xE8BF94:0x4A56,0xE9818D:0x4A57,0xE4BEBF:0x4A58,0xE58B89:0x4A59,
	0xE5A8A9:0x4A5A,0xE5BC81:0x4A5B,0xE99EAD:0x4A5C,0xE4BF9D:0x4A5D,0xE88897:0x4A5E,
	0xE98BAA:0x4A5F,0xE59C83:0x4A60,0xE68D95:0x4A61,0xE6ADA9:0x4A62,0xE794AB:0x4A63,
	0xE8A39C:0x4A64,0xE8BC94:0x4A65,0xE7A982:0x4A66,0xE58B9F:0x4A67,0xE5A293:0x4A68,
	0xE68595:0x4A69,0xE6888A:0x4A6A,0xE69AAE:0x4A6B,0xE6AF8D:0x4A6C,0xE7B0BF:0x4A6D,
	0xE88FA9:0x4A6E,0xE580A3:0x4A6F,0xE4BFB8:0x4A70,0xE58C85:0x4A71,0xE59186:0x4A72,
	0xE5A0B1:0x4A73,0xE5A589:0x4A74,0xE5AE9D:0x4A75,0xE5B3B0:0x4A76,0xE5B3AF:0x4A77,
	0xE5B4A9:0x4A78,0xE5BA96:0x4A79,0xE68AB1:0x4A7A,0xE68DA7:0x4A7B,0xE694BE:0x4A7C,
	0xE696B9:0x4A7D,0xE69C8B:0x4A7E,0xE6B395:0x4B21,0xE6B3A1:0x4B22,0xE783B9:0x4B23,
	0xE7A0B2:0x4B24,0xE7B8AB:0x4B25,0xE8839E:0x4B26,0xE88AB3:0x4B27,0xE8908C:0x4B28,
	0xE893AC:0x4B29,0xE89C82:0x4B2A,0xE8A492:0x4B2B,0xE8A8AA:0x4B2C,0xE8B18A:0x4B2D,
	0xE982A6:0x4B2E,0xE98B92:0x4B2F,0xE9A3BD:0x4B30,0xE9B3B3:0x4B31,0xE9B5AC:0x4B32,
	0xE4B98F:0x4B33,0xE4BAA1:0x4B34,0xE5828D:0x4B35,0xE58996:0x4B36,0xE59D8A:0x4B37,
	0xE5A6A8:0x4B38,0xE5B8BD:0x4B39,0xE5BF98:0x4B3A,0xE5BF99:0x4B3B,0xE688BF:0x4B3C,
	0xE69AB4:0x4B3D,0xE69C9B:0x4B3E,0xE69F90:0x4B3F,0xE6A392:0x4B40,0xE58692:0x4B41,
	0xE7B4A1:0x4B42,0xE882AA:0x4B43,0xE886A8:0x4B44,0xE8AC80:0x4B45,0xE8B28C:0x4B46,
	0xE8B2BF:0x4B47,0xE989BE:0x4B48,0xE998B2:0x4B49,0xE590A0:0x4B4A,0xE9A0AC:0x4B4B,
	0xE58C97:0x4B4C,0xE58395:0x4B4D,0xE58D9C:0x4B4E,0xE5A2A8:0x4B4F,0xE692B2:0x4B50,
	0xE69CB4:0x4B51,0xE789A7:0x4B52,0xE79DA6:0x4B53,0xE7A986:0x4B54,0xE987A6:0x4B55,
	0xE58B83:0x4B56,0xE6B2A1:0x4B57,0xE6AE86:0x4B58,0xE5A080:0x4B59,0xE5B98C:0x4B5A,
	0xE5A594:0x4B5B,0xE69CAC:0x4B5C,0xE7BFBB:0x4B5D,0xE587A1:0x4B5E,0xE79B86:0x4B5F,
	0xE691A9:0x4B60,0xE7A3A8:0x4B61,0xE9AD94:0x4B62,0xE9BABB:0x4B63,0xE59F8B:0x4B64,
	0xE5A6B9:0x4B65,0xE698A7:0x4B66,0xE69E9A:0x4B67,0xE6AF8E:0x4B68,0xE593A9:0x4B69,
	0xE6A799:0x4B6A,0xE5B995:0x4B6B,0xE8869C:0x4B6C,0xE69E95:0x4B6D,0xE9AEAA:0x4B6E,
	0xE69FBE:0x4B6F,0xE9B192:0x4B70,0xE6A19D:0x4B71,0xE4BAA6:0x4B72,0xE4BFA3:0x4B73,
	0xE58F88:0x4B74,0xE68AB9:0x4B75,0xE69CAB:0x4B76,0xE6B2AB:0x4B77,0xE8BF84:0x4B78,
	0xE4BEAD:0x4B79,0xE7B9AD:0x4B7A,0xE9BABF:0x4B7B,0xE4B887:0x4B7C,0xE685A2:0x4B7D,
	0xE6BA80:0x4B7E,0xE6BCAB:0x4C21,0xE89493:0x4C22,0xE591B3:0x4C23,0xE69CAA:0x4C24,
	0xE9AD85:0x4C25,0xE5B7B3:0x4C26,0xE7AE95:0x4C27,0xE5B2AC:0x4C28,0xE5AF86:0x4C29,
	0xE89C9C:0x4C2A,0xE6B98A:0x4C2B,0xE89391:0x4C2C,0xE7A894:0x4C2D,0xE88488:0x4C2E,
	0xE5A699:0x4C2F,0xE7B28D:0x4C30,0xE6B091:0x4C31,0xE79CA0:0x4C32,0xE58B99:0x4C33,
	0xE5A4A2:0x4C34,0xE784A1:0x4C35,0xE7899F:0x4C36,0xE79F9B:0x4C37,0xE99CA7:0x4C38,
	0xE9B5A1:0x4C39,0xE6A48B:0x4C3A,0xE5A9BF:0x4C3B,0xE5A898:0x4C3C,0xE586A5:0x4C3D,
	0xE5908D:0x4C3E,0xE591BD:0x4C3F,0xE6988E:0x4C40,0xE79B9F:0x4C41,0xE8BFB7:0x4C42,
	0xE98A98:0x4C43,0xE9B3B4:0x4C44,0xE5A7AA:0x4C45,0xE7899D:0x4C46,0xE6BB85:0x4C47,
	0xE5858D:0x4C48,0xE6A389:0x4C49,0xE7B6BF:0x4C4A,0xE7B7AC:0x4C4B,0xE99DA2:0x4C4C,
	0xE9BABA:0x4C4D,0xE691B8:0x4C4E,0xE6A8A1:0x4C4F,0xE88C82:0x4C50,0xE5A684:0x4C51,
	0xE5AD9F:0x4C52,0xE6AF9B:0x4C53,0xE78C9B:0x4C54,0xE79BB2:0x4C55,0xE7B6B2:0x4C56,
	0xE88097:0x4C57,0xE89299:0x4C58,0xE584B2:0x4C59,0xE69CA8:0x4C5A,0xE9BB99:0x4C5B,
	0xE79BAE:0x4C5C,0xE69DA2:0x4C5D,0xE58BBF:0x4C5E,0xE9A485:0x4C5F,0xE5B0A4:0x4C60,
	0xE688BB:0x4C61,0xE7B1BE:0x4C62,0xE8B2B0:0x4C63,0xE5958F:0x4C64,0xE682B6:0x4C65,
	0xE7B48B:0x4C66,0xE99680:0x4C67,0xE58C81:0x4C68,0xE4B99F:0x4C69,0xE586B6:0x4C6A,
	0xE5A49C:0x4C6B,0xE788BA:0x4C6C,0xE880B6:0x4C6D,0xE9878E:0x4C6E,0xE5BCA5:0x4C6F,
	0xE79FA2:0x4C70,0xE58E84:0x4C71,0xE5BDB9:0x4C72,0xE7B484:0x4C73,0xE896AC:0x4C74,
	0xE8A8B3:0x4C75,0xE8BA8D:0x4C76,0xE99D96:0x4C77,0xE69FB3:0x4C78,0xE896AE:0x4C79,
	0xE99193:0x4C7A,0xE68489:0x4C7B,0xE68488:0x4C7C,0xE6B2B9:0x4C7D,0xE79992:0x4C7E,
	0xE8ABAD:0x4D21,0xE8BCB8:0x4D22,0xE594AF:0x4D23,0xE4BD91:0x4D24,0xE584AA:0x4D25,
	0xE58B87:0x4D26,0xE58F8B:0x4D27,0xE5AEA5:0x4D28,0xE5B9BD:0x4D29,0xE682A0:0x4D2A,
	0xE68682:0x4D2B,0xE68F96:0x4D2C,0xE69C89:0x4D2D,0xE69F9A:0x4D2E,0xE6B9A7:0x4D2F,
	0xE6B68C:0x4D30,0xE78CB6:0x4D31,0xE78CB7:0x4D32,0xE794B1:0x4D33,0xE7A590:0x4D34,
	0xE8A395:0x4D35,0xE8AA98:0x4D36,0xE9818A:0x4D37,0xE98291:0x4D38,0xE983B5:0x4D39,
	0xE99B84:0x4D3A,0xE89E8D:0x4D3B,0xE5A495:0x4D3C,0xE4BA88:0x4D3D,0xE4BD99:0x4D3E,
	0xE4B88E:0x4D3F,0xE8AA89:0x4D40,0xE8BCBF:0x4D41,0xE9A090:0x4D42,0xE582AD:0x4D43,
	0xE5B9BC:0x4D44,0xE5A696:0x4D45,0xE5AEB9:0x4D46,0xE5BAB8:0x4D47,0xE68F9A:0x4D48,
	0xE68FBA:0x4D49,0xE69381:0x4D4A,0xE69B9C:0x4D4B,0xE6A58A:0x4D4C,0xE6A798:0x4D4D,
	0xE6B48B:0x4D4E,0xE6BAB6:0x4D4F,0xE78694:0x4D50,0xE794A8:0x4D51,0xE7AAAF:0x4D52,
	0xE7BE8A:0x4D53,0xE88080:0x4D54,0xE89189:0x4D55,0xE89389:0x4D56,0xE8A681:0x4D57,
	0xE8ACA1:0x4D58,0xE8B88A:0x4D59,0xE981A5:0x4D5A,0xE999BD:0x4D5B,0xE9A48A:0x4D5C,
	0xE685BE:0x4D5D,0xE68A91:0x4D5E,0xE6ACB2:0x4D5F,0xE6B283:0x4D60,0xE6B5B4:0x4D61,
	0xE7BF8C:0x4D62,0xE7BFBC:0x4D63,0xE6B780:0x4D64,0xE7BE85:0x4D65,0xE89EBA:0x4D66,
	0xE8A3B8:0x4D67,0xE69DA5:0x4D68,0xE88EB1:0x4D69,0xE9A0BC:0x4D6A,0xE99BB7:0x4D6B,
	0xE6B49B:0x4D6C,0xE7B5A1:0x4D6D,0xE890BD:0x4D6E,0xE985AA:0x4D6F,0xE4B9B1:0x4D70,
	0xE58DB5:0x4D71,0xE5B590:0x4D72,0xE6AC84:0x4D73,0xE6BFAB:0x4D74,0xE8978D:0x4D75,
	0xE898AD:0x4D76,0xE8A6A7:0x4D77,0xE588A9:0x4D78,0xE5908F:0x4D79,0xE5B1A5:0x4D7A,
	0xE69D8E:0x4D7B,0xE6A2A8:0x4D7C,0xE79086:0x4D7D,0xE79283:0x4D7E,0xE797A2:0x4E21,
	0xE8A38F:0x4E22,0xE8A3A1:0x4E23,0xE9878C:0x4E24,0xE99BA2:0x4E25,0xE999B8:0x4E26,
	0xE5BE8B:0x4E27,0xE78E87:0x4E28,0xE7AB8B:0x4E29,0xE8918E:0x4E2A,0xE68EA0:0x4E2B,
	0xE795A5:0x4E2C,0xE58A89:0x4E2D,0xE6B581:0x4E2E,0xE6BA9C:0x4E2F,0xE79089:0x4E30,
	0xE79599:0x4E31,0xE7A1AB:0x4E32,0xE7B292:0x4E33,0xE99A86:0x4E34,0xE7AB9C:0x4E35,
	0xE9BE8D:0x4E36,0xE4BEB6:0x4E37,0xE685AE:0x4E38,0xE69785:0x4E39,0xE8999C:0x4E3A,
	0xE4BA86:0x4E3B,0xE4BAAE:0x4E3C,0xE5839A:0x4E3D,0xE4B8A1:0x4E3E,0xE5878C:0x4E3F,
	0xE5AFAE:0x4E40,0xE69699:0x4E41,0xE6A281:0x4E42,0xE6B6BC:0x4E43,0xE78C9F:0x4E44,
	0xE79982:0x4E45,0xE79EAD:0x4E46,0xE7A89C:0x4E47,0xE7B3A7:0x4E48,0xE889AF:0x4E49,
	0xE8AB92:0x4E4A,0xE981BC:0x4E4B,0xE9878F:0x4E4C,0xE999B5:0x4E4D,0xE9A098:0x4E4E,
	0xE58A9B:0x4E4F,0xE7B791:0x4E50,0xE580AB:0x4E51,0xE58E98:0x4E52,0xE69E97:0x4E53,
	0xE6B78B:0x4E54,0xE78790:0x4E55,0xE790B3:0x4E56,0xE887A8:0x4E57,0xE8BCAA:0x4E58,
	0xE99AA3:0x4E59,0xE9B197:0x4E5A,0xE9BA9F:0x4E5B,0xE791A0:0x4E5C,0xE5A181:0x4E5D,
	0xE6B699:0x4E5E,0xE7B4AF:0x4E5F,0xE9A19E:0x4E60,0xE4BBA4:0x4E61,0xE4BCB6:0x4E62,
	0xE4BE8B:0x4E63,0xE586B7:0x4E64,0xE58AB1:0x4E65,0xE5B6BA:0x4E66,0xE6809C:0x4E67,
	0xE78EB2:0x4E68,0xE7A4BC:0x4E69,0xE88B93:0x4E6A,0xE988B4:0x4E6B,0xE99AB7:0x4E6C,
	0xE99BB6:0x4E6D,0xE99C8A:0x4E6E,0xE9BA97:0x4E6F,0xE9BDA2:0x4E70,0xE69AA6:0x4E71,
	0xE6ADB4:0x4E72,0xE58897:0x4E73,0xE58AA3:0x4E74,0xE78388:0x4E75,0xE8A382:0x4E76,
	0xE5BB89:0x4E77,0xE6818B:0x4E78,0xE68690:0x4E79,0xE6BCA3:0x4E7A,0xE78589:0x4E7B,
	0xE7B0BE:0x4E7C,0xE7B7B4:0x4E7D,0xE881AF:0x4E7E,0xE893AE:0x4F21,0xE980A3:0x4F22,
	0xE98CAC:0x4F23,0xE59182:0x4F24,0xE9ADAF:0x4F25,0xE6AB93:0x4F26,0xE78289:0x4F27,
	0xE8B382:0x4F28,0xE8B7AF:0x4F29,0xE99CB2:0x4F2A,0xE58AB4:0x4F2B,0xE5A981:0x4F2C,
	0xE5BB8A:0x4F2D,0xE5BC84:0x4F2E,0xE69C97:0x4F2F,0xE6A5BC:0x4F30,0xE6A694:0x4F31,
	0xE6B5AA:0x4F32,0xE6BC8F:0x4F33,0xE789A2:0x4F34,0xE78BBC:0x4F35,0xE7AFAD:0x4F36,
	0xE88081:0x4F37,0xE881BE:0x4F38,0xE89D8B:0x4F39,0xE9838E:0x4F3A,0xE585AD:0x4F3B,
	0xE9BA93:0x4F3C,0xE7A684:0x4F3D,0xE8828B:0x4F3E,0xE98CB2:0x4F3F,0xE8AB96:0x4F40,
	0xE580AD:0x4F41,0xE5928C:0x4F42,0xE8A9B1:0x4F43,0xE6ADAA:0x4F44,0xE8B384:0x4F45,
	0xE88487:0x4F46,0xE68391:0x4F47,0xE69EA0:0x4F48,0xE9B7B2:0x4F49,0xE4BA99:0x4F4A,
	0xE4BA98:0x4F4B,0xE9B090:0x4F4C,0xE8A9AB:0x4F4D,0xE89781:0x4F4E,0xE895A8:0x4F4F,
	0xE6A480:0x4F50,0xE6B9BE:0x4F51,0xE7A297:0x4F52,0xE88595:0x4F53,0xE5BC8C:0x5021,
	0xE4B890:0x5022,0xE4B895:0x5023,0xE4B8AA:0x5024,0xE4B8B1:0x5025,0xE4B8B6:0x5026,
	0xE4B8BC:0x5027,0xE4B8BF:0x5028,0xE4B982:0x5029,0xE4B996:0x502A,0xE4B998:0x502B,
	0xE4BA82:0x502C,0xE4BA85:0x502D,0xE8B1AB:0x502E,0xE4BA8A:0x502F,0xE88892:0x5030,
	0xE5BC8D:0x5031,0xE4BA8E:0x5032,0xE4BA9E:0x5033,0xE4BA9F:0x5034,0xE4BAA0:0x5035,
	0xE4BAA2:0x5036,0xE4BAB0:0x5037,0xE4BAB3:0x5038,0xE4BAB6:0x5039,0xE4BB8E:0x503A,
	0xE4BB8D:0x503B,0xE4BB84:0x503C,0xE4BB86:0x503D,0xE4BB82:0x503E,0xE4BB97:0x503F,
	0xE4BB9E:0x5040,0xE4BBAD:0x5041,0xE4BB9F:0x5042,0xE4BBB7:0x5043,0xE4BC89:0x5044,
	0xE4BD9A:0x5045,0xE4BCB0:0x5046,0xE4BD9B:0x5047,0xE4BD9D:0x5048,0xE4BD97:0x5049,
	0xE4BD87:0x504A,0xE4BDB6:0x504B,0xE4BE88:0x504C,0xE4BE8F:0x504D,0xE4BE98:0x504E,
	0xE4BDBB:0x504F,0xE4BDA9:0x5050,0xE4BDB0:0x5051,0xE4BE91:0x5052,0xE4BDAF:0x5053,
	0xE4BE86:0x5054,0xE4BE96:0x5055,0xE58498:0x5056,0xE4BF94:0x5057,0xE4BF9F:0x5058,
	0xE4BF8E:0x5059,0xE4BF98:0x505A,0xE4BF9B:0x505B,0xE4BF91:0x505C,0xE4BF9A:0x505D,
	0xE4BF90:0x505E,0xE4BFA4:0x505F,0xE4BFA5:0x5060,0xE5809A:0x5061,0xE580A8:0x5062,
	0xE58094:0x5063,0xE580AA:0x5064,0xE580A5:0x5065,0xE58085:0x5066,0xE4BC9C:0x5067,
	0xE4BFB6:0x5068,0xE580A1:0x5069,0xE580A9:0x506A,0xE580AC:0x506B,0xE4BFBE:0x506C,
	0xE4BFAF:0x506D,0xE58091:0x506E,0xE58086:0x506F,0xE58183:0x5070,0xE58187:0x5071,
	0xE69C83:0x5072,0xE58195:0x5073,0xE58190:0x5074,0xE58188:0x5075,0xE5819A:0x5076,
	0xE58196:0x5077,0xE581AC:0x5078,0xE581B8:0x5079,0xE58280:0x507A,0xE5829A:0x507B,
	0xE58285:0x507C,0xE582B4:0x507D,0xE582B2:0x507E,0xE58389:0x5121,0xE5838A:0x5122,
	0xE582B3:0x5123,0xE58382:0x5124,0xE58396:0x5125,0xE5839E:0x5126,0xE583A5:0x5127,
	0xE583AD:0x5128,0xE583A3:0x5129,0xE583AE:0x512A,0xE583B9:0x512B,0xE583B5:0x512C,
	0xE58489:0x512D,0xE58481:0x512E,0xE58482:0x512F,0xE58496:0x5130,0xE58495:0x5131,
	0xE58494:0x5132,0xE5849A:0x5133,0xE584A1:0x5134,0xE584BA:0x5135,0xE584B7:0x5136,
	0xE584BC:0x5137,0xE584BB:0x5138,0xE584BF:0x5139,0xE58580:0x513A,0xE58592:0x513B,
	0xE5858C:0x513C,0xE58594:0x513D,0xE585A2:0x513E,0xE7ABB8:0x513F,0xE585A9:0x5140,
	0xE585AA:0x5141,0xE585AE:0x5142,0xE58680:0x5143,0xE58682:0x5144,0xE59B98:0x5145,
	0xE5868C:0x5146,0xE58689:0x5147,0xE5868F:0x5148,0xE58691:0x5149,0xE58693:0x514A,
	0xE58695:0x514B,0xE58696:0x514C,0xE586A4:0x514D,0xE586A6:0x514E,0xE586A2:0x514F,
	0xE586A9:0x5150,0xE586AA:0x5151,0xE586AB:0x5152,0xE586B3:0x5153,0xE586B1:0x5154,
	0xE586B2:0x5155,0xE586B0:0x5156,0xE586B5:0x5157,0xE586BD:0x5158,0xE58785:0x5159,
	0xE58789:0x515A,0xE5879B:0x515B,0xE587A0:0x515C,0xE89995:0x515D,0xE587A9:0x515E,
	0xE587AD:0x515F,0xE587B0:0x5160,0xE587B5:0x5161,0xE587BE:0x5162,0xE58884:0x5163,
	0xE5888B:0x5164,0xE58894:0x5165,0xE5888E:0x5166,0xE588A7:0x5167,0xE588AA:0x5168,
	0xE588AE:0x5169,0xE588B3:0x516A,0xE588B9:0x516B,0xE5898F:0x516C,0xE58984:0x516D,
	0xE5898B:0x516E,0xE5898C:0x516F,0xE5899E:0x5170,0xE58994:0x5171,0xE589AA:0x5172,
	0xE589B4:0x5173,0xE589A9:0x5174,0xE589B3:0x5175,0xE589BF:0x5176,0xE589BD:0x5177,
	0xE58A8D:0x5178,0xE58A94:0x5179,0xE58A92:0x517A,0xE589B1:0x517B,0xE58A88:0x517C,
	0xE58A91:0x517D,0xE8BEA8:0x517E,0xE8BEA7:0x5221,0xE58AAC:0x5222,0xE58AAD:0x5223,
	0xE58ABC:0x5224,0xE58AB5:0x5225,0xE58B81:0x5226,0xE58B8D:0x5227,0xE58B97:0x5228,
	0xE58B9E:0x5229,0xE58BA3:0x522A,0xE58BA6:0x522B,0xE9A3AD:0x522C,0xE58BA0:0x522D,
	0xE58BB3:0x522E,0xE58BB5:0x522F,0xE58BB8:0x5230,0xE58BB9:0x5231,0xE58C86:0x5232,
	0xE58C88:0x5233,0xE794B8:0x5234,0xE58C8D:0x5235,0xE58C90:0x5236,0xE58C8F:0x5237,
	0xE58C95:0x5238,0xE58C9A:0x5239,0xE58CA3:0x523A,0xE58CAF:0x523B,0xE58CB1:0x523C,
	0xE58CB3:0x523D,0xE58CB8:0x523E,0xE58D80:0x523F,0xE58D86:0x5240,0xE58D85:0x5241,
	0xE4B897:0x5242,0xE58D89:0x5243,0xE58D8D:0x5244,0xE58796:0x5245,0xE58D9E:0x5246,
	0xE58DA9:0x5247,0xE58DAE:0x5248,0xE5A498:0x5249,0xE58DBB:0x524A,0xE58DB7:0x524B,
	0xE58E82:0x524C,0xE58E96:0x524D,0xE58EA0:0x524E,0xE58EA6:0x524F,0xE58EA5:0x5250,
	0xE58EAE:0x5251,0xE58EB0:0x5252,0xE58EB6:0x5253,0xE58F83:0x5254,0xE7B092:0x5255,
	0xE99B99:0x5256,0xE58F9F:0x5257,0xE69BBC:0x5258,0xE787AE:0x5259,0xE58FAE:0x525A,
	0xE58FA8:0x525B,0xE58FAD:0x525C,0xE58FBA:0x525D,0xE59081:0x525E,0xE590BD:0x525F,
	0xE59180:0x5260,0xE590AC:0x5261,0xE590AD:0x5262,0xE590BC:0x5263,0xE590AE:0x5264,
	0xE590B6:0x5265,0xE590A9:0x5266,0xE5909D:0x5267,0xE5918E:0x5268,0xE5928F:0x5269,
	0xE591B5:0x526A,0xE5928E:0x526B,0xE5919F:0x526C,0xE591B1:0x526D,0xE591B7:0x526E,
	0xE591B0:0x526F,0xE59292:0x5270,0xE591BB:0x5271,0xE59280:0x5272,0xE591B6:0x5273,
	0xE59284:0x5274,0xE59290:0x5275,0xE59286:0x5276,0xE59387:0x5277,0xE592A2:0x5278,
	0xE592B8:0x5279,0xE592A5:0x527A,0xE592AC:0x527B,0xE59384:0x527C,0xE59388:0x527D,
	0xE592A8:0x527E,0xE592AB:0x5321,0xE59382:0x5322,0xE592A4:0x5323,0xE592BE:0x5324,
	0xE592BC:0x5325,0xE59398:0x5326,0xE593A5:0x5327,0xE593A6:0x5328,0xE5948F:0x5329,
	0xE59494:0x532A,0xE593BD:0x532B,0xE593AE:0x532C,0xE593AD:0x532D,0xE593BA:0x532E,
	0xE593A2:0x532F,0xE594B9:0x5330,0xE59580:0x5331,0xE595A3:0x5332,0xE5958C:0x5333,
	0xE594AE:0x5334,0xE5959C:0x5335,0xE59585:0x5336,0xE59596:0x5337,0xE59597:0x5338,
	0xE594B8:0x5339,0xE594B3:0x533A,0xE5959D:0x533B,0xE59699:0x533C,0xE59680:0x533D,
	0xE592AF:0x533E,0xE5968A:0x533F,0xE5969F:0x5340,0xE595BB:0x5341,0xE595BE:0x5342,
	0xE59698:0x5343,0xE5969E:0x5344,0xE596AE:0x5345,0xE595BC:0x5346,0xE59683:0x5347,
	0xE596A9:0x5348,0xE59687:0x5349,0xE596A8:0x534A,0xE5979A:0x534B,0xE59785:0x534C,
	0xE5979F:0x534D,0xE59784:0x534E,0xE5979C:0x534F,0xE597A4:0x5350,0xE59794:0x5351,
	0xE59894:0x5352,0xE597B7:0x5353,0xE59896:0x5354,0xE597BE:0x5355,0xE597BD:0x5356,
	0xE5989B:0x5357,0xE597B9:0x5358,0xE5998E:0x5359,0xE59990:0x535A,0xE7879F:0x535B,
	0xE598B4:0x535C,0xE598B6:0x535D,0xE598B2:0x535E,0xE598B8:0x535F,0xE599AB:0x5360,
	0xE599A4:0x5361,0xE598AF:0x5362,0xE599AC:0x5363,0xE599AA:0x5364,0xE59A86:0x5365,
	0xE59A80:0x5366,0xE59A8A:0x5367,0xE59AA0:0x5368,0xE59A94:0x5369,0xE59A8F:0x536A,
	0xE59AA5:0x536B,0xE59AAE:0x536C,0xE59AB6:0x536D,0xE59AB4:0x536E,0xE59B82:0x536F,
	0xE59ABC:0x5370,0xE59B81:0x5371,0xE59B83:0x5372,0xE59B80:0x5373,0xE59B88:0x5374,
	0xE59B8E:0x5375,0xE59B91:0x5376,0xE59B93:0x5377,0xE59B97:0x5378,0xE59BAE:0x5379,
	0xE59BB9:0x537A,0xE59C80:0x537B,0xE59BBF:0x537C,0xE59C84:0x537D,0xE59C89:0x537E,
	0xE59C88:0x5421,0xE59C8B:0x5422,0xE59C8D:0x5423,0xE59C93:0x5424,0xE59C98:0x5425,
	0xE59C96:0x5426,0xE59787:0x5427,0xE59C9C:0x5428,0xE59CA6:0x5429,0xE59CB7:0x542A,
	0xE59CB8:0x542B,0xE59D8E:0x542C,0xE59CBB:0x542D,0xE59D80:0x542E,0xE59D8F:0x542F,
	0xE59DA9:0x5430,0xE59F80:0x5431,0xE59E88:0x5432,0xE59DA1:0x5433,0xE59DBF:0x5434,
	0xE59E89:0x5435,0xE59E93:0x5436,0xE59EA0:0x5437,0xE59EB3:0x5438,0xE59EA4:0x5439,
	0xE59EAA:0x543A,0xE59EB0:0x543B,0xE59F83:0x543C,0xE59F86:0x543D,0xE59F94:0x543E,
	0xE59F92:0x543F,0xE59F93:0x5440,0xE5A08A:0x5441,0xE59F96:0x5442,0xE59FA3:0x5443,
	0xE5A08B:0x5444,0xE5A099:0x5445,0xE5A09D:0x5446,0xE5A1B2:0x5447,0xE5A0A1:0x5448,
	0xE5A1A2:0x5449,0xE5A18B:0x544A,0xE5A1B0:0x544B,0xE6AF80:0x544C,0xE5A192:0x544D,
	0xE5A0BD:0x544E,0xE5A1B9:0x544F,0xE5A285:0x5450,0xE5A2B9:0x5451,0xE5A29F:0x5452,
	0xE5A2AB:0x5453,0xE5A2BA:0x5454,0xE5A39E:0x5455,0xE5A2BB:0x5456,0xE5A2B8:0x5457,
	0xE5A2AE:0x5458,0xE5A385:0x5459,0xE5A393:0x545A,0xE5A391:0x545B,0xE5A397:0x545C,
	0xE5A399:0x545D,0xE5A398:0x545E,0xE5A3A5:0x545F,0xE5A39C:0x5460,0xE5A3A4:0x5461,
	0xE5A39F:0x5462,0xE5A3AF:0x5463,0xE5A3BA:0x5464,0xE5A3B9:0x5465,0xE5A3BB:0x5466,
	0xE5A3BC:0x5467,0xE5A3BD:0x5468,0xE5A482:0x5469,0xE5A48A:0x546A,0xE5A490:0x546B,
	0xE5A49B:0x546C,0xE6A2A6:0x546D,0xE5A4A5:0x546E,0xE5A4AC:0x546F,0xE5A4AD:0x5470,
	0xE5A4B2:0x5471,0xE5A4B8:0x5472,0xE5A4BE:0x5473,0xE7AB92:0x5474,0xE5A595:0x5475,
	0xE5A590:0x5476,0xE5A58E:0x5477,0xE5A59A:0x5478,0xE5A598:0x5479,0xE5A5A2:0x547A,
	0xE5A5A0:0x547B,0xE5A5A7:0x547C,0xE5A5AC:0x547D,0xE5A5A9:0x547E,0xE5A5B8:0x5521,
	0xE5A681:0x5522,0xE5A69D:0x5523,0xE4BD9E:0x5524,0xE4BEAB:0x5525,0xE5A6A3:0x5526,
	0xE5A6B2:0x5527,0xE5A786:0x5528,0xE5A7A8:0x5529,0xE5A79C:0x552A,0xE5A68D:0x552B,
	0xE5A799:0x552C,0xE5A79A:0x552D,0xE5A8A5:0x552E,0xE5A89F:0x552F,0xE5A891:0x5530,
	0xE5A89C:0x5531,0xE5A889:0x5532,0xE5A89A:0x5533,0xE5A980:0x5534,0xE5A9AC:0x5535,
	0xE5A989:0x5536,0xE5A8B5:0x5537,0xE5A8B6:0x5538,0xE5A9A2:0x5539,0xE5A9AA:0x553A,
	0xE5AA9A:0x553B,0xE5AABC:0x553C,0xE5AABE:0x553D,0xE5AB8B:0x553E,0xE5AB82:0x553F,
	0xE5AABD:0x5540,0xE5ABA3:0x5541,0xE5AB97:0x5542,0xE5ABA6:0x5543,0xE5ABA9:0x5544,
	0xE5AB96:0x5545,0xE5ABBA:0x5546,0xE5ABBB:0x5547,0xE5AC8C:0x5548,0xE5AC8B:0x5549,
	0xE5AC96:0x554A,0xE5ACB2:0x554B,0xE5AB90:0x554C,0xE5ACAA:0x554D,0xE5ACB6:0x554E,
	0xE5ACBE:0x554F,0xE5AD83:0x5550,0xE5AD85:0x5551,0xE5AD80:0x5552,0xE5AD91:0x5553,
	0xE5AD95:0x5554,0xE5AD9A:0x5555,0xE5AD9B:0x5556,0xE5ADA5:0x5557,0xE5ADA9:0x5558,
	0xE5ADB0:0x5559,0xE5ADB3:0x555A,0xE5ADB5:0x555B,0xE5ADB8:0x555C,0xE69688:0x555D,
	0xE5ADBA:0x555E,0xE5AE80:0x555F,0xE5AE83:0x5560,0xE5AEA6:0x5561,0xE5AEB8:0x5562,
	0xE5AF83:0x5563,0xE5AF87:0x5564,0xE5AF89:0x5565,0xE5AF94:0x5566,0xE5AF90:0x5567,
	0xE5AFA4:0x5568,0xE5AFA6:0x5569,0xE5AFA2:0x556A,0xE5AF9E:0x556B,0xE5AFA5:0x556C,
	0xE5AFAB:0x556D,0xE5AFB0:0x556E,0xE5AFB6:0x556F,0xE5AFB3:0x5570,0xE5B085:0x5571,
	0xE5B087:0x5572,0xE5B088:0x5573,0xE5B08D:0x5574,0xE5B093:0x5575,0xE5B0A0:0x5576,
	0xE5B0A2:0x5577,0xE5B0A8:0x5578,0xE5B0B8:0x5579,0xE5B0B9:0x557A,0xE5B181:0x557B,
	0xE5B186:0x557C,0xE5B18E:0x557D,0xE5B193:0x557E,0xE5B190:0x5621,0xE5B18F:0x5622,
	0xE5ADB1:0x5623,0xE5B1AC:0x5624,0xE5B1AE:0x5625,0xE4B9A2:0x5626,0xE5B1B6:0x5627,
	0xE5B1B9:0x5628,0xE5B28C:0x5629,0xE5B291:0x562A,0xE5B294:0x562B,0xE5A69B:0x562C,
	0xE5B2AB:0x562D,0xE5B2BB:0x562E,0xE5B2B6:0x562F,0xE5B2BC:0x5630,0xE5B2B7:0x5631,
	0xE5B385:0x5632,0xE5B2BE:0x5633,0xE5B387:0x5634,0xE5B399:0x5635,0xE5B3A9:0x5636,
	0xE5B3BD:0x5637,0xE5B3BA:0x5638,0xE5B3AD:0x5639,0xE5B68C:0x563A,0xE5B3AA:0x563B,
	0xE5B48B:0x563C,0xE5B495:0x563D,0xE5B497:0x563E,0xE5B59C:0x563F,0xE5B49F:0x5640,
	0xE5B49B:0x5641,0xE5B491:0x5642,0xE5B494:0x5643,0xE5B4A2:0x5644,0xE5B49A:0x5645,
	0xE5B499:0x5646,0xE5B498:0x5647,0xE5B58C:0x5648,0xE5B592:0x5649,0xE5B58E:0x564A,
	0xE5B58B:0x564B,0xE5B5AC:0x564C,0xE5B5B3:0x564D,0xE5B5B6:0x564E,0xE5B687:0x564F,
	0xE5B684:0x5650,0xE5B682:0x5651,0xE5B6A2:0x5652,0xE5B69D:0x5653,0xE5B6AC:0x5654,
	0xE5B6AE:0x5655,0xE5B6BD:0x5656,0xE5B690:0x5657,0xE5B6B7:0x5658,0xE5B6BC:0x5659,
	0xE5B789:0x565A,0xE5B78D:0x565B,0xE5B793:0x565C,0xE5B792:0x565D,0xE5B796:0x565E,
	0xE5B79B:0x565F,0xE5B7AB:0x5660,0xE5B7B2:0x5661,0xE5B7B5:0x5662,0xE5B88B:0x5663,
	0xE5B89A:0x5664,0xE5B899:0x5665,0xE5B891:0x5666,0xE5B89B:0x5667,0xE5B8B6:0x5668,
	0xE5B8B7:0x5669,0xE5B984:0x566A,0xE5B983:0x566B,0xE5B980:0x566C,0xE5B98E:0x566D,
	0xE5B997:0x566E,0xE5B994:0x566F,0xE5B99F:0x5670,0xE5B9A2:0x5671,0xE5B9A4:0x5672,
	0xE5B987:0x5673,0xE5B9B5:0x5674,0xE5B9B6:0x5675,0xE5B9BA:0x5676,0xE9BABC:0x5677,
	0xE5B9BF:0x5678,0xE5BAA0:0x5679,0xE5BB81:0x567A,0xE5BB82:0x567B,0xE5BB88:0x567C,
	0xE5BB90:0x567D,0xE5BB8F:0x567E,0xE5BB96:0x5721,0xE5BBA3:0x5722,0xE5BB9D:0x5723,
	0xE5BB9A:0x5724,0xE5BB9B:0x5725,0xE5BBA2:0x5726,0xE5BBA1:0x5727,0xE5BBA8:0x5728,
	0xE5BBA9:0x5729,0xE5BBAC:0x572A,0xE5BBB1:0x572B,0xE5BBB3:0x572C,0xE5BBB0:0x572D,
	0xE5BBB4:0x572E,0xE5BBB8:0x572F,0xE5BBBE:0x5730,0xE5BC83:0x5731,0xE5BC89:0x5732,
	0xE5BD9D:0x5733,0xE5BD9C:0x5734,0xE5BC8B:0x5735,0xE5BC91:0x5736,0xE5BC96:0x5737,
	0xE5BCA9:0x5738,0xE5BCAD:0x5739,0xE5BCB8:0x573A,0xE5BD81:0x573B,0xE5BD88:0x573C,
	0xE5BD8C:0x573D,0xE5BD8E:0x573E,0xE5BCAF:0x573F,0xE5BD91:0x5740,0xE5BD96:0x5741,
	0xE5BD97:0x5742,0xE5BD99:0x5743,0xE5BDA1:0x5744,0xE5BDAD:0x5745,0xE5BDB3:0x5746,
	0xE5BDB7:0x5747,0xE5BE83:0x5748,0xE5BE82:0x5749,0xE5BDBF:0x574A,0xE5BE8A:0x574B,
	0xE5BE88:0x574C,0xE5BE91:0x574D,0xE5BE87:0x574E,0xE5BE9E:0x574F,0xE5BE99:0x5750,
	0xE5BE98:0x5751,0xE5BEA0:0x5752,0xE5BEA8:0x5753,0xE5BEAD:0x5754,0xE5BEBC:0x5755,
	0xE5BF96:0x5756,0xE5BFBB:0x5757,0xE5BFA4:0x5758,0xE5BFB8:0x5759,0xE5BFB1:0x575A,
	0xE5BF9D:0x575B,0xE682B3:0x575C,0xE5BFBF:0x575D,0xE680A1:0x575E,0xE681A0:0x575F,
	0xE68099:0x5760,0xE68090:0x5761,0xE680A9:0x5762,0xE6808E:0x5763,0xE680B1:0x5764,
	0xE6809B:0x5765,0xE68095:0x5766,0xE680AB:0x5767,0xE680A6:0x5768,0xE6808F:0x5769,
	0xE680BA:0x576A,0xE6819A:0x576B,0xE68181:0x576C,0xE681AA:0x576D,0xE681B7:0x576E,
	0xE6819F:0x576F,0xE6818A:0x5770,0xE68186:0x5771,0xE6818D:0x5772,0xE681A3:0x5773,
	0xE68183:0x5774,0xE681A4:0x5775,0xE68182:0x5776,0xE681AC:0x5777,0xE681AB:0x5778,
	0xE68199:0x5779,0xE68281:0x577A,0xE6828D:0x577B,0xE683A7:0x577C,0xE68283:0x577D,
	0xE6829A:0x577E,0xE68284:0x5821,0xE6829B:0x5822,0xE68296:0x5823,0xE68297:0x5824,
	0xE68292:0x5825,0xE682A7:0x5826,0xE6828B:0x5827,0xE683A1:0x5828,0xE682B8:0x5829,
	0xE683A0:0x582A,0xE68393:0x582B,0xE682B4:0x582C,0xE5BFB0:0x582D,0xE682BD:0x582E,
	0xE68386:0x582F,0xE682B5:0x5830,0xE68398:0x5831,0xE6858D:0x5832,0xE68495:0x5833,
	0xE68486:0x5834,0xE683B6:0x5835,0xE683B7:0x5836,0xE68480:0x5837,0xE683B4:0x5838,
	0xE683BA:0x5839,0xE68483:0x583A,0xE684A1:0x583B,0xE683BB:0x583C,0xE683B1:0x583D,
	0xE6848D:0x583E,0xE6848E:0x583F,0xE68587:0x5840,0xE684BE:0x5841,0xE684A8:0x5842,
	0xE684A7:0x5843,0xE6858A:0x5844,0xE684BF:0x5845,0xE684BC:0x5846,0xE684AC:0x5847,
	0xE684B4:0x5848,0xE684BD:0x5849,0xE68582:0x584A,0xE68584:0x584B,0xE685B3:0x584C,
	0xE685B7:0x584D,0xE68598:0x584E,0xE68599:0x584F,0xE6859A:0x5850,0xE685AB:0x5851,
	0xE685B4:0x5852,0xE685AF:0x5853,0xE685A5:0x5854,0xE685B1:0x5855,0xE6859F:0x5856,
	0xE6859D:0x5857,0xE68593:0x5858,0xE685B5:0x5859,0xE68699:0x585A,0xE68696:0x585B,
	0xE68687:0x585C,0xE686AC:0x585D,0xE68694:0x585E,0xE6869A:0x585F,0xE6868A:0x5860,
	0xE68691:0x5861,0xE686AB:0x5862,0xE686AE:0x5863,0xE6878C:0x5864,0xE6878A:0x5865,
	0xE68789:0x5866,0xE687B7:0x5867,0xE68788:0x5868,0xE68783:0x5869,0xE68786:0x586A,
	0xE686BA:0x586B,0xE6878B:0x586C,0xE7BDB9:0x586D,0xE6878D:0x586E,0xE687A6:0x586F,
	0xE687A3:0x5870,0xE687B6:0x5871,0xE687BA:0x5872,0xE687B4:0x5873,0xE687BF:0x5874,
	0xE687BD:0x5875,0xE687BC:0x5876,0xE687BE:0x5877,0xE68880:0x5878,0xE68888:0x5879,
	0xE68889:0x587A,0xE6888D:0x587B,0xE6888C:0x587C,0xE68894:0x587D,0xE6889B:0x587E,
	0xE6889E:0x5921,0xE688A1:0x5922,0xE688AA:0x5923,0xE688AE:0x5924,0xE688B0:0x5925,
	0xE688B2:0x5926,0xE688B3:0x5927,0xE68981:0x5928,0xE6898E:0x5929,0xE6899E:0x592A,
	0xE689A3:0x592B,0xE6899B:0x592C,0xE689A0:0x592D,0xE689A8:0x592E,0xE689BC:0x592F,
	0xE68A82:0x5930,0xE68A89:0x5931,0xE689BE:0x5932,0xE68A92:0x5933,0xE68A93:0x5934,
	0xE68A96:0x5935,0xE68B94:0x5936,0xE68A83:0x5937,0xE68A94:0x5938,0xE68B97:0x5939,
	0xE68B91:0x593A,0xE68ABB:0x593B,0xE68B8F:0x593C,0xE68BBF:0x593D,0xE68B86:0x593E,
	0xE69394:0x593F,0xE68B88:0x5940,0xE68B9C:0x5941,0xE68B8C:0x5942,0xE68B8A:0x5943,
	0xE68B82:0x5944,0xE68B87:0x5945,0xE68A9B:0x5946,0xE68B89:0x5947,0xE68C8C:0x5948,
	0xE68BAE:0x5949,0xE68BB1:0x594A,0xE68CA7:0x594B,0xE68C82:0x594C,0xE68C88:0x594D,
	0xE68BAF:0x594E,0xE68BB5:0x594F,0xE68D90:0x5950,0xE68CBE:0x5951,0xE68D8D:0x5952,
	0xE6909C:0x5953,0xE68D8F:0x5954,0xE68E96:0x5955,0xE68E8E:0x5956,0xE68E80:0x5957,
	0xE68EAB:0x5958,0xE68DB6:0x5959,0xE68EA3:0x595A,0xE68E8F:0x595B,0xE68E89:0x595C,
	0xE68E9F:0x595D,0xE68EB5:0x595E,0xE68DAB:0x595F,0xE68DA9:0x5960,0xE68EBE:0x5961,
	0xE68FA9:0x5962,0xE68F80:0x5963,0xE68F86:0x5964,0xE68FA3:0x5965,0xE68F89:0x5966,
	0xE68F92:0x5967,0xE68FB6:0x5968,0xE68F84:0x5969,0xE69096:0x596A,0xE690B4:0x596B,
	0xE69086:0x596C,0xE69093:0x596D,0xE690A6:0x596E,0xE690B6:0x596F,0xE6949D:0x5970,
	0xE69097:0x5971,0xE690A8:0x5972,0xE6908F:0x5973,0xE691A7:0x5974,0xE691AF:0x5975,
	0xE691B6:0x5976,0xE6918E:0x5977,0xE694AA:0x5978,0xE69295:0x5979,0xE69293:0x597A,
	0xE692A5:0x597B,0xE692A9:0x597C,0xE69288:0x597D,0xE692BC:0x597E,0xE6939A:0x5A21,
	0xE69392:0x5A22,0xE69385:0x5A23,0xE69387:0x5A24,0xE692BB:0x5A25,0xE69398:0x5A26,
	0xE69382:0x5A27,0xE693B1:0x5A28,0xE693A7:0x5A29,0xE88889:0x5A2A,0xE693A0:0x5A2B,
	0xE693A1:0x5A2C,0xE68AAC:0x5A2D,0xE693A3:0x5A2E,0xE693AF:0x5A2F,0xE694AC:0x5A30,
	0xE693B6:0x5A31,0xE693B4:0x5A32,0xE693B2:0x5A33,0xE693BA:0x5A34,0xE69480:0x5A35,
	0xE693BD:0x5A36,0xE69498:0x5A37,0xE6949C:0x5A38,0xE69485:0x5A39,0xE694A4:0x5A3A,
	0xE694A3:0x5A3B,0xE694AB:0x5A3C,0xE694B4:0x5A3D,0xE694B5:0x5A3E,0xE694B7:0x5A3F,
	0xE694B6:0x5A40,0xE694B8:0x5A41,0xE7958B:0x5A42,0xE69588:0x5A43,0xE69596:0x5A44,
	0xE69595:0x5A45,0xE6958D:0x5A46,0xE69598:0x5A47,0xE6959E:0x5A48,0xE6959D:0x5A49,
	0xE695B2:0x5A4A,0xE695B8:0x5A4B,0xE69682:0x5A4C,0xE69683:0x5A4D,0xE8AE8A:0x5A4E,
	0xE6969B:0x5A4F,0xE6969F:0x5A50,0xE696AB:0x5A51,0xE696B7:0x5A52,0xE69783:0x5A53,
	0xE69786:0x5A54,0xE69781:0x5A55,0xE69784:0x5A56,0xE6978C:0x5A57,0xE69792:0x5A58,
	0xE6979B:0x5A59,0xE69799:0x5A5A,0xE697A0:0x5A5B,0xE697A1:0x5A5C,0xE697B1:0x5A5D,
	0xE69DB2:0x5A5E,0xE6988A:0x5A5F,0xE69883:0x5A60,0xE697BB:0x5A61,0xE69DB3:0x5A62,
	0xE698B5:0x5A63,0xE698B6:0x5A64,0xE698B4:0x5A65,0xE6989C:0x5A66,0xE6998F:0x5A67,
	0xE69984:0x5A68,0xE69989:0x5A69,0xE69981:0x5A6A,0xE6999E:0x5A6B,0xE6999D:0x5A6C,
	0xE699A4:0x5A6D,0xE699A7:0x5A6E,0xE699A8:0x5A6F,0xE6999F:0x5A70,0xE699A2:0x5A71,
	0xE699B0:0x5A72,0xE69A83:0x5A73,0xE69A88:0x5A74,0xE69A8E:0x5A75,0xE69A89:0x5A76,
	0xE69A84:0x5A77,0xE69A98:0x5A78,0xE69A9D:0x5A79,0xE69B81:0x5A7A,0xE69AB9:0x5A7B,
	0xE69B89:0x5A7C,0xE69ABE:0x5A7D,0xE69ABC:0x5A7E,0xE69B84:0x5B21,0xE69AB8:0x5B22,
	0xE69B96:0x5B23,0xE69B9A:0x5B24,0xE69BA0:0x5B25,0xE698BF:0x5B26,0xE69BA6:0x5B27,
	0xE69BA9:0x5B28,0xE69BB0:0x5B29,0xE69BB5:0x5B2A,0xE69BB7:0x5B2B,0xE69C8F:0x5B2C,
	0xE69C96:0x5B2D,0xE69C9E:0x5B2E,0xE69CA6:0x5B2F,0xE69CA7:0x5B30,0xE99CB8:0x5B31,
	0xE69CAE:0x5B32,0xE69CBF:0x5B33,0xE69CB6:0x5B34,0xE69D81:0x5B35,0xE69CB8:0x5B36,
	0xE69CB7:0x5B37,0xE69D86:0x5B38,0xE69D9E:0x5B39,0xE69DA0:0x5B3A,0xE69D99:0x5B3B,
	0xE69DA3:0x5B3C,0xE69DA4:0x5B3D,0xE69E89:0x5B3E,0xE69DB0:0x5B3F,0xE69EA9:0x5B40,
	0xE69DBC:0x5B41,0xE69DAA:0x5B42,0xE69E8C:0x5B43,0xE69E8B:0x5B44,0xE69EA6:0x5B45,
	0xE69EA1:0x5B46,0xE69E85:0x5B47,0xE69EB7:0x5B48,0xE69FAF:0x5B49,0xE69EB4:0x5B4A,
	0xE69FAC:0x5B4B,0xE69EB3:0x5B4C,0xE69FA9:0x5B4D,0xE69EB8:0x5B4E,0xE69FA4:0x5B4F,
	0xE69F9E:0x5B50,0xE69F9D:0x5B51,0xE69FA2:0x5B52,0xE69FAE:0x5B53,0xE69EB9:0x5B54,
	0xE69F8E:0x5B55,0xE69F86:0x5B56,0xE69FA7:0x5B57,0xE6AA9C:0x5B58,0xE6A09E:0x5B59,
	0xE6A186:0x5B5A,0xE6A0A9:0x5B5B,0xE6A180:0x5B5C,0xE6A18D:0x5B5D,0xE6A0B2:0x5B5E,
	0xE6A18E:0x5B5F,0xE6A2B3:0x5B60,0xE6A0AB:0x5B61,0xE6A199:0x5B62,0xE6A1A3:0x5B63,
	0xE6A1B7:0x5B64,0xE6A1BF:0x5B65,0xE6A29F:0x5B66,0xE6A28F:0x5B67,0xE6A2AD:0x5B68,
	0xE6A294:0x5B69,0xE6A29D:0x5B6A,0xE6A29B:0x5B6B,0xE6A283:0x5B6C,0xE6AAAE:0x5B6D,
	0xE6A2B9:0x5B6E,0xE6A1B4:0x5B6F,0xE6A2B5:0x5B70,0xE6A2A0:0x5B71,0xE6A2BA:0x5B72,
	0xE6A48F:0x5B73,0xE6A28D:0x5B74,0xE6A1BE:0x5B75,0xE6A481:0x5B76,0xE6A38A:0x5B77,
	0xE6A488:0x5B78,0xE6A398:0x5B79,0xE6A4A2:0x5B7A,0xE6A4A6:0x5B7B,0xE6A3A1:0x5B7C,
	0xE6A48C:0x5B7D,0xE6A38D:0x5B7E,0xE6A394:0x5C21,0xE6A3A7:0x5C22,0xE6A395:0x5C23,
	0xE6A4B6:0x5C24,0xE6A492:0x5C25,0xE6A484:0x5C26,0xE6A397:0x5C27,0xE6A3A3:0x5C28,
	0xE6A4A5:0x5C29,0xE6A3B9:0x5C2A,0xE6A3A0:0x5C2B,0xE6A3AF:0x5C2C,0xE6A4A8:0x5C2D,
	0xE6A4AA:0x5C2E,0xE6A49A:0x5C2F,0xE6A4A3:0x5C30,0xE6A4A1:0x5C31,0xE6A386:0x5C32,
	0xE6A5B9:0x5C33,0xE6A5B7:0x5C34,0xE6A59C:0x5C35,0xE6A5B8:0x5C36,0xE6A5AB:0x5C37,
	0xE6A594:0x5C38,0xE6A5BE:0x5C39,0xE6A5AE:0x5C3A,0xE6A4B9:0x5C3B,0xE6A5B4:0x5C3C,
	0xE6A4BD:0x5C3D,0xE6A599:0x5C3E,0xE6A4B0:0x5C3F,0xE6A5A1:0x5C40,0xE6A59E:0x5C41,
	0xE6A59D:0x5C42,0xE6A681:0x5C43,0xE6A5AA:0x5C44,0xE6A6B2:0x5C45,0xE6A6AE:0x5C46,
	0xE6A790:0x5C47,0xE6A6BF:0x5C48,0xE6A781:0x5C49,0xE6A793:0x5C4A,0xE6A6BE:0x5C4B,
	0xE6A78E:0x5C4C,0xE5AFA8:0x5C4D,0xE6A78A:0x5C4E,0xE6A79D:0x5C4F,0xE6A6BB:0x5C50,
	0xE6A783:0x5C51,0xE6A6A7:0x5C52,0xE6A8AE:0x5C53,0xE6A691:0x5C54,0xE6A6A0:0x5C55,
	0xE6A69C:0x5C56,0xE6A695:0x5C57,0xE6A6B4:0x5C58,0xE6A79E:0x5C59,0xE6A7A8:0x5C5A,
	0xE6A882:0x5C5B,0xE6A89B:0x5C5C,0xE6A7BF:0x5C5D,0xE6AC8A:0x5C5E,0xE6A7B9:0x5C5F,
	0xE6A7B2:0x5C60,0xE6A7A7:0x5C61,0xE6A885:0x5C62,0xE6A6B1:0x5C63,0xE6A89E:0x5C64,
	0xE6A7AD:0x5C65,0xE6A894:0x5C66,0xE6A7AB:0x5C67,0xE6A88A:0x5C68,0xE6A892:0x5C69,
	0xE6AB81:0x5C6A,0xE6A8A3:0x5C6B,0xE6A893:0x5C6C,0xE6A984:0x5C6D,0xE6A88C:0x5C6E,
	0xE6A9B2:0x5C6F,0xE6A8B6:0x5C70,0xE6A9B8:0x5C71,0xE6A987:0x5C72,0xE6A9A2:0x5C73,
	0xE6A999:0x5C74,0xE6A9A6:0x5C75,0xE6A988:0x5C76,0xE6A8B8:0x5C77,0xE6A8A2:0x5C78,
	0xE6AA90:0x5C79,0xE6AA8D:0x5C7A,0xE6AAA0:0x5C7B,0xE6AA84:0x5C7C,0xE6AAA2:0x5C7D,
	0xE6AAA3:0x5C7E,0xE6AA97:0x5D21,0xE89897:0x5D22,0xE6AABB:0x5D23,0xE6AB83:0x5D24,
	0xE6AB82:0x5D25,0xE6AAB8:0x5D26,0xE6AAB3:0x5D27,0xE6AAAC:0x5D28,0xE6AB9E:0x5D29,
	0xE6AB91:0x5D2A,0xE6AB9F:0x5D2B,0xE6AAAA:0x5D2C,0xE6AB9A:0x5D2D,0xE6ABAA:0x5D2E,
	0xE6ABBB:0x5D2F,0xE6AC85:0x5D30,0xE89896:0x5D31,0xE6ABBA:0x5D32,0xE6AC92:0x5D33,
	0xE6AC96:0x5D34,0xE9ACB1:0x5D35,0xE6AC9F:0x5D36,0xE6ACB8:0x5D37,0xE6ACB7:0x5D38,
	0xE79B9C:0x5D39,0xE6ACB9:0x5D3A,0xE9A3AE:0x5D3B,0xE6AD87:0x5D3C,0xE6AD83:0x5D3D,
	0xE6AD89:0x5D3E,0xE6AD90:0x5D3F,0xE6AD99:0x5D40,0xE6AD94:0x5D41,0xE6AD9B:0x5D42,
	0xE6AD9F:0x5D43,0xE6ADA1:0x5D44,0xE6ADB8:0x5D45,0xE6ADB9:0x5D46,0xE6ADBF:0x5D47,
	0xE6AE80:0x5D48,0xE6AE84:0x5D49,0xE6AE83:0x5D4A,0xE6AE8D:0x5D4B,0xE6AE98:0x5D4C,
	0xE6AE95:0x5D4D,0xE6AE9E:0x5D4E,0xE6AEA4:0x5D4F,0xE6AEAA:0x5D50,0xE6AEAB:0x5D51,
	0xE6AEAF:0x5D52,0xE6AEB2:0x5D53,0xE6AEB1:0x5D54,0xE6AEB3:0x5D55,0xE6AEB7:0x5D56,
	0xE6AEBC:0x5D57,0xE6AF86:0x5D58,0xE6AF8B:0x5D59,0xE6AF93:0x5D5A,0xE6AF9F:0x5D5B,
	0xE6AFAC:0x5D5C,0xE6AFAB:0x5D5D,0xE6AFB3:0x5D5E,0xE6AFAF:0x5D5F,0xE9BABE:0x5D60,
	0xE6B088:0x5D61,0xE6B093:0x5D62,0xE6B094:0x5D63,0xE6B09B:0x5D64,0xE6B0A4:0x5D65,
	0xE6B0A3:0x5D66,0xE6B19E:0x5D67,0xE6B195:0x5D68,0xE6B1A2:0x5D69,0xE6B1AA:0x5D6A,
	0xE6B282:0x5D6B,0xE6B28D:0x5D6C,0xE6B29A:0x5D6D,0xE6B281:0x5D6E,0xE6B29B:0x5D6F,
	0xE6B1BE:0x5D70,0xE6B1A8:0x5D71,0xE6B1B3:0x5D72,0xE6B292:0x5D73,0xE6B290:0x5D74,
	0xE6B384:0x5D75,0xE6B3B1:0x5D76,0xE6B393:0x5D77,0xE6B2BD:0x5D78,0xE6B397:0x5D79,
	0xE6B385:0x5D7A,0xE6B39D:0x5D7B,0xE6B2AE:0x5D7C,0xE6B2B1:0x5D7D,0xE6B2BE:0x5D7E,
	0xE6B2BA:0x5E21,0xE6B39B:0x5E22,0xE6B3AF:0x5E23,0xE6B399:0x5E24,0xE6B3AA:0x5E25,
	0xE6B49F:0x5E26,0xE8A18D:0x5E27,0xE6B4B6:0x5E28,0xE6B4AB:0x5E29,0xE6B4BD:0x5E2A,
	0xE6B4B8:0x5E2B,0xE6B499:0x5E2C,0xE6B4B5:0x5E2D,0xE6B4B3:0x5E2E,0xE6B492:0x5E2F,
	0xE6B48C:0x5E30,0xE6B5A3:0x5E31,0xE6B693:0x5E32,0xE6B5A4:0x5E33,0xE6B59A:0x5E34,
	0xE6B5B9:0x5E35,0xE6B599:0x5E36,0xE6B68E:0x5E37,0xE6B695:0x5E38,0xE6BFA4:0x5E39,
	0xE6B685:0x5E3A,0xE6B7B9:0x5E3B,0xE6B895:0x5E3C,0xE6B88A:0x5E3D,0xE6B6B5:0x5E3E,
	0xE6B787:0x5E3F,0xE6B7A6:0x5E40,0xE6B6B8:0x5E41,0xE6B786:0x5E42,0xE6B7AC:0x5E43,
	0xE6B79E:0x5E44,0xE6B78C:0x5E45,0xE6B7A8:0x5E46,0xE6B792:0x5E47,0xE6B785:0x5E48,
	0xE6B7BA:0x5E49,0xE6B799:0x5E4A,0xE6B7A4:0x5E4B,0xE6B795:0x5E4C,0xE6B7AA:0x5E4D,
	0xE6B7AE:0x5E4E,0xE6B8AD:0x5E4F,0xE6B9AE:0x5E50,0xE6B8AE:0x5E51,0xE6B899:0x5E52,
	0xE6B9B2:0x5E53,0xE6B99F:0x5E54,0xE6B8BE:0x5E55,0xE6B8A3:0x5E56,0xE6B9AB:0x5E57,
	0xE6B8AB:0x5E58,0xE6B9B6:0x5E59,0xE6B98D:0x5E5A,0xE6B89F:0x5E5B,0xE6B983:0x5E5C,
	0xE6B8BA:0x5E5D,0xE6B98E:0x5E5E,0xE6B8A4:0x5E5F,0xE6BBBF:0x5E60,0xE6B89D:0x5E61,
	0xE6B8B8:0x5E62,0xE6BA82:0x5E63,0xE6BAAA:0x5E64,0xE6BA98:0x5E65,0xE6BB89:0x5E66,
	0xE6BAB7:0x5E67,0xE6BB93:0x5E68,0xE6BABD:0x5E69,0xE6BAAF:0x5E6A,0xE6BB84:0x5E6B,
	0xE6BAB2:0x5E6C,0xE6BB94:0x5E6D,0xE6BB95:0x5E6E,0xE6BA8F:0x5E6F,0xE6BAA5:0x5E70,
	0xE6BB82:0x5E71,0xE6BA9F:0x5E72,0xE6BD81:0x5E73,0xE6BC91:0x5E74,0xE7818C:0x5E75,
	0xE6BBAC:0x5E76,0xE6BBB8:0x5E77,0xE6BBBE:0x5E78,0xE6BCBF:0x5E79,0xE6BBB2:0x5E7A,
	0xE6BCB1:0x5E7B,0xE6BBAF:0x5E7C,0xE6BCB2:0x5E7D,0xE6BB8C:0x5E7E,0xE6BCBE:0x5F21,
	0xE6BC93:0x5F22,0xE6BBB7:0x5F23,0xE6BE86:0x5F24,0xE6BDBA:0x5F25,0xE6BDB8:0x5F26,
	0xE6BE81:0x5F27,0xE6BE80:0x5F28,0xE6BDAF:0x5F29,0xE6BD9B:0x5F2A,0xE6BFB3:0x5F2B,
	0xE6BDAD:0x5F2C,0xE6BE82:0x5F2D,0xE6BDBC:0x5F2E,0xE6BD98:0x5F2F,0xE6BE8E:0x5F30,
	0xE6BE91:0x5F31,0xE6BF82:0x5F32,0xE6BDA6:0x5F33,0xE6BEB3:0x5F34,0xE6BEA3:0x5F35,
	0xE6BEA1:0x5F36,0xE6BEA4:0x5F37,0xE6BEB9:0x5F38,0xE6BF86:0x5F39,0xE6BEAA:0x5F3A,
	0xE6BF9F:0x5F3B,0xE6BF95:0x5F3C,0xE6BFAC:0x5F3D,0xE6BF94:0x5F3E,0xE6BF98:0x5F3F,
	0xE6BFB1:0x5F40,0xE6BFAE:0x5F41,0xE6BF9B:0x5F42,0xE78089:0x5F43,0xE7808B:0x5F44,
	0xE6BFBA:0x5F45,0xE78091:0x5F46,0xE78081:0x5F47,0xE7808F:0x5F48,0xE6BFBE:0x5F49,
	0xE7809B:0x5F4A,0xE7809A:0x5F4B,0xE6BDB4:0x5F4C,0xE7809D:0x5F4D,0xE78098:0x5F4E,
	0xE7809F:0x5F4F,0xE780B0:0x5F50,0xE780BE:0x5F51,0xE780B2:0x5F52,0xE78191:0x5F53,
	0xE781A3:0x5F54,0xE78299:0x5F55,0xE78292:0x5F56,0xE782AF:0x5F57,0xE783B1:0x5F58,
	0xE782AC:0x5F59,0xE782B8:0x5F5A,0xE782B3:0x5F5B,0xE782AE:0x5F5C,0xE7839F:0x5F5D,
	0xE7838B:0x5F5E,0xE7839D:0x5F5F,0xE78399:0x5F60,0xE78489:0x5F61,0xE783BD:0x5F62,
	0xE7849C:0x5F63,0xE78499:0x5F64,0xE785A5:0x5F65,0xE78595:0x5F66,0xE78688:0x5F67,
	0xE785A6:0x5F68,0xE785A2:0x5F69,0xE7858C:0x5F6A,0xE78596:0x5F6B,0xE785AC:0x5F6C,
	0xE7868F:0x5F6D,0xE787BB:0x5F6E,0xE78684:0x5F6F,0xE78695:0x5F70,0xE786A8:0x5F71,
	0xE786AC:0x5F72,0xE78797:0x5F73,0xE786B9:0x5F74,0xE786BE:0x5F75,0xE78792:0x5F76,
	0xE78789:0x5F77,0xE78794:0x5F78,0xE7878E:0x5F79,0xE787A0:0x5F7A,0xE787AC:0x5F7B,
	0xE787A7:0x5F7C,0xE787B5:0x5F7D,0xE787BC:0x5F7E,0xE787B9:0x6021,0xE787BF:0x6022,
	0xE7888D:0x6023,0xE78890:0x6024,0xE7889B:0x6025,0xE788A8:0x6026,0xE788AD:0x6027,
	0xE788AC:0x6028,0xE788B0:0x6029,0xE788B2:0x602A,0xE788BB:0x602B,0xE788BC:0x602C,
	0xE788BF:0x602D,0xE78980:0x602E,0xE78986:0x602F,0xE7898B:0x6030,0xE78998:0x6031,
	0xE789B4:0x6032,0xE789BE:0x6033,0xE78A82:0x6034,0xE78A81:0x6035,0xE78A87:0x6036,
	0xE78A92:0x6037,0xE78A96:0x6038,0xE78AA2:0x6039,0xE78AA7:0x603A,0xE78AB9:0x603B,
	0xE78AB2:0x603C,0xE78B83:0x603D,0xE78B86:0x603E,0xE78B84:0x603F,0xE78B8E:0x6040,
	0xE78B92:0x6041,0xE78BA2:0x6042,0xE78BA0:0x6043,0xE78BA1:0x6044,0xE78BB9:0x6045,
	0xE78BB7:0x6046,0xE5808F:0x6047,0xE78C97:0x6048,0xE78C8A:0x6049,0xE78C9C:0x604A,
	0xE78C96:0x604B,0xE78C9D:0x604C,0xE78CB4:0x604D,0xE78CAF:0x604E,0xE78CA9:0x604F,
	0xE78CA5:0x6050,0xE78CBE:0x6051,0xE78D8E:0x6052,0xE78D8F:0x6053,0xE9BB98:0x6054,
	0xE78D97:0x6055,0xE78DAA:0x6056,0xE78DA8:0x6057,0xE78DB0:0x6058,0xE78DB8:0x6059,
	0xE78DB5:0x605A,0xE78DBB:0x605B,0xE78DBA:0x605C,0xE78F88:0x605D,0xE78EB3:0x605E,
	0xE78F8E:0x605F,0xE78EBB:0x6060,0xE78F80:0x6061,0xE78FA5:0x6062,0xE78FAE:0x6063,
	0xE78F9E:0x6064,0xE792A2:0x6065,0xE79085:0x6066,0xE791AF:0x6067,0xE790A5:0x6068,
	0xE78FB8:0x6069,0xE790B2:0x606A,0xE790BA:0x606B,0xE79195:0x606C,0xE790BF:0x606D,
	0xE7919F:0x606E,0xE79199:0x606F,0xE79181:0x6070,0xE7919C:0x6071,0xE791A9:0x6072,
	0xE791B0:0x6073,0xE791A3:0x6074,0xE791AA:0x6075,0xE791B6:0x6076,0xE791BE:0x6077,
	0xE7928B:0x6078,0xE7929E:0x6079,0xE792A7:0x607A,0xE7938A:0x607B,0xE7938F:0x607C,
	0xE79394:0x607D,0xE78FB1:0x607E,0xE793A0:0x6121,0xE793A3:0x6122,0xE793A7:0x6123,
	0xE793A9:0x6124,0xE793AE:0x6125,0xE793B2:0x6126,0xE793B0:0x6127,0xE793B1:0x6128,
	0xE793B8:0x6129,0xE793B7:0x612A,0xE79484:0x612B,0xE79483:0x612C,0xE79485:0x612D,
	0xE7948C:0x612E,0xE7948E:0x612F,0xE7948D:0x6130,0xE79495:0x6131,0xE79493:0x6132,
	0xE7949E:0x6133,0xE794A6:0x6134,0xE794AC:0x6135,0xE794BC:0x6136,0xE79584:0x6137,
	0xE7958D:0x6138,0xE7958A:0x6139,0xE79589:0x613A,0xE7959B:0x613B,0xE79586:0x613C,
	0xE7959A:0x613D,0xE795A9:0x613E,0xE795A4:0x613F,0xE795A7:0x6140,0xE795AB:0x6141,
	0xE795AD:0x6142,0xE795B8:0x6143,0xE795B6:0x6144,0xE79686:0x6145,0xE79687:0x6146,
	0xE795B4:0x6147,0xE7968A:0x6148,0xE79689:0x6149,0xE79682:0x614A,0xE79694:0x614B,
	0xE7969A:0x614C,0xE7969D:0x614D,0xE796A5:0x614E,0xE796A3:0x614F,0xE79782:0x6150,
	0xE796B3:0x6151,0xE79783:0x6152,0xE796B5:0x6153,0xE796BD:0x6154,0xE796B8:0x6155,
	0xE796BC:0x6156,0xE796B1:0x6157,0xE7978D:0x6158,0xE7978A:0x6159,0xE79792:0x615A,
	0xE79799:0x615B,0xE797A3:0x615C,0xE7979E:0x615D,0xE797BE:0x615E,0xE797BF:0x615F,
	0xE797BC:0x6160,0xE79881:0x6161,0xE797B0:0x6162,0xE797BA:0x6163,0xE797B2:0x6164,
	0xE797B3:0x6165,0xE7988B:0x6166,0xE7988D:0x6167,0xE79889:0x6168,0xE7989F:0x6169,
	0xE798A7:0x616A,0xE798A0:0x616B,0xE798A1:0x616C,0xE798A2:0x616D,0xE798A4:0x616E,
	0xE798B4:0x616F,0xE798B0:0x6170,0xE798BB:0x6171,0xE79987:0x6172,0xE79988:0x6173,
	0xE79986:0x6174,0xE7999C:0x6175,0xE79998:0x6176,0xE799A1:0x6177,0xE799A2:0x6178,
	0xE799A8:0x6179,0xE799A9:0x617A,0xE799AA:0x617B,0xE799A7:0x617C,0xE799AC:0x617D,
	0xE799B0:0x617E,0xE799B2:0x6221,0xE799B6:0x6222,0xE799B8:0x6223,0xE799BC:0x6224,
	0xE79A80:0x6225,0xE79A83:0x6226,0xE79A88:0x6227,0xE79A8B:0x6228,0xE79A8E:0x6229,
	0xE79A96:0x622A,0xE79A93:0x622B,0xE79A99:0x622C,0xE79A9A:0x622D,0xE79AB0:0x622E,
	0xE79AB4:0x622F,0xE79AB8:0x6230,0xE79AB9:0x6231,0xE79ABA:0x6232,0xE79B82:0x6233,
	0xE79B8D:0x6234,0xE79B96:0x6235,0xE79B92:0x6236,0xE79B9E:0x6237,0xE79BA1:0x6238,
	0xE79BA5:0x6239,0xE79BA7:0x623A,0xE79BAA:0x623B,0xE898AF:0x623C,0xE79BBB:0x623D,
	0xE79C88:0x623E,0xE79C87:0x623F,0xE79C84:0x6240,0xE79CA9:0x6241,0xE79CA4:0x6242,
	0xE79C9E:0x6243,0xE79CA5:0x6244,0xE79CA6:0x6245,0xE79C9B:0x6246,0xE79CB7:0x6247,
	0xE79CB8:0x6248,0xE79D87:0x6249,0xE79D9A:0x624A,0xE79DA8:0x624B,0xE79DAB:0x624C,
	0xE79D9B:0x624D,0xE79DA5:0x624E,0xE79DBF:0x624F,0xE79DBE:0x6250,0xE79DB9:0x6251,
	0xE79E8E:0x6252,0xE79E8B:0x6253,0xE79E91:0x6254,0xE79EA0:0x6255,0xE79E9E:0x6256,
	0xE79EB0:0x6257,0xE79EB6:0x6258,0xE79EB9:0x6259,0xE79EBF:0x625A,0xE79EBC:0x625B,
	0xE79EBD:0x625C,0xE79EBB:0x625D,0xE79F87:0x625E,0xE79F8D:0x625F,0xE79F97:0x6260,
	0xE79F9A:0x6261,0xE79F9C:0x6262,0xE79FA3:0x6263,0xE79FAE:0x6264,0xE79FBC:0x6265,
	0xE7A08C:0x6266,0xE7A092:0x6267,0xE7A4A6:0x6268,0xE7A0A0:0x6269,0xE7A4AA:0x626A,
	0xE7A185:0x626B,0xE7A28E:0x626C,0xE7A1B4:0x626D,0xE7A286:0x626E,0xE7A1BC:0x626F,
	0xE7A29A:0x6270,0xE7A28C:0x6271,0xE7A2A3:0x6272,0xE7A2B5:0x6273,0xE7A2AA:0x6274,
	0xE7A2AF:0x6275,0xE7A391:0x6276,0xE7A386:0x6277,0xE7A38B:0x6278,0xE7A394:0x6279,
	0xE7A2BE:0x627A,0xE7A2BC:0x627B,0xE7A385:0x627C,0xE7A38A:0x627D,0xE7A3AC:0x627E,
	0xE7A3A7:0x6321,0xE7A39A:0x6322,0xE7A3BD:0x6323,0xE7A3B4:0x6324,0xE7A487:0x6325,
	0xE7A492:0x6326,0xE7A491:0x6327,0xE7A499:0x6328,0xE7A4AC:0x6329,0xE7A4AB:0x632A,
	0xE7A580:0x632B,0xE7A5A0:0x632C,0xE7A597:0x632D,0xE7A59F:0x632E,0xE7A59A:0x632F,
	0xE7A595:0x6330,0xE7A593:0x6331,0xE7A5BA:0x6332,0xE7A5BF:0x6333,0xE7A68A:0x6334,
	0xE7A69D:0x6335,0xE7A6A7:0x6336,0xE9BD8B:0x6337,0xE7A6AA:0x6338,0xE7A6AE:0x6339,
	0xE7A6B3:0x633A,0xE7A6B9:0x633B,0xE7A6BA:0x633C,0xE7A789:0x633D,0xE7A795:0x633E,
	0xE7A7A7:0x633F,0xE7A7AC:0x6340,0xE7A7A1:0x6341,0xE7A7A3:0x6342,0xE7A888:0x6343,
	0xE7A88D:0x6344,0xE7A898:0x6345,0xE7A899:0x6346,0xE7A8A0:0x6347,0xE7A89F:0x6348,
	0xE7A680:0x6349,0xE7A8B1:0x634A,0xE7A8BB:0x634B,0xE7A8BE:0x634C,0xE7A8B7:0x634D,
	0xE7A983:0x634E,0xE7A997:0x634F,0xE7A989:0x6350,0xE7A9A1:0x6351,0xE7A9A2:0x6352,
	0xE7A9A9:0x6353,0xE9BE9D:0x6354,0xE7A9B0:0x6355,0xE7A9B9:0x6356,0xE7A9BD:0x6357,
	0xE7AA88:0x6358,0xE7AA97:0x6359,0xE7AA95:0x635A,0xE7AA98:0x635B,0xE7AA96:0x635C,
	0xE7AAA9:0x635D,0xE7AB88:0x635E,0xE7AAB0:0x635F,0xE7AAB6:0x6360,0xE7AB85:0x6361,
	0xE7AB84:0x6362,0xE7AABF:0x6363,0xE98283:0x6364,0xE7AB87:0x6365,0xE7AB8A:0x6366,
	0xE7AB8D:0x6367,0xE7AB8F:0x6368,0xE7AB95:0x6369,0xE7AB93:0x636A,0xE7AB99:0x636B,
	0xE7AB9A:0x636C,0xE7AB9D:0x636D,0xE7ABA1:0x636E,0xE7ABA2:0x636F,0xE7ABA6:0x6370,
	0xE7ABAD:0x6371,0xE7ABB0:0x6372,0xE7AC82:0x6373,0xE7AC8F:0x6374,0xE7AC8A:0x6375,
	0xE7AC86:0x6376,0xE7ACB3:0x6377,0xE7AC98:0x6378,0xE7AC99:0x6379,0xE7AC9E:0x637A,
	0xE7ACB5:0x637B,0xE7ACA8:0x637C,0xE7ACB6:0x637D,0xE7AD90:0x637E,0xE7ADBA:0x6421,
	0xE7AC84:0x6422,0xE7AD8D:0x6423,0xE7AC8B:0x6424,0xE7AD8C:0x6425,0xE7AD85:0x6426,
	0xE7ADB5:0x6427,0xE7ADA5:0x6428,0xE7ADB4:0x6429,0xE7ADA7:0x642A,0xE7ADB0:0x642B,
	0xE7ADB1:0x642C,0xE7ADAC:0x642D,0xE7ADAE:0x642E,0xE7AE9D:0x642F,0xE7AE98:0x6430,
	0xE7AE9F:0x6431,0xE7AE8D:0x6432,0xE7AE9C:0x6433,0xE7AE9A:0x6434,0xE7AE8B:0x6435,
	0xE7AE92:0x6436,0xE7AE8F:0x6437,0xE7AD9D:0x6438,0xE7AE99:0x6439,0xE7AF8B:0x643A,
	0xE7AF81:0x643B,0xE7AF8C:0x643C,0xE7AF8F:0x643D,0xE7AEB4:0x643E,0xE7AF86:0x643F,
	0xE7AF9D:0x6440,0xE7AFA9:0x6441,0xE7B091:0x6442,0xE7B094:0x6443,0xE7AFA6:0x6444,
	0xE7AFA5:0x6445,0xE7B1A0:0x6446,0xE7B080:0x6447,0xE7B087:0x6448,0xE7B093:0x6449,
	0xE7AFB3:0x644A,0xE7AFB7:0x644B,0xE7B097:0x644C,0xE7B08D:0x644D,0xE7AFB6:0x644E,
	0xE7B0A3:0x644F,0xE7B0A7:0x6450,0xE7B0AA:0x6451,0xE7B09F:0x6452,0xE7B0B7:0x6453,
	0xE7B0AB:0x6454,0xE7B0BD:0x6455,0xE7B18C:0x6456,0xE7B183:0x6457,0xE7B194:0x6458,
	0xE7B18F:0x6459,0xE7B180:0x645A,0xE7B190:0x645B,0xE7B198:0x645C,0xE7B19F:0x645D,
	0xE7B1A4:0x645E,0xE7B196:0x645F,0xE7B1A5:0x6460,0xE7B1AC:0x6461,0xE7B1B5:0x6462,
	0xE7B283:0x6463,0xE7B290:0x6464,0xE7B2A4:0x6465,0xE7B2AD:0x6466,0xE7B2A2:0x6467,
	0xE7B2AB:0x6468,0xE7B2A1:0x6469,0xE7B2A8:0x646A,0xE7B2B3:0x646B,0xE7B2B2:0x646C,
	0xE7B2B1:0x646D,0xE7B2AE:0x646E,0xE7B2B9:0x646F,0xE7B2BD:0x6470,0xE7B380:0x6471,
	0xE7B385:0x6472,0xE7B382:0x6473,0xE7B398:0x6474,0xE7B392:0x6475,0xE7B39C:0x6476,
	0xE7B3A2:0x6477,0xE9ACBB:0x6478,0xE7B3AF:0x6479,0xE7B3B2:0x647A,0xE7B3B4:0x647B,
	0xE7B3B6:0x647C,0xE7B3BA:0x647D,0xE7B486:0x647E,0xE7B482:0x6521,0xE7B49C:0x6522,
	0xE7B495:0x6523,0xE7B48A:0x6524,0xE7B585:0x6525,0xE7B58B:0x6526,0xE7B4AE:0x6527,
	0xE7B4B2:0x6528,0xE7B4BF:0x6529,0xE7B4B5:0x652A,0xE7B586:0x652B,0xE7B5B3:0x652C,
	0xE7B596:0x652D,0xE7B58E:0x652E,0xE7B5B2:0x652F,0xE7B5A8:0x6530,0xE7B5AE:0x6531,
	0xE7B58F:0x6532,0xE7B5A3:0x6533,0xE7B693:0x6534,0xE7B689:0x6535,0xE7B59B:0x6536,
	0xE7B68F:0x6537,0xE7B5BD:0x6538,0xE7B69B:0x6539,0xE7B6BA:0x653A,0xE7B6AE:0x653B,
	0xE7B6A3:0x653C,0xE7B6B5:0x653D,0xE7B787:0x653E,0xE7B6BD:0x653F,0xE7B6AB:0x6540,
	0xE7B8BD:0x6541,0xE7B6A2:0x6542,0xE7B6AF:0x6543,0xE7B79C:0x6544,0xE7B6B8:0x6545,
	0xE7B69F:0x6546,0xE7B6B0:0x6547,0xE7B798:0x6548,0xE7B79D:0x6549,0xE7B7A4:0x654A,
	0xE7B79E:0x654B,0xE7B7BB:0x654C,0xE7B7B2:0x654D,0xE7B7A1:0x654E,0xE7B885:0x654F,
	0xE7B88A:0x6550,0xE7B8A3:0x6551,0xE7B8A1:0x6552,0xE7B892:0x6553,0xE7B8B1:0x6554,
	0xE7B89F:0x6555,0xE7B889:0x6556,0xE7B88B:0x6557,0xE7B8A2:0x6558,0xE7B986:0x6559,
	0xE7B9A6:0x655A,0xE7B8BB:0x655B,0xE7B8B5:0x655C,0xE7B8B9:0x655D,0xE7B983:0x655E,
	0xE7B8B7:0x655F,0xE7B8B2:0x6560,0xE7B8BA:0x6561,0xE7B9A7:0x6562,0xE7B99D:0x6563,
	0xE7B996:0x6564,0xE7B99E:0x6565,0xE7B999:0x6566,0xE7B99A:0x6567,0xE7B9B9:0x6568,
	0xE7B9AA:0x6569,0xE7B9A9:0x656A,0xE7B9BC:0x656B,0xE7B9BB:0x656C,0xE7BA83:0x656D,
	0xE7B795:0x656E,0xE7B9BD:0x656F,0xE8BEAE:0x6570,0xE7B9BF:0x6571,0xE7BA88:0x6572,
	0xE7BA89:0x6573,0xE7BA8C:0x6574,0xE7BA92:0x6575,0xE7BA90:0x6576,0xE7BA93:0x6577,
	0xE7BA94:0x6578,0xE7BA96:0x6579,0xE7BA8E:0x657A,0xE7BA9B:0x657B,0xE7BA9C:0x657C,
	0xE7BCB8:0x657D,0xE7BCBA:0x657E,0xE7BD85:0x6621,0xE7BD8C:0x6622,0xE7BD8D:0x6623,
	0xE7BD8E:0x6624,0xE7BD90:0x6625,0xE7BD91:0x6626,0xE7BD95:0x6627,0xE7BD94:0x6628,
	0xE7BD98:0x6629,0xE7BD9F:0x662A,0xE7BDA0:0x662B,0xE7BDA8:0x662C,0xE7BDA9:0x662D,
	0xE7BDA7:0x662E,0xE7BDB8:0x662F,0xE7BE82:0x6630,0xE7BE86:0x6631,0xE7BE83:0x6632,
	0xE7BE88:0x6633,0xE7BE87:0x6634,0xE7BE8C:0x6635,0xE7BE94:0x6636,0xE7BE9E:0x6637,
	0xE7BE9D:0x6638,0xE7BE9A:0x6639,0xE7BEA3:0x663A,0xE7BEAF:0x663B,0xE7BEB2:0x663C,
	0xE7BEB9:0x663D,0xE7BEAE:0x663E,0xE7BEB6:0x663F,0xE7BEB8:0x6640,0xE8ADB1:0x6641,
	0xE7BF85:0x6642,0xE7BF86:0x6643,0xE7BF8A:0x6644,0xE7BF95:0x6645,0xE7BF94:0x6646,
	0xE7BFA1:0x6647,0xE7BFA6:0x6648,0xE7BFA9:0x6649,0xE7BFB3:0x664A,0xE7BFB9:0x664B,
	0xE9A39C:0x664C,0xE88086:0x664D,0xE88084:0x664E,0xE8808B:0x664F,0xE88092:0x6650,
	0xE88098:0x6651,0xE88099:0x6652,0xE8809C:0x6653,0xE880A1:0x6654,0xE880A8:0x6655,
	0xE880BF:0x6656,0xE880BB:0x6657,0xE8818A:0x6658,0xE88186:0x6659,0xE88192:0x665A,
	0xE88198:0x665B,0xE8819A:0x665C,0xE8819F:0x665D,0xE881A2:0x665E,0xE881A8:0x665F,
	0xE881B3:0x6660,0xE881B2:0x6661,0xE881B0:0x6662,0xE881B6:0x6663,0xE881B9:0x6664,
	0xE881BD:0x6665,0xE881BF:0x6666,0xE88284:0x6667,0xE88286:0x6668,0xE88285:0x6669,
	0xE8829B:0x666A,0xE88293:0x666B,0xE8829A:0x666C,0xE882AD:0x666D,0xE58690:0x666E,
	0xE882AC:0x666F,0xE8839B:0x6670,0xE883A5:0x6671,0xE88399:0x6672,0xE8839D:0x6673,
	0xE88384:0x6674,0xE8839A:0x6675,0xE88396:0x6676,0xE88489:0x6677,0xE883AF:0x6678,
	0xE883B1:0x6679,0xE8849B:0x667A,0xE884A9:0x667B,0xE884A3:0x667C,0xE884AF:0x667D,
	0xE8858B:0x667E,0xE99A8B:0x6721,0xE88586:0x6722,0xE884BE:0x6723,0xE88593:0x6724,
	0xE88591:0x6725,0xE883BC:0x6726,0xE885B1:0x6727,0xE885AE:0x6728,0xE885A5:0x6729,
	0xE885A6:0x672A,0xE885B4:0x672B,0xE88683:0x672C,0xE88688:0x672D,0xE8868A:0x672E,
	0xE88680:0x672F,0xE88682:0x6730,0xE886A0:0x6731,0xE88695:0x6732,0xE886A4:0x6733,
	0xE886A3:0x6734,0xE8859F:0x6735,0xE88693:0x6736,0xE886A9:0x6737,0xE886B0:0x6738,
	0xE886B5:0x6739,0xE886BE:0x673A,0xE886B8:0x673B,0xE886BD:0x673C,0xE88780:0x673D,
	0xE88782:0x673E,0xE886BA:0x673F,0xE88789:0x6740,0xE8878D:0x6741,0xE88791:0x6742,
	0xE88799:0x6743,0xE88798:0x6744,0xE88788:0x6745,0xE8879A:0x6746,0xE8879F:0x6747,
	0xE887A0:0x6748,0xE887A7:0x6749,0xE887BA:0x674A,0xE887BB:0x674B,0xE887BE:0x674C,
	0xE88881:0x674D,0xE88882:0x674E,0xE88885:0x674F,0xE88887:0x6750,0xE8888A:0x6751,
	0xE8888D:0x6752,0xE88890:0x6753,0xE88896:0x6754,0xE888A9:0x6755,0xE888AB:0x6756,
	0xE888B8:0x6757,0xE888B3:0x6758,0xE88980:0x6759,0xE88999:0x675A,0xE88998:0x675B,
	0xE8899D:0x675C,0xE8899A:0x675D,0xE8899F:0x675E,0xE889A4:0x675F,0xE889A2:0x6760,
	0xE889A8:0x6761,0xE889AA:0x6762,0xE889AB:0x6763,0xE888AE:0x6764,0xE889B1:0x6765,
	0xE889B7:0x6766,0xE889B8:0x6767,0xE889BE:0x6768,0xE88A8D:0x6769,0xE88A92:0x676A,
	0xE88AAB:0x676B,0xE88A9F:0x676C,0xE88ABB:0x676D,0xE88AAC:0x676E,0xE88BA1:0x676F,
	0xE88BA3:0x6770,0xE88B9F:0x6771,0xE88B92:0x6772,0xE88BB4:0x6773,0xE88BB3:0x6774,
	0xE88BBA:0x6775,0xE88E93:0x6776,0xE88C83:0x6777,0xE88BBB:0x6778,0xE88BB9:0x6779,
	0xE88B9E:0x677A,0xE88C86:0x677B,0xE88B9C:0x677C,0xE88C89:0x677D,0xE88B99:0x677E,
	0xE88CB5:0x6821,0xE88CB4:0x6822,0xE88C96:0x6823,0xE88CB2:0x6824,0xE88CB1:0x6825,
	0xE88D80:0x6826,0xE88CB9:0x6827,0xE88D90:0x6828,0xE88D85:0x6829,0xE88CAF:0x682A,
	0xE88CAB:0x682B,0xE88C97:0x682C,0xE88C98:0x682D,0xE88E85:0x682E,0xE88E9A:0x682F,
	0xE88EAA:0x6830,0xE88E9F:0x6831,0xE88EA2:0x6832,0xE88E96:0x6833,0xE88CA3:0x6834,
	0xE88E8E:0x6835,0xE88E87:0x6836,0xE88E8A:0x6837,0xE88DBC:0x6838,0xE88EB5:0x6839,
	0xE88DB3:0x683A,0xE88DB5:0x683B,0xE88EA0:0x683C,0xE88E89:0x683D,0xE88EA8:0x683E,
	0xE88FB4:0x683F,0xE89093:0x6840,0xE88FAB:0x6841,0xE88F8E:0x6842,0xE88FBD:0x6843,
	0xE89083:0x6844,0xE88F98:0x6845,0xE8908B:0x6846,0xE88F81:0x6847,0xE88FB7:0x6848,
	0xE89087:0x6849,0xE88FA0:0x684A,0xE88FB2:0x684B,0xE8908D:0x684C,0xE890A2:0x684D,
	0xE890A0:0x684E,0xE88EBD:0x684F,0xE890B8:0x6850,0xE89486:0x6851,0xE88FBB:0x6852,
	0xE891AD:0x6853,0xE890AA:0x6854,0xE890BC:0x6855,0xE8959A:0x6856,0xE89284:0x6857,
	0xE891B7:0x6858,0xE891AB:0x6859,0xE892AD:0x685A,0xE891AE:0x685B,0xE89282:0x685C,
	0xE891A9:0x685D,0xE89186:0x685E,0xE890AC:0x685F,0xE891AF:0x6860,0xE891B9:0x6861,
	0xE890B5:0x6862,0xE8938A:0x6863,0xE891A2:0x6864,0xE892B9:0x6865,0xE892BF:0x6866,
	0xE8929F:0x6867,0xE89399:0x6868,0xE8938D:0x6869,0xE892BB:0x686A,0xE8939A:0x686B,
	0xE89390:0x686C,0xE89381:0x686D,0xE89386:0x686E,0xE89396:0x686F,0xE892A1:0x6870,
	0xE894A1:0x6871,0xE893BF:0x6872,0xE893B4:0x6873,0xE89497:0x6874,0xE89498:0x6875,
	0xE894AC:0x6876,0xE8949F:0x6877,0xE89495:0x6878,0xE89494:0x6879,0xE893BC:0x687A,
	0xE89580:0x687B,0xE895A3:0x687C,0xE89598:0x687D,0xE89588:0x687E,0xE89581:0x6921,
	0xE89882:0x6922,0xE8958B:0x6923,0xE89595:0x6924,0xE89680:0x6925,0xE896A4:0x6926,
	0xE89688:0x6927,0xE89691:0x6928,0xE8968A:0x6929,0xE896A8:0x692A,0xE895AD:0x692B,
	0xE89694:0x692C,0xE8969B:0x692D,0xE897AA:0x692E,0xE89687:0x692F,0xE8969C:0x6930,
	0xE895B7:0x6931,0xE895BE:0x6932,0xE89690:0x6933,0xE89789:0x6934,0xE896BA:0x6935,
	0xE8978F:0x6936,0xE896B9:0x6937,0xE89790:0x6938,0xE89795:0x6939,0xE8979D:0x693A,
	0xE897A5:0x693B,0xE8979C:0x693C,0xE897B9:0x693D,0xE8988A:0x693E,0xE89893:0x693F,
	0xE8988B:0x6940,0xE897BE:0x6941,0xE897BA:0x6942,0xE89886:0x6943,0xE898A2:0x6944,
	0xE8989A:0x6945,0xE898B0:0x6946,0xE898BF:0x6947,0xE8998D:0x6948,0xE4B995:0x6949,
	0xE89994:0x694A,0xE8999F:0x694B,0xE899A7:0x694C,0xE899B1:0x694D,0xE89A93:0x694E,
	0xE89AA3:0x694F,0xE89AA9:0x6950,0xE89AAA:0x6951,0xE89A8B:0x6952,0xE89A8C:0x6953,
	0xE89AB6:0x6954,0xE89AAF:0x6955,0xE89B84:0x6956,0xE89B86:0x6957,0xE89AB0:0x6958,
	0xE89B89:0x6959,0xE8A0A3:0x695A,0xE89AAB:0x695B,0xE89B94:0x695C,0xE89B9E:0x695D,
	0xE89BA9:0x695E,0xE89BAC:0x695F,0xE89B9F:0x6960,0xE89B9B:0x6961,0xE89BAF:0x6962,
	0xE89C92:0x6963,0xE89C86:0x6964,0xE89C88:0x6965,0xE89C80:0x6966,0xE89C83:0x6967,
	0xE89BBB:0x6968,0xE89C91:0x6969,0xE89C89:0x696A,0xE89C8D:0x696B,0xE89BB9:0x696C,
	0xE89C8A:0x696D,0xE89CB4:0x696E,0xE89CBF:0x696F,0xE89CB7:0x6970,0xE89CBB:0x6971,
	0xE89CA5:0x6972,0xE89CA9:0x6973,0xE89C9A:0x6974,0xE89DA0:0x6975,0xE89D9F:0x6976,
	0xE89DB8:0x6977,0xE89D8C:0x6978,0xE89D8E:0x6979,0xE89DB4:0x697A,0xE89D97:0x697B,
	0xE89DA8:0x697C,0xE89DAE:0x697D,0xE89D99:0x697E,0xE89D93:0x6A21,0xE89DA3:0x6A22,
	0xE89DAA:0x6A23,0xE8A085:0x6A24,0xE89EA2:0x6A25,0xE89E9F:0x6A26,0xE89E82:0x6A27,
	0xE89EAF:0x6A28,0xE89F8B:0x6A29,0xE89EBD:0x6A2A,0xE89F80:0x6A2B,0xE89F90:0x6A2C,
	0xE99B96:0x6A2D,0xE89EAB:0x6A2E,0xE89F84:0x6A2F,0xE89EB3:0x6A30,0xE89F87:0x6A31,
	0xE89F86:0x6A32,0xE89EBB:0x6A33,0xE89FAF:0x6A34,0xE89FB2:0x6A35,0xE89FA0:0x6A36,
	0xE8A08F:0x6A37,0xE8A08D:0x6A38,0xE89FBE:0x6A39,0xE89FB6:0x6A3A,0xE89FB7:0x6A3B,
	0xE8A08E:0x6A3C,0xE89F92:0x6A3D,0xE8A091:0x6A3E,0xE8A096:0x6A3F,0xE8A095:0x6A40,
	0xE8A0A2:0x6A41,0xE8A0A1:0x6A42,0xE8A0B1:0x6A43,0xE8A0B6:0x6A44,0xE8A0B9:0x6A45,
	0xE8A0A7:0x6A46,0xE8A0BB:0x6A47,0xE8A184:0x6A48,0xE8A182:0x6A49,0xE8A192:0x6A4A,
	0xE8A199:0x6A4B,0xE8A19E:0x6A4C,0xE8A1A2:0x6A4D,0xE8A1AB:0x6A4E,0xE8A281:0x6A4F,
	0xE8A1BE:0x6A50,0xE8A29E:0x6A51,0xE8A1B5:0x6A52,0xE8A1BD:0x6A53,0xE8A2B5:0x6A54,
	0xE8A1B2:0x6A55,0xE8A282:0x6A56,0xE8A297:0x6A57,0xE8A292:0x6A58,0xE8A2AE:0x6A59,
	0xE8A299:0x6A5A,0xE8A2A2:0x6A5B,0xE8A28D:0x6A5C,0xE8A2A4:0x6A5D,0xE8A2B0:0x6A5E,
	0xE8A2BF:0x6A5F,0xE8A2B1:0x6A60,0xE8A383:0x6A61,0xE8A384:0x6A62,0xE8A394:0x6A63,
	0xE8A398:0x6A64,0xE8A399:0x6A65,0xE8A39D:0x6A66,0xE8A3B9:0x6A67,0xE8A482:0x6A68,
	0xE8A3BC:0x6A69,0xE8A3B4:0x6A6A,0xE8A3A8:0x6A6B,0xE8A3B2:0x6A6C,0xE8A484:0x6A6D,
	0xE8A48C:0x6A6E,0xE8A48A:0x6A6F,0xE8A493:0x6A70,0xE8A583:0x6A71,0xE8A49E:0x6A72,
	0xE8A4A5:0x6A73,0xE8A4AA:0x6A74,0xE8A4AB:0x6A75,0xE8A581:0x6A76,0xE8A584:0x6A77,
	0xE8A4BB:0x6A78,0xE8A4B6:0x6A79,0xE8A4B8:0x6A7A,0xE8A58C:0x6A7B,0xE8A49D:0x6A7C,
	0xE8A5A0:0x6A7D,0xE8A59E:0x6A7E,0xE8A5A6:0x6B21,0xE8A5A4:0x6B22,0xE8A5AD:0x6B23,
	0xE8A5AA:0x6B24,0xE8A5AF:0x6B25,0xE8A5B4:0x6B26,0xE8A5B7:0x6B27,0xE8A5BE:0x6B28,
	0xE8A683:0x6B29,0xE8A688:0x6B2A,0xE8A68A:0x6B2B,0xE8A693:0x6B2C,0xE8A698:0x6B2D,
	0xE8A6A1:0x6B2E,0xE8A6A9:0x6B2F,0xE8A6A6:0x6B30,0xE8A6AC:0x6B31,0xE8A6AF:0x6B32,
	0xE8A6B2:0x6B33,0xE8A6BA:0x6B34,0xE8A6BD:0x6B35,0xE8A6BF:0x6B36,0xE8A780:0x6B37,
	0xE8A79A:0x6B38,0xE8A79C:0x6B39,0xE8A79D:0x6B3A,0xE8A7A7:0x6B3B,0xE8A7B4:0x6B3C,
	0xE8A7B8:0x6B3D,0xE8A883:0x6B3E,0xE8A896:0x6B3F,0xE8A890:0x6B40,0xE8A88C:0x6B41,
	0xE8A89B:0x6B42,0xE8A89D:0x6B43,0xE8A8A5:0x6B44,0xE8A8B6:0x6B45,0xE8A981:0x6B46,
	0xE8A99B:0x6B47,0xE8A992:0x6B48,0xE8A986:0x6B49,0xE8A988:0x6B4A,0xE8A9BC:0x6B4B,
	0xE8A9AD:0x6B4C,0xE8A9AC:0x6B4D,0xE8A9A2:0x6B4E,0xE8AA85:0x6B4F,0xE8AA82:0x6B50,
	0xE8AA84:0x6B51,0xE8AAA8:0x6B52,0xE8AAA1:0x6B53,0xE8AA91:0x6B54,0xE8AAA5:0x6B55,
	0xE8AAA6:0x6B56,0xE8AA9A:0x6B57,0xE8AAA3:0x6B58,0xE8AB84:0x6B59,0xE8AB8D:0x6B5A,
	0xE8AB82:0x6B5B,0xE8AB9A:0x6B5C,0xE8ABAB:0x6B5D,0xE8ABB3:0x6B5E,0xE8ABA7:0x6B5F,
	0xE8ABA4:0x6B60,0xE8ABB1:0x6B61,0xE8AC94:0x6B62,0xE8ABA0:0x6B63,0xE8ABA2:0x6B64,
	0xE8ABB7:0x6B65,0xE8AB9E:0x6B66,0xE8AB9B:0x6B67,0xE8AC8C:0x6B68,0xE8AC87:0x6B69,
	0xE8AC9A:0x6B6A,0xE8ABA1:0x6B6B,0xE8AC96:0x6B6C,0xE8AC90:0x6B6D,0xE8AC97:0x6B6E,
	0xE8ACA0:0x6B6F,0xE8ACB3:0x6B70,0xE99EAB:0x6B71,0xE8ACA6:0x6B72,0xE8ACAB:0x6B73,
	0xE8ACBE:0x6B74,0xE8ACA8:0x6B75,0xE8AD81:0x6B76,0xE8AD8C:0x6B77,0xE8AD8F:0x6B78,
	0xE8AD8E:0x6B79,0xE8AD89:0x6B7A,0xE8AD96:0x6B7B,0xE8AD9B:0x6B7C,0xE8AD9A:0x6B7D,
	0xE8ADAB:0x6B7E,0xE8AD9F:0x6C21,0xE8ADAC:0x6C22,0xE8ADAF:0x6C23,0xE8ADB4:0x6C24,
	0xE8ADBD:0x6C25,0xE8AE80:0x6C26,0xE8AE8C:0x6C27,0xE8AE8E:0x6C28,0xE8AE92:0x6C29,
	0xE8AE93:0x6C2A,0xE8AE96:0x6C2B,0xE8AE99:0x6C2C,0xE8AE9A:0x6C2D,0xE8B0BA:0x6C2E,
	0xE8B181:0x6C2F,0xE8B0BF:0x6C30,0xE8B188:0x6C31,0xE8B18C:0x6C32,0xE8B18E:0x6C33,
	0xE8B190:0x6C34,0xE8B195:0x6C35,0xE8B1A2:0x6C36,0xE8B1AC:0x6C37,0xE8B1B8:0x6C38,
	0xE8B1BA:0x6C39,0xE8B282:0x6C3A,0xE8B289:0x6C3B,0xE8B285:0x6C3C,0xE8B28A:0x6C3D,
	0xE8B28D:0x6C3E,0xE8B28E:0x6C3F,0xE8B294:0x6C40,0xE8B1BC:0x6C41,0xE8B298:0x6C42,
	0xE6889D:0x6C43,0xE8B2AD:0x6C44,0xE8B2AA:0x6C45,0xE8B2BD:0x6C46,0xE8B2B2:0x6C47,
	0xE8B2B3:0x6C48,0xE8B2AE:0x6C49,0xE8B2B6:0x6C4A,0xE8B388:0x6C4B,0xE8B381:0x6C4C,
	0xE8B3A4:0x6C4D,0xE8B3A3:0x6C4E,0xE8B39A:0x6C4F,0xE8B3BD:0x6C50,0xE8B3BA:0x6C51,
	0xE8B3BB:0x6C52,0xE8B484:0x6C53,0xE8B485:0x6C54,0xE8B48A:0x6C55,0xE8B487:0x6C56,
	0xE8B48F:0x6C57,0xE8B48D:0x6C58,0xE8B490:0x6C59,0xE9BD8E:0x6C5A,0xE8B493:0x6C5B,
	0xE8B38D:0x6C5C,0xE8B494:0x6C5D,0xE8B496:0x6C5E,0xE8B5A7:0x6C5F,0xE8B5AD:0x6C60,
	0xE8B5B1:0x6C61,0xE8B5B3:0x6C62,0xE8B681:0x6C63,0xE8B699:0x6C64,0xE8B782:0x6C65,
	0xE8B6BE:0x6C66,0xE8B6BA:0x6C67,0xE8B78F:0x6C68,0xE8B79A:0x6C69,0xE8B796:0x6C6A,
	0xE8B78C:0x6C6B,0xE8B79B:0x6C6C,0xE8B78B:0x6C6D,0xE8B7AA:0x6C6E,0xE8B7AB:0x6C6F,
	0xE8B79F:0x6C70,0xE8B7A3:0x6C71,0xE8B7BC:0x6C72,0xE8B888:0x6C73,0xE8B889:0x6C74,
	0xE8B7BF:0x6C75,0xE8B89D:0x6C76,0xE8B89E:0x6C77,0xE8B890:0x6C78,0xE8B89F:0x6C79,
	0xE8B982:0x6C7A,0xE8B8B5:0x6C7B,0xE8B8B0:0x6C7C,0xE8B8B4:0x6C7D,0xE8B98A:0x6C7E,
	0xE8B987:0x6D21,0xE8B989:0x6D22,0xE8B98C:0x6D23,0xE8B990:0x6D24,0xE8B988:0x6D25,
	0xE8B999:0x6D26,0xE8B9A4:0x6D27,0xE8B9A0:0x6D28,0xE8B8AA:0x6D29,0xE8B9A3:0x6D2A,
	0xE8B995:0x6D2B,0xE8B9B6:0x6D2C,0xE8B9B2:0x6D2D,0xE8B9BC:0x6D2E,0xE8BA81:0x6D2F,
	0xE8BA87:0x6D30,0xE8BA85:0x6D31,0xE8BA84:0x6D32,0xE8BA8B:0x6D33,0xE8BA8A:0x6D34,
	0xE8BA93:0x6D35,0xE8BA91:0x6D36,0xE8BA94:0x6D37,0xE8BA99:0x6D38,0xE8BAAA:0x6D39,
	0xE8BAA1:0x6D3A,0xE8BAAC:0x6D3B,0xE8BAB0:0x6D3C,0xE8BB86:0x6D3D,0xE8BAB1:0x6D3E,
	0xE8BABE:0x6D3F,0xE8BB85:0x6D40,0xE8BB88:0x6D41,0xE8BB8B:0x6D42,0xE8BB9B:0x6D43,
	0xE8BBA3:0x6D44,0xE8BBBC:0x6D45,0xE8BBBB:0x6D46,0xE8BBAB:0x6D47,0xE8BBBE:0x6D48,
	0xE8BC8A:0x6D49,0xE8BC85:0x6D4A,0xE8BC95:0x6D4B,0xE8BC92:0x6D4C,0xE8BC99:0x6D4D,
	0xE8BC93:0x6D4E,0xE8BC9C:0x6D4F,0xE8BC9F:0x6D50,0xE8BC9B:0x6D51,0xE8BC8C:0x6D52,
	0xE8BCA6:0x6D53,0xE8BCB3:0x6D54,0xE8BCBB:0x6D55,0xE8BCB9:0x6D56,0xE8BD85:0x6D57,
	0xE8BD82:0x6D58,0xE8BCBE:0x6D59,0xE8BD8C:0x6D5A,0xE8BD89:0x6D5B,0xE8BD86:0x6D5C,
	0xE8BD8E:0x6D5D,0xE8BD97:0x6D5E,0xE8BD9C:0x6D5F,0xE8BDA2:0x6D60,0xE8BDA3:0x6D61,
	0xE8BDA4:0x6D62,0xE8BE9C:0x6D63,0xE8BE9F:0x6D64,0xE8BEA3:0x6D65,0xE8BEAD:0x6D66,
	0xE8BEAF:0x6D67,0xE8BEB7:0x6D68,0xE8BF9A:0x6D69,0xE8BFA5:0x6D6A,0xE8BFA2:0x6D6B,
	0xE8BFAA:0x6D6C,0xE8BFAF:0x6D6D,0xE98287:0x6D6E,0xE8BFB4:0x6D6F,0xE98085:0x6D70,
	0xE8BFB9:0x6D71,0xE8BFBA:0x6D72,0xE98091:0x6D73,0xE98095:0x6D74,0xE980A1:0x6D75,
	0xE9808D:0x6D76,0xE9809E:0x6D77,0xE98096:0x6D78,0xE9808B:0x6D79,0xE980A7:0x6D7A,
	0xE980B6:0x6D7B,0xE980B5:0x6D7C,0xE980B9:0x6D7D,0xE8BFB8:0x6D7E,0xE9818F:0x6E21,
	0xE98190:0x6E22,0xE98191:0x6E23,0xE98192:0x6E24,0xE9808E:0x6E25,0xE98189:0x6E26,
	0xE980BE:0x6E27,0xE98196:0x6E28,0xE98198:0x6E29,0xE9819E:0x6E2A,0xE981A8:0x6E2B,
	0xE981AF:0x6E2C,0xE981B6:0x6E2D,0xE99AA8:0x6E2E,0xE981B2:0x6E2F,0xE98282:0x6E30,
	0xE981BD:0x6E31,0xE98281:0x6E32,0xE98280:0x6E33,0xE9828A:0x6E34,0xE98289:0x6E35,
	0xE9828F:0x6E36,0xE982A8:0x6E37,0xE982AF:0x6E38,0xE982B1:0x6E39,0xE982B5:0x6E3A,
	0xE983A2:0x6E3B,0xE983A4:0x6E3C,0xE68988:0x6E3D,0xE9839B:0x6E3E,0xE98482:0x6E3F,
	0xE98492:0x6E40,0xE98499:0x6E41,0xE984B2:0x6E42,0xE984B0:0x6E43,0xE9858A:0x6E44,
	0xE98596:0x6E45,0xE98598:0x6E46,0xE985A3:0x6E47,0xE985A5:0x6E48,0xE985A9:0x6E49,
	0xE985B3:0x6E4A,0xE985B2:0x6E4B,0xE9868B:0x6E4C,0xE98689:0x6E4D,0xE98682:0x6E4E,
	0xE986A2:0x6E4F,0xE986AB:0x6E50,0xE986AF:0x6E51,0xE986AA:0x6E52,0xE986B5:0x6E53,
	0xE986B4:0x6E54,0xE986BA:0x6E55,0xE98780:0x6E56,0xE98781:0x6E57,0xE98789:0x6E58,
	0xE9878B:0x6E59,0xE98790:0x6E5A,0xE98796:0x6E5B,0xE9879F:0x6E5C,0xE987A1:0x6E5D,
	0xE9879B:0x6E5E,0xE987BC:0x6E5F,0xE987B5:0x6E60,0xE987B6:0x6E61,0xE9889E:0x6E62,
	0xE987BF:0x6E63,0xE98894:0x6E64,0xE988AC:0x6E65,0xE98895:0x6E66,0xE98891:0x6E67,
	0xE9899E:0x6E68,0xE98997:0x6E69,0xE98985:0x6E6A,0xE98989:0x6E6B,0xE989A4:0x6E6C,
	0xE98988:0x6E6D,0xE98A95:0x6E6E,0xE988BF:0x6E6F,0xE9898B:0x6E70,0xE98990:0x6E71,
	0xE98A9C:0x6E72,0xE98A96:0x6E73,0xE98A93:0x6E74,0xE98A9B:0x6E75,0xE9899A:0x6E76,
	0xE98B8F:0x6E77,0xE98AB9:0x6E78,0xE98AB7:0x6E79,0xE98BA9:0x6E7A,0xE98C8F:0x6E7B,
	0xE98BBA:0x6E7C,0xE98D84:0x6E7D,0xE98CAE:0x6E7E,0xE98C99:0x6F21,0xE98CA2:0x6F22,
	0xE98C9A:0x6F23,0xE98CA3:0x6F24,0xE98CBA:0x6F25,0xE98CB5:0x6F26,0xE98CBB:0x6F27,
	0xE98D9C:0x6F28,0xE98DA0:0x6F29,0xE98DBC:0x6F2A,0xE98DAE:0x6F2B,0xE98D96:0x6F2C,
	0xE98EB0:0x6F2D,0xE98EAC:0x6F2E,0xE98EAD:0x6F2F,0xE98E94:0x6F30,0xE98EB9:0x6F31,
	0xE98F96:0x6F32,0xE98F97:0x6F33,0xE98FA8:0x6F34,0xE98FA5:0x6F35,0xE98F98:0x6F36,
	0xE98F83:0x6F37,0xE98F9D:0x6F38,0xE98F90:0x6F39,0xE98F88:0x6F3A,0xE98FA4:0x6F3B,
	0xE9909A:0x6F3C,0xE99094:0x6F3D,0xE99093:0x6F3E,0xE99083:0x6F3F,0xE99087:0x6F40,
	0xE99090:0x6F41,0xE990B6:0x6F42,0xE990AB:0x6F43,0xE990B5:0x6F44,0xE990A1:0x6F45,
	0xE990BA:0x6F46,0xE99181:0x6F47,0xE99192:0x6F48,0xE99184:0x6F49,0xE9919B:0x6F4A,
	0xE991A0:0x6F4B,0xE991A2:0x6F4C,0xE9919E:0x6F4D,0xE991AA:0x6F4E,0xE988A9:0x6F4F,
	0xE991B0:0x6F50,0xE991B5:0x6F51,0xE991B7:0x6F52,0xE991BD:0x6F53,0xE9919A:0x6F54,
	0xE991BC:0x6F55,0xE991BE:0x6F56,0xE99281:0x6F57,0xE991BF:0x6F58,0xE99682:0x6F59,
	0xE99687:0x6F5A,0xE9968A:0x6F5B,0xE99694:0x6F5C,0xE99696:0x6F5D,0xE99698:0x6F5E,
	0xE99699:0x6F5F,0xE996A0:0x6F60,0xE996A8:0x6F61,0xE996A7:0x6F62,0xE996AD:0x6F63,
	0xE996BC:0x6F64,0xE996BB:0x6F65,0xE996B9:0x6F66,0xE996BE:0x6F67,0xE9978A:0x6F68,
	0xE6BFB6:0x6F69,0xE99783:0x6F6A,0xE9978D:0x6F6B,0xE9978C:0x6F6C,0xE99795:0x6F6D,
	0xE99794:0x6F6E,0xE99796:0x6F6F,0xE9979C:0x6F70,0xE997A1:0x6F71,0xE997A5:0x6F72,
	0xE997A2:0x6F73,0xE998A1:0x6F74,0xE998A8:0x6F75,0xE998AE:0x6F76,0xE998AF:0x6F77,
	0xE99982:0x6F78,0xE9998C:0x6F79,0xE9998F:0x6F7A,0xE9998B:0x6F7B,0xE999B7:0x6F7C,
	0xE9999C:0x6F7D,0xE9999E:0x6F7E,0xE9999D:0x7021,0xE9999F:0x7022,0xE999A6:0x7023,
	0xE999B2:0x7024,0xE999AC:0x7025,0xE99A8D:0x7026,0xE99A98:0x7027,0xE99A95:0x7028,
	0xE99A97:0x7029,0xE99AAA:0x702A,0xE99AA7:0x702B,0xE99AB1:0x702C,0xE99AB2:0x702D,
	0xE99AB0:0x702E,0xE99AB4:0x702F,0xE99AB6:0x7030,0xE99AB8:0x7031,0xE99AB9:0x7032,
	0xE99B8E:0x7033,0xE99B8B:0x7034,0xE99B89:0x7035,0xE99B8D:0x7036,0xE8A58D:0x7037,
	0xE99B9C:0x7038,0xE99C8D:0x7039,0xE99B95:0x703A,0xE99BB9:0x703B,0xE99C84:0x703C,
	0xE99C86:0x703D,0xE99C88:0x703E,0xE99C93:0x703F,0xE99C8E:0x7040,0xE99C91:0x7041,
	0xE99C8F:0x7042,0xE99C96:0x7043,0xE99C99:0x7044,0xE99CA4:0x7045,0xE99CAA:0x7046,
	0xE99CB0:0x7047,0xE99CB9:0x7048,0xE99CBD:0x7049,0xE99CBE:0x704A,0xE99D84:0x704B,
	0xE99D86:0x704C,0xE99D88:0x704D,0xE99D82:0x704E,0xE99D89:0x704F,0xE99D9C:0x7050,
	0xE99DA0:0x7051,0xE99DA4:0x7052,0xE99DA6:0x7053,0xE99DA8:0x7054,0xE58B92:0x7055,
	0xE99DAB:0x7056,0xE99DB1:0x7057,0xE99DB9:0x7058,0xE99E85:0x7059,0xE99DBC:0x705A,
	0xE99E81:0x705B,0xE99DBA:0x705C,0xE99E86:0x705D,0xE99E8B:0x705E,0xE99E8F:0x705F,
	0xE99E90:0x7060,0xE99E9C:0x7061,0xE99EA8:0x7062,0xE99EA6:0x7063,0xE99EA3:0x7064,
	0xE99EB3:0x7065,0xE99EB4:0x7066,0xE99F83:0x7067,0xE99F86:0x7068,0xE99F88:0x7069,
	0xE99F8B:0x706A,0xE99F9C:0x706B,0xE99FAD:0x706C,0xE9BD8F:0x706D,0xE99FB2:0x706E,
	0xE7AB9F:0x706F,0xE99FB6:0x7070,0xE99FB5:0x7071,0xE9A08F:0x7072,0xE9A08C:0x7073,
	0xE9A0B8:0x7074,0xE9A0A4:0x7075,0xE9A0A1:0x7076,0xE9A0B7:0x7077,0xE9A0BD:0x7078,
	0xE9A186:0x7079,0xE9A18F:0x707A,0xE9A18B:0x707B,0xE9A1AB:0x707C,0xE9A1AF:0x707D,
	0xE9A1B0:0x707E,0xE9A1B1:0x7121,0xE9A1B4:0x7122,0xE9A1B3:0x7123,0xE9A2AA:0x7124,
	0xE9A2AF:0x7125,0xE9A2B1:0x7126,0xE9A2B6:0x7127,0xE9A384:0x7128,0xE9A383:0x7129,
	0xE9A386:0x712A,0xE9A3A9:0x712B,0xE9A3AB:0x712C,0xE9A483:0x712D,0xE9A489:0x712E,
	0xE9A492:0x712F,0xE9A494:0x7130,0xE9A498:0x7131,0xE9A4A1:0x7132,0xE9A49D:0x7133,
	0xE9A49E:0x7134,0xE9A4A4:0x7135,0xE9A4A0:0x7136,0xE9A4AC:0x7137,0xE9A4AE:0x7138,
	0xE9A4BD:0x7139,0xE9A4BE:0x713A,0xE9A582:0x713B,0xE9A589:0x713C,0xE9A585:0x713D,
	0xE9A590:0x713E,0xE9A58B:0x713F,0xE9A591:0x7140,0xE9A592:0x7141,0xE9A58C:0x7142,
	0xE9A595:0x7143,0xE9A697:0x7144,0xE9A698:0x7145,0xE9A6A5:0x7146,0xE9A6AD:0x7147,
	0xE9A6AE:0x7148,0xE9A6BC:0x7149,0xE9A79F:0x714A,0xE9A79B:0x714B,0xE9A79D:0x714C,
	0xE9A798:0x714D,0xE9A791:0x714E,0xE9A7AD:0x714F,0xE9A7AE:0x7150,0xE9A7B1:0x7151,
	0xE9A7B2:0x7152,0xE9A7BB:0x7153,0xE9A7B8:0x7154,0xE9A881:0x7155,0xE9A88F:0x7156,
	0xE9A885:0x7157,0xE9A7A2:0x7158,0xE9A899:0x7159,0xE9A8AB:0x715A,0xE9A8B7:0x715B,
	0xE9A985:0x715C,0xE9A982:0x715D,0xE9A980:0x715E,0xE9A983:0x715F,0xE9A8BE:0x7160,
	0xE9A995:0x7161,0xE9A98D:0x7162,0xE9A99B:0x7163,0xE9A997:0x7164,0xE9A99F:0x7165,
	0xE9A9A2:0x7166,0xE9A9A5:0x7167,0xE9A9A4:0x7168,0xE9A9A9:0x7169,0xE9A9AB:0x716A,
	0xE9A9AA:0x716B,0xE9AAAD:0x716C,0xE9AAB0:0x716D,0xE9AABC:0x716E,0xE9AB80:0x716F,
	0xE9AB8F:0x7170,0xE9AB91:0x7171,0xE9AB93:0x7172,0xE9AB94:0x7173,0xE9AB9E:0x7174,
	0xE9AB9F:0x7175,0xE9ABA2:0x7176,0xE9ABA3:0x7177,0xE9ABA6:0x7178,0xE9ABAF:0x7179,
	0xE9ABAB:0x717A,0xE9ABAE:0x717B,0xE9ABB4:0x717C,0xE9ABB1:0x717D,0xE9ABB7:0x717E,
	0xE9ABBB:0x7221,0xE9AC86:0x7222,0xE9AC98:0x7223,0xE9AC9A:0x7224,0xE9AC9F:0x7225,
	0xE9ACA2:0x7226,0xE9ACA3:0x7227,0xE9ACA5:0x7228,0xE9ACA7:0x7229,0xE9ACA8:0x722A,
	0xE9ACA9:0x722B,0xE9ACAA:0x722C,0xE9ACAE:0x722D,0xE9ACAF:0x722E,0xE9ACB2:0x722F,
	0xE9AD84:0x7230,0xE9AD83:0x7231,0xE9AD8F:0x7232,0xE9AD8D:0x7233,0xE9AD8E:0x7234,
	0xE9AD91:0x7235,0xE9AD98:0x7236,0xE9ADB4:0x7237,0xE9AE93:0x7238,0xE9AE83:0x7239,
	0xE9AE91:0x723A,0xE9AE96:0x723B,0xE9AE97:0x723C,0xE9AE9F:0x723D,0xE9AEA0:0x723E,
	0xE9AEA8:0x723F,0xE9AEB4:0x7240,0xE9AF80:0x7241,0xE9AF8A:0x7242,0xE9AEB9:0x7243,
	0xE9AF86:0x7244,0xE9AF8F:0x7245,0xE9AF91:0x7246,0xE9AF92:0x7247,0xE9AFA3:0x7248,
	0xE9AFA2:0x7249,0xE9AFA4:0x724A,0xE9AF94:0x724B,0xE9AFA1:0x724C,0xE9B0BA:0x724D,
	0xE9AFB2:0x724E,0xE9AFB1:0x724F,0xE9AFB0:0x7250,0xE9B095:0x7251,0xE9B094:0x7252,
	0xE9B089:0x7253,0xE9B093:0x7254,0xE9B08C:0x7255,0xE9B086:0x7256,0xE9B088:0x7257,
	0xE9B092:0x7258,0xE9B08A:0x7259,0xE9B084:0x725A,0xE9B0AE:0x725B,0xE9B09B:0x725C,
	0xE9B0A5:0x725D,0xE9B0A4:0x725E,0xE9B0A1:0x725F,0xE9B0B0:0x7260,0xE9B187:0x7261,
	0xE9B0B2:0x7262,0xE9B186:0x7263,0xE9B0BE:0x7264,0xE9B19A:0x7265,0xE9B1A0:0x7266,
	0xE9B1A7:0x7267,0xE9B1B6:0x7268,0xE9B1B8:0x7269,0xE9B3A7:0x726A,0xE9B3AC:0x726B,
	0xE9B3B0:0x726C,0xE9B489:0x726D,0xE9B488:0x726E,0xE9B3AB:0x726F,0xE9B483:0x7270,
	0xE9B486:0x7271,0xE9B4AA:0x7272,0xE9B4A6:0x7273,0xE9B6AF:0x7274,0xE9B4A3:0x7275,
	0xE9B49F:0x7276,0xE9B584:0x7277,0xE9B495:0x7278,0xE9B492:0x7279,0xE9B581:0x727A,
	0xE9B4BF:0x727B,0xE9B4BE:0x727C,0xE9B586:0x727D,0xE9B588:0x727E,0xE9B59D:0x7321,
	0xE9B59E:0x7322,0xE9B5A4:0x7323,0xE9B591:0x7324,0xE9B590:0x7325,0xE9B599:0x7326,
	0xE9B5B2:0x7327,0xE9B689:0x7328,0xE9B687:0x7329,0xE9B6AB:0x732A,0xE9B5AF:0x732B,
	0xE9B5BA:0x732C,0xE9B69A:0x732D,0xE9B6A4:0x732E,0xE9B6A9:0x732F,0xE9B6B2:0x7330,
	0xE9B784:0x7331,0xE9B781:0x7332,0xE9B6BB:0x7333,0xE9B6B8:0x7334,0xE9B6BA:0x7335,
	0xE9B786:0x7336,0xE9B78F:0x7337,0xE9B782:0x7338,0xE9B799:0x7339,0xE9B793:0x733A,
	0xE9B7B8:0x733B,0xE9B7A6:0x733C,0xE9B7AD:0x733D,0xE9B7AF:0x733E,0xE9B7BD:0x733F,
	0xE9B89A:0x7340,0xE9B89B:0x7341,0xE9B89E:0x7342,0xE9B9B5:0x7343,0xE9B9B9:0x7344,
	0xE9B9BD:0x7345,0xE9BA81:0x7346,0xE9BA88:0x7347,0xE9BA8B:0x7348,0xE9BA8C:0x7349,
	0xE9BA92:0x734A,0xE9BA95:0x734B,0xE9BA91:0x734C,0xE9BA9D:0x734D,0xE9BAA5:0x734E,
	0xE9BAA9:0x734F,0xE9BAB8:0x7350,0xE9BAAA:0x7351,0xE9BAAD:0x7352,0xE99DA1:0x7353,
	0xE9BB8C:0x7354,0xE9BB8E:0x7355,0xE9BB8F:0x7356,0xE9BB90:0x7357,0xE9BB94:0x7358,
	0xE9BB9C:0x7359,0xE9BB9E:0x735A,0xE9BB9D:0x735B,0xE9BBA0:0x735C,0xE9BBA5:0x735D,
	0xE9BBA8:0x735E,0xE9BBAF:0x735F,0xE9BBB4:0x7360,0xE9BBB6:0x7361,0xE9BBB7:0x7362,
	0xE9BBB9:0x7363,0xE9BBBB:0x7364,0xE9BBBC:0x7365,0xE9BBBD:0x7366,0xE9BC87:0x7367,
	0xE9BC88:0x7368,0xE79AB7:0x7369,0xE9BC95:0x736A,0xE9BCA1:0x736B,0xE9BCAC:0x736C,
	0xE9BCBE:0x736D,0xE9BD8A:0x736E,0xE9BD92:0x736F,0xE9BD94:0x7370,0xE9BDA3:0x7371,
	0xE9BD9F:0x7372,0xE9BDA0:0x7373,0xE9BDA1:0x7374,0xE9BDA6:0x7375,0xE9BDA7:0x7376,
	0xE9BDAC:0x7377,0xE9BDAA:0x7378,0xE9BDB7:0x7379,0xE9BDB2:0x737A,0xE9BDB6:0x737B,
	0xE9BE95:0x737C,0xE9BE9C:0x737D,0xE9BEA0:0x737E,0xE5A0AF:0x7421,0xE6A787:0x7422,
	0xE98199:0x7423,0xE791A4:0x7424,0xE5879C:0x7425,0xE78699:0x7426,

	0xE7BA8A:0x7921,0xE8A49C:0x7922,0xE98D88:0x7923,0xE98A88:0x7924,0xE8939C:0x7925,
	0xE4BF89:0x7926,0xE782BB:0x7927,0xE698B1:0x7928,0xE6A388:0x7929,0xE98BB9:0x792A,
	0xE69BBB:0x792B,0xE5BD85:0x792C,0xE4B8A8:0x792D,0xE4BBA1:0x792E,0xE4BBBC:0x792F,
	0xE4BC80:0x7930,0xE4BC83:0x7931,0xE4BCB9:0x7932,0xE4BD96:0x7933,0xE4BE92:0x7934,
	0xE4BE8A:0x7935,0xE4BE9A:0x7936,0xE4BE94:0x7937,0xE4BF8D:0x7938,0xE58180:0x7939,
	0xE580A2:0x793A,0xE4BFBF:0x793B,0xE5809E:0x793C,0xE58186:0x793D,0xE581B0:0x793E,
	0xE58182:0x793F,0xE58294:0x7940,0xE583B4:0x7941,0xE58398:0x7942,0xE5858A:0x7943,
	0xE585A4:0x7944,0xE5869D:0x7945,0xE586BE:0x7946,0xE587AC:0x7947,0xE58895:0x7948,
	0xE58A9C:0x7949,0xE58AA6:0x794A,0xE58B80:0x794B,0xE58B9B:0x794C,0xE58C80:0x794D,
	0xE58C87:0x794E,0xE58CA4:0x794F,0xE58DB2:0x7950,0xE58E93:0x7951,0xE58EB2:0x7952,
	0xE58F9D:0x7953,0xEFA88E:0x7954,0xE5929C:0x7955,0xE5928A:0x7956,0xE592A9:0x7957,
	0xE593BF:0x7958,0xE59686:0x7959,0xE59D99:0x795A,0xE59DA5:0x795B,0xE59EAC:0x795C,
	0xE59F88:0x795D,0xE59F87:0x795E,0xEFA88F:0x795F,0xEFA890:0x7960,0xE5A29E:0x7961,
	0xE5A2B2:0x7962,0xE5A48B:0x7963,0xE5A593:0x7964,0xE5A59B:0x7965,0xE5A59D:0x7966,
	0xE5A5A3:0x7967,0xE5A6A4:0x7968,0xE5A6BA:0x7969,0xE5AD96:0x796A,0xE5AF80:0x796B,
	0xE794AF:0x796C,0xE5AF98:0x796D,0xE5AFAC:0x796E,0xE5B09E:0x796F,0xE5B2A6:0x7970,
	0xE5B2BA:0x7971,0xE5B3B5:0x7972,0xE5B4A7:0x7973,0xE5B593:0x7974,0xEFA891:0x7975,
	0xE5B582:0x7976,0xE5B5AD:0x7977,0xE5B6B8:0x7978,0xE5B6B9:0x7979,0xE5B790:0x797A,
	0xE5BCA1:0x797B,0xE5BCB4:0x797C,0xE5BDA7:0x797D,0xE5BEB7:0x797E,0xE5BF9E:0x7A21,
	0xE6819D:0x7A22,0xE68285:0x7A23,0xE6828A:0x7A24,0xE6839E:0x7A25,0xE68395:0x7A26,
	0xE684A0:0x7A27,0xE683B2:0x7A28,0xE68491:0x7A29,0xE684B7:0x7A2A,0xE684B0:0x7A2B,
	0xE68698:0x7A2C,0xE68893:0x7A2D,0xE68AA6:0x7A2E,0xE68FB5:0x7A2F,0xE691A0:0x7A30,
	0xE6929D:0x7A31,0xE6938E:0x7A32,0xE6958E:0x7A33,0xE69880:0x7A34,0xE69895:0x7A35,
	0xE698BB:0x7A36,0xE69889:0x7A37,0xE698AE:0x7A38,0xE6989E:0x7A39,0xE698A4:0x7A3A,
	0xE699A5:0x7A3B,0xE69997:0x7A3C,0xE69999:0x7A3D,0xEFA892:0x7A3E,0xE699B3:0x7A3F,
	0xE69A99:0x7A40,0xE69AA0:0x7A41,0xE69AB2:0x7A42,0xE69ABF:0x7A43,0xE69BBA:0x7A44,
	0xE69C8E:0x7A45,0xEFA4A9:0x7A46,0xE69DA6:0x7A47,0xE69EBB:0x7A48,0xE6A192:0x7A49,
	0xE69F80:0x7A4A,0xE6A081:0x7A4B,0xE6A184:0x7A4C,0xE6A38F:0x7A4D,0xEFA893:0x7A4E,
	0xE6A5A8:0x7A4F,0xEFA894:0x7A50,0xE6A698:0x7A51,0xE6A7A2:0x7A52,0xE6A8B0:0x7A53,
	0xE6A9AB:0x7A54,0xE6A986:0x7A55,0xE6A9B3:0x7A56,0xE6A9BE:0x7A57,0xE6ABA2:0x7A58,
	0xE6ABA4:0x7A59,0xE6AF96:0x7A5A,0xE6B0BF:0x7A5B,0xE6B19C:0x7A5C,0xE6B286:0x7A5D,
	0xE6B1AF:0x7A5E,0xE6B39A:0x7A5F,0xE6B484:0x7A60,0xE6B687:0x7A61,0xE6B5AF:0x7A62,
	0xE6B696:0x7A63,0xE6B6AC:0x7A64,0xE6B78F:0x7A65,0xE6B7B8:0x7A66,0xE6B7B2:0x7A67,
	0xE6B7BC:0x7A68,0xE6B8B9:0x7A69,0xE6B99C:0x7A6A,0xE6B8A7:0x7A6B,0xE6B8BC:0x7A6C,
	0xE6BABF:0x7A6D,0xE6BE88:0x7A6E,0xE6BEB5:0x7A6F,0xE6BFB5:0x7A70,0xE78085:0x7A71,
	0xE78087:0x7A72,0xE780A8:0x7A73,0xE78285:0x7A74,0xE782AB:0x7A75,0xE7848F:0x7A76,
	0xE78484:0x7A77,0xE7859C:0x7A78,0xE78586:0x7A79,0xE78587:0x7A7A,0xEFA895:0x7A7B,
	0xE78781:0x7A7C,0xE787BE:0x7A7D,0xE78AB1:0x7A7E,0xE78ABE:0x7B21,0xE78CA4:0x7B22,
	0xEFA896:0x7B23,0xE78DB7:0x7B24,0xE78EBD:0x7B25,0xE78F89:0x7B26,0xE78F96:0x7B27,
	0xE78FA3:0x7B28,0xE78F92:0x7B29,0xE79087:0x7B2A,0xE78FB5:0x7B2B,0xE790A6:0x7B2C,
	0xE790AA:0x7B2D,0xE790A9:0x7B2E,0xE790AE:0x7B2F,0xE791A2:0x7B30,0xE79289:0x7B31,
	0xE7929F:0x7B32,0xE79481:0x7B33,0xE795AF:0x7B34,0xE79A82:0x7B35,0xE79A9C:0x7B36,
	0xE79A9E:0x7B37,0xE79A9B:0x7B38,0xE79AA6:0x7B39,0xEFA897:0x7B3A,0xE79D86:0x7B3B,
	0xE58AAF:0x7B3C,0xE7A0A1:0x7B3D,0xE7A18E:0x7B3E,0xE7A1A4:0x7B3F,0xE7A1BA:0x7B40,
	0xE7A4B0:0x7B41,0xEFA898:0x7B42,0xEFA899:0x7B43,0xEFA89A:0x7B44,0xE7A694:0x7B45,
	0xEFA89B:0x7B46,0xE7A69B:0x7B47,0xE7AB91:0x7B48,0xE7ABA7:0x7B49,0xEFA89C:0x7B4A,
	0xE7ABAB:0x7B4B,0xE7AE9E:0x7B4C,0xEFA89D:0x7B4D,0xE7B588:0x7B4E,0xE7B59C:0x7B4F,
	0xE7B6B7:0x7B50,0xE7B6A0:0x7B51,0xE7B796:0x7B52,0xE7B992:0x7B53,0xE7BD87:0x7B54,
	0xE7BEA1:0x7B55,0xEFA89E:0x7B56,0xE88C81:0x7B57,0xE88DA2:0x7B58,0xE88DBF:0x7B59,
	0xE88F87:0x7B5A,0xE88FB6:0x7B5B,0xE89188:0x7B5C,0xE892B4:0x7B5D,0xE89593:0x7B5E,
	0xE89599:0x7B5F,0xE895AB:0x7B60,0xEFA89F:0x7B61,0xE896B0:0x7B62,0xEFA8A0:0x7B63,
	0xEFA8A1:0x7B64,0xE8A087:0x7B65,0xE8A3B5:0x7B66,0xE8A892:0x7B67,0xE8A8B7:0x7B68,
	0xE8A9B9:0x7B69,0xE8AAA7:0x7B6A,0xE8AABE:0x7B6B,0xE8AB9F:0x7B6C,0xEFA8A2:0x7B6D,
	0xE8ABB6:0x7B6E,0xE8AD93:0x7B6F,0xE8ADBF:0x7B70,0xE8B3B0:0x7B71,0xE8B3B4:0x7B72,
	0xE8B492:0x7B73,0xE8B5B6:0x7B74,0xEFA8A3:0x7B75,0xE8BB8F:0x7B76,0xEFA8A4:0x7B77,
	0xEFA8A5:0x7B78,0xE981A7:0x7B79,0xE9839E:0x7B7A,0xEFA8A6:0x7B7B,0xE98495:0x7B7C,
	0xE984A7:0x7B7D,0xE9879A:0x7B7E,0xE98797:0x7C21,0xE9879E:0x7C22,0xE987AD:0x7C23,
	0xE987AE:0x7C24,0xE987A4:0x7C25,0xE987A5:0x7C26,0xE98886:0x7C27,0xE98890:0x7C28,
	0xE9888A:0x7C29,0xE988BA:0x7C2A,0xE98980:0x7C2B,0xE988BC:0x7C2C,0xE9898E:0x7C2D,
	0xE98999:0x7C2E,0xE98991:0x7C2F,0xE988B9:0x7C30,0xE989A7:0x7C31,0xE98AA7:0x7C32,
	0xE989B7:0x7C33,0xE989B8:0x7C34,0xE98BA7:0x7C35,0xE98B97:0x7C36,0xE98B99:0x7C37,
	0xE98B90:0x7C38,0xEFA8A7:0x7C39,0xE98B95:0x7C3A,0xE98BA0:0x7C3B,0xE98B93:0x7C3C,
	0xE98CA5:0x7C3D,0xE98CA1:0x7C3E,0xE98BBB:0x7C3F,0xEFA8A8:0x7C40,0xE98C9E:0x7C41,
	0xE98BBF:0x7C42,0xE98C9D:0x7C43,0xE98C82:0x7C44,0xE98DB0:0x7C45,0xE98D97:0x7C46,
	0xE98EA4:0x7C47,0xE98F86:0x7C48,0xE98F9E:0x7C49,0xE98FB8:0x7C4A,0xE990B1:0x7C4B,
	0xE99185:0x7C4C,0xE99188:0x7C4D,0xE99692:0x7C4E,0xEFA79C:0x7C4F,0xEFA8A9:0x7C50,
	0xE99A9D:0x7C51,0xE99AAF:0x7C52,0xE99CB3:0x7C53,0xE99CBB:0x7C54,0xE99D83:0x7C55,
	0xE99D8D:0x7C56,0xE99D8F:0x7C57,0xE99D91:0x7C58,0xE99D95:0x7C59,0xE9A197:0x7C5A,
	0xE9A1A5:0x7C5B,0xEFA8AA:0x7C5C,0xEFA8AB:0x7C5D,0xE9A4A7:0x7C5E,0xEFA8AC:0x7C5F,
	0xE9A69E:0x7C60,0xE9A98E:0x7C61,0xE9AB99:0x7C62,0xE9AB9C:0x7C63,0xE9ADB5:0x7C64,
	0xE9ADB2:0x7C65,0xE9AE8F:0x7C66,0xE9AEB1:0x7C67,0xE9AEBB:0x7C68,0xE9B080:0x7C69,
	0xE9B5B0:0x7C6A,0xE9B5AB:0x7C6B,0xEFA8AD:0x7C6C,0xE9B899:0x7C6D,0xE9BB91:0x7C6E,
	0xE285B0:0x7C71,0xE285B1:0x7C72,0xE285B2:0x7C73,0xE285B3:0x7C74,0xE285B4:0x7C75,
	0xE285B5:0x7C76,0xE285B6:0x7C77,0xE285B7:0x7C78,0xE285B8:0x7C79,0xE285B9:0x7C7A,
	0xEFBFA4:0x7C7C,0xEFBC87:0x7C7D,0xEFBC82:0x7C7E,

	//FIXME: mojibake
	0xE288A5:0x2142,
	0xEFBFA2:0x224C,
	0xE28892:0x1215D
	};

	/**
	 * The encoding conversion table for UTF-8 to JIS X 0212:1990 (Hojo-Kanji).
	 *
	 * @ignore
	 */
	var UTF8_TO_JISX0212_TABLE = {
	0xCB98:0x222F,0xCB87:0x2230,0xC2B8:0x2231,0xCB99:0x2232,0xCB9D:0x2233,
	0xC2AF:0x2234,0xCB9B:0x2235,0xCB9A:0x2236,0x7E:0x2237,0xCE84:0x2238,
	0xCE85:0x2239,0xC2A1:0x2242,0xC2A6:0x2243,0xC2BF:0x2244,0xC2BA:0x226B,
	0xC2AA:0x226C,0xC2A9:0x226D,0xC2AE:0x226E,0xE284A2:0x226F,0xC2A4:0x2270,
	0xE28496:0x2271,0xCE86:0x2661,0xCE88:0x2662,0xCE89:0x2663,0xCE8A:0x2664,
	0xCEAA:0x2665,0xCE8C:0x2667,0xCE8E:0x2669,0xCEAB:0x266A,0xCE8F:0x266C,
	0xCEAC:0x2671,0xCEAD:0x2672,0xCEAE:0x2673,0xCEAF:0x2674,0xCF8A:0x2675,
	0xCE90:0x2676,0xCF8C:0x2677,0xCF82:0x2678,0xCF8D:0x2679,0xCF8B:0x267A,
	0xCEB0:0x267B,0xCF8E:0x267C,0xD082:0x2742,0xD083:0x2743,0xD084:0x2744,
	0xD085:0x2745,0xD086:0x2746,0xD087:0x2747,0xD088:0x2748,0xD089:0x2749,
	0xD08A:0x274A,0xD08B:0x274B,0xD08C:0x274C,0xD08E:0x274D,0xD08F:0x274E,
	0xD192:0x2772,0xD193:0x2773,0xD194:0x2774,0xD195:0x2775,0xD196:0x2776,
	0xD197:0x2777,0xD198:0x2778,0xD199:0x2779,0xD19A:0x277A,0xD19B:0x277B,
	0xD19C:0x277C,0xD19E:0x277D,0xD19F:0x277E,0xC386:0x2921,0xC490:0x2922,
	0xC4A6:0x2924,0xC4B2:0x2926,0xC581:0x2928,0xC4BF:0x2929,0xC58A:0x292B,
	0xC398:0x292C,0xC592:0x292D,0xC5A6:0x292F,0xC39E:0x2930,0xC3A6:0x2941,
	0xC491:0x2942,0xC3B0:0x2943,0xC4A7:0x2944,0xC4B1:0x2945,0xC4B3:0x2946,
	0xC4B8:0x2947,0xC582:0x2948,0xC580:0x2949,0xC589:0x294A,0xC58B:0x294B,
	0xC3B8:0x294C,0xC593:0x294D,0xC39F:0x294E,0xC5A7:0x294F,0xC3BE:0x2950,
	0xC381:0x2A21,0xC380:0x2A22,0xC384:0x2A23,0xC382:0x2A24,0xC482:0x2A25,
	0xC78D:0x2A26,0xC480:0x2A27,0xC484:0x2A28,0xC385:0x2A29,0xC383:0x2A2A,
	0xC486:0x2A2B,0xC488:0x2A2C,0xC48C:0x2A2D,0xC387:0x2A2E,0xC48A:0x2A2F,
	0xC48E:0x2A30,0xC389:0x2A31,0xC388:0x2A32,0xC38B:0x2A33,0xC38A:0x2A34,
	0xC49A:0x2A35,0xC496:0x2A36,0xC492:0x2A37,0xC498:0x2A38,0xC49C:0x2A3A,
	0xC49E:0x2A3B,0xC4A2:0x2A3C,0xC4A0:0x2A3D,0xC4A4:0x2A3E,0xC38D:0x2A3F,
	0xC38C:0x2A40,0xC38F:0x2A41,0xC38E:0x2A42,0xC78F:0x2A43,0xC4B0:0x2A44,
	0xC4AA:0x2A45,0xC4AE:0x2A46,0xC4A8:0x2A47,0xC4B4:0x2A48,0xC4B6:0x2A49,
	0xC4B9:0x2A4A,0xC4BD:0x2A4B,0xC4BB:0x2A4C,0xC583:0x2A4D,0xC587:0x2A4E,
	0xC585:0x2A4F,0xC391:0x2A50,0xC393:0x2A51,0xC392:0x2A52,0xC396:0x2A53,
	0xC394:0x2A54,0xC791:0x2A55,0xC590:0x2A56,0xC58C:0x2A57,0xC395:0x2A58,
	0xC594:0x2A59,0xC598:0x2A5A,0xC596:0x2A5B,0xC59A:0x2A5C,0xC59C:0x2A5D,
	0xC5A0:0x2A5E,0xC59E:0x2A5F,0xC5A4:0x2A60,0xC5A2:0x2A61,0xC39A:0x2A62,
	0xC399:0x2A63,0xC39C:0x2A64,0xC39B:0x2A65,0xC5AC:0x2A66,0xC793:0x2A67,
	0xC5B0:0x2A68,0xC5AA:0x2A69,0xC5B2:0x2A6A,0xC5AE:0x2A6B,0xC5A8:0x2A6C,
	0xC797:0x2A6D,0xC79B:0x2A6E,0xC799:0x2A6F,0xC795:0x2A70,0xC5B4:0x2A71,
	0xC39D:0x2A72,0xC5B8:0x2A73,0xC5B6:0x2A74,0xC5B9:0x2A75,0xC5BD:0x2A76,
	0xC5BB:0x2A77,0xC3A1:0x2B21,0xC3A0:0x2B22,0xC3A4:0x2B23,0xC3A2:0x2B24,
	0xC483:0x2B25,0xC78E:0x2B26,0xC481:0x2B27,0xC485:0x2B28,0xC3A5:0x2B29,
	0xC3A3:0x2B2A,0xC487:0x2B2B,0xC489:0x2B2C,0xC48D:0x2B2D,0xC3A7:0x2B2E,
	0xC48B:0x2B2F,0xC48F:0x2B30,0xC3A9:0x2B31,0xC3A8:0x2B32,0xC3AB:0x2B33,
	0xC3AA:0x2B34,0xC49B:0x2B35,0xC497:0x2B36,0xC493:0x2B37,0xC499:0x2B38,
	0xC7B5:0x2B39,0xC49D:0x2B3A,0xC49F:0x2B3B,0xC4A1:0x2B3D,0xC4A5:0x2B3E,
	0xC3AD:0x2B3F,0xC3AC:0x2B40,0xC3AF:0x2B41,0xC3AE:0x2B42,0xC790:0x2B43,
	0xC4AB:0x2B45,0xC4AF:0x2B46,0xC4A9:0x2B47,0xC4B5:0x2B48,0xC4B7:0x2B49,
	0xC4BA:0x2B4A,0xC4BE:0x2B4B,0xC4BC:0x2B4C,0xC584:0x2B4D,0xC588:0x2B4E,
	0xC586:0x2B4F,0xC3B1:0x2B50,0xC3B3:0x2B51,0xC3B2:0x2B52,0xC3B6:0x2B53,
	0xC3B4:0x2B54,0xC792:0x2B55,0xC591:0x2B56,0xC58D:0x2B57,0xC3B5:0x2B58,
	0xC595:0x2B59,0xC599:0x2B5A,0xC597:0x2B5B,0xC59B:0x2B5C,0xC59D:0x2B5D,
	0xC5A1:0x2B5E,0xC59F:0x2B5F,0xC5A5:0x2B60,0xC5A3:0x2B61,0xC3BA:0x2B62,
	0xC3B9:0x2B63,0xC3BC:0x2B64,0xC3BB:0x2B65,0xC5AD:0x2B66,0xC794:0x2B67,
	0xC5B1:0x2B68,0xC5AB:0x2B69,0xC5B3:0x2B6A,0xC5AF:0x2B6B,0xC5A9:0x2B6C,
	0xC798:0x2B6D,0xC79C:0x2B6E,0xC79A:0x2B6F,0xC796:0x2B70,0xC5B5:0x2B71,
	0xC3BD:0x2B72,0xC3BF:0x2B73,0xC5B7:0x2B74,0xC5BA:0x2B75,0xC5BE:0x2B76,
	0xC5BC:0x2B77,
	0xE4B882:0x3021,0xE4B884:0x3022,0xE4B885:0x3023,0xE4B88C:0x3024,
	0xE4B892:0x3025,0xE4B89F:0x3026,0xE4B8A3:0x3027,0xE4B8A4:0x3028,0xE4B8A8:0x3029,
	0xE4B8AB:0x302A,0xE4B8AE:0x302B,0xE4B8AF:0x302C,0xE4B8B0:0x302D,0xE4B8B5:0x302E,
	0xE4B980:0x302F,0xE4B981:0x3030,0xE4B984:0x3031,0xE4B987:0x3032,0xE4B991:0x3033,
	0xE4B99A:0x3034,0xE4B99C:0x3035,0xE4B9A3:0x3036,0xE4B9A8:0x3037,0xE4B9A9:0x3038,
	0xE4B9B4:0x3039,0xE4B9B5:0x303A,0xE4B9B9:0x303B,0xE4B9BF:0x303C,0xE4BA8D:0x303D,
	0xE4BA96:0x303E,0xE4BA97:0x303F,0xE4BA9D:0x3040,0xE4BAAF:0x3041,0xE4BAB9:0x3042,
	0xE4BB83:0x3043,0xE4BB90:0x3044,0xE4BB9A:0x3045,0xE4BB9B:0x3046,0xE4BBA0:0x3047,
	0xE4BBA1:0x3048,0xE4BBA2:0x3049,0xE4BBA8:0x304A,0xE4BBAF:0x304B,0xE4BBB1:0x304C,
	0xE4BBB3:0x304D,0xE4BBB5:0x304E,0xE4BBBD:0x304F,0xE4BBBE:0x3050,0xE4BBBF:0x3051,
	0xE4BC80:0x3052,0xE4BC82:0x3053,0xE4BC83:0x3054,0xE4BC88:0x3055,0xE4BC8B:0x3056,
	0xE4BC8C:0x3057,0xE4BC92:0x3058,0xE4BC95:0x3059,0xE4BC96:0x305A,0xE4BC97:0x305B,
	0xE4BC99:0x305C,0xE4BCAE:0x305D,0xE4BCB1:0x305E,0xE4BDA0:0x305F,0xE4BCB3:0x3060,
	0xE4BCB5:0x3061,0xE4BCB7:0x3062,0xE4BCB9:0x3063,0xE4BCBB:0x3064,0xE4BCBE:0x3065,
	0xE4BD80:0x3066,0xE4BD82:0x3067,0xE4BD88:0x3068,0xE4BD89:0x3069,0xE4BD8B:0x306A,
	0xE4BD8C:0x306B,0xE4BD92:0x306C,0xE4BD94:0x306D,0xE4BD96:0x306E,0xE4BD98:0x306F,
	0xE4BD9F:0x3070,0xE4BDA3:0x3071,0xE4BDAA:0x3072,0xE4BDAC:0x3073,0xE4BDAE:0x3074,
	0xE4BDB1:0x3075,0xE4BDB7:0x3076,0xE4BDB8:0x3077,0xE4BDB9:0x3078,0xE4BDBA:0x3079,
	0xE4BDBD:0x307A,0xE4BDBE:0x307B,0xE4BE81:0x307C,0xE4BE82:0x307D,0xE4BE84:0x307E,
	0xE4BE85:0x3121,0xE4BE89:0x3122,0xE4BE8A:0x3123,0xE4BE8C:0x3124,0xE4BE8E:0x3125,
	0xE4BE90:0x3126,0xE4BE92:0x3127,0xE4BE93:0x3128,0xE4BE94:0x3129,0xE4BE97:0x312A,
	0xE4BE99:0x312B,0xE4BE9A:0x312C,0xE4BE9E:0x312D,0xE4BE9F:0x312E,0xE4BEB2:0x312F,
	0xE4BEB7:0x3130,0xE4BEB9:0x3131,0xE4BEBB:0x3132,0xE4BEBC:0x3133,0xE4BEBD:0x3134,
	0xE4BEBE:0x3135,0xE4BF80:0x3136,0xE4BF81:0x3137,0xE4BF85:0x3138,0xE4BF86:0x3139,
	0xE4BF88:0x313A,0xE4BF89:0x313B,0xE4BF8B:0x313C,0xE4BF8C:0x313D,0xE4BF8D:0x313E,
	0xE4BF8F:0x313F,0xE4BF92:0x3140,0xE4BF9C:0x3141,0xE4BFA0:0x3142,0xE4BFA2:0x3143,
	0xE4BFB0:0x3144,0xE4BFB2:0x3145,0xE4BFBC:0x3146,0xE4BFBD:0x3147,0xE4BFBF:0x3148,
	0xE58080:0x3149,0xE58081:0x314A,0xE58084:0x314B,0xE58087:0x314C,0xE5808A:0x314D,
	0xE5808C:0x314E,0xE5808E:0x314F,0xE58090:0x3150,0xE58093:0x3151,0xE58097:0x3152,
	0xE58098:0x3153,0xE5809B:0x3154,0xE5809C:0x3155,0xE5809D:0x3156,0xE5809E:0x3157,
	0xE580A2:0x3158,0xE580A7:0x3159,0xE580AE:0x315A,0xE580B0:0x315B,0xE580B2:0x315C,
	0xE580B3:0x315D,0xE580B5:0x315E,0xE58180:0x315F,0xE58181:0x3160,0xE58182:0x3161,
	0xE58185:0x3162,0xE58186:0x3163,0xE5818A:0x3164,0xE5818C:0x3165,0xE5818E:0x3166,
	0xE58191:0x3167,0xE58192:0x3168,0xE58193:0x3169,0xE58197:0x316A,0xE58199:0x316B,
	0xE5819F:0x316C,0xE581A0:0x316D,0xE581A2:0x316E,0xE581A3:0x316F,0xE581A6:0x3170,
	0xE581A7:0x3171,0xE581AA:0x3172,0xE581AD:0x3173,0xE581B0:0x3174,0xE581B1:0x3175,
	0xE580BB:0x3176,0xE58281:0x3177,0xE58283:0x3178,0xE58284:0x3179,0xE58286:0x317A,
	0xE5828A:0x317B,0xE5828E:0x317C,0xE5828F:0x317D,0xE58290:0x317E,0xE58292:0x3221,
	0xE58293:0x3222,0xE58294:0x3223,0xE58296:0x3224,0xE5829B:0x3225,0xE5829C:0x3226,
	0xE5829E:0x3227,0xE5829F:0x3228,0xE582A0:0x3229,0xE582A1:0x322A,0xE582A2:0x322B,
	0xE582AA:0x322C,0xE582AF:0x322D,0xE582B0:0x322E,0xE582B9:0x322F,0xE582BA:0x3230,
	0xE582BD:0x3231,0xE58380:0x3232,0xE58383:0x3233,0xE58384:0x3234,0xE58387:0x3235,
	0xE5838C:0x3236,0xE5838E:0x3237,0xE58390:0x3238,0xE58393:0x3239,0xE58394:0x323A,
	0xE58398:0x323B,0xE5839C:0x323C,0xE5839D:0x323D,0xE5839F:0x323E,0xE583A2:0x323F,
	0xE583A4:0x3240,0xE583A6:0x3241,0xE583A8:0x3242,0xE583A9:0x3243,0xE583AF:0x3244,
	0xE583B1:0x3245,0xE583B6:0x3246,0xE583BA:0x3247,0xE583BE:0x3248,0xE58483:0x3249,
	0xE58486:0x324A,0xE58487:0x324B,0xE58488:0x324C,0xE5848B:0x324D,0xE5848C:0x324E,
	0xE5848D:0x324F,0xE5848E:0x3250,0xE583B2:0x3251,0xE58490:0x3252,0xE58497:0x3253,
	0xE58499:0x3254,0xE5849B:0x3255,0xE5849C:0x3256,0xE5849D:0x3257,0xE5849E:0x3258,
	0xE584A3:0x3259,0xE584A7:0x325A,0xE584A8:0x325B,0xE584AC:0x325C,0xE584AD:0x325D,
	0xE584AF:0x325E,0xE584B1:0x325F,0xE584B3:0x3260,0xE584B4:0x3261,0xE584B5:0x3262,
	0xE584B8:0x3263,0xE584B9:0x3264,0xE58582:0x3265,0xE5858A:0x3266,0xE5858F:0x3267,
	0xE58593:0x3268,0xE58595:0x3269,0xE58597:0x326A,0xE58598:0x326B,0xE5859F:0x326C,
	0xE585A4:0x326D,0xE585A6:0x326E,0xE585BE:0x326F,0xE58683:0x3270,0xE58684:0x3271,
	0xE5868B:0x3272,0xE5868E:0x3273,0xE58698:0x3274,0xE5869D:0x3275,0xE586A1:0x3276,
	0xE586A3:0x3277,0xE586AD:0x3278,0xE586B8:0x3279,0xE586BA:0x327A,0xE586BC:0x327B,
	0xE586BE:0x327C,0xE586BF:0x327D,0xE58782:0x327E,0xE58788:0x3321,0xE5878F:0x3322,
	0xE58791:0x3323,0xE58792:0x3324,0xE58793:0x3325,0xE58795:0x3326,0xE58798:0x3327,
	0xE5879E:0x3328,0xE587A2:0x3329,0xE587A5:0x332A,0xE587AE:0x332B,0xE587B2:0x332C,
	0xE587B3:0x332D,0xE587B4:0x332E,0xE587B7:0x332F,0xE58881:0x3330,0xE58882:0x3331,
	0xE58885:0x3332,0xE58892:0x3333,0xE58893:0x3334,0xE58895:0x3335,0xE58896:0x3336,
	0xE58898:0x3337,0xE588A2:0x3338,0xE588A8:0x3339,0xE588B1:0x333A,0xE588B2:0x333B,
	0xE588B5:0x333C,0xE588BC:0x333D,0xE58985:0x333E,0xE58989:0x333F,0xE58995:0x3340,
	0xE58997:0x3341,0xE58998:0x3342,0xE5899A:0x3343,0xE5899C:0x3344,0xE5899F:0x3345,
	0xE589A0:0x3346,0xE589A1:0x3347,0xE589A6:0x3348,0xE589AE:0x3349,0xE589B7:0x334A,
	0xE589B8:0x334B,0xE589B9:0x334C,0xE58A80:0x334D,0xE58A82:0x334E,0xE58A85:0x334F,
	0xE58A8A:0x3350,0xE58A8C:0x3351,0xE58A93:0x3352,0xE58A95:0x3353,0xE58A96:0x3354,
	0xE58A97:0x3355,0xE58A98:0x3356,0xE58A9A:0x3357,0xE58A9C:0x3358,0xE58AA4:0x3359,
	0xE58AA5:0x335A,0xE58AA6:0x335B,0xE58AA7:0x335C,0xE58AAF:0x335D,0xE58AB0:0x335E,
	0xE58AB6:0x335F,0xE58AB7:0x3360,0xE58AB8:0x3361,0xE58ABA:0x3362,0xE58ABB:0x3363,
	0xE58ABD:0x3364,0xE58B80:0x3365,0xE58B84:0x3366,0xE58B86:0x3367,0xE58B88:0x3368,
	0xE58B8C:0x3369,0xE58B8F:0x336A,0xE58B91:0x336B,0xE58B94:0x336C,0xE58B96:0x336D,
	0xE58B9B:0x336E,0xE58B9C:0x336F,0xE58BA1:0x3370,0xE58BA5:0x3371,0xE58BA8:0x3372,
	0xE58BA9:0x3373,0xE58BAA:0x3374,0xE58BAC:0x3375,0xE58BB0:0x3376,0xE58BB1:0x3377,
	0xE58BB4:0x3378,0xE58BB6:0x3379,0xE58BB7:0x337A,0xE58C80:0x337B,0xE58C83:0x337C,
	0xE58C8A:0x337D,0xE58C8B:0x337E,0xE58C8C:0x3421,0xE58C91:0x3422,0xE58C93:0x3423,
	0xE58C98:0x3424,0xE58C9B:0x3425,0xE58C9C:0x3426,0xE58C9E:0x3427,0xE58C9F:0x3428,
	0xE58CA5:0x3429,0xE58CA7:0x342A,0xE58CA8:0x342B,0xE58CA9:0x342C,0xE58CAB:0x342D,
	0xE58CAC:0x342E,0xE58CAD:0x342F,0xE58CB0:0x3430,0xE58CB2:0x3431,0xE58CB5:0x3432,
	0xE58CBC:0x3433,0xE58CBD:0x3434,0xE58CBE:0x3435,0xE58D82:0x3436,0xE58D8C:0x3437,
	0xE58D8B:0x3438,0xE58D99:0x3439,0xE58D9B:0x343A,0xE58DA1:0x343B,0xE58DA3:0x343C,
	0xE58DA5:0x343D,0xE58DAC:0x343E,0xE58DAD:0x343F,0xE58DB2:0x3440,0xE58DB9:0x3441,
	0xE58DBE:0x3442,0xE58E83:0x3443,0xE58E87:0x3444,0xE58E88:0x3445,0xE58E8E:0x3446,
	0xE58E93:0x3447,0xE58E94:0x3448,0xE58E99:0x3449,0xE58E9D:0x344A,0xE58EA1:0x344B,
	0xE58EA4:0x344C,0xE58EAA:0x344D,0xE58EAB:0x344E,0xE58EAF:0x344F,0xE58EB2:0x3450,
	0xE58EB4:0x3451,0xE58EB5:0x3452,0xE58EB7:0x3453,0xE58EB8:0x3454,0xE58EBA:0x3455,
	0xE58EBD:0x3456,0xE58F80:0x3457,0xE58F85:0x3458,0xE58F8F:0x3459,0xE58F92:0x345A,
	0xE58F93:0x345B,0xE58F95:0x345C,0xE58F9A:0x345D,0xE58F9D:0x345E,0xE58F9E:0x345F,
	0xE58FA0:0x3460,0xE58FA6:0x3461,0xE58FA7:0x3462,0xE58FB5:0x3463,0xE59082:0x3464,
	0xE59093:0x3465,0xE5909A:0x3466,0xE590A1:0x3467,0xE590A7:0x3468,0xE590A8:0x3469,
	0xE590AA:0x346A,0xE590AF:0x346B,0xE590B1:0x346C,0xE590B4:0x346D,0xE590B5:0x346E,
	0xE59183:0x346F,0xE59184:0x3470,0xE59187:0x3471,0xE5918D:0x3472,0xE5918F:0x3473,
	0xE5919E:0x3474,0xE591A2:0x3475,0xE591A4:0x3476,0xE591A6:0x3477,0xE591A7:0x3478,
	0xE591A9:0x3479,0xE591AB:0x347A,0xE591AD:0x347B,0xE591AE:0x347C,0xE591B4:0x347D,
	0xE591BF:0x347E,0xE59281:0x3521,0xE59283:0x3522,0xE59285:0x3523,0xE59288:0x3524,
	0xE59289:0x3525,0xE5928D:0x3526,0xE59291:0x3527,0xE59295:0x3528,0xE59296:0x3529,
	0xE5929C:0x352A,0xE5929F:0x352B,0xE592A1:0x352C,0xE592A6:0x352D,0xE592A7:0x352E,
	0xE592A9:0x352F,0xE592AA:0x3530,0xE592AD:0x3531,0xE592AE:0x3532,0xE592B1:0x3533,
	0xE592B7:0x3534,0xE592B9:0x3535,0xE592BA:0x3536,0xE592BB:0x3537,0xE592BF:0x3538,
	0xE59386:0x3539,0xE5938A:0x353A,0xE5938D:0x353B,0xE5938E:0x353C,0xE593A0:0x353D,
	0xE593AA:0x353E,0xE593AC:0x353F,0xE593AF:0x3540,0xE593B6:0x3541,0xE593BC:0x3542,
	0xE593BE:0x3543,0xE593BF:0x3544,0xE59480:0x3545,0xE59481:0x3546,0xE59485:0x3547,
	0xE59488:0x3548,0xE59489:0x3549,0xE5948C:0x354A,0xE5948D:0x354B,0xE5948E:0x354C,
	0xE59495:0x354D,0xE594AA:0x354E,0xE594AB:0x354F,0xE594B2:0x3550,0xE594B5:0x3551,
	0xE594B6:0x3552,0xE594BB:0x3553,0xE594BC:0x3554,0xE594BD:0x3555,0xE59581:0x3556,
	0xE59587:0x3557,0xE59589:0x3558,0xE5958A:0x3559,0xE5958D:0x355A,0xE59590:0x355B,
	0xE59591:0x355C,0xE59598:0x355D,0xE5959A:0x355E,0xE5959B:0x355F,0xE5959E:0x3560,
	0xE595A0:0x3561,0xE595A1:0x3562,0xE595A4:0x3563,0xE595A6:0x3564,0xE595BF:0x3565,
	0xE59681:0x3566,0xE59682:0x3567,0xE59686:0x3568,0xE59688:0x3569,0xE5968E:0x356A,
	0xE5968F:0x356B,0xE59691:0x356C,0xE59692:0x356D,0xE59693:0x356E,0xE59694:0x356F,
	0xE59697:0x3570,0xE596A3:0x3571,0xE596A4:0x3572,0xE596AD:0x3573,0xE596B2:0x3574,
	0xE596BF:0x3575,0xE59781:0x3576,0xE59783:0x3577,0xE59786:0x3578,0xE59789:0x3579,
	0xE5978B:0x357A,0xE5978C:0x357B,0xE5978E:0x357C,0xE59791:0x357D,0xE59792:0x357E,
	0xE59793:0x3621,0xE59797:0x3622,0xE59798:0x3623,0xE5979B:0x3624,0xE5979E:0x3625,
	0xE597A2:0x3626,0xE597A9:0x3627,0xE597B6:0x3628,0xE597BF:0x3629,0xE59885:0x362A,
	0xE59888:0x362B,0xE5988A:0x362C,0xE5988D:0x362D,0xE5988E:0x362E,0xE5988F:0x362F,
	0xE59890:0x3630,0xE59891:0x3631,0xE59892:0x3632,0xE59899:0x3633,0xE598AC:0x3634,
	0xE598B0:0x3635,0xE598B3:0x3636,0xE598B5:0x3637,0xE598B7:0x3638,0xE598B9:0x3639,
	0xE598BB:0x363A,0xE598BC:0x363B,0xE598BD:0x363C,0xE598BF:0x363D,0xE59980:0x363E,
	0xE59981:0x363F,0xE59983:0x3640,0xE59984:0x3641,0xE59986:0x3642,0xE59989:0x3643,
	0xE5998B:0x3644,0xE5998D:0x3645,0xE5998F:0x3646,0xE59994:0x3647,0xE5999E:0x3648,
	0xE599A0:0x3649,0xE599A1:0x364A,0xE599A2:0x364B,0xE599A3:0x364C,0xE599A6:0x364D,
	0xE599A9:0x364E,0xE599AD:0x364F,0xE599AF:0x3650,0xE599B1:0x3651,0xE599B2:0x3652,
	0xE599B5:0x3653,0xE59A84:0x3654,0xE59A85:0x3655,0xE59A88:0x3656,0xE59A8B:0x3657,
	0xE59A8C:0x3658,0xE59A95:0x3659,0xE59A99:0x365A,0xE59A9A:0x365B,0xE59A9D:0x365C,
	0xE59A9E:0x365D,0xE59A9F:0x365E,0xE59AA6:0x365F,0xE59AA7:0x3660,0xE59AA8:0x3661,
	0xE59AA9:0x3662,0xE59AAB:0x3663,0xE59AAC:0x3664,0xE59AAD:0x3665,0xE59AB1:0x3666,
	0xE59AB3:0x3667,0xE59AB7:0x3668,0xE59ABE:0x3669,0xE59B85:0x366A,0xE59B89:0x366B,
	0xE59B8A:0x366C,0xE59B8B:0x366D,0xE59B8F:0x366E,0xE59B90:0x366F,0xE59B8C:0x3670,
	0xE59B8D:0x3671,0xE59B99:0x3672,0xE59B9C:0x3673,0xE59B9D:0x3674,0xE59B9F:0x3675,
	0xE59BA1:0x3676,0xE59BA4:0x3677,0xE59BA5:0x3678,0xE59BA6:0x3679,0xE59BA7:0x367A,
	0xE59BA8:0x367B,0xE59BB1:0x367C,0xE59BAB:0x367D,0xE59BAD:0x367E,0xE59BB6:0x3721,
	0xE59BB7:0x3722,0xE59C81:0x3723,0xE59C82:0x3724,0xE59C87:0x3725,0xE59C8A:0x3726,
	0xE59C8C:0x3727,0xE59C91:0x3728,0xE59C95:0x3729,0xE59C9A:0x372A,0xE59C9B:0x372B,
	0xE59C9D:0x372C,0xE59CA0:0x372D,0xE59CA2:0x372E,0xE59CA3:0x372F,0xE59CA4:0x3730,
	0xE59CA5:0x3731,0xE59CA9:0x3732,0xE59CAA:0x3733,0xE59CAC:0x3734,0xE59CAE:0x3735,
	0xE59CAF:0x3736,0xE59CB3:0x3737,0xE59CB4:0x3738,0xE59CBD:0x3739,0xE59CBE:0x373A,
	0xE59CBF:0x373B,0xE59D85:0x373C,0xE59D86:0x373D,0xE59D8C:0x373E,0xE59D8D:0x373F,
	0xE59D92:0x3740,0xE59DA2:0x3741,0xE59DA5:0x3742,0xE59DA7:0x3743,0xE59DA8:0x3744,
	0xE59DAB:0x3745,0xE59DAD:0x3746,0xE59DAE:0x3747,0xE59DAF:0x3748,0xE59DB0:0x3749,
	0xE59DB1:0x374A,0xE59DB3:0x374B,0xE59DB4:0x374C,0xE59DB5:0x374D,0xE59DB7:0x374E,
	0xE59DB9:0x374F,0xE59DBA:0x3750,0xE59DBB:0x3751,0xE59DBC:0x3752,0xE59DBE:0x3753,
	0xE59E81:0x3754,0xE59E83:0x3755,0xE59E8C:0x3756,0xE59E94:0x3757,0xE59E97:0x3758,
	0xE59E99:0x3759,0xE59E9A:0x375A,0xE59E9C:0x375B,0xE59E9D:0x375C,0xE59E9E:0x375D,
	0xE59E9F:0x375E,0xE59EA1:0x375F,0xE59E95:0x3760,0xE59EA7:0x3761,0xE59EA8:0x3762,
	0xE59EA9:0x3763,0xE59EAC:0x3764,0xE59EB8:0x3765,0xE59EBD:0x3766,0xE59F87:0x3767,
	0xE59F88:0x3768,0xE59F8C:0x3769,0xE59F8F:0x376A,0xE59F95:0x376B,0xE59F9D:0x376C,
	0xE59F9E:0x376D,0xE59FA4:0x376E,0xE59FA6:0x376F,0xE59FA7:0x3770,0xE59FA9:0x3771,
	0xE59FAD:0x3772,0xE59FB0:0x3773,0xE59FB5:0x3774,0xE59FB6:0x3775,0xE59FB8:0x3776,
	0xE59FBD:0x3777,0xE59FBE:0x3778,0xE59FBF:0x3779,0xE5A083:0x377A,0xE5A084:0x377B,
	0xE5A088:0x377C,0xE5A089:0x377D,0xE59FA1:0x377E,0xE5A08C:0x3821,0xE5A08D:0x3822,
	0xE5A09B:0x3823,0xE5A09E:0x3824,0xE5A09F:0x3825,0xE5A0A0:0x3826,0xE5A0A6:0x3827,
	0xE5A0A7:0x3828,0xE5A0AD:0x3829,0xE5A0B2:0x382A,0xE5A0B9:0x382B,0xE5A0BF:0x382C,
	0xE5A189:0x382D,0xE5A18C:0x382E,0xE5A18D:0x382F,0xE5A18F:0x3830,0xE5A190:0x3831,
	0xE5A195:0x3832,0xE5A19F:0x3833,0xE5A1A1:0x3834,0xE5A1A4:0x3835,0xE5A1A7:0x3836,
	0xE5A1A8:0x3837,0xE5A1B8:0x3838,0xE5A1BC:0x3839,0xE5A1BF:0x383A,0xE5A280:0x383B,
	0xE5A281:0x383C,0xE5A287:0x383D,0xE5A288:0x383E,0xE5A289:0x383F,0xE5A28A:0x3840,
	0xE5A28C:0x3841,0xE5A28D:0x3842,0xE5A28F:0x3843,0xE5A290:0x3844,0xE5A294:0x3845,
	0xE5A296:0x3846,0xE5A29D:0x3847,0xE5A2A0:0x3848,0xE5A2A1:0x3849,0xE5A2A2:0x384A,
	0xE5A2A6:0x384B,0xE5A2A9:0x384C,0xE5A2B1:0x384D,0xE5A2B2:0x384E,0xE5A384:0x384F,
	0xE5A2BC:0x3850,0xE5A382:0x3851,0xE5A388:0x3852,0xE5A38D:0x3853,0xE5A38E:0x3854,
	0xE5A390:0x3855,0xE5A392:0x3856,0xE5A394:0x3857,0xE5A396:0x3858,0xE5A39A:0x3859,
	0xE5A39D:0x385A,0xE5A3A1:0x385B,0xE5A3A2:0x385C,0xE5A3A9:0x385D,0xE5A3B3:0x385E,
	0xE5A485:0x385F,0xE5A486:0x3860,0xE5A48B:0x3861,0xE5A48C:0x3862,0xE5A492:0x3863,
	0xE5A493:0x3864,0xE5A494:0x3865,0xE89981:0x3866,0xE5A49D:0x3867,0xE5A4A1:0x3868,
	0xE5A4A3:0x3869,0xE5A4A4:0x386A,0xE5A4A8:0x386B,0xE5A4AF:0x386C,0xE5A4B0:0x386D,
	0xE5A4B3:0x386E,0xE5A4B5:0x386F,0xE5A4B6:0x3870,0xE5A4BF:0x3871,0xE5A583:0x3872,
	0xE5A586:0x3873,0xE5A592:0x3874,0xE5A593:0x3875,0xE5A599:0x3876,0xE5A59B:0x3877,
	0xE5A59D:0x3878,0xE5A59E:0x3879,0xE5A59F:0x387A,0xE5A5A1:0x387B,0xE5A5A3:0x387C,
	0xE5A5AB:0x387D,0xE5A5AD:0x387E,0xE5A5AF:0x3921,0xE5A5B2:0x3922,0xE5A5B5:0x3923,
	0xE5A5B6:0x3924,0xE5A5B9:0x3925,0xE5A5BB:0x3926,0xE5A5BC:0x3927,0xE5A68B:0x3928,
	0xE5A68C:0x3929,0xE5A68E:0x392A,0xE5A692:0x392B,0xE5A695:0x392C,0xE5A697:0x392D,
	0xE5A69F:0x392E,0xE5A6A4:0x392F,0xE5A6A7:0x3930,0xE5A6AD:0x3931,0xE5A6AE:0x3932,
	0xE5A6AF:0x3933,0xE5A6B0:0x3934,0xE5A6B3:0x3935,0xE5A6B7:0x3936,0xE5A6BA:0x3937,
	0xE5A6BC:0x3938,0xE5A781:0x3939,0xE5A783:0x393A,0xE5A784:0x393B,0xE5A788:0x393C,
	0xE5A78A:0x393D,0xE5A78D:0x393E,0xE5A792:0x393F,0xE5A79D:0x3940,0xE5A79E:0x3941,
	0xE5A79F:0x3942,0xE5A7A3:0x3943,0xE5A7A4:0x3944,0xE5A7A7:0x3945,0xE5A7AE:0x3946,
	0xE5A7AF:0x3947,0xE5A7B1:0x3948,0xE5A7B2:0x3949,0xE5A7B4:0x394A,0xE5A7B7:0x394B,
	0xE5A880:0x394C,0xE5A884:0x394D,0xE5A88C:0x394E,0xE5A88D:0x394F,0xE5A88E:0x3950,
	0xE5A892:0x3951,0xE5A893:0x3952,0xE5A89E:0x3953,0xE5A8A3:0x3954,0xE5A8A4:0x3955,
	0xE5A8A7:0x3956,0xE5A8A8:0x3957,0xE5A8AA:0x3958,0xE5A8AD:0x3959,0xE5A8B0:0x395A,
	0xE5A984:0x395B,0xE5A985:0x395C,0xE5A987:0x395D,0xE5A988:0x395E,0xE5A98C:0x395F,
	0xE5A990:0x3960,0xE5A995:0x3961,0xE5A99E:0x3962,0xE5A9A3:0x3963,0xE5A9A5:0x3964,
	0xE5A9A7:0x3965,0xE5A9AD:0x3966,0xE5A9B7:0x3967,0xE5A9BA:0x3968,0xE5A9BB:0x3969,
	0xE5A9BE:0x396A,0xE5AA8B:0x396B,0xE5AA90:0x396C,0xE5AA93:0x396D,0xE5AA96:0x396E,
	0xE5AA99:0x396F,0xE5AA9C:0x3970,0xE5AA9E:0x3971,0xE5AA9F:0x3972,0xE5AAA0:0x3973,
	0xE5AAA2:0x3974,0xE5AAA7:0x3975,0xE5AAAC:0x3976,0xE5AAB1:0x3977,0xE5AAB2:0x3978,
	0xE5AAB3:0x3979,0xE5AAB5:0x397A,0xE5AAB8:0x397B,0xE5AABA:0x397C,0xE5AABB:0x397D,
	0xE5AABF:0x397E,0xE5AB84:0x3A21,0xE5AB86:0x3A22,0xE5AB88:0x3A23,0xE5AB8F:0x3A24,
	0xE5AB9A:0x3A25,0xE5AB9C:0x3A26,0xE5ABA0:0x3A27,0xE5ABA5:0x3A28,0xE5ABAA:0x3A29,
	0xE5ABAE:0x3A2A,0xE5ABB5:0x3A2B,0xE5ABB6:0x3A2C,0xE5ABBD:0x3A2D,0xE5AC80:0x3A2E,
	0xE5AC81:0x3A2F,0xE5AC88:0x3A30,0xE5AC97:0x3A31,0xE5ACB4:0x3A32,0xE5AC99:0x3A33,
	0xE5AC9B:0x3A34,0xE5AC9D:0x3A35,0xE5ACA1:0x3A36,0xE5ACA5:0x3A37,0xE5ACAD:0x3A38,
	0xE5ACB8:0x3A39,0xE5AD81:0x3A3A,0xE5AD8B:0x3A3B,0xE5AD8C:0x3A3C,0xE5AD92:0x3A3D,
	0xE5AD96:0x3A3E,0xE5AD9E:0x3A3F,0xE5ADA8:0x3A40,0xE5ADAE:0x3A41,0xE5ADAF:0x3A42,
	0xE5ADBC:0x3A43,0xE5ADBD:0x3A44,0xE5ADBE:0x3A45,0xE5ADBF:0x3A46,0xE5AE81:0x3A47,
	0xE5AE84:0x3A48,0xE5AE86:0x3A49,0xE5AE8A:0x3A4A,0xE5AE8E:0x3A4B,0xE5AE90:0x3A4C,
	0xE5AE91:0x3A4D,0xE5AE93:0x3A4E,0xE5AE94:0x3A4F,0xE5AE96:0x3A50,0xE5AEA8:0x3A51,
	0xE5AEA9:0x3A52,0xE5AEAC:0x3A53,0xE5AEAD:0x3A54,0xE5AEAF:0x3A55,0xE5AEB1:0x3A56,
	0xE5AEB2:0x3A57,0xE5AEB7:0x3A58,0xE5AEBA:0x3A59,0xE5AEBC:0x3A5A,0xE5AF80:0x3A5B,
	0xE5AF81:0x3A5C,0xE5AF8D:0x3A5D,0xE5AF8F:0x3A5E,0xE5AF96:0x3A5F,0xE5AF97:0x3A60,
	0xE5AF98:0x3A61,0xE5AF99:0x3A62,0xE5AF9A:0x3A63,0xE5AFA0:0x3A64,0xE5AFAF:0x3A65,
	0xE5AFB1:0x3A66,0xE5AFB4:0x3A67,0xE5AFBD:0x3A68,0xE5B08C:0x3A69,0xE5B097:0x3A6A,
	0xE5B09E:0x3A6B,0xE5B09F:0x3A6C,0xE5B0A3:0x3A6D,0xE5B0A6:0x3A6E,0xE5B0A9:0x3A6F,
	0xE5B0AB:0x3A70,0xE5B0AC:0x3A71,0xE5B0AE:0x3A72,0xE5B0B0:0x3A73,0xE5B0B2:0x3A74,
	0xE5B0B5:0x3A75,0xE5B0B6:0x3A76,0xE5B199:0x3A77,0xE5B19A:0x3A78,0xE5B19C:0x3A79,
	0xE5B1A2:0x3A7A,0xE5B1A3:0x3A7B,0xE5B1A7:0x3A7C,0xE5B1A8:0x3A7D,0xE5B1A9:0x3A7E,
	0xE5B1AD:0x3B21,0xE5B1B0:0x3B22,0xE5B1B4:0x3B23,0xE5B1B5:0x3B24,0xE5B1BA:0x3B25,
	0xE5B1BB:0x3B26,0xE5B1BC:0x3B27,0xE5B1BD:0x3B28,0xE5B287:0x3B29,0xE5B288:0x3B2A,
	0xE5B28A:0x3B2B,0xE5B28F:0x3B2C,0xE5B292:0x3B2D,0xE5B29D:0x3B2E,0xE5B29F:0x3B2F,
	0xE5B2A0:0x3B30,0xE5B2A2:0x3B31,0xE5B2A3:0x3B32,0xE5B2A6:0x3B33,0xE5B2AA:0x3B34,
	0xE5B2B2:0x3B35,0xE5B2B4:0x3B36,0xE5B2B5:0x3B37,0xE5B2BA:0x3B38,0xE5B389:0x3B39,
	0xE5B38B:0x3B3A,0xE5B392:0x3B3B,0xE5B39D:0x3B3C,0xE5B397:0x3B3D,0xE5B3AE:0x3B3E,
	0xE5B3B1:0x3B3F,0xE5B3B2:0x3B40,0xE5B3B4:0x3B41,0xE5B481:0x3B42,0xE5B486:0x3B43,
	0xE5B48D:0x3B44,0xE5B492:0x3B45,0xE5B4AB:0x3B46,0xE5B4A3:0x3B47,0xE5B4A4:0x3B48,
	0xE5B4A6:0x3B49,0xE5B4A7:0x3B4A,0xE5B4B1:0x3B4B,0xE5B4B4:0x3B4C,0xE5B4B9:0x3B4D,
	0xE5B4BD:0x3B4E,0xE5B4BF:0x3B4F,0xE5B582:0x3B50,0xE5B583:0x3B51,0xE5B586:0x3B52,
	0xE5B588:0x3B53,0xE5B595:0x3B54,0xE5B591:0x3B55,0xE5B599:0x3B56,0xE5B58A:0x3B57,
	0xE5B59F:0x3B58,0xE5B5A0:0x3B59,0xE5B5A1:0x3B5A,0xE5B5A2:0x3B5B,0xE5B5A4:0x3B5C,
	0xE5B5AA:0x3B5D,0xE5B5AD:0x3B5E,0xE5B5B0:0x3B5F,0xE5B5B9:0x3B60,0xE5B5BA:0x3B61,
	0xE5B5BE:0x3B62,0xE5B5BF:0x3B63,0xE5B681:0x3B64,0xE5B683:0x3B65,0xE5B688:0x3B66,
	0xE5B68A:0x3B67,0xE5B692:0x3B68,0xE5B693:0x3B69,0xE5B694:0x3B6A,0xE5B695:0x3B6B,
	0xE5B699:0x3B6C,0xE5B69B:0x3B6D,0xE5B69F:0x3B6E,0xE5B6A0:0x3B6F,0xE5B6A7:0x3B70,
	0xE5B6AB:0x3B71,0xE5B6B0:0x3B72,0xE5B6B4:0x3B73,0xE5B6B8:0x3B74,0xE5B6B9:0x3B75,
	0xE5B783:0x3B76,0xE5B787:0x3B77,0xE5B78B:0x3B78,0xE5B790:0x3B79,0xE5B78E:0x3B7A,
	0xE5B798:0x3B7B,0xE5B799:0x3B7C,0xE5B7A0:0x3B7D,0xE5B7A4:0x3B7E,0xE5B7A9:0x3C21,
	0xE5B7B8:0x3C22,0xE5B7B9:0x3C23,0xE5B880:0x3C24,0xE5B887:0x3C25,0xE5B88D:0x3C26,
	0xE5B892:0x3C27,0xE5B894:0x3C28,0xE5B895:0x3C29,0xE5B898:0x3C2A,0xE5B89F:0x3C2B,
	0xE5B8A0:0x3C2C,0xE5B8AE:0x3C2D,0xE5B8A8:0x3C2E,0xE5B8B2:0x3C2F,0xE5B8B5:0x3C30,
	0xE5B8BE:0x3C31,0xE5B98B:0x3C32,0xE5B990:0x3C33,0xE5B989:0x3C34,0xE5B991:0x3C35,
	0xE5B996:0x3C36,0xE5B998:0x3C37,0xE5B99B:0x3C38,0xE5B99C:0x3C39,0xE5B99E:0x3C3A,
	0xE5B9A8:0x3C3B,0xE5B9AA:0x3C3C,0xE5B9AB:0x3C3D,0xE5B9AC:0x3C3E,0xE5B9AD:0x3C3F,
	0xE5B9AE:0x3C40,0xE5B9B0:0x3C41,0xE5BA80:0x3C42,0xE5BA8B:0x3C43,0xE5BA8E:0x3C44,
	0xE5BAA2:0x3C45,0xE5BAA4:0x3C46,0xE5BAA5:0x3C47,0xE5BAA8:0x3C48,0xE5BAAA:0x3C49,
	0xE5BAAC:0x3C4A,0xE5BAB1:0x3C4B,0xE5BAB3:0x3C4C,0xE5BABD:0x3C4D,0xE5BABE:0x3C4E,
	0xE5BABF:0x3C4F,0xE5BB86:0x3C50,0xE5BB8C:0x3C51,0xE5BB8B:0x3C52,0xE5BB8E:0x3C53,
	0xE5BB91:0x3C54,0xE5BB92:0x3C55,0xE5BB94:0x3C56,0xE5BB95:0x3C57,0xE5BB9C:0x3C58,
	0xE5BB9E:0x3C59,0xE5BBA5:0x3C5A,0xE5BBAB:0x3C5B,0xE5BC82:0x3C5C,0xE5BC86:0x3C5D,
	0xE5BC87:0x3C5E,0xE5BC88:0x3C5F,0xE5BC8E:0x3C60,0xE5BC99:0x3C61,0xE5BC9C:0x3C62,
	0xE5BC9D:0x3C63,0xE5BCA1:0x3C64,0xE5BCA2:0x3C65,0xE5BCA3:0x3C66,0xE5BCA4:0x3C67,
	0xE5BCA8:0x3C68,0xE5BCAB:0x3C69,0xE5BCAC:0x3C6A,0xE5BCAE:0x3C6B,0xE5BCB0:0x3C6C,
	0xE5BCB4:0x3C6D,0xE5BCB6:0x3C6E,0xE5BCBB:0x3C6F,0xE5BCBD:0x3C70,0xE5BCBF:0x3C71,
	0xE5BD80:0x3C72,0xE5BD84:0x3C73,0xE5BD85:0x3C74,0xE5BD87:0x3C75,0xE5BD8D:0x3C76,
	0xE5BD90:0x3C77,0xE5BD94:0x3C78,0xE5BD98:0x3C79,0xE5BD9B:0x3C7A,0xE5BDA0:0x3C7B,
	0xE5BDA3:0x3C7C,0xE5BDA4:0x3C7D,0xE5BDA7:0x3C7E,0xE5BDAF:0x3D21,0xE5BDB2:0x3D22,
	0xE5BDB4:0x3D23,0xE5BDB5:0x3D24,0xE5BDB8:0x3D25,0xE5BDBA:0x3D26,0xE5BDBD:0x3D27,
	0xE5BDBE:0x3D28,0xE5BE89:0x3D29,0xE5BE8D:0x3D2A,0xE5BE8F:0x3D2B,0xE5BE96:0x3D2C,
	0xE5BE9C:0x3D2D,0xE5BE9D:0x3D2E,0xE5BEA2:0x3D2F,0xE5BEA7:0x3D30,0xE5BEAB:0x3D31,
	0xE5BEA4:0x3D32,0xE5BEAC:0x3D33,0xE5BEAF:0x3D34,0xE5BEB0:0x3D35,0xE5BEB1:0x3D36,
	0xE5BEB8:0x3D37,0xE5BF84:0x3D38,0xE5BF87:0x3D39,0xE5BF88:0x3D3A,0xE5BF89:0x3D3B,
	0xE5BF8B:0x3D3C,0xE5BF90:0x3D3D,0xE5BF91:0x3D3E,0xE5BF92:0x3D3F,0xE5BF93:0x3D40,
	0xE5BF94:0x3D41,0xE5BF9E:0x3D42,0xE5BFA1:0x3D43,0xE5BFA2:0x3D44,0xE5BFA8:0x3D45,
	0xE5BFA9:0x3D46,0xE5BFAA:0x3D47,0xE5BFAC:0x3D48,0xE5BFAD:0x3D49,0xE5BFAE:0x3D4A,
	0xE5BFAF:0x3D4B,0xE5BFB2:0x3D4C,0xE5BFB3:0x3D4D,0xE5BFB6:0x3D4E,0xE5BFBA:0x3D4F,
	0xE5BFBC:0x3D50,0xE68087:0x3D51,0xE6808A:0x3D52,0xE6808D:0x3D53,0xE68093:0x3D54,
	0xE68094:0x3D55,0xE68097:0x3D56,0xE68098:0x3D57,0xE6809A:0x3D58,0xE6809F:0x3D59,
	0xE680A4:0x3D5A,0xE680AD:0x3D5B,0xE680B3:0x3D5C,0xE680B5:0x3D5D,0xE68180:0x3D5E,
	0xE68187:0x3D5F,0xE68188:0x3D60,0xE68189:0x3D61,0xE6818C:0x3D62,0xE68191:0x3D63,
	0xE68194:0x3D64,0xE68196:0x3D65,0xE68197:0x3D66,0xE6819D:0x3D67,0xE681A1:0x3D68,
	0xE681A7:0x3D69,0xE681B1:0x3D6A,0xE681BE:0x3D6B,0xE681BF:0x3D6C,0xE68282:0x3D6D,
	0xE68286:0x3D6E,0xE68288:0x3D6F,0xE6828A:0x3D70,0xE6828E:0x3D71,0xE68291:0x3D72,
	0xE68293:0x3D73,0xE68295:0x3D74,0xE68298:0x3D75,0xE6829D:0x3D76,0xE6829E:0x3D77,
	0xE682A2:0x3D78,0xE682A4:0x3D79,0xE682A5:0x3D7A,0xE682A8:0x3D7B,0xE682B0:0x3D7C,
	0xE682B1:0x3D7D,0xE682B7:0x3D7E,0xE682BB:0x3E21,0xE682BE:0x3E22,0xE68382:0x3E23,
	0xE68384:0x3E24,0xE68388:0x3E25,0xE68389:0x3E26,0xE6838A:0x3E27,0xE6838B:0x3E28,
	0xE6838E:0x3E29,0xE6838F:0x3E2A,0xE68394:0x3E2B,0xE68395:0x3E2C,0xE68399:0x3E2D,
	0xE6839B:0x3E2E,0xE6839D:0x3E2F,0xE6839E:0x3E30,0xE683A2:0x3E31,0xE683A5:0x3E32,
	0xE683B2:0x3E33,0xE683B5:0x3E34,0xE683B8:0x3E35,0xE683BC:0x3E36,0xE683BD:0x3E37,
	0xE68482:0x3E38,0xE68487:0x3E39,0xE6848A:0x3E3A,0xE6848C:0x3E3B,0xE68490:0x3E3C,
	0xE68491:0x3E3D,0xE68492:0x3E3E,0xE68493:0x3E3F,0xE68494:0x3E40,0xE68496:0x3E41,
	0xE68497:0x3E42,0xE68499:0x3E43,0xE6849C:0x3E44,0xE6849E:0x3E45,0xE684A2:0x3E46,
	0xE684AA:0x3E47,0xE684AB:0x3E48,0xE684B0:0x3E49,0xE684B1:0x3E4A,0xE684B5:0x3E4B,
	0xE684B6:0x3E4C,0xE684B7:0x3E4D,0xE684B9:0x3E4E,0xE68581:0x3E4F,0xE68585:0x3E50,
	0xE68586:0x3E51,0xE68589:0x3E52,0xE6859E:0x3E53,0xE685A0:0x3E54,0xE685AC:0x3E55,
	0xE685B2:0x3E56,0xE685B8:0x3E57,0xE685BB:0x3E58,0xE685BC:0x3E59,0xE685BF:0x3E5A,
	0xE68680:0x3E5B,0xE68681:0x3E5C,0xE68683:0x3E5D,0xE68684:0x3E5E,0xE6868B:0x3E5F,
	0xE6868D:0x3E60,0xE68692:0x3E61,0xE68693:0x3E62,0xE68697:0x3E63,0xE68698:0x3E64,
	0xE6869C:0x3E65,0xE6869D:0x3E66,0xE6869F:0x3E67,0xE686A0:0x3E68,0xE686A5:0x3E69,
	0xE686A8:0x3E6A,0xE686AA:0x3E6B,0xE686AD:0x3E6C,0xE686B8:0x3E6D,0xE686B9:0x3E6E,
	0xE686BC:0x3E6F,0xE68780:0x3E70,0xE68781:0x3E71,0xE68782:0x3E72,0xE6878E:0x3E73,
	0xE6878F:0x3E74,0xE68795:0x3E75,0xE6879C:0x3E76,0xE6879D:0x3E77,0xE6879E:0x3E78,
	0xE6879F:0x3E79,0xE687A1:0x3E7A,0xE687A2:0x3E7B,0xE687A7:0x3E7C,0xE687A9:0x3E7D,
	0xE687A5:0x3E7E,0xE687AC:0x3F21,0xE687AD:0x3F22,0xE687AF:0x3F23,0xE68881:0x3F24,
	0xE68883:0x3F25,0xE68884:0x3F26,0xE68887:0x3F27,0xE68893:0x3F28,0xE68895:0x3F29,
	0xE6889C:0x3F2A,0xE688A0:0x3F2B,0xE688A2:0x3F2C,0xE688A3:0x3F2D,0xE688A7:0x3F2E,
	0xE688A9:0x3F2F,0xE688AB:0x3F30,0xE688B9:0x3F31,0xE688BD:0x3F32,0xE68982:0x3F33,
	0xE68983:0x3F34,0xE68984:0x3F35,0xE68986:0x3F36,0xE6898C:0x3F37,0xE68990:0x3F38,
	0xE68991:0x3F39,0xE68992:0x3F3A,0xE68994:0x3F3B,0xE68996:0x3F3C,0xE6899A:0x3F3D,
	0xE6899C:0x3F3E,0xE689A4:0x3F3F,0xE689AD:0x3F40,0xE689AF:0x3F41,0xE689B3:0x3F42,
	0xE689BA:0x3F43,0xE689BD:0x3F44,0xE68A8D:0x3F45,0xE68A8E:0x3F46,0xE68A8F:0x3F47,
	0xE68A90:0x3F48,0xE68AA6:0x3F49,0xE68AA8:0x3F4A,0xE68AB3:0x3F4B,0xE68AB6:0x3F4C,
	0xE68AB7:0x3F4D,0xE68ABA:0x3F4E,0xE68ABE:0x3F4F,0xE68ABF:0x3F50,0xE68B84:0x3F51,
	0xE68B8E:0x3F52,0xE68B95:0x3F53,0xE68B96:0x3F54,0xE68B9A:0x3F55,0xE68BAA:0x3F56,
	0xE68BB2:0x3F57,0xE68BB4:0x3F58,0xE68BBC:0x3F59,0xE68BBD:0x3F5A,0xE68C83:0x3F5B,
	0xE68C84:0x3F5C,0xE68C8A:0x3F5D,0xE68C8B:0x3F5E,0xE68C8D:0x3F5F,0xE68C90:0x3F60,
	0xE68C93:0x3F61,0xE68C96:0x3F62,0xE68C98:0x3F63,0xE68CA9:0x3F64,0xE68CAA:0x3F65,
	0xE68CAD:0x3F66,0xE68CB5:0x3F67,0xE68CB6:0x3F68,0xE68CB9:0x3F69,0xE68CBC:0x3F6A,
	0xE68D81:0x3F6B,0xE68D82:0x3F6C,0xE68D83:0x3F6D,0xE68D84:0x3F6E,0xE68D86:0x3F6F,
	0xE68D8A:0x3F70,0xE68D8B:0x3F71,0xE68D8E:0x3F72,0xE68D92:0x3F73,0xE68D93:0x3F74,
	0xE68D94:0x3F75,0xE68D98:0x3F76,0xE68D9B:0x3F77,0xE68DA5:0x3F78,0xE68DA6:0x3F79,
	0xE68DAC:0x3F7A,0xE68DAD:0x3F7B,0xE68DB1:0x3F7C,0xE68DB4:0x3F7D,0xE68DB5:0x3F7E,
	0xE68DB8:0x4021,0xE68DBC:0x4022,0xE68DBD:0x4023,0xE68DBF:0x4024,0xE68E82:0x4025,
	0xE68E84:0x4026,0xE68E87:0x4027,0xE68E8A:0x4028,0xE68E90:0x4029,0xE68E94:0x402A,
	0xE68E95:0x402B,0xE68E99:0x402C,0xE68E9A:0x402D,0xE68E9E:0x402E,0xE68EA4:0x402F,
	0xE68EA6:0x4030,0xE68EAD:0x4031,0xE68EAE:0x4032,0xE68EAF:0x4033,0xE68EBD:0x4034,
	0xE68F81:0x4035,0xE68F85:0x4036,0xE68F88:0x4037,0xE68F8E:0x4038,0xE68F91:0x4039,
	0xE68F93:0x403A,0xE68F94:0x403B,0xE68F95:0x403C,0xE68F9C:0x403D,0xE68FA0:0x403E,
	0xE68FA5:0x403F,0xE68FAA:0x4040,0xE68FAC:0x4041,0xE68FB2:0x4042,0xE68FB3:0x4043,
	0xE68FB5:0x4044,0xE68FB8:0x4045,0xE68FB9:0x4046,0xE69089:0x4047,0xE6908A:0x4048,
	0xE69090:0x4049,0xE69092:0x404A,0xE69094:0x404B,0xE69098:0x404C,0xE6909E:0x404D,
	0xE690A0:0x404E,0xE690A2:0x404F,0xE690A4:0x4050,0xE690A5:0x4051,0xE690A9:0x4052,
	0xE690AA:0x4053,0xE690AF:0x4054,0xE690B0:0x4055,0xE690B5:0x4056,0xE690BD:0x4057,
	0xE690BF:0x4058,0xE6918B:0x4059,0xE6918F:0x405A,0xE69191:0x405B,0xE69192:0x405C,
	0xE69193:0x405D,0xE69194:0x405E,0xE6919A:0x405F,0xE6919B:0x4060,0xE6919C:0x4061,
	0xE6919D:0x4062,0xE6919F:0x4063,0xE691A0:0x4064,0xE691A1:0x4065,0xE691A3:0x4066,
	0xE691AD:0x4067,0xE691B3:0x4068,0xE691B4:0x4069,0xE691BB:0x406A,0xE691BD:0x406B,
	0xE69285:0x406C,0xE69287:0x406D,0xE6928F:0x406E,0xE69290:0x406F,0xE69291:0x4070,
	0xE69298:0x4071,0xE69299:0x4072,0xE6929B:0x4073,0xE6929D:0x4074,0xE6929F:0x4075,
	0xE692A1:0x4076,0xE692A3:0x4077,0xE692A6:0x4078,0xE692A8:0x4079,0xE692AC:0x407A,
	0xE692B3:0x407B,0xE692BD:0x407C,0xE692BE:0x407D,0xE692BF:0x407E,0xE69384:0x4121,
	0xE69389:0x4122,0xE6938A:0x4123,0xE6938B:0x4124,0xE6938C:0x4125,0xE6938E:0x4126,
	0xE69390:0x4127,0xE69391:0x4128,0xE69395:0x4129,0xE69397:0x412A,0xE693A4:0x412B,
	0xE693A5:0x412C,0xE693A9:0x412D,0xE693AA:0x412E,0xE693AD:0x412F,0xE693B0:0x4130,
	0xE693B5:0x4131,0xE693B7:0x4132,0xE693BB:0x4133,0xE693BF:0x4134,0xE69481:0x4135,
	0xE69484:0x4136,0xE69488:0x4137,0xE69489:0x4138,0xE6948A:0x4139,0xE6948F:0x413A,
	0xE69493:0x413B,0xE69494:0x413C,0xE69496:0x413D,0xE69499:0x413E,0xE6949B:0x413F,
	0xE6949E:0x4140,0xE6949F:0x4141,0xE694A2:0x4142,0xE694A6:0x4143,0xE694A9:0x4144,
	0xE694AE:0x4145,0xE694B1:0x4146,0xE694BA:0x4147,0xE694BC:0x4148,0xE694BD:0x4149,
	0xE69583:0x414A,0xE69587:0x414B,0xE69589:0x414C,0xE69590:0x414D,0xE69592:0x414E,
	0xE69594:0x414F,0xE6959F:0x4150,0xE695A0:0x4151,0xE695A7:0x4152,0xE695AB:0x4153,
	0xE695BA:0x4154,0xE695BD:0x4155,0xE69681:0x4156,0xE69685:0x4157,0xE6968A:0x4158,
	0xE69692:0x4159,0xE69695:0x415A,0xE69698:0x415B,0xE6969D:0x415C,0xE696A0:0x415D,
	0xE696A3:0x415E,0xE696A6:0x415F,0xE696AE:0x4160,0xE696B2:0x4161,0xE696B3:0x4162,
	0xE696B4:0x4163,0xE696BF:0x4164,0xE69782:0x4165,0xE69788:0x4166,0xE69789:0x4167,
	0xE6978E:0x4168,0xE69790:0x4169,0xE69794:0x416A,0xE69796:0x416B,0xE69798:0x416C,
	0xE6979F:0x416D,0xE697B0:0x416E,0xE697B2:0x416F,0xE697B4:0x4170,0xE697B5:0x4171,
	0xE697B9:0x4172,0xE697BE:0x4173,0xE697BF:0x4174,0xE69880:0x4175,0xE69884:0x4176,
	0xE69888:0x4177,0xE69889:0x4178,0xE6988D:0x4179,0xE69891:0x417A,0xE69892:0x417B,
	0xE69895:0x417C,0xE69896:0x417D,0xE6989D:0x417E,0xE6989E:0x4221,0xE698A1:0x4222,
	0xE698A2:0x4223,0xE698A3:0x4224,0xE698A4:0x4225,0xE698A6:0x4226,0xE698A9:0x4227,
	0xE698AA:0x4228,0xE698AB:0x4229,0xE698AC:0x422A,0xE698AE:0x422B,0xE698B0:0x422C,
	0xE698B1:0x422D,0xE698B3:0x422E,0xE698B9:0x422F,0xE698B7:0x4230,0xE69980:0x4231,
	0xE69985:0x4232,0xE69986:0x4233,0xE6998A:0x4234,0xE6998C:0x4235,0xE69991:0x4236,
	0xE6998E:0x4237,0xE69997:0x4238,0xE69998:0x4239,0xE69999:0x423A,0xE6999B:0x423B,
	0xE6999C:0x423C,0xE699A0:0x423D,0xE699A1:0x423E,0xE69BBB:0x423F,0xE699AA:0x4240,
	0xE699AB:0x4241,0xE699AC:0x4242,0xE699BE:0x4243,0xE699B3:0x4244,0xE699B5:0x4245,
	0xE699BF:0x4246,0xE699B7:0x4247,0xE699B8:0x4248,0xE699B9:0x4249,0xE699BB:0x424A,
	0xE69A80:0x424B,0xE699BC:0x424C,0xE69A8B:0x424D,0xE69A8C:0x424E,0xE69A8D:0x424F,
	0xE69A90:0x4250,0xE69A92:0x4251,0xE69A99:0x4252,0xE69A9A:0x4253,0xE69A9B:0x4254,
	0xE69A9C:0x4255,0xE69A9F:0x4256,0xE69AA0:0x4257,0xE69AA4:0x4258,0xE69AAD:0x4259,
	0xE69AB1:0x425A,0xE69AB2:0x425B,0xE69AB5:0x425C,0xE69ABB:0x425D,0xE69ABF:0x425E,
	0xE69B80:0x425F,0xE69B82:0x4260,0xE69B83:0x4261,0xE69B88:0x4262,0xE69B8C:0x4263,
	0xE69B8E:0x4264,0xE69B8F:0x4265,0xE69B94:0x4266,0xE69B9B:0x4267,0xE69B9F:0x4268,
	0xE69BA8:0x4269,0xE69BAB:0x426A,0xE69BAC:0x426B,0xE69BAE:0x426C,0xE69BBA:0x426D,
	0xE69C85:0x426E,0xE69C87:0x426F,0xE69C8E:0x4270,0xE69C93:0x4271,0xE69C99:0x4272,
	0xE69C9C:0x4273,0xE69CA0:0x4274,0xE69CA2:0x4275,0xE69CB3:0x4276,0xE69CBE:0x4277,
	0xE69D85:0x4278,0xE69D87:0x4279,0xE69D88:0x427A,0xE69D8C:0x427B,0xE69D94:0x427C,
	0xE69D95:0x427D,0xE69D9D:0x427E,0xE69DA6:0x4321,0xE69DAC:0x4322,0xE69DAE:0x4323,
	0xE69DB4:0x4324,0xE69DB6:0x4325,0xE69DBB:0x4326,0xE69E81:0x4327,0xE69E84:0x4328,
	0xE69E8E:0x4329,0xE69E8F:0x432A,0xE69E91:0x432B,0xE69E93:0x432C,0xE69E96:0x432D,
	0xE69E98:0x432E,0xE69E99:0x432F,0xE69E9B:0x4330,0xE69EB0:0x4331,0xE69EB1:0x4332,
	0xE69EB2:0x4333,0xE69EB5:0x4334,0xE69EBB:0x4335,0xE69EBC:0x4336,0xE69EBD:0x4337,
	0xE69FB9:0x4338,0xE69F80:0x4339,0xE69F82:0x433A,0xE69F83:0x433B,0xE69F85:0x433C,
	0xE69F88:0x433D,0xE69F89:0x433E,0xE69F92:0x433F,0xE69F97:0x4340,0xE69F99:0x4341,
	0xE69F9C:0x4342,0xE69FA1:0x4343,0xE69FA6:0x4344,0xE69FB0:0x4345,0xE69FB2:0x4346,
	0xE69FB6:0x4347,0xE69FB7:0x4348,0xE6A192:0x4349,0xE6A094:0x434A,0xE6A099:0x434B,
	0xE6A09D:0x434C,0xE6A09F:0x434D,0xE6A0A8:0x434E,0xE6A0A7:0x434F,0xE6A0AC:0x4350,
	0xE6A0AD:0x4351,0xE6A0AF:0x4352,0xE6A0B0:0x4353,0xE6A0B1:0x4354,0xE6A0B3:0x4355,
	0xE6A0BB:0x4356,0xE6A0BF:0x4357,0xE6A184:0x4358,0xE6A185:0x4359,0xE6A18A:0x435A,
	0xE6A18C:0x435B,0xE6A195:0x435C,0xE6A197:0x435D,0xE6A198:0x435E,0xE6A19B:0x435F,
	0xE6A1AB:0x4360,0xE6A1AE:0x4361,0xE6A1AF:0x4362,0xE6A1B0:0x4363,0xE6A1B1:0x4364,
	0xE6A1B2:0x4365,0xE6A1B5:0x4366,0xE6A1B9:0x4367,0xE6A1BA:0x4368,0xE6A1BB:0x4369,
	0xE6A1BC:0x436A,0xE6A282:0x436B,0xE6A284:0x436C,0xE6A286:0x436D,0xE6A288:0x436E,
	0xE6A296:0x436F,0xE6A298:0x4370,0xE6A29A:0x4371,0xE6A29C:0x4372,0xE6A2A1:0x4373,
	0xE6A2A3:0x4374,0xE6A2A5:0x4375,0xE6A2A9:0x4376,0xE6A2AA:0x4377,0xE6A2AE:0x4378,
	0xE6A2B2:0x4379,0xE6A2BB:0x437A,0xE6A385:0x437B,0xE6A388:0x437C,0xE6A38C:0x437D,
	0xE6A38F:0x437E,0xE6A390:0x4421,0xE6A391:0x4422,0xE6A393:0x4423,0xE6A396:0x4424,
	0xE6A399:0x4425,0xE6A39C:0x4426,0xE6A39D:0x4427,0xE6A3A5:0x4428,0xE6A3A8:0x4429,
	0xE6A3AA:0x442A,0xE6A3AB:0x442B,0xE6A3AC:0x442C,0xE6A3AD:0x442D,0xE6A3B0:0x442E,
	0xE6A3B1:0x442F,0xE6A3B5:0x4430,0xE6A3B6:0x4431,0xE6A3BB:0x4432,0xE6A3BC:0x4433,
	0xE6A3BD:0x4434,0xE6A486:0x4435,0xE6A489:0x4436,0xE6A48A:0x4437,0xE6A490:0x4438,
	0xE6A491:0x4439,0xE6A493:0x443A,0xE6A496:0x443B,0xE6A497:0x443C,0xE6A4B1:0x443D,
	0xE6A4B3:0x443E,0xE6A4B5:0x443F,0xE6A4B8:0x4440,0xE6A4BB:0x4441,0xE6A582:0x4442,
	0xE6A585:0x4443,0xE6A589:0x4444,0xE6A58E:0x4445,0xE6A597:0x4446,0xE6A59B:0x4447,
	0xE6A5A3:0x4448,0xE6A5A4:0x4449,0xE6A5A5:0x444A,0xE6A5A6:0x444B,0xE6A5A8:0x444C,
	0xE6A5A9:0x444D,0xE6A5AC:0x444E,0xE6A5B0:0x444F,0xE6A5B1:0x4450,0xE6A5B2:0x4451,
	0xE6A5BA:0x4452,0xE6A5BB:0x4453,0xE6A5BF:0x4454,0xE6A680:0x4455,0xE6A68D:0x4456,
	0xE6A692:0x4457,0xE6A696:0x4458,0xE6A698:0x4459,0xE6A6A1:0x445A,0xE6A6A5:0x445B,
	0xE6A6A6:0x445C,0xE6A6A8:0x445D,0xE6A6AB:0x445E,0xE6A6AD:0x445F,0xE6A6AF:0x4460,
	0xE6A6B7:0x4461,0xE6A6B8:0x4462,0xE6A6BA:0x4463,0xE6A6BC:0x4464,0xE6A785:0x4465,
	0xE6A788:0x4466,0xE6A791:0x4467,0xE6A796:0x4468,0xE6A797:0x4469,0xE6A7A2:0x446A,
	0xE6A7A5:0x446B,0xE6A7AE:0x446C,0xE6A7AF:0x446D,0xE6A7B1:0x446E,0xE6A7B3:0x446F,
	0xE6A7B5:0x4470,0xE6A7BE:0x4471,0xE6A880:0x4472,0xE6A881:0x4473,0xE6A883:0x4474,
	0xE6A88F:0x4475,0xE6A891:0x4476,0xE6A895:0x4477,0xE6A89A:0x4478,0xE6A89D:0x4479,
	0xE6A8A0:0x447A,0xE6A8A4:0x447B,0xE6A8A8:0x447C,0xE6A8B0:0x447D,0xE6A8B2:0x447E,
	0xE6A8B4:0x4521,0xE6A8B7:0x4522,0xE6A8BB:0x4523,0xE6A8BE:0x4524,0xE6A8BF:0x4525,
	0xE6A985:0x4526,0xE6A986:0x4527,0xE6A989:0x4528,0xE6A98A:0x4529,0xE6A98E:0x452A,
	0xE6A990:0x452B,0xE6A991:0x452C,0xE6A992:0x452D,0xE6A995:0x452E,0xE6A996:0x452F,
	0xE6A99B:0x4530,0xE6A9A4:0x4531,0xE6A9A7:0x4532,0xE6A9AA:0x4533,0xE6A9B1:0x4534,
	0xE6A9B3:0x4535,0xE6A9BE:0x4536,0xE6AA81:0x4537,0xE6AA83:0x4538,0xE6AA86:0x4539,
	0xE6AA87:0x453A,0xE6AA89:0x453B,0xE6AA8B:0x453C,0xE6AA91:0x453D,0xE6AA9B:0x453E,
	0xE6AA9D:0x453F,0xE6AA9E:0x4540,0xE6AA9F:0x4541,0xE6AAA5:0x4542,0xE6AAAB:0x4543,
	0xE6AAAF:0x4544,0xE6AAB0:0x4545,0xE6AAB1:0x4546,0xE6AAB4:0x4547,0xE6AABD:0x4548,
	0xE6AABE:0x4549,0xE6AABF:0x454A,0xE6AB86:0x454B,0xE6AB89:0x454C,0xE6AB88:0x454D,
	0xE6AB8C:0x454E,0xE6AB90:0x454F,0xE6AB94:0x4550,0xE6AB95:0x4551,0xE6AB96:0x4552,
	0xE6AB9C:0x4553,0xE6AB9D:0x4554,0xE6ABA4:0x4555,0xE6ABA7:0x4556,0xE6ABAC:0x4557,
	0xE6ABB0:0x4558,0xE6ABB1:0x4559,0xE6ABB2:0x455A,0xE6ABBC:0x455B,0xE6ABBD:0x455C,
	0xE6AC82:0x455D,0xE6AC83:0x455E,0xE6AC86:0x455F,0xE6AC87:0x4560,0xE6AC89:0x4561,
	0xE6AC8F:0x4562,0xE6AC90:0x4563,0xE6AC91:0x4564,0xE6AC97:0x4565,0xE6AC9B:0x4566,
	0xE6AC9E:0x4567,0xE6ACA4:0x4568,0xE6ACA8:0x4569,0xE6ACAB:0x456A,0xE6ACAC:0x456B,
	0xE6ACAF:0x456C,0xE6ACB5:0x456D,0xE6ACB6:0x456E,0xE6ACBB:0x456F,0xE6ACBF:0x4570,
	0xE6AD86:0x4571,0xE6AD8A:0x4572,0xE6AD8D:0x4573,0xE6AD92:0x4574,0xE6AD96:0x4575,
	0xE6AD98:0x4576,0xE6AD9D:0x4577,0xE6ADA0:0x4578,0xE6ADA7:0x4579,0xE6ADAB:0x457A,
	0xE6ADAE:0x457B,0xE6ADB0:0x457C,0xE6ADB5:0x457D,0xE6ADBD:0x457E,0xE6ADBE:0x4621,
	0xE6AE82:0x4622,0xE6AE85:0x4623,0xE6AE97:0x4624,0xE6AE9B:0x4625,0xE6AE9F:0x4626,
	0xE6AEA0:0x4627,0xE6AEA2:0x4628,0xE6AEA3:0x4629,0xE6AEA8:0x462A,0xE6AEA9:0x462B,
	0xE6AEAC:0x462C,0xE6AEAD:0x462D,0xE6AEAE:0x462E,0xE6AEB0:0x462F,0xE6AEB8:0x4630,
	0xE6AEB9:0x4631,0xE6AEBD:0x4632,0xE6AEBE:0x4633,0xE6AF83:0x4634,0xE6AF84:0x4635,
	0xE6AF89:0x4636,0xE6AF8C:0x4637,0xE6AF96:0x4638,0xE6AF9A:0x4639,0xE6AFA1:0x463A,
	0xE6AFA3:0x463B,0xE6AFA6:0x463C,0xE6AFA7:0x463D,0xE6AFAE:0x463E,0xE6AFB1:0x463F,
	0xE6AFB7:0x4640,0xE6AFB9:0x4641,0xE6AFBF:0x4642,0xE6B082:0x4643,0xE6B084:0x4644,
	0xE6B085:0x4645,0xE6B089:0x4646,0xE6B08D:0x4647,0xE6B08E:0x4648,0xE6B090:0x4649,
	0xE6B092:0x464A,0xE6B099:0x464B,0xE6B09F:0x464C,0xE6B0A6:0x464D,0xE6B0A7:0x464E,
	0xE6B0A8:0x464F,0xE6B0AC:0x4650,0xE6B0AE:0x4651,0xE6B0B3:0x4652,0xE6B0B5:0x4653,
	0xE6B0B6:0x4654,0xE6B0BA:0x4655,0xE6B0BB:0x4656,0xE6B0BF:0x4657,0xE6B18A:0x4658,
	0xE6B18B:0x4659,0xE6B18D:0x465A,0xE6B18F:0x465B,0xE6B192:0x465C,0xE6B194:0x465D,
	0xE6B199:0x465E,0xE6B19B:0x465F,0xE6B19C:0x4660,0xE6B1AB:0x4661,0xE6B1AD:0x4662,
	0xE6B1AF:0x4663,0xE6B1B4:0x4664,0xE6B1B6:0x4665,0xE6B1B8:0x4666,0xE6B1B9:0x4667,
	0xE6B1BB:0x4668,0xE6B285:0x4669,0xE6B286:0x466A,0xE6B287:0x466B,0xE6B289:0x466C,
	0xE6B294:0x466D,0xE6B295:0x466E,0xE6B297:0x466F,0xE6B298:0x4670,0xE6B29C:0x4671,
	0xE6B29F:0x4672,0xE6B2B0:0x4673,0xE6B2B2:0x4674,0xE6B2B4:0x4675,0xE6B382:0x4676,
	0xE6B386:0x4677,0xE6B38D:0x4678,0xE6B38F:0x4679,0xE6B390:0x467A,0xE6B391:0x467B,
	0xE6B392:0x467C,0xE6B394:0x467D,0xE6B396:0x467E,0xE6B39A:0x4721,0xE6B39C:0x4722,
	0xE6B3A0:0x4723,0xE6B3A7:0x4724,0xE6B3A9:0x4725,0xE6B3AB:0x4726,0xE6B3AC:0x4727,
	0xE6B3AE:0x4728,0xE6B3B2:0x4729,0xE6B3B4:0x472A,0xE6B484:0x472B,0xE6B487:0x472C,
	0xE6B48A:0x472D,0xE6B48E:0x472E,0xE6B48F:0x472F,0xE6B491:0x4730,0xE6B493:0x4731,
	0xE6B49A:0x4732,0xE6B4A6:0x4733,0xE6B4A7:0x4734,0xE6B4A8:0x4735,0xE6B1A7:0x4736,
	0xE6B4AE:0x4737,0xE6B4AF:0x4738,0xE6B4B1:0x4739,0xE6B4B9:0x473A,0xE6B4BC:0x473B,
	0xE6B4BF:0x473C,0xE6B597:0x473D,0xE6B59E:0x473E,0xE6B59F:0x473F,0xE6B5A1:0x4740,
	0xE6B5A5:0x4741,0xE6B5A7:0x4742,0xE6B5AF:0x4743,0xE6B5B0:0x4744,0xE6B5BC:0x4745,
	0xE6B682:0x4746,0xE6B687:0x4747,0xE6B691:0x4748,0xE6B692:0x4749,0xE6B694:0x474A,
	0xE6B696:0x474B,0xE6B697:0x474C,0xE6B698:0x474D,0xE6B6AA:0x474E,0xE6B6AC:0x474F,
	0xE6B6B4:0x4750,0xE6B6B7:0x4751,0xE6B6B9:0x4752,0xE6B6BD:0x4753,0xE6B6BF:0x4754,
	0xE6B784:0x4755,0xE6B788:0x4756,0xE6B78A:0x4757,0xE6B78E:0x4758,0xE6B78F:0x4759,
	0xE6B796:0x475A,0xE6B79B:0x475B,0xE6B79D:0x475C,0xE6B79F:0x475D,0xE6B7A0:0x475E,
	0xE6B7A2:0x475F,0xE6B7A5:0x4760,0xE6B7A9:0x4761,0xE6B7AF:0x4762,0xE6B7B0:0x4763,
	0xE6B7B4:0x4764,0xE6B7B6:0x4765,0xE6B7BC:0x4766,0xE6B880:0x4767,0xE6B884:0x4768,
	0xE6B89E:0x4769,0xE6B8A2:0x476A,0xE6B8A7:0x476B,0xE6B8B2:0x476C,0xE6B8B6:0x476D,
	0xE6B8B9:0x476E,0xE6B8BB:0x476F,0xE6B8BC:0x4770,0xE6B984:0x4771,0xE6B985:0x4772,
	0xE6B988:0x4773,0xE6B989:0x4774,0xE6B98B:0x4775,0xE6B98F:0x4776,0xE6B991:0x4777,
	0xE6B992:0x4778,0xE6B993:0x4779,0xE6B994:0x477A,0xE6B997:0x477B,0xE6B99C:0x477C,
	0xE6B99D:0x477D,0xE6B99E:0x477E,0xE6B9A2:0x4821,0xE6B9A3:0x4822,0xE6B9A8:0x4823,
	0xE6B9B3:0x4824,0xE6B9BB:0x4825,0xE6B9BD:0x4826,0xE6BA8D:0x4827,0xE6BA93:0x4828,
	0xE6BA99:0x4829,0xE6BAA0:0x482A,0xE6BAA7:0x482B,0xE6BAAD:0x482C,0xE6BAAE:0x482D,
	0xE6BAB1:0x482E,0xE6BAB3:0x482F,0xE6BABB:0x4830,0xE6BABF:0x4831,0xE6BB80:0x4832,
	0xE6BB81:0x4833,0xE6BB83:0x4834,0xE6BB87:0x4835,0xE6BB88:0x4836,0xE6BB8A:0x4837,
	0xE6BB8D:0x4838,0xE6BB8E:0x4839,0xE6BB8F:0x483A,0xE6BBAB:0x483B,0xE6BBAD:0x483C,
	0xE6BBAE:0x483D,0xE6BBB9:0x483E,0xE6BBBB:0x483F,0xE6BBBD:0x4840,0xE6BC84:0x4841,
	0xE6BC88:0x4842,0xE6BC8A:0x4843,0xE6BC8C:0x4844,0xE6BC8D:0x4845,0xE6BC96:0x4846,
	0xE6BC98:0x4847,0xE6BC9A:0x4848,0xE6BC9B:0x4849,0xE6BCA6:0x484A,0xE6BCA9:0x484B,
	0xE6BCAA:0x484C,0xE6BCAF:0x484D,0xE6BCB0:0x484E,0xE6BCB3:0x484F,0xE6BCB6:0x4850,
	0xE6BCBB:0x4851,0xE6BCBC:0x4852,0xE6BCAD:0x4853,0xE6BD8F:0x4854,0xE6BD91:0x4855,
	0xE6BD92:0x4856,0xE6BD93:0x4857,0xE6BD97:0x4858,0xE6BD99:0x4859,0xE6BD9A:0x485A,
	0xE6BD9D:0x485B,0xE6BD9E:0x485C,0xE6BDA1:0x485D,0xE6BDA2:0x485E,0xE6BDA8:0x485F,
	0xE6BDAC:0x4860,0xE6BDBD:0x4861,0xE6BDBE:0x4862,0xE6BE83:0x4863,0xE6BE87:0x4864,
	0xE6BE88:0x4865,0xE6BE8B:0x4866,0xE6BE8C:0x4867,0xE6BE8D:0x4868,0xE6BE90:0x4869,
	0xE6BE92:0x486A,0xE6BE93:0x486B,0xE6BE94:0x486C,0xE6BE96:0x486D,0xE6BE9A:0x486E,
	0xE6BE9F:0x486F,0xE6BEA0:0x4870,0xE6BEA5:0x4871,0xE6BEA6:0x4872,0xE6BEA7:0x4873,
	0xE6BEA8:0x4874,0xE6BEAE:0x4875,0xE6BEAF:0x4876,0xE6BEB0:0x4877,0xE6BEB5:0x4878,
	0xE6BEB6:0x4879,0xE6BEBC:0x487A,0xE6BF85:0x487B,0xE6BF87:0x487C,0xE6BF88:0x487D,
	0xE6BF8A:0x487E,0xE6BF9A:0x4921,0xE6BF9E:0x4922,0xE6BFA8:0x4923,0xE6BFA9:0x4924,
	0xE6BFB0:0x4925,0xE6BFB5:0x4926,0xE6BFB9:0x4927,0xE6BFBC:0x4928,0xE6BFBD:0x4929,
	0xE78080:0x492A,0xE78085:0x492B,0xE78086:0x492C,0xE78087:0x492D,0xE7808D:0x492E,
	0xE78097:0x492F,0xE780A0:0x4930,0xE780A3:0x4931,0xE780AF:0x4932,0xE780B4:0x4933,
	0xE780B7:0x4934,0xE780B9:0x4935,0xE780BC:0x4936,0xE78183:0x4937,0xE78184:0x4938,
	0xE78188:0x4939,0xE78189:0x493A,0xE7818A:0x493B,0xE7818B:0x493C,0xE78194:0x493D,
	0xE78195:0x493E,0xE7819D:0x493F,0xE7819E:0x4940,0xE7818E:0x4941,0xE781A4:0x4942,
	0xE781A5:0x4943,0xE781AC:0x4944,0xE781AE:0x4945,0xE781B5:0x4946,0xE781B6:0x4947,
	0xE781BE:0x4948,0xE78281:0x4949,0xE78285:0x494A,0xE78286:0x494B,0xE78294:0x494C,
	0xE78295:0x494D,0xE78296:0x494E,0xE78297:0x494F,0xE78298:0x4950,0xE7829B:0x4951,
	0xE782A4:0x4952,0xE782AB:0x4953,0xE782B0:0x4954,0xE782B1:0x4955,0xE782B4:0x4956,
	0xE782B7:0x4957,0xE7838A:0x4958,0xE78391:0x4959,0xE78393:0x495A,0xE78394:0x495B,
	0xE78395:0x495C,0xE78396:0x495D,0xE78398:0x495E,0xE7839C:0x495F,0xE783A4:0x4960,
	0xE783BA:0x4961,0xE78483:0x4962,0xE78484:0x4963,0xE78485:0x4964,0xE78486:0x4965,
	0xE78487:0x4966,0xE7848B:0x4967,0xE7848C:0x4968,0xE7848F:0x4969,0xE7849E:0x496A,
	0xE784A0:0x496B,0xE784AB:0x496C,0xE784AD:0x496D,0xE784AF:0x496E,0xE784B0:0x496F,
	0xE784B1:0x4970,0xE784B8:0x4971,0xE78581:0x4972,0xE78585:0x4973,0xE78586:0x4974,
	0xE78587:0x4975,0xE7858A:0x4976,0xE7858B:0x4977,0xE78590:0x4978,0xE78592:0x4979,
	0xE78597:0x497A,0xE7859A:0x497B,0xE7859C:0x497C,0xE7859E:0x497D,0xE785A0:0x497E,
	0xE785A8:0x4A21,0xE785B9:0x4A22,0xE78680:0x4A23,0xE78685:0x4A24,0xE78687:0x4A25,
	0xE7868C:0x4A26,0xE78692:0x4A27,0xE7869A:0x4A28,0xE7869B:0x4A29,0xE786A0:0x4A2A,
	0xE786A2:0x4A2B,0xE786AF:0x4A2C,0xE786B0:0x4A2D,0xE786B2:0x4A2E,0xE786B3:0x4A2F,
	0xE786BA:0x4A30,0xE786BF:0x4A31,0xE78780:0x4A32,0xE78781:0x4A33,0xE78784:0x4A34,
	0xE7878B:0x4A35,0xE7878C:0x4A36,0xE78793:0x4A37,0xE78796:0x4A38,0xE78799:0x4A39,
	0xE7879A:0x4A3A,0xE7879C:0x4A3B,0xE787B8:0x4A3C,0xE787BE:0x4A3D,0xE78880:0x4A3E,
	0xE78887:0x4A3F,0xE78888:0x4A40,0xE78889:0x4A41,0xE78893:0x4A42,0xE78897:0x4A43,
	0xE7889A:0x4A44,0xE7889D:0x4A45,0xE7889F:0x4A46,0xE788A4:0x4A47,0xE788AB:0x4A48,
	0xE788AF:0x4A49,0xE788B4:0x4A4A,0xE788B8:0x4A4B,0xE788B9:0x4A4C,0xE78981:0x4A4D,
	0xE78982:0x4A4E,0xE78983:0x4A4F,0xE78985:0x4A50,0xE7898E:0x4A51,0xE7898F:0x4A52,
	0xE78990:0x4A53,0xE78993:0x4A54,0xE78995:0x4A55,0xE78996:0x4A56,0xE7899A:0x4A57,
	0xE7899C:0x4A58,0xE7899E:0x4A59,0xE789A0:0x4A5A,0xE789A3:0x4A5B,0xE789A8:0x4A5C,
	0xE789AB:0x4A5D,0xE789AE:0x4A5E,0xE789AF:0x4A5F,0xE789B1:0x4A60,0xE789B7:0x4A61,
	0xE789B8:0x4A62,0xE789BB:0x4A63,0xE789BC:0x4A64,0xE789BF:0x4A65,0xE78A84:0x4A66,
	0xE78A89:0x4A67,0xE78A8D:0x4A68,0xE78A8E:0x4A69,0xE78A93:0x4A6A,0xE78A9B:0x4A6B,
	0xE78AA8:0x4A6C,0xE78AAD:0x4A6D,0xE78AAE:0x4A6E,0xE78AB1:0x4A6F,0xE78AB4:0x4A70,
	0xE78ABE:0x4A71,0xE78B81:0x4A72,0xE78B87:0x4A73,0xE78B89:0x4A74,0xE78B8C:0x4A75,
	0xE78B95:0x4A76,0xE78B96:0x4A77,0xE78B98:0x4A78,0xE78B9F:0x4A79,0xE78BA5:0x4A7A,
	0xE78BB3:0x4A7B,0xE78BB4:0x4A7C,0xE78BBA:0x4A7D,0xE78BBB:0x4A7E,0xE78BBE:0x4B21,
	0xE78C82:0x4B22,0xE78C84:0x4B23,0xE78C85:0x4B24,0xE78C87:0x4B25,0xE78C8B:0x4B26,
	0xE78C8D:0x4B27,0xE78C92:0x4B28,0xE78C93:0x4B29,0xE78C98:0x4B2A,0xE78C99:0x4B2B,
	0xE78C9E:0x4B2C,0xE78CA2:0x4B2D,0xE78CA4:0x4B2E,0xE78CA7:0x4B2F,0xE78CA8:0x4B30,
	0xE78CAC:0x4B31,0xE78CB1:0x4B32,0xE78CB2:0x4B33,0xE78CB5:0x4B34,0xE78CBA:0x4B35,
	0xE78CBB:0x4B36,0xE78CBD:0x4B37,0xE78D83:0x4B38,0xE78D8D:0x4B39,0xE78D90:0x4B3A,
	0xE78D92:0x4B3B,0xE78D96:0x4B3C,0xE78D98:0x4B3D,0xE78D9D:0x4B3E,0xE78D9E:0x4B3F,
	0xE78D9F:0x4B40,0xE78DA0:0x4B41,0xE78DA6:0x4B42,0xE78DA7:0x4B43,0xE78DA9:0x4B44,
	0xE78DAB:0x4B45,0xE78DAC:0x4B46,0xE78DAE:0x4B47,0xE78DAF:0x4B48,0xE78DB1:0x4B49,
	0xE78DB7:0x4B4A,0xE78DB9:0x4B4B,0xE78DBC:0x4B4C,0xE78E80:0x4B4D,0xE78E81:0x4B4E,
	0xE78E83:0x4B4F,0xE78E85:0x4B50,0xE78E86:0x4B51,0xE78E8E:0x4B52,0xE78E90:0x4B53,
	0xE78E93:0x4B54,0xE78E95:0x4B55,0xE78E97:0x4B56,0xE78E98:0x4B57,0xE78E9C:0x4B58,
	0xE78E9E:0x4B59,0xE78E9F:0x4B5A,0xE78EA0:0x4B5B,0xE78EA2:0x4B5C,0xE78EA5:0x4B5D,
	0xE78EA6:0x4B5E,0xE78EAA:0x4B5F,0xE78EAB:0x4B60,0xE78EAD:0x4B61,0xE78EB5:0x4B62,
	0xE78EB7:0x4B63,0xE78EB9:0x4B64,0xE78EBC:0x4B65,0xE78EBD:0x4B66,0xE78EBF:0x4B67,
	0xE78F85:0x4B68,0xE78F86:0x4B69,0xE78F89:0x4B6A,0xE78F8B:0x4B6B,0xE78F8C:0x4B6C,
	0xE78F8F:0x4B6D,0xE78F92:0x4B6E,0xE78F93:0x4B6F,0xE78F96:0x4B70,0xE78F99:0x4B71,
	0xE78F9D:0x4B72,0xE78FA1:0x4B73,0xE78FA3:0x4B74,0xE78FA6:0x4B75,0xE78FA7:0x4B76,
	0xE78FA9:0x4B77,0xE78FB4:0x4B78,0xE78FB5:0x4B79,0xE78FB7:0x4B7A,0xE78FB9:0x4B7B,
	0xE78FBA:0x4B7C,0xE78FBB:0x4B7D,0xE78FBD:0x4B7E,0xE78FBF:0x4C21,0xE79080:0x4C22,
	0xE79081:0x4C23,0xE79084:0x4C24,0xE79087:0x4C25,0xE7908A:0x4C26,0xE79091:0x4C27,
	0xE7909A:0x4C28,0xE7909B:0x4C29,0xE790A4:0x4C2A,0xE790A6:0x4C2B,0xE790A8:0x4C2C,
	0xE790A9:0x4C2D,0xE790AA:0x4C2E,0xE790AB:0x4C2F,0xE790AC:0x4C30,0xE790AD:0x4C31,
	0xE790AE:0x4C32,0xE790AF:0x4C33,0xE790B0:0x4C34,0xE790B1:0x4C35,0xE790B9:0x4C36,
	0xE79180:0x4C37,0xE79183:0x4C38,0xE79184:0x4C39,0xE79186:0x4C3A,0xE79187:0x4C3B,
	0xE7918B:0x4C3C,0xE7918D:0x4C3D,0xE79191:0x4C3E,0xE79192:0x4C3F,0xE79197:0x4C40,
	0xE7919D:0x4C41,0xE791A2:0x4C42,0xE791A6:0x4C43,0xE791A7:0x4C44,0xE791A8:0x4C45,
	0xE791AB:0x4C46,0xE791AD:0x4C47,0xE791AE:0x4C48,0xE791B1:0x4C49,0xE791B2:0x4C4A,
	0xE79280:0x4C4B,0xE79281:0x4C4C,0xE79285:0x4C4D,0xE79286:0x4C4E,0xE79287:0x4C4F,
	0xE79289:0x4C50,0xE7928F:0x4C51,0xE79290:0x4C52,0xE79291:0x4C53,0xE79292:0x4C54,
	0xE79298:0x4C55,0xE79299:0x4C56,0xE7929A:0x4C57,0xE7929C:0x4C58,0xE7929F:0x4C59,
	0xE792A0:0x4C5A,0xE792A1:0x4C5B,0xE792A3:0x4C5C,0xE792A6:0x4C5D,0xE792A8:0x4C5E,
	0xE792A9:0x4C5F,0xE792AA:0x4C60,0xE792AB:0x4C61,0xE792AE:0x4C62,0xE792AF:0x4C63,
	0xE792B1:0x4C64,0xE792B2:0x4C65,0xE792B5:0x4C66,0xE792B9:0x4C67,0xE792BB:0x4C68,
	0xE792BF:0x4C69,0xE79388:0x4C6A,0xE79389:0x4C6B,0xE7938C:0x4C6C,0xE79390:0x4C6D,
	0xE79393:0x4C6E,0xE79398:0x4C6F,0xE7939A:0x4C70,0xE7939B:0x4C71,0xE7939E:0x4C72,
	0xE7939F:0x4C73,0xE793A4:0x4C74,0xE793A8:0x4C75,0xE793AA:0x4C76,0xE793AB:0x4C77,
	0xE793AF:0x4C78,0xE793B4:0x4C79,0xE793BA:0x4C7A,0xE793BB:0x4C7B,0xE793BC:0x4C7C,
	0xE793BF:0x4C7D,0xE79486:0x4C7E,0xE79492:0x4D21,0xE79496:0x4D22,0xE79497:0x4D23,
	0xE794A0:0x4D24,0xE794A1:0x4D25,0xE794A4:0x4D26,0xE794A7:0x4D27,0xE794A9:0x4D28,
	0xE794AA:0x4D29,0xE794AF:0x4D2A,0xE794B6:0x4D2B,0xE794B9:0x4D2C,0xE794BD:0x4D2D,
	0xE794BE:0x4D2E,0xE794BF:0x4D2F,0xE79580:0x4D30,0xE79583:0x4D31,0xE79587:0x4D32,
	0xE79588:0x4D33,0xE7958E:0x4D34,0xE79590:0x4D35,0xE79592:0x4D36,0xE79597:0x4D37,
	0xE7959E:0x4D38,0xE7959F:0x4D39,0xE795A1:0x4D3A,0xE795AF:0x4D3B,0xE795B1:0x4D3C,
	0xE795B9:0x4D3D,0xE795BA:0x4D3E,0xE795BB:0x4D3F,0xE795BC:0x4D40,0xE795BD:0x4D41,
	0xE795BE:0x4D42,0xE79681:0x4D43,0xE79685:0x4D44,0xE79690:0x4D45,0xE79692:0x4D46,
	0xE79693:0x4D47,0xE79695:0x4D48,0xE79699:0x4D49,0xE7969C:0x4D4A,0xE796A2:0x4D4B,
	0xE796A4:0x4D4C,0xE796B4:0x4D4D,0xE796BA:0x4D4E,0xE796BF:0x4D4F,0xE79780:0x4D50,
	0xE79781:0x4D51,0xE79784:0x4D52,0xE79786:0x4D53,0xE7978C:0x4D54,0xE7978E:0x4D55,
	0xE7978F:0x4D56,0xE79797:0x4D57,0xE7979C:0x4D58,0xE7979F:0x4D59,0xE797A0:0x4D5A,
	0xE797A1:0x4D5B,0xE797A4:0x4D5C,0xE797A7:0x4D5D,0xE797AC:0x4D5E,0xE797AE:0x4D5F,
	0xE797AF:0x4D60,0xE797B1:0x4D61,0xE797B9:0x4D62,0xE79880:0x4D63,0xE79882:0x4D64,
	0xE79883:0x4D65,0xE79884:0x4D66,0xE79887:0x4D67,0xE79888:0x4D68,0xE7988A:0x4D69,
	0xE7988C:0x4D6A,0xE7988F:0x4D6B,0xE79892:0x4D6C,0xE79893:0x4D6D,0xE79895:0x4D6E,
	0xE79896:0x4D6F,0xE79899:0x4D70,0xE7989B:0x4D71,0xE7989C:0x4D72,0xE7989D:0x4D73,
	0xE7989E:0x4D74,0xE798A3:0x4D75,0xE798A5:0x4D76,0xE798A6:0x4D77,0xE798A9:0x4D78,
	0xE798AD:0x4D79,0xE798B2:0x4D7A,0xE798B3:0x4D7B,0xE798B5:0x4D7C,0xE798B8:0x4D7D,
	0xE798B9:0x4D7E,0xE798BA:0x4E21,0xE798BC:0x4E22,0xE7998A:0x4E23,0xE79980:0x4E24,
	0xE79981:0x4E25,0xE79983:0x4E26,0xE79984:0x4E27,0xE79985:0x4E28,0xE79989:0x4E29,
	0xE7998B:0x4E2A,0xE79995:0x4E2B,0xE79999:0x4E2C,0xE7999F:0x4E2D,0xE799A4:0x4E2E,
	0xE799A5:0x4E2F,0xE799AD:0x4E30,0xE799AE:0x4E31,0xE799AF:0x4E32,0xE799B1:0x4E33,
	0xE799B4:0x4E34,0xE79A81:0x4E35,0xE79A85:0x4E36,0xE79A8C:0x4E37,0xE79A8D:0x4E38,
	0xE79A95:0x4E39,0xE79A9B:0x4E3A,0xE79A9C:0x4E3B,0xE79A9D:0x4E3C,0xE79A9F:0x4E3D,
	0xE79AA0:0x4E3E,0xE79AA2:0x4E3F,0xE79AA3:0x4E40,0xE79AA4:0x4E41,0xE79AA5:0x4E42,
	0xE79AA6:0x4E43,0xE79AA7:0x4E44,0xE79AA8:0x4E45,0xE79AAA:0x4E46,0xE79AAD:0x4E47,
	0xE79ABD:0x4E48,0xE79B81:0x4E49,0xE79B85:0x4E4A,0xE79B89:0x4E4B,0xE79B8B:0x4E4C,
	0xE79B8C:0x4E4D,0xE79B8E:0x4E4E,0xE79B94:0x4E4F,0xE79B99:0x4E50,0xE79BA0:0x4E51,
	0xE79BA6:0x4E52,0xE79BA8:0x4E53,0xE79BAC:0x4E54,0xE79BB0:0x4E55,0xE79BB1:0x4E56,
	0xE79BB6:0x4E57,0xE79BB9:0x4E58,0xE79BBC:0x4E59,0xE79C80:0x4E5A,0xE79C86:0x4E5B,
	0xE79C8A:0x4E5C,0xE79C8E:0x4E5D,0xE79C92:0x4E5E,0xE79C94:0x4E5F,0xE79C95:0x4E60,
	0xE79C97:0x4E61,0xE79C99:0x4E62,0xE79C9A:0x4E63,0xE79C9C:0x4E64,0xE79CA2:0x4E65,
	0xE79CA8:0x4E66,0xE79CAD:0x4E67,0xE79CAE:0x4E68,0xE79CAF:0x4E69,0xE79CB4:0x4E6A,
	0xE79CB5:0x4E6B,0xE79CB6:0x4E6C,0xE79CB9:0x4E6D,0xE79CBD:0x4E6E,0xE79CBE:0x4E6F,
	0xE79D82:0x4E70,0xE79D85:0x4E71,0xE79D86:0x4E72,0xE79D8A:0x4E73,0xE79D8D:0x4E74,
	0xE79D8E:0x4E75,0xE79D8F:0x4E76,0xE79D92:0x4E77,0xE79D96:0x4E78,0xE79D97:0x4E79,
	0xE79D9C:0x4E7A,0xE79D9E:0x4E7B,0xE79D9F:0x4E7C,0xE79DA0:0x4E7D,0xE79DA2:0x4E7E,
	0xE79DA4:0x4F21,0xE79DA7:0x4F22,0xE79DAA:0x4F23,0xE79DAC:0x4F24,0xE79DB0:0x4F25,
	0xE79DB2:0x4F26,0xE79DB3:0x4F27,0xE79DB4:0x4F28,0xE79DBA:0x4F29,0xE79DBD:0x4F2A,
	0xE79E80:0x4F2B,0xE79E84:0x4F2C,0xE79E8C:0x4F2D,0xE79E8D:0x4F2E,0xE79E94:0x4F2F,
	0xE79E95:0x4F30,0xE79E96:0x4F31,0xE79E9A:0x4F32,0xE79E9F:0x4F33,0xE79EA2:0x4F34,
	0xE79EA7:0x4F35,0xE79EAA:0x4F36,0xE79EAE:0x4F37,0xE79EAF:0x4F38,0xE79EB1:0x4F39,
	0xE79EB5:0x4F3A,0xE79EBE:0x4F3B,0xE79F83:0x4F3C,0xE79F89:0x4F3D,0xE79F91:0x4F3E,
	0xE79F92:0x4F3F,0xE79F95:0x4F40,0xE79F99:0x4F41,0xE79F9E:0x4F42,0xE79F9F:0x4F43,
	0xE79FA0:0x4F44,0xE79FA4:0x4F45,0xE79FA6:0x4F46,0xE79FAA:0x4F47,0xE79FAC:0x4F48,
	0xE79FB0:0x4F49,0xE79FB1:0x4F4A,0xE79FB4:0x4F4B,0xE79FB8:0x4F4C,0xE79FBB:0x4F4D,
	0xE7A085:0x4F4E,0xE7A086:0x4F4F,0xE7A089:0x4F50,0xE7A08D:0x4F51,0xE7A08E:0x4F52,
	0xE7A091:0x4F53,0xE7A09D:0x4F54,0xE7A0A1:0x4F55,0xE7A0A2:0x4F56,0xE7A0A3:0x4F57,
	0xE7A0AD:0x4F58,0xE7A0AE:0x4F59,0xE7A0B0:0x4F5A,0xE7A0B5:0x4F5B,0xE7A0B7:0x4F5C,
	0xE7A183:0x4F5D,0xE7A184:0x4F5E,0xE7A187:0x4F5F,0xE7A188:0x4F60,0xE7A18C:0x4F61,
	0xE7A18E:0x4F62,0xE7A192:0x4F63,0xE7A19C:0x4F64,0xE7A19E:0x4F65,0xE7A1A0:0x4F66,
	0xE7A1A1:0x4F67,0xE7A1A3:0x4F68,0xE7A1A4:0x4F69,0xE7A1A8:0x4F6A,0xE7A1AA:0x4F6B,
	0xE7A1AE:0x4F6C,0xE7A1BA:0x4F6D,0xE7A1BE:0x4F6E,0xE7A28A:0x4F6F,0xE7A28F:0x4F70,
	0xE7A294:0x4F71,0xE7A298:0x4F72,0xE7A2A1:0x4F73,0xE7A29D:0x4F74,0xE7A29E:0x4F75,
	0xE7A29F:0x4F76,0xE7A2A4:0x4F77,0xE7A2A8:0x4F78,0xE7A2AC:0x4F79,0xE7A2AD:0x4F7A,
	0xE7A2B0:0x4F7B,0xE7A2B1:0x4F7C,0xE7A2B2:0x4F7D,0xE7A2B3:0x4F7E,0xE7A2BB:0x5021,
	0xE7A2BD:0x5022,0xE7A2BF:0x5023,0xE7A387:0x5024,0xE7A388:0x5025,0xE7A389:0x5026,
	0xE7A38C:0x5027,0xE7A38E:0x5028,0xE7A392:0x5029,0xE7A393:0x502A,0xE7A395:0x502B,
	0xE7A396:0x502C,0xE7A3A4:0x502D,0xE7A39B:0x502E,0xE7A39F:0x502F,0xE7A3A0:0x5030,
	0xE7A3A1:0x5031,0xE7A3A6:0x5032,0xE7A3AA:0x5033,0xE7A3B2:0x5034,0xE7A3B3:0x5035,
	0xE7A480:0x5036,0xE7A3B6:0x5037,0xE7A3B7:0x5038,0xE7A3BA:0x5039,0xE7A3BB:0x503A,
	0xE7A3BF:0x503B,0xE7A486:0x503C,0xE7A48C:0x503D,0xE7A490:0x503E,0xE7A49A:0x503F,
	0xE7A49C:0x5040,0xE7A49E:0x5041,0xE7A49F:0x5042,0xE7A4A0:0x5043,0xE7A4A5:0x5044,
	0xE7A4A7:0x5045,0xE7A4A9:0x5046,0xE7A4AD:0x5047,0xE7A4B1:0x5048,0xE7A4B4:0x5049,
	0xE7A4B5:0x504A,0xE7A4BB:0x504B,0xE7A4BD:0x504C,0xE7A4BF:0x504D,0xE7A584:0x504E,
	0xE7A585:0x504F,0xE7A586:0x5050,0xE7A58A:0x5051,0xE7A58B:0x5052,0xE7A58F:0x5053,
	0xE7A591:0x5054,0xE7A594:0x5055,0xE7A598:0x5056,0xE7A59B:0x5057,0xE7A59C:0x5058,
	0xE7A5A7:0x5059,0xE7A5A9:0x505A,0xE7A5AB:0x505B,0xE7A5B2:0x505C,0xE7A5B9:0x505D,
	0xE7A5BB:0x505E,0xE7A5BC:0x505F,0xE7A5BE:0x5060,0xE7A68B:0x5061,0xE7A68C:0x5062,
	0xE7A691:0x5063,0xE7A693:0x5064,0xE7A694:0x5065,0xE7A695:0x5066,0xE7A696:0x5067,
	0xE7A698:0x5068,0xE7A69B:0x5069,0xE7A69C:0x506A,0xE7A6A1:0x506B,0xE7A6A8:0x506C,
	0xE7A6A9:0x506D,0xE7A6AB:0x506E,0xE7A6AF:0x506F,0xE7A6B1:0x5070,0xE7A6B4:0x5071,
	0xE7A6B8:0x5072,0xE7A6BB:0x5073,0xE7A782:0x5074,0xE7A784:0x5075,0xE7A787:0x5076,
	0xE7A788:0x5077,0xE7A78A:0x5078,0xE7A78F:0x5079,0xE7A794:0x507A,0xE7A796:0x507B,
	0xE7A79A:0x507C,0xE7A79D:0x507D,0xE7A79E:0x507E,0xE7A7A0:0x5121,0xE7A7A2:0x5122,
	0xE7A7A5:0x5123,0xE7A7AA:0x5124,0xE7A7AB:0x5125,0xE7A7AD:0x5126,0xE7A7B1:0x5127,
	0xE7A7B8:0x5128,0xE7A7BC:0x5129,0xE7A882:0x512A,0xE7A883:0x512B,0xE7A887:0x512C,
	0xE7A889:0x512D,0xE7A88A:0x512E,0xE7A88C:0x512F,0xE7A891:0x5130,0xE7A895:0x5131,
	0xE7A89B:0x5132,0xE7A89E:0x5133,0xE7A8A1:0x5134,0xE7A8A7:0x5135,0xE7A8AB:0x5136,
	0xE7A8AD:0x5137,0xE7A8AF:0x5138,0xE7A8B0:0x5139,0xE7A8B4:0x513A,0xE7A8B5:0x513B,
	0xE7A8B8:0x513C,0xE7A8B9:0x513D,0xE7A8BA:0x513E,0xE7A984:0x513F,0xE7A985:0x5140,
	0xE7A987:0x5141,0xE7A988:0x5142,0xE7A98C:0x5143,0xE7A995:0x5144,0xE7A996:0x5145,
	0xE7A999:0x5146,0xE7A99C:0x5147,0xE7A99D:0x5148,0xE7A99F:0x5149,0xE7A9A0:0x514A,
	0xE7A9A5:0x514B,0xE7A9A7:0x514C,0xE7A9AA:0x514D,0xE7A9AD:0x514E,0xE7A9B5:0x514F,
	0xE7A9B8:0x5150,0xE7A9BE:0x5151,0xE7AA80:0x5152,0xE7AA82:0x5153,0xE7AA85:0x5154,
	0xE7AA86:0x5155,0xE7AA8A:0x5156,0xE7AA8B:0x5157,0xE7AA90:0x5158,0xE7AA91:0x5159,
	0xE7AA94:0x515A,0xE7AA9E:0x515B,0xE7AAA0:0x515C,0xE7AAA3:0x515D,0xE7AAAC:0x515E,
	0xE7AAB3:0x515F,0xE7AAB5:0x5160,0xE7AAB9:0x5161,0xE7AABB:0x5162,0xE7AABC:0x5163,
	0xE7AB86:0x5164,0xE7AB89:0x5165,0xE7AB8C:0x5166,0xE7AB8E:0x5167,0xE7AB91:0x5168,
	0xE7AB9B:0x5169,0xE7ABA8:0x516A,0xE7ABA9:0x516B,0xE7ABAB:0x516C,0xE7ABAC:0x516D,
	0xE7ABB1:0x516E,0xE7ABB4:0x516F,0xE7ABBB:0x5170,0xE7ABBD:0x5171,0xE7ABBE:0x5172,
	0xE7AC87:0x5173,0xE7AC94:0x5174,0xE7AC9F:0x5175,0xE7ACA3:0x5176,0xE7ACA7:0x5177,
	0xE7ACA9:0x5178,0xE7ACAA:0x5179,0xE7ACAB:0x517A,0xE7ACAD:0x517B,0xE7ACAE:0x517C,
	0xE7ACAF:0x517D,0xE7ACB0:0x517E,0xE7ACB1:0x5221,0xE7ACB4:0x5222,0xE7ACBD:0x5223,
	0xE7ACBF:0x5224,0xE7AD80:0x5225,0xE7AD81:0x5226,0xE7AD87:0x5227,0xE7AD8E:0x5228,
	0xE7AD95:0x5229,0xE7ADA0:0x522A,0xE7ADA4:0x522B,0xE7ADA6:0x522C,0xE7ADA9:0x522D,
	0xE7ADAA:0x522E,0xE7ADAD:0x522F,0xE7ADAF:0x5230,0xE7ADB2:0x5231,0xE7ADB3:0x5232,
	0xE7ADB7:0x5233,0xE7AE84:0x5234,0xE7AE89:0x5235,0xE7AE8E:0x5236,0xE7AE90:0x5237,
	0xE7AE91:0x5238,0xE7AE96:0x5239,0xE7AE9B:0x523A,0xE7AE9E:0x523B,0xE7AEA0:0x523C,
	0xE7AEA5:0x523D,0xE7AEAC:0x523E,0xE7AEAF:0x523F,0xE7AEB0:0x5240,0xE7AEB2:0x5241,
	0xE7AEB5:0x5242,0xE7AEB6:0x5243,0xE7AEBA:0x5244,0xE7AEBB:0x5245,0xE7AEBC:0x5246,
	0xE7AEBD:0x5247,0xE7AF82:0x5248,0xE7AF85:0x5249,0xE7AF88:0x524A,0xE7AF8A:0x524B,
	0xE7AF94:0x524C,0xE7AF96:0x524D,0xE7AF97:0x524E,0xE7AF99:0x524F,0xE7AF9A:0x5250,
	0xE7AF9B:0x5251,0xE7AFA8:0x5252,0xE7AFAA:0x5253,0xE7AFB2:0x5254,0xE7AFB4:0x5255,
	0xE7AFB5:0x5256,0xE7AFB8:0x5257,0xE7AFB9:0x5258,0xE7AFBA:0x5259,0xE7AFBC:0x525A,
	0xE7AFBE:0x525B,0xE7B081:0x525C,0xE7B082:0x525D,0xE7B083:0x525E,0xE7B084:0x525F,
	0xE7B086:0x5260,0xE7B089:0x5261,0xE7B08B:0x5262,0xE7B08C:0x5263,0xE7B08E:0x5264,
	0xE7B08F:0x5265,0xE7B099:0x5266,0xE7B09B:0x5267,0xE7B0A0:0x5268,0xE7B0A5:0x5269,
	0xE7B0A6:0x526A,0xE7B0A8:0x526B,0xE7B0AC:0x526C,0xE7B0B1:0x526D,0xE7B0B3:0x526E,
	0xE7B0B4:0x526F,0xE7B0B6:0x5270,0xE7B0B9:0x5271,0xE7B0BA:0x5272,0xE7B186:0x5273,
	0xE7B18A:0x5274,0xE7B195:0x5275,0xE7B191:0x5276,0xE7B192:0x5277,0xE7B193:0x5278,
	0xE7B199:0x5279,0xE7B19A:0x527A,0xE7B19B:0x527B,0xE7B19C:0x527C,0xE7B19D:0x527D,
	0xE7B19E:0x527E,0xE7B1A1:0x5321,0xE7B1A3:0x5322,0xE7B1A7:0x5323,0xE7B1A9:0x5324,
	0xE7B1AD:0x5325,0xE7B1AE:0x5326,0xE7B1B0:0x5327,0xE7B1B2:0x5328,0xE7B1B9:0x5329,
	0xE7B1BC:0x532A,0xE7B1BD:0x532B,0xE7B286:0x532C,0xE7B287:0x532D,0xE7B28F:0x532E,
	0xE7B294:0x532F,0xE7B29E:0x5330,0xE7B2A0:0x5331,0xE7B2A6:0x5332,0xE7B2B0:0x5333,
	0xE7B2B6:0x5334,0xE7B2B7:0x5335,0xE7B2BA:0x5336,0xE7B2BB:0x5337,0xE7B2BC:0x5338,
	0xE7B2BF:0x5339,0xE7B384:0x533A,0xE7B387:0x533B,0xE7B388:0x533C,0xE7B389:0x533D,
	0xE7B38D:0x533E,0xE7B38F:0x533F,0xE7B393:0x5340,0xE7B394:0x5341,0xE7B395:0x5342,
	0xE7B397:0x5343,0xE7B399:0x5344,0xE7B39A:0x5345,0xE7B39D:0x5346,0xE7B3A6:0x5347,
	0xE7B3A9:0x5348,0xE7B3AB:0x5349,0xE7B3B5:0x534A,0xE7B483:0x534B,0xE7B487:0x534C,
	0xE7B488:0x534D,0xE7B489:0x534E,0xE7B48F:0x534F,0xE7B491:0x5350,0xE7B492:0x5351,
	0xE7B493:0x5352,0xE7B496:0x5353,0xE7B49D:0x5354,0xE7B49E:0x5355,0xE7B4A3:0x5356,
	0xE7B4A6:0x5357,0xE7B4AA:0x5358,0xE7B4AD:0x5359,0xE7B4B1:0x535A,0xE7B4BC:0x535B,
	0xE7B4BD:0x535C,0xE7B4BE:0x535D,0xE7B580:0x535E,0xE7B581:0x535F,0xE7B587:0x5360,
	0xE7B588:0x5361,0xE7B58D:0x5362,0xE7B591:0x5363,0xE7B593:0x5364,0xE7B597:0x5365,
	0xE7B599:0x5366,0xE7B59A:0x5367,0xE7B59C:0x5368,0xE7B59D:0x5369,0xE7B5A5:0x536A,
	0xE7B5A7:0x536B,0xE7B5AA:0x536C,0xE7B5B0:0x536D,0xE7B5B8:0x536E,0xE7B5BA:0x536F,
	0xE7B5BB:0x5370,0xE7B5BF:0x5371,0xE7B681:0x5372,0xE7B682:0x5373,0xE7B683:0x5374,
	0xE7B685:0x5375,0xE7B686:0x5376,0xE7B688:0x5377,0xE7B68B:0x5378,0xE7B68C:0x5379,
	0xE7B68D:0x537A,0xE7B691:0x537B,0xE7B696:0x537C,0xE7B697:0x537D,0xE7B69D:0x537E,
	0xE7B69E:0x5421,0xE7B6A6:0x5422,0xE7B6A7:0x5423,0xE7B6AA:0x5424,0xE7B6B3:0x5425,
	0xE7B6B6:0x5426,0xE7B6B7:0x5427,0xE7B6B9:0x5428,0xE7B782:0x5429,0xE7B783:0x542A,
	0xE7B784:0x542B,0xE7B785:0x542C,0xE7B786:0x542D,0xE7B78C:0x542E,0xE7B78D:0x542F,
	0xE7B78E:0x5430,0xE7B797:0x5431,0xE7B799:0x5432,0xE7B880:0x5433,0xE7B7A2:0x5434,
	0xE7B7A5:0x5435,0xE7B7A6:0x5436,0xE7B7AA:0x5437,0xE7B7AB:0x5438,0xE7B7AD:0x5439,
	0xE7B7B1:0x543A,0xE7B7B5:0x543B,0xE7B7B6:0x543C,0xE7B7B9:0x543D,0xE7B7BA:0x543E,
	0xE7B888:0x543F,0xE7B890:0x5440,0xE7B891:0x5441,0xE7B895:0x5442,0xE7B897:0x5443,
	0xE7B89C:0x5444,0xE7B89D:0x5445,0xE7B8A0:0x5446,0xE7B8A7:0x5447,0xE7B8A8:0x5448,
	0xE7B8AC:0x5449,0xE7B8AD:0x544A,0xE7B8AF:0x544B,0xE7B8B3:0x544C,0xE7B8B6:0x544D,
	0xE7B8BF:0x544E,0xE7B984:0x544F,0xE7B985:0x5450,0xE7B987:0x5451,0xE7B98E:0x5452,
	0xE7B990:0x5453,0xE7B992:0x5454,0xE7B998:0x5455,0xE7B99F:0x5456,0xE7B9A1:0x5457,
	0xE7B9A2:0x5458,0xE7B9A5:0x5459,0xE7B9AB:0x545A,0xE7B9AE:0x545B,0xE7B9AF:0x545C,
	0xE7B9B3:0x545D,0xE7B9B8:0x545E,0xE7B9BE:0x545F,0xE7BA81:0x5460,0xE7BA86:0x5461,
	0xE7BA87:0x5462,0xE7BA8A:0x5463,0xE7BA8D:0x5464,0xE7BA91:0x5465,0xE7BA95:0x5466,
	0xE7BA98:0x5467,0xE7BA9A:0x5468,0xE7BA9D:0x5469,0xE7BA9E:0x546A,0xE7BCBC:0x546B,
	0xE7BCBB:0x546C,0xE7BCBD:0x546D,0xE7BCBE:0x546E,0xE7BCBF:0x546F,0xE7BD83:0x5470,
	0xE7BD84:0x5471,0xE7BD87:0x5472,0xE7BD8F:0x5473,0xE7BD92:0x5474,0xE7BD93:0x5475,
	0xE7BD9B:0x5476,0xE7BD9C:0x5477,0xE7BD9D:0x5478,0xE7BDA1:0x5479,0xE7BDA3:0x547A,
	0xE7BDA4:0x547B,0xE7BDA5:0x547C,0xE7BDA6:0x547D,0xE7BDAD:0x547E,0xE7BDB1:0x5521,
	0xE7BDBD:0x5522,0xE7BDBE:0x5523,0xE7BDBF:0x5524,0xE7BE80:0x5525,0xE7BE8B:0x5526,
	0xE7BE8D:0x5527,0xE7BE8F:0x5528,0xE7BE90:0x5529,0xE7BE91:0x552A,0xE7BE96:0x552B,
	0xE7BE97:0x552C,0xE7BE9C:0x552D,0xE7BEA1:0x552E,0xE7BEA2:0x552F,0xE7BEA6:0x5530,
	0xE7BEAA:0x5531,0xE7BEAD:0x5532,0xE7BEB4:0x5533,0xE7BEBC:0x5534,0xE7BEBF:0x5535,
	0xE7BF80:0x5536,0xE7BF83:0x5537,0xE7BF88:0x5538,0xE7BF8E:0x5539,0xE7BF8F:0x553A,
	0xE7BF9B:0x553B,0xE7BF9F:0x553C,0xE7BFA3:0x553D,0xE7BFA5:0x553E,0xE7BFA8:0x553F,
	0xE7BFAC:0x5540,0xE7BFAE:0x5541,0xE7BFAF:0x5542,0xE7BFB2:0x5543,0xE7BFBA:0x5544,
	0xE7BFBD:0x5545,0xE7BFBE:0x5546,0xE7BFBF:0x5547,0xE88087:0x5548,0xE88088:0x5549,
	0xE8808A:0x554A,0xE8808D:0x554B,0xE8808E:0x554C,0xE8808F:0x554D,0xE88091:0x554E,
	0xE88093:0x554F,0xE88094:0x5550,0xE88096:0x5551,0xE8809D:0x5552,0xE8809E:0x5553,
	0xE8809F:0x5554,0xE880A0:0x5555,0xE880A4:0x5556,0xE880A6:0x5557,0xE880AC:0x5558,
	0xE880AE:0x5559,0xE880B0:0x555A,0xE880B4:0x555B,0xE880B5:0x555C,0xE880B7:0x555D,
	0xE880B9:0x555E,0xE880BA:0x555F,0xE880BC:0x5560,0xE880BE:0x5561,0xE88180:0x5562,
	0xE88184:0x5563,0xE881A0:0x5564,0xE881A4:0x5565,0xE881A6:0x5566,0xE881AD:0x5567,
	0xE881B1:0x5568,0xE881B5:0x5569,0xE88281:0x556A,0xE88288:0x556B,0xE8828E:0x556C,
	0xE8829C:0x556D,0xE8829E:0x556E,0xE882A6:0x556F,0xE882A7:0x5570,0xE882AB:0x5571,
	0xE882B8:0x5572,0xE882B9:0x5573,0xE88388:0x5574,0xE8838D:0x5575,0xE8838F:0x5576,
	0xE88392:0x5577,0xE88394:0x5578,0xE88395:0x5579,0xE88397:0x557A,0xE88398:0x557B,
	0xE883A0:0x557C,0xE883AD:0x557D,0xE883AE:0x557E,0xE883B0:0x5621,0xE883B2:0x5622,
	0xE883B3:0x5623,0xE883B6:0x5624,0xE883B9:0x5625,0xE883BA:0x5626,0xE883BE:0x5627,
	0xE88483:0x5628,0xE8848B:0x5629,0xE88496:0x562A,0xE88497:0x562B,0xE88498:0x562C,
	0xE8849C:0x562D,0xE8849E:0x562E,0xE884A0:0x562F,0xE884A4:0x5630,0xE884A7:0x5631,
	0xE884AC:0x5632,0xE884B0:0x5633,0xE884B5:0x5634,0xE884BA:0x5635,0xE884BC:0x5636,
	0xE88585:0x5637,0xE88587:0x5638,0xE8858A:0x5639,0xE8858C:0x563A,0xE88592:0x563B,
	0xE88597:0x563C,0xE885A0:0x563D,0xE885A1:0x563E,0xE885A7:0x563F,0xE885A8:0x5640,
	0xE885A9:0x5641,0xE885AD:0x5642,0xE885AF:0x5643,0xE885B7:0x5644,0xE88681:0x5645,
	0xE88690:0x5646,0xE88684:0x5647,0xE88685:0x5648,0xE88686:0x5649,0xE8868B:0x564A,
	0xE8868E:0x564B,0xE88696:0x564C,0xE88698:0x564D,0xE8869B:0x564E,0xE8869E:0x564F,
	0xE886A2:0x5650,0xE886AE:0x5651,0xE886B2:0x5652,0xE886B4:0x5653,0xE886BB:0x5654,
	0xE8878B:0x5655,0xE88783:0x5656,0xE88785:0x5657,0xE8878A:0x5658,0xE8878E:0x5659,
	0xE8878F:0x565A,0xE88795:0x565B,0xE88797:0x565C,0xE8879B:0x565D,0xE8879D:0x565E,
	0xE8879E:0x565F,0xE887A1:0x5660,0xE887A4:0x5661,0xE887AB:0x5662,0xE887AC:0x5663,
	0xE887B0:0x5664,0xE887B1:0x5665,0xE887B2:0x5666,0xE887B5:0x5667,0xE887B6:0x5668,
	0xE887B8:0x5669,0xE887B9:0x566A,0xE887BD:0x566B,0xE887BF:0x566C,0xE88880:0x566D,
	0xE88883:0x566E,0xE8888F:0x566F,0xE88893:0x5670,0xE88894:0x5671,0xE88899:0x5672,
	0xE8889A:0x5673,0xE8889D:0x5674,0xE888A1:0x5675,0xE888A2:0x5676,0xE888A8:0x5677,
	0xE888B2:0x5678,0xE888B4:0x5679,0xE888BA:0x567A,0xE88983:0x567B,0xE88984:0x567C,
	0xE88985:0x567D,0xE88986:0x567E,0xE8898B:0x5721,0xE8898E:0x5722,0xE8898F:0x5723,
	0xE88991:0x5724,0xE88996:0x5725,0xE8899C:0x5726,0xE889A0:0x5727,0xE889A3:0x5728,
	0xE889A7:0x5729,0xE889AD:0x572A,0xE889B4:0x572B,0xE889BB:0x572C,0xE889BD:0x572D,
	0xE889BF:0x572E,0xE88A80:0x572F,0xE88A81:0x5730,0xE88A83:0x5731,0xE88A84:0x5732,
	0xE88A87:0x5733,0xE88A89:0x5734,0xE88A8A:0x5735,0xE88A8E:0x5736,0xE88A91:0x5737,
	0xE88A94:0x5738,0xE88A96:0x5739,0xE88A98:0x573A,0xE88A9A:0x573B,0xE88A9B:0x573C,
	0xE88AA0:0x573D,0xE88AA1:0x573E,0xE88AA3:0x573F,0xE88AA4:0x5740,0xE88AA7:0x5741,
	0xE88AA8:0x5742,0xE88AA9:0x5743,0xE88AAA:0x5744,0xE88AAE:0x5745,0xE88AB0:0x5746,
	0xE88AB2:0x5747,0xE88AB4:0x5748,0xE88AB7:0x5749,0xE88ABA:0x574A,0xE88ABC:0x574B,
	0xE88ABE:0x574C,0xE88ABF:0x574D,0xE88B86:0x574E,0xE88B90:0x574F,0xE88B95:0x5750,
	0xE88B9A:0x5751,0xE88BA0:0x5752,0xE88BA2:0x5753,0xE88BA4:0x5754,0xE88BA8:0x5755,
	0xE88BAA:0x5756,0xE88BAD:0x5757,0xE88BAF:0x5758,0xE88BB6:0x5759,0xE88BB7:0x575A,
	0xE88BBD:0x575B,0xE88BBE:0x575C,0xE88C80:0x575D,0xE88C81:0x575E,0xE88C87:0x575F,
	0xE88C88:0x5760,0xE88C8A:0x5761,0xE88C8B:0x5762,0xE88D94:0x5763,0xE88C9B:0x5764,
	0xE88C9D:0x5765,0xE88C9E:0x5766,0xE88C9F:0x5767,0xE88CA1:0x5768,0xE88CA2:0x5769,
	0xE88CAC:0x576A,0xE88CAD:0x576B,0xE88CAE:0x576C,0xE88CB0:0x576D,0xE88CB3:0x576E,
	0xE88CB7:0x576F,0xE88CBA:0x5770,0xE88CBC:0x5771,0xE88CBD:0x5772,0xE88D82:0x5773,
	0xE88D83:0x5774,0xE88D84:0x5775,0xE88D87:0x5776,0xE88D8D:0x5777,0xE88D8E:0x5778,
	0xE88D91:0x5779,0xE88D95:0x577A,0xE88D96:0x577B,0xE88D97:0x577C,0xE88DB0:0x577D,
	0xE88DB8:0x577E,0xE88DBD:0x5821,0xE88DBF:0x5822,0xE88E80:0x5823,0xE88E82:0x5824,
	0xE88E84:0x5825,0xE88E86:0x5826,0xE88E8D:0x5827,0xE88E92:0x5828,0xE88E94:0x5829,
	0xE88E95:0x582A,0xE88E98:0x582B,0xE88E99:0x582C,0xE88E9B:0x582D,0xE88E9C:0x582E,
	0xE88E9D:0x582F,0xE88EA6:0x5830,0xE88EA7:0x5831,0xE88EA9:0x5832,0xE88EAC:0x5833,
	0xE88EBE:0x5834,0xE88EBF:0x5835,0xE88F80:0x5836,0xE88F87:0x5837,0xE88F89:0x5838,
	0xE88F8F:0x5839,0xE88F90:0x583A,0xE88F91:0x583B,0xE88F94:0x583C,0xE88F9D:0x583D,
	0xE88D93:0x583E,0xE88FA8:0x583F,0xE88FAA:0x5840,0xE88FB6:0x5841,0xE88FB8:0x5842,
	0xE88FB9:0x5843,0xE88FBC:0x5844,0xE89081:0x5845,0xE89086:0x5846,0xE8908A:0x5847,
	0xE8908F:0x5848,0xE89091:0x5849,0xE89095:0x584A,0xE89099:0x584B,0xE88EAD:0x584C,
	0xE890AF:0x584D,0xE890B9:0x584E,0xE89185:0x584F,0xE89187:0x5850,0xE89188:0x5851,
	0xE8918A:0x5852,0xE8918D:0x5853,0xE8918F:0x5854,0xE89191:0x5855,0xE89192:0x5856,
	0xE89196:0x5857,0xE89198:0x5858,0xE89199:0x5859,0xE8919A:0x585A,0xE8919C:0x585B,
	0xE891A0:0x585C,0xE891A4:0x585D,0xE891A5:0x585E,0xE891A7:0x585F,0xE891AA:0x5860,
	0xE891B0:0x5861,0xE891B3:0x5862,0xE891B4:0x5863,0xE891B6:0x5864,0xE891B8:0x5865,
	0xE891BC:0x5866,0xE891BD:0x5867,0xE89281:0x5868,0xE89285:0x5869,0xE89292:0x586A,
	0xE89293:0x586B,0xE89295:0x586C,0xE8929E:0x586D,0xE892A6:0x586E,0xE892A8:0x586F,
	0xE892A9:0x5870,0xE892AA:0x5871,0xE892AF:0x5872,0xE892B1:0x5873,0xE892B4:0x5874,
	0xE892BA:0x5875,0xE892BD:0x5876,0xE892BE:0x5877,0xE89380:0x5878,0xE89382:0x5879,
	0xE89387:0x587A,0xE89388:0x587B,0xE8938C:0x587C,0xE8938F:0x587D,0xE89393:0x587E,
	0xE8939C:0x5921,0xE893A7:0x5922,0xE893AA:0x5923,0xE893AF:0x5924,0xE893B0:0x5925,
	0xE893B1:0x5926,0xE893B2:0x5927,0xE893B7:0x5928,0xE894B2:0x5929,0xE893BA:0x592A,
	0xE893BB:0x592B,0xE893BD:0x592C,0xE89482:0x592D,0xE89483:0x592E,0xE89487:0x592F,
	0xE8948C:0x5930,0xE8948E:0x5931,0xE89490:0x5932,0xE8949C:0x5933,0xE8949E:0x5934,
	0xE894A2:0x5935,0xE894A3:0x5936,0xE894A4:0x5937,0xE894A5:0x5938,0xE894A7:0x5939,
	0xE894AA:0x593A,0xE894AB:0x593B,0xE894AF:0x593C,0xE894B3:0x593D,0xE894B4:0x593E,
	0xE894B6:0x593F,0xE894BF:0x5940,0xE89586:0x5941,0xE8958F:0x5942,0xE89590:0x5943,
	0xE89591:0x5944,0xE89592:0x5945,0xE89593:0x5946,0xE89596:0x5947,0xE89599:0x5948,
	0xE8959C:0x5949,0xE8959D:0x594A,0xE8959E:0x594B,0xE8959F:0x594C,0xE895A0:0x594D,
	0xE895A1:0x594E,0xE895A2:0x594F,0xE895A4:0x5950,0xE895AB:0x5951,0xE895AF:0x5952,
	0xE895B9:0x5953,0xE895BA:0x5954,0xE895BB:0x5955,0xE895BD:0x5956,0xE895BF:0x5957,
	0xE89681:0x5958,0xE89685:0x5959,0xE89686:0x595A,0xE89689:0x595B,0xE8968B:0x595C,
	0xE8968C:0x595D,0xE8968F:0x595E,0xE89693:0x595F,0xE89698:0x5960,0xE8969D:0x5961,
	0xE8969F:0x5962,0xE896A0:0x5963,0xE896A2:0x5964,0xE896A5:0x5965,0xE896A7:0x5966,
	0xE896B4:0x5967,0xE896B6:0x5968,0xE896B7:0x5969,0xE896B8:0x596A,0xE896BC:0x596B,
	0xE896BD:0x596C,0xE896BE:0x596D,0xE896BF:0x596E,0xE89782:0x596F,0xE89787:0x5970,
	0xE8978A:0x5971,0xE8978B:0x5972,0xE8978E:0x5973,0xE896AD:0x5974,0xE89798:0x5975,
	0xE8979A:0x5976,0xE8979F:0x5977,0xE897A0:0x5978,0xE897A6:0x5979,0xE897A8:0x597A,
	0xE897AD:0x597B,0xE897B3:0x597C,0xE897B6:0x597D,0xE897BC:0x597E,0xE897BF:0x5A21,
	0xE89880:0x5A22,0xE89884:0x5A23,0xE89885:0x5A24,0xE8988D:0x5A25,0xE8988E:0x5A26,
	0xE89890:0x5A27,0xE89891:0x5A28,0xE89892:0x5A29,0xE89898:0x5A2A,0xE89899:0x5A2B,
	0xE8989B:0x5A2C,0xE8989E:0x5A2D,0xE898A1:0x5A2E,0xE898A7:0x5A2F,0xE898A9:0x5A30,
	0xE898B6:0x5A31,0xE898B8:0x5A32,0xE898BA:0x5A33,0xE898BC:0x5A34,0xE898BD:0x5A35,
	0xE89980:0x5A36,0xE89982:0x5A37,0xE89986:0x5A38,0xE89992:0x5A39,0xE89993:0x5A3A,
	0xE89996:0x5A3B,0xE89997:0x5A3C,0xE89998:0x5A3D,0xE89999:0x5A3E,0xE8999D:0x5A3F,
	0xE899A0:0x5A40,0xE899A1:0x5A41,0xE899A2:0x5A42,0xE899A3:0x5A43,0xE899A4:0x5A44,
	0xE899A9:0x5A45,0xE899AC:0x5A46,0xE899AF:0x5A47,0xE899B5:0x5A48,0xE899B6:0x5A49,
	0xE899B7:0x5A4A,0xE899BA:0x5A4B,0xE89A8D:0x5A4C,0xE89A91:0x5A4D,0xE89A96:0x5A4E,
	0xE89A98:0x5A4F,0xE89A9A:0x5A50,0xE89A9C:0x5A51,0xE89AA1:0x5A52,0xE89AA6:0x5A53,
	0xE89AA7:0x5A54,0xE89AA8:0x5A55,0xE89AAD:0x5A56,0xE89AB1:0x5A57,0xE89AB3:0x5A58,
	0xE89AB4:0x5A59,0xE89AB5:0x5A5A,0xE89AB7:0x5A5B,0xE89AB8:0x5A5C,0xE89AB9:0x5A5D,
	0xE89ABF:0x5A5E,0xE89B80:0x5A5F,0xE89B81:0x5A60,0xE89B83:0x5A61,0xE89B85:0x5A62,
	0xE89B91:0x5A63,0xE89B92:0x5A64,0xE89B95:0x5A65,0xE89B97:0x5A66,0xE89B9A:0x5A67,
	0xE89B9C:0x5A68,0xE89BA0:0x5A69,0xE89BA3:0x5A6A,0xE89BA5:0x5A6B,0xE89BA7:0x5A6C,
	0xE89A88:0x5A6D,0xE89BBA:0x5A6E,0xE89BBC:0x5A6F,0xE89BBD:0x5A70,0xE89C84:0x5A71,
	0xE89C85:0x5A72,0xE89C87:0x5A73,0xE89C8B:0x5A74,0xE89C8E:0x5A75,0xE89C8F:0x5A76,
	0xE89C90:0x5A77,0xE89C93:0x5A78,0xE89C94:0x5A79,0xE89C99:0x5A7A,0xE89C9E:0x5A7B,
	0xE89C9F:0x5A7C,0xE89CA1:0x5A7D,0xE89CA3:0x5A7E,0xE89CA8:0x5B21,0xE89CAE:0x5B22,
	0xE89CAF:0x5B23,0xE89CB1:0x5B24,0xE89CB2:0x5B25,0xE89CB9:0x5B26,0xE89CBA:0x5B27,
	0xE89CBC:0x5B28,0xE89CBD:0x5B29,0xE89CBE:0x5B2A,0xE89D80:0x5B2B,0xE89D83:0x5B2C,
	0xE89D85:0x5B2D,0xE89D8D:0x5B2E,0xE89D98:0x5B2F,0xE89D9D:0x5B30,0xE89DA1:0x5B31,
	0xE89DA4:0x5B32,0xE89DA5:0x5B33,0xE89DAF:0x5B34,0xE89DB1:0x5B35,0xE89DB2:0x5B36,
	0xE89DBB:0x5B37,0xE89E83:0x5B38,0xE89E84:0x5B39,0xE89E85:0x5B3A,0xE89E86:0x5B3B,
	0xE89E87:0x5B3C,0xE89E88:0x5B3D,0xE89E89:0x5B3E,0xE89E8B:0x5B3F,0xE89E8C:0x5B40,
	0xE89E90:0x5B41,0xE89E93:0x5B42,0xE89E95:0x5B43,0xE89E97:0x5B44,0xE89E98:0x5B45,
	0xE89E99:0x5B46,0xE89E9E:0x5B47,0xE89EA0:0x5B48,0xE89EA3:0x5B49,0xE89EA7:0x5B4A,
	0xE89EAC:0x5B4B,0xE89EAD:0x5B4C,0xE89EAE:0x5B4D,0xE89EB1:0x5B4E,0xE89EB5:0x5B4F,
	0xE89EBE:0x5B50,0xE89EBF:0x5B51,0xE89F81:0x5B52,0xE89F88:0x5B53,0xE89F89:0x5B54,
	0xE89F8A:0x5B55,0xE89F8E:0x5B56,0xE89F95:0x5B57,0xE89F96:0x5B58,0xE89F99:0x5B59,
	0xE89F9A:0x5B5A,0xE89F9C:0x5B5B,0xE89F9F:0x5B5C,0xE89FA2:0x5B5D,0xE89FA3:0x5B5E,
	0xE89FA4:0x5B5F,0xE89FAA:0x5B60,0xE89FAB:0x5B61,0xE89FAD:0x5B62,0xE89FB1:0x5B63,
	0xE89FB3:0x5B64,0xE89FB8:0x5B65,0xE89FBA:0x5B66,0xE89FBF:0x5B67,0xE8A081:0x5B68,
	0xE8A083:0x5B69,0xE8A086:0x5B6A,0xE8A089:0x5B6B,0xE8A08A:0x5B6C,0xE8A08B:0x5B6D,
	0xE8A090:0x5B6E,0xE8A099:0x5B6F,0xE8A092:0x5B70,0xE8A093:0x5B71,0xE8A094:0x5B72,
	0xE8A098:0x5B73,0xE8A09A:0x5B74,0xE8A09B:0x5B75,0xE8A09C:0x5B76,0xE8A09E:0x5B77,
	0xE8A09F:0x5B78,0xE8A0A8:0x5B79,0xE8A0AD:0x5B7A,0xE8A0AE:0x5B7B,0xE8A0B0:0x5B7C,
	0xE8A0B2:0x5B7D,0xE8A0B5:0x5B7E,0xE8A0BA:0x5C21,0xE8A0BC:0x5C22,0xE8A181:0x5C23,
	0xE8A183:0x5C24,0xE8A185:0x5C25,0xE8A188:0x5C26,0xE8A189:0x5C27,0xE8A18A:0x5C28,
	0xE8A18B:0x5C29,0xE8A18E:0x5C2A,0xE8A191:0x5C2B,0xE8A195:0x5C2C,0xE8A196:0x5C2D,
	0xE8A198:0x5C2E,0xE8A19A:0x5C2F,0xE8A19C:0x5C30,0xE8A19F:0x5C31,0xE8A1A0:0x5C32,
	0xE8A1A4:0x5C33,0xE8A1A9:0x5C34,0xE8A1B1:0x5C35,0xE8A1B9:0x5C36,0xE8A1BB:0x5C37,
	0xE8A280:0x5C38,0xE8A298:0x5C39,0xE8A29A:0x5C3A,0xE8A29B:0x5C3B,0xE8A29C:0x5C3C,
	0xE8A29F:0x5C3D,0xE8A2A0:0x5C3E,0xE8A2A8:0x5C3F,0xE8A2AA:0x5C40,0xE8A2BA:0x5C41,
	0xE8A2BD:0x5C42,0xE8A2BE:0x5C43,0xE8A380:0x5C44,0xE8A38A:0x5C45,0xE8A38B:0x5C46,
	0xE8A38C:0x5C47,0xE8A38D:0x5C48,0xE8A38E:0x5C49,0xE8A391:0x5C4A,0xE8A392:0x5C4B,
	0xE8A393:0x5C4C,0xE8A39B:0x5C4D,0xE8A39E:0x5C4E,0xE8A3A7:0x5C4F,0xE8A3AF:0x5C50,
	0xE8A3B0:0x5C51,0xE8A3B1:0x5C52,0xE8A3B5:0x5C53,0xE8A3B7:0x5C54,0xE8A481:0x5C55,
	0xE8A486:0x5C56,0xE8A48D:0x5C57,0xE8A48E:0x5C58,0xE8A48F:0x5C59,0xE8A495:0x5C5A,
	0xE8A496:0x5C5B,0xE8A498:0x5C5C,0xE8A499:0x5C5D,0xE8A49A:0x5C5E,0xE8A49C:0x5C5F,
	0xE8A4A0:0x5C60,0xE8A4A6:0x5C61,0xE8A4A7:0x5C62,0xE8A4A8:0x5C63,0xE8A4B0:0x5C64,
	0xE8A4B1:0x5C65,0xE8A4B2:0x5C66,0xE8A4B5:0x5C67,0xE8A4B9:0x5C68,0xE8A4BA:0x5C69,
	0xE8A4BE:0x5C6A,0xE8A580:0x5C6B,0xE8A582:0x5C6C,0xE8A585:0x5C6D,0xE8A586:0x5C6E,
	0xE8A589:0x5C6F,0xE8A58F:0x5C70,0xE8A592:0x5C71,0xE8A597:0x5C72,0xE8A59A:0x5C73,
	0xE8A59B:0x5C74,0xE8A59C:0x5C75,0xE8A5A1:0x5C76,0xE8A5A2:0x5C77,0xE8A5A3:0x5C78,
	0xE8A5AB:0x5C79,0xE8A5AE:0x5C7A,0xE8A5B0:0x5C7B,0xE8A5B3:0x5C7C,0xE8A5B5:0x5C7D,
	0xE8A5BA:0x5C7E,0xE8A5BB:0x5D21,0xE8A5BC:0x5D22,0xE8A5BD:0x5D23,0xE8A689:0x5D24,
	0xE8A68D:0x5D25,0xE8A690:0x5D26,0xE8A694:0x5D27,0xE8A695:0x5D28,0xE8A69B:0x5D29,
	0xE8A69C:0x5D2A,0xE8A69F:0x5D2B,0xE8A6A0:0x5D2C,0xE8A6A5:0x5D2D,0xE8A6B0:0x5D2E,
	0xE8A6B4:0x5D2F,0xE8A6B5:0x5D30,0xE8A6B6:0x5D31,0xE8A6B7:0x5D32,0xE8A6BC:0x5D33,
	0xE8A794:0x5D34,0xE8A795:0x5D35,0xE8A796:0x5D36,0xE8A797:0x5D37,0xE8A798:0x5D38,
	0xE8A7A5:0x5D39,0xE8A7A9:0x5D3A,0xE8A7AB:0x5D3B,0xE8A7AD:0x5D3C,0xE8A7B1:0x5D3D,
	0xE8A7B3:0x5D3E,0xE8A7B6:0x5D3F,0xE8A7B9:0x5D40,0xE8A7BD:0x5D41,0xE8A7BF:0x5D42,
	0xE8A884:0x5D43,0xE8A885:0x5D44,0xE8A887:0x5D45,0xE8A88F:0x5D46,0xE8A891:0x5D47,
	0xE8A892:0x5D48,0xE8A894:0x5D49,0xE8A895:0x5D4A,0xE8A89E:0x5D4B,0xE8A8A0:0x5D4C,
	0xE8A8A2:0x5D4D,0xE8A8A4:0x5D4E,0xE8A8A6:0x5D4F,0xE8A8AB:0x5D50,0xE8A8AC:0x5D51,
	0xE8A8AF:0x5D52,0xE8A8B5:0x5D53,0xE8A8B7:0x5D54,0xE8A8BD:0x5D55,0xE8A8BE:0x5D56,
	0xE8A980:0x5D57,0xE8A983:0x5D58,0xE8A985:0x5D59,0xE8A987:0x5D5A,0xE8A989:0x5D5B,
	0xE8A98D:0x5D5C,0xE8A98E:0x5D5D,0xE8A993:0x5D5E,0xE8A996:0x5D5F,0xE8A997:0x5D60,
	0xE8A998:0x5D61,0xE8A99C:0x5D62,0xE8A99D:0x5D63,0xE8A9A1:0x5D64,0xE8A9A5:0x5D65,
	0xE8A9A7:0x5D66,0xE8A9B5:0x5D67,0xE8A9B6:0x5D68,0xE8A9B7:0x5D69,0xE8A9B9:0x5D6A,
	0xE8A9BA:0x5D6B,0xE8A9BB:0x5D6C,0xE8A9BE:0x5D6D,0xE8A9BF:0x5D6E,0xE8AA80:0x5D6F,
	0xE8AA83:0x5D70,0xE8AA86:0x5D71,0xE8AA8B:0x5D72,0xE8AA8F:0x5D73,0xE8AA90:0x5D74,
	0xE8AA92:0x5D75,0xE8AA96:0x5D76,0xE8AA97:0x5D77,0xE8AA99:0x5D78,0xE8AA9F:0x5D79,
	0xE8AAA7:0x5D7A,0xE8AAA9:0x5D7B,0xE8AAAE:0x5D7C,0xE8AAAF:0x5D7D,0xE8AAB3:0x5D7E,
	0xE8AAB6:0x5E21,0xE8AAB7:0x5E22,0xE8AABB:0x5E23,0xE8AABE:0x5E24,0xE8AB83:0x5E25,
	0xE8AB86:0x5E26,0xE8AB88:0x5E27,0xE8AB89:0x5E28,0xE8AB8A:0x5E29,0xE8AB91:0x5E2A,
	0xE8AB93:0x5E2B,0xE8AB94:0x5E2C,0xE8AB95:0x5E2D,0xE8AB97:0x5E2E,0xE8AB9D:0x5E2F,
	0xE8AB9F:0x5E30,0xE8ABAC:0x5E31,0xE8ABB0:0x5E32,0xE8ABB4:0x5E33,0xE8ABB5:0x5E34,
	0xE8ABB6:0x5E35,0xE8ABBC:0x5E36,0xE8ABBF:0x5E37,0xE8AC85:0x5E38,0xE8AC86:0x5E39,
	0xE8AC8B:0x5E3A,0xE8AC91:0x5E3B,0xE8AC9C:0x5E3C,0xE8AC9E:0x5E3D,0xE8AC9F:0x5E3E,
	0xE8AC8A:0x5E3F,0xE8ACAD:0x5E40,0xE8ACB0:0x5E41,0xE8ACB7:0x5E42,0xE8ACBC:0x5E43,
	0xE8AD82:0x5E44,0xE8AD83:0x5E45,0xE8AD84:0x5E46,0xE8AD85:0x5E47,0xE8AD86:0x5E48,
	0xE8AD88:0x5E49,0xE8AD92:0x5E4A,0xE8AD93:0x5E4B,0xE8AD94:0x5E4C,0xE8AD99:0x5E4D,
	0xE8AD8D:0x5E4E,0xE8AD9E:0x5E4F,0xE8ADA3:0x5E50,0xE8ADAD:0x5E51,0xE8ADB6:0x5E52,
	0xE8ADB8:0x5E53,0xE8ADB9:0x5E54,0xE8ADBC:0x5E55,0xE8ADBE:0x5E56,0xE8AE81:0x5E57,
	0xE8AE84:0x5E58,0xE8AE85:0x5E59,0xE8AE8B:0x5E5A,0xE8AE8D:0x5E5B,0xE8AE8F:0x5E5C,
	0xE8AE94:0x5E5D,0xE8AE95:0x5E5E,0xE8AE9C:0x5E5F,0xE8AE9E:0x5E60,0xE8AE9F:0x5E61,
	0xE8B0B8:0x5E62,0xE8B0B9:0x5E63,0xE8B0BD:0x5E64,0xE8B0BE:0x5E65,0xE8B185:0x5E66,
	0xE8B187:0x5E67,0xE8B189:0x5E68,0xE8B18B:0x5E69,0xE8B18F:0x5E6A,0xE8B191:0x5E6B,
	0xE8B193:0x5E6C,0xE8B194:0x5E6D,0xE8B197:0x5E6E,0xE8B198:0x5E6F,0xE8B19B:0x5E70,
	0xE8B19D:0x5E71,0xE8B199:0x5E72,0xE8B1A3:0x5E73,0xE8B1A4:0x5E74,0xE8B1A6:0x5E75,
	0xE8B1A8:0x5E76,0xE8B1A9:0x5E77,0xE8B1AD:0x5E78,0xE8B1B3:0x5E79,0xE8B1B5:0x5E7A,
	0xE8B1B6:0x5E7B,0xE8B1BB:0x5E7C,0xE8B1BE:0x5E7D,0xE8B286:0x5E7E,0xE8B287:0x5F21,
	0xE8B28B:0x5F22,0xE8B290:0x5F23,0xE8B292:0x5F24,0xE8B293:0x5F25,0xE8B299:0x5F26,
	0xE8B29B:0x5F27,0xE8B29C:0x5F28,0xE8B2A4:0x5F29,0xE8B2B9:0x5F2A,0xE8B2BA:0x5F2B,
	0xE8B385:0x5F2C,0xE8B386:0x5F2D,0xE8B389:0x5F2E,0xE8B38B:0x5F2F,0xE8B38F:0x5F30,
	0xE8B396:0x5F31,0xE8B395:0x5F32,0xE8B399:0x5F33,0xE8B39D:0x5F34,0xE8B3A1:0x5F35,
	0xE8B3A8:0x5F36,0xE8B3AC:0x5F37,0xE8B3AF:0x5F38,0xE8B3B0:0x5F39,0xE8B3B2:0x5F3A,
	0xE8B3B5:0x5F3B,0xE8B3B7:0x5F3C,0xE8B3B8:0x5F3D,0xE8B3BE:0x5F3E,0xE8B3BF:0x5F3F,
	0xE8B481:0x5F40,0xE8B483:0x5F41,0xE8B489:0x5F42,0xE8B492:0x5F43,0xE8B497:0x5F44,
	0xE8B49B:0x5F45,0xE8B5A5:0x5F46,0xE8B5A9:0x5F47,0xE8B5AC:0x5F48,0xE8B5AE:0x5F49,
	0xE8B5BF:0x5F4A,0xE8B682:0x5F4B,0xE8B684:0x5F4C,0xE8B688:0x5F4D,0xE8B68D:0x5F4E,
	0xE8B690:0x5F4F,0xE8B691:0x5F50,0xE8B695:0x5F51,0xE8B69E:0x5F52,0xE8B69F:0x5F53,
	0xE8B6A0:0x5F54,0xE8B6A6:0x5F55,0xE8B6AB:0x5F56,0xE8B6AC:0x5F57,0xE8B6AF:0x5F58,
	0xE8B6B2:0x5F59,0xE8B6B5:0x5F5A,0xE8B6B7:0x5F5B,0xE8B6B9:0x5F5C,0xE8B6BB:0x5F5D,
	0xE8B780:0x5F5E,0xE8B785:0x5F5F,0xE8B786:0x5F60,0xE8B787:0x5F61,0xE8B788:0x5F62,
	0xE8B78A:0x5F63,0xE8B78E:0x5F64,0xE8B791:0x5F65,0xE8B794:0x5F66,0xE8B795:0x5F67,
	0xE8B797:0x5F68,0xE8B799:0x5F69,0xE8B7A4:0x5F6A,0xE8B7A5:0x5F6B,0xE8B7A7:0x5F6C,
	0xE8B7AC:0x5F6D,0xE8B7B0:0x5F6E,0xE8B6BC:0x5F6F,0xE8B7B1:0x5F70,0xE8B7B2:0x5F71,
	0xE8B7B4:0x5F72,0xE8B7BD:0x5F73,0xE8B881:0x5F74,0xE8B884:0x5F75,0xE8B885:0x5F76,
	0xE8B886:0x5F77,0xE8B88B:0x5F78,0xE8B891:0x5F79,0xE8B894:0x5F7A,0xE8B896:0x5F7B,
	0xE8B8A0:0x5F7C,0xE8B8A1:0x5F7D,0xE8B8A2:0x5F7E,0xE8B8A3:0x6021,0xE8B8A6:0x6022,
	0xE8B8A7:0x6023,0xE8B8B1:0x6024,0xE8B8B3:0x6025,0xE8B8B6:0x6026,0xE8B8B7:0x6027,
	0xE8B8B8:0x6028,0xE8B8B9:0x6029,0xE8B8BD:0x602A,0xE8B980:0x602B,0xE8B981:0x602C,
	0xE8B98B:0x602D,0xE8B98D:0x602E,0xE8B98E:0x602F,0xE8B98F:0x6030,0xE8B994:0x6031,
	0xE8B99B:0x6032,0xE8B99C:0x6033,0xE8B99D:0x6034,0xE8B99E:0x6035,0xE8B9A1:0x6036,
	0xE8B9A2:0x6037,0xE8B9A9:0x6038,0xE8B9AC:0x6039,0xE8B9AD:0x603A,0xE8B9AF:0x603B,
	0xE8B9B0:0x603C,0xE8B9B1:0x603D,0xE8B9B9:0x603E,0xE8B9BA:0x603F,0xE8B9BB:0x6040,
	0xE8BA82:0x6041,0xE8BA83:0x6042,0xE8BA89:0x6043,0xE8BA90:0x6044,0xE8BA92:0x6045,
	0xE8BA95:0x6046,0xE8BA9A:0x6047,0xE8BA9B:0x6048,0xE8BA9D:0x6049,0xE8BA9E:0x604A,
	0xE8BAA2:0x604B,0xE8BAA7:0x604C,0xE8BAA9:0x604D,0xE8BAAD:0x604E,0xE8BAAE:0x604F,
	0xE8BAB3:0x6050,0xE8BAB5:0x6051,0xE8BABA:0x6052,0xE8BABB:0x6053,0xE8BB80:0x6054,
	0xE8BB81:0x6055,0xE8BB83:0x6056,0xE8BB84:0x6057,0xE8BB87:0x6058,0xE8BB8F:0x6059,
	0xE8BB91:0x605A,0xE8BB94:0x605B,0xE8BB9C:0x605C,0xE8BBA8:0x605D,0xE8BBAE:0x605E,
	0xE8BBB0:0x605F,0xE8BBB1:0x6060,0xE8BBB7:0x6061,0xE8BBB9:0x6062,0xE8BBBA:0x6063,
	0xE8BBAD:0x6064,0xE8BC80:0x6065,0xE8BC82:0x6066,0xE8BC87:0x6067,0xE8BC88:0x6068,
	0xE8BC8F:0x6069,0xE8BC90:0x606A,0xE8BC96:0x606B,0xE8BC97:0x606C,0xE8BC98:0x606D,
	0xE8BC9E:0x606E,0xE8BCA0:0x606F,0xE8BCA1:0x6070,0xE8BCA3:0x6071,0xE8BCA5:0x6072,
	0xE8BCA7:0x6073,0xE8BCA8:0x6074,0xE8BCAC:0x6075,0xE8BCAD:0x6076,0xE8BCAE:0x6077,
	0xE8BCB4:0x6078,0xE8BCB5:0x6079,0xE8BCB6:0x607A,0xE8BCB7:0x607B,0xE8BCBA:0x607C,
	0xE8BD80:0x607D,0xE8BD81:0x607E,0xE8BD83:0x6121,0xE8BD87:0x6122,0xE8BD8F:0x6123,
	0xE8BD91:0x6124,0xE8BD92:0x6125,0xE8BD93:0x6126,0xE8BD94:0x6127,0xE8BD95:0x6128,
	0xE8BD98:0x6129,0xE8BD9D:0x612A,0xE8BD9E:0x612B,0xE8BDA5:0x612C,0xE8BE9D:0x612D,
	0xE8BEA0:0x612E,0xE8BEA1:0x612F,0xE8BEA4:0x6130,0xE8BEA5:0x6131,0xE8BEA6:0x6132,
	0xE8BEB5:0x6133,0xE8BEB6:0x6134,0xE8BEB8:0x6135,0xE8BEBE:0x6136,0xE8BF80:0x6137,
	0xE8BF81:0x6138,0xE8BF86:0x6139,0xE8BF8A:0x613A,0xE8BF8B:0x613B,0xE8BF8D:0x613C,
	0xE8BF90:0x613D,0xE8BF92:0x613E,0xE8BF93:0x613F,0xE8BF95:0x6140,0xE8BFA0:0x6141,
	0xE8BFA3:0x6142,0xE8BFA4:0x6143,0xE8BFA8:0x6144,0xE8BFAE:0x6145,0xE8BFB1:0x6146,
	0xE8BFB5:0x6147,0xE8BFB6:0x6148,0xE8BFBB:0x6149,0xE8BFBE:0x614A,0xE98082:0x614B,
	0xE98084:0x614C,0xE98088:0x614D,0xE9808C:0x614E,0xE98098:0x614F,0xE9809B:0x6150,
	0xE980A8:0x6151,0xE980A9:0x6152,0xE980AF:0x6153,0xE980AA:0x6154,0xE980AC:0x6155,
	0xE980AD:0x6156,0xE980B3:0x6157,0xE980B4:0x6158,0xE980B7:0x6159,0xE980BF:0x615A,
	0xE98183:0x615B,0xE98184:0x615C,0xE9818C:0x615D,0xE9819B:0x615E,0xE9819D:0x615F,
	0xE981A2:0x6160,0xE981A6:0x6161,0xE981A7:0x6162,0xE981AC:0x6163,0xE981B0:0x6164,
	0xE981B4:0x6165,0xE981B9:0x6166,0xE98285:0x6167,0xE98288:0x6168,0xE9828B:0x6169,
	0xE9828C:0x616A,0xE9828E:0x616B,0xE98290:0x616C,0xE98295:0x616D,0xE98297:0x616E,
	0xE98298:0x616F,0xE98299:0x6170,0xE9829B:0x6171,0xE982A0:0x6172,0xE982A1:0x6173,
	0xE982A2:0x6174,0xE982A5:0x6175,0xE982B0:0x6176,0xE982B2:0x6177,0xE982B3:0x6178,
	0xE982B4:0x6179,0xE982B6:0x617A,0xE982BD:0x617B,0xE9838C:0x617C,0xE982BE:0x617D,
	0xE98383:0x617E,0xE98384:0x6221,0xE98385:0x6222,0xE98387:0x6223,0xE98388:0x6224,
	0xE98395:0x6225,0xE98397:0x6226,0xE98398:0x6227,0xE98399:0x6228,0xE9839C:0x6229,
	0xE9839D:0x622A,0xE9839F:0x622B,0xE983A5:0x622C,0xE98392:0x622D,0xE983B6:0x622E,
	0xE983AB:0x622F,0xE983AF:0x6230,0xE983B0:0x6231,0xE983B4:0x6232,0xE983BE:0x6233,
	0xE983BF:0x6234,0xE98480:0x6235,0xE98484:0x6236,0xE98485:0x6237,0xE98486:0x6238,
	0xE98488:0x6239,0xE9848D:0x623A,0xE98490:0x623B,0xE98494:0x623C,0xE98496:0x623D,
	0xE98497:0x623E,0xE98498:0x623F,0xE9849A:0x6240,0xE9849C:0x6241,0xE9849E:0x6242,
	0xE984A0:0x6243,0xE984A5:0x6244,0xE984A2:0x6245,0xE984A3:0x6246,0xE984A7:0x6247,
	0xE984A9:0x6248,0xE984AE:0x6249,0xE984AF:0x624A,0xE984B1:0x624B,0xE984B4:0x624C,
	0xE984B6:0x624D,0xE984B7:0x624E,0xE984B9:0x624F,0xE984BA:0x6250,0xE984BC:0x6251,
	0xE984BD:0x6252,0xE98583:0x6253,0xE98587:0x6254,0xE98588:0x6255,0xE9858F:0x6256,
	0xE98593:0x6257,0xE98597:0x6258,0xE98599:0x6259,0xE9859A:0x625A,0xE9859B:0x625B,
	0xE985A1:0x625C,0xE985A4:0x625D,0xE985A7:0x625E,0xE985AD:0x625F,0xE985B4:0x6260,
	0xE985B9:0x6261,0xE985BA:0x6262,0xE985BB:0x6263,0xE98681:0x6264,0xE98683:0x6265,
	0xE98685:0x6266,0xE98686:0x6267,0xE9868A:0x6268,0xE9868E:0x6269,0xE98691:0x626A,
	0xE98693:0x626B,0xE98694:0x626C,0xE98695:0x626D,0xE98698:0x626E,0xE9869E:0x626F,
	0xE986A1:0x6270,0xE986A6:0x6271,0xE986A8:0x6272,0xE986AC:0x6273,0xE986AD:0x6274,
	0xE986AE:0x6275,0xE986B0:0x6276,0xE986B1:0x6277,0xE986B2:0x6278,0xE986B3:0x6279,
	0xE986B6:0x627A,0xE986BB:0x627B,0xE986BC:0x627C,0xE986BD:0x627D,0xE986BF:0x627E,
	0xE98782:0x6321,0xE98783:0x6322,0xE98785:0x6323,0xE98793:0x6324,0xE98794:0x6325,
	0xE98797:0x6326,0xE98799:0x6327,0xE9879A:0x6328,0xE9879E:0x6329,0xE987A4:0x632A,
	0xE987A5:0x632B,0xE987A9:0x632C,0xE987AA:0x632D,0xE987AC:0x632E,0xE987AD:0x632F,
	0xE987AE:0x6330,0xE987AF:0x6331,0xE987B0:0x6332,0xE987B1:0x6333,0xE987B7:0x6334,
	0xE987B9:0x6335,0xE987BB:0x6336,0xE987BD:0x6337,0xE98880:0x6338,0xE98881:0x6339,
	0xE98884:0x633A,0xE98885:0x633B,0xE98886:0x633C,0xE98887:0x633D,0xE98889:0x633E,
	0xE9888A:0x633F,0xE9888C:0x6340,0xE98890:0x6341,0xE98892:0x6342,0xE98893:0x6343,
	0xE98896:0x6344,0xE98898:0x6345,0xE9889C:0x6346,0xE9889D:0x6347,0xE988A3:0x6348,
	0xE988A4:0x6349,0xE988A5:0x634A,0xE988A6:0x634B,0xE988A8:0x634C,0xE988AE:0x634D,
	0xE988AF:0x634E,0xE988B0:0x634F,0xE988B3:0x6350,0xE988B5:0x6351,0xE988B6:0x6352,
	0xE988B8:0x6353,0xE988B9:0x6354,0xE988BA:0x6355,0xE988BC:0x6356,0xE988BE:0x6357,
	0xE98980:0x6358,0xE98982:0x6359,0xE98983:0x635A,0xE98986:0x635B,0xE98987:0x635C,
	0xE9898A:0x635D,0xE9898D:0x635E,0xE9898E:0x635F,0xE9898F:0x6360,0xE98991:0x6361,
	0xE98998:0x6362,0xE98999:0x6363,0xE9899C:0x6364,0xE9899D:0x6365,0xE989A0:0x6366,
	0xE989A1:0x6367,0xE989A5:0x6368,0xE989A7:0x6369,0xE989A8:0x636A,0xE989A9:0x636B,
	0xE989AE:0x636C,0xE989AF:0x636D,0xE989B0:0x636E,0xE989B5:0x636F,0xE989B6:0x6370,
	0xE989B7:0x6371,0xE989B8:0x6372,0xE989B9:0x6373,0xE989BB:0x6374,0xE989BC:0x6375,
	0xE989BD:0x6376,0xE989BF:0x6377,0xE98A88:0x6378,0xE98A89:0x6379,0xE98A8A:0x637A,
	0xE98A8D:0x637B,0xE98A8E:0x637C,0xE98A92:0x637D,0xE98A97:0x637E,0xE98A99:0x6421,
	0xE98A9F:0x6422,0xE98AA0:0x6423,0xE98AA4:0x6424,0xE98AA5:0x6425,0xE98AA7:0x6426,
	0xE98AA8:0x6427,0xE98AAB:0x6428,0xE98AAF:0x6429,0xE98AB2:0x642A,0xE98AB6:0x642B,
	0xE98AB8:0x642C,0xE98ABA:0x642D,0xE98ABB:0x642E,0xE98ABC:0x642F,0xE98ABD:0x6430,
	0xE98ABF:0x6431,0xE98B80:0x6432,0xE98B81:0x6433,0xE98B82:0x6434,0xE98B83:0x6435,
	0xE98B85:0x6436,0xE98B86:0x6437,0xE98B87:0x6438,0xE98B88:0x6439,0xE98B8B:0x643A,
	0xE98B8C:0x643B,0xE98B8D:0x643C,0xE98B8E:0x643D,0xE98B90:0x643E,0xE98B93:0x643F,
	0xE98B95:0x6440,0xE98B97:0x6441,0xE98B98:0x6442,0xE98B99:0x6443,0xE98B9C:0x6444,
	0xE98B9D:0x6445,0xE98B9F:0x6446,0xE98BA0:0x6447,0xE98BA1:0x6448,0xE98BA3:0x6449,
	0xE98BA5:0x644A,0xE98BA7:0x644B,0xE98BA8:0x644C,0xE98BAC:0x644D,0xE98BAE:0x644E,
	0xE98BB0:0x644F,0xE98BB9:0x6450,0xE98BBB:0x6451,0xE98BBF:0x6452,0xE98C80:0x6453,
	0xE98C82:0x6454,0xE98C88:0x6455,0xE98C8D:0x6456,0xE98C91:0x6457,0xE98C94:0x6458,
	0xE98C95:0x6459,0xE98C9C:0x645A,0xE98C9D:0x645B,0xE98C9E:0x645C,0xE98C9F:0x645D,
	0xE98CA1:0x645E,0xE98CA4:0x645F,0xE98CA5:0x6460,0xE98CA7:0x6461,0xE98CA9:0x6462,
	0xE98CAA:0x6463,0xE98CB3:0x6464,0xE98CB4:0x6465,0xE98CB6:0x6466,0xE98CB7:0x6467,
	0xE98D87:0x6468,0xE98D88:0x6469,0xE98D89:0x646A,0xE98D90:0x646B,0xE98D91:0x646C,
	0xE98D92:0x646D,0xE98D95:0x646E,0xE98D97:0x646F,0xE98D98:0x6470,0xE98D9A:0x6471,
	0xE98D9E:0x6472,0xE98DA4:0x6473,0xE98DA5:0x6474,0xE98DA7:0x6475,0xE98DA9:0x6476,
	0xE98DAA:0x6477,0xE98DAD:0x6478,0xE98DAF:0x6479,0xE98DB0:0x647A,0xE98DB1:0x647B,
	0xE98DB3:0x647C,0xE98DB4:0x647D,0xE98DB6:0x647E,0xE98DBA:0x6521,0xE98DBD:0x6522,
	0xE98DBF:0x6523,0xE98E80:0x6524,0xE98E81:0x6525,0xE98E82:0x6526,0xE98E88:0x6527,
	0xE98E8A:0x6528,0xE98E8B:0x6529,0xE98E8D:0x652A,0xE98E8F:0x652B,0xE98E92:0x652C,
	0xE98E95:0x652D,0xE98E98:0x652E,0xE98E9B:0x652F,0xE98E9E:0x6530,0xE98EA1:0x6531,
	0xE98EA3:0x6532,0xE98EA4:0x6533,0xE98EA6:0x6534,0xE98EA8:0x6535,0xE98EAB:0x6536,
	0xE98EB4:0x6537,0xE98EB5:0x6538,0xE98EB6:0x6539,0xE98EBA:0x653A,0xE98EA9:0x653B,
	0xE98F81:0x653C,0xE98F84:0x653D,0xE98F85:0x653E,0xE98F86:0x653F,0xE98F87:0x6540,
	0xE98F89:0x6541,0xE98F8A:0x6542,0xE98F8B:0x6543,0xE98F8C:0x6544,0xE98F8D:0x6545,
	0xE98F93:0x6546,0xE98F99:0x6547,0xE98F9C:0x6548,0xE98F9E:0x6549,0xE98F9F:0x654A,
	0xE98FA2:0x654B,0xE98FA6:0x654C,0xE98FA7:0x654D,0xE98FB9:0x654E,0xE98FB7:0x654F,
	0xE98FB8:0x6550,0xE98FBA:0x6551,0xE98FBB:0x6552,0xE98FBD:0x6553,0xE99081:0x6554,
	0xE99082:0x6555,0xE99084:0x6556,0xE99088:0x6557,0xE99089:0x6558,0xE9908D:0x6559,
	0xE9908E:0x655A,0xE9908F:0x655B,0xE99095:0x655C,0xE99096:0x655D,0xE99097:0x655E,
	0xE9909F:0x655F,0xE990AE:0x6560,0xE990AF:0x6561,0xE990B1:0x6562,0xE990B2:0x6563,
	0xE990B3:0x6564,0xE990B4:0x6565,0xE990BB:0x6566,0xE990BF:0x6567,0xE990BD:0x6568,
	0xE99183:0x6569,0xE99185:0x656A,0xE99188:0x656B,0xE9918A:0x656C,0xE9918C:0x656D,
	0xE99195:0x656E,0xE99199:0x656F,0xE9919C:0x6570,0xE9919F:0x6571,0xE991A1:0x6572,
	0xE991A3:0x6573,0xE991A8:0x6574,0xE991AB:0x6575,0xE991AD:0x6576,0xE991AE:0x6577,
	0xE991AF:0x6578,0xE991B1:0x6579,0xE991B2:0x657A,0xE99284:0x657B,0xE99283:0x657C,
	0xE995B8:0x657D,0xE995B9:0x657E,0xE995BE:0x6621,0xE99684:0x6622,0xE99688:0x6623,
	0xE9968C:0x6624,0xE9968D:0x6625,0xE9968E:0x6626,0xE9969D:0x6627,0xE9969E:0x6628,
	0xE9969F:0x6629,0xE996A1:0x662A,0xE996A6:0x662B,0xE996A9:0x662C,0xE996AB:0x662D,
	0xE996AC:0x662E,0xE996B4:0x662F,0xE996B6:0x6630,0xE996BA:0x6631,0xE996BD:0x6632,
	0xE996BF:0x6633,0xE99786:0x6634,0xE99788:0x6635,0xE99789:0x6636,0xE9978B:0x6637,
	0xE99790:0x6638,0xE99791:0x6639,0xE99792:0x663A,0xE99793:0x663B,0xE99799:0x663C,
	0xE9979A:0x663D,0xE9979D:0x663E,0xE9979E:0x663F,0xE9979F:0x6640,0xE997A0:0x6641,
	0xE997A4:0x6642,0xE997A6:0x6643,0xE9989D:0x6644,0xE9989E:0x6645,0xE998A2:0x6646,
	0xE998A4:0x6647,0xE998A5:0x6648,0xE998A6:0x6649,0xE998AC:0x664A,0xE998B1:0x664B,
	0xE998B3:0x664C,0xE998B7:0x664D,0xE998B8:0x664E,0xE998B9:0x664F,0xE998BA:0x6650,
	0xE998BC:0x6651,0xE998BD:0x6652,0xE99981:0x6653,0xE99992:0x6654,0xE99994:0x6655,
	0xE99996:0x6656,0xE99997:0x6657,0xE99998:0x6658,0xE999A1:0x6659,0xE999AE:0x665A,
	0xE999B4:0x665B,0xE999BB:0x665C,0xE999BC:0x665D,0xE999BE:0x665E,0xE999BF:0x665F,
	0xE99A81:0x6660,0xE99A82:0x6661,0xE99A83:0x6662,0xE99A84:0x6663,0xE99A89:0x6664,
	0xE99A91:0x6665,0xE99A96:0x6666,0xE99A9A:0x6667,0xE99A9D:0x6668,0xE99A9F:0x6669,
	0xE99AA4:0x666A,0xE99AA5:0x666B,0xE99AA6:0x666C,0xE99AA9:0x666D,0xE99AAE:0x666E,
	0xE99AAF:0x666F,0xE99AB3:0x6670,0xE99ABA:0x6671,0xE99B8A:0x6672,0xE99B92:0x6673,
	0xE5B6B2:0x6674,0xE99B98:0x6675,0xE99B9A:0x6676,0xE99B9D:0x6677,0xE99B9E:0x6678,
	0xE99B9F:0x6679,0xE99BA9:0x667A,0xE99BAF:0x667B,0xE99BB1:0x667C,0xE99BBA:0x667D,
	0xE99C82:0x667E,0xE99C83:0x6721,0xE99C85:0x6722,0xE99C89:0x6723,0xE99C9A:0x6724,
	0xE99C9B:0x6725,0xE99C9D:0x6726,0xE99CA1:0x6727,0xE99CA2:0x6728,0xE99CA3:0x6729,
	0xE99CA8:0x672A,0xE99CB1:0x672B,0xE99CB3:0x672C,0xE99D81:0x672D,0xE99D83:0x672E,
	0xE99D8A:0x672F,0xE99D8E:0x6730,0xE99D8F:0x6731,0xE99D95:0x6732,0xE99D97:0x6733,
	0xE99D98:0x6734,0xE99D9A:0x6735,0xE99D9B:0x6736,0xE99DA3:0x6737,0xE99DA7:0x6738,
	0xE99DAA:0x6739,0xE99DAE:0x673A,0xE99DB3:0x673B,0xE99DB6:0x673C,0xE99DB7:0x673D,
	0xE99DB8:0x673E,0xE99DBB:0x673F,0xE99DBD:0x6740,0xE99DBF:0x6741,0xE99E80:0x6742,
	0xE99E89:0x6743,0xE99E95:0x6744,0xE99E96:0x6745,0xE99E97:0x6746,0xE99E99:0x6747,
	0xE99E9A:0x6748,0xE99E9E:0x6749,0xE99E9F:0x674A,0xE99EA2:0x674B,0xE99EAC:0x674C,
	0xE99EAE:0x674D,0xE99EB1:0x674E,0xE99EB2:0x674F,0xE99EB5:0x6750,0xE99EB6:0x6751,
	0xE99EB8:0x6752,0xE99EB9:0x6753,0xE99EBA:0x6754,0xE99EBC:0x6755,0xE99EBE:0x6756,
	0xE99EBF:0x6757,0xE99F81:0x6758,0xE99F84:0x6759,0xE99F85:0x675A,0xE99F87:0x675B,
	0xE99F89:0x675C,0xE99F8A:0x675D,0xE99F8C:0x675E,0xE99F8D:0x675F,0xE99F8E:0x6760,
	0xE99F90:0x6761,0xE99F91:0x6762,0xE99F94:0x6763,0xE99F97:0x6764,0xE99F98:0x6765,
	0xE99F99:0x6766,0xE99F9D:0x6767,0xE99F9E:0x6768,0xE99FA0:0x6769,0xE99F9B:0x676A,
	0xE99FA1:0x676B,0xE99FA4:0x676C,0xE99FAF:0x676D,0xE99FB1:0x676E,0xE99FB4:0x676F,
	0xE99FB7:0x6770,0xE99FB8:0x6771,0xE99FBA:0x6772,0xE9A087:0x6773,0xE9A08A:0x6774,
	0xE9A099:0x6775,0xE9A08D:0x6776,0xE9A08E:0x6777,0xE9A094:0x6778,0xE9A096:0x6779,
	0xE9A09C:0x677A,0xE9A09E:0x677B,0xE9A0A0:0x677C,0xE9A0A3:0x677D,0xE9A0A6:0x677E,
	0xE9A0AB:0x6821,0xE9A0AE:0x6822,0xE9A0AF:0x6823,0xE9A0B0:0x6824,0xE9A0B2:0x6825,
	0xE9A0B3:0x6826,0xE9A0B5:0x6827,0xE9A0A5:0x6828,0xE9A0BE:0x6829,0xE9A184:0x682A,
	0xE9A187:0x682B,0xE9A18A:0x682C,0xE9A191:0x682D,0xE9A192:0x682E,0xE9A193:0x682F,
	0xE9A196:0x6830,0xE9A197:0x6831,0xE9A199:0x6832,0xE9A19A:0x6833,0xE9A1A2:0x6834,
	0xE9A1A3:0x6835,0xE9A1A5:0x6836,0xE9A1A6:0x6837,0xE9A1AA:0x6838,0xE9A1AC:0x6839,
	0xE9A2AB:0x683A,0xE9A2AD:0x683B,0xE9A2AE:0x683C,0xE9A2B0:0x683D,0xE9A2B4:0x683E,
	0xE9A2B7:0x683F,0xE9A2B8:0x6840,0xE9A2BA:0x6841,0xE9A2BB:0x6842,0xE9A2BF:0x6843,
	0xE9A382:0x6844,0xE9A385:0x6845,0xE9A388:0x6846,0xE9A38C:0x6847,0xE9A3A1:0x6848,
	0xE9A3A3:0x6849,0xE9A3A5:0x684A,0xE9A3A6:0x684B,0xE9A3A7:0x684C,0xE9A3AA:0x684D,
	0xE9A3B3:0x684E,0xE9A3B6:0x684F,0xE9A482:0x6850,0xE9A487:0x6851,0xE9A488:0x6852,
	0xE9A491:0x6853,0xE9A495:0x6854,0xE9A496:0x6855,0xE9A497:0x6856,0xE9A49A:0x6857,
	0xE9A49B:0x6858,0xE9A49C:0x6859,0xE9A49F:0x685A,0xE9A4A2:0x685B,0xE9A4A6:0x685C,
	0xE9A4A7:0x685D,0xE9A4AB:0x685E,0xE9A4B1:0x685F,0xE9A4B2:0x6860,0xE9A4B3:0x6861,
	0xE9A4B4:0x6862,0xE9A4B5:0x6863,0xE9A4B9:0x6864,0xE9A4BA:0x6865,0xE9A4BB:0x6866,
	0xE9A4BC:0x6867,0xE9A580:0x6868,0xE9A581:0x6869,0xE9A586:0x686A,0xE9A587:0x686B,
	0xE9A588:0x686C,0xE9A58D:0x686D,0xE9A58E:0x686E,0xE9A594:0x686F,0xE9A598:0x6870,
	0xE9A599:0x6871,0xE9A59B:0x6872,0xE9A59C:0x6873,0xE9A59E:0x6874,0xE9A59F:0x6875,
	0xE9A5A0:0x6876,0xE9A69B:0x6877,0xE9A69D:0x6878,0xE9A69F:0x6879,0xE9A6A6:0x687A,
	0xE9A6B0:0x687B,0xE9A6B1:0x687C,0xE9A6B2:0x687D,0xE9A6B5:0x687E,0xE9A6B9:0x6921,
	0xE9A6BA:0x6922,0xE9A6BD:0x6923,0xE9A6BF:0x6924,0xE9A783:0x6925,0xE9A789:0x6926,
	0xE9A793:0x6927,0xE9A794:0x6928,0xE9A799:0x6929,0xE9A79A:0x692A,0xE9A79C:0x692B,
	0xE9A79E:0x692C,0xE9A7A7:0x692D,0xE9A7AA:0x692E,0xE9A7AB:0x692F,0xE9A7AC:0x6930,
	0xE9A7B0:0x6931,0xE9A7B4:0x6932,0xE9A7B5:0x6933,0xE9A7B9:0x6934,0xE9A7BD:0x6935,
	0xE9A7BE:0x6936,0xE9A882:0x6937,0xE9A883:0x6938,0xE9A884:0x6939,0xE9A88B:0x693A,
	0xE9A88C:0x693B,0xE9A890:0x693C,0xE9A891:0x693D,0xE9A896:0x693E,0xE9A89E:0x693F,
	0xE9A8A0:0x6940,0xE9A8A2:0x6941,0xE9A8A3:0x6942,0xE9A8A4:0x6943,0xE9A8A7:0x6944,
	0xE9A8AD:0x6945,0xE9A8AE:0x6946,0xE9A8B3:0x6947,0xE9A8B5:0x6948,0xE9A8B6:0x6949,
	0xE9A8B8:0x694A,0xE9A987:0x694B,0xE9A981:0x694C,0xE9A984:0x694D,0xE9A98A:0x694E,
	0xE9A98B:0x694F,0xE9A98C:0x6950,0xE9A98E:0x6951,0xE9A991:0x6952,0xE9A994:0x6953,
	0xE9A996:0x6954,0xE9A99D:0x6955,0xE9AAAA:0x6956,0xE9AAAC:0x6957,0xE9AAAE:0x6958,
	0xE9AAAF:0x6959,0xE9AAB2:0x695A,0xE9AAB4:0x695B,0xE9AAB5:0x695C,0xE9AAB6:0x695D,
	0xE9AAB9:0x695E,0xE9AABB:0x695F,0xE9AABE:0x6960,0xE9AABF:0x6961,0xE9AB81:0x6962,
	0xE9AB83:0x6963,0xE9AB86:0x6964,0xE9AB88:0x6965,0xE9AB8E:0x6966,0xE9AB90:0x6967,
	0xE9AB92:0x6968,0xE9AB95:0x6969,0xE9AB96:0x696A,0xE9AB97:0x696B,0xE9AB9B:0x696C,
	0xE9AB9C:0x696D,0xE9ABA0:0x696E,0xE9ABA4:0x696F,0xE9ABA5:0x6970,0xE9ABA7:0x6971,
	0xE9ABA9:0x6972,0xE9ABAC:0x6973,0xE9ABB2:0x6974,0xE9ABB3:0x6975,0xE9ABB5:0x6976,
	0xE9ABB9:0x6977,0xE9ABBA:0x6978,0xE9ABBD:0x6979,0xE9ABBF:0x697A,0xE9AC80:0x697B,
	0xE9AC81:0x697C,0xE9AC82:0x697D,0xE9AC83:0x697E,0xE9AC84:0x6A21,0xE9AC85:0x6A22,
	0xE9AC88:0x6A23,0xE9AC89:0x6A24,0xE9AC8B:0x6A25,0xE9AC8C:0x6A26,0xE9AC8D:0x6A27,
	0xE9AC8E:0x6A28,0xE9AC90:0x6A29,0xE9AC92:0x6A2A,0xE9AC96:0x6A2B,0xE9AC99:0x6A2C,
	0xE9AC9B:0x6A2D,0xE9AC9C:0x6A2E,0xE9ACA0:0x6A2F,0xE9ACA6:0x6A30,0xE9ACAB:0x6A31,
	0xE9ACAD:0x6A32,0xE9ACB3:0x6A33,0xE9ACB4:0x6A34,0xE9ACB5:0x6A35,0xE9ACB7:0x6A36,
	0xE9ACB9:0x6A37,0xE9ACBA:0x6A38,0xE9ACBD:0x6A39,0xE9AD88:0x6A3A,0xE9AD8B:0x6A3B,
	0xE9AD8C:0x6A3C,0xE9AD95:0x6A3D,0xE9AD96:0x6A3E,0xE9AD97:0x6A3F,0xE9AD9B:0x6A40,
	0xE9AD9E:0x6A41,0xE9ADA1:0x6A42,0xE9ADA3:0x6A43,0xE9ADA5:0x6A44,0xE9ADA6:0x6A45,
	0xE9ADA8:0x6A46,0xE9ADAA:0x6A47,0xE9ADAB:0x6A48,0xE9ADAC:0x6A49,0xE9ADAD:0x6A4A,
	0xE9ADAE:0x6A4B,0xE9ADB3:0x6A4C,0xE9ADB5:0x6A4D,0xE9ADB7:0x6A4E,0xE9ADB8:0x6A4F,
	0xE9ADB9:0x6A50,0xE9ADBF:0x6A51,0xE9AE80:0x6A52,0xE9AE84:0x6A53,0xE9AE85:0x6A54,
	0xE9AE86:0x6A55,0xE9AE87:0x6A56,0xE9AE89:0x6A57,0xE9AE8A:0x6A58,0xE9AE8B:0x6A59,
	0xE9AE8D:0x6A5A,0xE9AE8F:0x6A5B,0xE9AE90:0x6A5C,0xE9AE94:0x6A5D,0xE9AE9A:0x6A5E,
	0xE9AE9D:0x6A5F,0xE9AE9E:0x6A60,0xE9AEA6:0x6A61,0xE9AEA7:0x6A62,0xE9AEA9:0x6A63,
	0xE9AEAC:0x6A64,0xE9AEB0:0x6A65,0xE9AEB1:0x6A66,0xE9AEB2:0x6A67,0xE9AEB7:0x6A68,
	0xE9AEB8:0x6A69,0xE9AEBB:0x6A6A,0xE9AEBC:0x6A6B,0xE9AEBE:0x6A6C,0xE9AEBF:0x6A6D,
	0xE9AF81:0x6A6E,0xE9AF87:0x6A6F,0xE9AF88:0x6A70,0xE9AF8E:0x6A71,0xE9AF90:0x6A72,
	0xE9AF97:0x6A73,0xE9AF98:0x6A74,0xE9AF9D:0x6A75,0xE9AF9F:0x6A76,0xE9AFA5:0x6A77,
	0xE9AFA7:0x6A78,0xE9AFAA:0x6A79,0xE9AFAB:0x6A7A,0xE9AFAF:0x6A7B,0xE9AFB3:0x6A7C,
	0xE9AFB7:0x6A7D,0xE9AFB8:0x6A7E,0xE9AFB9:0x6B21,0xE9AFBA:0x6B22,0xE9AFBD:0x6B23,
	0xE9AFBF:0x6B24,0xE9B080:0x6B25,0xE9B082:0x6B26,0xE9B08B:0x6B27,0xE9B08F:0x6B28,
	0xE9B091:0x6B29,0xE9B096:0x6B2A,0xE9B098:0x6B2B,0xE9B099:0x6B2C,0xE9B09A:0x6B2D,
	0xE9B09C:0x6B2E,0xE9B09E:0x6B2F,0xE9B0A2:0x6B30,0xE9B0A3:0x6B31,0xE9B0A6:0x6B32,
	0xE9B0A7:0x6B33,0xE9B0A8:0x6B34,0xE9B0A9:0x6B35,0xE9B0AA:0x6B36,0xE9B0B1:0x6B37,
	0xE9B0B5:0x6B38,0xE9B0B6:0x6B39,0xE9B0B7:0x6B3A,0xE9B0BD:0x6B3B,0xE9B181:0x6B3C,
	0xE9B183:0x6B3D,0xE9B184:0x6B3E,0xE9B185:0x6B3F,0xE9B189:0x6B40,0xE9B18A:0x6B41,
	0xE9B18E:0x6B42,0xE9B18F:0x6B43,0xE9B190:0x6B44,0xE9B193:0x6B45,0xE9B194:0x6B46,
	0xE9B196:0x6B47,0xE9B198:0x6B48,0xE9B19B:0x6B49,0xE9B19D:0x6B4A,0xE9B19E:0x6B4B,
	0xE9B19F:0x6B4C,0xE9B1A3:0x6B4D,0xE9B1A9:0x6B4E,0xE9B1AA:0x6B4F,0xE9B19C:0x6B50,
	0xE9B1AB:0x6B51,0xE9B1A8:0x6B52,0xE9B1AE:0x6B53,0xE9B1B0:0x6B54,0xE9B1B2:0x6B55,
	0xE9B1B5:0x6B56,0xE9B1B7:0x6B57,0xE9B1BB:0x6B58,0xE9B3A6:0x6B59,0xE9B3B2:0x6B5A,
	0xE9B3B7:0x6B5B,0xE9B3B9:0x6B5C,0xE9B48B:0x6B5D,0xE9B482:0x6B5E,0xE9B491:0x6B5F,
	0xE9B497:0x6B60,0xE9B498:0x6B61,0xE9B49C:0x6B62,0xE9B49D:0x6B63,0xE9B49E:0x6B64,
	0xE9B4AF:0x6B65,0xE9B4B0:0x6B66,0xE9B4B2:0x6B67,0xE9B4B3:0x6B68,0xE9B4B4:0x6B69,
	0xE9B4BA:0x6B6A,0xE9B4BC:0x6B6B,0xE9B585:0x6B6C,0xE9B4BD:0x6B6D,0xE9B582:0x6B6E,
	0xE9B583:0x6B6F,0xE9B587:0x6B70,0xE9B58A:0x6B71,0xE9B593:0x6B72,0xE9B594:0x6B73,
	0xE9B59F:0x6B74,0xE9B5A3:0x6B75,0xE9B5A2:0x6B76,0xE9B5A5:0x6B77,0xE9B5A9:0x6B78,
	0xE9B5AA:0x6B79,0xE9B5AB:0x6B7A,0xE9B5B0:0x6B7B,0xE9B5B6:0x6B7C,0xE9B5B7:0x6B7D,
	0xE9B5BB:0x6B7E,0xE9B5BC:0x6C21,0xE9B5BE:0x6C22,0xE9B683:0x6C23,0xE9B684:0x6C24,
	0xE9B686:0x6C25,0xE9B68A:0x6C26,0xE9B68D:0x6C27,0xE9B68E:0x6C28,0xE9B692:0x6C29,
	0xE9B693:0x6C2A,0xE9B695:0x6C2B,0xE9B696:0x6C2C,0xE9B697:0x6C2D,0xE9B698:0x6C2E,
	0xE9B6A1:0x6C2F,0xE9B6AA:0x6C30,0xE9B6AC:0x6C31,0xE9B6AE:0x6C32,0xE9B6B1:0x6C33,
	0xE9B6B5:0x6C34,0xE9B6B9:0x6C35,0xE9B6BC:0x6C36,0xE9B6BF:0x6C37,0xE9B783:0x6C38,
	0xE9B787:0x6C39,0xE9B789:0x6C3A,0xE9B78A:0x6C3B,0xE9B794:0x6C3C,0xE9B795:0x6C3D,
	0xE9B796:0x6C3E,0xE9B797:0x6C3F,0xE9B79A:0x6C40,0xE9B79E:0x6C41,0xE9B79F:0x6C42,
	0xE9B7A0:0x6C43,0xE9B7A5:0x6C44,0xE9B7A7:0x6C45,0xE9B7A9:0x6C46,0xE9B7AB:0x6C47,
	0xE9B7AE:0x6C48,0xE9B7B0:0x6C49,0xE9B7B3:0x6C4A,0xE9B7B4:0x6C4B,0xE9B7BE:0x6C4C,
	0xE9B88A:0x6C4D,0xE9B882:0x6C4E,0xE9B887:0x6C4F,0xE9B88E:0x6C50,0xE9B890:0x6C51,
	0xE9B891:0x6C52,0xE9B892:0x6C53,0xE9B895:0x6C54,0xE9B896:0x6C55,0xE9B899:0x6C56,
	0xE9B89C:0x6C57,0xE9B89D:0x6C58,0xE9B9BA:0x6C59,0xE9B9BB:0x6C5A,0xE9B9BC:0x6C5B,
	0xE9BA80:0x6C5C,0xE9BA82:0x6C5D,0xE9BA83:0x6C5E,0xE9BA84:0x6C5F,0xE9BA85:0x6C60,
	0xE9BA87:0x6C61,0xE9BA8E:0x6C62,0xE9BA8F:0x6C63,0xE9BA96:0x6C64,0xE9BA98:0x6C65,
	0xE9BA9B:0x6C66,0xE9BA9E:0x6C67,0xE9BAA4:0x6C68,0xE9BAA8:0x6C69,0xE9BAAC:0x6C6A,
	0xE9BAAE:0x6C6B,0xE9BAAF:0x6C6C,0xE9BAB0:0x6C6D,0xE9BAB3:0x6C6E,0xE9BAB4:0x6C6F,
	0xE9BAB5:0x6C70,0xE9BB86:0x6C71,0xE9BB88:0x6C72,0xE9BB8B:0x6C73,0xE9BB95:0x6C74,
	0xE9BB9F:0x6C75,0xE9BBA4:0x6C76,0xE9BBA7:0x6C77,0xE9BBAC:0x6C78,0xE9BBAD:0x6C79,
	0xE9BBAE:0x6C7A,0xE9BBB0:0x6C7B,0xE9BBB1:0x6C7C,0xE9BBB2:0x6C7D,0xE9BBB5:0x6C7E,
	0xE9BBB8:0x6D21,0xE9BBBF:0x6D22,0xE9BC82:0x6D23,0xE9BC83:0x6D24,0xE9BC89:0x6D25,
	0xE9BC8F:0x6D26,0xE9BC90:0x6D27,0xE9BC91:0x6D28,0xE9BC92:0x6D29,0xE9BC94:0x6D2A,
	0xE9BC96:0x6D2B,0xE9BC97:0x6D2C,0xE9BC99:0x6D2D,0xE9BC9A:0x6D2E,0xE9BC9B:0x6D2F,
	0xE9BC9F:0x6D30,0xE9BCA2:0x6D31,0xE9BCA6:0x6D32,0xE9BCAA:0x6D33,0xE9BCAB:0x6D34,
	0xE9BCAF:0x6D35,0xE9BCB1:0x6D36,0xE9BCB2:0x6D37,0xE9BCB4:0x6D38,0xE9BCB7:0x6D39,
	0xE9BCB9:0x6D3A,0xE9BCBA:0x6D3B,0xE9BCBC:0x6D3C,0xE9BCBD:0x6D3D,0xE9BCBF:0x6D3E,
	0xE9BD81:0x6D3F,0xE9BD83:0x6D40,0xE9BD84:0x6D41,0xE9BD85:0x6D42,0xE9BD86:0x6D43,
	0xE9BD87:0x6D44,0xE9BD93:0x6D45,0xE9BD95:0x6D46,0xE9BD96:0x6D47,0xE9BD97:0x6D48,
	0xE9BD98:0x6D49,0xE9BD9A:0x6D4A,0xE9BD9D:0x6D4B,0xE9BD9E:0x6D4C,0xE9BDA8:0x6D4D,
	0xE9BDA9:0x6D4E,0xE9BDAD:0x6D4F,0xE9BDAE:0x6D50,0xE9BDAF:0x6D51,0xE9BDB0:0x6D52,
	0xE9BDB1:0x6D53,0xE9BDB3:0x6D54,0xE9BDB5:0x6D55,0xE9BDBA:0x6D56,0xE9BDBD:0x6D57,
	0xE9BE8F:0x6D58,0xE9BE90:0x6D59,0xE9BE91:0x6D5A,0xE9BE92:0x6D5B,0xE9BE94:0x6D5C,
	0xE9BE96:0x6D5D,0xE9BE97:0x6D5E,0xE9BE9E:0x6D5F,0xE9BEA1:0x6D60,0xE9BEA2:0x6D61,
	0xE9BEA3:0x6D62,0xE9BEA5:0x6D63,

	//FIXME: mojibake
	0xE3809C:0x2141
	};


	/**
	 * Encoding conversion table for JIS to UTF-8.
	 *
	 * @ignore
	 */
	var JIS_TO_UTF8_TABLE = null;

	/**
	 * The encoding conversion table for JIS X 0212:1990 (Hojo-Kanji) to UTF-8.
	 *
	 * @ignore
	 */
	var JISX0212_TO_UTF8_TABLE = null;

	function init_JIS_TO_UTF8_TABLE() {
	  if (JIS_TO_UTF8_TABLE === null) {
	    JIS_TO_UTF8_TABLE = {};

	    var keys = getKeys(UTF8_TO_JIS_TABLE);
	    var i = 0;
	    var len = keys.length;
	    var key, value;

	    for (; i < len; i++) {
	      key = keys[i];
	      value = UTF8_TO_JIS_TABLE[key];
	      if (value > 0x5F) {
	        JIS_TO_UTF8_TABLE[value] = key | 0;
	      }
	    }

	    JISX0212_TO_UTF8_TABLE = {};
	    keys = getKeys(UTF8_TO_JISX0212_TABLE);
	    len = keys.length;

	    for (i = 0; i < len; i++) {
	      key = keys[i];
	      value = UTF8_TO_JISX0212_TABLE[key];
	      JISX0212_TO_UTF8_TABLE[value] = key | 0;
	    }
	  }
	}

	/**
	 * Katakana table
	 *
	 * @ignore
	 */
	var hankanaCase_table = {
	  0x3001:0xFF64,0x3002:0xFF61,0x300C:0xFF62,0x300D:0xFF63,0x309B:0xFF9E,
	  0x309C:0xFF9F,0x30A1:0xFF67,0x30A2:0xFF71,0x30A3:0xFF68,0x30A4:0xFF72,
	  0x30A5:0xFF69,0x30A6:0xFF73,0x30A7:0xFF6A,0x30A8:0xFF74,0x30A9:0xFF6B,
	  0x30AA:0xFF75,0x30AB:0xFF76,0x30AD:0xFF77,0x30AF:0xFF78,0x30B1:0xFF79,
	  0x30B3:0xFF7A,0x30B5:0xFF7B,0x30B7:0xFF7C,0x30B9:0xFF7D,0x30BB:0xFF7E,
	  0x30BD:0xFF7F,0x30BF:0xFF80,0x30C1:0xFF81,0x30C3:0xFF6F,0x30C4:0xFF82,
	  0x30C6:0xFF83,0x30C8:0xFF84,0x30CA:0xFF85,0x30CB:0xFF86,0x30CC:0xFF87,
	  0x30CD:0xFF88,0x30CE:0xFF89,0x30CF:0xFF8A,0x30D2:0xFF8B,0x30D5:0xFF8C,
	  0x30D8:0xFF8D,0x30DB:0xFF8E,0x30DE:0xFF8F,0x30DF:0xFF90,0x30E0:0xFF91,
	  0x30E1:0xFF92,0x30E2:0xFF93,0x30E3:0xFF6C,0x30E4:0xFF94,0x30E5:0xFF6D,
	  0x30E6:0xFF95,0x30E7:0xFF6E,0x30E8:0xFF96,0x30E9:0xFF97,0x30EA:0xFF98,
	  0x30EB:0xFF99,0x30EC:0xFF9A,0x30ED:0xFF9B,0x30EF:0xFF9C,0x30F2:0xFF66,
	  0x30F3:0xFF9D,0x30FB:0xFF65,0x30FC:0xFF70
	};

	/**
	 * @ignore
	 */
	var hankanaCase_sonants = {
	  0x30F4:0xFF73,
	  0x30F7:0xFF9C,
	  0x30FA:0xFF66
	};

	/**
	 * Sonant marks.
	 *
	 * @ignore
	 */
	var hankanaCase_marks = [0xFF9E, 0xFF9F];

	/**
	 * Zenkaku table [U+FF61] - [U+FF9F]
	 *
	 * @ignore
	 */
	var zenkanaCase_table = [
	  0x3002, 0x300C, 0x300D, 0x3001, 0x30FB, 0x30F2, 0x30A1, 0x30A3,
	  0x30A5, 0x30A7, 0x30A9, 0x30E3, 0x30E5, 0x30E7, 0x30C3, 0x30FC,
	  0x30A2, 0x30A4, 0x30A6, 0x30A8, 0x30AA, 0x30AB, 0x30AD, 0x30AF,
	  0x30B1, 0x30B3, 0x30B5, 0x30B7, 0x30B9, 0x30BB, 0x30BD, 0x30BF,
	  0x30C1, 0x30C4, 0x30C6, 0x30C8, 0x30CA, 0x30CB, 0x30CC, 0x30CD,
	  0x30CE, 0x30CF, 0x30D2, 0x30D5, 0x30D8, 0x30DB, 0x30DE, 0x30DF,
	  0x30E0, 0x30E1, 0x30E2, 0x30E4, 0x30E6, 0x30E8, 0x30E9, 0x30EA,
	  0x30EB, 0x30EC, 0x30ED, 0x30EF, 0x30F3, 0x309B, 0x309C
	];

	return Encoding;
	});


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var rng = __webpack_require__(11)

	function error () {
	  var m = [].slice.call(arguments).join(' ')
	  throw new Error([
	    m,
	    'we accept pull requests',
	    'http://github.com/dominictarr/crypto-browserify'
	    ].join('\n'))
	}

	exports.createHash = __webpack_require__(13)

	exports.createHmac = __webpack_require__(26)

	exports.randomBytes = function(size, callback) {
	  if (callback && callback.call) {
	    try {
	      callback.call(this, undefined, new Buffer(rng(size)))
	    } catch (err) { callback(err) }
	  } else {
	    return new Buffer(rng(size))
	  }
	}

	function each(a, f) {
	  for(var i in a)
	    f(a[i], i)
	}

	exports.getHashes = function () {
	  return ['sha1', 'sha256', 'sha512', 'md5', 'rmd160']
	}

	var p = __webpack_require__(27)(exports)
	exports.pbkdf2 = p.pbkdf2
	exports.pbkdf2Sync = p.pbkdf2Sync


	// the least I can do is make error messages for the rest of the node.js/crypto api.
	each(['createCredentials'
	, 'createCipher'
	, 'createCipheriv'
	, 'createDecipher'
	, 'createDecipheriv'
	, 'createSign'
	, 'createVerify'
	, 'createDiffieHellman'
	], function (name) {
	  exports[name] = function () {
	    error('sorry,', name, 'is not implemented yet')
	  }
	})

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7).Buffer))

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer, global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */

	'use strict'

	var base64 = __webpack_require__(8)
	var ieee754 = __webpack_require__(9)
	var isArray = __webpack_require__(10)

	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation

	var rootParent = {}

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
	 *     on objects.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()

	function typedArraySupport () {
	  function Bar () {}
	  try {
	    var arr = new Uint8Array(1)
	    arr.foo = function () { return 42 }
	    arr.constructor = Bar
	    return arr.foo() === 42 && // typed array instances can be augmented
	        arr.constructor === Bar && // constructor can be set
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}

	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (arg) {
	  if (!(this instanceof Buffer)) {
	    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
	    if (arguments.length > 1) return new Buffer(arg, arguments[1])
	    return new Buffer(arg)
	  }

	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    this.length = 0
	    this.parent = undefined
	  }

	  // Common case.
	  if (typeof arg === 'number') {
	    return fromNumber(this, arg)
	  }

	  // Slightly less common case.
	  if (typeof arg === 'string') {
	    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
	  }

	  // Unusual.
	  return fromObject(this, arg)
	}

	function fromNumber (that, length) {
	  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < length; i++) {
	      that[i] = 0
	    }
	  }
	  return that
	}

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

	  // Assumption: byteLength() return value is always < kMaxLength.
	  var length = byteLength(string, encoding) | 0
	  that = allocate(that, length)

	  that.write(string, encoding)
	  return that
	}

	function fromObject (that, object) {
	  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

	  if (isArray(object)) return fromArray(that, object)

	  if (object == null) {
	    throw new TypeError('must start with number, buffer, array or string')
	  }

	  if (typeof ArrayBuffer !== 'undefined') {
	    if (object.buffer instanceof ArrayBuffer) {
	      return fromTypedArray(that, object)
	    }
	    if (object instanceof ArrayBuffer) {
	      return fromArrayBuffer(that, object)
	    }
	  }

	  if (object.length) return fromArrayLike(that, object)

	  return fromJsonObject(that, object)
	}

	function fromBuffer (that, buffer) {
	  var length = checked(buffer.length) | 0
	  that = allocate(that, length)
	  buffer.copy(that, 0, 0, length)
	  return that
	}

	function fromArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Duplicate of fromArray() to keep fromArray() monomorphic.
	function fromTypedArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  // Truncating the elements is probably not what people expect from typed
	  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
	  // of the old Buffer constructor.
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	function fromArrayBuffer (that, array) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    array.byteLength
	    that = Buffer._augment(new Uint8Array(array))
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromTypedArray(that, new Uint8Array(array))
	  }
	  return that
	}

	function fromArrayLike (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
	// Returns a zero-length buffer for inputs that don't conform to the spec.
	function fromJsonObject (that, object) {
	  var array
	  var length = 0

	  if (object.type === 'Buffer' && isArray(object.data)) {
	    array = object.data
	    length = checked(array.length) | 0
	  }
	  that = allocate(that, length)

	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	} else {
	  // pre-set for values that may exist in the future
	  Buffer.prototype.length = undefined
	  Buffer.prototype.parent = undefined
	}

	function allocate (that, length) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = Buffer._augment(new Uint8Array(length))
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that.length = length
	    that._isBuffer = true
	  }

	  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
	  if (fromPool) that.parent = rootParent

	  return that
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}

	function SlowBuffer (subject, encoding) {
	  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

	  var buf = new Buffer(subject, encoding)
	  delete buf.parent
	  return buf
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length
	  var y = b.length

	  var i = 0
	  var len = Math.min(x, y)
	  while (i < len) {
	    if (a[i] !== b[i]) break

	    ++i
	  }

	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

	  if (list.length === 0) {
	    return new Buffer(0)
	  }

	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; i++) {
	      length += list[i].length
	    }
	  }

	  var buf = new Buffer(length)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}

	function byteLength (string, encoding) {
	  if (typeof string !== 'string') string = '' + string

	  var len = string.length
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'binary':
	      // Deprecated
	      case 'raw':
	      case 'raws':
	        return len
	      case 'utf8':
	      case 'utf-8':
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength

	function slowToString (encoding, start, end) {
	  var loweredCase = false

	  start = start | 0
	  end = end === undefined || end === Infinity ? this.length : end | 0

	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'binary':
	        return binarySlice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return 0
	  return Buffer.compare(this, b)
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
	  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
	  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
	  byteOffset >>= 0

	  if (this.length === 0) return -1
	  if (byteOffset >= this.length) return -1

	  // Negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

	  if (typeof val === 'string') {
	    if (val.length === 0) return -1 // special case: looking for empty string always fails
	    return String.prototype.indexOf.call(this, val, byteOffset)
	  }
	  if (Buffer.isBuffer(val)) {
	    return arrayIndexOf(this, val, byteOffset)
	  }
	  if (typeof val === 'number') {
	    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	    }
	    return arrayIndexOf(this, [ val ], byteOffset)
	  }

	  function arrayIndexOf (arr, val, byteOffset) {
	    var foundIndex = -1
	    for (var i = 0; byteOffset + i < arr.length; i++) {
	      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
	      } else {
	        foundIndex = -1
	      }
	    }
	    return -1
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	// `get` is deprecated
	Buffer.prototype.get = function get (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}

	// `set` is deprecated
	Buffer.prototype.set = function set (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) throw new Error('Invalid hex string')
	    buf[offset + i] = parsed
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    var swap = encoding
	    encoding = offset
	    offset = length | 0
	    length = swap
	  }

	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8'

	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'binary':
	        return binaryWrite(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []

	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }

	    res.push(codePoint)
	    i += bytesPerSequence
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}

	function binarySlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start) end = start

	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	  }

	  if (newBuf.length) newBuf.parent = this.parent || this

	  return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }

	  return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }

	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }

	  return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = 0
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	  if (offset < 0) throw new RangeError('index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }

	  var len = end - start
	  var i

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; i--) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; i++) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), targetStart)
	  }

	  return len
	}

	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function fill (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length

	  if (end < start) throw new RangeError('end < start')

	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return

	  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }

	  return this
	}

	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
	  }
	}

	// HELPER FUNCTIONS
	// ================

	var BP = Buffer.prototype

	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function _augment (arr) {
	  arr.constructor = Buffer
	  arr._isBuffer = true

	  // save reference to original Uint8Array set method before overwriting
	  arr._set = arr.set

	  // deprecated
	  arr.get = BP.get
	  arr.set = BP.set

	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.indexOf = BP.indexOf
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUIntLE = BP.readUIntLE
	  arr.readUIntBE = BP.readUIntBE
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readIntLE = BP.readIntLE
	  arr.readIntBE = BP.readIntBE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUIntLE = BP.writeUIntLE
	  arr.writeUIntBE = BP.writeUIntBE
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeIntLE = BP.writeIntLE
	  arr.writeIntBE = BP.writeIntBE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer

	  return arr
	}

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []

	  for (var i = 0; i < length; i++) {
	    codePoint = string.charCodeAt(i)

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }

	    leadSurrogate = null

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7).Buffer, (function() { return this; }())))

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	;(function (exports) {
		'use strict';

	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array

		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)
		var PLUS_URL_SAFE = '-'.charCodeAt(0)
		var SLASH_URL_SAFE = '_'.charCodeAt(0)

		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS ||
			    code === PLUS_URL_SAFE)
				return 62 // '+'
			if (code === SLASH ||
			    code === SLASH_URL_SAFE)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}

		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr

			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}

			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)

			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length

			var L = 0

			function push (v) {
				arr[L++] = v
			}

			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}

			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}

			return arr
		}

		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length

			function encode (num) {
				return lookup.charAt(num)
			}

			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}

			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}

			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}

			return output
		}

		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}( false ? (this.base64js = {}) : exports))


/***/ },
/* 9 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]

	  i += d

	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

	  value = Math.abs(value)

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }

	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 10 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, Buffer) {(function() {
	  var g = ('undefined' === typeof window ? global : window) || {}
	  _crypto = (
	    g.crypto || g.msCrypto || __webpack_require__(12)
	  )
	  module.exports = function(size) {
	    // Modern Browsers
	    if(_crypto.getRandomValues) {
	      var bytes = new Buffer(size); //in browserify, this is an extended Uint8Array
	      /* This will not work in older browsers.
	       * See https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
	       */
	    
	      _crypto.getRandomValues(bytes);
	      return bytes;
	    }
	    else if (_crypto.randomBytes) {
	      return _crypto.randomBytes(size)
	    }
	    else
	      throw new Error(
	        'secure random number generation not supported by this browser\n'+
	        'use chrome, FireFox or Internet Explorer 11'
	      )
	  }
	}())

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(7).Buffer))

/***/ },
/* 12 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var createHash = __webpack_require__(14)

	var md5 = toConstructor(__webpack_require__(23))
	var rmd160 = toConstructor(__webpack_require__(25))

	function toConstructor (fn) {
	  return function () {
	    var buffers = []
	    var m= {
	      update: function (data, enc) {
	        if(!Buffer.isBuffer(data)) data = new Buffer(data, enc)
	        buffers.push(data)
	        return this
	      },
	      digest: function (enc) {
	        var buf = Buffer.concat(buffers)
	        var r = fn(buf)
	        buffers = null
	        return enc ? r.toString(enc) : r
	      }
	    }
	    return m
	  }
	}

	module.exports = function (alg) {
	  if('md5' === alg) return new md5()
	  if('rmd160' === alg) return new rmd160()
	  return createHash(alg)
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7).Buffer))

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var exports = module.exports = function (alg) {
	  var Alg = exports[alg]
	  if(!Alg) throw new Error(alg + ' is not supported (we accept pull requests)')
	  return new Alg()
	}

	var Buffer = __webpack_require__(7).Buffer
	var Hash   = __webpack_require__(15)(Buffer)

	exports.sha1 = __webpack_require__(16)(Buffer, Hash)
	exports.sha256 = __webpack_require__(21)(Buffer, Hash)
	exports.sha512 = __webpack_require__(22)(Buffer, Hash)


/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = function (Buffer) {

	  //prototype class for hash functions
	  function Hash (blockSize, finalSize) {
	    this._block = new Buffer(blockSize) //new Uint32Array(blockSize/4)
	    this._finalSize = finalSize
	    this._blockSize = blockSize
	    this._len = 0
	    this._s = 0
	  }

	  Hash.prototype.init = function () {
	    this._s = 0
	    this._len = 0
	  }

	  Hash.prototype.update = function (data, enc) {
	    if ("string" === typeof data) {
	      enc = enc || "utf8"
	      data = new Buffer(data, enc)
	    }

	    var l = this._len += data.length
	    var s = this._s = (this._s || 0)
	    var f = 0
	    var buffer = this._block

	    while (s < l) {
	      var t = Math.min(data.length, f + this._blockSize - (s % this._blockSize))
	      var ch = (t - f)

	      for (var i = 0; i < ch; i++) {
	        buffer[(s % this._blockSize) + i] = data[i + f]
	      }

	      s += ch
	      f += ch

	      if ((s % this._blockSize) === 0) {
	        this._update(buffer)
	      }
	    }
	    this._s = s

	    return this
	  }

	  Hash.prototype.digest = function (enc) {
	    // Suppose the length of the message M, in bits, is l
	    var l = this._len * 8

	    // Append the bit 1 to the end of the message
	    this._block[this._len % this._blockSize] = 0x80

	    // and then k zero bits, where k is the smallest non-negative solution to the equation (l + 1 + k) === finalSize mod blockSize
	    this._block.fill(0, this._len % this._blockSize + 1)

	    if (l % (this._blockSize * 8) >= this._finalSize * 8) {
	      this._update(this._block)
	      this._block.fill(0)
	    }

	    // to this append the block which is equal to the number l written in binary
	    // TODO: handle case where l is > Math.pow(2, 29)
	    this._block.writeInt32BE(l, this._blockSize - 4)

	    var hash = this._update(this._block) || this._hash()

	    return enc ? hash.toString(enc) : hash
	  }

	  Hash.prototype._update = function () {
	    throw new Error('_update must be implemented by subclass')
	  }

	  return Hash
	}


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
	 * in FIPS PUB 180-1
	 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for details.
	 */

	var inherits = __webpack_require__(17).inherits

	module.exports = function (Buffer, Hash) {

	  var A = 0|0
	  var B = 4|0
	  var C = 8|0
	  var D = 12|0
	  var E = 16|0

	  var W = new (typeof Int32Array === 'undefined' ? Array : Int32Array)(80)

	  var POOL = []

	  function Sha1 () {
	    if(POOL.length)
	      return POOL.pop().init()

	    if(!(this instanceof Sha1)) return new Sha1()
	    this._w = W
	    Hash.call(this, 16*4, 14*4)

	    this._h = null
	    this.init()
	  }

	  inherits(Sha1, Hash)

	  Sha1.prototype.init = function () {
	    this._a = 0x67452301
	    this._b = 0xefcdab89
	    this._c = 0x98badcfe
	    this._d = 0x10325476
	    this._e = 0xc3d2e1f0

	    Hash.prototype.init.call(this)
	    return this
	  }

	  Sha1.prototype._POOL = POOL
	  Sha1.prototype._update = function (X) {

	    var a, b, c, d, e, _a, _b, _c, _d, _e

	    a = _a = this._a
	    b = _b = this._b
	    c = _c = this._c
	    d = _d = this._d
	    e = _e = this._e

	    var w = this._w

	    for(var j = 0; j < 80; j++) {
	      var W = w[j] = j < 16 ? X.readInt32BE(j*4)
	        : rol(w[j - 3] ^ w[j -  8] ^ w[j - 14] ^ w[j - 16], 1)

	      var t = add(
	        add(rol(a, 5), sha1_ft(j, b, c, d)),
	        add(add(e, W), sha1_kt(j))
	      )

	      e = d
	      d = c
	      c = rol(b, 30)
	      b = a
	      a = t
	    }

	    this._a = add(a, _a)
	    this._b = add(b, _b)
	    this._c = add(c, _c)
	    this._d = add(d, _d)
	    this._e = add(e, _e)
	  }

	  Sha1.prototype._hash = function () {
	    if(POOL.length < 100) POOL.push(this)
	    var H = new Buffer(20)
	    //console.log(this._a|0, this._b|0, this._c|0, this._d|0, this._e|0)
	    H.writeInt32BE(this._a|0, A)
	    H.writeInt32BE(this._b|0, B)
	    H.writeInt32BE(this._c|0, C)
	    H.writeInt32BE(this._d|0, D)
	    H.writeInt32BE(this._e|0, E)
	    return H
	  }

	  /*
	   * Perform the appropriate triplet combination function for the current
	   * iteration
	   */
	  function sha1_ft(t, b, c, d) {
	    if(t < 20) return (b & c) | ((~b) & d);
	    if(t < 40) return b ^ c ^ d;
	    if(t < 60) return (b & c) | (b & d) | (c & d);
	    return b ^ c ^ d;
	  }

	  /*
	   * Determine the appropriate additive constant for the current iteration
	   */
	  function sha1_kt(t) {
	    return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
	           (t < 60) ? -1894007588 : -899497514;
	  }

	  /*
	   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	   * to work around bugs in some JS interpreters.
	   * //dominictarr: this is 10 years old, so maybe this can be dropped?)
	   *
	   */
	  function add(x, y) {
	    return (x + y ) | 0
	  //lets see how this goes on testling.
	  //  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  //  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  //  return (msw << 16) | (lsw & 0xFFFF);
	  }

	  /*
	   * Bitwise rotate a 32-bit number to the left.
	   */
	  function rol(num, cnt) {
	    return (num << cnt) | (num >>> (32 - cnt));
	  }

	  return Sha1
	}


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};


	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  if (process.noDeprecation === true) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};


	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};


	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = __webpack_require__(19);

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}


	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(20);

	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(18)))

/***/ },
/* 18 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },
/* 20 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
	 * in FIPS 180-2
	 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 *
	 */

	var inherits = __webpack_require__(17).inherits

	module.exports = function (Buffer, Hash) {

	  var K = [
	      0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
	      0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
	      0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
	      0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
	      0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
	      0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
	      0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
	      0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
	      0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
	      0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
	      0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
	      0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
	      0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
	      0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
	      0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
	      0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
	    ]

	  var W = new Array(64)

	  function Sha256() {
	    this.init()

	    this._w = W //new Array(64)

	    Hash.call(this, 16*4, 14*4)
	  }

	  inherits(Sha256, Hash)

	  Sha256.prototype.init = function () {

	    this._a = 0x6a09e667|0
	    this._b = 0xbb67ae85|0
	    this._c = 0x3c6ef372|0
	    this._d = 0xa54ff53a|0
	    this._e = 0x510e527f|0
	    this._f = 0x9b05688c|0
	    this._g = 0x1f83d9ab|0
	    this._h = 0x5be0cd19|0

	    this._len = this._s = 0

	    return this
	  }

	  function S (X, n) {
	    return (X >>> n) | (X << (32 - n));
	  }

	  function R (X, n) {
	    return (X >>> n);
	  }

	  function Ch (x, y, z) {
	    return ((x & y) ^ ((~x) & z));
	  }

	  function Maj (x, y, z) {
	    return ((x & y) ^ (x & z) ^ (y & z));
	  }

	  function Sigma0256 (x) {
	    return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
	  }

	  function Sigma1256 (x) {
	    return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
	  }

	  function Gamma0256 (x) {
	    return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
	  }

	  function Gamma1256 (x) {
	    return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
	  }

	  Sha256.prototype._update = function(M) {

	    var W = this._w
	    var a, b, c, d, e, f, g, h
	    var T1, T2

	    a = this._a | 0
	    b = this._b | 0
	    c = this._c | 0
	    d = this._d | 0
	    e = this._e | 0
	    f = this._f | 0
	    g = this._g | 0
	    h = this._h | 0

	    for (var j = 0; j < 64; j++) {
	      var w = W[j] = j < 16
	        ? M.readInt32BE(j * 4)
	        : Gamma1256(W[j - 2]) + W[j - 7] + Gamma0256(W[j - 15]) + W[j - 16]

	      T1 = h + Sigma1256(e) + Ch(e, f, g) + K[j] + w

	      T2 = Sigma0256(a) + Maj(a, b, c);
	      h = g; g = f; f = e; e = d + T1; d = c; c = b; b = a; a = T1 + T2;
	    }

	    this._a = (a + this._a) | 0
	    this._b = (b + this._b) | 0
	    this._c = (c + this._c) | 0
	    this._d = (d + this._d) | 0
	    this._e = (e + this._e) | 0
	    this._f = (f + this._f) | 0
	    this._g = (g + this._g) | 0
	    this._h = (h + this._h) | 0

	  };

	  Sha256.prototype._hash = function () {
	    var H = new Buffer(32)

	    H.writeInt32BE(this._a,  0)
	    H.writeInt32BE(this._b,  4)
	    H.writeInt32BE(this._c,  8)
	    H.writeInt32BE(this._d, 12)
	    H.writeInt32BE(this._e, 16)
	    H.writeInt32BE(this._f, 20)
	    H.writeInt32BE(this._g, 24)
	    H.writeInt32BE(this._h, 28)

	    return H
	  }

	  return Sha256

	}


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var inherits = __webpack_require__(17).inherits

	module.exports = function (Buffer, Hash) {
	  var K = [
	    0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
	    0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
	    0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
	    0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
	    0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
	    0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
	    0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
	    0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
	    0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
	    0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
	    0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
	    0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
	    0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
	    0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
	    0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
	    0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
	    0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
	    0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
	    0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
	    0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
	    0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
	    0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
	    0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
	    0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
	    0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
	    0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
	    0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
	    0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
	    0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
	    0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
	    0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
	    0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
	    0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
	    0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
	    0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
	    0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
	    0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
	    0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
	    0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
	    0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
	  ]

	  var W = new Array(160)

	  function Sha512() {
	    this.init()
	    this._w = W

	    Hash.call(this, 128, 112)
	  }

	  inherits(Sha512, Hash)

	  Sha512.prototype.init = function () {

	    this._a = 0x6a09e667|0
	    this._b = 0xbb67ae85|0
	    this._c = 0x3c6ef372|0
	    this._d = 0xa54ff53a|0
	    this._e = 0x510e527f|0
	    this._f = 0x9b05688c|0
	    this._g = 0x1f83d9ab|0
	    this._h = 0x5be0cd19|0

	    this._al = 0xf3bcc908|0
	    this._bl = 0x84caa73b|0
	    this._cl = 0xfe94f82b|0
	    this._dl = 0x5f1d36f1|0
	    this._el = 0xade682d1|0
	    this._fl = 0x2b3e6c1f|0
	    this._gl = 0xfb41bd6b|0
	    this._hl = 0x137e2179|0

	    this._len = this._s = 0

	    return this
	  }

	  function S (X, Xl, n) {
	    return (X >>> n) | (Xl << (32 - n))
	  }

	  function Ch (x, y, z) {
	    return ((x & y) ^ ((~x) & z));
	  }

	  function Maj (x, y, z) {
	    return ((x & y) ^ (x & z) ^ (y & z));
	  }

	  Sha512.prototype._update = function(M) {

	    var W = this._w
	    var a, b, c, d, e, f, g, h
	    var al, bl, cl, dl, el, fl, gl, hl

	    a = this._a | 0
	    b = this._b | 0
	    c = this._c | 0
	    d = this._d | 0
	    e = this._e | 0
	    f = this._f | 0
	    g = this._g | 0
	    h = this._h | 0

	    al = this._al | 0
	    bl = this._bl | 0
	    cl = this._cl | 0
	    dl = this._dl | 0
	    el = this._el | 0
	    fl = this._fl | 0
	    gl = this._gl | 0
	    hl = this._hl | 0

	    for (var i = 0; i < 80; i++) {
	      var j = i * 2

	      var Wi, Wil

	      if (i < 16) {
	        Wi = W[j] = M.readInt32BE(j * 4)
	        Wil = W[j + 1] = M.readInt32BE(j * 4 + 4)

	      } else {
	        var x  = W[j - 15*2]
	        var xl = W[j - 15*2 + 1]
	        var gamma0  = S(x, xl, 1) ^ S(x, xl, 8) ^ (x >>> 7)
	        var gamma0l = S(xl, x, 1) ^ S(xl, x, 8) ^ S(xl, x, 7)

	        x  = W[j - 2*2]
	        xl = W[j - 2*2 + 1]
	        var gamma1  = S(x, xl, 19) ^ S(xl, x, 29) ^ (x >>> 6)
	        var gamma1l = S(xl, x, 19) ^ S(x, xl, 29) ^ S(xl, x, 6)

	        // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
	        var Wi7  = W[j - 7*2]
	        var Wi7l = W[j - 7*2 + 1]

	        var Wi16  = W[j - 16*2]
	        var Wi16l = W[j - 16*2 + 1]

	        Wil = gamma0l + Wi7l
	        Wi  = gamma0  + Wi7 + ((Wil >>> 0) < (gamma0l >>> 0) ? 1 : 0)
	        Wil = Wil + gamma1l
	        Wi  = Wi  + gamma1  + ((Wil >>> 0) < (gamma1l >>> 0) ? 1 : 0)
	        Wil = Wil + Wi16l
	        Wi  = Wi  + Wi16 + ((Wil >>> 0) < (Wi16l >>> 0) ? 1 : 0)

	        W[j] = Wi
	        W[j + 1] = Wil
	      }

	      var maj = Maj(a, b, c)
	      var majl = Maj(al, bl, cl)

	      var sigma0h = S(a, al, 28) ^ S(al, a, 2) ^ S(al, a, 7)
	      var sigma0l = S(al, a, 28) ^ S(a, al, 2) ^ S(a, al, 7)
	      var sigma1h = S(e, el, 14) ^ S(e, el, 18) ^ S(el, e, 9)
	      var sigma1l = S(el, e, 14) ^ S(el, e, 18) ^ S(e, el, 9)

	      // t1 = h + sigma1 + ch + K[i] + W[i]
	      var Ki = K[j]
	      var Kil = K[j + 1]

	      var ch = Ch(e, f, g)
	      var chl = Ch(el, fl, gl)

	      var t1l = hl + sigma1l
	      var t1 = h + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0)
	      t1l = t1l + chl
	      t1 = t1 + ch + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0)
	      t1l = t1l + Kil
	      t1 = t1 + Ki + ((t1l >>> 0) < (Kil >>> 0) ? 1 : 0)
	      t1l = t1l + Wil
	      t1 = t1 + Wi + ((t1l >>> 0) < (Wil >>> 0) ? 1 : 0)

	      // t2 = sigma0 + maj
	      var t2l = sigma0l + majl
	      var t2 = sigma0h + maj + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0)

	      h  = g
	      hl = gl
	      g  = f
	      gl = fl
	      f  = e
	      fl = el
	      el = (dl + t1l) | 0
	      e  = (d + t1 + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0
	      d  = c
	      dl = cl
	      c  = b
	      cl = bl
	      b  = a
	      bl = al
	      al = (t1l + t2l) | 0
	      a  = (t1 + t2 + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0
	    }

	    this._al = (this._al + al) | 0
	    this._bl = (this._bl + bl) | 0
	    this._cl = (this._cl + cl) | 0
	    this._dl = (this._dl + dl) | 0
	    this._el = (this._el + el) | 0
	    this._fl = (this._fl + fl) | 0
	    this._gl = (this._gl + gl) | 0
	    this._hl = (this._hl + hl) | 0

	    this._a = (this._a + a + ((this._al >>> 0) < (al >>> 0) ? 1 : 0)) | 0
	    this._b = (this._b + b + ((this._bl >>> 0) < (bl >>> 0) ? 1 : 0)) | 0
	    this._c = (this._c + c + ((this._cl >>> 0) < (cl >>> 0) ? 1 : 0)) | 0
	    this._d = (this._d + d + ((this._dl >>> 0) < (dl >>> 0) ? 1 : 0)) | 0
	    this._e = (this._e + e + ((this._el >>> 0) < (el >>> 0) ? 1 : 0)) | 0
	    this._f = (this._f + f + ((this._fl >>> 0) < (fl >>> 0) ? 1 : 0)) | 0
	    this._g = (this._g + g + ((this._gl >>> 0) < (gl >>> 0) ? 1 : 0)) | 0
	    this._h = (this._h + h + ((this._hl >>> 0) < (hl >>> 0) ? 1 : 0)) | 0
	  }

	  Sha512.prototype._hash = function () {
	    var H = new Buffer(64)

	    function writeInt64BE(h, l, offset) {
	      H.writeInt32BE(h, offset)
	      H.writeInt32BE(l, offset + 4)
	    }

	    writeInt64BE(this._a, this._al, 0)
	    writeInt64BE(this._b, this._bl, 8)
	    writeInt64BE(this._c, this._cl, 16)
	    writeInt64BE(this._d, this._dl, 24)
	    writeInt64BE(this._e, this._el, 32)
	    writeInt64BE(this._f, this._fl, 40)
	    writeInt64BE(this._g, this._gl, 48)
	    writeInt64BE(this._h, this._hl, 56)

	    return H
	  }

	  return Sha512

	}


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
	 * Digest Algorithm, as defined in RFC 1321.
	 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for more info.
	 */

	var helpers = __webpack_require__(24);

	/*
	 * Calculate the MD5 of an array of little-endian words, and a bit length
	 */
	function core_md5(x, len)
	{
	  /* append padding */
	  x[len >> 5] |= 0x80 << ((len) % 32);
	  x[(((len + 64) >>> 9) << 4) + 14] = len;

	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;

	  for(var i = 0; i < x.length; i += 16)
	  {
	    var olda = a;
	    var oldb = b;
	    var oldc = c;
	    var oldd = d;

	    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
	    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
	    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
	    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
	    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
	    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
	    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
	    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
	    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
	    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
	    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
	    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
	    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
	    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
	    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
	    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

	    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
	    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
	    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
	    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
	    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
	    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
	    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
	    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
	    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
	    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
	    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
	    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
	    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
	    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
	    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
	    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

	    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
	    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
	    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
	    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
	    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
	    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
	    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
	    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
	    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
	    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
	    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
	    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
	    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
	    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
	    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
	    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

	    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
	    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
	    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
	    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
	    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
	    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
	    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
	    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
	    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
	    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
	    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
	    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
	    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
	    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
	    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
	    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

	    a = safe_add(a, olda);
	    b = safe_add(b, oldb);
	    c = safe_add(c, oldc);
	    d = safe_add(d, oldd);
	  }
	  return Array(a, b, c, d);

	}

	/*
	 * These functions implement the four basic operations the algorithm uses.
	 */
	function md5_cmn(q, a, b, x, s, t)
	{
	  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
	}
	function md5_ff(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}
	function md5_gg(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}
	function md5_hh(a, b, c, d, x, s, t)
	{
	  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}
	function md5_ii(a, b, c, d, x, s, t)
	{
	  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	function safe_add(x, y)
	{
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	}

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function bit_rol(num, cnt)
	{
	  return (num << cnt) | (num >>> (32 - cnt));
	}

	module.exports = function md5(buf) {
	  return helpers.hash(buf, core_md5, 16);
	};


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var intSize = 4;
	var zeroBuffer = new Buffer(intSize); zeroBuffer.fill(0);
	var chrsz = 8;

	function toArray(buf, bigEndian) {
	  if ((buf.length % intSize) !== 0) {
	    var len = buf.length + (intSize - (buf.length % intSize));
	    buf = Buffer.concat([buf, zeroBuffer], len);
	  }

	  var arr = [];
	  var fn = bigEndian ? buf.readInt32BE : buf.readInt32LE;
	  for (var i = 0; i < buf.length; i += intSize) {
	    arr.push(fn.call(buf, i));
	  }
	  return arr;
	}

	function toBuffer(arr, size, bigEndian) {
	  var buf = new Buffer(size);
	  var fn = bigEndian ? buf.writeInt32BE : buf.writeInt32LE;
	  for (var i = 0; i < arr.length; i++) {
	    fn.call(buf, arr[i], i * 4, true);
	  }
	  return buf;
	}

	function hash(buf, fn, hashSize, bigEndian) {
	  if (!Buffer.isBuffer(buf)) buf = new Buffer(buf);
	  var arr = fn(toArray(buf, bigEndian), buf.length * chrsz);
	  return toBuffer(arr, hashSize, bigEndian);
	}

	module.exports = { hash: hash };

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7).Buffer))

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {
	module.exports = ripemd160



	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	/** @preserve
	(c) 2012 by Cédric Mesnil. All rights reserved.

	Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

	    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
	    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	*/

	// Constants table
	var zl = [
	    0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
	    7,  4, 13,  1, 10,  6, 15,  3, 12,  0,  9,  5,  2, 14, 11,  8,
	    3, 10, 14,  4,  9, 15,  8,  1,  2,  7,  0,  6, 13, 11,  5, 12,
	    1,  9, 11, 10,  0,  8, 12,  4, 13,  3,  7, 15, 14,  5,  6,  2,
	    4,  0,  5,  9,  7, 12,  2, 10, 14,  1,  3,  8, 11,  6, 15, 13];
	var zr = [
	    5, 14,  7,  0,  9,  2, 11,  4, 13,  6, 15,  8,  1, 10,  3, 12,
	    6, 11,  3,  7,  0, 13,  5, 10, 14, 15,  8, 12,  4,  9,  1,  2,
	    15,  5,  1,  3,  7, 14,  6,  9, 11,  8, 12,  2, 10,  0,  4, 13,
	    8,  6,  4,  1,  3, 11, 15,  0,  5, 12,  2, 13,  9,  7, 10, 14,
	    12, 15, 10,  4,  1,  5,  8,  7,  6,  2, 13, 14,  0,  3,  9, 11];
	var sl = [
	     11, 14, 15, 12,  5,  8,  7,  9, 11, 13, 14, 15,  6,  7,  9,  8,
	    7, 6,   8, 13, 11,  9,  7, 15,  7, 12, 15,  9, 11,  7, 13, 12,
	    11, 13,  6,  7, 14,  9, 13, 15, 14,  8, 13,  6,  5, 12,  7,  5,
	      11, 12, 14, 15, 14, 15,  9,  8,  9, 14,  5,  6,  8,  6,  5, 12,
	    9, 15,  5, 11,  6,  8, 13, 12,  5, 12, 13, 14, 11,  8,  5,  6 ];
	var sr = [
	    8,  9,  9, 11, 13, 15, 15,  5,  7,  7,  8, 11, 14, 14, 12,  6,
	    9, 13, 15,  7, 12,  8,  9, 11,  7,  7, 12,  7,  6, 15, 13, 11,
	    9,  7, 15, 11,  8,  6,  6, 14, 12, 13,  5, 14, 13, 13,  7,  5,
	    15,  5,  8, 11, 14, 14,  6, 14,  6,  9, 12,  9, 12,  5, 15,  8,
	    8,  5, 12,  9, 12,  5, 14,  6,  8, 13,  6,  5, 15, 13, 11, 11 ];

	var hl =  [ 0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E];
	var hr =  [ 0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000];

	var bytesToWords = function (bytes) {
	  var words = [];
	  for (var i = 0, b = 0; i < bytes.length; i++, b += 8) {
	    words[b >>> 5] |= bytes[i] << (24 - b % 32);
	  }
	  return words;
	};

	var wordsToBytes = function (words) {
	  var bytes = [];
	  for (var b = 0; b < words.length * 32; b += 8) {
	    bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
	  }
	  return bytes;
	};

	var processBlock = function (H, M, offset) {

	  // Swap endian
	  for (var i = 0; i < 16; i++) {
	    var offset_i = offset + i;
	    var M_offset_i = M[offset_i];

	    // Swap
	    M[offset_i] = (
	        (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
	        (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
	    );
	  }

	  // Working variables
	  var al, bl, cl, dl, el;
	  var ar, br, cr, dr, er;

	  ar = al = H[0];
	  br = bl = H[1];
	  cr = cl = H[2];
	  dr = dl = H[3];
	  er = el = H[4];
	  // Computation
	  var t;
	  for (var i = 0; i < 80; i += 1) {
	    t = (al +  M[offset+zl[i]])|0;
	    if (i<16){
	        t +=  f1(bl,cl,dl) + hl[0];
	    } else if (i<32) {
	        t +=  f2(bl,cl,dl) + hl[1];
	    } else if (i<48) {
	        t +=  f3(bl,cl,dl) + hl[2];
	    } else if (i<64) {
	        t +=  f4(bl,cl,dl) + hl[3];
	    } else {// if (i<80) {
	        t +=  f5(bl,cl,dl) + hl[4];
	    }
	    t = t|0;
	    t =  rotl(t,sl[i]);
	    t = (t+el)|0;
	    al = el;
	    el = dl;
	    dl = rotl(cl, 10);
	    cl = bl;
	    bl = t;

	    t = (ar + M[offset+zr[i]])|0;
	    if (i<16){
	        t +=  f5(br,cr,dr) + hr[0];
	    } else if (i<32) {
	        t +=  f4(br,cr,dr) + hr[1];
	    } else if (i<48) {
	        t +=  f3(br,cr,dr) + hr[2];
	    } else if (i<64) {
	        t +=  f2(br,cr,dr) + hr[3];
	    } else {// if (i<80) {
	        t +=  f1(br,cr,dr) + hr[4];
	    }
	    t = t|0;
	    t =  rotl(t,sr[i]) ;
	    t = (t+er)|0;
	    ar = er;
	    er = dr;
	    dr = rotl(cr, 10);
	    cr = br;
	    br = t;
	  }
	  // Intermediate hash value
	  t    = (H[1] + cl + dr)|0;
	  H[1] = (H[2] + dl + er)|0;
	  H[2] = (H[3] + el + ar)|0;
	  H[3] = (H[4] + al + br)|0;
	  H[4] = (H[0] + bl + cr)|0;
	  H[0] =  t;
	};

	function f1(x, y, z) {
	  return ((x) ^ (y) ^ (z));
	}

	function f2(x, y, z) {
	  return (((x)&(y)) | ((~x)&(z)));
	}

	function f3(x, y, z) {
	  return (((x) | (~(y))) ^ (z));
	}

	function f4(x, y, z) {
	  return (((x) & (z)) | ((y)&(~(z))));
	}

	function f5(x, y, z) {
	  return ((x) ^ ((y) |(~(z))));
	}

	function rotl(x,n) {
	  return (x<<n) | (x>>>(32-n));
	}

	function ripemd160(message) {
	  var H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];

	  if (typeof message == 'string')
	    message = new Buffer(message, 'utf8');

	  var m = bytesToWords(message);

	  var nBitsLeft = message.length * 8;
	  var nBitsTotal = message.length * 8;

	  // Add padding
	  m[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
	  m[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
	      (((nBitsTotal << 8)  | (nBitsTotal >>> 24)) & 0x00ff00ff) |
	      (((nBitsTotal << 24) | (nBitsTotal >>> 8))  & 0xff00ff00)
	  );

	  for (var i=0 ; i<m.length; i += 16) {
	    processBlock(H, m, i);
	  }

	  // Swap endian
	  for (var i = 0; i < 5; i++) {
	      // Shortcut
	    var H_i = H[i];

	    // Swap
	    H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
	          (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
	  }

	  var digestbytes = wordsToBytes(H);
	  return new Buffer(digestbytes);
	}



	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7).Buffer))

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var createHash = __webpack_require__(13)

	var zeroBuffer = new Buffer(128)
	zeroBuffer.fill(0)

	module.exports = Hmac

	function Hmac (alg, key) {
	  if(!(this instanceof Hmac)) return new Hmac(alg, key)
	  this._opad = opad
	  this._alg = alg

	  var blocksize = (alg === 'sha512') ? 128 : 64

	  key = this._key = !Buffer.isBuffer(key) ? new Buffer(key) : key

	  if(key.length > blocksize) {
	    key = createHash(alg).update(key).digest()
	  } else if(key.length < blocksize) {
	    key = Buffer.concat([key, zeroBuffer], blocksize)
	  }

	  var ipad = this._ipad = new Buffer(blocksize)
	  var opad = this._opad = new Buffer(blocksize)

	  for(var i = 0; i < blocksize; i++) {
	    ipad[i] = key[i] ^ 0x36
	    opad[i] = key[i] ^ 0x5C
	  }

	  this._hash = createHash(alg).update(ipad)
	}

	Hmac.prototype.update = function (data, enc) {
	  this._hash.update(data, enc)
	  return this
	}

	Hmac.prototype.digest = function (enc) {
	  var h = this._hash.digest()
	  return createHash(this._alg).update(this._opad).update(h).digest(enc)
	}


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7).Buffer))

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var pbkdf2Export = __webpack_require__(28)

	module.exports = function (crypto, exports) {
	  exports = exports || {}

	  var exported = pbkdf2Export(crypto)

	  exports.pbkdf2 = exported.pbkdf2
	  exports.pbkdf2Sync = exported.pbkdf2Sync

	  return exports
	}


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {module.exports = function(crypto) {
	  function pbkdf2(password, salt, iterations, keylen, digest, callback) {
	    if ('function' === typeof digest) {
	      callback = digest
	      digest = undefined
	    }

	    if ('function' !== typeof callback)
	      throw new Error('No callback provided to pbkdf2')

	    setTimeout(function() {
	      var result

	      try {
	        result = pbkdf2Sync(password, salt, iterations, keylen, digest)
	      } catch (e) {
	        return callback(e)
	      }

	      callback(undefined, result)
	    })
	  }

	  function pbkdf2Sync(password, salt, iterations, keylen, digest) {
	    if ('number' !== typeof iterations)
	      throw new TypeError('Iterations not a number')

	    if (iterations < 0)
	      throw new TypeError('Bad iterations')

	    if ('number' !== typeof keylen)
	      throw new TypeError('Key length not a number')

	    if (keylen < 0)
	      throw new TypeError('Bad key length')

	    digest = digest || 'sha1'

	    if (!Buffer.isBuffer(password)) password = new Buffer(password)
	    if (!Buffer.isBuffer(salt)) salt = new Buffer(salt)

	    var hLen, l = 1, r, T
	    var DK = new Buffer(keylen)
	    var block1 = new Buffer(salt.length + 4)
	    salt.copy(block1, 0, 0, salt.length)

	    for (var i = 1; i <= l; i++) {
	      block1.writeUInt32BE(i, salt.length)

	      var U = crypto.createHmac(digest, password).update(block1).digest()

	      if (!hLen) {
	        hLen = U.length
	        T = new Buffer(hLen)
	        l = Math.ceil(keylen / hLen)
	        r = keylen - (l - 1) * hLen

	        if (keylen > (Math.pow(2, 32) - 1) * hLen)
	          throw new TypeError('keylen exceeds maximum length')
	      }

	      U.copy(T, 0, 0, hLen)

	      for (var j = 1; j < iterations; j++) {
	        U = crypto.createHmac(digest, password).update(U).digest()

	        for (var k = 0; k < hLen; k++) {
	          T[k] ^= U[k]
	        }
	      }

	      var destPos = (i - 1) * hLen
	      var len = (i == l ? r : hLen)
	      T.copy(DK, destPos, 0, len)
	    }

	    return DK
	  }

	  return {
	    pbkdf2: pbkdf2,
	    pbkdf2Sync: pbkdf2Sync
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7).Buffer))

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = (function() {

		"use strict"

		var KSS = __webpack_require__(3);
		
		var Module = __webpack_require__(4);

		var MSXPlay = function(audioCtx, destination) {

			this.audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
			this.destination = destination || this.audioCtx.destination;

			this.sampleRate = this.audioCtx.sampleRate;

			this.loopCount = 2;
			this.fadeTime = 5000;
			this.waveBufferMax = this.sampleRate * 60 * 5;

			// Note: BiquadFilterNode will hungs up if its input audio buffer contains `undefined` value.
			// (`null` value is acceptable but `undefined` makes the problem.)
			//this.filterNode = this.audioCtx.createBiquadFilter();
			//this.filterNode.type = "lowshelf";
			//this.filterNode.frequency.value = 4000;
			//this.filterNode.gain.value = 6.0;
			//this.filterNode.connect(this.destination);

			// Note: Chrome and FireFox compress overflow in GainNode. Safari does not.
			this.gainNode = this.audioCtx.createGain();
			this.gainNode.gain.value = 1.0;
			this.masterVolumeNode = this.audioCtx.createGain();
			this.masterVolumeNode.gain.value = 3.0;

			this.gainNode.connect(this.masterVolumeNode);
			this.masterVolumeNode.connect(this.destination);		

			this.scriptNodeDestination = this.gainNode;

			this.kssplay = Module.ccall('KSSPLAY_new','number',['number','number','number'],[this.sampleRate,1,16]);
			Module.ccall('KSSPLAY_set_silent_limit',null,['number','number'],[this.kssplay,3000]);
			// Set opll quality high
			Module.ccall('KSSPLAY_set_device_quality',null,['number','number','number'],[this.kssplay,2,1]);

			this.kss = null;

			this.maxCalcSamples = this.sampleRate;
			this.calcBuffer = Module._malloc(this.maxCalcSamples * 2);
			this.calcBufferArray = new Int16Array(Module.HEAPU8.buffer, this.calcBuffer, this.sampleRate);

			setInterval(this._generateWaveBackground.bind(this),50);

		};

		MSXPlay.prototype.getTotalTime = function() {
			return Math.round(this.waveTotalSize / this.sampleRate * 1000);
		};

		MSXPlay.prototype.getPlayedTime = function() {
			return Math.round(this.waveReadPos / this.sampleRate * 1000);
		};

		MSXPlay.prototype.getBufferedTime = function() {
			return Math.round(this.waveWritePos / this.sampleRate * 1000);
		};

		MSXPlay.prototype._generateWaveBackground = function() {

			if(this.lastGenerateWaveAt == null) return;

			this.intervalTime = (Date.now() - this.lastGenerateWaveAt);

			var samples = this.sampleRate * this.intervalTime / 1000;

			if(1.0 < this.renderSpeed) {
				samples = Math.floor(samples * this.renderSpeed);
			}

			samples = Math.min(samples,this.maxCalcSamples);

			var start = Date.now();
			var renderedSamples = this._generateWave(samples);

			if(0<renderedSamples) {
				this.renderedTime += renderedSamples / this.sampleRate * 1000;
				this.requiredTime += (Date.now() - start);
				this.renderSpeed = this.renderedTime / this.requiredTime;
			}

			this.lastGenerateWaveAt = Date.now();

		};

		var KSSPLAY_calc = Module.cwrap('KSSPLAY_calc',null,['number','number','number']);
		var KSSPLAY_get_loop_count = Module.cwrap('KSSPLAY_get_loop_count','number',['number']);
		var KSSPLAY_get_fade_flag = Module.cwrap('KSSPLAY_get_fade_flag','number',['number']);
		var KSSPLAY_fade_start = Module.cwrap('KSSPLAY_fade_start',null,['number','number']);
		var KSSPLAY_get_stop_flag = Module.cwrap('KSSPLAY_get_stop_flag','number',['number']);

		MSXPlay.prototype._generateWave = function(samples) {

			if(this.maxCalcSamples<samples) {
				throw new Error();
			}

			if (KSSPLAY_get_stop_flag(this.kssplay) || KSSPLAY_get_fade_flag(this.kssplay) == 2/*KSSPLAY_FADE_END*/) {
				this.waveTotalSize = this.waveWritePos;
			}

			var samples = Math.min(this.waveTotalSize - this.waveWritePos, samples);

			if(0<samples) {
				KSSPLAY_calc(this.kssplay,this.calcBuffer,samples);
				for(var i=0;i<samples;i++) {
					this.waveBuffer[this.waveWritePos++] = this.calcBufferArray[i] / 32768;
				}

				if(KSSPLAY_get_fade_flag(this.kssplay) == 0) {
					var loop = KSSPLAY_get_loop_count(this.kssplay);
					var remains = 1000 * (this.waveTotalSize - this.waveWritePos) / this.sampleRate;
					if (this.loopCount <= loop /*|| (this.fadeTime && remains <= this.fadeTime)*/) {
						KSSPLAY_fade_start(this.kssplay, this.fadeTime);
					}
				}
				
				return samples;
			}
			
			return 0;
			
		};

		MSXPlay.prototype._onAudioProcess = function(event) {

			var i;
			var samples = event.outputBuffer.length;
			var outData = event.outputBuffer.getChannelData(0);

			if(this._state == "playing") {

				// Do not generate wave in this handler because if this handler consume longer time, 
				// the browser often stop to fire the `audioprocess` event. (may be a bug of the browser).

				var bufferRemains = this.waveWritePos - this.waveReadPos;

				if( this.waveWritePos < this.waveTotalSize ) {
					if( bufferRemains < this.sampleRate ) {
						return;
					}
				}

				for(i=0;i<samples;i++) {
					outData[i] = this.waveBuffer[this.waveReadPos];
					if(this.waveReadPos < this.waveWritePos - 1) {
						this.waveReadPos++;
					}
				}

				if(this.waveReadPos == this.waveTotalSize - 1) {
					this._changeState("finished");
				}

			} else {
				for(i=0;i<samples;i++) {
					outData[i] = 0;
				}
			}

		};

		MSXPlay.prototype._changeState = function(newState) {
			if(this._state != newState) {
				this._state = newState;
				// TODO issue stateChanged event;
			}
		};

		MSXPlay.prototype.getState = function() {
			return this._state;
		};

		MSXPlay.prototype.getMasterVolume = function() {
			return this.masterVolumeNode.gain.value;
		};

		MSXPlay.prototype.setMasterVolume = function(value) {
			this.masterVolumeNode.gain.value = value;
		};

		MSXPlay.prototype.getOutputGain = function() {
			this.gainNode.gain.value;
		};

		MSXPlay.prototype.getTitle = function() {
			return this.kss?this.kss.getTitle():"";
		};

		MSXPlay.prototype.setData = function(kss,song,duration,gain) {

			this.kss = kss;
			this.song = song;

			Module.ccall('KSSPLAY_set_data',null,['number','number'],[this.kssplay,kss.obj]);
			Module.ccall('KSSPLAY_reset',null,['number','number','number'],[this.kssplay,song||0,0]);

			if(this.scriptNode) {
				this.scriptNode.disconnect();
				this.scriptNode = null;
			}

			this.renderedTime = 0;
			this.requiredTime = 0;
			this.waveWritePos = 0;
			this.waveReadPos = 0;
			this._state = "standby";
			this.waveBuffer = new Float32Array(this.waveBufferMax);

			if(duration) {
				this.waveTotalSize = Math.min(this.waveBuffer.length, Math.round(this.sampleRate * duration / 1000));
			} else {
				this.waveTotalSize = this.waveBuffer.length;
			}

			if(gain) {
				this.gainNode.gain.value = gain;
			}

			this.renderSpeed = 0.0;

			this._generateWave(this.sampleRate); // pre-buffer 1.0s

			var self = this;
			this.lastGenerateWaveAt = Date.now();
		};

		MSXPlay.prototype.play = function() {
			this.scriptNode = this.audioCtx.createScriptProcessor(8192,0,1);
			this.scriptNode.onaudioprocess = this._onAudioProcess.bind(this);
			this.scriptNode.connect(this.scriptNodeDestination);
			this._changeState("playing");
		};

		MSXPlay.prototype.stop = function() {
			if(this.scriptNode) {
				this.scriptNode.disconnect();
				this.scriptNode = null;
			}
			this._changeState("standby");
		};

		MSXPlay.prototype.pause = function() {
			if(this._state == "playing") {
				this.scriptNode.disconnect();
				this._changeState("paused");
			}
		};

		MSXPlay.prototype.resume = function() {
			if(this._state == "paused") {
				this.scriptNode.connect(this.scriptNodeDestination);
				this._changeState("playing");
			}
		};

		MSXPlay.prototype.isPlaying = function() {
			return this._state == "playing";
		};

		MSXPlay.prototype.isPaused = function() {
			return this._state == "paused";
		};

		MSXPlay.prototype.seekTo = function(posInMs) {
			var seekPos = Math.round(this.sampleRate * posInMs / 1000);
			if(seekPos < this.waveWritePos) {
				this.waveReadPos = seekPos;
			}
		};

		MSXPlay.prototype.release = function() {
			Module.ccall('KSSPLAY_delete',null,['number'],[this.kssplay]);
			this.kssplay = null;
			this.audioCtx.close();
			Module._free(this.calcBuffer);
		};

		return MSXPlay;

	}());


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["MGSC"] = __webpack_require__(31);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = (function(){
		"use strict"
		var Module = __webpack_require__(32);
		var encoding = __webpack_require__(5);

		return {
			compile:function(mml) {

				var mmlbuf = encoding.convert(mml,{from:'UNICODE',to:'SJIS',type:'arraybuffer'});

				if(32768 < mmlbuf.length) {
					throw new Error("MML source is too long.");
				}

				var inp = Module._malloc(32768);
				Module.HEAPU8.set(mmlbuf,inp,mmlbuf.length);

				var ptr = Module._malloc(32768);
				var log = Module._malloc(32768);
				var size = Module.ccall('MGSC_compile', 'number', ['number','number','number'], [inp,ptr,log]);
				var mgs = new Uint8Array(size);
				mgs.set(new Uint8Array(Module.HEAPU8.buffer,ptr,size));
				
				var message = Module.AsciiToString(log).replace(/^\s*|\s*$/,'');

				Module._free(inp);
				Module._free(ptr);
				Module._free(log);
				
				return { mgs:mgs, message:message };
			}
		};
	}());


/***/ },
/* 32 */
/***/ function(module, exports) {

	var asm=(function(global,env,buffer) {
	"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.___dso_handle|0;var o=0;var p=0;var q=0;var r=0;var s=global.NaN,t=global.Infinity;var u=0,v=0,w=0,x=0,y=0.0,z=0,A=0,B=0,C=0.0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=global.Math.floor;var O=global.Math.abs;var P=global.Math.sqrt;var Q=global.Math.pow;var R=global.Math.cos;var S=global.Math.sin;var T=global.Math.tan;var U=global.Math.acos;var V=global.Math.asin;var W=global.Math.atan;var X=global.Math.atan2;var Y=global.Math.exp;var Z=global.Math.log;var _=global.Math.ceil;var $=global.Math.imul;var aa=global.Math.min;var ba=global.Math.clz32;var ca=env.abort;var da=env.assert;var ea=env.invoke_iiiiiiii;var fa=env.invoke_iiii;var ga=env.invoke_viiiii;var ha=env.invoke_iiiiiid;var ia=env.invoke_vi;var ja=env.invoke_vii;var ka=env.invoke_iiiiiii;var la=env.invoke_iiiiid;var ma=env.invoke_ii;var na=env.invoke_viii;var oa=env.invoke_v;var pa=env.invoke_iiiiiiiii;var qa=env.invoke_iiiii;var ra=env.invoke_viiiiii;var sa=env.invoke_iii;var ta=env.invoke_iiiiii;var ua=env.invoke_viiii;var va=env._fabs;var wa=env._strftime;var xa=env._pthread_cond_wait;var ya=env._pthread_key_create;var za=env._abort;var Aa=env.___cxa_guard_acquire;var Ba=env.___setErrNo;var Ca=env.___assert_fail;var Da=env.___cxa_allocate_exception;var Ea=env.__ZSt18uncaught_exceptionv;var Fa=env.__isLeapYear;var Ga=env.___cxa_guard_release;var Ha=env.__addDays;var Ia=env._strftime_l;var Ja=env._emscripten_set_main_loop_timing;var Ka=env._sbrk;var La=env.___cxa_begin_catch;var Ma=env._emscripten_memcpy_big;var Na=env.___resumeException;var Oa=env.___cxa_find_matching_catch;var Pa=env._sysconf;var Qa=env._pthread_getspecific;var Ra=env.__arraySum;var Sa=env._pthread_self;var Ta=env._pthread_mutex_unlock;var Ua=env._pthread_once;var Va=env.___syscall54;var Wa=env.___unlock;var Xa=env._pthread_cleanup_pop;var Ya=env._pthread_cond_broadcast;var Za=env._emscripten_set_main_loop;var _a=env._pthread_setspecific;var $a=env.___cxa_atexit;var ab=env.___cxa_throw;var bb=env.___lock;var cb=env.___syscall6;var db=env._pthread_cleanup_push;var eb=env.___cxa_pure_virtual;var fb=env._time;var gb=env._pthread_mutex_lock;var hb=env._atexit;var ib=env.___syscall140;var jb=env.___syscall145;var kb=env.___syscall146;var lb=0.0;
	// EMSCRIPTEN_START_FUNCS

	// EMSCRIPTEN_END_FUNCS
	var mb=[ir,jl,nl,hm,lm,qm,sm,ir];var nb=[jr,Lh,Qh,Uh,je,qg,zf,yf,xf,Af,_h,di,Lg,hi,Wg,Yi,bj,Im,Nm,wn,yn,Bn,fn,ln,nn,qn,ng,jr,jr,jr,jr,jr];var ob=[kr,ve,ue,re];var pb=[lr,wm,Cm,lr];var qb=[mr,Qb,cc,ac,dc,bc,ec,Li,Oi,Mi,Pi,Ni,Qi,ji,li,ki,mi,xi,zi,yi,Ai,fc,gc,_c,td,Xd,Yd,de,ge,ee,fe,he,ie,Wh,Ig,Og,Hh,Tg,Zg,Bh,Dh,Ih,Xh,si,ui,ti,vi,Ei,Gi,Fi,Hi,Ch,Ri,Ti,Vi,cn,Zi,_i,cj,dj,rj,sj,Lj,Mj,_j,$j,lk,mk,Kk,Lk,gl,il,ll,ml,pl,ql,Al,Bl,Ll,Ml,Wl,Xl,fm,gm,om,pm,um,vm,Am,Bm,Gm,Hm,Lm,Mm,Tm,Um,tn,un,Po,Ln,mo,no,oo,po,Ui,bn,en,Dn,Tn,$n,io,jo,Ee,jg,kg,Bg,im,dn,Yp,dq,eq,fq,gq,hq,iq,fh,rh,vg];var rb=[nr,Kh,Jg,Ng,Ug,Yg,Zh,tl,ul,vl,wl,yl,zl,El,Fl,Gl,Hl,Jl,Kl,Pl,Ql,Rl,Sl,Ul,Vl,_l,$l,am,bm,dm,em,Km,Pm,uo,wo,yo,vo,xo,zo,nr,nr,nr,nr,nr,nr,nr,nr,nr,nr,nr,nr,nr,nr,nr,nr,nr,nr,nr,nr,nr,nr,nr,nr,nr];var sb=[or,ej,fj,gj,hj,ij,jj,kj,lj,mj,nj,oj,tj,uj,vj,wj,xj,yj,zj,Aj,Bj,Cj,Dj,Sj,Uj,dk,fk,ok,pk,qk,sk,uk,Nk,Ok,Pk,Rk,Tk,zm,Fm,or,or,or,or,or,or,or,or,or,or,or,or,or,or,or,or,or,or,or,or,or,or,or,or,or];var tb=[pr,Vj,Yj,gk,ik,pr,pr,pr];var ub=[qr,Oh,Ph,jc,Sh,Md,Nd,Od,Pd,Id,Jd,Kd,Ld,Zd,wf,Kg,ci,ei,fi,bi,Pg,Qg,Vg,Rh,_g,$g,nk,Bo,Do,Fo,Lo,No,Ho,Jo,Mk,Co,Eo,Go,Mo,Oo,Io,Ko,rl,sl,xl,Cl,Dl,Il,Nl,Ol,Tl,Yl,Zl,cm,Pn,Qn,Sn,qo,so,ro,to,Hn,In,Kn,Xn,Yn,_n,eo,fo,ho,Fd,Hd,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr,qr];var vb=[rr,qd,md,od,Cd,rr,rr,rr];var wb=[sr,tr,Ce,De];var xb=[ur,wk,Vk,Mn,Nn,En,Fn,Un,Vn,ao,bo,ur,ur,ur,ur,ur];var yb=[vr,bd,ad,vd,wd,An,gn,hn,jn,pn,vr,vr,vr,vr,vr,vr];var zb=[wr,hc,ye,xe,we,$h,Mh,Jm,Om,wr,wr,wr,wr,wr,wr,wr];var Ab=[xr,kc,lc,gi,Mg,Rg,ii,Th,Xg,ah,Vh,vn,xn,zn,kn,mn,on,ld,nd,pd,Bd,xr,xr,xr,xr,xr,xr,xr,xr,xr,xr,xr];var Bb=[yr,Wi,$i,Nj,Oj,Tj,Zj,ak,bk,ek,jk,Cn,On,Rn,rn,Gn,Jn,Wn,Zn,co,go,yr,yr,yr,yr,yr,yr,yr,yr,yr,yr,yr];var Cb=[zr,ic,le,me,oe,ai,Nh,Xi,aj,zr,zr,zr,zr,zr,zr,zr];return{___cxa_can_catch:ze,_fflush:Ff,_MGSC_compile:Mb,___cxa_is_pointer_type:Ae,_i64Add:Fq,_memmove:Jq,_i64Subtract:Dq,_memset:Eq,_malloc:ug,_memcpy:Hq,_bitshift64Lshr:Gq,_free:vg,___errno_location:Ne,_bitshift64Shl:Iq,__GLOBAL__I_000101:Gg,__GLOBAL__sub_I_iostream_cpp:Hg,runPostSets:Cq,stackAlloc:Db,stackSave:Eb,stackRestore:Fb,establishStackSpace:Gb,setThrew:Hb,setTempRet0:Kb,getTempRet0:Lb,dynCall_iiiiiiii:Tq,dynCall_iiii:Uq,dynCall_viiiii:Vq,dynCall_iiiiiid:Wq,dynCall_vi:Xq,dynCall_vii:Yq,dynCall_iiiiiii:Zq,dynCall_iiiiid:_q,dynCall_ii:$q,dynCall_viii:ar,dynCall_v:br,dynCall_iiiiiiiii:cr,dynCall_iiiii:dr,dynCall_viiiiii:er,dynCall_iii:fr,dynCall_iiiiii:gr,dynCall_viiii:hr}})


	// EMSCRIPTEN_END_ASM
	(Module.asmGlobalArg,Module.asmLibraryArg,buffer);var ___cxa_can_catch=Module["___cxa_can_catch"]=asm["___cxa_can_catch"];var _fflush=Module["_fflush"]=asm["_fflush"];var runPostSets=Module["runPostSets"]=asm["runPostSets"];var _MGSC_compile=Module["_MGSC_compile"]=asm["_MGSC_compile"];var ___cxa_is_pointer_type=Module["___cxa_is_pointer_type"]=asm["___cxa_is_pointer_type"];var _i64Add=Module["_i64Add"]=asm["_i64Add"];var _memmove=Module["_memmove"]=asm["_memmove"];var _i64Subtract=Module["_i64Subtract"]=asm["_i64Subtract"];var _memset=Module["_memset"]=asm["_memset"];var _malloc=Module["_malloc"]=asm["_malloc"];var _memcpy=Module["_memcpy"]=asm["_memcpy"];var __GLOBAL__sub_I_iostream_cpp=Module["__GLOBAL__sub_I_iostream_cpp"]=asm["__GLOBAL__sub_I_iostream_cpp"];var _bitshift64Lshr=Module["_bitshift64Lshr"]=asm["_bitshift64Lshr"];var _free=Module["_free"]=asm["_free"];var __GLOBAL__I_000101=Module["__GLOBAL__I_000101"]=asm["__GLOBAL__I_000101"];var ___errno_location=Module["___errno_location"]=asm["___errno_location"];var _bitshift64Shl=Module["_bitshift64Shl"]=asm["_bitshift64Shl"];var dynCall_iiiiiiii=Module["dynCall_iiiiiiii"]=asm["dynCall_iiiiiiii"];var dynCall_iiii=Module["dynCall_iiii"]=asm["dynCall_iiii"];var dynCall_viiiii=Module["dynCall_viiiii"]=asm["dynCall_viiiii"];var dynCall_iiiiiid=Module["dynCall_iiiiiid"]=asm["dynCall_iiiiiid"];var dynCall_vi=Module["dynCall_vi"]=asm["dynCall_vi"];var dynCall_vii=Module["dynCall_vii"]=asm["dynCall_vii"];var dynCall_iiiiiii=Module["dynCall_iiiiiii"]=asm["dynCall_iiiiiii"];var dynCall_iiiiid=Module["dynCall_iiiiid"]=asm["dynCall_iiiiid"];var dynCall_ii=Module["dynCall_ii"]=asm["dynCall_ii"];var dynCall_viii=Module["dynCall_viii"]=asm["dynCall_viii"];var dynCall_v=Module["dynCall_v"]=asm["dynCall_v"];var dynCall_iiiiiiiii=Module["dynCall_iiiiiiiii"]=asm["dynCall_iiiiiiiii"];var dynCall_iiiii=Module["dynCall_iiiii"]=asm["dynCall_iiiii"];var dynCall_viiiiii=Module["dynCall_viiiiii"]=asm["dynCall_viiiiii"];var dynCall_iii=Module["dynCall_iii"]=asm["dynCall_iii"];var dynCall_iiiiii=Module["dynCall_iiiiii"]=asm["dynCall_iiiiii"];var dynCall_viiii=Module["dynCall_viiii"]=asm["dynCall_viiii"];Runtime.stackAlloc=asm["stackAlloc"];Runtime.stackSave=asm["stackSave"];Runtime.stackRestore=asm["stackRestore"];Runtime.establishStackSpace=asm["establishStackSpace"];Runtime.setTempRet0=asm["setTempRet0"];Runtime.getTempRet0=asm["getTempRet0"];function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}ExitStatus.prototype=new Error;ExitStatus.prototype.constructor=ExitStatus;var initialStackTop;var preloadStartTime=null;var calledMain=false;dependenciesFulfilled=function runCaller(){if(!Module["calledRun"])run();if(!Module["calledRun"])dependenciesFulfilled=runCaller};Module["callMain"]=Module.callMain=function callMain(args){assert(runDependencies==0,"cannot call main when async dependencies remain! (listen on __ATMAIN__)");assert(__ATPRERUN__.length==0,"cannot call main when preRun functions remain to be called");args=args||[];ensureInitRuntime();var argc=args.length+1;function pad(){for(var i=0;i<4-1;i++){argv.push(0)}}var argv=[allocate(intArrayFromString(Module["thisProgram"]),"i8",ALLOC_NORMAL)];pad();for(var i=0;i<argc-1;i=i+1){argv.push(allocate(intArrayFromString(args[i]),"i8",ALLOC_NORMAL));pad()}argv.push(0);argv=allocate(argv,"i32",ALLOC_NORMAL);try{var ret=Module["_main"](argc,argv,0);exit(ret,true)}catch(e){if(e instanceof ExitStatus){return}else if(e=="SimulateInfiniteLoop"){Module["noExitRuntime"]=true;return}else{if(e&&typeof e==="object"&&e.stack)Module.printErr("exception thrown: "+[e,e.stack]);throw e}}finally{calledMain=true}};function run(args){args=args||Module["arguments"];if(preloadStartTime===null)preloadStartTime=Date.now();if(runDependencies>0){return}preRun();if(runDependencies>0)return;if(Module["calledRun"])return;function doRun(){if(Module["calledRun"])return;Module["calledRun"]=true;if(ABORT)return;ensureInitRuntime();preMain();if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();if(Module["_main"]&&shouldRunNow)Module["callMain"](args);postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout((function(){setTimeout((function(){Module["setStatus"]("")}),1);doRun()}),1)}else{doRun()}}Module["run"]=Module.run=run;function exit(status,implicit){if(implicit&&Module["noExitRuntime"]){return}if(Module["noExitRuntime"]){}else{ABORT=true;EXITSTATUS=status;STACKTOP=initialStackTop;exitRuntime();if(Module["onExit"])Module["onExit"](status)}if(ENVIRONMENT_IS_NODE){process["stdout"]["once"]("drain",(function(){process["exit"](status)}));console.log(" ");setTimeout((function(){process["exit"](status)}),500)}else if(ENVIRONMENT_IS_SHELL&&typeof quit==="function"){quit(status)}throw new ExitStatus(status)}Module["exit"]=Module.exit=exit;var abortDecorators=[];function abort(what){if(what!==undefined){Module.print(what);Module.printErr(what);what=JSON.stringify(what)}else{what=""}ABORT=true;EXITSTATUS=1;var extra="\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.";var output="abort("+what+") at "+stackTrace()+extra;if(abortDecorators){abortDecorators.forEach((function(decorator){output=decorator(output,what)}))}throw output}Module["abort"]=Module.abort=abort;if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}var shouldRunNow=true;if(Module["noInitialRun"]){shouldRunNow=false}run()






	/*** EXPORTS FROM exports-loader ***/
	module.exports = Module;

/***/ }
/******/ ]);