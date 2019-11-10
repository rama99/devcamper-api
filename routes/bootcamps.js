const express = require("express");

const { getBootcamps , 
    getBootcamp , 
    createBootcamp ,
     updateBootcamp , 
     deleteBootcamp ,
    getBootcampsInRadius,
    bootcampPhotoUpload } = require("../controllers/bootcamps");

 const Bootcamp = require(`../models/Bootcamp`);
 const advancedResults = require(`../middlewares/advancedResults`);


const courseRouter = require("./courses");
const router = express.Router();

const { protect , authorize } = require(`../middlewares/auth`);

router.use("/:bootcampId/courses" , courseRouter );

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router.route("/:id/photo").put(protect , authorize(`publisher` , `admin`) , bootcampPhotoUpload);

router.route("/")
.get(advancedResults(Bootcamp , `courses`) , getBootcamps)
.post(protect , authorize(`publisher` , `admin`) , createBootcamp);

router.route("/:id")
.put(protect , authorize(`publisher` , `admin`) , updateBootcamp)
.get(getBootcamp)
.delete(protect , authorize(`publisher` , `admin`) , deleteBootcamp);


module.exports = router;
