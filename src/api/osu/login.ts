import { auth } from "osu-api-extended"

let expireTime: number;

const grace = 1000;

export async function login() {
    return new Promise((resolve, reject) => {

        const timeInSeconds = Math.floor(new Date().getTime() / 1000);
        const SCOPE_LIST: any = ['public'];
        const osuid: any = process.env.osuid;
        const secret: any = process.env.osusecret;

        auth.login({method:"v2",client_id:osuid, client_secret:secret, scopes:SCOPE_LIST});
        
        return resolve(true);

        /*
        if (expireTime == null || (expireTime - grace) < timeInSeconds) {
            const osuid: any = process.env.osuid;
            const secret: any = process.env.osusecret;
            auth.login(osuid, secret).then((result: any) => {

                expireTime = timeInSeconds + result.expires_in;

                console.log("refreshed token");
                return resolve(true);           
            });
        } else {

            return resolve(true);

        }*/
    })
}