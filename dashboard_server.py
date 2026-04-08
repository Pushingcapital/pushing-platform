import http.server
import socketserver
import json
import os

PORT = 8000
LOG_FILE = 'p_dashboard_log.json'

class DashboardAPIHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # This is a bit of a hack to serve files from the correct directory.
        # We change the current working directory to where the UI files are.
        # A more robust server would handle routing properly.
        os.chdir('pushingp-flagship-ui')
        super().__init__(*args, **kwargs)

    def do_GET(self):
        if self.path == '/api/data':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            # Go back to the parent directory to read the log file
            os.chdir('..')
            try:
                with open(LOG_FILE, 'r') as f:
                    logs = json.load(f)
            except (FileNotFoundError, json.JSONDecodeError):
                logs = []
            
            # Prepare metrics and logs
            tool_calls = len(logs)
            successful_calls = len([log for log in logs if log.get('status') == 'success'])
            failed_calls = tool_calls - successful_calls

            metrics = [
                {'title': 'Total Tool Calls', 'value': tool_calls},
                {'title': 'Successful Calls', 'value': successful_calls},
                {'title': 'Failed Calls', 'value': failed_calls},
                {'title': 'Agent Status', 'value': 'Idle'}
            ]

            response_data = {
                'metrics': metrics,
                'logs': logs[-10:] # Return last 10 logs
            }
            
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
            
            # Return to the UI directory
            os.chdir('pushingp-flagship-ui')

        else:
            # Serve static files from the 'pushingp-flagship-ui' directory
            super().do_GET()

# We need to run the server from the parent directory of 'pushingp-flagship-ui'
# The handler will then change into that directory to serve the files.
with socketserver.TCPServer(("", PORT), DashboardAPIHandler) as httpd:
    print(f"Serving at port {PORT}")
    print("Open http://localhost:8000/dashboard.html")
    httpd.serve_forever()
