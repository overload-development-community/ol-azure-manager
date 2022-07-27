const events = require("events"),
    https = require("https"),
    util = require("util"),

    servers = {};

//  ####
//   #  #
//   #  #  # ##    ###   #   #   ###    ###   # ##
//   ###   ##  #  #   #  #   #  #      #   #  ##  #
//   #  #  #      #   #  # # #   ###   #####  #
//   #  #  #      #   #  # # #      #  #      #
//  ####   #       ###    # #   ####    ###   #
/**
 * A class that represents checking the Overload Game Browser.
 * @extends {events.EventEmitter}
 */
class Browser extends events.EventEmitter {
    //       #                 #
    //       #                 #
    //  ##   ###    ##    ##   # #
    // #     #  #  # ##  #     ##
    // #     #  #  ##    #     # #
    //  ##   #  #   ##    ##   #  #
    /**
     * Checks the API for servers.
     * @returns {void}
     */
    check() {
        const browser = this;

        const req = https.get("https://olproxy.otl.gg/api", (res) => {
            let body = "";

            res.on("data", (chunk) => {
                body += chunk;
            });

            res.on("end", () => {
                if (res.statusCode === 200) {
                    try {
                        const data = JSON.parse(body);

                        Object.keys(data).forEach((ip) => {
                            if (!servers[ip]) {
                                browser.emit(ip, data[ip]);
                            } else if (servers[ip].numPlayers !== data[ip].numPlayers || servers[ip].maxNumPlayers !== data[ip].maxNumPlayers || servers[ip].map !== data[ip].map || servers[ip].mode !== data[ip].mode) {
                                browser.emit(ip, data[ip]);
                            }
                            servers[ip] = data[ip];
                        });
                    } catch (err) {}
                }

                req.end();
            });
        });
    }
}

const browser = new Browser();

module.exports = browser;
