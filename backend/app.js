const express = require('express');
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT;
const app = express();
app.use(express.json());


app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
