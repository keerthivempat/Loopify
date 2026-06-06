// Purpose: Centralized error handling middleware for Express
const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err);

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }

  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server Error' });
};

module.exports = { errorHandler };
