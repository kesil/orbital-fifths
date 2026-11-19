#!/usr/bin/env python3
"""Local HTTP launcher for Orbital Fifths."""

import functools
import http.server
import os
import socketserver
import sys
import threading
import webbrowser


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    handler = functools.partial(QuietHandler, directory=root_dir)

    port = 8080
    server = None
    for candidate in [8080, 8081, 8082, 0]:
        try:
            server = socketserver.ThreadingTCPServer(("127.0.0.1", candidate), handler)
            port = server.server_address[1]
            break
        except OSError:
            continue

    if server is None:
        print("Error: Could not bind to a local port.", file=sys.stderr)
        sys.exit(1)

    url = f"http://127.0.0.1:{port}/index.html"
    print(f"Orbital Fifths Studio running at: {url}")
    print("Press Ctrl+C to stop.")

    if "--no-browser" not in sys.argv:
        threading.Timer(0.4, lambda: webbrowser.open(url)).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down Orbital Fifths server.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
