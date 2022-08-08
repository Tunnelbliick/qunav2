import { ChartJSNodeCanvas } from "chartjs-node-canvas";

export async function buildProgressbar(blocks: any, colors: any) {

    // Generate the chart
    const width = 308; //px
    const height = 42; //px
    const backgroundColour = "transparent";
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
        width, height, backgroundColour
    });
    const configuration: any = {
        type: 'bar',
        data: {
            labels: ['Red', 'Orange'],
            datasets: [
                {
                    data: [blocks[0].value],
                    borderWidth: 0,
                    label: 'Dataset 1',
                    backgroundColor: (ctx: any) => {
                        if (!ctx.chart || !ctx.chart.ctx || !ctx.chart.chartArea) {
                            return;
                        }
                        const chartArea = ctx.chart.chartArea;
                        const gradient = ctx.chart.ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
                        let gradient_stops = 1 / (colors.length - 1);
                        colors.forEach((color: any, index: any) => {
                            gradient.addColorStop(gradient_stops * index, color);
                        });
                        return [gradient];
                    },
                },
                {
                    data: [blocks[0].miss],
                    borderWidth: 0,
                    label: 'Dataset 2',
                    backgroundColor: "#3b3b3b"
                }, {
                    data: [4],
                    borderWidth: 0,
                    label: 'Dataset 3',
                    backgroundColor: "#1f1f1f"
                }, {
                    data: [blocks[1].value],
                    borderWidth: 0,
                    label: 'Dataset 4',
                    backgroundColor: (ctx: any) => {
                        if (!ctx.chart || !ctx.chart.ctx || !ctx.chart.chartArea) {
                            return;
                        }
                        const chartArea = ctx.chart.chartArea;
                        const gradient = ctx.chart.ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
                        let gradient_stops = 1 / (colors.length - 1);
                        colors.forEach((color: any, index: any) => {
                            gradient.addColorStop(gradient_stops * index, color);
                        });
                        return [gradient];
                    },
                },
                {
                    data: [blocks[1].miss],
                    borderWidth: 0,
                    label: 'Dataset 5',
                    backgroundColor: "#3b3b3b"
                },
                {
                    data: [4],
                    borderWidth: 0,
                    label: 'Dataset 6',
                    backgroundColor: "#1f1f1f"
                },
                {
                    data: [blocks[2].value],
                    borderWidth: 0,
                    label: 'Dataset 7',
                    backgroundColor: (ctx: any) => {
                        if (!ctx.chart || !ctx.chart.ctx || !ctx.chart.chartArea) {
                            return;
                        }
                        const chartArea = ctx.chart.chartArea;
                        const gradient = ctx.chart.ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
                        let gradient_stops = 1 / (colors.length - 1);
                        colors.forEach((color: any, index: any) => {
                            gradient.addColorStop(gradient_stops * index, color);
                        });
                        return [gradient];
                    },
                },
                {
                    data: [blocks[2].miss],
                    borderWidth: 0,
                    label: 'Dataset 8',
                    backgroundColor: "#3b3b3b"
                }
            ],
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            scales: {
                y: {
                    display: false,
                    stacked: true,
                    max: 308 // maximum value
                },
                x: {
                    display: false,
                    stacked: true,
                    max: 308 // maximum value
                }
            },
            plugins: {
                legend: {
                    display: false,
                },
            },
        },
    };

    return chartJSNodeCanvas.renderToDataURL(configuration);

}