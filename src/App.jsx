import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import axios from 'axios';
import './App.css';

function App() {
  	const [ticker, setTicker] = useState({});
  	const [tradingView, setTradingView] = useState({});
  	const [config, setConfig] = useState({
		buy: 0,
		sell: 0,
		side: 'BUY',
		symbol: 'BTCUSDT'
	})

  	const [profit, setProfit] = useState({
    	value: 0,
    	perc: 0,
    	lastBuy: 0
  	})

  	function processData(ticker) {
    	const lastPrice = parseFloat(ticker.c);
    	if (config.side === 'BUY' && config.buy > 0 && lastPrice <= config.buy) {
				buyNow();
				config.side = 'SELL';

				setProfit({
					value: profit.value,
					perc: profit.perc,
					lastBuy: lastPrice
			})
		}
		else if (config.side === 'SELL' && config.sell > profit.lastBuy && lastPrice >= config.sell) {
			sellNow();
			config.side = 'BUY';
			const lastProfit = lastPrice - profit.lastBuy;

			setProfit({
				value: profit.value + lastProfit,
				perc: profit.perc + (lastPrice * 100 / profit.lastBuy - 100),
				lastBuy: 0
			})
		}
	}

	const { lastJsonMessage } = useWebSocket('wss://stream.binance.com:9443/stream?streams=' + config.symbol.toLowerCase() + '@ticker', {
		onMessage: () => {
			if (lastJsonMessage && lastJsonMessage.data) {
				if (lastJsonMessage.stream === config.symbol.toLowerCase() + '@ticker') {
					setTicker(lastJsonMessage.data);
					processData(lastJsonMessage.data);
				}
			}
		},
		onError: (event) => {
			alert(event);
		}
	})

	useEffect(() => {
		const tv = new window.TradingView.widget(
		{
			"autosize": true,
			"symbol": "BINANCE:" + config.symbol,
			"interval": "60",
			"timezone": "Etc/UTC",
			"theme": "dark",
			"style": "1",
			"locale": "en",
			"toolbar_bg": "#f1f3f6",
			"enable_publishing": false,
			"allow_symbol_change": true,
			"details": true,
			"container_id": "tradingview_ef138"
		}
		);
		setTradingView(tv);
	}, [config.symbol])

	function onSymbolChange(event) {
		setConfig(prevState => ({ ...prevState, symbol: event.target.value }));
	}

	function onValueChange(event) {
		setConfig(prevState => ({ ...prevState, [event.target.id]: parseFloat(event.target.value) }));
	}

	function buyNow(){
		axios.post('http://localhost:3001/BUY/' + config.symbol + '/0.01')
			.then(result => console.log(result.data))
			.catch(err => console.error(err));
	}

	function sellNow(){
		axios.post('http://localhost:3001/SELL/' + config.symbol + '/0.01')
			.then(result => console.log(result.data))
			.catch(err => console.error(err));
	}

	return (
		<>
			<h1>Galhardo Cripto BOT</h1>
			<div className="tradingview-widget-container">
				<div id="tradingview_ef138"></div>
			</div>
			
			<div className="dashboard">
				<div>
					Symbol: 
					<select id="symbol" defaultValue={config.symbol} onChange={onSymbolChange}>
						<option>BTCUSDT</option>
						<option>ETHUSDT</option>
					</select><br />
					Buy at: <input type="number" id="buy" defaultValue={config.buy} onChange={onValueChange} /><br />
					Sell at: <input type="number" id="sell" defaultValue={config.sell} onChange={onValueChange} /><br />
				</div>
				<div>
					<b>Profit:</b><br />
					Profit: {profit && profit.value.toFixed(8)}<br />
					Profit %: {profit && profit.perc.toFixed(2)}<br />
				</div>
				<div>
					<b>Ticker 24h:</b><br />
					Open: {ticker?.o}<br />
					High: {ticker?.h}<br />
					Low: {ticker?.l}<br />
					Last: {ticker?.c}<br />
					Change %: {ticker?.P}<br />
				</div>
			</div>
		</>
	);
}

export default App;