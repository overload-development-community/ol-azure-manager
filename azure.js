const azure = require("ms-rest-azure"),
    Compute = require("azure-arm-compute").ComputeManagementClient,

    settings = require("./settings").azure;

/**
 * @typedef {import("ms-rest-azure").ApplicationTokenCredentials} ApplicationTokenCredentials
 */

//    #
//   # #
//  #   #  #####  #   #  # ##    ###
//  #   #     #   #   #  ##  #  #   #
//  #####    #    #   #  #      #####
//  #   #   #     #  ##  #      #
//  #   #  #####   ## #  #       ###
/**
 * A class that handles calls to Azure.
 */
class Azure {
    //         #                 #
    //         #                 #
    //  ###   ###    ###  ###   ###
    // ##      #    #  #  #  #   #
    //   ##    #    # ##  #      #
    // ###      ##   # #  #       ##
    /**
     * Starts an Azure VM.
     * @param {*} server The server to start.
     * @returns {Promise} A promise that resolves when the server has been started.
     */
    static async start(server) {
        const credentials = await azure.loginWithServicePrincipalSecret(settings.clientId, settings.secret, settings.domain),
            client = new Compute(credentials, settings.subscriptionId);

        return client.virtualMachines.start(server.resourceGroupName, server.vmName);
    }

    //         #
    //         #
    //  ###   ###    ##   ###
    // ##      #    #  #  #  #
    //   ##    #    #  #  #  #
    // ###      ##   ##   ###
    //                    #
    /**
     * Stops an Azure VM.
     * @param {*} server The server to stop.
     * @returns {Promise} A promise that resolves when the server has been stopped.
     */
    static async stop(server) {
        const credentials = await azure.loginWithServicePrincipalSecret(settings.clientId, settings.secret, settings.domain),
            client = new Compute(credentials, settings.subscriptionId);

        return client.virtualMachines.deallocate(server.resourceGroupName, server.vmName);
    }
}

module.exports = Azure;
