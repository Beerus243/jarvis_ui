import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs/promises";

async function navigateTo(page: Page, label: string) {
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page.getByRole("link", { name: label, exact: true }).click();
}

test("all seven routes render without console errors or horizontal overflow", async ({
  page,
}) => {
  test.setTimeout(900_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await fs.mkdir("artifacts", { recursive: true });
  for (const route of [
    "/",
    "/chat",
    "/tasks",
    "/agents",
    "/memory",
    "/system",
    "/settings",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText("Demo Core online")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Open navigation menu" }),
    ).toBeVisible();
    await page.screenshot({
      path: `artifacts/${route === "/" ? "dashboard" : route.slice(1)}-desktop.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const width of [1920, 1600, 1366, 900, 390]) {
      await page.setViewportSize({ width, height: width === 1366 ? 768 : 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} at ${width}px`,
      ).toBe(true);
    }
    await page.screenshot({
      path: `artifacts/${route === "/" ? "dashboard" : route.slice(1)}-mobile.png`,
      fullPage: true,
    });
    await page.setViewportSize({ width: 1366, height: 900 });
  }
  expect(errors).toEqual([]);
});

test("home opens as a focused voice space with task memos and hamburger navigation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Bonjour, Fabrice" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Speak to JARVIS" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Prepare Flutter environment/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Dashboard", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("link", { name: "Tasks", exact: true }).click();
  await expect(page.locator("h1")).toContainText("tasks");
});

test("voice demonstration completes Flutter and shares outcomes across routes", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("Demo Core online")).toBeVisible();
  await expect(page.getByText("JARVIS IS READY")).toBeVisible();
  await page
    .getByRole("button", { name: "Speak to JARVIS" })
    .click();
  await expect(
    page.getByRole("heading", { name: "I’m listening." }),
  ).toBeVisible();
  await expect(
    page.getByText("Your Flutter environment is ready.", { exact: true }),
  ).toBeVisible({ timeout: 25000 });
  await expect(page.getByText("JARVIS IS READY")).toBeVisible();
  await navigateTo(page, "Tasks");
  await page.getByRole("button", { name: "Completed", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Prepare Flutter environment" }),
  ).toBeVisible();
  await navigateTo(page, "Conversation");
  await expect(
    page.getByText("These are simulated results.", { exact: false }),
  ).toBeVisible();
});

test("confirmation decline and approval are distinct and update simulated Spotify only", async ({
  page,
}) => {
  await page.goto("/");
  await navigateTo(page, "Conversation");
  const composer = page.getByRole("textbox", { name: "Command for JARVIS" });
  await composer.fill("Close Spotify");
  await composer.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Cancel action" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await navigateTo(page, "System");
  await expect(page.getByText("NOW PLAYING · DEMO")).toBeVisible();
  await navigateTo(page, "Conversation");
  await page.getByRole("textbox", { name: "Command for JARVIS" }).fill("Close Spotify");
  await page.getByRole("textbox", { name: "Command for JARVIS" }).press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Confirm action" }).click();
  await navigateTo(page, "System");
  await expect(page.getByText("SPOTIFY · CLOSED")).toBeVisible();
  await page.screenshot({
    path: "artifacts/confirmation-complete.png",
    fullPage: true,
  });
});

test("search, task cancellation, agent inspection and persistent preferences work", async ({
  page,
}) => {
  await page.goto("/memory");
  await page
    .getByRole("textbox", { name: "Search memories" })
    .fill("soundtrack");
  await expect(page.locator(".memory-card")).toHaveCount(1);
  await navigateTo(page, "Agents");
  await page.getByRole("button", { name: "Inspect agent" }).first().click();
  await expect(page.getByRole("dialog")).toContainText("Environment Agent");
  await page.keyboard.press("Escape");
  await navigateTo(page, "Accueil");
  await navigateTo(page, "Tasks");
  await page.getByRole("button", { name: "Run scenario", exact: true }).first().click();
  await page.getByRole("button", { name: "Cancel task", exact: true }).click();
  await navigateTo(page, "Accueil");
  await expect(
    page.getByText("Task cancelled. Ready when you are."),
  ).toBeVisible();
  await navigateTo(page, "Settings");
  await page.getByRole("textbox", { name: "Your name" }).fill("Test user");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page
    .getByRole("switch", { name: "Reduce motion", exact: true })
    .click();
  await page.getByRole("switch", { name: "Enable voice interaction" }).click();
  await page.reload();
  await expect(page.getByRole("textbox", { name: "Your name" })).toHaveValue(
    "Test user",
  );
  await expect(
    page.getByRole("switch", { name: "Reduce motion", exact: true }),
  ).toBeChecked();
  await navigateTo(page, "Accueil");
  await expect(
    page.getByRole("heading", { name: "Bonjour, Test user" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Speak to JARVIS" }),
  ).toBeDisabled();
  await navigateTo(page, "Conversation");
  await expect(page.locator("h1")).toContainText("Conversation");
  await expect(
    page.getByRole("textbox", { name: "Command for JARVIS" }),
  ).toBeEnabled();
  await page.keyboard.press("Control+k");
  await expect(
    page.getByRole("textbox", { name: "Command for JARVIS" }),
  ).toBeFocused();
});
