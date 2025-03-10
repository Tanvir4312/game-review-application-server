require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("The Game Review application server");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h2tkvzo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();

    const reviewsCollection = client.db("All-Review").collection("Review");
    const watchListCollection = client.db("All-Review").collection("watchList");

    app.get("/reviews", async (req, res) => {
      const games = await reviewsCollection.find().toArray();
      res.send(games);
    });

    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await reviewsCollection.findOne(query);
      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const review = req.body;

      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    app.put("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const updateReview = req.body;

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const review = {
        $set: {
          photo: updateReview.photo,
          title: updateReview.title,
          review: updateReview.review,
          rating: updateReview.rating,
          year: updateReview.year,
          genres: updateReview.genres,
        },
      };
      const result = await reviewsCollection.updateOne(filter, review, options);
      res.send(result);
    });

    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
    });

    // WatchList-Collection

    app.get("/watchLists", async (req, res) => {
      const result = await watchListCollection.find().toArray();
      res.send(result);
    });

    app.post("/watchLists", async (req, res) => {
      const watchLists = req.body;

      const result = await watchListCollection.insertOne(watchLists);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("The game review application running on port", port);
});
