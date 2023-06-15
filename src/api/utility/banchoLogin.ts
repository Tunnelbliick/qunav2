import { auth } from "osu-api-extended"
import { auth_scopes } from "osu-api-extended/dist/utility/types";


let expireTime: number;
let expires_in: number;
const scope: auth_scopes = ['public'];

const grace = 1000;

export async function login() {
    return new Promise((resolve) => {

        const timeInSeconds = Math.floor(new Date().getTime() / 1000);

        if(expireTime != null && (expireTime - grace) < timeInSeconds) {
            auth.re_login().then(() => {

                expireTime = timeInSeconds + expires_in;

                console.log("refreshed token");
                return resolve(true);           
            });
        }

        if (expireTime == null) {
            const osuid: number | undefined = +process.env.osuid!;
            const secret: string | undefined = process.env.osusecret!;
            auth.login(osuid, secret, scope).then((result) => {

                expires_in = result.expires_in;
                expireTime = timeInSeconds + result.expires_in;

                console.log("refreshed token");
                return resolve(true);           
            });
        } else {

            return resolve(true);

        }
    })
}