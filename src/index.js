const express = require('express');
const { join } = require('path');
const configFileEnv = join(__dirname, '../config/dev.env');
require('dotenv').config({ path: configFileEnv });
require("./db/mongoose");
const userRoute = require('./routers/user');
const taskRoute = require('./routers/task');

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(userRoute);
app.use(taskRoute);


//////
app.listen(port, () => {
    console.log(`App listenning on port ${port}`);
})

