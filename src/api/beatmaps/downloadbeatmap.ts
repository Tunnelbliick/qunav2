import fs from 'fs';
import https from 'https';

export async function downloadBeatmap(url: any, dest: any, mapid: any) {
    return new Promise((res, rej) => {
        let fileexists = fs.existsSync(dest);
        if (fileexists) {
            let filestat = fs.statSync(`${dest}`);
            if (filestat.size != 0)
                return res(dest);
        }

        const file = fs.createWriteStream(dest);
        let headers = { 'User-agent': 'Quna Discord Bot' }
        const req = https.get(`${url}/${mapid}`, { method: 'GET', headers: headers })
            .on('response', (response: any) => {
                if (response.statusCode === 200) {
                    response.pipe(file);
                    file.on('finish', async () => {
                        await file.close();
                        req.end();
                        return res(dest);
                    });
                }
            })
            .on('error', (err: any) => {
                fs.unlinkSync(dest);
                return rej(err);
            });
        return req.end();
    });
}

export async function downloadAndOverrideBeatmap(url: any, dest: any, mapid: any) {
    return new Promise((res, rej) => {
        let fileexists = fs.existsSync(dest);
        if (fileexists) {
            let filestat = fs.statSync(`${dest}`);
            if (filestat.size != 0)
                return res(dest);
        }

        const file = fs.createWriteStream(dest);
        let headers = { 'User-agent': 'Quna Discord Bot' }
        const req = https.get(`${url}/${mapid}`, { method: 'GET', headers: headers })
            .on('response', (response: any) => {
                if (response.statusCode === 200) {
                    response.pipe(file);
                    file.on('finish', async () => {
                        await file.close();
                        req.end();
                        return res(dest);
                    });
                }
            })
            .on('error', (err: any) => {
                fs.unlinkSync(dest);
                return rej(err);
            });
        return req.end();
    });
}

export async function generateEmptyBeatmaps(dest: any) {
    return new Promise(async (res, rej) => {
        let filexists = fs.existsSync(`${dest}`);
        if (filexists) {
            return res(dest);
        }
        const file = fs.createWriteStream(dest);
        await file.close();
        return res(dest);
    });
}
