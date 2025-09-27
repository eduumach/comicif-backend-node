import { Request, Response, NextFunction } from 'express';

// Simple token for demonstration - in production, use JWT or proper auth
const VALID_TOKEN = process.env.AUTH_TOKEN || 'comicif-secret-token-2025';

interface AuthRequest extends Request {
  isAuthenticated?: boolean;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Access denied. No token provided.'
      });
    }

    // Extract token from "Bearer TOKEN" format
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (token !== VALID_TOKEN) {
      return res.status(401).json({
        error: 'Access denied. Invalid token.'
      });
    }

    // Token is valid, mark request as authenticated
    req.isAuthenticated = true;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Internal server error during authentication.'
    });
  }
};

// Login endpoint to get token
export const loginController = (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    // Simple password check - in production, use proper user auth
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    if (!password) {
      return res.status(400).json({
        error: 'Password is required.'
      });
    }

    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        error: 'Invalid password.'
      });
    }

    // Return the token
    res.json({
      token: VALID_TOKEN,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error during login.'
    });
  }
};