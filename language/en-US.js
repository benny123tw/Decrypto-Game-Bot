const language = require('./Language');
const data = require('./en-us.json');

class en_us extends language {
    constructor() {
        super(data);
    }
}

module.exports = en_us;