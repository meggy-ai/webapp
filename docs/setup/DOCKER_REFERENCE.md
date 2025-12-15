# Docker Development Quick Reference

## Starting and Stopping

```bash
# Start all services (foreground)
docker-compose up

# Start all services (background)
docker-compose up -d

# Start and rebuild containers
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v

# Stop specific service
docker-compose stop backend
docker-compose stop frontend

# Start specific service
docker-compose start backend
docker-compose start frontend

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

## Viewing Logs

```bash
# View all logs
docker-compose logs

# Follow logs (live tail)
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Follow specific service logs
docker-compose logs -f backend

# View last N lines
docker-compose logs --tail=100 backend
```

## Container Management

```bash
# List running containers
docker-compose ps

# View container details
docker-compose ps -a

# Execute command in running container
docker-compose exec backend <command>
docker-compose exec frontend <command>

# Open shell in container
docker-compose exec backend bash
docker-compose exec frontend sh

# Run one-off command
docker-compose run --rm backend python manage.py <command>
```

## Django Management Commands

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Create migrations
docker-compose exec backend python manage.py makemigrations

# Django shell
docker-compose exec backend python manage.py shell

# Database shell
docker-compose exec backend python manage.py dbshell

# Collect static files
docker-compose exec backend python manage.py collectstatic --no-input

# Create test user
docker-compose exec backend python scripts/create_test_user.py

# Run tests
docker-compose exec backend pytest
```

## Frontend Commands

```bash
# Install npm packages
docker-compose exec frontend npm install <package>

# Run npm scripts
docker-compose exec frontend npm run <script>

# Lint code
docker-compose exec frontend npm run lint

# Format code
docker-compose exec frontend npm run format

# Run tests
docker-compose exec frontend npm test
```

## Database Operations

```bash
# Access PostgreSQL directly
docker-compose exec postgres psql -U postgres -d bruno_pa

# Backup database
docker-compose exec postgres pg_dump -U postgres bruno_pa > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres bruno_pa < backup.sql

# View database logs
docker-compose logs postgres
```

## Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect docker_postgres_data

# Remove all volumes (WARNING: deletes all data)
docker-compose down -v

# Remove specific volume
docker volume rm docker_postgres_data
```

## Network Management

```bash
# List networks
docker network ls

# Inspect network
docker network inspect docker_bruno-network

# View connected containers
docker network inspect docker_bruno-network | grep Name
```

## Debugging

```bash
# View container resource usage
docker stats

# Inspect container
docker inspect bruno-pa-backend
docker inspect bruno-pa-frontend

# View container environment variables
docker-compose exec backend env
docker-compose exec frontend env

# Test network connectivity
docker-compose exec backend ping postgres
docker-compose exec frontend ping backend

# Check open ports
docker-compose exec backend netstat -tulpn
```

## Rebuilding

```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild without cache
docker-compose build --no-cache

# Pull latest base images
docker-compose pull
```

## Cleanup

```bash
# Remove stopped containers
docker-compose rm

# Remove all containers, networks, volumes
docker-compose down -v --remove-orphans

# Remove all unused Docker resources
docker system prune -a --volumes

# Remove only dangling images
docker image prune
```

## Common Workflows

### Fresh Start

```bash
# Complete reset
docker-compose down -v
docker-compose up --build

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

### Update Dependencies

```bash
# Backend
docker-compose build backend
docker-compose up -d backend

# Frontend
docker-compose exec frontend npm install
docker-compose restart frontend
```

### View All Service Status

```bash
docker-compose ps
docker-compose logs --tail=50
```

### Debug Backend Issues

```bash
docker-compose logs -f backend
docker-compose exec backend python manage.py check
docker-compose exec backend python manage.py shell
```

### Debug Frontend Issues

```bash
docker-compose logs -f frontend
docker-compose exec frontend npm run lint
docker-compose exec frontend sh
```

## Environment-Specific Commands

### Windows

```powershell
# View logs in PowerShell
docker-compose logs | Out-Host -Paging

# Copy files from container
docker cp bruno-pa-backend:/app/file.txt .

# Set environment variable temporarily
$env:OPENAI_API_KEY="sk-..."
docker-compose up
```

### macOS/Linux

```bash
# Follow logs with color
docker-compose logs -f --tail=100 | less -R

# Copy files from container
docker cp bruno-pa-backend:/app/file.txt .

# Set environment variable temporarily
OPENAI_API_KEY="sk-..." docker-compose up
```

## Pro Tips

1. **Use `.env` file:** Store all configuration in `docker/.env`
2. **Watch mode:** Keep logs open: `docker-compose logs -f`
3. **Quick restart:** Use `docker-compose restart <service>` instead of down/up
4. **Shell aliases:** Create shortcuts for frequently used commands
5. **Background mode:** Run with `-d` flag to keep terminal free
6. **Health checks:** Wait for services: `docker-compose ps` shows health status
7. **Cleanup regularly:** Run `docker system prune` to free disk space

## Useful Aliases

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, or PowerShell profile):

```bash
# Bash/Zsh
alias dcu='docker-compose up'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
alias dcb='docker-compose exec backend'
alias dcf='docker-compose exec frontend'
alias dcp='docker-compose ps'

# PowerShell
Set-Alias -Name dcu -Value 'docker-compose up'
Set-Alias -Name dcd -Value 'docker-compose down'
```

## Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker CLI Reference](https://docs.docker.com/engine/reference/commandline/docker/)
- [Django in Docker Best Practices](https://docs.docker.com/samples/django/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
