const mongoose = require('mongoose');
const defaultKeywords = [
    'Java', 'Javascript', 'Python', 'C', 'C++', 'Typescript', 'Ruby', 'Html', 'Css', 'C#',
];
const codes = [1, 2, 3, 4];

const gameSchema = new mongoose.Schema({
    serverId: { type: String, require: true },
    serverName: { type: String, require: true }, //serverSchema object ID
    gameRoles: { type: Array, default: []},
    gameRooms: { type: Array, default: []},
    keywords: { type: Array, default: defaultKeywords},
    codes: { type: Array, default: codes},
    onGame: { type: Boolean, default: false },
    curGames: { type: Number, default: 0 },
    curEncrypterTeam: { type: String, default: 'BLUE' },
    answerers: { type: Array, default: [] },
    blueTeam: { type: JSON, default: {
        keywords: { type: Array, default: [] },
        intToken: { type: Number, default: 0 },
        misToken: { type: Number, default: 0 },
        curCodes: { type: Array, default: [] },
        encrypterId: { type: String, default: ''},
        encryptersList: { type: Array, default: []},
        descriptions: { type: JSON, default: {
            _1: { type: Array, default: []},
            _2: { type: Array, default: []},
            _3: { type: Array, default: []},
            _4: { type: Array, default: []},
        }}
    } },
    redTeam: { type: JSON, default: {
        keywords: { type: Array, default: [] },
        intToken: { type: Number, default: 0 },
        misToken: { type: Number, default: 0 },
        curCodes: { type: Array, default: [] },
        encrypterId: { type: String, default: ''},
        encryptersList: { type: Array, default: []},
        descriptions: { type: JSON, default: {
            _1: { type: Array, default: []},
            _2: { type: Array, default: []},
            _3: { type: Array, default: []},
            _4: { type: Array, default: []},
        }}
    } },
    options: { type:JSON, default: {
        gameMode: { type:String, default: "normal" },
        autoAssign: { type: Boolean, default: false },
    }}
});

const model = mongoose.model('Games', gameSchema);

module.exports = model;
