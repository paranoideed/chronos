import 'dotenv/config';
import { buildApp } from './app.js';
import { connectDB } from './config/db.js';

const app = buildApp();
const PORT = process.env.PORT;

async function startServer() {
    try {
        // --- Connect to DB ---
        await connectDB();

        // --- Start server ---
        app.listen(PORT, () => {
            console.log(`Server is listening on http://localhost:${PORT}`);
        })
    } catch (err) {
        console.error('Failed to start server', err);
        process.exit(1);
    }
}

startServer();