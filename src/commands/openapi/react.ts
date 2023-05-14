import { ICommand } from "wokcommands";
import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "openai";
import map from "../osu/map/map";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const moods = [
    " Give a angry response and roast the score.",
    " Give a nice response.",
    " Give a meme response.",
    " Respond like this is a masterchef episode",
    " Respond like a dumb twitter user that has no idea what he is talking about",
    " Respond angry with lines from games like GTA5",
]

export default {

    category: "openapi!",
    aliases: ["reaction"],
    cooldown: "20s",
    description: "AI reaction to something",


    callback: async ({ message, args, prefix }) => {

        message.channel.sendTyping();
        let embed = null;
        let reference_message: any = null;

        if (message && message.reference != null) {
            const reference_id: any = message.reference?.messageId;
            reference_message = await message.channel.messages.fetch(reference_id);
            embed = reference_message.embeds[0];
        }

        let prompt = "";

        if (embed != undefined) {
            try {
                prompt = buildPromptFromEmbed(embed)
            } catch (err: any) {
                console.log(err);
                message.reply("Could not respond to this. Maybee its not implemented yet");
                return;
            }
        } else {
            try {
                prompt = buildPromptFromText(reference_message.content.slice(0,500))
            } catch (err: any) {
                console.log(err);
                message.reply("Could not respond to this. Maybee its not implemented yet");
                return;
            }
        }

        const openai = new OpenAIApi(configuration);
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            temperature: 0.6,
            max_tokens: 250,
        })

        const comment: any = completion.data.choices[0].text;

        reference_message.reply(comment);

    }

} as ICommand

function buildPromptFromText(text: any) {
    let prompt = "a discord user asked you to react to this message: ";

    prompt += text + ",";

    prompt += moods[Math.floor(Math.random() * moods.length)]

    //console.log(prompt);

    return prompt;
}

function buildPromptFromEmbed(embed: any) {

    let prompt = "a discord user asked you to react to this osu! score: ";

    let songinfo: SongInfo = parseSongInfo(embed.title);
    let playInfo: PlayInfo = {
        rank: "",
        completion: ""
    }

    let playProgress: PlayProgress = {
        rank: "",
        progress: "",
        score: "",
        accuracy: ""
    }

    let playDetail: PlayDetail = {
        playPP: "",
        SSPP: "",
        playCombo: "",
        maxCombo: "",
        hit300: "",
        hit100: "",
        hit50: "",
        miss: ""
    }

    let score: string;
    let acc: string = "";
    let pp: PPInfo = {
        playPP: "",
        SSPP: ""
    }
    let combo: ComboInfo = {
        playCombo: "",
        maxCombo: ""
    }
    let hitInfo: HitInfo = {
        hit300: "",
        hit100: "",
        hit50: "",
        miss: ""
    }
    let ppIfFc: PPInfo = {
        playPP: "",
        SSPP: ""
    }
    let accIfFc: string;
    let hitsIfFc: HitInfo = {
        hit300: "",
        hit100: "",
        hit50: "",
        miss: ""
    }
    let mapInfo: MapInfo = {
        Length: "",
        DrainTime: "",
        BPM: "",
        Objects: "",
        CS: "",
        AR: "",
        OD: "",
        HP: "",
        Stars: ""
    };

    let acc_counter = 0;
    let hits_counter = 0;

    embed.fields.forEach((field: any) => {
        switch (field.name) {

            case "Grade":
                playInfo = parsePlayInfo(field.value);
                break;

            case "Score":
                score = field.value;
                break;

            case "Acc":
                if (acc_counter === 0) {
                    acc = field.value;
                    acc_counter++;
                } else {
                    accIfFc = field.value;
                }
                break;

            case "PP":
                pp = parsePPInfo(field.value);
                break;

            case "Combo":
                combo = parseComboInfo(field.value);
                break;

            case "Hits":
                if (hits_counter === 0) {
                    hitInfo = parseHitInfo(field.value);
                    hits_counter++;
                } else {
                    hitsIfFc = parseHitInfo(field.value);
                }
                break;

            case "PP if FC":
                ppIfFc = parsePPInfo(field.value);
                break;

            case "Map Info":
                mapInfo = parseMapInfo(field.value);
                break;

            default:
                if (field.name.startsWith("1.")) {
                    playProgress = parsePlayScore(field.name.toLowerCase());
                    playDetail = parsePlayData(field.value.toLowerCase());
                } else {
                    playProgress = parsePlayProgress(field.name.toLowerCase());
                    playDetail = parsePlayDetail(field.value.toLowerCase());
                }
        }
    });

    if (playProgress.rank !== "") {
        playInfo.rank = playProgress.rank;
        hitInfo.hit300 = playDetail.hit300;
        hitInfo.hit100 = playDetail.hit100;
        hitInfo.hit50 = playDetail.hit50;
        hitInfo.miss = playDetail.miss;
        combo.playCombo = playDetail.playCombo;
        combo.maxCombo = playDetail.maxCombo;
        acc = playProgress.accuracy;
        pp.playPP = playDetail.playPP;
        ppIfFc.playPP = playDetail.SSPP;
    }

    let song = `${songinfo.artist} - ${songinfo.title} [${songinfo.difficulty}] `;
    let info = `The play is ${playInfo.rank == "F" ? "a fail" : "a " + playInfo.rank + " rank"} Hits: 300x${hitInfo.hit300} 100x${hitInfo.hit100} 50x${hitInfo.hit50} misses:${hitInfo.miss} with an accuracy of ${acc} and a combo ${combo.playCombo.replace("**", "")} of ${combo.maxCombo.replace("**", "")}, achived ${pp.playPP.replace("**", "")}PP which would be ${ppIfFc.playPP.replace("**", "")}PP if it would be an fc.`

    prompt += song;
    prompt += info;

    prompt += moods[Math.floor(Math.random() * moods.length)]

    //console.log(prompt);

    return prompt;
}

