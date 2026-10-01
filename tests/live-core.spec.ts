import { test, expect } from "@playwright/test";
import { jarvisEventSchema, type JarvisEvent } from "../lib/jarvis/events";

test("real Python Core telemetry, command reply and reconnection", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  const events: JarvisEvent[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("websocket", (socket) => {
    if (!socket.url().includes(":8765/ws")) return;
    socket.on("framereceived", ({ payload }) => {
      const parsed = jarvisEventSchema.safeParse(JSON.parse(String(payload)));
      if (parsed.success) events.push(parsed.data);
      else errors.push(`Invalid Core event: ${parsed.error.message}`);
    });
  });
  await page.goto("/system");
  await expect(
    page.getByText("V7.7 · Python Core", { exact: true }),
  ).toBeVisible({ timeout: 60_000 });
  expect(events.some((event) => event.type === "session.reset")).toBe(true);
  expect(
    events.some(
      (event) =>
        event.type === "system.updated" &&
        event.system.ramTotal != null &&
        event.system.ramTotal > 0,
    ),
  ).toBe(true);

  await page.goto("/chat");
  const input = page.getByRole("textbox", { name: "Command for JARVIS" });
  await expect(input).toBeEnabled({ timeout: 60_000 });
  const repliesBefore = await page.locator(".message-jarvis").count();
  await input.fill("liste mes tâches");
  await page.getByRole("button", { name: "Send command", exact: true }).click();
  await expect(page.locator(".message-jarvis")).toHaveCount(repliesBefore + 1, {
    timeout: 60_000,
  });
  const reply = await page
    .locator(".message-jarvis .message-body > p")
    .last()
    .innerText();
  expect(reply).toMatch(
    /Aucune tâche enregistrée|— (PLANNED|RUNNING|WAITING_CONFIRMATION|COMPLETED|FAILED|CANCELLED|PAUSED)/,
  );
  expect(reply).not.toContain("Commande reçue :");
  await page.reload();
  await expect(
    page.locator(".message-jarvis .message-body > p").last(),
  ).toHaveText(reply);
  await page.goto("/");
  await expect(
    page.getByRole("textbox", { name: "Écrire une commande pour JARVIS" }),
  ).toBeEnabled();
  await expect(page.getByText("Last command", { exact: true })).toBeVisible();
  for (const width of [1366, 390]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});
