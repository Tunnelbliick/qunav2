import Prando from 'prando'
import { roundedImage } from './roundimage';
import { builddoughnut } from '../chart.js/card/doughnut';
import { skill_type } from '../skills/skills';
import { replaceDots } from '../../utility/comma';
import { Title } from '../../interfaces/title';
import * as path from 'path';
const { createCanvas, loadImage, registerFont } = require('canvas')

const tiers = [
    { id: 0, value: 0, name: "Beginner", background: "t1bg.png", colors: ["#ffffff", "#ebebeb"] },
    { id: 1, value: 10, name: "Rookie", background: "t2bg.png", colors: ["#d09292", "#c82270"] },
    { id: 2, value: 20, name: "Novice", background: "t3bg.png", colors: ["#facc22", "#ff544f"] },
    { id: 3, value: 30, name: "Intermediate", background: "t4bg.png", colors: ["#55cc7c", "#f5f97f"] },
    { id: 4, value: 40, name: "Skilled", background: "t5bg.png", colors: ["#cd408f", "#094fc3"] },
    { id: 5, value: 50, name: "Expert", background: "t6bg.png", colors: ["#e1afcc", "#7530e3"] },
    { id: 6, value: 60, name: "Master", background: "t7bg.png", colors: ["#3e4878", "#2ab5b2"] },
    { id: 7, value: 70, name: "Elite", background: "pattern.jpg", colors: ["#b3b6eb", "#e98a98"] },
    { id: 8, value: 80, name: "Prodigy", background: "pattern.jpg", colors: ["#6d7ff1", "#d66ef8"] },
    { id: 9, value: 90, name: "God", background: "pattern.jpg", colors: ["#ea6262", "#f1ad54"] },
    { id: 10, value: 100, name: "Inhuman", background: "pattern.jpg", colors: ["#FFFFFF", "#000000"] },
    { id: 11, value: Infinity, name: "All-Star", background: "pattern.jpg", colors: ["#00000"] }
];

