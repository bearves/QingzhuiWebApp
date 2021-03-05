# !/usr/bin/env/python3

import asyncio
import pathlib
import ssl
import websockets
from websock_data_server import WebsockDataServer

server = WebsockDataServer()
start_server = websockets.serve(server.handler, "0.0.0.0", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()

