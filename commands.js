/**
 * @typedef {import("discord.js").TextChannel} DiscordJs.TextChannel
 * @typedef {import("discord.js").User} DiscordJs.User
 */

const Azure = require("./azure"),
    Exception = require("./exception"),
    Servers = require("./servers"),
    settings = require("./settings"),
    Warning = require("./warning");

/**
 * @type {typeof import("./discord")}
 */
let Discord;

setTimeout(() => {
    Discord = require("./discord");
}, 0);

//   ###                                          #
//  #   #                                         #
//  #       ###   ## #   ## #    ###   # ##    ## #   ###
//  #      #   #  # # #  # # #      #  ##  #  #  ##  #
//  #      #   #  # # #  # # #   ####  #   #  #   #   ###
//  #   #  #   #  # # #  # # #  #   #  #   #  #  ##      #
//   ###    ###   #   #  #   #   ####  #   #   ## #  ####
/**
 * A class that handles commands given by chat.
 */
class Commands {
    //  ###    ##   ###   # #    ##   ###    ###
    // ##     # ##  #  #  # #   # ##  #  #  ##
    //   ##   ##    #     # #   ##    #       ##
    // ###     ##   #      #     ##   #     ###
    /**
     * Gets the current list of servers and their status.
     * @param {DiscordJs.User} user The user initiating the command.
     * @param {DiscordJs.TextChannel} channel The channel the message was sent over.
     * @param {string} message The text of the command.
     * @returns {Promise<boolean>} A promise that resolves with whether the command completed successfully.
     */
    async servers(user, channel, message) {
        if (message) {
            return false;
        }

        const msg = Discord.embedBuilder({
            title: "Overload Azure Server Status",
            fields: []
        });

        const offline = [],
            online = [];
 
        Object.keys(settings.servers).sort().forEach((region) => {
            const server = settings.servers[region];

            if (server.started) {
                online.push(region);
            } else {
                offline.push(region);
            }
        });

        if (offline.length > 0) {
            msg.addFields({
                name: "Offline Servers - Use `!start <region>` to start a server.",
                value: offline.map((r) => `${r} - ${settings.servers[r].location}`).join("\n")
            });
        }

        if (online.length > 0) {
            msg.addFields({
                name: "Online Servers",
                value: online.map((r) => `${r} - ${settings.servers[r].ipAddress} - ${settings.servers[r].host} - ${settings.servers[r].location}`).join("\n")
            });
        }

        await Discord.richQueue(msg, channel);
        return true;
    }

    //         #                 #
    //         #                 #
    //  ###   ###    ###  ###   ###
    // ##      #    #  #  #  #   #
    //   ##    #    # ##  #      #
    // ###      ##   # #  #       ##
    /**
     * Starts the server in the requested region.
     * @param {DiscordJs.User} user The user initiating the command.
     * @param {DiscordJs.TextChannel} channel The channel the message was sent over.
     * @param {string} message The text of the command.
     * @returns {Promise<boolean>} A promise that resolves with whether the command completed successfully.
     */
    async start(user, channel, message) {
        if (!message) {
            return false;
        }

        message = message.toLowerCase();

        if (!settings.servers[message]) {
            await Discord.queue(`Sorry, ${user}, but this is not a valid server.  Use the \`!servers\` command to see the list of servers.`, channel);
            throw new Warning("Server does not exist.");
        }

        if (settings.servers[message].started) {
            await Discord.queue(`Sorry, ${user}, but this server is already running.  Did you mean to \`!extend ${message}\` instead?`, channel);
            throw new Warning("Server already started.");
        }

        await Discord.queue("Please standby...", channel);

        try {
            await Azure.start(settings.servers[message]);
        } catch (err) {
            await Discord.queue(`Sorry, ${user}, but there was an error starting the server.  An admin has been notified.`, channel);
            throw new Exception("Error starting server.", err);
        }

        Servers.setup(settings.servers[message], message, channel);

        await Discord.queue(`${user}, the ${message} server has been started at **${settings.servers[message].ipAddress}** (${settings.servers[message].host}) and should be available in a couple of minutes.  The server will automatically shut down when idle for 15 minutes.  Use the \`!extend ${message}\` command to reset the idle shutdown timer and move notifications about this server to a new channel.`, channel);
        return true;
    }

    //              #                   #
    //              #                   #
    //  ##   #  #  ###    ##   ###    ###
    // # ##   ##    #    # ##  #  #  #  #
    // ##     ##    #    ##    #  #  #  #
    //  ##   #  #    ##   ##   #  #   ###
    /**
     * Extends a server in the requested region.
     * @param {DiscordJs.User} user The user initiating the command.
     * @param {DiscordJs.TextChannel} channel The channel the message was sent over.
     * @param {string} message The text of the command.
     * @returns {Promise<boolean>} A promise that resolves with whether the command completed successfully.
     */
    async extend(user, channel, message) {
        if (!message) {
            return false;
        }

        message = message.toLowerCase();

        if (!settings.servers[message]) {
            await Discord.queue(`Sorry, ${user}, but this is not a valid server.  Use the \`!servers\` command to see the list of servers.`, channel);
            throw new Warning("Server does not exist.");
        }

        if (!settings.servers[message].started) {
            await Discord.queue(`Sorry, ${user}, but this server is not running.  Did you mean to \`!start ${message}\` instead?`, channel);
            throw new Warning("Server not started.");
        }

        Servers.setup(settings.servers[message], message, channel);

        await Discord.queue(`${user}, the ${message} server has been extended at **${settings.servers[message].ipAddress}** (${settings.servers[message].host}).  The server will automatically shut down in one hour unless you issue the \`!extend ${message}\` command.`, channel);
        return true;
    }
}

module.exports = Commands;
