import http.server
import json
import os
import datetime
import sys

PORT = 8000
CAPTURE_DIR = "validation_evidence/runtime_captures"
LOG_DIR = "validation_evidence/logs"

# Ensure directories exist
os.makedirs(CAPTURE_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

class EvidenceHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            filename = data.get('filename', f'capture_{datetime.datetime.now().strftime("%Y%m%d_%H%M%S")}.json')
            evidence = data.get('evidence', {})

            capture_path = os.path.join(CAPTURE_DIR, filename)
            with open(capture_path, 'w') as f:
                json.dump(evidence, f, indent=2)
            
            log_path = os.path.join(LOG_DIR, 'activity.log')
            with open(log_path, 'a') as f:
                f.write(f"{datetime.datetime.now()}: Saved {capture_path}\n")
            
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            print(f"Captured: {filename}")
        except Exception as e:
            print(f"Error: {e}")
            self.send_response(500)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == "__main__":
    with http.server.HTTPServer(("", PORT), EvidenceHandler) as httpd:
        print(f"Validation Receiver running on port {PORT}")
        httpd.serve_forever()
