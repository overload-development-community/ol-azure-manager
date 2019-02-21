const DiscordJs = require("discord.js"),

    Commands = require("./commands"),
    Exception = require("./exception"),
    Log = require("./log"),
    settings = require("./settings"),
    Warning = require("./warning"),

    commands = new Commands(),
    discord = new DiscordJs.Client(/** @type {DiscordJs.ClientOptions} */ (settings.discord.options)), // eslint-disable-line no-extra-parens
    messageParse = /^!([^ ]+)(?: +(.*[^ ]))? *$/;

/**
 * @type {DiscordJs.Guild}
 */
let guild;

//  ####     #                                    #
//   #  #                                         #
//   #  #   ##     ###    ###    ###   # ##    ## #
//   #  #    #    #      #   #  #   #  ##  #  #  ##
//   #  #    #     ###   #      #   #  #      #   #
//   #  #    #        #  #   #  #   #  #      #  ##
//  ####    ###   ####    ###    ###   #       ## #
/**
 * A static class that handles all Discord.js interctions.
 */
class Discord {
    //              #    ##       #
    //                    #       #
    //  ###  #  #  ##     #     ###
    // #  #  #  #   #     #    #  #
    //  ##   #  #   #     #    #  #
    // #      ###  ###   ###    ###
    //  ###
    /**
     * Gets the guild object.
     * @returns {DiscordJs.Guild} The guild.
     */
    static get guild() {
        return guild;
    }

    //  #
    //
    // ##     ##    ##   ###
    //  #    #     #  #  #  #
    //  #    #     #  #  #  #
    // ###    ##    ##   #  #
    /**
     * Returns the OTL's icon.
     * @returns {string} The URL of the icon.
     */
    static get icon() {
        if (discord && discord.status === 0) {
            return discord.user.avatarURL;
        }

        return void 0;
    }

    //         #                 #
    //         #                 #
    //  ###   ###    ###  ###   ###   #  #  ###
    // ##      #    #  #  #  #   #    #  #  #  #
    //   ##    #    # ##  #      #    #  #  #  #
    // ###      ##   # #  #       ##   ###  ###
    //                                      #
    /**
     * Sets up Discord events.  Should only ever be called once.
     * @returns {void}
     */
    static startup() {
        discord.on("ready", () => {
            Log.log("Connected to Discord.");

            guild = discord.guilds.find((g) => g.name === settings.guild);
        });

        discord.on("disconnect", (ev) => {
            Log.exception("Disconnected from Discord.", ev);
        });

        discord.on("message", (message) => {
            Discord.message(message.author, message.content, message.channel);
        });
    }

    //                                      #
    //                                      #
    //  ##    ##   ###   ###    ##    ##   ###
    // #     #  #  #  #  #  #  # ##  #      #
    // #     #  #  #  #  #  #  ##    #      #
    //  ##    ##   #  #  #  #   ##    ##     ##
    /**
     * Connects to Discord.
     * @returns {void}
     */
    static connect() {
        Log.log("Connecting to Discord...");

        discord.login(settings.discord.token).then(() => {
            Log.log("Connected.");
        }).catch((err) => {
            Log.exception("Error connecting to Discord, will automatically retry.", err);
        });

        discord.on("error", (err) => {
            Log.exception("Discord error.", err);
        });
    }

    //  #            ##                                  #             #
    //              #  #                                 #             #
    // ##     ###   #      ##   ###   ###    ##    ##   ###    ##    ###
    //  #    ##     #     #  #  #  #  #  #  # ##  #      #    # ##  #  #
    //  #      ##   #  #  #  #  #  #  #  #  ##    #      #    ##    #  #
    // ###   ###     ##    ##   #  #  #  #   ##    ##     ##   ##    ###
    /**
     * Determines whether the bot is connected to Discord.
     * @returns {boolean} Whether the bot is connected to Discord.
     */
    static isConnected() {
        return discord && discord.ws && discord.ws.connection ? discord.status === 0 : false;
    }

    // # #    ##    ###    ###    ###   ###   ##
    // ####  # ##  ##     ##     #  #  #  #  # ##
    // #  #  ##      ##     ##   # ##   ##   ##
    // #  #   ##   ###    ###     # #  #      ##
    //                                  ###
    /**
     * Parses a message.
     * @param {DiscordJs.User} user The user who sent the message.
     * @param {string} message The text of the message.
     * @param {DiscordJs.TextChannel|DiscordJs.DMChannel|DiscordJs.GroupDMChannel} channel The channel the message was sent on.
     * @returns {Promise} A promise that resolves when the message is parsed.
     */
    static async message(user, message, channel) {
        for (const text of message.split("\n")) {
            const matches = messageParse.exec(text);

            if (matches) {
                const command = matches[1].toLocaleLowerCase(),
                    args = matches[2];

                if (Object.getOwnPropertyNames(Commands.prototype).filter((p) => typeof Commands.prototype[p] === "function" && p !== "constructor").indexOf(command) !== -1) {
                    let success;
                    try {
                        success = await commands[command](user, channel, args);
                    } catch (err) {
                        if (err instanceof Warning) {
                            Log.warning(`${channel} ${user}: ${text}\n${err}`);
                        } else if (err instanceof Exception) {
                            Log.exception(`${channel} ${user}: ${text}\n${err.message}`, err.innerError);
                        } else {
                            Log.exception(`${channel} ${user}: ${text}`, err);
                        }

                        return;
                    }

                    if (success) {
                        Log.log(`${channel} ${user}: ${text}`);
                    }
                }
            }
        }
    }

