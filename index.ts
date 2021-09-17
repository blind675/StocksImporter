require('dotenv').config()
import mongoose from 'mongoose';
import start from "./src/app";


// connect to DB and Start Server;
mongoose.connect(process.env.DB_URI || '', {useUnifiedTopology: true, useNewUrlParser: true}, async () => {
        console.log('DB       : Connected')

        await start();
    }
);


