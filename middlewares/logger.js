const logger = (req , res , next) => {
    req.hello = `world`;
    console.log(req.hello);
    next();
}

module.exports = logger;