ldap.screens["numpad-screen"] = (function() {
    var dom = ldap.dom,
        main = ldap.main,
        firstRun = true,
		data_owner = undefined,
		data_pos = 0,
		data_template = "HH:MM";

    function setup() {		
        dom.bind("#numpad-screen", "click", function(e) {
            if (e.target.nodeName.toLowerCase() === "button") {
				handle_keypad(e.target);
            }
        });
    }

    function run() {
        if (firstRun) {
            setup();
            firstRun = false;
			$("#numpad_return").html(data_owner);
        } else {
        	$("#numpad_return").html(data_owner);			
        }
    }
	
	function handle_keypad(event_target){
		var cur_val;
		
		if (event_target.id === "numpad_back"){				// we got the go back command to cancel our entry
			data_pos = 0;
			data_owner = undefined;
			main.showScreen("mode-menu");
			
		} else if (event_target.id === "numpad_return"){	// we got the accept/return command to accept our data
			data_pos = 0;
			var test = isValidTime($("#numpad_return").html());
			if (test){
				data_owner = $("#numpad_return").html();
				main.showScreen("mode-menu");
			} else {
				$("#numpad_return").css("color","#FF0000");
			}
			
		} else {
			// must be a valid data entry
			var key = event_target.innerHTML;
			
			if (data_pos == 0){
				$("#numpad_return").css("color","#000000");
				if (key=="DEL"){
					$("#numpad_return").html(data_template);
				} else {
					if (key==":"){
						$("#numpad_return").html("00:MM");
						data_pos = 3;
					} else {
						data_pos = data_pos+1;
						$("#numpad_return").html(key + data_template.substr(data_pos));
					}
				}
			} else if (data_pos <= 4){					// we have some chars up to work with
				
				if (key=="DEL"){						// delete moves back the last time entry
					data_pos = data_pos-1;
					if (data_pos == 2) data_pos = 1;	// be sure to skip the colon char
					if (data_pos > 0){					// backed out time redisplays the template prompts
						cur_val = $("#numpad_return").html().substr(0,data_pos);
						cur_val += data_template.substr(data_pos);
					} else {
						cur_val = data_template;		// full backout displays entire template prompt
					}
					$("#numpad_return").html(cur_val.substr(0,5));	// let's see the whole thing
					
				} else if (key==":"){					// colon was pressed during data entry
					if (data_pos == 1){					// pressing colon after 1 char is a shortcut to skip 10's hours
						cur_val = "0" + $("#numpad_return").html().substr(0,data_pos);
						cur_val += data_template.substr(2,3);
						$("#numpad_return").html(cur_val);	// let's see the whole thing
					}
					data_pos = 3;						// make sure we are now past colon character
					
				} else {
					if (data_pos == 2) data_pos = 3;	// skip past colon character
					cur_val = $("#numpad_return").html().substr(0,data_pos);
					cur_val += key;						// move in latest entry
					data_pos = data_pos+1;				// advance position
					cur_val += data_template.substr(data_pos);
					$("#numpad_return").html(cur_val.substr(0,5));	// let's see the whole thing
				}
				
			} else {									// we are getting a button press after enough are filled
				if (key=="DEL"){						// delete is valid here, so start backing out time
					data_pos = data_pos-1;
					cur_val = $("#numpad_return").html().substr(0,data_pos);
					$("#numpad_return").html(cur_val+data_template.substr(data_pos,1));	// let's see the whole thing
				}
			}
		}
	}

	
	function isValidTime(theTime){
		//var patt = /^([0-1][0-9]|[2][0-3]):([0-5][0-9])$/;	// pattern accepts normal time HH:MM
		var patt = /^([0-1][0-9]|[2][0-3]):([0-5][05])$/;		// pattern accepts time with 5 min increments
		var res = patt.test(theTime);		
		return (res);											// true if pattern is held correctly HH:MM
	}
	
	function getDataOwner() {
		return (data_owner);
	}
	
	function setDataOwner(theData){
		data_owner = theData;
	}
	
	
    return {
		getDataOwner : getDataOwner,
		setDataOwner : setDataOwner,
        run : run
    };
})();
