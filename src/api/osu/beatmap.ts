import Beatmap from "../../models/Beatmap";
import { login } from "./login";
import { v2 } from "osu-api-extended";

export interface beatmap {
    beatmapset_id: number;
    difficulty_rating: number;
    id: number;
    mode: string;
    status: string;
    total_length: number;
    user_id: number;
    version: string;
    accuracy: number;
    ar: number;
    bpm: number;
    convert: boolean;
    count_circles: number;
    count_sliders: number;
    count_spinners: number;
    cs: number;
    deleted_at: string;
    drain: number;
    hit_length: number;
    is_scoreable: boolean;
    last_updated: string;
    mode_int: number;
    passcount: number;
    playcount: number;
    ranked: number;
    url: string;
    checksum: string;
    beatmapset: {
        artist: string;
        artist_unicode: string;
        covers: {
            cover: string;
            'cover@2x': string;
            card: string;
            'card@2x': string;
            list: string;
            'list@2x': string;
            slimcover: string;
            'slimcover@2x': string;
        };
        creator: string;
        favourite_count: number;
        hype: {
            current: number;
            required: number;
        };
        id: number;
        nsfw: boolean;
        offset: number;
        play_count: number;
        preview_url: string;
        source: string;
        status: string;
        title: string;
        title_unicode: string;
        track_id: number;
        user_id: number;
        video: boolean;
        availability: {
            download_disabled: boolean;
            more_information: string;
        };
        bpm: number;
        can_be_hyped: boolean;
        discussion_enabled: boolean;
        discussion_locked: boolean;
        is_scoreable: boolean;
        last_updated: string;
        legacy_thread_url: string;
        nominations_summary: {
            current: number;
            required: number;
        };
        ranked: number;
        ranked_date: string;
        storyboard: boolean;
        submitted_date: string;
        tags: string;
        has_favourited: boolean;
        ratings: number[];
    };
    failtimes: {
        fail: number[];
        exit: number[];
    };
    max_combo: number;
}

export async function getBeatmap(mapid: any): Promise<beatmap> {
    await login();
    return new Promise((resolve, reject) => {
        const result = v2.beatmaps.lookup({type: "difficulty",id: mapid, checksum: "", filename: ""})

        result.then(async (data: any) => {

            const beatmapObject = new Beatmap();

            beatmapObject.checksum = data.checksum;
            beatmapObject.mapid = data.id;
            beatmapObject.beatmap = data;

            await beatmapObject.save();

            return resolve(data);
        });
    });
}

export async function getBeatmapSet(setid: number) {
    await login();
    return new Promise((resolve, reject) => {
        const result = v2.beatmaps.lookup({type:"set", id:setid});

        result.then((data: any) => {
            return resolve(data);
        });
    });
}

export async function getBeatmapFromCache(mapid: any, checksum?: any) {

    let beatmapObject = await Beatmap.findOne({ mapid: mapid });

    if (beatmapObject == undefined || beatmapObject.checksum != checksum || beatmapObject.beatmap == undefined) {
        await login();
        return new Promise((resolve, reject) => {

            const result = v2.beatmaps.lookup({type:"difficulty", id: mapid, checksum: "", filename: ""})

            result.then(async (data: any) => {

                if (beatmapObject == undefined)
                    beatmapObject = new Beatmap();

                beatmapObject.checksum = data.checksum;
                beatmapObject.mapid = data.id;
                beatmapObject.beatmap = data;

                await beatmapObject.save();

                return resolve(data);
            });
        });
    } else {
        return (beatmapObject.beatmap);
    }
}
