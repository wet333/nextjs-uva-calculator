import bankPresetsData from "@/data/bank-presets.json";

export function getBankPresets() {
    return bankPresetsData;
}

export function findBankPresetByName(name) {
    if (!name) {
        return null;
    }
    return bankPresetsData.find((preset) => preset.name === name) ?? null;
}

export function sortBankPresetsBySalaryRate(presets) {
    return [...presets].sort((a, b) => {
        const rateA = a.interest_rate_with_salary ?? Infinity;
        const rateB = b.interest_rate_with_salary ?? Infinity;
        return rateA - rateB;
    });
}

export function buildLoanTermOptions(maxYears = 30) {
    const options = [];
    for (let years = 5; years <= maxYears; years += 5) {
        options.push(years);
    }
    return options;
}
