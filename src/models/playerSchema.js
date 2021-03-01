const mongoose = require('mongoose');

/**
 * bet coins to play games and win the coins
 */
const playerSchema = new mongoose.Schema({
    playerId: { type: String, require: true },
    coins: { type: Number, default: 100 },
    bank: { type: Number, default: 0 },
    onGame: { type: Boolean, default: false },
    total_Games: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    loses: { type: Number, default: 0 },
});

const model = mongoose.model('Players', playerSchema);

module.exports = model;
