import { Request, Response, NextFunction } from 'express';

// Tokens for different access levels
const ADMIN_TOKEN = process.env.AUTH_TOKEN || 'comicif-secret-token-2025';
const ORIGINAL_UPLOAD_TOKEN = process.env.ORIGINAL_UPLOAD_TOKEN || 'comicif-upload-only-token';

interface AuthRequest extends Request {
  isAuthenticated?: boolean;
  tokenType?: 'admin' | 'upload-only';
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

    if (token === ADMIN_TOKEN) {
      req.isAuthenticated = true;
      req.tokenType = 'admin';
      next();
    } else if (token === ORIGINAL_UPLOAD_TOKEN) {
      req.isAuthenticated = true;
      req.tokenType = 'upload-only';
      next();
    } else {
      return res.status(401).json({
        error: 'Access denied. Invalid token.'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Internal server error during authentication.'
    });
  }
};

// Middleware que só aceita token admin
export const adminOnlyMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.tokenType !== 'admin') {
    return res.status(403).json({
      error: 'Access denied. Admin token required.'
    });
  }
  next();
};

// Middleware que aceita qualquer token válido (admin ou upload-only)
export const anyAuthMiddleware = authMiddleware;

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
      token: ADMIN_TOKEN,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error during login.'
    });
  }
};