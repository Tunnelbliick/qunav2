export class Arguments {
    userid: string | number | undefined;
    username: string | undefined;
    discordid: string | undefined;
}

export class BanchoParams {
    include_fails?: boolean;
    mode?: 'osu' | 'fruits' | 'mania' | 'taiko';
    mods?: number;
    limit?: string;
    offset?: string;
}