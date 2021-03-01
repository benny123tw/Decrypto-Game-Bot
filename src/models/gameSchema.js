const mongoose = require('mongoose');
const defaultKeywords = [
    'Java', 'Javascript', 'Python', 'C', 'C++', 'Typescript', 'Ruby', 'Html', 'Css', 'C#',

];
const codes = [1, 2, 3, 4];

const gameSchema = new mongoose.Schema({
    serverId: { type: String, require: true },
    serverName: { type: String, require: true },
    gameRoles: { type: Array, default: []},
    gameRooms: { type: Array, default: []},
    keywords: { type: Array, default: defaultKeywords},
    codes: { type: Array, default: codes},
    onGame: { type: Boolean, default: false },
    curKeywords: { type: Array, default: [] },
    curCodes: { type: Array, default: [] },
});

const model = mongoose.model('Games', gameSchema);

module.exports = model;
