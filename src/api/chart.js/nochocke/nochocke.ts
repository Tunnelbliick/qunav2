import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { unchocke } from "../../commands/osu/nochocke/nochocke";

export function generateNoChockeChart(top100: any, unchock: unchocke[]) {
    let max = 20;

    const labels: any = [];
    const dataset: any = [];
    const dataset2: any = [];
    max = Math.ceil(top100.length / 5);

    for (const top of top100.slice().reverse()) {

        labels.push((top.position + 1).toString());
        dataset.push(top.value.pp.toString());
    }

    for (const unchocked of unchock.slice().reverse()) {
        dataset2.push(unchocked.pp.toString());
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
                    label: "Top 100",
                    backgroundColor: '#4b67ba',
                    borderColor: '#4b67ba',
                    data: dataset,
                    pointRadius: 0,

                },
                {
                    label: "Fixed Top 100",
                    backgroundColor: '#ba4b5e',
                    borderColor: '#ba4b5e',
                    data: dataset2,
                    pointRadius: 0,

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
                    display: true,
                },
            },
        },
    };

    const chartPromise = chartJSNodeCanvas.renderToDataURL(configuration);

    return chartPromise;
}