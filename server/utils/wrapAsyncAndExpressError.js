class ExpressError extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}


const wrapAsync = (fnx) => {
    return (req,res,next) =>{
        fnx(req,res,next).catch((err) => next(err));
    }
}


module.exports = {ExpressError,wrapAsync};