import { ICommand } from "wokcommands";
import crypto from "crypto";
import User from "../../../models/User";
import { encrypt } from "../../../utility/encrypt";
import { retry } from "ts-retry-promise";
import { checkforLinkSucess, generateAuthEmbed, successfullAuthEmbed, timeoutAuthEmbed } from "../../../embeds/osu/link/link";
import { helplink } from "../../../embeds/osu/link/help";

const timeout = new Set()

export default {

    category: "osu!",
    description: "Quna links your osu! profile.",
    slash: "both",


    callback: async ({ message, args, interaction, prefix }) => {

        if (args[0] == "-h" || args[0] == "-help" || args[0] == "help" || args[0] == "h") {
            const embed = helplink(prefix);
            message.reply({ embeds: [embed] });
            return;
        }

        const url = `https://osu.ppy.sh/oauth/authorize?client_id=12872&response_type=code&scope=identify&redirect_uri=https://tnnlb.dev/quna/login`

        const hexGen = crypto.randomBytes(5).toString("hex");
        const date = new Date()
        let dm = "";

        let userObject: any = new User();

        let isSlash = true;

        if (message != null && message.content.startsWith(prefix)) {
            isSlash = false;
        }

        if (isSlash) {
            userObject = await User.findOne({ discordid: await encrypt(interaction.user.id) });
        } else {
            userObject = await User.findOne({ discordid: await encrypt(message.author.id) });
        }

        if (userObject == null) {

            userObject = new User();

            userObject.status = hexGen;
            if (isSlash) {
                userObject.discordid = await encrypt(interaction.user.id);
            } else {
                userObject.discordid = await encrypt(message.author.id);
            }
            userObject.requesttime = date;
            userObject.linksucess = false;
            userObject.validStatus = true;

            await userObject.save();


            dm = `${url}&state=${userObject.status}`

        } else {
            userObject.status = hexGen;
            userObject.requesttime = date;
            userObject.linksucess = false;
            userObject.validStatus = true;
            await userObject.save();
            dm = `${url}&state=${userObject.status}`
        }

        let msg: any;

        if (isSlash === false) {
            msg = await message.author.send({ embeds: [generateAuthEmbed(dm)] }).catch(() => {
                message.reply("I am unable to send you a DM.\nConsider using \`/link\` instead.");
            })

            return;
        }

        if (isSlash) {
            await interaction.deferReply({ ephemeral: true });
            await interaction.editReply({ embeds: [generateAuthEmbed(dm)] });
        } else {
            await message.reply("Sliding into dem DMs :eyes:");
        }

        const checkForLink = retry(() => checkforLinkSucess(userObject.discordid), { delay: 5000, timeout: "INFINITELY", retries: 24 }).catch(() => {

            timeoutAuthEmbed().then((embed: any) => {

                if (isSlash) {
                    interaction.editReply({ embeds: [embed] })
                } else {
                    msg.edit({ embeds: [embed] })
                }
            });
        });

        checkForLink.then((user: any) => {

            if (user == undefined) {
                return;
            }

            successfullAuthEmbed(user).then((embed: any) => {
                if (isSlash) {
                    interaction.editReply({ embeds: [embed] })
                } else {
                    msg.edit({ embeds: [embed] })
                }

            })
        })

        return;
    },

    error: async ({ message }) => {
        console.log("I dont know what happened");
        return;
    }

} as ICommand