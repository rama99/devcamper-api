const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");

const BootcampSchema = new mongoose.Schema({
    name: {
        type:String,
        required: [true , `Please add a name`],
        unique: true,
        trim:true,
        maxlength:[50 , `Name cannot be more than 50 characters`]
    },
    slug:String,
    description: {
        type:String,
        required: [true , `Please add a description`],       
        maxlength:[500 , `Description cannot be more than 500 characters`]
    },
    website: {
        type:String
    },
    phone: {
        type:String,
        maxlength:[20 , `Phone number cannot be longer than 20 characters`]
    },
    email: {
        type:String
    },
    address:{
        type:String,
        required:[true , `Please add an address`]        
    },
    location: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: false
          },
          coordinates: {
            type: [Number],
            required: false,
            index:`2dsphere`
          },
          formattedAddress:String,
          street:String,
          city:String,
          state:String,
          zipcode:String,
          country:String
    },
    careers: {
        type:[String],
        required:true,
        enum: [
            `Web Development`,
            `Database`,
            `UI/UX`,
            `Business`,
            `Mobile Development`,
            `Data Science`
        ]
    },
    averageRating: {
        type:Number,
        min:[1 , `Rating must be atleast 1`],
        max:[10, `Rating max  10`],
    },
    averageCost: Number,
    photo: {
        type:String,
        default:`no-photo.jpg`
    },
    housing:{
        type:Boolean,
        default:false
    },
    jobAssistance:{
        type:Boolean,
        default:false
    },
    jobGuarantee:{
        type:Boolean,
        default:false
    },
    acceptGi:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    user: {
        type:mongoose.Schema.ObjectId,
        ref:`User`,
        required:true
    }
},{
    toJSON:{virtuals: true},
    toObject: {virtuals: true}
    }
)

BootcampSchema.pre(`save` , function(next){
    this.slug = slugify(this.name , {lower: true});
    next();
})

BootcampSchema.pre(`save` , async function(next){
    const loc = await geocoder.geocode(this.address);

    this.location = {
        type:`Point`,
        coordinates:[loc[0].longitude , loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city:loc[0].city,
        state:loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    }

    this.address = undefined;
    next();
})

BootcampSchema.pre(`remove` , async function(next) {
    await this.model(`Course`).deleteMany({bootcamp: this.__id});
    next();
})

BootcampSchema.virtual(`courses` , {
    ref:`Course`,
    localField: `_id`,
    foreignField:`bootcamp`,
    justOne: false
})

module.exports = mongoose.model(`Bootcamp` , BootcampSchema);