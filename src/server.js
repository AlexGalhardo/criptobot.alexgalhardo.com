import * as axios from 'axios';
import { stringify } from 'querystring';
import { createHmac } from 'crypto';
import express from 'express';
import cors from 'cors';
import "dotenv/config";

const BINANCE_TEST_API_KEY = process.env.VITE_BINANCE_TEST_API_KEY;
const BINANCE_TEST_API_SECRET = process.env.VITE_BINANCE_TEST_API_SECRET;

const app = express();

app
	.use(cors())
	.post('/:side/:symbol/:quantity', (req, res) => {
		const { side, symbol, quantity } = req.params;

		const data = { symbol, side, quantity, type: 'MARKET', timestamp: Date.now(), recvWindow: 60000 };

		const signature = createHmac('sha256', BINANCE_TEST_API_SECRET)
								.update(stringify(data))
								.digest('hex');

		const newData = {...data, signature};
		const url = 'https://testnet.binance.vision/api/v3/order?' + stringify(newData);

		axios.post(url, null, { headers: { 'X-MBX-APIKEY': BINANCE_TEST_API_KEY } })
			.then(result => {
				console.log(result.data);
				res.json(result.data);
			})
			.catch(err => {
				console.error(err.response.data);
				res.sendStatus(500);
			})
	})
	.listen(3001, () => {
    	console.log('\n\nCriptoBOT running on http://localhost:3000');
	})