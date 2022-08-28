const Log = require("./log");

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
    //       #                 #     ###
    //       #                 #     #  #
    //  ##   ###    ##    ##   # #   ###   ###    ##   #  #   ###    ##   ###
    // #     #  #  # ##  #     ##    #  #  #  #  #  #  #  #  ##     # ##  #  #
    // #     #  #  ##    #     # #   #  #  #     #  #  ####    ##   ##    #
    //  ##   #  #   ##    ##   #  #  ###   #      ##   ####  ###     ##   #
    /**
     * Checks the browser API for servers.
     * @returns {void}
     */
    checkBrowser() {
        const browser = this;

        const req = https.get("https://tracker.otl.gg/api/browser", (res) => {
            let body = "";

            res.on("data", (chunk) => {
                body += chunk;
            });

            res.on("end", () => {
                if (res.statusCode === 200) {
                    try {
                        const data = JSON.parse(body);

                        for (const server of data) {
                            if (server.game) {
                                if (!servers[server.server.ip]) {
                                    browser.emit(server.server.ip, {game: server.game, inLobby: false})
                                } else if (server.game.currentPlayers !== servers[server.server.ip].currentPlayers || server.game.maxPlayers !== servers[server.server.ip].maxPlayers || server.game.mapName !== servers[server.server.ip].mapName || server.game.mode !== servers[server.server.ip].mode || server.game.inLobby !== servers[server.server.ip].inLobby) {
                                    browser.emit(server.server.ip, {game: server.game, inLobby: servers[server.server.ip].inLobby});
                                }
                            } else {
                                if (servers[server.server.ip]) {
                                    console.log("Ending");
                                    browser.emit(server.server.ip, {game: null, inLobby: servers[server.server.ip].inLobby});
                                }
                            }

                            servers[server.server.ip] = server.game;
                        }
                    } catch (err) {
                        Log.exception("There was an exception while getting the browser API data.", err);
                    }
                }

                req.end();
            });
        });
    }

    //       #                 #      ##                     #      #            #
    //       #                 #     #  #                    #                   #
    //  ##   ###    ##    ##   # #   #      ###  # #    ##   #     ##     ###   ###
    // #     #  #  # ##  #     ##    # ##  #  #  ####  # ##  #      #    ##      #
    // #     #  #  ##    #     # #   #  #  # ##  #  #  ##    #      #      ##    #
    //  ##   #  #   ##    ##   #  #   ###   # #  #  #   ##   ####  ###   ###      ##
    /**
     * Checks the game list API for a completed game.
     * @param {string} ip The IP address of the game.
     * @returns {void}
     */
    checkGameList(ip) {
        const browser = this;

        const req = https.get("https://tracker.otl.gg/api/gamelist?page=1", (res) => {
            let body = "";

            res.on("data", (chunk) => {
                body += chunk;
            });

            res.on("end", () => {
                if (res.statusCode === 200) {
                    try {
                        const data = JSON.parse(body);

                        for (const game of data.games) {
                            if (game.ip === ip) {
                                browser.emit(ip, {complete: game})
                            }
                            break;
                        }
                    } catch (err) {
                        Log.exception("There was an exception while getting the game list API data.", err);
                    }
                }

                req.end();
            });
        });
    }
}

const browser = new Browser();

module.exports = browser;
