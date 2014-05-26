ldap.screens["splash-screen"] = (function() {
    var main = ldap.main,
        dom = ldap.dom,
        firstRun = true;

    function setup() {
        dom.bind("#splash-screen", "click", function() {
            main.showScreen("mode-menu");
        });
    }

    function run() {
        if (firstRun) {
            setup();
            firstRun = false;
        }
    }

    return {
        run : run
    };
})();
