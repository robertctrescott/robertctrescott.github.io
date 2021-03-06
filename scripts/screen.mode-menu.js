ldap.screens["mode-menu"] = (function() {
    var dom = ldap.dom,
        main = ldap.main,
		save_target,
        firstRun = true;
			
	var ldam = {
			homeTime : 20,
			awayTime : 10,
			standbyTime : 120,
			leakTime : 0,
			curFlow : 0,
			curMode : "home"
	};	

    function setup() {				
        dom.bind("#mode-menu", "click", function(e) {
            if (e.target.nodeName.toLowerCase() === "button") {
				var buttonText = e.target.innerHTML;
				var buttonOwner = e.target.getAttribute("name");
				
				if (e.target.className === "selector"){		// setup the mode
					ldam.curMode = buttonText.toLowerCase();
					main.push_xively("status",parseInt(mode2status(ldam)));
					
				} else if (e.target.className === "time"){	// setup the time
					save_target = e.target;
					ldap.screens["numpad-screen"].setDataOwner(buttonText);
					main.showScreen("numpad-screen");
					
				} else if (e.target.id === "droplet_img"){
					update();
					main.showScreen("more-screen");
				}
            }
        });
    };

    function run() {
        if (firstRun) {
	            setup();
				update();
	            firstRun = false;
         } else {
        	var timeStr = ldap.screens["numpad-screen"].getDataOwner();
			
			if (timeStr !== undefined){
				save_target.innerHTML = timeStr;	// return the time value in the proper box
				
				var streamID = save_target.name;	// target name is the current stream
				var minutes = time2mins(timeStr);	// we need to convert time to minutes
				// then push the current time change on to the server
				main.push_xively(streamID, parseInt(minutes));
			}
			
			// clear all back bars
			$("#home_gradient").css('display','none');
			$("#away_gradient").css('display','none');
			$("#standby_gradient").css('display','none');

			// set the current active bar to visible
			if (ldam.curMode != "water_off"){
				$("#"+ldam.curMode+"_gradient").css('display','block');	
			}					
        }
    }
	
	function update(){
		var statusVal;		
		var xively_data = main.readDataValue();
		if (xively_data !== undefined){
			for (var i=0; i<xively_data.datastreams.length; i++){
				var element = "[name~='"+xively_data.datastreams[i].id+"']:last";
				var value = parseInt(xively_data.datastreams[i].current_value);
				// dispatch data to proper storage
				switch (xively_data.datastreams[i].id){
					case "gauge" : ldam.curFlow = value; 		break;
					case "status": statusVal = value; 			break;
					case "home"  : ldam.homeTime = value; 		$(element).html(mins2time(value)); break;
					case "away"  : ldam.awayTime = value; 		$(element).html(mins2time(value)); break;
					case "standby": ldam.standbyTime = value; 	$(element).html(mins2time(value)); break;
				}
			}
			// convert status to internal view
			status2mode(statusVal);
					
			// clear all back bars
			$("#home_gradient").css('display','none');
			$("#away_gradient").css('display','none');
			$("#standby_gradient").css('display','none');

			// set the current active bar to visible
			if (ldam.curMode != "water_off"){
				$("#"+ldam.curMode+"_gradient").css('display','block');						
			}
			// we need to see flow bar percentage
			setFlowGraphPercent(ldam.curFlow);
			// calculate leak time based on time setting and % of gauge duration
			switch (ldam.curMode){
				case "home" : 	ldam.leakTime = ldam.homeTime*(ldam.curFlow/100); 	break;
				case "away" : 	ldam.leakTime = ldam.awayTime*(ldam.curFlow/100); 	break;
				case "standby": ldam.leakTime = ldam.standbyTime*(ldam.curFlow/100); break;
			}
			// use leak time to prompt and indicate messages to screen
			HandleMessageBoxUpdate();
		}
	};
	
	function HandleMessageBoxUpdate(){
		var mins = parseInt(ldam.leakTime);
		
		if (ldam.curMode == "alarm_on"){
			$("#message_box").css("color","#FFFF00");	// we want yellow text for alarm
			$("#message_box").html("*ALARM* --Water has been flowing for over "+mins+" minutes. --You may have a LEAK!");
		} else if (ldam.curMode == "calibrate"){
			$("#message_box").css("color","#FFFF00");	// we want yellow text for alarm
			$("#message_box").html("Processing, please wait. *Water must be off*");
		} else if (ldam.curMode == "water_off"){
			$("#message_box").css("color","#FFFF00");	// we want yellow text for alarm
			$("#message_box").html("Water has been manually shut off.  --Tap me for more...");	
		} else {
			$("#message_box").css("color","#FFFFFF");	// make sure text is white
			switch (ldam.curMode){
				case "standby" : $("#message_box").html("Water flow has been in Standby for "+mins+" minutes. You are not protected against leaks!");
					break;
				case "home" :
					if (ldam.leakTime > 0){
						$("#message_box").html("Water has been flowing for about "+mins+" minutes.");
					} else {
						$("#message_box").html("Water flow: Normal     --Tap me for more...");
					}
					break;
				case "away" :
					if (ldam.leakTime > 0){
						$("#message_box").html("Water has been flowing for about "+mins+" minutes.");
					} else {
						$("#message_box").html("Water flow: Normal     --Tap me for more...");
					}
					break;
				case "none" : 
					$("#message_box").html("We need to learn about your system... Tap me to start a calibration!");
					break;
			}
		}	
	};
		
	function time2mins(time){
		var mins = 5;
		if (time !== undefined){
			mins = 60*parseInt(time.substr(0,2))+(parseInt(time.substr(3,2)));
		}
		return mins;
	}
	
	function mins2time(mins){
		var time = "";
		if (mins!==undefined){
			var hours = Math.floor(mins/60);
			var min = mins % 60;
			var h = "00"+hours;
			var m = "00"+min;
			time = h.substr(h.length-2,2)+":"+m.substr(m.length-2,2);
		}
		return time;
	}
	
	function status2mode(theStatus){
		switch(theStatus){
			case 0: ldam.curMode = "none"; break;
			case 1: ldam.curMode = "home"; break;
			case 2: ldam.curMode = "away"; break;
			case 3: ldam.curMode = "standby"; break;
			case 4: ldam.curMode = "alarm_on"; break;
			case 5: ldam.curMode = "alarm_off"; break;
			case 6: ldam.curMode = "water_on"; break;
			case 7: ldam.curMode = "water_off"; break;
			case 9: ldam.curMode = "cal_zero"; break;
			case 10: ldam.curMode = "cal_high"; break;
		}
	}
	
	function mode2status(){
		var value = 0;
		switch(ldam.curMode){
			case "none": 		value = 0; break;
			case "home": 		value = 1; break;
			case "away": 		value = 2; break;
			case "standby": 	value = 3; break;
			case "alarm_on": 	value = 4; break;
			case "alarm_off": 	value = 5; break;
			case "water_on": 	value = 6; break;
			case "water_off": 	value = 7; break;
			case "cal_zero": 	value = 9; break;
			case "cal_high": 	value = 10; break;
		}
		return value;
	}
	
	function setFlowGraphPercent(value){
		if (value > 100) value = 100;
		else if (value < 0) value = 0;
		$("#gaugeIndicator").css("width",value+"%");
	}
 
	// make these functions globally accessable
    return {
		update : update,
		mode2status : mode2status,
		status2mode : status2mode,
        run : run
    };
})();
