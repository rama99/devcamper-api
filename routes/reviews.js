const express = require("express");

const { getReviews , 
        getReview ,
        addReview} = require("../controllers/reviews");

const { protect , authorize } = require(`../middlewares/auth`);     

const Review = require("../models/Review");
const advancedResults = require("../middlewares/advancedResults");

const router = express.Router({
    mergeParams:true
});

router.route("/")
.get(advancedResults(Review , {
    path:`bootcamp`,
    select:`name description`
}) , getReviews)
.post(protect , authorize(`user`, `admin`) , addReview);

router.route("/:id")
.get(getReview);


module.exports =  router;