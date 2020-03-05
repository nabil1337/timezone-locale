# timezone-locale

Convert IANA (tz database) timezone names to localized names.
Inspired by and with data from: https://github.com/mj1856/TimeZoneNames
Zero dependencies. MIT License.

## Usage

```js
const {TimezoneNames, metazones} = require('timezone-locale');

// files are required separately to avoid bloat
const germanDisplay = require('timezone-locale/data/de_DE-display.json');
const germanCldr = require('timezone-locale/data/de-cldr.json');
const englishDisplay = require('timezone-locale/data/en_US-display.json');
const englishCldr = require('timezone-locale/data/en-cldr.json');

const timezoneNames = new TimezoneNames({
    display: {
        de_DE: germanDisplay,
        en_US: englishDisplay
    },
    cldr: {
        de: germanCldr,
        en: englishCldr
    }
}, metazones);

console.log(timezoneNames.get('Europe/Berlin', 'en_US'));
// {
//     generic: 'Central European Time',
//     standard: 'Central European Standard Time',
//     daylight: 'Central European Summer Time'
// }

console.log(timezoneNames.get('Europe/Berlin', 'de_DE'));
// {
//    generic: 'Mitteleuropäische Zeit',
//    standard: 'Mitteleuropäische Normalzeit',
//    daylight: 'Mitteleuropäische Sommerzeit'
// }

```

## Tests

Run `npm run test`.

## Developing & regenerating data

Place a data.json (unextracted, not the .gz) from the original repo linked in the intro into the `dev` directory and run `node ./dev/update-data.js` in the project folder to regenerate the .json files under `data`.

## Notes

* if you want to load all locales at once, there's an example in the test file
* this should also work in the browser, but I haven't tested that
* if you want more features or have found bugs, feel free to contribute to this project
* package where I got the data from is Copyright (c) 2014 Matt Johnson (to attribute according to the MIT license)
