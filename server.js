const path = require(`path`);
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const fileupload = require("express-fileupload");
const helmet = require(`helmet`);
const xss = require(`xss-clean`);
const rateLimit = require(`express-rate-limit`);
const hpp = require(`hpp`);
const cors = require(`cors`);
const cookieParser = require(`cookie-parser`);
const mongoSanitize = require(`express-mongo-sanitize`);
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/error");

dotenv.config({path: "./config/config.env"});


connectDB();

const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max:100
})

app.use(limiter);

app.use(hpp());
app.use(cors());

app.use(express.static(path.join(__dirname , `public`)))

if(process.env.NODE_ENV === `development`) {
    app.use(morgan(`dev`));
}

app.use(fileupload());


app.use("/api/v1/bootcamps" ,  bootcamps);
app.use("/api/v1/courses" ,  courses);
app.use("/api/v1/auth" ,  auth);

app.use(errorHandler);

const PORT = process.env.PORT  || 5000;

const server = app.listen( PORT , () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})

process.on("unhandledRejection" , (err , promise) => {
    console.log(`Error  ====> ${err.message}`);
    server.close(() => process.exit(1));
})