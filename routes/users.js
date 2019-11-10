const express = require("express");

const {getUsers ,
getUser ,
createUser ,
updateUser ,
deleteUser} = require("../controllers/users");

const { protect , authorize } = require(`../middlewares/auth`);     

const User = require("../models/User");
const advancedResults = require("../middlewares/advancedResults");

const router = express.Router({
    mergeParams:true
});

router.route("/")
.get(advancedResults(Course , {
    path:`bootcamp`,
    select:`name description`
}) , getCourses)
.post(protect , authorize(`publisher` , `admin`) ,addCourse);


router.route("/:id")
.get(getCourse)
.put(protect , authorize(`publisher` , `admin`) , updateCourse)
.delete(protect , authorize(`publisher` , `admin`) , deleteCourse);


module.exports =  router;