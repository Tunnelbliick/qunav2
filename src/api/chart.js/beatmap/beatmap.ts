const { Canvas, loadImage } = require('skia-canvas');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

let color: any = {
    "aim": "#32a869",
    "speed": "#a83e32",
    "flashlight": "#5d32a8",
    "movement": "#3269a8",
    "strains": "#32a879",
    "color": "#a87b32",
    "rhythm": "#9332a8",
    "stamina": "#3244a8",
}

const max = 200;

export async function generateBeatmapChart(graph: any) {

    const datasets = [];
    let stepSize = 0;

    for (var key in graph) {

        let value: any = graph[key];

        if (isNaN(value)) {
            
            let key_string = key.toString();
            stepSize = value[value.length - 1].x / 5;
            

            let label = key_string.charAt(0).toUpperCase() + key_string.substring(1);

            let dataset = {
                backgroundColor: color[key],
                borderColor: color[key],
                data: value,
                tension: .25,
                pointRadius: 0,
                showLine: true,
                label: label
            }

            datasets.push(dataset)
        }

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
            datasets: datasets,
        },
        options: {

            animation: false,
            parsing: false,

            layout: {
                padding: 20
            },
            scales: {
                x: {
                    display: true,
                    type: 'time',
                    maxRotation: 0,
                    ticks: {
                        color: 'white',
                    },
                    grid: {
                        color: 'white',
                        borderColor: 'white',
                    },
                    time: {
                        unit: 'millisecond',
                        stepSize: stepSize,
                        minUnit: 'second',
                        displayFormats: {
                            millisecond: 'mm:ss',
                            second: 'mm:ss',
                            minute: 'hh:mm:ss',
                            hour: 'hh:mm:ss'
                        }
                    }
                },
                y: {
                    display: false
                },
            },
            plugins: {
                legend: {
                    title: {
                        color: "white"
                    },
                    display: true,
                },
            },
        },
    };


    const chartURL = await chartJSNodeCanvas.renderToDataURL(configuration);
    return chartURL;
}