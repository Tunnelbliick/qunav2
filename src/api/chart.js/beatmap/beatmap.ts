const { Canvas, loadImage } = require('skia-canvas');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

export async function generateBeatmapChart(graph: any) {

    let labels = [];
    let dataset = [];

    let time = 0;
    for (let strains of graph.strains) {

        time += graph.section_length;

        labels.push(time);
        dataset.push(strains.toString());
    }

    const width = 900; //px
    const height = 250; //px
    const backgroundColour = "transparent";
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
        width, height, backgroundColour, plugins: {
            globalVariableLegacy: ['chartjs-adapter-moment']
        }
    });
    const configuration = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    backgroundColor: '#4b67ba',
                    borderColor: '#4b67ba',
                    data: dataset,
                    pointRadius: 0,
                    showLine: true
                },
            ],
        },
        options: {
            layout: {
                padding: 20
            },
            scales: {
                x: {
                    ticks: {
                        color: 'white',
                    },
                    grid: {
                        color: 'white',
                        borderColor: 'white',
                    },
                    display: true,
                    type: 'time',
                    time: {
                        unit: 'millisecond',
                        stepSize: 30000,
                        minUnit: 'second',
                        displayFormats: {
                            millisecond: 'mm:ss',
                            second: 'mm:ss',
                            minute: 'mm:ss',
                            hour: 'mm:ss'
                        }
                    }
                },
                y: {
                    display: false
                },
            },
            plugins: {
                legend: {
                    display: false,
                },
            },
        },
    };


    let chartURL = await chartJSNodeCanvas.renderToDataURL(configuration);
    return chartURL;
}