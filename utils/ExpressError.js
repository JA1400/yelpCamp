class ExpressError extends Error{
    constructor(message, statusCode){
        //calls the Parent class, Error
        super();
        this.message = message;
        this.statusCode = statusCode
    }
}

module.exports = ExpressError;