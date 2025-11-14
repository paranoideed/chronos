import 'dotenv/config';
import App from './app.js';

const PORT = Number(process.env.PORT ?? 3000);
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('MONGO_URI is not set');
    process.exit(1);
}

const start = async () => {
    const app = new App(MONGO_URI);
    await app.startHttpServer(PORT);
};

start().catch((e) => {
    console.error('Failed to start server', e);
    process.exit(1);
});