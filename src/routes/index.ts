import {Router, Request, Response} from "express";

const router = Router();

router.get('/', (request: Request, response: Response) => {
    response.send('Welcome to Stocks Yield API.');
});

export const mainRoutes = router;
