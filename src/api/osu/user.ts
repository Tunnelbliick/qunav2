import { login } from "./login";

import { v2 } from "osu-api-extended";

export async function getUser(userid: any, mode?: any) {
    await login();

    if (mode == undefined) {
        mode = "osu"
    }
    
    return new Promise((resolve, reject) => {
        const user = v2.user.details(userid, mode, "id")

        user.then((data: any) => {
            return resolve(data);
        });

        user.catch((err: any) => {
            return reject(err);
        });
    });
}

export async function getUserByUsername(username: string, mode?: any) {
    await login();
    if (mode == undefined) {
        mode = "osu"
    }
    return new Promise((resolve, reject) => {
        const user = v2.user.details(username, mode, "username")

        user.then((data: any) => {
            return resolve(data);
        });

        user.catch((err: any) => {
            return reject(err);
        });
    });
}