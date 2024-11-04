import { login } from "./login";

import { v2 } from "osu-api-extended";
import { OsuUser } from "../../interfaces/OsuUser";
import { id } from "osu-api-extended/dist/utility/mods";

export async function getUser(userid: any, mode?: any) {
    await login();

    if (mode == undefined) {
        mode = "osu"
    }
    
    return new Promise((resolve, reject) => {
        const user = v2.user.details({myself: false, user: userid, mode: mode, key: "id"})

        user.then((data: any) => {
            return resolve(data);
        });

        user.catch((err: any) => {
            return reject(err);
        });
    });
}

export async function getUserByUsername(username: any, mode?: any): Promise<OsuUser> {
    await login();
    if (mode == undefined) {
        mode = "osu"
    }
    return new Promise((resolve, reject) => {
        const user = v2.user.details({myself: false, user: username, mode: mode, key: "username"})

        user.then((data: any) => {
            return resolve(data);
        });

        user.catch((err: any) => {
            return reject(err);
        });
    });
}