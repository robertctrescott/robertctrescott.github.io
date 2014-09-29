ldap.screens["more-screen"] = (function() {
    var dom = ldap.dom,
        main = ldap.main,
		sys_status = 0,
        firstRun = true;

    function setup() {		
        dom.bind("#more-screen", "click", function(e) {
            if (e.target.nodeName.toLowerCase() === "button") {
				handle_selection(e.target);
            }
        });
    }
	
	
	function handle_selection(event_target){
		var buttonText = event_target.name;	
			
		if (event_target.id === "droplet_img"){				// we got the go back command to cancel our entry
			main.showScreen("mode-menu");
		} else if (buttonText === "water_on"){
			sys_status &= 0xFFBF;
			ldap.screens["mode-menu"].status2mode(sys_status);
			main.push_xively("status",sys_status);
			main.showScreen("mode-menu");
		} else if (buttonText === "water_off"){
			sys_status |= 64;
			ldap.screens["mode-menu"].status2mode(sys_status);
			main.push_xively("status",sys_status);
			main.showScreen("mode-menu");
		} else if (buttonText === "calibrate"){
			if (sys_status & 2) sys_status &= 0xFFFD;
			else sys_status |= 2;
			ldap.screens["mode-menu"].status2mode(sys_status);
			main.push_xively("status",sys_status);
			main.showScreen("mode-menu");
		}
	}
	
	function update() {
		// clear all back bars
		$("#green_gradient").css('display','none');
		$("#yellow_gradient").css('display','none');
		$("#red_gradient").css('display','none');
		
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
		
		if (sys_status & 2){	// are we calibrating
			$("#red_gradient").css('display','block');
		} else if (sys_status & 32){	// we are in alarm
			
		} else {
			if (sys_status & 64){	// is water off
				$("#yellow_gradient").css('display','block');
			} else {				// is water on
				$("#green_gradient").css('display','block');
			}	
		}
	}
			
	
    function run() {
        if (firstRun) {
			sys_status = ldap.screens["mode-menu"].mode2status();
            setup();
			update();
			//firstRun = false;
        } else {

        }
    }
		
    return {
        run : run
    };
})();
