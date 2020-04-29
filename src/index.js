const app = require('./app');
const port = process.env.PORT;

//////
app.listen(port, () => {
    console.log(`App listenning on port ${port}`);
})

