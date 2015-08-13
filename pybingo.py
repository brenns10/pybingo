#!/usr/bin/env python3
"""Oldham Bingo"""

from tornado.web import RequestHandler, Application, url, StaticFileHandler
from tornado.websocket import WebSocketHandler
import tornado.ioloop
import os.path
import argparse
import json
import random
from markupsafe import escape
import logging

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
        msg = json.dumps(message)
        for handler in CONNECTIONS.values():
            handler.write_message(msg)
        logging.info(msg)

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
                 'msg': '%s is now known as %s' % (self.nick, nick)}
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

    def sanitize(self, message):
        if type(message) is str:
            return escape(message)
        elif type(message) is list:
            return [self.sanitize(x) for x in message]
        elif type(message) is dict:
            return {k: self.sanitize(v) for k, v in message.items()}
        else:
            return message

    def on_message(self, message):
        try:
            msg = json.loads(message)
        except ValueError:
            self.chat_error('Could not decode JSON message.')
            return
        msg = self.sanitize(msg)

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
    dirname = os.path.dirname(__file__)
    static_path = os.path.join(dirname, "static")
    emoji_data_path = os.path.join(dirname, "emoji-data")
    return Application([
            url(r'/', BingoHandler),
            url(r'/chat', ChatHandler),
            url(r'/bingo.js', JSHandler),
            url(r'/static/(.*)', StaticFileHandler, {'path': static_path}),
            url(r'/emoji-data/(.*)', StaticFileHandler,
                {'path': emoji_data_path}),
        ],
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
    parser.add_argument('-v', '--verbose', action='store_true')
    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.INFO)
    # Set important globals.
    BOARD = [l.strip() for l in args.board]
    random.shuffle(BOARD)
    WSURL = 'ws://%s:%d/chat' % (args.host, args.port)

    # Run application.
    application = make_app()
    application.listen(args.port)
    try:
        tornado.ioloop.IOLoop.current().start()
    except KeyboardInterrupt:
        # Let everyone know that the server is shutting down
        for connection in CONNECTIONS.values():
            connection.chat_error("Server is shutting down.")
            connection.close()
