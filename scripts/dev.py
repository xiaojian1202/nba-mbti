"""Static dev server that never lets the browser cache a response."""
import http.server


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()

    def send_header(self, keyword, value):
        if keyword.lower() in ('last-modified', 'etag'):
            return
        super().send_header(keyword, value)


http.server.test(HandlerClass=NoCacheHandler, port=5173, bind='127.0.0.1')
