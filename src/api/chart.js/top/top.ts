import { ChartJSNodeCanvas } from "chartjs-node-canvas";

export function generateTopChart(top100: any) {
    let max = 20;

    const labels: any = [];
    const dataset: any = [];
    max = Math.ceil(top100.length / 5);

    for (const top of top100.slice().reverse()) {

        labels.push((top.position + 1).toString());
        dataset.push(top.value.pp.toString());
    }

    // Generate the chart
    const width = 600; //px
    const height = 250; //px
    const backgroundColour = "#2f3136";
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });
    const configuration: any = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    backgroundColor: '#4b67ba',
                    borderColor: '#4b67ba',
                    data: dataset,
                    pointRadius: 0
                },
            ],
        },
        options: {
            layout: {
                padding: {
                    right: 10
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '# Index',
                        fontColor: '#b4afb1',
                        fontSize: 12,
                    },
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