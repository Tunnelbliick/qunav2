import fs from 'fs';
import https from 'https';

export async function downloadBeatmap(url: string, dest: string, mapid: number): Promise<void> {
    return new Promise((res, rej) => {
        const fileexists = fs.existsSync(dest);
        if (fileexists) {
            const filestat = fs.statSync(`${dest}`);
            if (filestat.size != 0)
                return res();
        }

        const file = fs.createWriteStream(dest);
        const headers = { 'User-agent': 'Quna Discord Bot' }
        const req = https.get(`${url}/${mapid}`, { method: 'GET', headers: headers })
            .on('response', (response) => {
                if (response.statusCode === 200) {
                    response.pipe(file);
                    file.on('finish', async () => {
                        await file.close();
                        req.end();
                        return res();
                    });
                }
            })
            .on('error', (err) => {
                fs.unlinkSync(dest);
                return rej(err);
            });
        return req.end();
    });
}

export async function downloadAndOverrideBeatmap(url: string, dest: string, mapid: number): Promise<void> {
    return new Promise((res, rej) => {
        const fileexists = fs.existsSync(dest);
        if (fileexists) {
            const filestat = fs.statSync(`${dest}`);
            if (filestat.size != 0)
                return res();
        }

        const file = fs.createWriteStream(dest);
        const headers = { 'User-agent': 'Quna Discord Bot' }
        const req = https.get(`${url}/${mapid}`, { method: 'GET', headers: headers })
            .on('response', (response) => {
                if (response.statusCode === 200) {
                    response.pipe(file);
                    file.on('finish', async () => {
                        await file.close();
                        req.end();
                        return res();
                    });
                }
            })
            .on('error', (err) => {
                fs.unlinkSync(dest);
                return rej(err);
            });
        return req.end();
    });
}

export async function generateEmptyBeatmaps(dest: string): Promise<void> {
    return new Promise(async (res, rej) => {
        const filexists = fs.existsSync(`${dest}`);
        if (filexists) {
            return res();
        }
        const file = fs.createWriteStream(dest);
        await file.close();
        return res();
    });
}
