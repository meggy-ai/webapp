"""
Gunicorn Configuration for Production Deployment
"""
import os
import multiprocessing

# Ensure production settings are used
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')

# Server socket
bind = "0.0.0.0:8000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2

# Restart workers after this many requests, with up to 50% jitter
max_requests = 1000
max_requests_jitter = 50

# Logging
accesslog = "-"  # Log to stdout
errorlog = "-"   # Log to stderr
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = 'bruno-pa-backend'

# Server mechanics
daemon = False
pidfile = '/tmp/gunicorn.pid'
user = None
group = None
tmp_upload_dir = None

# SSL (uncomment if using HTTPS)
# keyfile = '/path/to/keyfile'
# certfile = '/path/to/certfile'

# Environment variables for production
raw_env = [
    'DJANGO_SETTINGS_MODULE=config.settings.production',
]

# Preload app for better performance
preload_app = True

# Enable stdout/stderr capture
capture_output = True

# Worker lifecycle hooks
def on_starting(server):
    server.log.info("Starting Bruno PA Backend Server")

def on_reload(server):
    server.log.info("Reloading Bruno PA Backend Server")

def worker_int(worker):
    worker.log.info("Worker received INT or QUIT signal")

def pre_fork(server, worker):
    server.log.info("Worker spawned (pid: %s)", worker.pid)

def post_fork(server, worker):
    server.log.info("Worker spawned (pid: %s)", worker.pid)

def post_worker_init(worker):
    worker.log.info("Worker initialized (pid: %s)", worker.pid)

def worker_abort(worker):
    worker.log.info("Worker received SIGABRT signal")