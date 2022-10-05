import moment from "moment";
import owc from "../../models/owc";
import owcgame from "../../models/owcgame"
import owcteam from "../../models/owcteam";
import { viewTournament } from "../challonge/tournament";
import { buildfilter, owc_filter } from "./filter";

let seeding: any = {
    1: { country: "US", name: "United States" },
    2: { country: "CA", name: "Canada" },
    3: { country: "GER", name: "Germany" },
    4: { country: "CHL", name: "Chile" },
    5: { country: "IND", name: "Indonesia" },
    6: { country: "PL", name: "Poland" },
    7: { country: "JP", name: "Japan" },
    8: { country: "UK", name: "United Kingdom" },
    9: { country: "SK", name: "South Korea" },
    10: { country: "FR", name: "France" },
    11: { country: "SWE", name: "Sweden" },
    12: { country: "HK", name: "Hong Kong" },
    13: { country: "RU", name: "Russia" },
    14: { country: "AU", name: "Australia" },
    15: { country: "ROU", name: "Romania" },
    16: { country: "BR", name: "Brazil" },
    17: { country: "PH", name: "Philippines" },
    18: { country: "TAI", name: "Taiwan" },
    19: { country: "NOR", name: "Norway" },
    20: { country: "CH", name: "China" },
    21: { country: "TRK", name: "Turkey" },
    22: { country: "NL", name: "Netherlands" },
    23: { country: "FIN", name: "Finnland" },
    24: { country: "URK", name: "Ukraine" },
    25: { country: "SIN", name: "Singapore" },
    26: { country: "MAL", name: "Malaysia" },
    27: { country: "CZ", name: "Czech Republic" },
    28: { country: "MX", name: "Mexico" },
    29: { country: "ARG", name: "Argentina" },
    30: { country: "OER", name: "Austria" },
    31: { country: "SPA", name: "Spain" },
    32: { counntry: "URU", name: "Uruguay" }
}

export async function getInfo(message: any, interaction: any, args: any) {

    let filter: owc_filter = buildfilter(interaction, args)!;

    let year = getYear(filter.year);

}

async function getYear(year: string) {

    let owc_year: any = await owc.findOne({year: year});
    let teams: any = await owcteam.find({owc: owc_year.id});
    let matches: any = await owcgame.find({owc: owc_year.id});

    let sorted_teams = teams.sort((a: any, b: any) => { return a.place - b.place }).slice(0,5);

    sorted_teams.forEach((team: any) => {
        console.log(`${team.place}. ${team.name} Seed: ${team.seed}`);
    })

}

async function getCountry(owc_year: any, country: string) {
    
}

export async function getTeamMatches(team: any) {

    let matches: any = await owcgame.find({
        $or: [
            {
                team1_name: team
            },
            {
                team2_name: team
            }
        ]
    })

    console.log(matches);

    matches.forEach((match: any) => {
        console.log(`${match.team1_name} ${match.score} ${match.team2_name}`);
    })

}

export async function getTournament(tournamentid: string) {
   await createOrUpdateTournaments(tournamentid);
}

async function createOrUpdateMatches(owcid: any, matches: any) {

    for (let match of matches) {
        match = match.match;

        let winner: any = null;
        let looser: any = null;
        let winner_index = 1;

        let team1: any = await owcteam.findOne({ challonge_id: match.player1_id });
        let team2: any = await owcteam.findOne({ challonge_id: match.player2_id });

        if (team1?.challonge_id === match.winner_id) {
            winner = team1;
            winner_index = 1;
            looser = team2;
        } else {
            winner = team2;
            winner_index = 2;
            looser = team1;
        }

        let iswinner = true;
        let islooser = true;

        if (match.round > 0) {
            islooser = false;
        } else {
            iswinner = false;
        }

        let team1_score = match.scores_csv.split("-")[0];
        let team2_score = match.scores_csv.split("-")[1];

        let owc_game: any = await owcgame.findOne({ matchid: match.id });

        if (owc_game === null) {
            owc_game = new owcgame();
        }
        owc_game.matchid = match.id;
        owc_game.state = match.state;
        owc_game.owc = owcid;
        owc_game.score = match.scores_csv;
        owc_game.date = match.completed_at;
        owc_game.round = match.round;
        owc_game.isLooser = islooser;
        owc_game.isWinner = iswinner;
        if(team1 != null) {
        owc_game.team1 = team1.id;
        owc_game.team1_score = team1_score;
        owc_game.team1_name = team1.name;
        }
        if(team2 != null) {
        owc_game.team2 = team2.id;
        owc_game.team2_name = team2.name;
        owc_game.team2_score = team2_score;
        }
        if(winner != null) {
        owc_game.winner = winner.id;
        owc_game.winner_name = winner.name;
        }
        if(looser != null) {
        owc_game.looser = looser.id;
        owc_game.looser_name = looser.name;
        }
        owc_game.winner_index = winner_index;
        owc_game.data = match;

        await owc_game.save();
    }

}

async function createOrUpdateParticipants(owcid: any, participants: any) {

    for (let team of participants) {
        team = team.participant;

        let owc_team: any = await owcteam.findOne({ challonge_id: team.id });

        if (owc_team === null) {
            owc_team = new owcteam();
        }
        owc_team.owc = owcid;
        owc_team.challonge_id = team.id;
        owc_team.name = team.name;
        owc_team.seed = team.seed;
        owc_team.data = team;
        owc_team.place = team.final_rank;

        await owc_team.save();
    }
}

async function createOrUpdateTournaments(tournament_string: any) {

    let res: any = await viewTournament(tournament_string, "json");

    let tournament = res.tournament;

    let gen_owc: any = await owc.findOne({ tournamentid: tournament.id });

    if (gen_owc === null) {
        gen_owc = new owc();
    }
    let year = moment(tournament.started_at).format("YYYY")
    gen_owc.year = year;
    gen_owc.tournamentid = tournament.id;
    gen_owc.url = tournament.url;
    gen_owc.live_image_url = tournament.live_image_url;
    gen_owc.full_challonge_url = tournament.full_challonge_url;

    gen_owc = await gen_owc.save();

    await createOrUpdateParticipants(gen_owc.id, tournament.participants);
    await createOrUpdateMatches(gen_owc.id, tournament.matches);

}