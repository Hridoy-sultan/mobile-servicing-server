const express = require('express');
const bodyParser = require('body-parser');
cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const app = express();
const port = 5000;
const fileUpload = require('express-fileupload');
const { ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lieed.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('review'));
app.use(fileUpload());

// const uri = "mongodb+srv://mobileServicing:<password>@cluster0.lieed.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookingCollection = client.db("mobile_servicing").collection("booking");

    app.post('/addBooking', (req, res) => {
        const booking = req.body;
        console.log(booking);
        bookingCollection.insertOne(booking)
            .then(result => {
                res.send(result.insertedCount)
            })
    })


    const reviewCollection = client.db("mobile_servicing").collection("review");
    app.post('/addReview', (req, res) => {
        const review = req.body;
        const file = req.files.file;
        console.log(review);
        console.log('file', file)

        file.mv(`${__dirname}/review/${file.name}`, err => {
            if (err) {
                console.log(err);
                // return res.status(500).send({ msg: 'failed to upload image' })

            }
            return res.send({ name: file.name, path: `/${file.name}` })
        })
        reviewCollection.insertOne(review)
            .then(result => {
                res.send(result.insertedCount)
                console.log('result', result);

            })
    })


    const serviceCollection = client.db("mobile_servicing").collection("service");
    app.post('/addService', (req, res) => {
        const service = req.body;
        const file = req.files.serviceFile;
        console.log(service);
        console.log('file', file)

        file.mv(`${__dirname}/service/${file.name}`, err => {
            if (err) {
                console.log(err);
                // return res.status(500).send({ msg: 'failed to upload image' })

            }
            return res.send({ name: file.name, path: `/${file.name}` })
        })
        serviceCollection.insertOne(service)
            .then(result => {
                res.send(result.insertedCount)
                console.log('result', result);

            })
    })

    const adminCollection = client.db("mobile_servicing").collection("admins");
    app.post('/isAdmin', (req, res) => {
        const email = req.body.email
        adminCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0)
            })
    })

    const makeCollection = client.db("mobile_servicing").collection("admins");
    app.post('/makeAdmin', (req, res) => {
        const admin = req.body;
        console.log(admin);
        makeCollection.insertOne(admin)
            .then(result => {
                res.send(result.insertedCount)
            })
    })



    app.get('/addBooking', (req, res) => {
        bookingCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
                console.log('err', err);

            })
    })

    app.get('/addReview', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
                console.log('err', err);

            })
    })

    app.get('/addService', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
                console.log('err', err);

            })
    })

    app.delete('/addService/:id', (req, res) => {
        serviceCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                console.log(result);
                res.send(result.deletedCount > 0)

            })
    })


});



app.get('/', (req, res) => {
    res.send('hello it is working')
})
app.listen(process.env.PORT || port);