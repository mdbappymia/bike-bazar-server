const express = require("express");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const app = express();
app.use(cors());
app.use(express.json());

const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iuevi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const run = async () => {
  try {
    await client.connect();
    // all collection
    const database = client.db("bike_bazar");
    const productCollection = database.collection("products");
    const orderCollection = database.collection("orders");
    const reviewCollection = database.collection("reviews");
    const userCollection = database.collection("users");

    // get all products
    app.get("/products", async (req, res) => {
      const result = await productCollection.find({}).toArray();
      res.json(result);
    });

    // get a single item
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const result = await productCollection.findOne({
        _id: ObjectId(id),
      });
      res.json(result);
    });

    // post a single product to database
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.json(result);
    });
    // delete a products
    app.delete("/products/:id", async (req, res) => {
      const productId = req.params.id;
      const query = { _id: ObjectId(productId) };
      const result = await productCollection.deleteOne(query);
      res.json(result);
    });
    // get all order
    app.get("/orders", async (req, res) => {
      const email = req.params.email;
      const result = await orderCollection.find({}).toArray();
      res.json(result);
    });
    // get order for specific email
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const result = await orderCollection
        .find({ email: { $eq: email } })
        .toArray();
      res.json(result);
    });
    // post a single order
    app.post("/orders", async (req, res) => {
      const singleOrder = req.body;
      const result = await orderCollection.insertOne(singleOrder);
      res.send(result);
    });
    // delete a single order
    app.delete("/orders/:id", async (req, res) => {
      const orderId = req.params.id;
      const query = { _id: ObjectId(orderId) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });

    // update status a review pending to Shipped
    app.put("/orders/:id", async (req, res) => {
      const orderId = req.params.id;
      const query = { _id: ObjectId(orderId) };
      const updateDoc = {
        $set: {
          status: "Shipped",
        },
      };
      const result = await orderCollection.updateOne(query, updateDoc);
      res.json(result);
    });

    // post a single review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });
    // get all reviews
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find({}).toArray();
      res.json(result);
    });

    // post an users to database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
    });

    // get all user from database
    app.get("/users", async (req, res) => {
      const result = await userCollection.find({}).toArray();
      res.json(result);
    });
    // set user role [Admin or User]
    app.put("/users/:id", async (req, res) => {
      const userId = req.params.id;
      const role = req.body;
      const setRol = role.role;
      const query = { _id: ObjectId(userId) };
      const options = { upsert: true };
      const updateRole = {
        $set: {
          role: setRol,
        },
      };
      const result = await userCollection.updateOne(query, updateRole, options);
      res.json(result);
    });
    // get an user by email
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
};
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello Bike Bazar");
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("Server is running on port", port);
});
