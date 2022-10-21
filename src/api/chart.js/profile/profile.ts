const { Canvas, loadImage } = require('skia-canvas');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

export async function generateProfileChart(data:any) {
    const background = await loadImage(data.cover_url);

    const dataset: any = [];
    const label: any = [];

    if (data.rankHistory != null && data.rankHistory.data != null)
        data.rankHistory.data.forEach((data: any, index: any) => {
            dataset.push(data);
            label.push(index);
        });

    const width = background.width;
    const height = background.height;
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

    const canvas = new Canvas(background.width, background.height)
    const ctx = canvas.getContext('2d')

    ctx.filter = 'blur(10px) brightness(33%)';
    ctx.drawImage(background, 0, 0);
    ctx.filter = 'none';
    ctx.drawImage(chart, 0, 0);

    return canvas.toDataURLSync();
}