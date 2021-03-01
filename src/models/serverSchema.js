const mongoose = require('mongoose');

const serverSche = new mongoose.Schema({
    serverID: { type: String, require: true },
    serverName: { type: String, require: true },
    prefix: { type: String, require: true },
});

const model = mongoose.model('Server', serverSche);

module.exports = model;
