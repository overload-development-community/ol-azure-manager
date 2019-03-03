const events = require("events"),
    http = require("http"),
    util = require("util"),

    promisify = util.promisify,

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
class Browser {
    //       #                 #
    //       #                 #
    //  ##   ###    ##    ##   # #
    // #     #  #  # ##  #     ##
    // #     #  #  ##    #     # #
    //  ##   #  #   ##    ##   #  #
    /**
     * Checks the API for servers.
     * @returns {Promise} A promise that resolves when the API check is complete.
     */
    async check() {
        const browser = this;

        try {
            const res = await promisify(http.get)("http://olproxy.otl.gg/api", void 0, void 0);
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
            });
        } catch (err) {}
    }
}

util.inherits(Browser, events.EventEmitter);

const browser = new Browser();

module.exports = browser;
