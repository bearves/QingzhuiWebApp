class heartChecker {
    constructor() {
        this.timeout = 2000;
        this.timeoutObj = null;
        this.serverTimeoutObj = null;
    }

    reset(websock) {
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        this.start(websock);
    }

    start(websock) {
        let self = this;
        this.timeoutObj = setTimeout(() => {
            websock?.send("ping");
            self.serverTimeoutObj = setTimeout(() => {
                // invoke websocket's close handler
                websock?.close();
            }, self.timeout)
        }, this.timeout)
    }
}

class webSocketClient {
    constructor(remoteAdd) {
        this.ws = null;
        this.remoteAdd = remoteAdd;
        this.heartCheck = new heartChecker();
        this.onMessage = null;
    }

    bindWsHandler() {
        let self = this;
        this.ws.onopen = (event) => {
            self.heartCheck.start(self.ws);
        };
        this.ws.onmessage = (event) => {
            self.heartCheck.reset(self.ws);
            if (this.onMessage) {
                setTimeout(() => {
                    this.onMessage(event.data);
                }, 0);
            }
        };
        this.ws.onclose = () => {
            console.log("connection lost, try reconnect in 1s");
            setTimeout(() => {
                self.reconnect();
            }, 1000);
        };
        this.ws.onerror = () => {
            console.log("connection error");
        };
    }

    init() {
        this.ws = null;
        this.ws = new WebSocket(this.remoteAdd);
        this.bindWsHandler();
    }

    setMessageHandler(handler) {
        this.onMessage = handler;
    }

    reconnect() {
        this.init();
    }

    send(msg) {
        try {
            if (this.ws){
                this.ws.send(msg);
            }
        }
        catch (e) {
            console.log(e.message);
        }
    }
}

export  {webSocketClient};