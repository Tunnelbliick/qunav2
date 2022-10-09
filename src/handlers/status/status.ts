import { Client } from "discord.js";

export default (client: Client) => {

    const statusOptions = [

        `${client.guilds.cache.size} servers | !help`,
        `!owc | Preparing for a pick'em!`

    ]
    const updateStatus = () => {
        Math
        client.user?.setActivity(statusOptions[getRandomInt(statusOptions.length)], {type: 2})
        setTimeout(updateStatus, 1000 * 60 * 10)
    }
    updateStatus()
}

export const config = {
    dbName: 'STATUS_CHANGER',
    displayName: 'Status Changer'
}

function getRandomInt(max: any) {
    return Math.floor(Math.random() * max);
  }
  