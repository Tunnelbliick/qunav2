import { Client } from "discord.js";

export default (client: Client) => {

    const statusOptions = [
        `helping ${client.guilds.cache.size} servers | !help`,
    ]

    let i = 0

    const updateStatus = () => {

        // because of how discord api works this shit has to be seperated from setstatus which is balls
        client.user?.setActivity(statusOptions[i], {type: 0})
        
        if(++i >= statusOptions.length){
            i = 0
        }
        setTimeout(updateStatus, 1000 * 60 * 10)
    }
    updateStatus()
}

export const config = {
    dbName: 'STATUS_CHANGER',
    displayName: 'Status Changer'
}