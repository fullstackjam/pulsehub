import express from 'express';
import promClient from 'prom-client';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;

// Enable CORS
app.use(cors());
app.use(express.json());

// Create a Registry to register metrics
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5]
});

const httpRequestTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status', 'service']
});

// Register custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestTotal);

// Middleware to record metrics
app.use((req, res, next) => {
    const start = Date.now();

    // Record response
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route ? req.route.path : req.path;

        httpRequestDurationMicroseconds
            .labels(req.method, route, res.statusCode.toString())
            .observe(duration);

        httpRequestTotal
            .labels(req.method, route, res.statusCode.toString(), 'pulsehub')
            .inc();
    });

    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// API proxy endpoints (for fetching hot topics)
app.get('/api/platforms', async (req, res) => {
    try {
        // Replace with actual API calls to platforms
        const platforms = [
            { id: 'weibo', name: '微博', enabled: true },
            { id: 'douyin', name: '抖音', enabled: true },
            { id: 'bilibili', name: '哔哩哔哩', enabled: true },
        ];
        res.json(platforms);
    } catch (error) {
        console.error('Error fetching platforms:', error);
        res.status(500).json({ error: 'Failed to fetch platforms' });
    }
});

app.get('/api/:platform/topics', async (req, res) => {
    try {
        const { platform } = req.params;

        // Fetch from actual API (using the 60s API or similar)
        const apiUrl = `https://api.vvhan.com/api/hotlist?type=${platform}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        console.error(`Error fetching topics for ${req.params.platform}:`, error);
        res.status(500).json({ error: 'Failed to fetch topics' });
    }
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📊 Metrics available at http://localhost:${PORT}/metrics`);
    console.log(`🏥 Health check at http://localhost:${PORT}/health`);
});
