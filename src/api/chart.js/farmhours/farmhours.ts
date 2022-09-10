const { Canvas, loadImage } = require('skia-canvas');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

export async function generateFarmhoursChart(hours: any) {

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
                '0',
                '1',
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                '8',
                '9',
                '10',
                '11',
                '12',
                '13',
                '14',
                '15',
                '16',
                '17',
                '18',
                '19',
                '20',
                '21',
                '22',
                '23',
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
                        text: 'Hour of day',
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