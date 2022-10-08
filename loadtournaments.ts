import { getTournament } from "./src/api/owc/owc"

export function loadTournaments() {

    // PLACE Challonge URL HERE

    let tournaments = [
        "OWC_2019",
        "OWC_2020",
        "OWC_2021",

        "CWC22",
        "CWC_2021",
        "CWC_2020",
        
        "TWC_2021",
        "TWC_2022",

        "MWC4K_2021",
        "MWC4K2020",
        "MWC4K2019",

        "MWC7K_2022",
    ]

    tournaments.forEach((t: any) => {
        getTournament(t);
    })
}