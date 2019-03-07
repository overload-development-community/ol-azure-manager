/**
 * @typedef {import("discord.js").TextChannel} DiscordJs.TextChannel
 */

const Azure = require("./azure"),
    browser = require("./browser");

/**
 * @type {typeof import("./discord")}
 */
let Discord;

setTimeout(() => {
    Discord = require("./discord");
}, 0);

//   ###
//  #   #
//  #       ###   # ##   #   #   ###   # ##    ###
//   ###   #   #  ##  #  #   #  #   #  ##  #  #
//      #  #####  #       # #   #####  #       ###
//  #   #  #      #       # #   #      #          #
//   ###    ###   #        #     ###   #      ####
/**
 * A class that handles communications about the servers to Discord.
 */
class Servers {
    //               #
    //               #
    //  ###    ##   ###   #  #  ###
    // ##     # ##   #    #  #  #  #
    //   ##   ##     #    #  #  #  #
    // ###     ##     ##   ###  ###
    //                          #
    /**
     * Sets up communications for a server.
     * @param {object} server The server object.
     * @param {string} region The server's region.
     * @param {DiscordJs.TextChannel} channel The Discord channel to communicate to.
     * @returns {void}
     */
    static setup(server, region, channel) {
        server.started = true;
        clearTimeout(server.warningTimeout);
        clearTimeout(server.timeout);
        server.warningTimeout = setTimeout(async () => {
            await Discord.queue(`The ${region} server will automatically shut down in 20 minutes.  Issue the \`!extend ${region}\` command to reset the shutdown timer to an hour.`, channel);
        }, 2400000);
        server.timeout = setTimeout(async () => {
            Azure.stop(server);
            server.started = false;
            await Discord.queue(`The ${region} server is being shutdown.  Thanks for playing!`, channel);

            browser.removeAllListeners(server.ipAddress);
        }, 3600000);

        browser.removeAllListeners(server.ipAddress);
        browser.on(server.ipAddress, async (data) => {
            clearTimeout(server.warningTimeout);
            clearTimeout(server.timeout);
            server.warningTimeout = setTimeout(async () => {
                await Discord.queue(`The ${region} server will automatically shut down in 20 minutes.  Issue the \`!extend ${region}\` command to reset the shutdown timer to an hour.`, channel);
            }, 2400000);
            server.timeout = setTimeout(async () => {
                Azure.stop(server);
                server.started = false;
                await Discord.queue(`The ${region} server is being shutdown.  Thanks for playing!`, channel);

                browser.removeAllListeners(server.ipAddress);
            }, 3600000);

            await Discord.queue(`${region} lobby status: ${data.map} ${data.mode}, ${data.numPlayers}/${data.maxNumPlayers} players`, channel);
        });
    }
}

module.exports = Servers;
