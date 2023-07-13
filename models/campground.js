const mongoose = require('mongoose');
const Review = require('../models/review');
const Schema = mongoose.Schema;


/* https://res.cloudinary.com/dvqvkaten/image/upload/c_scale,w_300/v1688273249/YelpCamp/lzwlxcnmhx3vkocnuot8.jpg*/

//only add virtual properties on the actual schema
const ImageSchema = new Schema({
    url: String,
    filename: String
})
//our vitual property adds the resize line to out url and returns it
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/c_scale,w_200')
})

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    //nested schema
    images: [ImageSchema],
    //important structure to saving GeoJSON data
    geometry: {
        type: {
            type: String,
            enum: ['Point'], // 'type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    //use this to store the author id
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    //one to many here so we can store the review ids as an array
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts)

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this.id}">${this.title}</a><strong>
    <p>${this.description.substring(0,20)}...</p>`
})

//find the specific query or document middleware needed for the specific action
//in this case, after the inital task is completed, it will pass the 
//deleted item into this post middleware! that way we can see its data
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        //delete reviews
        await Review.deleteMany({
            //where their id
            _id: {
                //is in our item's review array
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)