type SongInfo = {
    artist: string;
    title: string;
    difficulty: string;
}

function parseSongInfo(song: string): SongInfo {
    const artistTitleSplit = song.split(' - ');
    const artist = artistTitleSplit[0];
    const titleDifficultySplit = artistTitleSplit[1].split(' [');
    const title = titleDifficultySplit[0];
    const difficulty = titleDifficultySplit[1].slice(0, -1);  // Remove the closing bracket

    return {
        artist: artist,
        title: title,
        difficulty: difficulty,
    };
}

type PlayInfo = {
    rank: string;
    completion: string;
}

function parsePlayInfo(playInfo: string): PlayInfo {
    const rankMatch = playInfo.match(/<:ranking(\w+):/);
    const rank = rankMatch ? rankMatch[1] : "";

    const completionMatch = playInfo.match(/\(([^%]+)%\)/);
    const completion = completionMatch ? completionMatch[1] : "";

    return {
        rank: rank,
        completion: completion,
    };
}

type PPInfo = {
    playPP: string;
    SSPP: string;
}

function parsePPInfo(ppInfo: string): PPInfo {
    const ppSplit = ppInfo.replace("**", "").split('/');
    const playPP = ppSplit[0];
    const SSPP = ppSplit[1].replace("PP", "");

    return {
        playPP: playPP,
        SSPP: SSPP,
    };
}

type ComboInfo = {
    playCombo: string;
    maxCombo: string;
}

function parseComboInfo(comboInfo: string): ComboInfo {
    const comboSplit = comboInfo.replace("**", "").split('/');
    const playCombo = comboSplit[0].replace("x", "");
    const maxCombo = comboSplit[1].replace("x", "");

    return {
        playCombo: playCombo,
        maxCombo: maxCombo,
    };
}

type HitInfo = {
    hit300: string;
    hit100: string;
    hit50: string;
    miss: string;
}

function parseHitInfo(hitInfo: string): HitInfo {
    const hitSplit = hitInfo.replace("{", "").replace("}", "").split('/');
    const hit300 = hitSplit[0];
    const hit100 = hitSplit[1];
    const hit50 = hitSplit[2];
    const miss = hitSplit[3];

    return {
        hit300: hit300,
        hit100: hit100,
        hit50: hit50,
        miss: miss,
    };
}

