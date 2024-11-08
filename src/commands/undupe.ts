import { ICommand } from "wokcommands";
import Beatmap from "../models/Beatmap";

export default {
    category: "Admin",
    description: "Removes duplicate beatmaps from the database.",
    hidden: true,
    ownerOnly: true, // Ensure only the bot owner can use this command

    callback: async ({ message, interaction }) => {
        // Send an initial message
        const reply: any = interaction
            ? await interaction.reply({ content: "Checking for duplicates...", fetchReply: true })
            : await message.reply("Checking for duplicates...");

        try {
            // Aggregate duplicate groups
            const duplicates = await Beatmap.aggregate([
                {
                    $group: {
                        _id: { mapid: "$mapid", checksum: "$checksum" }, // Group by mapid and checksum
                        ids: { $push: "$_id" }, // Collect all document IDs in the group
                        count: { $sum: 1 } // Count the documents in the group
                    }
                },
                {
                    $match: {
                        count: { $gt: 1 } // Only include groups with duplicates
                    }
                }
            ]);

            // Track how many duplicates were removed
            let duplicatesRemoved = 0;

            for (const group of duplicates) {
                const [keepId, ...deleteIds] = group.ids; // Keep the first ID, delete the rest

                // Delete all other duplicates
                const result = await Beatmap.deleteMany({ _id: { $in: deleteIds } });
                duplicatesRemoved += result.deletedCount || 0;
            }

            // Send final update
            const finalMessage = `Removed ${duplicatesRemoved} duplicate beatmap entries.`;
            if (interaction) {
                await reply.edit(finalMessage);
            } else {
                await message.reply(finalMessage);
            }
        } catch (error) {
            console.error("Error removing duplicates:", error);
            const errorMessage = "An error occurred while removing duplicates. Check the logs for details.";
            if (interaction) {
                await reply.edit(errorMessage);
            } else {
                await message.reply(errorMessage);
            }
        }
    }
} as ICommand;
