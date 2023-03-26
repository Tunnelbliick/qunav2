import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { skill_type } from "../../skills/skills";

export interface doughnut_colors {
    [index: string]: Array<string>
}

export interface doughnut_data {
    labels: Array<string>
    data: Array<object>
}

export const doughnut_colors: doughnut_colors = {
    "Aim": ["#f86f64", "#fd5392"],
    "Speed": ["#00f2fe", "#4facfe"],
    "Acc": ["#38f8d4", "#43ea80"],
    "Strain": ["#FFD6E7", "#FF8FD5"]
}

export async function builddoughnut(skills: skill_type[]) {

    const doughnut_data = buildDataset(skills);


    // Generate the chart
    const width = 1000; //px
    const height = 750; //px
    const backgroundColour = "transparent";
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
        width, height, backgroundColour, plugins: {
            modern: ["chartjs-plugin-datalabels"]
        }
    });

    chartJSNodeCanvas.registerFont('assets/fonts/Ikea-Regular.ttf', { family: 'Ikea' });

    const configuration: any = {
        type: 'doughnut',
        data: {
            labels: doughnut_data.labels,
            datasets: [
                {
                    data: doughnut_data.data,
                    borderWidth: 20,
                    borderColor: "#303135",
                    label: 'Skills',
                    backgroundColor: (ctx: any) => buildGradients(ctx)
                }
            ],
        },
        options: {
            maintainAspectRatio: false,
            responsive: false,
            cutout: "40%",
            radius: "65%",
            plugins: {
                legend: {
                    display: false,
                },
                datalabels: {
                    align: 'end',
                    anchor: 'end',
                    backgroundColor: '#27282b',
                    borderColor: '#27282b',
                    borderWidth: 10,
                    borderRadius: 5,
                    offset: 10,
                    font: {
                        family: 'Ikea Sans',
                        size: 50
                    },
                    labels: {
                        title: {
                            color: "white"
                        }
                    }
                }
            },
        },
    };

    return chartJSNodeCanvas.renderToDataURL(configuration);

}

function buildDataset(skills: skill_type[]): doughnut_data {

    const labels: string[] = [];
    const data: object[] = [];

    skills.forEach(skill => {

        if (skill.average !== 0 && skill.label !== "Star") {
            labels.push(skill.label);
            data.push(
                {
                    label: `${skill.label}: ${skill.average.toFixed(0)}`,
                    value: skill.average
                });
        }

    })

    return {
        labels: labels,
        data: data,
    }

}

function buildGradients(ctx: any) {
    if (!ctx.chart || !ctx.chart.ctx || !ctx.chart.chartArea) {
        return;
    }
    const chartArea = ctx.chart.chartArea;

    const labels: string[] = ctx.chart.data.labels;
    const current_label = ctx.raw.label.split(":")[0];
    let bottom = chartArea.bottom;
    let top = 0;

    if (labels.length === 3) {
        const index = labels.findIndex(label => label === current_label);

        if (index === 1) {

            bottom = bottom / 100 * 65;
            top = (bottom / 3 * 2) / 100 * 65;

        } else {

            bottom = (bottom / 3 * 2) / 100 * 65;
            top = 0;

        }

    } else {
        bottom = chartArea.bottom / 100 * 65;
    }

    const colors = doughnut_colors[ctx.raw.label.split(":")[0]];

    if (colors) {
        const gradient = ctx.chart.ctx.createLinearGradient(0, top, 0, bottom);
        const stops = 1 / (colors.length - 1);
        colors.forEach((color: any, index: any) => {
            gradient.addColorStop(stops * index, color);
        });
        return gradient;
    } else {
        return "transparent";
    }
}
