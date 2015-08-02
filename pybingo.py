#!/usr/bin/env python3
"""Oldham Bingo"""

from tornado.web import RequestHandler, Application, url
from tornado.websocket import WebSocketHandler
import tornado.ioloop
import logging
import os.path

CONNECTIONS = set()

import random
BOARD = random.sample([str(x) for x in range(100)], 24)


class BingoHandler(RequestHandler):

    def get(self):
        self.render('templates/bingo.html', cells=BOARD)


class ChatHandler(WebSocketHandler):

    def broadcast(message):
        for handler in CONNECTIONS:
            handler.write_message(message)

    def open(self):
        CONNECTIONS.add(self)
        self.write_message('Welcome to Case Bingo Chat!\n')

    def on_message(self, message):
        print('Received message: ' + message)
        self.broadcast(message)
            
    def on_close(self):
        CONNECTIONS.remove(self)

def make_app():
    return Application([
            url(r'/', BingoHandler),
            url(r'/chat', ChatHandler),
        ],
        static_path=os.path.join(os.path.dirname(__file__), "static"),
    )
    
    
if __name__ == '__main__':
    application = make_app()
    application.listen(8888)
    tornado.ioloop.IOLoop.current().start()