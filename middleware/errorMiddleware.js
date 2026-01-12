const globalError =(err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    err.message = err.message || "Something went wrong";
    if (process.env.NODE_ENV==='development')
    {
        ErrorDev(err,res);
    }
    else
        ErrorProd(err,res);
}
const ErrorDev=(err,res)=>
{
      return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message || "Something went wrong",
        stack: err.stack,
      });
}
const ErrorProd = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message || "Something went wrong",
  });
};

module.exports = globalError;