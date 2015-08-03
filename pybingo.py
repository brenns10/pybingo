#!/usr/bin/env python3
"""Oldham Bingo"""

from tornado.web import RequestHandler, Application, url
from tornado.websocket import WebSocketHandler
import tornado.ioloop
import os.path
import argparse
import sys

CONNECTIONS = set()
BOARD = []
WSURL = ''


class BingoHandler(RequestHandler):

    def get(self):
        self.render('templates/bingo.html', cells=BOARD)


class JSHandler(RequestHandler):

    def get(self):
        self.render('templates/bingo.js', url=WSURL)


class ChatHandler(WebSocketHandler):

    def broadcast(self, message):
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
            url(r'/bingo.js', JSHandler),
        ],
        static_path=os.path.join(os.path.dirname(__file__), "static"),
    )


if __name__ == '__main__':
    # Parse arguments.
    parser = argparse.ArgumentParser()
    parser.add_argument('board', help='bingo board text file',
                        type=argparse.FileType('r'))
    parser.add_argument('-H', '--host', help='hostname (for links)',
                        type=str, default='localhost')
    parser.add_argument('-P', '--port', help='port',
                        type=int, default=8888)
    args = parser.parse_args()

    # Set important globals.
    BOARD = [l.strip() for l in args.board]
    WSURL = 'ws://%s:%d/chat' % (args.host, args.port)

    # Run application.
    application = make_app()
    application.listen(8888)
    tornado.ioloop.IOLoop.current().start()
