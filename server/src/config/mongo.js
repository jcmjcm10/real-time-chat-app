const mongoose = require('mongoose');

async function connectMongo() {
    try {      
        await mongoose.connect(process.env.MONGO_URI);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}


module.exports = connectMongo;
    
