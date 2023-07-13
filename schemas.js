const baseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    //creating an extention to ->
    base: joi.string(),
    messages: {
        //custom message created for errors
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        //its called ->
        escapeHTML: {
            //needs to have a method called validate with a value
            validate(value, helpers) {
                //sanitize html will remove any html tags
                const clean = sanitizeHtml(value, {
                    //here we set the allowed tags or attributes. ATM we dont allow anything
                    allowedTags: [],
                    allowedAttributes: {},
                });
                //we compare the strings to see if anything has change
                //if ther is a change, we will return the message we created
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                //else, we just continue and return the value
                return clean;
            }
        }
    }
});

const Joi = baseJoi.extend(extension);

module.exports.campgroundSchema = Joi.object({
    //expected to be nested under title and required. 
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        /* image: Joi.string().required(), */
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        //we can now require that created method ->
        body: Joi.string().required().escapeHTML()
    }).required()
})
