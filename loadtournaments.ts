import { getTournament } from "./src/api/owc/owc"

export function loadTournaments() {

    // PLACE Challonge URL HERE

    let tournaments = [
        // Osu
        "owc_2010", //2010
        "owc_2011", //2011
        "owc_2012", //2012
        "owc_2013", //2013
        "owc_2014", //2014
        "new_owc_2015", //2015
        "owc_2016", //2016
        "owc_2017", //2017
        "owc_2018", //2018
        "OWC_2019",
        "OWC_2020",
        "OWC_2021",

        // Catch
        "cwc_2012",
        "new_cwc_2013",
        "cwc_2014",
        "cwc_2015",
        "cwc_2016",
        "cwc_2017",
        "cwc_2018",
        "cwc_2019",
        "CWC_2020",
        "CWC_2021",
        "CWC22",
        
        // Taiko
        "twc_2011", //2011
        "twc_2012", //2012
        "twc_2014", //2014
        "twc_2015", //2015
        "twc_2016", //2016
        "twc_2017", //2017
        "twc_2018", //2018
        "twc_2019", //2019
        "twc_2020", //2020
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