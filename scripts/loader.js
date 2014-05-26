var ldap = {
    screens : {}
};

window.addEventListener("load", function() {
	Modernizr.addTest("standalone", function() {
    return (window.navigator.standalone != false);
});

// loading stage 1
Modernizr.load([
{ 
    load : [
        "scripts/dom.js",
        "scripts/main.js"
    ]
},{
    test : Modernizr.standalone,
    yep : "scripts/screen.splash.js",
    nope : "scripts/screen.install.js",
    complete : function() {
		ldap.main.setup();
        if (Modernizr.standalone) {
            ldap.main.showScreen("splash-screen");
        } else {
            ldap.main.showScreen("install-screen");
        }
    }
}
]);

// loading stage 2
if (Modernizr.standalone) {
    Modernizr.load([
    {
        load : [
			"scripts/screen.mode-menu.js",
			"scripts/screen.numpad-screen.js",
			"scripts/screen.xively-screen.js"
		]
    }
    ]);
}


}, false);
