import { queryError } from "../../../embeds/osu/recommend/recommend/error";
import LastRec from "../../../models/LastRec";
import { LastRecObject } from "../../../models/LastRecObject";
import Recommendation from "../../../models/Recommendation";
import RecommndationList from "../../../models/RecommndationList";
import { buildSearch } from "../../utility/buildsearch";
import { filterRecommends, suggestion_filter } from "../showsuggestions/filter";

const { ObjectId } = require('mongodb');

export async function buildRecommendsBasedOnPriorLikes(userid: any) {

    const ONE_HOUR = 60 * 60 * 1000; /* ms */
    let recommendations: any;

    const userlikes = await Recommendation.find({ upvote: parseInt(userid) });
    const recentrecommends: any = await LastRec.findOne({ userid: userid });
    const taglist = [];
    const difficulty: any = [];
    const disallowedids: any = [];
    for (const likes of userlikes) {
        difficulty.push(likes.star);
        for (const type of likes.type) {
            taglist.push(type.type);
        }
    }

    const timenow: any = new Date();

    const removedtimeout: any = [];

    if (recentrecommends != undefined) {
        for (const recentreco of recentrecommends.mongoids) {

            if ((timenow - recentreco.date) < ONE_HOUR) {
                disallowedids.push(ObjectId(recentreco.mongoid));

                const lastrecobj: LastRecObject = new LastRecObject();
                lastrecobj.mongoid = recentreco.mongoid;
                lastrecobj.date = recentreco.date;

                removedtimeout.push(lastrecobj);
            }
        }
    }


    if (disallowedids.length != 0)
        recommendations = await Recommendation.find({ upvote: { $nin: [parseInt(userid)] }, downvote: { $nin: [parseInt(userid)] }, "type.type": { $in: taglist }, _id: { $nin: disallowedids } });
    else
        recommendations = await Recommendation.find({ upvote: { $nin: [parseInt(userid)] }, downvote: { $nin: [parseInt(userid)] }, "type.type": { $in: taglist } });

    if (recommendations == undefined || recommendations.length == 0) {
        const min = Math.min(...difficulty);
        const max = Math.max(...difficulty);

        if (disallowedids.length != 0)
            recommendations = await Recommendation.find({ upvote: { $nin: [parseInt(userid)] }, downvote: { $nin: [parseInt(userid)] }, star: { $gte: min, $lte: max }, _id: { $nin: disallowedids } });
        else
            recommendations = await Recommendation.find({ upvote: { $nin: [parseInt(userid)] }, downvote: { $nin: [parseInt(userid)] }, star: { $gte: min, $lte: max } });

    } else {

        // Save last 10 Recommendations to prevent re-recommending the same map in the next 10 recommendations
        if (recentrecommends == undefined || recentrecommends.length == 0) {

            const lastrec = new LastRec();
            lastrec.userid = userid;

            const lastrecarr: any = [];

            const lastrecobj: LastRecObject = new LastRecObject();
            lastrecobj.mongoid = recommendations.id;
            lastrecobj.date = new Date();

            lastrecarr.push(lastrecobj);

            lastrec.mongoids = lastrecarr;

            await lastrec.save();

            // 
        } else {

            const lastrecobj: LastRecObject = new LastRecObject();
            lastrecobj.mongoid = recommendations.id;
            lastrecobj.date = new Date();

            if (removedtimeout.length == 10)
                removedtimeout.shift();

            removedtimeout.push(lastrecobj);

            recentrecommends.mongoids = removedtimeout;

            await recentrecommends.save();
        }
    }

    return recommendations;
}

export async function buildRecommendByPrycon(recommendations: any) {

    recommendations = await Recommendation.find({ _id: recommendations })

    return recommendations;

}

export async function buildRecommendByQuery(message: any, args: any, ) {

    let recommendations: any;
    const option_filter: suggestion_filter = filterRecommends(args);

    let query: any = {};
    try {
        query = buildSearch(option_filter);
    } catch (error: any) {
        queryError(message, error);
        return;
    }

    recommendations = await Recommendation.find(query);

    return recommendations;

}

export async function buildRecList(recommendations: any, userid: any) {

    let recList: any;

    recList = await RecommndationList.findOne({ userid: userid });

    if (recList == undefined) {
        recList = new RecommndationList();
        const mongoids = [];

        for (const rec of recommendations) {
            mongoids.push(rec.id);
        }

        recList.mongoids = mongoids;
        recList.userid = userid;

        recList.save();
    } else {
        const mongoids = [];

        for (const rec of recommendations) {
            mongoids.push(rec.id);
            recList.mongoids = mongoids;
        }
        recList.save();
    }

    return recList;

}