const Review = require(`../models/Review`);
const Bootcamp = require(`../models/Bootcamp`);
const asyncHandler = require(`../middlewares/async`);
const ErrorResponse = require(`../utils/errorResponse`);

module.exports.getReviews = asyncHandler(async (req , res , next) => {
    
    if(req.params.bootcampId) {
        const reviews = await Review.find({bootcamp:req.params.bootcampId});

        return res.status(200).json({
            success:true,
            count: reviews.length,
            data:reviews
        });
    }
    else {

     res.status(200).json(res.advancedResults);
    }   

});

module.exports.getReview = asyncHandler(async (req , res , next) => {
    
    
        const review = await Review.findById(req.params.id).populate({
            path:`bootcamp`,
            select:`name description`
        });

        if(!review) {
            return next(new ErrorResponse(`No review found with the id of ${req.params.id}` , 404))
        }

        return res.status(200).json({
            success:true,            
            data:review
        });    

});


module.exports.addReview = asyncHandler(async (req , res , next) => {    

        req.body.bootcamp = req.params.bootcampId;
        req.body.user = req.user.id;

        const bootcamp = await Bootcamp.findById(req.params.bootcampId);

        if(!bootcamp) {
           return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`,404));
        }

        const review = await Review.create(req.body);
    
        return res.status(200).json({
        success:true,      
        data:review
    });    

});


module.exports.updateReview = asyncHandler(async (req , res , next) => {        

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp) {
       return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`,404));
    }

    const review = await Review.create(req.body);

    return res.status(200).json({
    success:true,      
    data:review
});    

});