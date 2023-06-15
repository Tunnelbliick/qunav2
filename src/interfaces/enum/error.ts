export enum returnErrors {
    NOTLINKED = "NOTLINKED", // discord user isnt linked to quna
    NOTFOUNDID = "NOTFOUNDID", // no user with this id was found
    NOTFOUNDUSERNAME = "NOTFOUNDUSERNAME", // no user with this username was found
    NOSERVER = "NOSERVER", // API did not respond
    NORECENTPLAYS = "NORECENTPLAYS" // user doesnt have recent plays
}