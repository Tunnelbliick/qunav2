const { Canvas, loadImage } = require('skia-canvas');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

export async function generateFarmweekChart(hours: any) {

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
                '24',
                '25',
                '26',
                '27',
                '28',
                '29',
                '30',
                '31',
                '32',
                '33',
                '34',
                '35',
                '36',
                '37',
                '38',
                '39',
                '40',
                '41',
                '42',
                '43',
                '44',
                '45',
                '46',
                '47',
                '48',
                '49',
                '50',
                '51',
                '52',
                '53'
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
                        text: 'Week of year',
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