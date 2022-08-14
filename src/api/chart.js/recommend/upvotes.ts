const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

export async function updownvote(recommendation: any) {

    let upvotes = recommendation.upvote.length;
    let downvotes = recommendation.downvote.length;

    let minmax = Math.max(upvotes, downvotes);

    let minval = -Math.abs(minmax);
    let maxval = minmax;

    // Generate the chart
    const width = 50; //px
    const height = 150; //px
    const backgroundColour = "#2f3136";
    const upvoteDownvoteChart = new ChartJSNodeCanvas({ width, height, backgroundColour });
    const upvoteDownvoteChart_configuration = {
        type: 'bar',
        data: {
            labels: ["upvote", "downvote"],
            datasets: [
                {
                    label: "Upvote",
                    backgroundColor: '#3ba55d',
                    data: [upvotes],
                },
                {
                    label: "Downvote",
                    backgroundColor: '#ed4245',
                    data: [-Math.abs(downvotes)],
                }
            ],
        },
        options: {
            scales: {
                x: {
                    display: false,
                    stacked: true,
                },
                y: {
                    display: false,
                    max: maxval,
                    min: minval,
                    stacked: true,
                },
            },
            plugins: {
                legend: {
                    position: "right",
                    display: false,
                },
            },
        },
    };

    let upvotedownvote_promise = await upvoteDownvoteChart.renderToDataURL(upvoteDownvoteChart_configuration);
    return upvotedownvote_promise;
}