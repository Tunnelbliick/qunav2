import { OsuUser } from "../../interfaces/osu/user/osuUser";

const { Canvas, loadImage } = require('skia-canvas');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

export async function generateProfileChart(data: OsuUser) {

    let background = undefined;

    if (data.cover_url !== undefined && data.cover_url !== "")
        background = await loadImage(data.cover_url);

    const dataset: number[] = [];
    const label: number[] = [];

    if (data.rankHistory != null && data.rankHistory.data != null)
        data.rankHistory.data.forEach((data: number, index: number) => {
            dataset.push(data);
            label.push(index);
        });

    const width = 1200;
    const height = 360;
    const backgroundColour = "transparent";
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });
    const configuration = {
        type: 'line',
        data: {
            labels: label,
            datasets: [
                {
                    backgroundColor: '#4b67ba',
                    borderColor: '#4b67ba',
                    data: dataset,
                    pointRadius: 0,
                    borderWidth: 18,
                    tension: 0.1,
                },
            ],
        },
        options: {
            layout: {
                padding: 50
            },
            scales: {
                x: {
                    display: false,
                },
                y:
                {
                    reverse: true,
                    display: false,
                    ticks: {
                        font: {
                            size: 30,
                        }
                    }
                },
            },
            plugins: {
                legend: {
                    display: false,
                },
            },
        },
    };

    const chartURL = await chartJSNodeCanvas.renderToDataURL(configuration);
    const chart = await loadImage(chartURL);

    const canvas = new Canvas(width, height)
    const ctx = canvas.getContext('2d')

    if (background) {
        ctx.filter = 'blur(10px) brightness(33%)';
        ctx.drawImage(background, 0, 0, width, height);
        ctx.filter = 'none';
    }
    ctx.drawImage(chart, 0, 0, width, height);

    return canvas.toBuffer();
}