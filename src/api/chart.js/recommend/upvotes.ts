const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

export async function updownvote(recommendation: any) {

    const upvotes = recommendation.upvote.length;
    const downvotes = recommendation.downvote.length;

    const minmax = Math.max(upvotes, downvotes);

    const minval = -Math.abs(minmax);
    const maxval = minmax;

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

    const upvotedownvote_promise = await upvoteDownvoteChart.renderToDataURL(upvoteDownvoteChart_configuration);
    return upvotedownvote_promise;
}