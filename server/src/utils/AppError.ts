import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    public statusCode: number;
    public status: string;
    public isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (err: AppError | Error, req: Request, res: Response, next: NextFunction) => {
    let statusCode = 500;
    let status = 'error';
    let message = 'Internal Server Error';

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        status = err.status;
        message = err.message;
    } else if (err instanceof Error) {
        message = err.message;
    }

    console.error(`[Error] ${req.method} ${req.url}: ${message}`, err);

    res.status(statusCode).json({
        status,
        message,
    });
};
