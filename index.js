const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;
const cookieParser = require("cookie-parser");

// middlewares
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  console.log(token);
  if (!token) {
    return res.status(401).send({ message: "unauthorized" });
  }
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      res.status(401).send({ message: "unauthorized" });
    }
    req.body = decoded;
    next();
  });
};

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4wq6sfj.mongodb.net/?retryWrites=true&w=majority`;

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

    // jwt
    app.post("/jwt", async (req, res) => {
      const body = req.body;
      const token = jwt.sign(body, process.env.SECRET, { expiresIn: "1h" });
      console.log(token);
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
        })
        .send({ message: "success" });
    });
    // get oparations
    app.get("/services", verifyToken, async (req, res) => {
      try {
        // const body = req.body;
        // console.log("form services " , req.query)
        const result = await serviceCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.get("/testimonial", verifyToken, async (req, res) => {
      try {
        const result = await testimonialCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.get("/service/:id", verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await serviceCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // post oparations
    app.post("/services", async (req, res) => {
      try {
        const result = await serviceCollection.insertOne(req.body);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // delete oparations
    app.delete("/service/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await serviceCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // put oparations

    app.put("/service/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const body = req.body;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updated = {
          $set: {
            service_name: body.service_name,
            imageURL: body.imageURL,
            price: body.price,
            details: body.details,
          },
        };
        const result = await serviceCollection.updateOne(
          filter,
          updated,
          options
        );
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

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
