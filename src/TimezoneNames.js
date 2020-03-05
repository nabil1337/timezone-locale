class TimezoneNames {
    constructor (data, metazones) {
        if (!data) {
            throw new Error('no locale data passed');
        }

        if (['display', 'cldr'].some(prop => typeof data[prop] === 'undefined')) {
            throw new Error('locale data has invalid format');
        }

        if (typeof metazones !== 'object') {
            throw new Error('no valid metazones passed');
        }

        this.data = data;
        this.metazones = metazones;
    }

    get (timezone, locale) {
        if (!timezone) {
            throw new Error('no timezone identifier passed');
        }

        if (!this.data.display[locale]) {
            throw new Error(`no locale data for ${locale}`);
        }

        const metazone = this.getMetazone(timezone);
        const cldr = this.findCldrForLocale(locale);

        return cldr[metazone];
    }

    getMetazone (timezone) {
        if (typeof this.metazones[timezone] === 'undefined') {
            throw new Error(`cannot find metazone for ${timezone}`);
        }

        return this.metazones[timezone];
    }

    findCldrForLocale (locale) {
        const {cldr} = this.data;
        const localeLowerWithHyphen = locale.toLowerCase().replace('_', '-');

        if (cldr[localeLowerWithHyphen]) {
            return cldr[localeLowerWithHyphen];
        }

        const localeLang = localeLowerWithHyphen.replace(/\-.*$/ig, '');

        if (cldr[localeLang]) {
            return cldr[localeLang];
        }

        throw new Error(`cannot find cldr for locale ${locale}`);
    }
}

module.exports = TimezoneNames;
