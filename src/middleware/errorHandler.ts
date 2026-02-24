import { Request, Response, NextFunction } from 'express';
import config from '../config';

interface ErrorWithStatus extends Error {
  status?: number;
  data?: any;
}


const errorHandler = (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction): void => {
  const statusCode = err.status || 500;
  const isProduction = config.app.env === 'production';
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    ...(err.data && { data: err.data }),
    ...(isProduction ? {} : { stack: err.stack }),
  };

  console.error(`[${new Date().toISOString()}] [Error] ${err.message}`);
  if (!isProduction && err.stack) {
    console.error(`[Stack Trace] ${err.stack}`);
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
