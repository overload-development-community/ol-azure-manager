const events = require("events"),
    https = require("https"),
    util = require("util"),
    Ws = require("ws"),

    settings = require("./settings").browser,

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
    //         #                 #
    //         #                 #
    //  ###   ###    ###  ###   ###
    // ##      #    #  #  #  #   #
    //   ##    #    # ##  #      #
    // ###      ##   # #  #       ##
    /**
     * Starts up the websocket client
     */
    async start() {
        const browser = this;
        this.ws = new Ws(settings.trackerBaseUrl.replace(/^http(s:)/, 'ws$1'));

        this.ws.on("close", function() { browser.ws = null; });
        this.ws.on("error", function() { browser.ws = null; });

        this.ws.on("message", (str) => {
            let {ip, data} = JSON.parse(str);
            if (!ip || !data || data.name != "Stats")
                return;
            if (data.type == "StartGame" || data.type == "LobbyStatus" || data.type == "LobbyExit")
                this.updateServer(ip, data);
        });
    }

    //       #                 #
    //       #                 #
    //  ##   ###    ##    ##   # #
    // #     #  #  # ##  #     ##
    // #     #  #  ##    #     # #
    //  ##   #  #   ##    ##   #  #
    /**
     * Check if the websocket client is still running
     * @returns {void}
     */
    check() {
         if (this.ws)
             return;
         this.start();
    }

    updateServer(ip, settings) {
        settings = settings || {};
        var info = {numPlayers:(settings.players || []).length,
            maxNumPlayers:settings.maxPlayers,
            map:settings.level, mode:settings.matchMode,
            jip:settings.joinInProgress};
        if (!servers[ip]) {
            this.emit(ip, info);
        } else if (servers[ip].numPlayers !== info.numPlayers ||
            servers[ip].maxNumPlayers !== info.maxNumPlayers ||
            servers[ip].map !== info.map ||
            servers[ip].mode !== info.mode ||
            servers[ip].jip !== info.jip) {
            this.emit(ip, info);
        }
        servers[ip] = info;
    }
}

util.inherits(Browser, events.EventEmitter);

const browser = new Browser();

module.exports = browser;
