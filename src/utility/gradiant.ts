import tinygradient from "tinygradient";

export function getDifficultyColor(raiting: number): any {

    const gradient: any = tinygradient([
        { color: '#4ebfff', pos: ((100 / 8 * 0) / 100) },
        { color: '#4ebfff', pos: ((100 / 8 * 0.25) / 100) },
        { color: '#4ebfff', pos: ((100 / 8 * 0.5) / 100) },
        { color: '#4ebfff', pos: ((100 / 8 * 1) / 100) },
        { color: '#4ebfff', pos: ((100 / 8 * 1.5) / 100) },
        { color: '#4ef4db', pos: ((100 / 8 * 2) / 100) },
        { color: '#70ff73', pos: ((100 / 8 * 2.3) / 100) },
        { color: '#b0f854', pos: ((100 / 8 * 2.8) / 100) },
        { color: '#f6ee5c', pos: ((100 / 8 * 3.3) / 100) },
        { color: '#f9c560', pos: ((100 / 8 * 3.75) / 100) },
        { color: '#fc9e65', pos: ((100 / 8 * 4.20) / 100) },
        { color: '#ff7a69', pos: ((100 / 8 * 4.60) / 100) },
        { color: '#ff666b', pos: ((100 / 8 * 5.10) / 100) },
        { color: '#ff516e', pos: ((100 / 8 * 5.60) / 100) },
        { color: '#ff3c70', pos: ((100 / 8 * 6) / 100) },
        { color: '#bb4ca0', pos: ((100 / 8 * 6.40) / 100) },
        { color: '#775ed1', pos: ((100 / 8 * 6.80) / 100) },
        { color: '#4c49c3', pos: ((100 / 8 * 7.30) / 100) },
        { color: '#2a27a1', pos: ((100 / 8 * 7.75) / 100) },
        { color: '#181589', pos: ((100 / 8 * 8) / 100) }
    ]);

    if (raiting > 8) {
        return [0, 0, 0];
    }
    let index = (100 / 8 * raiting) / 100;

    let c: any = gradient.rgbAt(index);

    return [c._r, c._g, c._b];
}