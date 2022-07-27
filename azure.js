const azure = require("@azure/identity"),
    ComputeManagementClient = require("@azure/arm-compute").ComputeManagementClient,

    settings = require("./settings").azure;

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
        const credential = new azure.ClientSecretCredential(settings.tenantId, settings.clientId, settings.secret),
            client = new ComputeManagementClient(credential, settings.subscriptionId);

        return client.virtualMachines.beginStart(server.resourceGroupName, server.vmName);
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
        const credential = new azure.ClientSecretCredential(settings.tenantId, settings.clientId, settings.secret),
            client = new ComputeManagementClient(credential, settings.subscriptionId);

        return client.virtualMachines.beginDeallocate(server.resourceGroupName, server.vmName);
    }
}

module.exports = Azure;
