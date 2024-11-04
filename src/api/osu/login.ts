import { auth } from "osu-api-extended";

let expireTime: number;

const grace = 1000;

export async function login() {
    return new Promise((resolve, reject) => {
        const timeInSeconds = Math.floor(new Date().getTime() / 1000);

        if (expireTime == null || (expireTime - grace) < timeInSeconds) {
            const osuid: string = process.env.osuid || "";
            const secret: string = process.env.osusecret || "";

            // Ensure that `auth.login` returns a Promise and handle it
            const loginResult = auth.login({ 
                type: 'v2', 
                client_id: osuid, 
                client_secret: secret, 
                scopes: ["public"] 
            });

            if (loginResult instanceof Promise) {
                loginResult.then((result: any) => {
                    expireTime = timeInSeconds + result.expires_in;
                    console.log("refreshed token");
                    return resolve(true);
                }).catch((error: any) => {
                    console.error("Error during login:", error);
                    return reject(error);
                });
            } else {
                console.error("Unexpected login result:", loginResult);
                return reject(new Error("Unexpected login result type"));
            }
        } else {
            return resolve(true);
        }
    });
}
