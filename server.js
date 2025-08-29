import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import admin from "./firebase.js";
import dotenv from "dotenv";
import multer from "multer";
import cloudinary from "cloudinary";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoURL = process.env.MONGO_URL;
const dbName = "picsule";          // uncommented to avoid runtime error
const collectionName = "picsule";  // uncommented to avoid runtime error

cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

function getDB(callback) {
        MongoClient.connect(mongoURL)
                .then((client) => {
                        const db = client.db(dbName);
                        const collection = db.collection(collectionName);
                        callback(collection, client);
                })
                .catch((err) => {
                        console.error("Mongodb connection error = " + err);
                });
}

app.get("/", (req, res) => {
        res.send("Hello +");
});

app.listen(8000, () =>
        console.log("Server running on http://localhost:8000")
);
