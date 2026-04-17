import subprocess, json, sys
from http.server import BaseHTTPRequestHandler, HTTPServer

class ProxyHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(length))
        prompt = body.get('prompt', '')
        # Execute the prompt locally on the verified Mac Studio connection
        res = subprocess.run(['gemini', '-p', prompt], capture_output=True, text=True)
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'reply': res.stdout + res.stderr}).encode())

server = HTTPServer(('0.0.0.0', 8890), ProxyHandler)
print("HP Proxy Relay live on port 8890")
server.serve_forever()
