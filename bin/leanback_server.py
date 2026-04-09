#!/usr/bin/env python3
import http.server
import socketserver
import urllib.request
import urllib.error
import os

PORT = 8080
TARGET_URL = "https://pushing-capital-voice-gateway.manny-861.workers.dev/ask"

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.end_headers()

    def do_POST(self):
        if self.path == '/ask':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                import subprocess
                # Use native macOS curl to completely bypass Cloudflare's WAF Python TLS fingerprint checks
                cmd = [
                    "curl", "-s", "-X", "POST", TARGET_URL,
                    "-H", "Content-Type: application/json",
                    "-H", "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                    "-d", post_data.decode('utf-8')
                ]
                
                result = subprocess.run(cmd, capture_output=True)
                
                if result.returncode == 0 and result.stdout:
                    with open('/tmp/gateway_response.txt', 'wb') as f:
                        f.write(result.stdout)
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(result.stdout)
                else:
                    self.send_response(500)
                    self.end_headers()
                    print(f"Curl error: {result.stderr.decode('utf-8')}")
            
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                print(f"Proxy error: {e}")
        else:
            super().do_POST()

if __name__ == "__main__":
    # Serve files from the Desktop so the HTML files are accessible
    os.chdir(os.path.expanduser("~/Desktop"))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), ProxyHTTPRequestHandler) as httpd:
        print("======================================================")
        print("🚀 LEAN BACK SERVER RUNNING 🚀")
        print("1. Open Google Chrome or Safari.")
        print("2. Navigate to: http://localhost:8080/lean_back_p.html")
        print("======================================================")
        print("(Press Ctrl+C to stop)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
