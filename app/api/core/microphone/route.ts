import { execFile } from "node:child_process";
import { promisify } from "node:util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);
const serviceName = "jarvis.service";
const loopbackHosts = new Set(["localhost", "127.0.0.1", "::1"]);

function isLoopbackRequest(request: Request) {
  const host = request.headers.get("host");
  if (!host) return false;

  try {
    const requestHost = new URL(`http://${host}`).hostname;
    if (!loopbackHosts.has(requestHost)) return false;

    const origin = request.headers.get("origin");
    if (!origin) return request.method === "GET";
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function getServiceStatus() {
  try {
    const { stdout } = await execFileAsync(
      "systemctl",
      ["--user", "is-active", serviceName],
      { encoding: "utf8", timeout: 5000 },
    );
    return stdout.trim();
  } catch (error) {
    const output =
      typeof error === "object" && error !== null && "stdout" in error
        ? String(error.stdout).trim()
        : "";
    if (["inactive", "failed", "activating", "deactivating"].includes(output))
      return output;
    throw new Error("Unable to read the local JARVIS service status.");
  }
}

export async function GET(request: Request) {
  if (!isLoopbackRequest(request))
    return Response.json({ error: "Local access only." }, { status: 403 });
  if (process.platform !== "linux")
    return Response.json({ error: "Systemd control is Linux-only." }, { status: 501 });

  try {
    return Response.json(
      { status: await getServiceStatus() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Core status unavailable." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  if (!isLoopbackRequest(request))
    return Response.json({ error: "Local access only." }, { status: 403 });
  if (process.platform !== "linux")
    return Response.json({ error: "Systemd control is Linux-only." }, { status: 501 });

  let action: unknown;
  try {
    ({ action } = await request.json());
  } catch {
    return Response.json({ error: "Expected a JSON action." }, { status: 400 });
  }
  if (action !== "start" && action !== "stop")
    return Response.json({ error: "Action must be start or stop." }, { status: 400 });

  try {
    await execFileAsync(
      "systemctl",
      ["--user", action, "--no-block", serviceName],
      { encoding: "utf8", timeout: 5000 },
    );
    return Response.json(
      { status: await getServiceStatus() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Core control failed." },
      { status: 503 },
    );
  }
}
