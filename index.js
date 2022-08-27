const browser = require("./browser"),
    Discord = require("./discord"),
    Log = require("./log");

//         #                 #
//         #                 #
//  ###   ###    ###  ###   ###   #  #  ###
// ##      #    #  #  #  #   #    #  #  #  #
//   ##    #    # ##  #      #    #  #  #  #
// ###      ##   # #  #       ##   ###  ###
//                                      #
/**
 * Starts up the application.
 */
(function startup() {
    Log.log("Starting up...");

    if (process.platform === "win32") {
        process.title = "Overload Azure Manager";
    } else {
        process.stdout.write("\x1b]2;Overload Azure Manager\x1b\x5c");
    }

    setInterval(() => {
        browser.checkBrowser();
    }, 5000);

    // Startup Discord.
    Discord.startup();
    Discord.connect();
}());

process.on("unhandledRejection", (/** @type {any} */reason) => {
    Log.exception("Unhandled promise rejection caught.", reason);
});
