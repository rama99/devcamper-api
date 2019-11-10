const crypto = require(`crypto`);
const User = require(`../models/User`);
const asyncHandler = require(`../middlewares/async`);
const ErrorResponse = require(`../utils/errorResponse`);
const sendEmail = require(`../utils/sendEmail`);



exports.register = asyncHandler( async (req , res , next) => {

    const { name , email , password , role} = req.body;

  const user = await User.create({
        name,
        email,
        password,
        role
    });

    //const token =  user.getSignedJwtToken();
    //console.log(req.body);
    //res.status(200).json({success:true , token});
    sendTokenResponse(user , 200 , res);
});

exports.login = asyncHandler( async (req , res , next) => {

    const { email , password } = req.body;

    if(!email || !password) {
            return next(new ErrorResponse(`Please provide an email and password` , 404))
    }

    const user = await User.findOne({email}).select(`+password`);

    if(!user) {
        return next(new ErrorResponse(`Invalid Credintials` , 401))  
    }

    const isMatch = await user.matchPassword(password);

    if(!isMatch) {
        return next(new ErrorResponse(`Invalid Credintials` , 401))    
    }

    const token =  user.getSignedJwtToken();

    //console.log(req.body);
    //res.status(200).json({success:true , token});
    sendTokenResponse(user , 200 , res);
});

const sendTokenResponse = (user , statusCode , res) => {
    const token =  user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly:true
    }

    if(process.env.NODE_ENV = `production`) {
        options.secure = true;
    }

    res.status(statusCode)
    .cookie(`token` , token , options)
    .json({
        success:true,
        token
    });
}

exports.getMe = asyncHandler( async (req , res , next) => {

    const user = await User.findById(req.user.id);
    console.log(`user` , user);

    res.status(200).json({
        success:true,
        data:user
    });
})


exports.forgotPassword = asyncHandler( async (req , res , next) => {

    const user = await User.findOne({email:req.body.email});

    if(!user) {
        return next(new ErrorResponse(`There is no user with that email`,404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({
        validateBeforeSave:false
    })

    const resetUrl = `${req.protocol}://${req.get(`host`)}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `PUT request ${resetUrl}`;

    try {
        await sendEmail({
            email:user.email,
            subject:`Reset Password`,
            message
        });

        res.status(200).json({success:true , data:`Email sent`})
    }
    catch(err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({
            validateBeforeSave:false
        });

        return next(new ErrorResponse(`Email could not sent`, 500));
    }

    console.log(`user` , user);

    res.status(200).json({
        success:true,
        data:user
    });
})

exports.resetPassword = asyncHandler( async (req , res , next) => {

    const resetPasswordToken = crypto.
    createHash(`sha256`)
    .update(req.params.resetToken)
    .digest(`hex`);

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    });

    if(!user) {
        return next(new ErrorResponse(`Inavlid Token` , 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await  user.save();

    console.log(`user` , user);
    sendTokenResponse(user , 200 , res);
})

exports.updateDetails = asyncHandler( async (req , res , next) => {

    const fieldsToUpdate = {
        name: req.body.name,
        email:req.body.email
    };

    const user = await User.findByIdAndDelete(req.user.id , fieldsToUpdate,{
        new:true,
        runValidators:true
    });

    console.log(`user` , user);

    res.status(200).json({
        success:true,
        data:user
    });
})