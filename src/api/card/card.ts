import Prando from 'prando'
import { roundedImage } from './roundimage';
import { builddoughnut } from '../chart.js/card/doughnut';
import { buildProgressbar } from '../chart.js/card/progress';
import { skills } from '../skills/skills';
const { createCanvas, loadImage, registerFont } = require('canvas')

const tiers = [
    { id: 0, value: 0, name: "Beginner", background: "t1bg.png", colors: ["#ffffff", "#ffffff"] },
    { id: 1, value: 30, name: "Beginner", background: "t2bg.png", colors: ["#d09292", "#c82270"] },
    { id: 2, value: 60, name: "Casual", background: "t3bg.png", colors: ["#facc22", "#ff544f"] },
    { id: 3, value: 90, name: "Casual", background: "t4bg.png", colors: ["#55cc7c", "#f5f97f"] },
    { id: 4, value: 120, name: "Expert", background: "t5bg.png", colors: ["#cd408f", "#094fc3"] },
    { id: 5, value: 150, name: "Expert", background: "t6bg.png", colors: ["#e1afcc", "#7530e3"] },
    { id: 6, value: 180, name: "Expert+", background: "t7bg.png", colors: ["#cd408f", "#094fc3"] },
    { id: 7, value: 210, name: "Pro", background: "pattern.jpg", colors: ["#b3b6eb", "#e98a98"] },
    { id: 8, value: 240, name: "Godlike", background: "pattern.jpg", colors: ["#6d7ff1", "#d66ef8"] },
    { id: 9, value: 270, name: "God", background: "pattern.jpg", colors: ["#ea6262", "#f1ad54", "#a8ee6f", "#6df1e9", "#6d7ff1", "#d66ef8"] },
    { id: 10, value: 300, name: "Master", background: "pattern.jpg", colors: ["#FFFFFF", "#000000"] },
    { id: 11, value: Infinity, name: "Inhuman", background: "pattern.jpg", colors: ["#00000"] }];

