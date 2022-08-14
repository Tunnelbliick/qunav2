const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

export async function categoriechart(recommendation: any) {

    let pielabel = [];
    let pieValue = [];
    let pieColors = [];

    for (let type of recommendation.type) {
        pielabel.push(type.category);
        var randomColor = Math.floor(Math.random()*16777215).toString(16);
        pieColors.push(`#${randomColor}`);
        pieValue.push(
            type.upvote.length);
    }

    const width = 200; //px
    const height = 150; //px
    const backgroundColour = "#2f3136";
    const typesChart = new ChartJSNodeCanvas({ width, height, backgroundColour });
    const type_configuration = {
        type: 'pie',
        data: {
            labels: pielabel,
            datasets: [
                {
                    backgroundColor: pieColors,
                    data: pieValue,
                    borderWidth: 0,
                },
            ],
        },
        options: {
            plugins: {
                legend: {
                    display: true,
                },
            },
        },
    };

    let types_promise = await typesChart.renderToDataURL(type_configuration);
    return types_promise;
}