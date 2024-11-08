import { ICommand } from "wokcommands";
import PerformancePoints from "../models/PerformancePoints";
import { recalculateBeatMap } from "../api/pp/db/loadmap";

export default {

    category: "osu!",
    slash: "both",
    description: "Information about Quna",
    hidden: true,
    ownerOnly: true,

    callback: async ({ message, interaction }) => {

        let userid: any = 0;

        if (interaction) {
            userid = interaction.user.id;
        } else {
            userid = message.author.id;
        }

        if (userid !== "203932549746130944") {
            return;
        }

        const batchSize = 1000; // Number of entries per batch
        let skip = 0; // Tracks the number of entries already processed
        let totalProcessed = 0; // Tracks the total number of entries processed
        const totalEntries = await PerformancePoints.countDocuments(); // Total number of entries
        let hasMore = true; // Determines whether there are more entries to process

        // Send an initial message in Discord
        const progressMessage: any = interaction
            ? await interaction.reply({ content: `Starting recalculation of ${totalEntries} entries...`, fetchReply: true })
            : await message.reply(`Starting recalculation of ${totalEntries} entries...`);

        console.log(`Starting recalculation of ${totalEntries} entries...`);

        while (hasMore) {
            // Fetch a batch of entries
            const ppBatch = await PerformancePoints.find({})
                .skip(skip)
                .limit(batchSize);

            if (ppBatch.length === 0) {
                hasMore = false;
                break;
            }

            for (const pp of ppBatch) {
                try {
                    await recalculateBeatMap(pp);
                } catch (err) {
                    console.error(`Error processing ${pp.mapid}:`, err);
                }

                totalProcessed++;

                // Update progress every 100 entries
                if (totalProcessed % 100 === 0) {
                    console.log(`Total processed: ${totalProcessed}/${totalEntries}`);

                    // Edit the progress message in Discord
                    await progressMessage.edit(`Progress: ${totalProcessed}/${totalEntries} entries processed.`);
                }
            }

            // Update batch skip
            skip += batchSize;
        }

        // Final update
        console.log(`Recalculation complete. Total entries processed: ${totalProcessed}/${totalEntries}`);
        await progressMessage.edit(`Recalculation complete. Total entries processed: ${totalProcessed}/${totalEntries}`);
    },
} as ICommand;
