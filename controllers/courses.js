const Course = require(`../models/Course`);
const Bootcamp = require(`../models/Bootcamp`);
const asyncHandler = require(`../middlewares/async`);
const ErrorResponse = require(`../utils/errorResponse`);

module.exports.getCourses = asyncHandler(async (req , res , next) => {
    
    if(req.params.bootcampId) {
        const courses = await Course.find({bootcamp:req.params.bootcampId});

        return res.status(200).json({
            success:true,
            count: courses.length,
            data:courses
        });
    }
    else {

     res.status(200).json(res.advancedResults);
    }   

});

module.exports.getCourse = asyncHandler(async (req , res , next) => {
    let query;   
        
    query = Course.findById(req.params.id).populate({
            path:`bootcamp`,
            select:`name description`
        });
  

    const course = await query;

    if(!course) {
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`),404);
    }

    res.status(200).json({
        success:true,        
        data: course
    });

});

module.exports.addCourse = asyncHandler(async (req , res , next) => {

    req.body.user = req.user.id;
    req.body.bootcamp = req.params.bootcampId;

    console.log(`add COURSE`);

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);    

    if(!bootcamp) {
        return next(
            new ErrorResponse(`No bootcamp with the id ${req.params.bootcampId}`),
            404
        )
    }

    if(bootcamp.user.toString() !== req.user.id && req.user.role != `admin`) {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course`,404));            
        }

    const course = await Course.create(req.body);

    res.status(200).json({
        success:true,
        data:course
    })
});

module.exports.updateCourse = asyncHandler(async (req , res , next) => {
    
    let course = await Course.findById(req.params.id);

    if(!course) {
        return next(
            new ErrorResponse(`No course with the id ${req.params.id}`),
            404
        )
    }

    if(course.user.toString() !== req.user.id && req.user.role != `admin`) {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course`,404));            
        }

    course = await Course.findByIdAndUpdate(req.params.id , req.body , {
        new:true,
        runValidators:true
    });

    res.status(200).json({
        success:true,
        data:course
    })


});


module.exports.deleteCourse = asyncHandler(async (req , res , next) => {
    
    const course = await Course.findById(req.params.id);

    if(!course) {
        return next(
            new ErrorResponse(`No course with the id ${req.params.id}`),
            404
        )
    }

    if(course.user.toString() !== req.user.id && req.user.role != `admin`) {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course`,404));            
        }

    await course.remove();

    res.status(200).json({
        success:true,
        data:{}
    })


});