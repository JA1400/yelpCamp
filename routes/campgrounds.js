const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync')
const campgrounds = require('../controllers/campgrounds')
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const multer = require('multer')
//no need to specify index as Node automatically looks for index.js
const { storage } = require('../cloudinary')
//we initialize multer and put the destination of the uploaded files in the dest field!
//in this case, we pass in our created storage!
const upload = multer({ storage })

router.route('/')
    .get(catchAsync(campgrounds.index))
    //as of now, we need to upload the image first so it can parse the req.body that our middleware needs/depends on!
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
//use .array('*input name*') for several files or .single for one!
/*   .post(upload.array('image'), (req, res) => {
      //.files is for .array and .file for .single!
      //multer popultes .file/s with cloudinary data!
      console.log(req.body, req.files);
      res.send("It Worked")
  }) */

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;