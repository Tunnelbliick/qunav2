import { buildshowSuggestions, show_suggestion_embed } from "../../embeds/osu/recommend/showsuggestion/showsuggestion";

export interface show_suggestion_collector_params {
    message: any,
    row: any,
    suggestions: any,
    user: any,
    skip_prior_button: any,
    prior_button: any,
    next_button: any,
    skip_next_button: any,
}

export async function launchShowSuggestionCollector(params: show_suggestion_collector_params) {

    const message = params.message;
    const prior_button = params.prior_button;
    const next_button = params.next_button;
    const skip_next_button = params.skip_next_button;
    const skip_prior_button = params.skip_prior_button;
    const max_page = params.suggestions.length;
    const suggestions = params.suggestions;
    const user = params.user;
    const row = params.row;

    let index = 0;

    const filter = (i: any) => {
        return i.customId === prior_button.customId ||
            i.customId === next_button.customId ||
            i.customId === skip_next_button.customId ||
            i.customId === skip_prior_button.customId;
    }

    const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 })

    if (collector != null)
        collector!.on("collect", async (i: any) => {

            let para = i.customId.split("_")[1];

            switch (para) {
                case "dec":
                    if (index > 0) {
                        index--;
                    }
                    break;
                case "inc":
                    if (index + 1 < max_page) {
                        index++;
                    }
                    break;
                case "skipdec":
                    if (index > 4) {
                        index = index - 5;
                    } else {
                        index = 0;
                    }
                    break;
                case "skipinc":
                    if (index === 0) {
                        index = index + 4;
                    }
                    if (index + 5 < max_page) {
                        index = index + 5;
                    } else {
                        index = max_page - 1;
                    }
                    break;
            }

            let pagecontent = suggestions.slice(index * 5, index + 5);

            let embed_params: show_suggestion_embed = {
                current_page: 0,
                max: suggestions.length,
                suggestions: pagecontent,
                user: user
            }

            let recommendationlist = buildshowSuggestions(embed_params);

            collector.resetTimer();

            await message.edit({ embeds: [recommendationlist], components: [row] })
            await i.deferUpdate();

        })

    if (collector != undefined)
        collector!.on("end", async () => {

            prior_button.setDisabled(true);
            next_button.setDisabled(true);
            skip_next_button.setDisabled(true);
            skip_prior_button.setDisabled(true);


            let pagecontent = suggestions.slice(index * 5, 5);
            let embed_params: show_suggestion_embed = {
                current_page: 0,
                max: suggestions.length,
                suggestions: pagecontent,
                user: user
            }

            let recommendationlist = buildshowSuggestions(embed_params);

            await message.edit({ embeds: [recommendationlist], components: [row] })
        });

}
