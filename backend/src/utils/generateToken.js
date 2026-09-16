import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (res, customerId) => {
  const token = jwt.sign(
    { id: customerId },
    process.env.JWT_SECRET || 'shopkart_secret_key_12345',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return token;
};

export default generateTokenAndSetCookie;
