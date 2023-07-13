const Campground = require('../models/campground');
//call the specific api you want to use
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
//use the token we get from mapbox
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
const { cloudinary } = require('../cloudinary')

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new',);
}

module.exports.createCampground = async (req, res, next) => {
    //this will return coordinated from a named location
    //it will return them in [longitude,latitude] format!!
    const geoData = await geocoder.forwardGeocode({
        //our location string
        query: req.body.campground.location,
        //limit the results to only one
        limit: 1
        //send the request in order to get an answer
    }).send()
    /* if(!req.body.campground) throw new ExpressError('Invalid Canmpground Data', 400) */
    const newc = new Campground(req.body.campground);
    //saving that {"type":"Point","coordinates":[-87.922497,43.034993]} format
    newc.geometry = geoData.body.features[0].geometry;
    //Take the .files object and make an array of two objects/images with a path and filename each
    newc.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    newc.author = req.user._id;
    await newc.save();
    console.log(newc);
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${newc._id}`)
}

module.exports.showCampground = async (req, res) => {
    //populate several fields by chaining on .populate for each!!!
    const campground = await Campground.findById(req.params.id).populate({
        //populate the reviews
        path: 'reviews',
        //and on each review
        populate: {
            //populate the author
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    //create an array of the new images using .map()
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    //push that array onto the campground using the spread operator
    campground.images.push(...imgs);
    await campground.save()
    //if there is anything in the array
    if (req.body.deleteImages) {
        for (const filename of req.body.deleteImages) {
            //method in cloudinary used to delete the passed in filename
            await cloudinary.uploader.destroy(filename)
        }
        //pull from the images array, where the filename is in the .deletedImages array
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    for (const img of campground.images) {
        await cloudinary.uploader.destroy(img.filename)
    }
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground!')
    res.redirect(`/campgrounds`)
}