    //  ###  #  #   ##   #  #   ##
    // #  #  #  #  # ##  #  #  # ##
    // #  #  #  #  ##    #  #  ##
    //  ###   ###   ##    ###   ##
    //    #
    /**
     * Queues a message to be sent.
     * @param {string} message The message to be sent.
     * @param {DiscordJs.TextChannel|DiscordJs.DMChannel|DiscordJs.GroupDMChannel|DiscordJs.GuildMember} channel The channel to send the message to.
     * @returns {Promise<DiscordJs.Message>} A promise that resolves with the sent message.
     */
    static async queue(message, channel) {
        if (channel.id === discord.user.id) {
            return void 0;
        }

        let msg;
        try {
            msg = await Discord.richQueue(new DiscordJs.RichEmbed({description: message}), channel);
        } catch {}
        return msg;
    }

    //        #          #     ####        #              #
    //                   #     #           #              #
    // ###   ##     ##   ###   ###   # #   ###    ##    ###
    // #  #   #    #     #  #  #     ####  #  #  # ##  #  #
    // #      #    #     #  #  #     #  #  #  #  ##    #  #
    // #     ###    ##   #  #  ####  #  #  ###    ##    ###
    /**
     * Gets a new DiscordJs RichEmbed object.
     * @param {DiscordJs.RichEmbedOptions} [options] The options to pass.
     * @returns {DiscordJs.RichEmbed} The RichEmbed object.
     */
    static richEmbed(options) {
        return new DiscordJs.RichEmbed(options);
    }

    //        #          #      ##
    //                   #     #  #
    // ###   ##     ##   ###   #  #  #  #   ##   #  #   ##
    // #  #   #    #     #  #  #  #  #  #  # ##  #  #  # ##
    // #      #    #     #  #  ## #  #  #  ##    #  #  ##
    // #     ###    ##   #  #   ##    ###   ##    ###   ##
    //                            #
    /**
     * Queues a rich embed message to be sent.
     * @param {DiscordJs.RichEmbed} embed The message to be sent.
     * @param {DiscordJs.TextChannel|DiscordJs.DMChannel|DiscordJs.GroupDMChannel|DiscordJs.GuildMember} channel The channel to send the message to.
     * @returns {Promise<DiscordJs.Message>} A promise that resolves with the sent message.
     */
    static async richQueue(embed, channel) {
        if (channel.id === discord.user.id) {
            return void 0;
        }

        embed.setFooter(embed.footer ? embed.footer.text : "", Discord.icon);

        if (embed && embed.fields) {
            embed.fields.forEach((field) => {
                if (field.value && field.value.length > 1024) {
                    field.value = field.value.substring(0, 1024);
                }
            });
        }

        if (!embed.color) {
            embed.setColor(0xFF6600);
        }

        if (!embed.timestamp) {
            embed.setTimestamp(new Date());
        }

        let msg;
        try {
            const msgSent = await channel.send("", embed);

            if (msgSent instanceof Array) {
                msg = msgSent[0];
            } else {
                msg = msgSent;
            }
        } catch {}
        return msg;
    }

    //   #    #             #   ##   #                             ##    ###         #  #
    //  # #                 #  #  #  #                              #    #  #        ## #
    //  #    ##    ###    ###  #     ###    ###  ###   ###    ##    #    ###   #  #  ## #   ###  # #    ##
    // ###    #    #  #  #  #  #     #  #  #  #  #  #  #  #  # ##   #    #  #  #  #  # ##  #  #  ####  # ##
    //  #     #    #  #  #  #  #  #  #  #  # ##  #  #  #  #  ##     #    #  #   # #  # ##  # ##  #  #  ##
    //  #    ###   #  #   ###   ##   #  #   # #  #  #  #  #   ##   ###   ###     #   #  #   # #  #  #   ##
    //                                                                          #
    /**
     * Finds a Discord channel by its name.
     * @param {string} name The name of the channel.
     * @returns {DiscordJs.GuildChannel} The Discord channel.
     */
    static findChannelByName(name) {
        return guild.channels.find((c) => c.name === name);
    }

    //  #            ##
    //              #  #
    // ##     ###   #  #  #  #  ###    ##   ###
    //  #    ##     #  #  #  #  #  #  # ##  #  #
    //  #      ##   #  #  ####  #  #  ##    #
    // ###   ###     ##   ####  #  #   ##   #
    /**
     * Determines whether the user is the owner.
     * @param {DiscordJs.GuildMember} member The user to check.
     * @returns {boolean} Whether the user is the owner.
     */
    static isOwner(member) {
        return member && member.user.username === settings.admin.username && member.user.discriminator === settings.admin.discriminator;
    }
}

module.exports = Discord;
