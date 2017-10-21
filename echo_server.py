#!/usr/bin/env python
import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web

import time
import itertools

from gen_sample import gen_sample

sample = gen_sample()


def callback_factory(conn):
    def callback():
        for i in range(50):
            conn.write_message(sample[i].tobytes(), binary=True)
    return callback


class WSHandler(tornado.websocket.WebSocketHandler):
    connections = []
    def open(self):
        print("client connected")
        # Add the connection to the list of connections
        self.connections.append(self)
        self.pcb = tornado.ioloop.PeriodicCallback(callback_factory(self), 900)
        self.pcb.start()

    def on_message(self, message):
        #Check if message is Binary or Text
        print(type(message))

    def on_close(self):
        # Remove the connection from the list of connections
        self.pcb.stop()
        self.connections.remove(self)
        print("client disconnected")


class NCCOHandler(tornado.web.RequestHandler):
    def get(self):
        with open("ncco.json", 'r') as f:
            ncco = f.read()
        self.write(ncco)
        self.set_header("Content-Type", 'application/json')
        self.finish()


application = tornado.web.Application([
    (r'/socket', WSHandler),
    (r'/ncco', NCCOHandler)])

if __name__ == "__main__":
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(8000)
    tornado.ioloop.IOLoop.instance().start()
