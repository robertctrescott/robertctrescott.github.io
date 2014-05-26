
ldap.main = (function() {
    var dom = ldap.dom;
	
    var feedID        = 1652583299,          	// Feed ID  
        datastreamID  = "home",       				// Datastream ID  
        dataValue;
	

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
		xively.setKey( "4GXaPPERh9TfhMMc8ODVYrxoVzzQAbDdfOW7mtFfylHISPAW" );
			
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
		xively.setKey( "4GXaPPERh9TfhMMc8ODVYrxoVzzQAbDdfOW7mtFfylHISPAW" ); 
		
	    xively.datastream.get (feedID, datastreamID, function ( datastream ) {  
			dataValue = (datastream["current_value"]);
			  
			xively.datastream.subscribe( feedID, datastreamID, function ( event , datastream_updated ) {  
				dataValue = ( datastream_updated["current_value"] );  
			});  
  
	    });	
	};
	
	
	// this writes new value data into the designated streamID and updates the server	
	function push_xively(streamID, value){		
		xively.setKey( "4GXaPPERh9TfhMMc8ODVYrxoVzzQAbDdfOW7mtFfylHISPAW" );
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
