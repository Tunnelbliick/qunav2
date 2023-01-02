const { auth } = require("osu-api-extended")

export async function login() {
    return new Promise((resolve, reject) => {
        auth.login(process.env.osuid, process.env.osusecret).then((result: any) => {
            return resolve(true)
        });
    })
}