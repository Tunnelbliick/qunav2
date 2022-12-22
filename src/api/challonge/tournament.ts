import axios from 'axios';

export async function viewTournament(tournamentid: String, type: "json" | "xml") {

    return axios.get<any>(`https://api.challonge.com/v1/tournaments/${tournamentid}.${type}?api_key=${process.env.challonge}&include_participants=1&include_matches=1`).then(res => {
        return res.data;
    }).catch((e: any) => {
        console.log(e)
    });

}