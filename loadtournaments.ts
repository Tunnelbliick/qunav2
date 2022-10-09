import { getTournament } from "./src/api/owc/owc"

export function loadTournaments() {

    // PLACE Challonge URL HERE

    let tournaments = [
        // Osu
        "nvzkhfet", //2010
        "mlo93x9p", //2011
        "fy6t2zls", //2012
        "rpdt2g31", //2013
        "cugtkq2t", //2014
        "8sadv07p", //2015
        "bvzz9vtb", //2016
        "s2ea4lu2", //2017
        "g7c7s1bk", //2018
        "OWC_2019",
        "OWC_2020",
        "OWC_2021",

        // Catch
        "CWC22",
        "CWC_2021",
        "CWC_2020",
        
        // Taiko
        "70fia0ay", //2011
        "3z72qd6b", //2014
        "1046sy06", //2015
        "u2mgerh7", //2016
        "amuq4rf9", //2017
        "yvcc4t59", //2018
        "1aq1oys9", //2019
        "12w8cdw6", //2020
        "TWC_2021",
        "TWC_2022",

        // Mania 4K
        "MWC4K_2022",
        "MWC4K_2021",
        "MWC4K2020",
        "MWC4K2019",

        // Mania 7k
        "MWC7K_2022",
    ]

    tournaments.forEach((t: any) => {
        getTournament(t);
    })
}