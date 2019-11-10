const path = require(`path`);
const Bootcamp = require(`../models/Bootcamp`);
const asyncHandler = require(`../middlewares/async`);
const geocoder = require(`../utils/geocoder`);
const ErrorResponse = require(`../utils/errorResponse`);


exports.getBootcamps = asyncHandler( async (req , res , next) => {
                res.status(200).json(res.advancedResults);      
})

exports.getBootcamp = asyncHandler(async (req , res , next) => {

    
        const bootcamp = await Bootcamp.findById(req.params.id);
        if(!bootcamp) {
           return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`,404));        
        }
        res.status(200).json({success:true , data:bootcamp});  
   
})

exports.createBootcamp = asyncHandler(async (req , res , next) => {
   // console.log(req.body);
     req.body.user = req.user.id;
     
    const publishedBootcamp = await Bootcamp.findOne({user:req.user.id});

    if(publishedBootcamp && req.user.role !== `admin`) {
        return next(new ErrorResponse(`The user with ID ${req.user.id} has already published
        a bootcamp`,404));        
    }

    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({ success:true ,
                           data:bootcamp
          });
   
   
})

exports.updateBootcamp = asyncHandler( async (req , res , next) => {

    
        let bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`,404));        
        }

        if(bootcamp.user.toString() !== req.user.id && req.user.role !== `admin`) {
                return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`,404));            
        }

        bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id , req.body , {
                new: true,
                runValidators:true
        });

        res.status(200).json({success:true , data: bootcamp});
    
})

exports.deleteBootcamp = asyncHandler(async (req , res , next) => {

    
        const bootcamp = await Bootcamp.findById(req.params.id);
        console.log(`deleteBootcamp`);

        if(!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`,405));        
        }

        if(bootcamp.user.toString() !== req.user.id && req.user.role !== `admin`) {
                return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`,404));            
        }

        bootcamp.remove();

        res.status(200).json({success:true , data: {}});
        
})


exports.getBootcampsInRadius = asyncHandler(async (req , res , next) => {
    
     const { zipcode  , distance } = req.params;
        
     const loc = await geocoder.geocode(zipcode);
     const lat = loc[0].latitude;
     const lng = loc[0].longitude;

     const radius = distance / 3963;

     const bootcamps = await Bootcamp.find({
             location:{$geoWithin: {$centerSphere:[[lng , lat],radius]}}
     })

     res.status(200).json({
             success:true,
             count:bootcamps.length,
             data:bootcamps
     })
})

exports.bootcampPhotoUpload = asyncHandler(async (req , res , next) => {

    
        const bootcamp = await Bootcamp.findById(req.params.id);
        console.log(`deleteBootcamp`);

        if(!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`,404));        
        }       

       // res.status(200).json({success:true , data: {}});
       // console.log(req.files);

       if(bootcamp.user.toString() !== req.user.id && req.user.role != `admin`) {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this bootcamp`,404));            
        }

        if(!req.files) {
                return next(new ErrorResponse(`Please upload a file`,400));        
               }

       const file = req.files.file;

       if(!file.mimetype.startsWith(`image`)) {
        return next(new ErrorResponse(`Please upload an image file`,400));        
       }

       if(file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less then ${process.env.MAX_FILE_UPLOAD}`,400));              
       }
        
       file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

       file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}` , async err => {
               if(err) {
                return next(new ErrorResponse(`Problem with file upload`,500));                 
               }

               await Bootcamp.findByIdAndUpdate(bootcamp._id , {
                       photo: file.name
               })
               res.status(200).json({
                       success:true,
                       data:file.name
               })
       })
})

