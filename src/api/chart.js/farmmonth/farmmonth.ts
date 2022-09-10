const { Canvas, loadImage } = require('skia-canvas');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

export async function generateFarmmonthChart(hours: any) {

    // Generate the chart
    const width = 600; //px
    const height = 250; //px
    const backgroundColour = "#2f3136";
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
        width, height, backgroundColour
    });
    const configuration = {
        type: 'bar',
        data: {
            labels: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec'
            ],
            datasets: [
                {
                    label: '# of plays set',
                    backgroundColor: '#335879',
                    borderSkipped: 'bottom',
                    data: hours,
                },
            ],
        },
        options: {
            plugins: {
                legend: {
                    display: false,
                },
            },
            layout: {
                padding: {
                    right: 10
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Month of year',
                        fontColor: '#4b67ba',
                        fontSize: 12,
                    },
                },
                y:
                {
                    title: {
                        display: true,
                        text: '# of plays set',
                        fontColor: '#4b67ba',
                        fontSize: 12,
                    },
                },
            },
        },
    };
    return await chartJSNodeCanvas.renderToDataURL(configuration);
}