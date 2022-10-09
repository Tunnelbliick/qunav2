import { getTournament } from "./src/api/owc/owc"

export function loadTournaments() {

    // PLACE Challonge URL HERE

    let tournaments = [
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

        "CWC22",
        "CWC_2021",
        "CWC_2020",
        
        "TWC_2021",
        "TWC_2022",

        "MWC4K_2022",
        "MWC4K_2021",
        "MWC4K2020",
        "MWC4K2019",

        "MWC7K_2022",
    ]

    tournaments.forEach((t: any) => {
        getTournament(t);
    })
}