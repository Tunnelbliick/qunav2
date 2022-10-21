export class predictions_arguments {
    discordid: any = undefined;
    username: any = undefined;
}

export async function buildPredictionArguments(interaction: any, args: any) {

    let discordid: any = undefined;
    let username: any = undefined;

    if (interaction) {

        const options = interaction.options;

        if (options !== undefined) {
            discordid = options.getMember("discord") === null ? undefined : options.getMember("discord")?.toString()!;
            username = options.getString("name") === null ? undefined : options.getString("name")!;
        }
    } else {

        args.forEach((arg: any) => {

            if (arg.includes("<@")) {
                discordid = arg;
                return;
            }

            if (username === undefined) {
                username = arg;
            } else {
                username += ` ${arg}`;
            }

        })

    }

    if (discordid) {
        discordid = discordid.replace("<@", "").replace(">", "");
    }

    const prediction_args: predictions_arguments = new predictions_arguments();

    prediction_args.discordid = discordid;
    prediction_args.username = username;

    return prediction_args;

}