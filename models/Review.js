const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema({
    title: {
        type:String,
        trim:true,
        required:[true , `Please add a title for the review`],
        maxlength:100
    },
    text: {
        type:String,
        required:[true , `Please add some tetxt`]
    },
    rating: {
        type:Number,
        min:1,
        max:10,
        required:[true , `Please add a rating between 1 and 10`]
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref:`Bootcamp`,
        required:true
    },
    user: {
        type:mongoose.Schema.ObjectId,
        ref:`User`,
        required:true
    }
});

ReviewSchema.statics.getAverageRating = async function(bootcampId) {
    const obj = await this.aggregate([
        {
            $match : {bootcamp:bootcampId}
        },
        {
            $group:{
                _id: `$bootcamp`,
                averageRating:{$avg: `$rating`}
            }
        }
    ]);

    try {
        await this.model(`Bootcamp`).findByIdAndUpdate(bootcampId, {
            averageRating: obj[0].averageRating
        });
    }
    catch(err) {
        console.log(err);
    }
}

ReviewSchema.post(`save` , function() {
    this.constructor.getAverageRating(this.bootcamp);
})

ReviewSchema.pre(`remove` , function() {
    this.constructor.getAverageRating(this.bootcamp);
})


ReviewSchema.index({bootcamp:1,user:1}, {unique:true});

module.exports = mongoose.model(`Review` , ReviewSchema);