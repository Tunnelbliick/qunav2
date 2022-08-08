export function buildUsernameOfArgs(input: Array<string>) {

    let username = "";
    let first = true;

    input.forEach((arg) => {
        if("-ts" === arg) {
            return;
        }
        if (first) {
            username += arg;
            first = false
        } else
            username += ` ${arg}`
    });

    return username;

}