import axios from "axios";

export async function getDailyTop(offset: number) {

    const api_key = process.env.osudaily;
    return axios.get<any>(`https://osudaily.net/ranking.php?m=0&p=${offset}&t=pp`).then((result: any) => {
        return result
    }).catch((e: any) => {
        console.log(e)
    });

}

export async function getOsuTop10000(offset: number, code: string, retries: number = 3): Promise<any> {
    return new Promise(async (resolve, reject) => {
        const fetchData = async (attempt: number) => {
            try {
                const result = await axios.get<any>(`https://osu.ppy.sh/rankings/osu/performance?country=${code}&page=${offset}#scores`);
                resolve(result);
            } catch (e: any) {
                if (e.code === 'EPROTO') {
                    console.error('SSL error encountered:', e.message);
                } else {
                    console.error('Error:', e);
                }

                if (attempt < retries) {
                    console.log(`Retrying in 5 seconds... (${retries - attempt} retries left)`);
                    setTimeout(() => {
                        fetchData(attempt + 1);
                    }, 5000);
                } else {
                    console.error('No more retries available.');
                    reject(e);
                }
            }
        };

        fetchData(1);
    });
}