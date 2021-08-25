import {Router, Request, Response} from "express";

const router = Router();

router.get('/', (request: Request, response: Response) => {
    response.send('Get all US tickers API');
});

export const tickersRoutes = router;
