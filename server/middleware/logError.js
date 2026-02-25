// This middleware logs errors with full stack trace for debugging
module.exports = function (err, req, res, next) {
  console.error('--- Express Error ---');
  console.error(err.stack || err);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    message: err.message || 'Server error',
    // Only expose stack trace in development
    ...(isProd ? {} : { error: err.message, stack: err.stack })
  });
};