export async function generateCard(user: any, skills: skills) {

    registerFont('assets/fonts/IKEASans-Regular.ttf', { family: 'Sans' });

    const aim = skills.aim;
    const speed = skills.speed;
    const acc = skills.acc;

    let max = Math.max(aim, speed, acc);
    let total = aim + speed + acc;

    let currentTier: any;
    let nextTier: any;
    let foundtier = false;

    tiers.forEach((tier: any, index: any) => {
        if (!foundtier && tier.value > total) {
            nextTier = tier;
            currentTier = tiers[index - 1];
            foundtier = true;
        }
    });

    let missing = Math.round(total - currentTier.value) * 10;

    let blocks = [];

    for (let counter = 1; counter <= 3; counter++) {
        let reminder = missing - 100 * counter;
        if (reminder > 0)
            blocks.push({ value: 100, miss: 0 });
        else if (reminder < -100)
            blocks.push({ value: 0, miss: 100 });
        else
            blocks.push({ value: reminder + 100, miss: Math.abs(reminder) });

    }

    let imagePromises = [];

    imagePromises.push(builddoughnut(aim, max - aim, "#fd5392", "#f86f64"));
    imagePromises.push(builddoughnut(speed, max - speed, "#4facfe", "#00f2fe"));
    imagePromises.push(builddoughnut(acc, max - acc, "#43ea80", "#38f8d4"));
    imagePromises.push(buildProgressbar(blocks, currentTier.colors))

    let skills_perc = 100 / max;

    let aim_perc = aim * skills_perc;
    let speed_perc = speed * skills_perc;
    let acc_perc = acc * skills_perc;

    await Promise.allSettled(imagePromises);

    const canvas = createCanvas(650, 850)
    const ctx = canvas.getContext('2d')

    let overlaySrc = "assets/card/overlay.png"
    let userimgSrc = user.avatar_url;

    let accchartsrc = "";
    let speedchartsrc = "";
    let aimchartsrc = "";
    let progesschartsrc = "";

    await Promise.allSettled(imagePromises).then((result: any) => {

        aimchartsrc = result[0].value;
        speedchartsrc = result[1].value;
        accchartsrc = result[2].value,
            progesschartsrc = result[3].value

    });

    let backgroundProm = loadImage(`assets/card/${currentTier.background}`);
    let overlayProm = loadImage(overlaySrc);
    let userimgProm = loadImage(userimgSrc);
    let progesschartProm = loadImage(progesschartsrc);
    let accchartProm = loadImage(accchartsrc);
    let speedchartProm = loadImage(speedchartsrc)
    let aimchartProm = loadImage(aimchartsrc);

    let background: any;
    let overlay: any;
    let userimg: any;

    let accchart: any;
    let speedchart: any;
    let aimchart: any;

    let progresschart: any;


    await Promise.allSettled([backgroundProm, overlayProm, userimgProm, aimchartProm, speedchartProm, accchartProm, progesschartProm]).then((result: any) => {

        background = result[0].value;
        overlay = result[1].value;
        userimg = result[2].value;
        aimchart = result[3].value;
        speedchart = result[4].value;
        accchart = result[5].value;
        progresschart = result[6].value

    })

    ctx.beginPath();
    ctx.save();

    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    var sx, sy, dx, dy;
    var sWidth, sHeight, dWidth, dHeight;

    sWidth = ctx.canvas.width;
    sHeight = ctx.canvas.height;

    let rng = new Prando(user.id);
    let x = rng.next(1, (background.width - sWidth));
    let y = rng.next(1, (background.height - sHeight));

    // offset point to crop the image
    sx = x
    sy = y;

    // dimensions of cropped image          

    // if cropped image is smaller than canvas we need to change the source dimensions
    if (background.width - sx < sWidth) {
        sWidth = background.width - sx;
    }
    if (background.height - sy < sHeight) {
        sHeight = background.height - sy;
    }

    // location on canvas to draw the croped image
    dx = 0;
    dy = 0;
    // match destination with source to not scale the image
    dWidth = sWidth;
    dHeight = sHeight;


    // draw the cropped image
    roundedImage(ctx, 0, 0, sWidth, sHeight, 80);
    ctx.clip();
    ctx.drawImage(background, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    ctx.restore();

    let xoffset = (canvas.width - 612) / 2;
    let yoffset = (canvas.height - 812) / 2;

    ctx.drawImage(overlay, xoffset, yoffset);

    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = '25pt IKEA Sans';
    ctx.fillText(user.username, 325, 393.5, 560);

    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = '20pt IKEA Sans';
    //ctx.strokeStyle = "green";
    //ctx.rect(50, 200, 550, 600); // DEBUG
    // ctx.stroke();
    var gradient = ctx.createLinearGradient(325, 0, 500, 0);
    let gradient_stops = 1 / (currentTier.colors.length - 1);
    currentTier.colors.forEach((color: any, index: any) => {
        gradient.addColorStop(gradient_stops * index, color);
    });
    ctx.fillStyle = gradient;
    ctx.fillText(`Rarity: ${currentTier.name}`, 325, 780.5, 550);

    ctx.drawImage(aimchart, 90.5, 457.5, 120, 120);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = '18pt IKEA Sans';
    //ctx.strokeStyle = "green";
    //ctx.rect(90, 625, 120, -180); // DEBUG
    //ctx.stroke();
    ctx.fillText(`${aim_perc.toFixed(0)}% - ${aim.toFixed(1)}`, 150, 645, 120);

    ctx.drawImage(speedchart, 265.5, 457.5, 120, 120);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = '18pt IKEA Sans';
    // ctx.strokeStyle = "green";
    // ctx.rect(265, 547, 75, 20); // DEBUG
    // ctx.stroke();
    ctx.fillText(`${speed_perc.toFixed(0)}% - ${speed.toFixed(1)}`, 323, 645, 120);

    ctx.drawImage(accchart, 440.5, 457.5, 120, 120);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = '18pt IKEA Sans';
    // ctx.strokeStyle = "green";
    // ctx.rect(435, 547, 75, 20); // DEBUG
    // ctx.stroke();
    ctx.fillText(`${acc_perc.toFixed()}% - ${acc.toFixed(1)}`, 498, 645, 120);

    ctx.drawImage(progresschart, 171, 701, 308, 42);

    ctx.font = '12pt IKEA Sans';
    ctx.fillText(`${currentTier.value}`, 146, 717, 120);

    ctx.font = '12pt IKEA Sans';
    ctx.fillText(`${nextTier.value}`, 502, 717, 150);

    ctx.save();
    roundedImage(ctx, 190, 84, 270, 270, 60);
    ctx.clip();
    ctx.drawImage(userimg, 190, 84, 270, 270)
    ctx.restore();

    return canvas.toDataURL();

}