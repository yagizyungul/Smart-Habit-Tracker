const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Geçersiz ID formatı' });
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'alan';
    return res.status(409).json({ message: `Bu ${field} zaten kullanımda` });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Geçersiz token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token süresi dolmuş' });
  }

  const status = err.statusCode || err.status || 500;
  res.status(status).json({ message: err.message || 'Sunucu hatası' });
};

const notFound = (req, res) => {
  res.status(404).json({ message: `${req.originalUrl} bulunamadı` });
};

module.exports = { errorHandler, notFound };
