Robin.ui = (function () {
	var scriptEditor,
		statesEditor,
		outputEditor,
		controlScriptEditor, 
		chatOutputEditor,
		chatMessageAutoCompleter,
		outer;
		
	// var words = [];

	function text_to_hyperlink(input_id) {
	    var text_entry = document.getElementById(input_id);
	    var text_selected;

	    // for IE
	    if (document.selection != undefined) {
	        text_entry.focus();
	        var sel = document.selection.createRange();
	        text_selected = sel.text;
	        }

	    // others browsers
	    else if (text_entry.selectionStart != undefined) {
	        var selection_pos_start = text_entry.selectionStart;
	        var selection_pos_end = text_entry.selectionEnd;
	        text_selected = text_entry.value.substring(selection_pos_start, selection_pos_end);
	        selection_prefix = text_entry.value.substring(0, selection_pos_start);
	        selection_sufix = text_entry.value.substring(selection_pos_end, text_entry.length );
	        }

	    text_entry.value = selection_prefix + '<a href="' + text_selected + '">' + text_selected + '</a>' + selection_sufix;
	    }
	
	function shortcuts(){

         globalShortcut.register('CommandOrControl+Q', () => {
         	console.log("fuck!!");
         	window.close()
            // ipcRenderer.send('openFile', () => {
            //    console.log("Event sent.");
            // })
            
            // ipcRenderer.on('fileData', (event, data) => {
            //    document.write(data)
            // })
         })
	}

	function init_ (outer_){
		//App key binding
		outer = outer_
		shortcuts()
		this.keyBinding = function(e) {
			if (e.ctrlKey && e.keyCode == 'S'.charCodeAt(0)) {
				e.preventDefault();
				Robin.core.projects.save(undefined);
				return;
			}
			if (e.ctrlKey && e.altKey && e.keyCode == 'D'.charCodeAt(0)) {
				e.preventDefault();
				cm = scriptEditor;
				let cursor = cm.doc.getCursor();
				let lineContent = cm.doc.getLine(cursor.line);
				CodeMirror.commands.goLineEnd(cm);
				CodeMirror.commands.newlineAndIndent(cm);
				cm.doc.replaceSelection(lineContent);
				cm.doc.setCursor(cursor.line + 1, cursor.ch)
				return;
			}			
			if (e.ctrlKey && e.altKey && e.keyCode == 'Q'.charCodeAt(0)) {
				e.preventDefault();
				Robin.ui.runQuery();
				return;
			}
			if (e.ctrlKey && e.altKey && e.keyCode == 'X'.charCodeAt(0)) {
				e.preventDefault();
				Robin.ui.output.clear();
				return;
			}
			if (e.ctrlKey && e.altKey && e.keyCode == 'W'.charCodeAt(0)) {
				e.preventDefault();
//				$('#tt').tabs("select", "Output");
				Robin.ui.runControlScript();
				return;
			}
			if (e.keyCode == 115) {//F4
				e.preventDefault();
				let t = $('#tt').tabs("getSelected");
				let i = $('#tt').tabs("getTabIndex", t);
				cm = outputEditor;
				if (i===4){
					let doFullscreen = !cm.getOption("fullScreen");
					cm.setOption("fullScreen", doFullscreen);
					if(doFullscreen) {
							cm.setCursor(0, 0);                        
							cm.setCursor(cm.lineCount(), 0);  
							cm.focus();
					}
					else
						outer.query_textarea.focus();
				}
				else{
					$('#tt').tabs("select", 4);
					outer.query_textarea.focus();
				}
				return;
			}
			if (e.keyCode == 114) {//F3
				e.preventDefault();
				let t = $('#tt').tabs("getSelected");
				let i = $('#tt').tabs("getTabIndex", t);
				cm = controlScriptEditor;
				cm.setOption("fullScreen", i===3 ? !cm.getOption("fullScreen") : !$('#tt').tabs("select", 3));
				cm.focus();
				return;
			}
			if (e.keyCode == 113) {//F2
				e.preventDefault();
				let t = $('#tt').tabs("getSelected");
				let i = $('#tt').tabs("getTabIndex", t);
				cm=scriptEditor;
				cm.setOption("fullScreen", i===2 ? !cm.getOption("fullScreen") : !$('#tt').tabs("select", 2));
				cm.focus();
				return;
			}
			if (e.keyCode == 112) {//F1
				e.preventDefault();
				$('#tt').tabs("select", 1);
				outer.chatinput_textarea.focus();
				return;
			}
			if (e.ctrlKey && e.shiftKey && e.keyCode==32) {//shift+ctrl+space
				e.preventDefault();
				let t = $('#tt').tabs("getSelected");
				let i = $('#tt').tabs("getTabIndex", t);
				let c = $('#tt').tabs("tabs").length;
				if (i > 0 ){
					i--;      
					$('#tt').tabs("select", i);
				}
				else
					$('#tt').tabs("select", c-1);

				return;
			}
			if (e.shiftKey && e.keyCode==32) {//shift+space
				e.preventDefault();

				let t = $('#tt').tabs("getSelected");
				let i = $('#tt').tabs("getTabIndex", t);
				let c = $('#tt').tabs("tabs").length;
				if (i < c-1){
					i++;      
					$('#tt').tabs("select", i);
				}
				else
					$('#tt').tabs("select", 0);

				return;
			}
		};

		this.initializeProject = function(scriptText, statesText, queryText, controlscriptText){
			let safeSetter = (vr, ctrl) => {if (vr !== undefined) 		ctrl.setValue(vr);};
			safeSetter(scriptText, scriptEditor);
			safeSetter(statesText, statesEditor);
			safeSetter(controlscriptText, controlScriptEditor);
			query_textarea.value = queryText;
		};

		scriptEditor = CodeMirror.fromTextArea(outer.script_textarea, {    
			mode: {name: "octave",
				version: 2,
				singleLineStringErrors: false},
			lineNumbers: true,
			matchBrackets: true,
			lineWrapping: true,
			autoRefresh: true,
			extraKeys: {
				"Esc": function(cm) {
					cm.setOption("fullScreen", !cm.getOption("fullScreen"));
				},
			}, 
			styleActiveLine: true
		});
		statesEditor = CodeMirror.fromTextArea(outer.statevars_textarea, {    
			mode: {name: "octave",
				version: 2,
				singleLineStringErrors: false},
			lineNumbers: true,
			matchBrackets: true,
			lineWrapping: true,
			autoRefresh: true,
			styleActiveLine: true
		});
		controlScriptEditor = CodeMirror.fromTextArea(outer.controlscript_textarea, {    
			mode: {name: "javascript",
				//version: 2,
				singleLineStringErrors: true},
			lineNumbers: true,
			matchBrackets: true,
			lineWrapping: true,
			autoRefresh: true,
			styleActiveLine: true
		});
		outputEditor = CodeMirror.fromTextArea(outer.output_textarea, {    
			mode: {name: "output",
				version: 2,
				singleLineStringErrors: false},
	//        lineNumbers: true,
			matchBrackets: false,
			lineWrapping: true,
			styleActiveLine: false,
			readOnly: "nocursor",
	//		foldCode: true,
	//		
	//		foldGutter: {
	//			rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.indent, CodeMirror.fold.comment)
	//		},
	//		foldGutter: true,
	//    	gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
	//		foldOptions: [];
			extraKeys: {
				"Esc": function(cm) {
					outer.query_textarea.focus();
					let doFullscreen = !cm.getOption("fullScreen");
					cm.setOption("fullScreen", doFullscreen);
					if (doFullscreen){
						cm.setCursor(0, 0);                        
						cm.setCursor(cm.lineCount(), 0);
					}   
					else 
						outer.query_textarea.focus();
				},
			},
			autoRefresh: true,
			scrollPastEnd: true
		});
		// chatOutputEditor = CodeMirror.fromTextArea(outer.chatoutput_textarea, {    
		// 	mode: {name: "chatoutput",
		// 		version: 2,
		// 		singleLineStringErrors: false},
		// 	matchBrackets: false,
		// 	lineWrapping: true,
		// 	styleActiveLine: false,
		// 	autoRefresh: true,
		// 	readOnly: "nocursor",
		// 	scrollPastEnd: true
		// });
		outer.query_textarea.addEventListener('keydown', (e) => {
			if (e.keyCode == 13){
				e.preventDefault();
				Robin.ui.runQuery();
			}
			else if (e.keyCode == 27){
				e.preventDefault();
				outputEditor.focus();
				outputEditor.setOption("fullScreen", true);
			}
		});
		outer.chatinput_textarea.addEventListener('keydown', (e) => {
			if (e.keyCode == 13){
				if (chatMessageAutoCompleter.opened && chatMessageAutoCompleter.selected)
					return;
				e.preventDefault();
				Robin.ui.chat.say();
			}
		});

		outer.chatinput_textarea.addEventListener('click', (e) => {
			//text_to_hyperlink('chatoutput_textarea');
		});

		let theme="abcdef";
		scriptEditor.setOption("theme", theme);
		controlScriptEditor.setOption("theme", theme);
		statesEditor.setOption("theme", theme);
		outputEditor.setOption("theme", "dracula");
// 		chatOutputEditor.setOption("theme", "dracula");
		outputEditor.setSize("100%", "100%");
		// chatOutputEditor.setSize("100%", "100%");
		scriptEditor.setSize("99%", "98%");
		statesEditor.setSize("99%", "95%");
		controlScriptEditor.setSize("99%", "93%");

		Robin.chatbot.printMessageFunc = (message) => {
			if (message.match(/robi (?:gambit|topic)*/)) {
				// chatOutputEditor.setCursor(chatOutputEditor.lineCount(), 0);
				outer.chatinput_textarea.value = "";
				// setTimeout(function(){
				// 	// chatOutputEditor.refresh();
				// }, 1000);
				return;
			}
			
			Robin.ui.chat.output.append(message);
		};
		chatMessageAutoCompleter = new Awesomplete(outer.chatinput_textarea, {
			filter: function(text, input) {
				return Awesomplete.FILTER_CONTAINS(text, input.match(/[^,\.\s\?]*$/)[0]);
			},

			item: function(text, input) {
				return Awesomplete.ITEM(text, input.match(/[^,\.\s\?]*$/)[0]);
			},

			replace: function(text) {
				var matches = this.input.value.match(/^(.*)\b\w+$/);
				var i = matches.length;
				var before = "";
				if (matches[1] != "")
					before = matches[1];
				this.input.value = before + text + " ";
			}
		});

		outer.scriptLoadInput.addEventListener("change", function(val){
			var files = val.target.files;
			if (files.length <= 0)
				return;
			script_file = files[0];
			var reader = new FileReader();
			reader.onload = function (e) {
				scriptEditor.setValue(e.target.result);
			};
			reader.readAsText(script_file);
		}, false);
		
		outer.statesLoadInput.addEventListener("change", function(val){
			var files = val.target.files;
			if (files.length <= 0)
				return;
			states_file = files[0];
			var reader = new FileReader();
			reader.onload = function (e) {
				statesEditor.setValue(e.target.result);
			};
			reader.readAsText(states_file);
		}, false);

		outer.sayChatInputButton.addEventListener("click", function(val){
			Robin.ui.chat.say();
		}, false);
		outer.clearChatInputButton.addEventListener("click", function(val){
			Robin.ui.chat.output.clear();
		}, false);
		
		getSafely = function (dataEntry){
			let s =  (dataEntry !== undefined ) ? JSON.parse(dataEntry) : "";
			if (typeof s !== 'string')
				return s.toString();
			return s;
		};

		document.onkeydown = this.keyBinding;
			this.initializeProject(
			getSafely( localStorage.scriptText ),
			getSafely( localStorage.statesText ),
			getSafely( localStorage.queryText ),
			getSafely( localStorage.controlscriptText )
		);
		//$.notify.defaults( "showDuration: 1000,  autoHideDelay: 500, style: 'metro'");	

		$('#saveProjectMenu').click(()=>{Robin.core.projects.save();});
		$('#openScriptMenu').click(()=>{Robin.ui.script.load();});
		$('#openStatesMenu').click(()=>{Robin.ui.loadStatesFrom();});
		$('#runControlScriptMenu').click(()=>{runControlScript();});
		$('#queryAIMenu').click(()=>{Robin.ui.runQuery();});
		$('#toggleDebugOutputMenu').click(()=>{Robin.settings.showDebugInOutput = !Robin.settings.showDebugInOutput;});
		$('#aboutMenu').click(()=>{$.notify("Roman AI\n Version 0.3\n 2018 Copyright. Roman Pylypchuk. All rights reserved ", "info");});
		$('form').submit(function(){
          	Robin.ui.chat.say(); //
        });
		console.debug("# Workspace loaded");
		Robin.ui.runControlScript();

	}

	function addToAutocomplete(list, word) {
		if (word.length<=3) 
			return;
		let ws = word.split(/[,\.\?\s!]/g);
		word = word.trim();
		if( ws != null)
			ws.forEach( (w => {
				if (!list.includes(w) && w.length>3)
					list.push(w);
			} ));
		if (!list.includes(word) )
			list.push(word);
	}

    return {
		chat: {
			output: {
				clear: function()  {
					outer.chatoutput_textarea.value = "";
				},
				append: function(message)  {
					let text = message;
					text = text.replace(xRE `(?:\r\n|\r|\n)` `mmg`, "<br>")
					let m = text.match(xRE `<a.*data-file='(.*)'>(.*)<\/a>` `mm`);
					if (m) {
						let file="";
						let name=""
						file = m[1] 
						name = m[2]
						let newLink = `<a onclick="Robin.ui.chat.output.showFile('${file}');" date-file='${file}' style="text-decoration: underline; cursor: pointer;">${name}</a>`
						text = text.replace(m[0], newLink)
					}
					
					text = `[${moment().format("HH:mm:ss")}] ${text}`
					outer.chatoutput_textarea.innerHTML = text+`<br>${outer.chatoutput_textarea.innerHTML}`;
				},
				showFile: function(fileName)  {
					debugger
					let s = Robin.db.get('files', fileName)
					Robin.ui.showDocument(s)
				},
				appendHtml: function(message)  {
					// let preciding=outer.chatoutput_textarea.value;
		   //          let queryMatch = preciding.match('\n$');
					// let text = preciding;
		   //          if (!queryMatch && preciding.length !== 0) 
		   //              text = message+'\n' +text;
					// else
					// 	text = message+text;
					let text = message;
					text = `[${moment().format("HH:mm:ss")}] ${text}`
					outer.chatoutput_textarea.innerHTML = text+`<br>${outer.chatoutput_textarea.innerHTML}`;
				}
			},
			say: function()  {
				addToAutocomplete(chatMessageAutoCompleter._list, outer.chatinput_textarea.value);
				Robin.chatbot.say(outer.chatinput_textarea.value);
				outer.chatinput_textarea.focus();
				outer.chatinput_textarea.value = "";
			}
		},
        script: {
			get text() { return scriptEditor.getValue() },
			load: function()  {
				if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
					alert("Some usupported API");
					return;
				}
				var script_input = document.getElementById("scriptLoadInput");
				script_input.click();
			},
        },
        get states() {
            return statesEditor.getValue();
        },
		
        get query() {
            return queryEditor.getValue();
        },
        get controlScript() {
            return controlScriptEditor.getValue();
        },
		output: {
			fullscreen: () => {
				outputEditor.setOption('fullScreen', true);
				outputEditor.focus();
			},
			clear: () => {
				outputEditor.setValue("");
				outer.query_textarea.focus();
			}
		},
		notify(text){
			iziToast.info({
				title: '',
				messageSize: '16',
				message: text,
				theme: 'light',
				position: 'topRight',
				timeout: 9000,
				progressBar: false
			})
		},
		showDocument(text){
			var pre = document.createElement('pre');
			//custom style.
			pre.style.maxHeight = "400px";
			pre.style.margin = "0";
			pre.style.padding = "24px";
			pre.style.whiteSpace = "pre-wrap";
			pre.style.textAlign = "justify";
			pre.appendChild(document.createTextNode(text));
			var target = pre
			var wrap = document.createElement('div');
			wrap.appendChild(target.cloneNode(true));
			
			alertify.alert(wrap.innerHTML) 
				.set({labels:{ok:'Ok'}, padding: false});
		},
        log: function(message) {
            var cm = outputEditor;
            if (cm === undefined)
                return;
            let preciding;
            var text = "";
            let queryMatch;
            if (typeof (message === 'string')) {
                text += message;
            } else
            if (typeof (message === 'object')) {
                text = ((JSON && JSON.stringify ? JSON.stringify(message) : message));
                queryMatch = text.match('^(\"+)(.+)(\"$)');
                if (queryMatch)
                    text = queryMatch[2];
            }             
            
            preciding=cm.getValue();
            queryMatch = preciding.match('\n$');
            if (!queryMatch && preciding.length !== 0) {
                text = '\n' + text;
            }
            //text = text.replace("\\n", '\n');
            outputEditor.setValue(outputEditor.getValue()+text);
            
            cm.setCursor(cm.lineCount(), 0);
            //cm.getScrollerElement().scrollTop = cm.getScrollerElement().scrollHeight;
        },
        debug: function(message) {
            if(Robin.settings.showDebugInOutput)
                console.log(`[${moment().format("HH:mm")}] ${message}`);
        },
        runQuery: function () {
            $('#tt').tabs("select", "Output");
            Robin.ai.query(
                scriptEditor.getValue(),
                query_textarea.value,
                statesEditor.getValue()//,
            );
            $('#menu').panel('refresh');
        },
        runControlScript: function() {
            try {
                let s = controlScriptEditor.getValue();
                eval(s);
            } catch (error) {
            	
                console.debug(">> Exception executing control script :( "+error.toString());
            }
            // $('#menu').panel('refresh');
        },
		loadStatesFrom: function() {
        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            alert("Some usupported API");
            return;
        }
        var input = document.getElementById("statesLoadInput");
        input.click();
    },
		queryDefaultScript: function (query){

        Robin.ai.query(
            scriptEditor.getValue(),
            query,
			statesEditor.getValue());
    },
		init: function(outer){ init_(outer); }
    };
})();

module.exports = Robin.ui;