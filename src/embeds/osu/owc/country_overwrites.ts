const { overwrite } = require('country-list');

export function country_overwrite() {
    overwrite([
    { code: 'US', name: 'United States'},
    { code: 'KR', name: 'South Korea' },
    { code: 'GB', name: "United Kingdom" },
    { code: "UY", name: "Uruguay" },
    { code: "TW", name: "Taiwan" },
    { code: "CZ", name: "Czech Republic" },
    { code: "VN", name: "Vietnam"},
    { code: "VE", name: "Venezuela"},
    { code: "MO", name: "Macao"},
    { code: "RU", name: "Russia"}
    ])
}