export async function generateCard(user: any, skills: skill_type[], title: Title, secondaryTitle: Title | undefined) {

    const ikeaRegular = path.resolve('./assets/fonts/IKEA-Sans-Regular.ttf');
    const ikeaBold = path.resolve('assets/fonts/IKEA-Sans-Bold.ttf');

    // has to be the original font and IKEA Sans in linux god knows why im giving up trying to understand it
    registerFont(ikeaRegular, { family: 'Ikea Sans', weight: 'regular' });
    registerFont(ikeaBold, { family: 'Ikea Sans', weight: 'bold' });

    let total = 0;
    let skill_amount = 0;

    skills.forEach(skill => {
        if (skill.label !== "Star" && skill.average !== 0) {
            total += skill.average;
            skill_amount++;
        }
    })

    total = Math.round(total);

    let currentTier: any;
    let nextTier: any;
    let foundtier = false;

    tiers.forEach((tier: any, index: any) => {
        if (!foundtier && tier.value > total / skill_amount) {
            nextTier = tier;
            currentTier = tiers[index - 1];
            foundtier = true;
        }
    });

    const missing = ((total / skill_amount) - currentTier.value) / 10 * 100;
    //const missing = Math.round(nextTier.value - Math.floor(total / skill_amount)) * 10;

    const imagePromises = [];

    imagePromises.push(builddoughnut(skills));

    const canvas = createCanvas(650, 850)
    const ctx = canvas.getContext('2d')

    const overlaySrc = "assets/card/v2_concept2_1.png"
    const userimgSrc = user.avatar_url;

    let chartsrc = "";

    await Promise.allSettled(imagePromises).then((result: any) => {

        chartsrc = result[0].value;

    });

    const backgroundProm = loadImage(`assets/card/pattern.png`);
    const qunaProm = loadImage(`assets/quna.png`);
    const gamemodeProm = loadImage(`assets/mode/${user.playmode}.png`)
    const countryFlagProm = loadImage(`https://www.countryflagicons.com/FLAT/64/${user.country_code}.png`)
    const overlayProm = loadImage(overlaySrc);
    const userimgProm = loadImage(userimgSrc);
    const chartProm = loadImage(chartsrc);

    let background: any;
    let overlay: any;
    let userimg: any;
    let chart: any;
    let countryFlag: any;
    let gamemodeImage: any;
    let qunaImage: any;

    await Promise.allSettled([backgroundProm, overlayProm, userimgProm, chartProm, countryFlagProm, gamemodeProm, qunaProm]).then((result: any) => {

        background = result[0].value;
        overlay = result[1].value;
        userimg = result[2].value;
        chart = result[3].value;
        countryFlag = result[4].value;
        gamemodeImage = result[5].value;
        qunaImage = result[6].value;

    })

    var gradient_background = ctx.createLinearGradient(0, 0, background.width, background.height);
    const gradient_stops_background = 1 / (currentTier.colors.length - 1);
    currentTier.colors.forEach((color: any, index: any) => {
        gradient_background.addColorStop(gradient_stops_background * index, color);
    });

    var gradient_background_reverse = ctx.createLinearGradient(0, 0, background.width, background.height);
    currentTier.colors.reverse().forEach((color: any, index: any) => {
        gradient_background_reverse.addColorStop(gradient_stops_background * index, color);
    });

    ctx.beginPath();
    ctx.save();

    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    let sx, sy
    let sWidth, sHeight, dWidth, dHeight;

    sWidth = canvas.width;
    sHeight = canvas.height;

    const level = new Prando(user.statistics.level.current / 2);
    const level_left = "#000000".replace(/0/g, function () { return (~~(level.next() * 16)).toString(16); });
    const level_right = "#000000".replace(/0/g, function () { return (~~(level.next() * 16)).toString(16); });
    //const level_left = Math.floor(level.next(1, 16777215)).toString(16);
    //const level_right = Math.floor(level.next(1, 16777215)).toString(16);

    var level_gradient = ctx.createLinearGradient(296, 0, 547, 0);
    level_gradient.addColorStop(0, level_left);
    level_gradient.addColorStop(1, level_right);


    const rng = new Prando(user.id);
    const x = rng.next(1, ((background.width) - sWidth));
    const y = rng.next(1, ((background.height) - sHeight));

    // offset point to crop the image
    sx = x
    sy = y;

    // dimensions of cropped image          

    // if cropped image is smaller than canvas we need to change the source dimensions
    if (background.width - x < sWidth) {
        sWidth = background.width - x;
    }
    if (background.height - y < sHeight) {
        sHeight = background.height - y;
    }

    // match destination with source to not scale the image
    dWidth = sWidth;
    dHeight = sHeight;

    // draw the cropped image
    ctx.drawImage(background, x, y, sWidth, sHeight, 0, 0, dWidth, dHeight);

    // move the draw position to draw the cropped rect at 0 / 0
    ctx.translate(-x, -y);

    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = gradient_background;

    ctx.fillRect(0, 0, background.width, background.height);


    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = gradient_background_reverse;

    ctx.fillRect(0, 0, background.width, background.height);

    // move the draw position back to actually 0 / 0
    ctx.translate(x, y);

    ctx.globalCompositeOperation = 'source-over';

    ctx.drawImage(overlay, 0, 0);

    const space_around = 110;
    const max_width = 540;
    const space = 10;
    const avatar = 180;
    const gamemode = 120;
    const gamemode_icon = 70;
    const avatar_image = avatar - space - space;
    const center = (max_width + space_around) / 2;
    let username_min = 270;

    let userinfo_x = 0;
    let avatar_x = 0;
    let avatar_image_x = 0;
    let userinfo_text_x = 0;
    let userinfo_flag_x = 0;
    let gamemode_icon_x = 0;
    let title_x = 0;
    const chart_x = 382;
    const chart_lowskills_x = 406;

    ctx.textAlign = 'left';
    ctx.font = 'regular 24pt Ikea Sans';
    const measure = ctx.measureText(user.username);
    let username_width = measure.width;

    if (username_width > 240) {
        username_width = 240;
    }

    const flag_height = Math.ceil(measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent);
    const flag_width = Math.ceil(flag_height * (3 / 2));

    const user_card_length = space + username_width + space + flag_width + space;

    if (user_card_length > username_min) {
        username_min = user_card_length;
    }

    const user_info_length = avatar + space + username_min;

    const title_block = user_info_length - (gamemode + space)

    const remainder = (max_width + space_around - user_info_length) / 2;

    avatar_x = remainder;
    avatar_image_x = avatar_x + space;
    userinfo_x = avatar_x + avatar + space;
    userinfo_text_x = userinfo_x + space;
    userinfo_flag_x = userinfo_text_x + username_width + space;
    gamemode_icon_x = remainder + space + ((gamemode - gamemode_icon - space - space) / 2);
    title_x = avatar_x + gamemode + space

    ctx.save();
    ctx.fillStyle = "#27282b";
    roundedImage(ctx, avatar_x, 110, avatar, avatar, 10);
    ctx.clip();
    ctx.fillRect(avatar_x, 110, avatar, avatar);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#27282b";
    roundedImage(ctx, userinfo_x, 110, username_min, avatar, 10);
    ctx.clip();
    ctx.fillRect(userinfo_x, 110, username_min, avatar);
    ctx.restore();

    // Profile Picute
    ctx.save()
    ctx.fillStyle = '#FF0000';
    //ctx.arc(102 + 90, 110 + 90, 90, 0, Math.PI * 2, false)
    roundedImage(ctx, avatar_image_x, 120, avatar_image, avatar_image, 10);
    ctx.clip();
    ctx.drawImage(userimg, avatar_image_x, 120, avatar_image, avatar_image)
    ctx.restore()


    // Username
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.font = 'regular 24pt Ikea Sans';
    ctx.fillText(user.username, userinfo_text_x, 150, 240);
    ctx.save();
    roundedImage(ctx, userinfo_flag_x, 126, flag_width, flag_height, 8);
    ctx.clip();
    ctx.drawImage(countryFlag, 2, 12, 60, 40, userinfo_flag_x, 126, flag_width, flag_height);
    ctx.restore();

    // Rank
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.font = 'regular 18pt Ikea Sans';
    ctx.fillText(`Rank #${replaceDots(user.statistics.global_rank)}`, userinfo_text_x, 192, 400);

    // Country Rank
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.font = 'regular 18pt Ikea Sans';
    ctx.fillText(`Country Rank #${replaceDots(user.statistics.country_rank)}`, userinfo_text_x, 220, 400);

    // Level
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.font = 'regular 8pt Ikea Sans';
    ctx.fillText(`Level ${user.statistics.level.current}.${user.statistics.level.progress}`, userinfo_text_x, 254, 400);

    ctx.save()
    // Level Progressbar
    ctx.fillStyle = "#808080";
    roundedImage(ctx, userinfo_text_x, 260, 250, 10, 5);
    ctx.clip();
    ctx.fillRect(userinfo_text_x, 260, 250, 10);
    ctx.restore();

    ctx.save()
    const level_complete = 250 / 100 * user.statistics.level.progress;

    ctx.fillStyle = level_gradient;
    roundedImage(ctx, userinfo_text_x, 260, level_complete, 10, 5);
    ctx.clip();
    ctx.fillRect(userinfo_text_x, 260, level_complete, 10);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#27282b";
    roundedImage(ctx, avatar_x, 300, gamemode, 130, 10);
    ctx.clip();
    ctx.fillRect(avatar_x, 300, gamemode, 130);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#27282b";
    roundedImage(ctx, title_x, 300, title_block, 130, 10);
    ctx.clip();
    ctx.fillRect(title_x, 300, title_block, 130);
    ctx.restore();

    ctx.drawImage(gamemodeImage, gamemode_icon_x, 315, gamemode_icon, gamemode_icon);
    ctx.font = 'regular 20pt Ikea Sans';
    ctx.textAlign = 'center';
    ctx.fillText(`${user.playmode}`, avatar_x + gamemode / 2, 410, gamemode);

    const tier = ctx.measureText(`Rarity: ${currentTier.name}`);
    const gradient_stops = 1 / (currentTier.colors.length - 1);
    const gradient_tier = ctx.createLinearGradient(380.5 - (tier.width / 2), 0, 380.5 + (tier.width / 2), 0);
    currentTier.colors.forEach((color: any, index: any) => {
        gradient_tier.addColorStop(gradient_stops * index, color);
    });

    let rarity_y = 338;
    let title_y = 370;
    const secondary_y = 410;

    if (!secondaryTitle) {
        rarity_y = 358;
        title_y = 390;
    }

    ctx.save();
    ctx.fillStyle = gradient_tier;
    ctx.textAlign = 'center';
    ctx.font = 'bold 20pt Ikea Sans';
    ctx.fillText(`${currentTier.name}`, title_x + title_block / 2, rarity_y, title_block);
    ctx.restore();

    const title_text = ctx.measureText(`Title: ${title.title}`);
    const title_gradient_stops = 1 / (title.colors.length - 1);
    const title_gradient = ctx.createLinearGradient(380.5 - (title_text.width / 2), 0, 380.5 + (title_text.width / 2), 0);
    title.colors.forEach((color: any, index: any) => {
        title_gradient.addColorStop(title_gradient_stops * index, color);
    });

    ctx.save();
    ctx.fillStyle = title_gradient;
    ctx.textAlign = 'center';
    ctx.font = 'bold 20pt Ikea Sans';
    ctx.fillText(`${title.title}`, title_x + title_block / 2, title_y, title_block);
    ctx.restore();

    if (secondaryTitle) {
        const secondaryTitle_text = ctx.measureText(`Title: ${secondaryTitle.title}`);
        const secondaryTitle_gradient_stops = 1 / (secondaryTitle.colors.length - 1);
        const secondaryTitle_gradient = ctx.createLinearGradient(380.5 - (secondaryTitle_text.width / 2), 0, 380.5 + (secondaryTitle_text.width / 2), 0);
        secondaryTitle.colors.forEach((color: any, index: any) => {
            secondaryTitle_gradient.addColorStop(secondaryTitle_gradient_stops * index, color);
        });

        ctx.save();
        ctx.fillStyle = secondaryTitle_gradient;
        ctx.textAlign = 'center';
        ctx.font = 'bold 20pt Ikea Sans';
        ctx.fillText(`${secondaryTitle.title}`, title_x + title_block / 2, secondary_y, title_block);
        ctx.restore();
    }

    if (skill_amount == 2) {
        ctx.drawImage(chart, 92, chart_lowskills_x, 465, 350);
    } else {
        ctx.drawImage(chart, 92, chart_x, 465, 350);
    }

    if (skill_amount == 2) {
        ctx.fillStyle = "#27282b";
        ctx.beginPath();
        ctx.arc(325, 557 + (chart_lowskills_x - chart_x), 38.5, 0, 2 * Math.PI);
        ctx.fill();
    } else {
        ctx.fillStyle = "#27282b";
        ctx.beginPath();
        ctx.arc(325, 557, 38.5, 0, 2 * Math.PI);
        ctx.fill();
    }

    ctx.save();
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';

    if (skill_amount == 2) {
        ctx.font = 'regular 12pt Ikea Sans';
        ctx.fillText(`Total`, 324, 548 + (chart_lowskills_x - chart_x), 55);
        ctx.font = 'regular 20pt Ikea Sans';
        ctx.fillText(`${total}`, 324, 575 + (chart_lowskills_x - chart_x), 55);
    } else {
        ctx.font = 'regular 12pt Ikea Sans';
        ctx.fillText(`Total`, 324, 548, 55);
        ctx.font = 'regular 20pt Ikea Sans';
        ctx.fillText(`${total}`, 324, 575, 55);
    }

    ctx.font = 'regular 14pt Ikea Sans';
    ctx.textAlign = 'left';
    ctx.fillText(`${currentTier.value * skill_amount}`, 82, 748, 100);

    ctx.font = 'regular 14pt Ikea Sans';
    ctx.textAlign = 'left';
    ctx.fillText(`${nextTier.value * skill_amount}`, 535.5, 748, 100);

    // Level Progressbar
    ctx.save();
    ctx.fillStyle = "#808080";
    roundedImage(ctx, 125, 732, 400, 19, 10);
    ctx.clip();
    ctx.fillRect(125, 732, 400, 19);
    ctx.restore();

    const gradient = ctx.createLinearGradient(125, 0, 400, 0);
    currentTier.colors.reverse().forEach((color: any, index: any) => {
        gradient.addColorStop(gradient_stops * index, color);
    });

    ctx.save();
    ctx.fillStyle = gradient;
    roundedImage(ctx, 125, 732, tierProgress(400, missing), 19, 10);
    ctx.clip();
    ctx.fillRect(125, 732, tierProgress(400, missing), 19);
    ctx.restore();

    ctx.fillStyle = "#737df9";
    ctx.font = 'regular 10pt Ikea Sans';
    ctx.textAlign = 'right';
    ctx.fillText("made by", center - 20, 775, 540);

    // Quna Banner Image
    ctx.save()
    ctx.arc(center + 16 - 16, 756 + 16, 16, 0, Math.PI * 2, false)
    ctx.clip();
    ctx.drawImage(qunaImage, center - 16, 756, 32, 32)
    ctx.restore()

    // Quna Banner Text
    ctx.font = 'regular 15pt Ikea Sans';
    ctx.textAlign = 'left';
    ctx.fillText("Quna", center + 20, 779, 540);

    return canvas.toDataURL();

}

function tierProgress(length: number, missing: number): number {

    return length / 100 * missing;

}