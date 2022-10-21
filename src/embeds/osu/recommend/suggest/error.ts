import { Message, MessageEmbed } from "discord.js";

export function invalidMapUrl(url: any, message: Message, prefix: any) {
    const embed = new MessageEmbed()
        .setColor(0x737df9)
        .setTitle("Invalid Url")
        .setDescription(`There was no map that was found with the url: ${url}`)
        .setFooter({ text: `Use ${prefix}help suggest for more info.` })
    message.channel.send({ embeds: [embed] })
}

export function missingParameters(message: Message, prefix: any) {
    const errembed = new MessageEmbed().setTitle("Suggest a beatmap")
        .setDescription(`To suggest a beatmap you have to atleast supply 1 map category`)
        .setFooter({ text: `Use ${prefix}help suggest for more info.` })
    message.reply({ embeds: [errembed] });
}

export function invalidcategorie(message: Message, category: any, prefix: any) {
    const embed = new MessageEmbed()
        .setColor(0x737df9)
        .setTitle(`Invalid Category`)
        .setDescription(`The Category \`${category}\` was not found!\nPlease check the available categories with \`${prefix}lc\` or \`${prefix}categories\``)

    message.reply({ embeds: [embed] });
}

export function alreadyUpvoted(beatmap: any, message: Message, row: any) {
    const embed = new MessageEmbed().setAuthor({ name: `Already Suggested` })
        .setColor(0x737df9)
        .setTitle(`${beatmap.beatmapset.artist} - ${beatmap.beatmapset.title} [${beatmap.version}]`)
        .setURL(`${beatmap.url}`)
        .setDescription("This beatmap has already been suggested / upvoted by you.");

    message.edit({ embeds: [embed], components: [row] });
}