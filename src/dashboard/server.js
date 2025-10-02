require('dotenv').config();
const app = require('./api');

const PORT = process.env.DASHBOARD_PORT || 3001;

app.listen(PORT, () => {
    console.log(`Dashboard API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

