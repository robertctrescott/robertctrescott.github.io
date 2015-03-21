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
			sys_status = 6;
			ldap.screens["mode-menu"].status2mode(sys_status);
			main.push_xively("status",sys_status);
			main.showScreen("mode-menu");
		} else if (buttonText === "water_off"){
			sys_status = 7;
			ldap.screens["mode-menu"].status2mode(sys_status);
			main.push_xively("status",sys_status);
			main.showScreen("mode-menu");
		} else if (buttonText === "calibrate"){
			if (sys_status == 9 || sys_status == 10) sys_status = 1;
			else sys_status = 9;
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
				
		if (sys_status == 9 || sys_status == 10){	// are we calibrating
			$("#red_gradient").css('display','block');
		} else if (sys_status == 4){	// we are in alarm
			
		} else {
			if (sys_status == 7){	// is water off
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
