#!/usr/bin/env python3
"""
ASTRA Security Website Server
Includes authentication API endpoints for connecting projects
"""

import http.server
import socketserver
import json
import os
import sqlite3
import uuid
from datetime import datetime
from urllib.parse import urlparse, parse_qs
import threading

# Database setup
DB_PATH = 'astra_auth.db'

def init_db():
    """Initialize the SQLite database for authentication"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Create projects table
    c.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            auth_id TEXT UNIQUE,
            name TEXT,
            description TEXT,
            path TEXT,
            status TEXT,
            created_at TIMESTAMP,
            connected_at TIMESTAMP,
            last_verified TIMESTAMP
        )
    ''')
    
    # Create connections table
    c.execute('''
        CREATE TABLE IF NOT EXISTS connections (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            session_id TEXT,
            ip_address TEXT,
            user_agent TEXT,
            connected_at TIMESTAMP,
            last_active TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects (id)
        )
    ''')
    
    conn.commit()
    conn.close()

class AstraRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP request handler for ASTRA website"""
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        # API endpoints
        if parsed_path.path == '/api/auth/status':
            self.handle_auth_status(parsed_path)
        elif parsed_path.path == '/api/auth/connect':
            self.handle_auth_connect(parsed_path)
        elif parsed_path.path == '/api/auth/verify':
            self.handle_auth_verify(parsed_path)
        elif parsed_path.path == '/api/project/info':
            self.handle_project_info(parsed_path)
        elif parsed_path.path == '/api/user/info':
            self.handle_user_info()
        elif parsed_path.path == '/api/dashboard/stats':
            self.handle_dashboard_stats()
        elif parsed_path.path == '/api/projects/list':
            self.handle_projects_list()
        else:
            # Serve static files
            super().do_GET()
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/auth/register':
            self.handle_auth_register()
        elif parsed_path.path == '/api/auth/confirm':
            self.handle_auth_confirm()
        elif parsed_path.path == '/api/projects/create':
            self.handle_project_create()
        else:
            self.send_error(404, "Endpoint not found")
    
    def handle_auth_status(self, parsed_path):
        """Handle authentication status check"""
        query = parse_qs(parsed_path.query)
        auth_id = query.get('authId', [None])[0]
        
        if not auth_id:
            self.send_json_response({'error': 'Missing authId parameter'}, 400)
            return
        
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        c.execute('SELECT * FROM projects WHERE auth_id = ?', (auth_id,))
        project = c.fetchone()
        
        conn.close()
        
        if project:
            self.send_json_response({
                'status': 'connected',
                'project': {
                    'id': project[0],
                    'name': project[2],
                    'description': project[3],
                    'connected_at': project[7]
                }
            })
        else:
            self.send_json_response({
                'status': 'pending',
                'auth_id': auth_id,
                'message': 'Waiting for connection'
            })
    
    def handle_auth_connect(self, parsed_path):
        """Handle project connection request"""
        query = parse_qs(parsed_path.query)
        auth_id = query.get('authId', [None])[0]
        project_name = query.get('project', ['Unnamed Project'])[0]
        
        if not auth_id:
            # Generate new auth ID
            auth_id = str(uuid.uuid4())
        
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        # Check if auth ID already exists
        c.execute('SELECT * FROM projects WHERE auth_id = ?', (auth_id,))
        existing = c.fetchone()
        
        if existing:
            # Update last verification
            c.execute('UPDATE projects SET last_verified = ? WHERE auth_id = ?',
                     (datetime.now().isoformat(), auth_id))
            project_id = existing[0]
        else:
            # Create new project entry
            project_id = str(uuid.uuid4())
            c.execute('''
                INSERT INTO projects (id, auth_id, name, status, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (project_id, auth_id, project_name, 'pending', datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
        
        # Serve the connect.html page
        self.path = '/auth/connect.html'
        return super().do_GET()
    
    def handle_auth_verify(self, parsed_path):
        """Handle authentication verification"""
        query = parse_qs(parsed_path.query)
        auth_id = query.get('authId', [None])[0]
        
        if not auth_id:
            self.send_json_response({'error': 'Missing authId parameter'}, 400)
            return
        
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        c.execute('SELECT * FROM projects WHERE auth_id = ?', (auth_id,))
        project = c.fetchone()
        
        if project:
            # Update connection status
            c.execute('''
                UPDATE projects 
                SET status = 'connected', connected_at = ?, last_verified = ?
                WHERE auth_id = ?
            ''', (datetime.now().isoformat(), datetime.now().isoformat(), auth_id))
            
            conn.commit()
            
            self.send_json_response({
                'status': 'success',
                'message': 'Project connected successfully',
                'project': {
                    'id': project[0],
                    'name': project[2],
                    'auth_id': auth_id
                }
            })
        else:
            self.send_json_response({
                'status': 'error',
                'message': 'Invalid authentication ID'
            }, 404)
        
        conn.close()
    
    def handle_project_info(self, parsed_path):
        """Get project information"""
        query = parse_qs(parsed_path.query)
        auth_id = query.get('authId', [None])[0]
        
        if not auth_id:
            self.send_json_response({'error': 'Missing authId parameter'}, 400)
            return
        
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        c.execute('SELECT * FROM projects WHERE auth_id = ?', (auth_id,))
        project = c.fetchone()
        
        if project:
            # Get connection count
            c.execute('SELECT COUNT(*) FROM connections WHERE project_id = ?', (project[0],))
            connection_count = c.fetchone()[0]
            
            self.send_json_response({
                'project': {
                    'id': project[0],
                    'auth_id': project[1],
                    'name': project[2],
                    'description': project[3],
                    'path': project[4],
                    'status': project[5],
                    'created_at': project[6],
                    'connected_at': project[7],
                    'last_verified': project[8]
                },
                'connections': connection_count,
                'security': {
                    'level': 'enterprise',
                    'features': ['hardware_breath', 'frequency_mapping', 'living_mutation', 'entanglement_defense']
                }
            })
        else:
            self.send_json_response({
                'status': 'not_found',
                'message': 'Project not found'
            }, 404)
        
        conn.close()
    
    def handle_auth_register(self):
        """Handle project registration"""
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            
            # Validate required fields
            required_fields = ['name', 'description']
            for field in required_fields:
                if field not in data:
                    self.send_json_response({'error': f'Missing field: {field}'}, 400)
                    return
            
            # Generate auth ID
            auth_id = str(uuid.uuid4())
            project_id = str(uuid.uuid4())
            
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            
            c.execute('''
                INSERT INTO projects (id, auth_id, name, description, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (project_id, auth_id, data['name'], data['description'], 'pending', datetime.now().isoformat()))
            
            conn.commit()
            conn.close()
            
            self.send_json_response({
                'status': 'success',
                'message': 'Project registered successfully',
                'auth_id': auth_id,
                'project_id': project_id
            })
            
        except json.JSONDecodeError:
            self.send_json_response({'error': 'Invalid JSON'}, 400)
    
    def handle_auth_confirm(self):
        """Confirm project connection"""
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            
            if 'auth_id' not in data:
                self.send_json_response({'error': 'Missing auth_id'}, 400)
                return
            
            auth_id = data['auth_id']
            
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            
            c.execute('SELECT * FROM projects WHERE auth_id = ?', (auth_id,))
            project = c.fetchone()
            
            if project:
                # Update to connected status
                c.execute('''
                    UPDATE projects 
                    SET status = 'connected', connected_at = ?
                    WHERE auth_id = ?
                ''', (datetime.now().isoformat(), auth_id))
                
                # Create connection record
                connection_id = str(uuid.uuid4())
                c.execute('''
                    INSERT INTO connections (id, project_id, session_id, ip_address, user_agent, connected_at, last_active)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    connection_id, project[0], str(uuid.uuid4()),
                    self.client_address[0], self.headers.get('User-Agent', ''),
                    datetime.now().isoformat(), datetime.now().isoformat()
                ))
                
                conn.commit()
                conn.close()
                
                self.send_json_response({
                    'status': 'success',
                    'message': 'Project connected successfully',
                    'connection_id': connection_id
                })
            else:
                conn.close()
                self.send_json_response({
                    'status': 'error',
                    'message': 'Invalid authentication ID'
                }, 404)
                
        except json.JSONDecodeError:
            self.send_json_response({'error': 'Invalid JSON'}, 400)
    
    def handle_user_info(self):
        """Handle user info request"""
        auth_header = self.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            self.send_json_response({'error': 'Unauthorized'}, 401)
            return
        
        # For demo purposes, return mock user data
        user_data = {
            'id': 'user_001',
            'email': 'user@example.com',
            'name': 'Demo User',
            'created_at': '2024-01-01T00:00:00Z'
        }
        
        self.send_json_response(user_data)
    
    def handle_dashboard_stats(self):
        """Handle dashboard stats request"""
        auth_header = self.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            self.send_json_response({'error': 'Unauthorized'}, 401)
            return
        
        # Mock dashboard stats
        stats = {
            'activeProjects': 3,
            'verificationsToday': 1247,
            'blockedThreats': 42,
            'apiUsage': 78
        }
        
        self.send_json_response(stats)
    
    def handle_projects_list(self):
        """Handle projects list request"""
        auth_header = self.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            self.send_json_response({'error': 'Unauthorized'}, 401)
            return
        
        # Mock projects list
        projects = [
            {
                'id': 'proj_001',
                'name': 'E-Commerce Site',
                'status': 'connected',
                'icon': 'fa-shopping-cart',
                'connectedAt': '2024-01-15T10:30:00Z'
            },
            {
                'id': 'proj_002',
                'name': 'Mobile Banking App',
                'status': 'connected',
                'icon': 'fa-mobile-alt',
                'connectedAt': '2024-01-14T14:20:00Z'
            },
            {
                'id': 'proj_003',
                'name': 'API Gateway',
                'status': 'pending',
                'icon': 'fa-server',
                'connectedAt': '2024-01-13T09:15:00Z'
            }
        ]
        
        self.send_json_response(projects)
    
    def handle_project_create(self):
        """Handle project creation request"""
        auth_header = self.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            self.send_json_response({'error': 'Unauthorized'}, 401)
            return
        
        # Read request body
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            self.send_json_response({'error': 'Empty request body'}, 400)
            return
        
        body = self.rfile.read(content_length)
        try:
            data = json.loads(body.decode('utf-8'))
        except json.JSONDecodeError:
            self.send_json_response({'error': 'Invalid JSON'}, 400)
            return
        
        # Validate required fields
        if 'name' not in data:
            self.send_json_response({'error': 'Missing project name'}, 400)
            return
        
        # Generate mock response
        import uuid
        project_id = f"proj_{uuid.uuid4().hex[:8]}"
        auth_id = f"auth_{uuid.uuid4().hex[:8]}"
        
        response = {
            'id': project_id,
            'name': data['name'],
            'status': 'pending',
            'authId': auth_id,
            'createdAt': datetime.now().isoformat()
        }
        
        self.send_json_response(response, 201)
    
    def send_json_response(self, data, status_code=200):
        """Send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = json.dumps(data, indent=2)
        self.wfile.write(response.encode('utf-8'))
    
    def log_message(self, format, *args):
        """Custom log message format"""
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

def start_server(port=8080):
    """Start the HTTP server"""
    # Initialize database
    init_db()
    
    # Create server
    handler = AstraRequestHandler
    handler.extensions_map = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.txt': 'text/plain',
    }
    
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"🚀 ASTRA Security Website running on port {port}")
        print(f"📁 Serving from: {os.getcwd()}")
        print(f"🔗 Authentication API available at /api/auth/*")
        print(f"💾 Database: {DB_PATH}")
        print("\nAvailable endpoints:")
        print("  GET  /api/auth/status?authId=<id>     - Check auth status")
        print("  GET  /api/auth/connect?authId=<id>    - Connect project")
        print("  GET  /api/auth/verify?authId=<id>     - Verify connection")
        print("  GET  /api/project/info?authId=<id>    - Get project info")
        print("  GET  /api/user/info                   - Get user info (Bearer token)")
        print("  GET  /api/dashboard/stats             - Get dashboard stats (Bearer token)")
        print("  GET  /api/projects/list               - List projects (Bearer token)")
        print("  POST /api/auth/register               - Register new project")
        print("  POST /api/auth/confirm                - Confirm connection")
        print("  POST /api/projects/create             - Create new project (Bearer token)")
        print("\nPress Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Shutting down ASTRA server...")
            httpd.shutdown()

if __name__ == "__main__":
    # Change to the directory containing the website files
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Get port from command line argument or use default
    import sys
    port = 8080
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"Invalid port: {sys.argv[1]}, using default port 8080")
    
    # Start server
    start_server(port)