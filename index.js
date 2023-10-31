const express = require("express");
const cors = require("cors");
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4wq6sfj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("eventDB");
    const serviceCollection = database.collection("services");
    const testimonialCollection = database.collection("testimonial");

    // get oparations
    app.get("/services" , async (req , res) => {
        const result = await serviceCollection.find().toArray();
        res.send(result)
    });

    app.get("/testimonial" , async (req , res) => {
        const result = await testimonialCollection.find().toArray();
        res.send(result);
    });

    app.get("/service/:id" , async (req ,res) => {
        const id = req.params.id;
        const query = { _id : new ObjectId(id)};
        const result = await serviceCollection.findOne(query);
        res.send(result)
    })

    // post oparations 
    app.post("/services" , async (req , res) => {
        const result = await serviceCollection.insertOne(req.body);
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// server run
app.get("/", (req, res) => {
  res.send("event management server is running---");
});

app.listen(port, () => {
  console.log(`Event management server is running on port : ${port}`);
});
