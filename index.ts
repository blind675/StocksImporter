require('dotenv').config()

import express from 'express';
import mongoose from 'mongoose';
import startServer from "./src/app";
import {tickersRoutes} from "./src/routes/api/v1/tickers";
import {mainRoutes} from "./src/routes";

// setup Routs
const index = express();
index.use('/', mainRoutes);
index.use('/api/v1/tickers', tickersRoutes);

// connect to DB and Start Server;
mongoose.connect(process.env.DB_URI || '', {useUnifiedTopology: true, useNewUrlParser: true}, async () => {
        console.log('DB       : Connected')

        const PORT = process.env.PORT || 5000;
        index.listen(PORT, () => console.log(`Server   : Running on port ${PORT}`));

        await startServer();
    }
);


