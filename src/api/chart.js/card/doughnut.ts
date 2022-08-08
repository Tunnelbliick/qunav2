import { ChartJSNodeCanvas } from "chartjs-node-canvas";

export async function builddoughnut(value1: any, value2: any, color1: any, color2: any) {

    // Generate the chart
    const width = 500; //px
    const height = 500; //px
    const backgroundColour = "transparent";
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
        width, height, backgroundColour
    });
    const configuration: any = {
        type: 'doughnut',
        data: {
            labels: ['Red', 'Orange'],
            datasets: [
                {
                    data: [value1, value2],
                    borderWidth: 0,
                    label: 'Dataset 1',
                    backgroundColor: (ctx: any) => {
                        if (!ctx.chart || !ctx.chart.ctx || !ctx.chart.chartArea) {
                            return;
                        }
                        const chartArea = ctx.chart.chartArea;
                        const gradient = ctx.chart.ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                        gradient.addColorStop(0, color1);
                        gradient.addColorStop(1, color2);
                        return [gradient, 'transparent'];
                    },
                },
            ],
        },
        options: {
            cutout: 110,
            plugins: {
                legend: {
                    display: false,
                },
            },
        },
    };

    return chartJSNodeCanvas.renderToDataURL(configuration);

}
