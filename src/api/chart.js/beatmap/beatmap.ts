const { Canvas, loadImage } = require('skia-canvas');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

let color: any = {
    "aim": "#32a869",
    "speed": "#a83e32",
    "flashlight": "#5d32a8",
    "movement": "#3269a8",
    "strains": "#32a879",
    "color": "#a87b32",
    "rhythm" : "#9332a8",
    "stamina": "#3244a8",
}

export async function generateBeatmapChart(graph: any) {

    const labels: any[] = [];
    const datasets = [];

    let time = 0;
    let graph_count = 0;

    for (var key in graph) {

        let value: any = graph[key];

        if (isNaN(value)) {

            let data: any[] = []

            value.forEach((v: any) => {

                if (graph_count == 0) {
                    time += graph.section_length;
                    labels.push(time);
                }

                data.push(v.toString());
            })

            let key_string = key.toString();

            let label = key_string.charAt(0).toUpperCase() + key_string.substring(1);

            let dataset = {
                backgroundColor: color[key],
                borderColor: color[key],
                data: data,
                pointRadius: 0,
                showLine: true,
                label: label
            }

            datasets.push(dataset)

            graph_count++;
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
            labels: labels,
            datasets: datasets,
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
                    color: "white",
                    display: true,
                },
            },
        },
    };


    const chartURL = await chartJSNodeCanvas.renderToDataURL(configuration);
    return chartURL;
}