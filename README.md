# ol-azure-manager

This repository starts and shuts down Azure servers as needed through a Discord chat interface.  Use `!servers` to start wherever the Discord bot "The Fourth Sovereign" is located.

## Deprecation Notice

As of 8/31/2022, this application is no longer being developed here.  It has been merged with [otl.gg](https://github.com/overload-development-community/otl.gg).

## Version History

### v1.0.5 - 8/27/2022

* Servers now shut down after being idle for 15 minutes, rather than 60 minutes after startup or the start of the most recent game.
* Player updates are now reported continuously throughout the game.
* Player updates are now reported every 5 seconds instead of every 60 seconds.
* Games are now reported upon completion.
* Package updates.

### v1.0.4 - 8/20/2022

* Include host name in many commands.
* Show geographical location in `!servers` command.
* Package updates.

### v1.0.3 - 7/26/2022

* Modernization of libraries.

### v1.0.2 - 3/17/2019

* Include the IP address when giving a lobby status update.

### v1.0.1 - 3/10/2019

* Refactor to move server updates to its own class.
* When the `!extend` command is used, it will post future updates to the channel the most recent !extend command was used in.

### v1.0.0 - 3/2/2019

Initial version.
