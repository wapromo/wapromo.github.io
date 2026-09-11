const url = process.env.KEEP_ALIVE_URL;
const intervalMs = 3 * 60 * 1000;
const timeoutMs = 15 * 1000;

if (!url) {
  console.error("Missing KEEP_ALIVE_URL, for example: https://wapromo-api.onrender.com/api/health");
  process.exit(1);
}

const ping = async () => {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { "user-agent": "WAPROMO-keep-alive/1.0" } });
    console.log(`[${new Date().toISOString()}] ${response.status} ${response.statusText} (${Date.now() - startedAt} ms)`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] keep-alive failed:`, error instanceof Error ? error.message : error);
  } finally {
    clearTimeout(timeout);
  }
};

await ping();
setInterval(ping, intervalMs);
