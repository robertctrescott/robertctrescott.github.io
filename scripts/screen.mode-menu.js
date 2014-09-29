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
			inAlarm : false,
			inCalib : false,
			water_off : false,
			curMode : "home"
	};	

    function setup() {				
        dom.bind("#mode-menu", "click", function(e) {
            if (e.target.nodeName.toLowerCase() === "button") {
				var buttonText = e.target.innerHTML;
				var buttonOwner = e.target.getAttribute("name");
				
				if (e.target.className === "selector"){		// setup the mode
					ldam.curMode = buttonText.toLowerCase();
					ldam.inAlarm = false;
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
			if (!ldam.water_off){
				$("#"+ldam.curMode+"_gradient").css('display','block');	
			}					
        }
    }

/*	
	function update_imp(e){
		var panelData = main.readDataValue();
		if (panelData !== undefined){

			ldam.homeTime = panelData.home;
			var element = "[name~='"+"home"+"']:last";
			$(element).html(mins2time(ldam.homeTime));
		
			ldam.awayTime = panelData.away;
			element = "[name~='"+"away"+"']:last";
			$(element).html(mins2time(ldam.awayTime));
		
			ldam.standbyTime = panelData.standby;
			element = "[name~='"+"standby"+"']:last";
			$(element).html(mins2time(ldam.standbyTime));
		
			var statusVal = panelData.status;
			ldam.curFlow = panelData.gauge;
		
			status2mode(statusVal);		
			// clear all back bars
			$("#home_gradient").css('display','none');
			$("#away_gradient").css('display','none');
			$("#standby_gradient").css('display','none');
			// set the current active bar to visible
			$("#"+ldam.curMode+"_gradient").css('display','block');
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
*/
	
	
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
			if (!ldam.water_off){
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
		
		if (ldam.inAlarm){
			$("#message_box").css("color","#FFFF00");	// we want yellow text for alarm
			$("#message_box").html("*ALARM* --Water has been flowing for over "+mins+" minutes. --You may have a LEAK!");
		} else if (ldam.inCalib){
			$("#message_box").css("color","#FFFF00");	// we want yellow text for alarm
			$("#message_box").html("Processing, please wait. *Water must be off*");
		} else if (ldam.water_off){
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
		/* here is the structure of status
			run 		: 1; // bit 0  mask 1 		powered up
			calib 		: 1;				2		calibration mode running
			in_away		: 1;				4		away = true, home = false
			in_stby		: 1;				8		in standby mode
			in_cycle	: 1;				16		???
			in_alarm	: 1;				32		active alarm mode
			water_off	: 1;				64		water is override off
			b7			: 1;				128		???
		*/
		
		//ldam.curMode="none";	// default to none
				
		if (theStatus & 2){				// are we in active calibration
			ldam.inCalib = true;
			ldam.curMode = "none";
			ldam.inAlarm = false;
			ldam.water_off = false
		} else {
			ldam.inCalib = false;
		}

		if (theStatus & 64){			// is the water turned off
			ldam.water_off = true; 
			ldam.inAlarm = false;
			ldam.inCalib = false;
			//ldam.curMode = "none";
		} else { 
			ldam.water_off = false;
		}

		if (theStatus & 32){	
			ldam.inAlarm = true;
			ldam.inCalib = false;
			ldam.water_off = true; 
		} else {
			ldam.inAlarm = false;
		}
		
		if (!ldam.inCalib && !ldam.water_off){
			if (theStatus & 8) 	    ldam.curMode="standby";
			else if (theStatus & 4) ldam.curMode="away";
			else ldam.curMode="home";
		}
	}
	
	function mode2status(){
		// see structure above, we will make a value from the current mode
		var value = 1;			// default with system running
		if (ldam.curMode === "standby") 		value+=8;
		else if (ldam.curMode === "away") 		value+=4;
		
		if (ldam.inCalib)						value+=2;
		if (ldam.inAlarm)						value+=32;
		if (ldam.water_off)						value+=64;
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
