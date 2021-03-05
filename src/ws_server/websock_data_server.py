# !/usr/bin/env/python3

import asyncio
import websockets
import datetime
import random
import zmq
import dataclient

class WebsockDataServer(object):

    def __init__(self):
        self.ctx = zmq.Context()
        self.clt = dataclient.DataClient(self.ctx, "python_ws_agent")

    async def consumer(self, websocket, message):
        print(message)
        if message == "ping":
            await websocket.send("ack")
        elif message[0:4] == "fwd ":
            # send cmd to dataAgent
            self.clt.send_cmd(message[4:])

    async def producer(self):
        # get robot state data, gait id and custom gait data
        # pack them to a json object
        # send to the client
        robot_state_data = self.clt.get_data()
        return robot_state_data

    async def consumer_handler(self, websocket, path):
        async for message in websocket:
            await self.consumer(websocket, message)

    async def producer_handler(self, websocket, path):
        while True:
            message = await self.producer()
            await websocket.send(message)
            await asyncio.sleep(0.5) 

    async def handler(self, websocket, path):
        print('client connected')
        self.consumer_task = asyncio.ensure_future(
            self.consumer_handler(websocket, path))
        self.producer_task = asyncio.ensure_future(
            self.producer_handler(websocket, path))
        _, pending = await asyncio.wait(
            [self.consumer_task, self.producer_task],
            return_when=asyncio.FIRST_COMPLETED,
        )
        print("task finished")
        for task in pending:
            task.cancel()

