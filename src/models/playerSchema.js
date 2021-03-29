const mongoose = require('mongoose');

/**
 * bet coins to play games and win the coins
 */
const playerSchema = new mongoose.Schema({
    playerId: { type: String, require: true },
    playerName: { type: String, require: true },
    coins: { type: Number, default: 100 },
    bank: { type: Number, default: 0 },
    onGame: { type: Boolean, default: false },
    curServerId: { type: String, default: '' },
    team: { type: String, default: '' },
    total_Games: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    loses: { type: Number, default: 0 },
    cheats: { type: Number, default: 0},
    onCustomer: { type: Boolean, default: false },
});

const model = mongoose.model('Players', playerSchema);

module.exports = model;
