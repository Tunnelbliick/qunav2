import moment from "moment";
import { buildOwcEmbed } from "../../embeds/osu/owc/owc";
import owc from "../../models/owc";
import owcgame from "../../models/owcgame"
import owcteam from "../../models/owcteam";
import { viewTournament } from "../challonge/tournament";
import { buildfilter, owc_filter } from "./filter";

export interface country {
    team: any,
    matches: any,
}

export interface year {
    owc: any,
    team: any,
    matches: any,
}

export interface owc_year {
    year: year,
    country?: country,
}

export async function getInfo(message: any, interaction: any, args: any) {

    let filter: owc_filter = buildfilter(interaction, args)!;
    let country: any = undefined;

    let year = await getYear(filter.year);

    if(filter.country != null)
    country = getCountry(year.owc.id, filter.country);

    let resp: owc_year = {
        year: year,
        country: country,
    }

    buildOwcEmbed(message, interaction, resp);

}

async function getYear(year: string) {

    let owc_year: any = await owc.findOne({year: year});
    let teams: any = await owcteam.find({owc: owc_year.id});
    let matches: any = await owcgame.find({owc: owc_year.id});

    let sorted_teams = teams.sort((a: any, b: any) => { return a.place - b.place }).slice(0,5);

    let resp: year = {
        owc: owc_year,
        team: sorted_teams,
        matches: matches,
    }

    return resp;

}

async function getCountry(owc_year: any, country: string) {

    let team = await owcteam.findOne({owc:owc_year,name:country});
    let matches = await getCountryMatches(owc_year, country);

    let resp: country = {
        team: team,
        matches: matches
    }

    return resp;
    
}

export async function getCountryMatches(owc_year: any, team: any) {

    let matches: any = await owcgame.find({
        owc: owc_year,
        $or: [
            {
                team1_name: team
            },
            {
                team2_name: team
            }
        ]
    })

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