declare global {
    interface Window {
        TradingView: any;
    }
}

import React, { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";

function App() {
    const [ticker, setTicker] = useState({
        o: 0,
        h: 0,
        l: 0,
        c: 0,
        P: 0,
    });
    const [, setTradingView] = useState({});
    const [config, setConfig] = useState({
        buy: 0,
        sell: 0,
        side: "BUY",
        symbol: "BTCUSDT",
    });

    const { lastJsonMessage }: any = useWebSocket(
        "wss://stream.binance.com:9443/stream?streams=" + config.symbol.toLowerCase() + "@ticker",
        {
            onMessage: () => {
                if (lastJsonMessage?.data) {
                    if (lastJsonMessage?.stream === config.symbol.toLowerCase() + "@ticker") {
                        setTicker(lastJsonMessage?.data);
                    }
                }
            },
        },
    );

    useEffect(() => {
        const tv = new window.TradingView.widget({
            autosize: true,
            symbol: "BINANCE:" + config.symbol,
            interval: "60",
            timezone: "Etc/UTC",
            theme: "dark",
            style: "1",
            locale: "en",
            toolbar_bg: "#f1f3f6",
            enable_publishing: false,
            allow_symbol_change: true,
            details: true,
            container_id: "tradingview_ef138",
        });
        setTradingView(tv);
    }, [config.symbol]);

    function onSymbolChange(event: { target: { value: any } }) {
        setConfig((prevState) => ({ ...prevState, symbol: event.target.value }));
    }

    return (
        <>
            <div className="container mt-5 col-lg-12">
                <div className="row">
                    <h1 className="text-center">
                        <a
                            className="text-decoration-none text-warning fw-bold"
                            href="https://github.com/AlexGalhardo/criptobot.alexgalhardo.com"
                            target="_blank"
                        >
                            Galhardo Cripto BOT
                        </a>
                    </h1>

                    <div className="mt-5 col-lg-9 h-100">
                        <div id="tradingview_ef138"></div>
                    </div>

                    <div className="container mt-5 col-lg-3">
                        <div className="text-start">
                            Symbol <hr />
                            <select
                                className="form-select text-center fw-bold"
                                id="symbol"
                                defaultValue={config.symbol}
                                onChange={onSymbolChange}
                            >
                                <option value={"BTCUSDT"}>Bitcoin BTC USDT</option>
                                <option value={"ETHUSDT"}>Ethereum ETH USDT</option>
                                <option value={"SOLUSDT"}>Solana SOL USDT</option>
                                <option value={"DOTUSDT"}>Polkadot DOT USDT</option>
                                <option value={"LINKUSDT"}>Chainlink LINK USDT</option>
                                <option value={"PEPEUSDT"}>Pepe coin PEPE USDT</option>
                                <option value={"SHIBUSDT"}>Shiba Inu SHIB USDT</option>
                                <option value={"DOGEUSDT"}>Dogecoin DOGE USDT</option>
                            </select>
                        </div>
                        <br />
                        <br />
                        <div>
                            <p>Ticker 24h</p>
                            <hr />
                            <p>Open: {ticker?.o}</p>
                            <p className="text-success fw-bold">High: {ticker?.h}</p>
                            <p className="text-danger fw-bold">Low: {ticker?.l}</p>
                            <p>Last: {ticker?.c}</p>
                            <p className="text-info">Change %: {ticker?.P}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;
