
ldap.main = (function() {
    var dom = ldap.dom;
	
    var feedID        = 1652583299,          		// Feed ID  
        datastreamID  = "home",       				// Datastream ID  
        dataValue,
		xivelyKey     = "4GXaPPERh9TfhMMc8ODVYrxoVzzQAbDdfOW7mtFfylHISPAW";
	

    /* hide the active screen (if any) and show the screen
     * with the specified id */
    function showScreen(screenId) {
        var activeScreen = $("#main .screen.active")[0],
            screen = $("#" + screenId)[0];
        if (activeScreen) {
            dom.removeClass(activeScreen, "active");
        }
        // run the screen module
        ldap.screens[screenId].run();
        // display the screen html
        dom.addClass(screen, "active");
    };

    function setup() {
        // disable native touchmove behavior to 
        // prevent overscroll
        dom.bind(document, "touchmove", function(event) {
            //event.preventDefault();
        });
				
        // hide the address bar on Android devices
        if (/Android/.test(navigator.userAgent)) {
            $("html")[0].style.height = "200%";
            setTimeout(function() {
                window.scrollTo(0, 1);
            }, 0);
        }
		
		fire_xively();
		
    };
	
	// this makes xively link up to server and pull down the device feed when data changes or updates
	function fire_xively(){
		xively.setKey(xivelyKey);
			
	    xively.feed.get (feedID, function ( datastream ) {  
			dataValue = datastream;
		  
			xively.feed.subscribe( feedID, function ( event , datastream_updated ) {  
				dataValue = datastream_updated;
				if (ldap.screens["mode-menu"]!==undefined){
					ldap.screens["mode-menu"].update(event);
				}
			});  
	    });
	};
	
	function fire_xivelyDatastream(){
		xively.setKey(xivelyKey); 
		
	    xively.datastream.get (feedID, datastreamID, function ( datastream ) {  
			dataValue = (datastream["current_value"]);
			  
			xively.datastream.subscribe( feedID, datastreamID, function ( event , datastream_updated ) {  
				dataValue = ( datastream_updated["current_value"] );  
			});  
  
	    });	
	};
	
	/*
	
	function push_imp_mode(theMode){
		$.post(impURL+theMode);	
	}
	
		
	function read_imp_data() {
		var data_file = impURL+"?getPanel=1";
		var http_request = new XMLHttpRequest();
		try {
			// Opera 8.0+, Firefox, Chrome, Safari
			http_request = new XMLHttpRequest();
		} catch (e) {
			// Internet Explorer Browsers
			try {
				http_request = new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e) {
				try {
					http_request = new ActiveXObject("Microsoft.XMLHTTP");
				} catch (e) {
					alert("Something went wrong. :/");
					return false;
				}
			}
		}

		http_request.onreadystatechange = function(){
			if (http_request.readyState == 4) {
				if (http_request.status == 200) {
					dataValue = JSON.parse(http_request.responseText);
				} 				
			}
			setTimeout(read_imp_data, 1000);
		}
		http_request.open("GET", data_file, true);
		http_request.send();
	}
	*/
	
	
	// this writes new value data into the designated streamID and updates the server	
	function push_xively(streamID, value){		
		xively.setKey(xivelyKey);
		xively.datastream.get (feedID, streamID, function ( datastream ) {  
			datastream["current_value"] = value;
			xively.datastream.update(feedID, streamID, datastream, function(){
			});
		}); 
	};
	
	
	function readDataValue(){
		return dataValue;
	};
	
   
    // expose public methods
    return {
        setup : setup,
        showScreen : showScreen,
		push_xively : push_xively,
		readDataValue : readDataValue
    };
})();
