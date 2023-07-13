
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const images = require('./imgUrls');
const { places, descriptors } = require('./seedHelpers')
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log("Database Connected!!");
    }).catch(err => {
        console.log("Error!");
        console.log(err);
    })

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 1;
        const camp = new Campground({
            author: '64984fd7bc8a706bc187e501',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt, mollitia aliquam quae natus velit accusamus asperiores impedit libero porro quo rem aliquid quis, atque nisi aut voluptas ut, voluptates quos.',
            price,
            images: [
                {
                    url: 'https://res.cloudinary.com/dvqvkaten/image/upload/v1688273248/YelpCamp/ipmygi2hzrlfe0nzykyq.jpg',
                    filename: 'YelpCamp/ipmygi2hzrlfe0nzykyq',
                },
                {
                    url: 'https://res.cloudinary.com/dvqvkaten/image/upload/v1688273249/YelpCamp/lzwlxcnmhx3vkocnuot8.jpg',
                    filename: 'YelpCamp/lzwlxcnmhx3vkocnuot8',
                }
            ],
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})