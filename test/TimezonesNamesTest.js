const TimezoneNames = require('../src/TimezoneNames');
const germanDisplay = require('../data/de_DE-display.json');
const germanCldr = require('../data/de-cldr.json');
const estonianDisplay = require('../data/et_EE-display.json');
const estonianCldr = require('../data/et-cldr.json');
const englishDisplay = require('../data/en_US-display.json');
const englishCldr = require('../data/en-cldr.json');
const metazones = require('../data/metazones.json');
const fs = require('fs').promises;
const {join} = require('path');

function make() {
    const t = new TimezoneNames({
        display: {
            de_DE: germanDisplay,
            et_EE: estonianDisplay,
            en_US: englishDisplay
        },
        cldr: {
            de: germanCldr,
            en: englishCldr,
            et: estonianCldr
        }
    }, metazones);

    return t;
}

describe('TimezoneNames', () => {
    it('should throw when instantiated without locale data', () => {
        (() => new TimezoneNames()).should.throwError(/locale data/ig);
    });

    it('should throw when instantiated with wrong locale data format', () => {
        (() => new TimezoneNames({
            de_DE: germanDisplay,
            de: germanCldr
        })).should.throwError(/invalid format/ig);
    });

    it('should throw when instantiated without metazones', () => {
        (() => new TimezoneNames({
            display: {
                de_DE: germanDisplay
            },
            cldr: {
                de: germanCldr
            }
        })).should.throwError(/metazones/ig);
    });

    it('should be instantiable with locale data and metazones', () => {
        const t = new TimezoneNames({
            display: {
                de_DE: germanDisplay
            },
            cldr: {
                de: germanCldr
            }
        }, metazones);
    });

    describe('get', () => {
        it('should throw when no timezone was passed', () => {
            const t = make();
            (() => t.get()).should.throwError(/no timezone identifier passed/ig)
        });

        it('should throw when an unknown timezone was passed', () => {
            const t = make();
            (() => t.get('Some/Zone', 'de_DE')).should.throwError(/cannot find metazone for Some\/Zone/ig)
        });

        it('should throw when no data for the specified locale was loaded', () => {
            const t = make();
            (() => t.get('America/Los_Angeles', 'fr_FR')).should.throwError(/no locale data for fr_FR/ig)
        });

        it('should return correct data for loaded locales and languages', () => {
            const t = make();
            t.get('America/Los_Angeles', 'de_DE').should.eql({
                generic:'Nordamerikanische Westküstenzeit',
                standard:'Nordamerikanische Westküsten-Normalzeit',
                daylight:'Nordamerikanische Westküsten-Sommerzeit'
            });
            
            t.get('America/Los_Angeles', 'et_EE').should.eql({
                daylight: 'Vaikse ookeani suveaeg',
                generic: 'Vaikse ookeani aeg',
                standard: 'Vaikse ookeani standardaeg'
            });

            t.get('America/Los_Angeles', 'en_US').should.eql({
                daylight: 'Pacific Daylight Time',
                generic: 'Pacific Time',
                standard: 'Pacific Standard Time'
            });
            
            t.get('Etc/GMT', 'en_US').should.eql({
                daylight: null,
                generic: null,
                standard: 'Greenwich Mean Time'
            });

            t.get('Etc/GMT', 'de_DE').should.eql({
                daylight: null,
                generic: null,
                standard: 'Mittlere Greenwich-Zeit'
            });
        });

        it('should work with all available locales', async () => {
            const dataPath = join(__dirname, '..', 'data');
            const allFiles = await fs.readdir(dataPath);
            const cldrFiles = allFiles.filter(name => name.endsWith('-cldr.json'));
            const displayFiles = allFiles.filter(name => name.endsWith('-display.json'));

            async function loadCldrOrDisplayFiles (files, suffix) {
                const resolved = await Promise.all(files.map(async fileName => {
                    const file = await fs.readFile(join(dataPath, fileName), 'utf8');
                    const value = JSON.parse(file);
                    const key = fileName.replace(suffix, '');
                    return [key, value];
                }));

                return Object.fromEntries(resolved);
            }

            const cldr = await loadCldrOrDisplayFiles(cldrFiles, '-cldr.json');
            const display = await loadCldrOrDisplayFiles(displayFiles, '-display.json');

            const t = new TimezoneNames({display, cldr}, metazones);
            const locales = displayFiles.map(file => file.replace('-display.json', ''));
            const results = locales.map(locale => t.get('America/Los_Angeles', locale));

            results.forEach(result => {
                Object.keys(result).should.eql(['generic', 'standard', 'daylight']);
                result.generic.length.should.be.greaterThan(1);
                result.standard.length.should.be.greaterThan(1);
                result.daylight.length.should.be.greaterThan(1);
            });
        });
    });
});
