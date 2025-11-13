import 'dotenv/config'
import { buildApp } from "./app.js";

const PORT = Number(process.env.PORT || 3000);

const start = async () => {
    const app = await buildApp();
    app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
    });
};

start().catch((e) => {
    console.error("Failed to start server", e);
    process.exit(1);
});
