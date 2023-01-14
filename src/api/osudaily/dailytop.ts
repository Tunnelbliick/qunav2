import axios from "axios";

export async function getDailyTop(offset: number) {

    const api_key = process.env.osudaily;
    return axios.get<any>(`https://osudaily.net/ranking.php?m=0&p=${offset}&t=pp`).then((result: any) => {
        return result
    }).catch((e: any) => {
        console.log(e)
    });

}

export async function getOsuTop10000(offset: number) {
    return axios.get<any>(`https://osu.ppy.sh/rankings/osu/performance?page=${offset}#scores`).then((result: any) => {
        return result
    }).catch((e: any) => {
        console.log(e)
    });
}