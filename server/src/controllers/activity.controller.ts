import { Request, Response } from 'express';
import { sseService } from '../services/sse.service';

export const streamActivity = (req: Request, res: Response) => {
    const { login } = req.params;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseService.addClient(login as string, res);
};
