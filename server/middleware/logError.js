// This middleware logs errors with full stack trace for debugging
module.exports = function (err, req, res, next) {
  console.error('--- Express Error ---');
  console.error(err.stack || err);
  res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
};
