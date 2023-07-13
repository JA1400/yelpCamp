const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});
//this will add a username, salt and hash* field to our Schema
//username will need to be unique as well as add a few methods
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema)