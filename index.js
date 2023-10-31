const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middlewares 
app.use(cors());
app.use(express.json());

// server run
app.get("/" , (req , res) => {
    res.send("event management server is running---");
})

app.listen(port , () => {
    console.log(`Event management server is running on port : ${port}`)
})