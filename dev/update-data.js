const {DisplayNames, CldrMetazones, CldrLanguageData} = require('./data.json');
const {join} = require('path');
const {writeFile} = require('fs').promises;
const targetPath = join(__dirname, '..', 'data');

async function execute () {
    const promisesDisplay = Object.entries(DisplayNames)
        .map(([key, object]) => writeFile(join(targetPath, `${key}-display.json`), JSON.stringify(object), 'utf8'));

    await Promise.all(promisesDisplay);

    const displayNamesLowerCase = Object.keys(DisplayNames).map(entry => entry.toLowerCase());

    const promisesCldr = Object.entries(CldrLanguageData)
        .filter(([key, data]) => {
            return displayNamesLowerCase.includes(key)
                || (!key.includes('_') && displayNamesLowerCase.some(other => other.split('_')[0] === key));
        }) // filter only relevant cldr files
        .filter(([key, data]) => Object.keys(data.LongNames).length > 0) // filter only cldir files with LongNames
        .map(([key, object]) => [key, object.LongNames])
        .map(([key, longNames]) => {
            // make props lower case
            const longNamesNewArr = Object.entries(longNames).map(([key, details]) => {
                const newDetails = Object.fromEntries(Object.entries(details)
                    .map(([key, val]) => [key.toLowerCase(), val]));
                return [key, newDetails];
            });
            const longNamesNew = Object.fromEntries(longNamesNewArr);
            return [key, longNamesNew];
        })
        .map(([key, longNames]) => writeFile(join(targetPath, `${key}-cldr.json`), JSON.stringify(longNames), 'utf8'));

    await Promise.all(promisesCldr);

    await writeFile(join(targetPath, 'metazones.json'), JSON.stringify(CldrMetazones), 'utf8');
}

execute();
