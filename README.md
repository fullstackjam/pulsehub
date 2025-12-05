# PulseHub 🌐

PulseHub is a real-time hot topics aggregator that displays trending content from major social media platforms with **built-in Prometheus metrics** for monitoring and progressive delivery.

## Features ✨

- 🔥 Real-time hot topics from multiple platforms
- 📊 **Prometheus Metrics Endpoint** (`/metrics`)
- 🚀 **Progressive Delivery** with Argo Rollouts
- 📈 **Automated Canary Analysis** based on real metrics
- 🎨 Modern, responsive UI
- 🐳 Docker containerized
- ☸️ Kubernetes-ready with Helm charts

## Architecture

```
┌─────────────────────────────────────────┐
│          PulseHub Application           │
│  ┌──────────────────────────────────┐   │
│  │   Express.js Backend Server      │   │
│  │  • Serves React SPA              │   │
│  │  • Proxies API requests          │   │
│  │  • Exposes /metrics endpoint     │   │
│  │  • Records HTTP metrics          │   │
│  └──────────────────────────────────┘   │
│                  ↓                       │
│  ┌──────────────────────────────────┐   │
│  │   React Frontend (Static)        │   │
│  │  • Displays hot topics           │   │
│  │  • Responsive UI                 │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
              ↓
     Prometheus Scraping
              ↓
   ┌──────────────────────┐
   │  Argo Rollouts       │
   │  Analysis Engine     │
   └──────────────────────┘
```

## Exposed Metrics 📊

The `/metrics` endpoint provides Prometheus-format metrics:

- **`http_requests_total`** - Counter of HTTP requests
  - Labels: `method`, `route`, `status`, `service`
- **`http_request_duration_seconds`** - Histogram of request durations
  - Labels: `method`, `route`, `status`
- **Default Node.js metrics** (CPU, memory, GC, etc.)

## Quick Start 🚀

### Local Development

```bash
# Install dependencies
npm install

# Run frontend in dev mode
npm run dev

# Run backend server (serves built frontend + metrics)
npm run build
npm start

# Access the app
open http://localhost:80

# Check metrics
curl http://localhost:80/metrics
```

### Docker

```bash
# Build Docker image
docker build -t fullstackjam/pulsehub:latest .

# Run container
docker run -p 80:80 fullstackjam/pulsehub:latest

# Access metrics
curl http://localhost/metrics
```

### Kubernetes Deployment

```bash
# Install with Helm
helm install pulsehub ./helm/pulsehub -n pulsehub --create-namespace

# Check rollout status
kubectl argo rollouts get rollout pulsehub -n pulsehub --watch

# Verify metrics are being scraped
kubectl get servicemonitor -n pulsehub
```

## Configuration

### values.yaml Configuration

```yaml
# Enable ServiceMonitor for Prometheus
serviceMonitor:
  enabled: true
  interval: 30s
  scrapeTimeout: 10s
  labels:
    release: monitoring-system

# Canary Analysis Configuration
rollout:
  canary:
    analysis:
      enabled: true
      prometheusAddress: http://monitoring-system-kube-pro-prometheus.monitoring-system.svc.cluster.local:9090
      templates:
        - templateName: success-rate
        - templateName: latency
```

## Canary Analysis 🧪

With metrics enabled, Argo Rollouts automatically analyzes:

### Success Rate
```promql
http_requests_total{service="pulsehub",status!~"5.."}
/ 
http_requests_total{service="pulsehub"}
```
✅ Success condition: `>= 0.95` (95% success rate)

### Latency (P95)
```promql
histogram_quantile(0.95, 
  http_request_duration_seconds_bucket{service="pulsehub"}
)
```
✅ Success condition: `<= 500ms`

## Deployment Strategy

Progressive rollout with automated analysis:

1. **10%** traffic → Wait 2m + Analysis
2. **20%** traffic → Wait 2m + Analysis
3. **40%** traffic → Wait 2m + Analysis
4. **60%** traffic → Wait 2m + Analysis
5. **80%** traffic → Wait 2m + Analysis
6. **100%** traffic → Promotion

If analysis fails at any step, rollout automatically aborts and rolls back.

## Monitoring Integration

### Prometheus Target Discovery

The ServiceMonitor automatically configures Prometheus to scrape `/metrics`:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: pulsehub
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: pulsehub
  endpoints:
    - port: http
      path: /metrics
      interval: 30s
```

### Verify Metrics in Prometheus

```bash
# Port-forward to Prometheus
kubectl port-forward -n monitoring-system svc/monitoring-system-kube-pro-prometheus 9090:9090

# Open Prometheus UI
open http://localhost:9090

# Query metrics
http_requests_total{service="pulsehub"}
```

## API Endpoints

- `GET /` - React SPA
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics
- `GET /api/platforms` - List available platforms
- `GET /api/:platform/topics` - Get hot topics for platform

## Troubleshooting

### Metrics not appearing in Prometheus?

1. Check ServiceMonitor is created:
```bash
kubectl get servicemonitor -n pulsehub
```

2. Verify Prometheus is scraping:
```bash
kubectl get prometheus -A -o yaml | grep serviceMonitorSelector
```

3. Check ServiceMonitor labels match Prometheus selector

### Rollout stuck in analysis?

1. Check AnalysisRun status:
```bash
kubectl describe analysisrun -n pulsehub
```

2. Verify Prometheus endpoint is accessible:
```bash
kubectl exec -n pulsehub <pod-name> -- wget -O- http://monitoring-system-kube-pro-prometheus.monitoring-system.svc.cluster.local:9090/api/v1/query?query=up
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, Node.js 18
- **Metrics**: prom-client (Prometheus client)
- **Deployment**: Docker, Kubernetes, Helm
- **Progressive Delivery**: Argo Rollouts
- **Monitoring**: Prometheus, ServiceMonitor (Prometheus Operator)

## License

MIT License - see LICENSE file for details
