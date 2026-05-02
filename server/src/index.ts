/**
 * Election Assistant API Server Entry Point
 * Built with Google Antigravity & Vertex AI
 *
 * Starts the Express server on the configured port.
 * Deployed to Google Cloud Run.
 */
import app from './app';

const PORT = parseInt(process.env.PORT || '8080', 10);

app.listen(PORT, () => {
  console.log(`[Election Assistant] Server running on port ${PORT}`);
  console.log(`[Election Assistant] Platform: Google Antigravity & Vertex AI`);
  console.log(`[Election Assistant] Health check: http://localhost:${PORT}/api/health`);
});
