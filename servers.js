/**
 * @typedef {import("discord.js").TextChannel} DiscordJs.TextChannel
 */

const Azure = require("./azure"),
    browser = require("./browser");
const Log = require("./log");

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
    //               #    ###    #                             #
    //               #     #                                   #
    //  ###    ##   ###    #    ##    # #    ##    ##   #  #  ###    ###
    // ##     # ##   #     #     #    ####  # ##  #  #  #  #   #    ##
    //   ##   ##     #     #     #    #  #  ##    #  #  #  #   #      ##
    // ###     ##     ##   #    ###   #  #   ##    ##    ###    ##  ###
    /**
     * Sets the timeouts.
     * @param {object} server The server.
     * @param {string} region The region.
     * @param {DiscordJs.TextChannel} channel The channel.
     */
    static setTimeouts(server, region, channel) {
        server.warningTimeout = setTimeout(async () => {
            await Discord.queue(`The ${region} server will automatically shut down in 5 minutes.  Use the \`!extend ${region}\` command to reset the shutdown timer to 15 minutes.`, channel);
        }, 600000);
        server.timeout = setTimeout(async () => {
            await Azure.stop(server);
            server.started = false;
            await Discord.queue(`The ${region} server is being shutdown.  Thanks for playing!`, channel);

            browser.removeAllListeners(server.ipAddress);
        }, 900000);
    }

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
        if (server.warningTimeout !== 0) {
            clearTimeout(server.warningTimeout);
        }
        if (server.timeout !== 0) {
            clearTimeout(server.timeout);
        }
        server.warningTimeout = 0;
        server.timeout = 0;
        this.setTimeouts(server, region, channel);

        browser.removeAllListeners(server.ipAddress);
        browser.on(server.ipAddress, async (data) => {
            // We're receiving data about a completed game, display the summary.
            if (data.complete) {
                try {
                    if (data.complete.data) {
                        const embed = Discord.embedBuilder({
                            title: `${region} Game Completed`,
                            description: `Tracker URL: https://tracker.otl.gg/archive/${data.complete.id}`
                        })

                        if (data.complete.data.teamScore && Object.keys(data.complete.data.teamScore).length > 0) {
                            embed.addFields(Object.keys(data.complete.data.teamScore).sort((a, b) => data.complete.data.teamScore[b] - data.complete.data.teamScore[a]).map((team) => ({
                                name: team,
                                value: data.complete.data.teamScore[team].toLocaleString("en-us")
                            })));
                        } else {
                            embed.addFields(data.complete.data.players.sort((a, b) => (b.kills * 3 + b.assists) - (a.kills * 3 + a.assists)).map((player) => ({
                                name: player.name,
                                value: (data.complete.data.players.length === 2 ? player.kills : player.kills * 3 + player.assists).toLocaleString("en-us")
                            })))
                        }

                        await Discord.richQueue(embed, channel);
                    }
                } catch (err) {
                    Log.exception("There was an error while displaying completed game data.", err);
                }

                return;
            }

            // Ensure the timeouts are cleared.
            if (server.warningTimeout !== 0) {
                clearTimeout(server.warningTimeout);
            }
            if (server.timeout !== 0) {
                clearTimeout(server.timeout);
            }
            server.warningTimeout = 0;
            server.timeout = 0;

            // We're receiving data that a game or lobby has ended, setup the timeouts and, if this is a completed game, get the completed game data.
            if (!data.game) {
                this.setTimeouts(server, region, channel);

                if (!data.inLobby) {
                    browser.checkGameList(server.ipAddress);
                }
                return;
            }

            // Check if we're just starting a game.
            if (data.inLobby && !data.game.inLobby) {
                await Discord.queue(`${region} game has started!`, channel);
                return;
            }

            // We're receiving updated game data, display it.
            await Discord.queue(`${region} lobby status: ${data.game.mapName} ${data.game.mode}, ${data.game.currentPlayers}/${data.game.maxPlayers} players\nJoin at **${server.ipAddress}** (${server.host})`, channel);
        });
    }
}

module.exports = Servers;
