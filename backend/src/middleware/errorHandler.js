export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern ?? {})[0] ?? 'value';
    return res.status(409).json({ message: `${field} already exists.` });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'The requested record identifier is invalid.' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }
  console.error(error);
  return res.status(error.status ?? 500).json({
    message: error.status ? error.message : 'Something went wrong. Please try again.'
  });
}
