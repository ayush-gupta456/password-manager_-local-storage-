const express = require('express')
const dotenv = require('dotenv')
const { MongoClient } = require('mongodb');
const bodyparser=require('body-parser');
const cors=require('cors')
const { Result } = require('postcss');
dotenv.config()
// Connection URL
const url = 'mongodb://localhost:27017/';
const client = new MongoClient(process.env.MONGO_URI);
// Database Name
// const dbName = 'password_manager_mongo';
const app = express()
const port = 5000
app.use(bodyparser.json())
app.use(cors())

client.connect();

//get all the paassowrds
app.get('/', async (req, res) =>{
    const db = client.db('password_manager_mongo');
        const collection = db.collection('passwords');
        const findResult = await collection.find({}).toArray();
        res.json(findResult);
    })
//save a password
    app.post('/', async (req, res) =>{
            const password=req.body.password;
            const username = req.body.username
            const loda_Size = req.body.loda_Size;
            const upload = [password,username]
            const db = client.db('password_manager_mongo');
                const collection = db.collection('passwords');
                const findResult = await collection.insertOne(upload);
                res.send({success: true, result: findResult})
        })
// delete a password by id
app.delete('/', async (req, res) => {
    const password = req.body;
    const db = client.db('password_manager_mongo');
    const collection = db.collection('passwords');
    const deleteResult = await collection.deleteOne(password);
    res.json({ success: true, result: deleteResult });
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});