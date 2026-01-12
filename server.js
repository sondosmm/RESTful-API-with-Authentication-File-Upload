const express =require('express');
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require('morgan');
const ApiError = require('./utils/apiError');

dotenv.config({path:'config.env'});
const path = require('path');
const globalError = require('./middleware/errorMiddleware');

const dbConnection= require('./config/database');
const noteRoutes= require('./routes/noteRoute');
const authRoutes = require("./routes/authRoutes");
const upload = require('./middleware/uploadImage');

dbConnection();

//express app
const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));



app.use(express.json());
app.use(cookieParser());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke" });
});

app.use('/uploads',express.static(path.join(__dirname,'uploads')));


//middleware
if (process.env.NODE_ENV ==='development') {
    app.use (morgan('dev'));
    console.log(`mode : ${process.env.NODE_ENV}`)
}

//routers
app.use('/api/notes',noteRoutes);
app.use("/api/auth", authRoutes);




// Handle not found routes (404)
app.use((req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});


//global error handling middleware
// Global error handler
app.use(globalError);


const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log(`App running ON PORT ${PORT}`);
});
