const language = require('../Language');
const data = require('../json/en-us.json');
const merge = require('../../src/functions/deepMerge');

class en_US extends language {
    constructor() {
        super();
        merge(this, data);
    }
}

module.exports = en_US;