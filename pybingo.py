#!/usr/bin/env python3
"""Oldham Bingo"""

from tornado.web import RequestHandler, Application, url
from tornado.websocket import WebSocketHandler
import tornado.ioloop
import os.path
import argparse
import json
import random

CONNECTIONS = {}
BOARD = []
WSURL = ''
NCHATTERS = 0


class BingoHandler(RequestHandler):

    def get(self):
        self.render('templates/bingo.html', cells=random.sample(BOARD, 24))


class JSHandler(RequestHandler):

    def get(self):
        self.render('templates/bingo.js', url=WSURL)


class ChatHandler(WebSocketHandler):

    def check_origin(self, origin):
        return True

    def broadcast(self, message):
        if self.nick is None:
            self.chat_error('You must set your nickname first.')
            return
        message['from'] = self.nick
        for handler in CONNECTIONS.values():
            handler.write_message(json.dumps(message))

    def open(self):
        self.nick = None

    def chat_error(self, msg):
        r = {'cmd': 'error', 'msg': msg}
        self.write_message(json.dumps(r))

    def set_nick(self, nick):
        if nick in CONNECTIONS:
            self.chat_error('That nick is already taken.')
            return
        if self.nick is not None:
            r = {'cmd': 'server',
                 'msg': '%s is now known is %s' % (self.nick, nick)}
            del CONNECTIONS[self.nick]
        else:
            r = {'cmd': 'server',
                 'msg': '%s has joined the chat' % nick}
        self.nick = nick
        CONNECTIONS[self.nick] = self
        self.broadcast(r)
        self.broadcast_users()

    def broadcast_users(self):
        for handler in CONNECTIONS.values():
            handler.send_users()

    def send_users(self):
        r = {'cmd': 'who', 'who': list(CONNECTIONS.keys())}
        self.write_message(json.dumps(r))

    def on_message(self, message):
        try:
            msg = json.loads(message)
        except ValueError:
            self.chat_error('Could not decode JSON message.')
            return

        if 'cmd' not in msg:
            self.chat_error('Missing "cmd" argument.')
            return

        if msg['cmd'].lower() == 'msg':
            if 'msg' in msg:
                self.broadcast(msg)
            else:
                self.chat_error('No message in msg command.')
        elif msg['cmd'].lower() == 'emote':
            if 'msg' in msg:
                self.broadcast(msg)
            else:
                self.chat_error('No message in emote command.')
        elif msg['cmd'].lower() == 'nick':
            if 'nick' in msg:
                self.set_nick(msg['nick'])
            else:
                self.chat_error('You must specify a nickname.')
        elif msg['cmd'].lower() == 'who':
            self.send_users()
        else:
            self.chat_error('Invalid chat command.')

    def on_close(self):
        r = {'cmd': 'server', 'msg': '%s has left' % self.nick}
        del CONNECTIONS[self.nick]
        self.broadcast(r)
        self.broadcast_users()


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
    random.shuffle(BOARD)
    WSURL = 'ws://%s:%d/chat' % (args.host, args.port)

    # Run application.
    application = make_app()
    application.listen(args.port)
    tornado.ioloop.IOLoop.current().start()
