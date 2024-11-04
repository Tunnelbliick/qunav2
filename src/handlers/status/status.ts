import { Client } from "discord.js";

export default (client: Client) => {

    const statusOptions = [

        `${client.guilds.cache.size} servers | !help`,
        `Recommendations v3.0!`

    ]
    const updateStatus = () => {
        Math
        client.user?.setActivity(statusOptions[getRandomInt(statusOptions.length)], {type: "PLAYING"})
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
  