type MapInfo = {
    Length: string;
    DrainTime: string;
    BPM: string;
    Objects: string;
    CS: string;
    AR: string;
    OD: string;
    HP: string;
    Stars: string;
}

function parseMapInfo(mapInfo: string): MapInfo {
    const lines = mapInfo.split('\n').map(line => line.replace(/`/g, ''));

    let mapInfoObj: any = {
        Length: "",
        DrainTime: "",
        BPM: "",
        Objects: "",
        CS: "",
        AR: "",
        OD: "",
        HP: "",
        Stars: ""
    };

    for (let line of lines) {
        const keyValSplit = line.split(': ');
        if (keyValSplit[0] === 'Length') {
            const lengthSplit = keyValSplit[1].trim().split('(');
            mapInfoObj.Length = lengthSplit[0];
            mapInfoObj.DrainTime = lengthSplit[1].slice(0, -1);  // Remove the closing bracket
        } else {
            mapInfoObj[keyValSplit[0]] = keyValSplit[1].trim();
        }
    }

    return mapInfoObj;
}

type PlayProgress = {
    rank: string;
    progress: string;
    score: string;
    accuracy: string;
}

function parsePlayProgress(playProgress: string): PlayProgress {
    const rankMatch = playProgress.match(/<:ranking(\w+):/);
    const rank = rankMatch ? rankMatch[1] : "";

    const progressMatch = playProgress.match(/\(([^%]+)%\)/);
    const progress = progressMatch ? progressMatch[1] : "";

    const scoreAndAccuracyMatch = playProgress.match(/(\d+)\s+\(([^%]+)%\)/);
    const score = scoreAndAccuracyMatch ? scoreAndAccuracyMatch[1] : "";
    const accuracy = scoreAndAccuracyMatch ? scoreAndAccuracyMatch[2] : "";

    return {
        rank: rank,
        progress: progress,
        score: score,
        accuracy: accuracy,
    };
}

function parsePlayScore(playScore: string): PlayProgress {
    const rankMatch = playScore.match(/:ranking(\w+):/);
    const rank = rankMatch ? rankMatch[1] : "";

    const starsMatch = playScore.match(/\[([^\★]+)\★\]/);
    const stars = starsMatch ? starsMatch[1] : "";

    const scoreAndAccuracyMatch = playScore.match(/\]\s+(\d+)\s+\(([^%]+)%\)/);
    const score = scoreAndAccuracyMatch ? scoreAndAccuracyMatch[1] : "";
    const accuracy = scoreAndAccuracyMatch ? scoreAndAccuracyMatch[2] : "";

    return {
        rank: rank,
        score: score,
        accuracy: accuracy,
        progress: ""
    };
}

function parsePlayData(playData: string): PlayDetail {
    const ppSplit = playData.split('pp')[0].replace("**", "").split('/');
    const comboSplit = playData.split('pp')[1].split('x ')[0].replace("**", "").split('/');
    const hitSplit = playData.split('x ')[1].split('{')[1].split('}')[0].split('/');

    return {
        playPP: ppSplit[0],
        SSPP: ppSplit[1],
        playCombo: comboSplit[0],
        maxCombo: comboSplit[1],
        hit300: hitSplit[0],
        hit100: hitSplit[1],
        hit50: hitSplit[2],
        miss: hitSplit[3],
    };
}


type PlayDetail = {
    playPP: string;
    SSPP: string;
    playCombo: string;
    maxCombo: string;
    hit300: string;
    hit100: string;
    hit50: string;
    miss: string;
}

function parsePlayDetail(playDetail: string): PlayDetail {
    const ppSplit = playDetail.split('pp')[0].replace("**", "").split('/');
    const comboSplit = playDetail.split('pp')[1].split('[')[1].split(']')[0].replace("**", "").split('/');
    const hitSplit = playDetail.split('{')[1].replace("{", "").replace("}", "").split('/');

    return {
        playPP: ppSplit[0],
        SSPP: ppSplit[1],
        playCombo: comboSplit[0].replace("x", ""),
        maxCombo: comboSplit[1].replace("x", ""),
        hit300: hitSplit[0],
        hit100: hitSplit[1],
        hit50: hitSplit[2],
        miss: hitSplit[3],
    };
}
