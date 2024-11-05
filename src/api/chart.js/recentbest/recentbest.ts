import { ChartJSNodeCanvas } from "chartjs-node-canvas";

export function generateRecentBestChart(top100: any) {
    const dataset: any = [];

    for (const top of top100.slice().reverse()) {

        dataset.push({ x: top.value.ended_at, y: top.value.pp.toString() });
    }

    // Generate the chart
    const width = 600; //px
    const height = 250; //px
    const backgroundColour = "#2f3136";
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
        width, height, backgroundColour, plugins: {
            globalVariableLegacy: ['chartjs-adapter-moment']
        }
    });
    const configuration: any = {
        type: 'line',
        data: {
            datasets: [
                {
                    backgroundColor: '#4b67ba',
                    borderColor: '#4b67ba',
                    data: dataset,
                    pointRadius: 1.5,
                    showLine: false
                },
            ],
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                },
                y:
                {
                    title: {
                        display: true,
                        text: 'PP',
                        fontColor: '#b4afb1',
                        fontSize: 12,
                    },
                },
            },
            plugins: {
                legend: {
                    display: false,
                },
            },
        },
    };
    const chartPromise = chartJSNodeCanvas.renderToDataURL(configuration);

    return chartPromise;

}