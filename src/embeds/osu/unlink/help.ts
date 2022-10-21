import { MessageEmbed } from "discord.js";

export function helpunlink(prefix: string) {

    const embed = new MessageEmbed()
        .setTitle("Help unlink")
        .setDescription("unlinks ur osu! account with quna and deletes your entry from the database.")
        .setFields(
            {
                name: "Usage",
                value: `\`${prefix}unlink\``
            },
            {
                name: "aliases",
                value: `\`${prefix}unlink\` \`/unlink\``,
                inline: true
            });


    return embed;
}