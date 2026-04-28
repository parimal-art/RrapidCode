    require('dotenv').config();
    const mongoose = require('mongoose');
async function Main(){
    await mongoose.connect(process.env.DB_CONNECTION_KEY);
}

module.exports = Main;