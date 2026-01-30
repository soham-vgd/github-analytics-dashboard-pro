import { Request, Response, NextFunction } from 'express';
import { profileService } from '../services/profile.service';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { login } = req.params;
        if (!login) {
            return res.status(400).json({ message: 'Username is required' });
        }

        const data = await profileService.getFullProfile(login as string);

        res.json({
            status: 'success',
            data
        });
    } catch (error) {
        next(error);
    }
};
