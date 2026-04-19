import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { StringEnum } from "@mariozechner/pi-ai";
import { flows } from "./flows";
import { quizzes } from "./quizzes";
import { comparisons } from "./comparisons";
import { analogies } from "./analogies";

export default function (pi: ExtensionAPI) {
  // ── Progress tracking ──
  let progress: Record<string, { viewed: boolean; quizScore?: number }> = {};

  pi.on("session_start", async (_event, ctx) => {
    progress = {};
    for (const entry of ctx.sessionManager.getEntries()) {
      if (entry.type === "custom" && entry.customType === "oauth-progress") {
        progress = (entry as any).data ?? {};
      }
    }
  });

  function saveProgress() {
    pi.appendEntry("oauth-progress", progress);
  }

  function markViewed(topic: string) {
    if (!progress[topic]) progress[topic] = { viewed: false };
    progress[topic].viewed = true;
    saveProgress();
  }

  function saveQuizScore(topic: string, score: number) {
    if (!progress[topic]) progress[topic] = { viewed: false };
    progress[topic].quizScore = score;
    saveProgress();
  }

  // ── /oauth command: main menu ──
  pi.registerCommand("oauth", {
    description: "Interactive OAuth 2.0 learning — flows, visualizations, quizzes",
    handler: async (args, ctx) => {
      if (args && args.trim()) {
        // Direct topic jump: /oauth delegated, /oauth credentials, /oauth multi-tenant
        const key = matchTopic(args.trim());
        if (key) {
          await showFlow(key, ctx);
          return;
        }
      }
      await mainMenu(ctx);
    },
  });

  // ── /oauth-quiz command ──
  pi.registerCommand("oauth-quiz", {
    description: "Test your OAuth 2.0 knowledge",
    handler: async (args, ctx) => {
      const key = args?.trim() ? matchTopic(args.trim()) : null;
      if (key) {
        await runQuiz(key, ctx);
      } else {
        const choice = await ctx.ui.select("Pick a quiz topic:", [
          "delegated — Authorization Code (Single-Tenant)",
          "credentials — Client Credentials (Single-Tenant)",
          "multi-tenant — Multi-Tenant OAuth",
          "all — Combined Quiz (all topics)",
        ]);
        if (!choice) return;
        const selected = choice.split(" — ")[0].trim();
        await runQuiz(selected, ctx);
      }
    },
  });

  // ── /oauth-analogy command ──
  pi.registerCommand("oauth-analogy", {
    description: "Understand OAuth 2.0 through a Government & Travel Agency analogy",
    handler: async (args, ctx) => {
      if (args && args.trim()) {
        const key = matchTopic(args.trim());
        if (key) {
          markViewed(key);
          ctx.ui.notify(analogies[key] ?? analogies.overview, "info");
          return;
        }
      }
      // Show overview first, then let them pick a specific flow
      ctx.ui.notify(analogies.overview, "info");
      const choice = await ctx.ui.select("Dive into a specific flow analogy:", [
        "🏨 Delegated — Book a Hotel Room FOR Me",
        "🤖 Client Credentials — The Automated Cleaning Service",
        "🌍 Multi-Tenant — The Agency Goes International",
      ]);
      if (!choice) return;
      if (choice.includes("Delegated")) {
        markViewed("delegated");
        ctx.ui.notify(analogies.delegated, "info");
      } else if (choice.includes("Client")) {
        markViewed("credentials");
        ctx.ui.notify(analogies.credentials, "info");
      } else if (choice.includes("Multi")) {
        markViewed("multi-tenant");
        ctx.ui.notify(analogies["multi-tenant"], "info");
      }
    },
  });

  // ── /oauth-compare command ──
  pi.registerCommand("oauth-compare", {
    description: "Side-by-side comparison of OAuth 2.0 flows",
    handler: async (_args, ctx) => {
      const choice = await ctx.ui.select("Compare:", [
        "delegated-vs-credentials — Delegated vs Client Credentials",
        "single-vs-multi — Single-Tenant vs Multi-Tenant",
        "all — Full Comparison Matrix",
      ]);
      if (!choice) return;
      const key = choice.split(" — ")[0].trim();
      showComparison(key, ctx);
    },
  });

  // ── /oauth-progress command ──
  pi.registerCommand("oauth-progress", {
    description: "View your OAuth 2.0 learning progress",
    handler: async (_args, ctx) => {
      showProgress(ctx);
    },
  });

  // ── Custom tool for LLM ──
  pi.registerTool({
    name: "oauth_learn",
    label: "OAuth Learn",
    description:
      "Show OAuth 2.0 flow visualizations, comparisons, or quizzes. Use when the user asks about OAuth concepts.",
    promptSnippet: "Show OAuth 2.0 flow diagrams, comparisons, and quizzes",
    promptGuidelines: [
      "Use oauth_learn when the user asks about OAuth 2.0 flows, authentication concepts, or wants to visualize auth flows.",
    ],
    parameters: Type.Object({
      action: StringEnum(["flow", "compare", "quiz", "progress"] as const),
      topic: Type.Optional(
        StringEnum(["delegated", "credentials", "multi-tenant", "all"] as const)
      ),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const topic = params.topic ?? "delegated";
      let text = "";
      switch (params.action) {
        case "flow":
          text = flows[topic] ?? flows.delegated;
          // Append the analogy for richer context
          if (analogies[topic]) {
            text += "\n\n" + analogies[topic];
          }
          markViewed(topic);
          break;
        case "compare":
          text =
            topic === "all"
              ? comparisons["all"]
              : topic === "credentials"
                ? comparisons["delegated-vs-credentials"]
                : comparisons["single-vs-multi"];
          break;
        case "quiz":
          text = `Use /oauth-quiz ${topic} to run the interactive quiz.`;
          break;
        case "progress":
          text = formatProgress();
          break;
      }
      return { content: [{ type: "text", text }], details: {} };
    },
  });

  // ── Helpers ──

  function matchTopic(input: string): string | null {
    const lower = input.toLowerCase();
    if (lower.includes("delegat") || lower.includes("auth code") || lower.includes("authorization"))
      return "delegated";
    if (lower.includes("credential") || lower.includes("client")) return "credentials";
    if (lower.includes("multi")) return "multi-tenant";
    if (lower === "all") return "all";
    return null;
  }

  async function mainMenu(ctx: any) {
    const choice = await ctx.ui.select("🔐 OAuth 2.0 Learning Hub", [
      "📘 Learn: Authorization Code Flow (Delegated, Single-Tenant)",
      "📘 Learn: Client Credentials Flow (Single-Tenant)",
      "📘 Learn: Multi-Tenant OAuth",
      "🏨 Analogy: Understand via Government & Travel Story",
      "🔀 Compare Flows Side-by-Side",
      "🧪 Take a Quiz",
      "📊 View Progress",
    ]);
    if (!choice) return;

    if (choice.includes("Authorization Code")) {
      await showFlow("delegated", ctx);
    } else if (choice.includes("Client Credentials")) {
      await showFlow("credentials", ctx);
    } else if (choice.includes("Multi-Tenant")) {
      await showFlow("multi-tenant", ctx);
    } else if (choice.includes("Analogy")) {
      ctx.ui.notify(analogies.overview, "info");
      const sub = await ctx.ui.select("Pick a flow analogy:", [
        "delegated — Book a Hotel Room FOR Me",
        "credentials — The Automated Cleaning Service",
        "multi-tenant — The Agency Goes International",
      ]);
      if (sub) {
        const key = sub.split(" — ")[0].trim();
        markViewed(key);
        ctx.ui.notify(analogies[key], "info");
      }
    } else if (choice.includes("Compare")) {
      const cmp = await ctx.ui.select("Compare:", [
        "delegated-vs-credentials — Delegated vs Client Credentials",
        "single-vs-multi — Single-Tenant vs Multi-Tenant",
        "all — Full Comparison Matrix",
      ]);
      if (cmp) showComparison(cmp.split(" — ")[0].trim(), ctx);
    } else if (choice.includes("Quiz")) {
      const q = await ctx.ui.select("Quiz topic:", [
        "delegated",
        "credentials",
        "multi-tenant",
        "all",
      ]);
      if (q) await runQuiz(q, ctx);
    } else if (choice.includes("Progress")) {
      showProgress(ctx);
    }
  }

  async function showFlow(key: string, ctx: any) {
    const content = flows[key];
    if (!content) {
      ctx.ui.notify(`Unknown topic: ${key}`, "error");
      return;
    }
    markViewed(key);
    ctx.ui.notify(content, "info");

    // Offer next steps
    const next = await ctx.ui.select("What next?", [
      "🧪 Quiz me on this topic",
      "🔀 Compare with another flow",
      "📘 Learn another flow",
      "✅ Done",
    ]);
    if (!next || next.includes("Done")) return;
    if (next.includes("Quiz")) await runQuiz(key, ctx);
    else if (next.includes("Compare")) {
      const cmp = await ctx.ui.select("Compare:", [
        "delegated-vs-credentials",
        "single-vs-multi",
        "all",
      ]);
      if (cmp) showComparison(cmp, ctx);
    } else if (next.includes("Learn")) await mainMenu(ctx);
  }

  async function runQuiz(topic: string, ctx: any) {
    const questions = topic === "all"
      ? [...quizzes.delegated, ...quizzes.credentials, ...quizzes["multi-tenant"]]
      : quizzes[topic] ?? [];

    if (questions.length === 0) {
      ctx.ui.notify("No quiz available for this topic.", "warn");
      return;
    }

    let correct = 0;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const answer = await ctx.ui.select(
        `[${i + 1}/${questions.length}] ${q.question}`,
        q.options
      );
      if (!answer) {
        ctx.ui.notify("Quiz cancelled.", "warn");
        return;
      }
      if (answer === q.options[q.correct]) {
        correct++;
        ctx.ui.notify(`✅ Correct! ${q.explanation}`, "success");
      } else {
        ctx.ui.notify(
          `❌ Wrong — correct answer: ${q.options[q.correct]}\n${q.explanation}`,
          "warn"
        );
      }
    }

    const pct = Math.round((correct / questions.length) * 100);
    const msg = `\n🏆 Score: ${correct}/${questions.length} (${pct}%)` +
      (pct === 100 ? " — Perfect! 🎉" : pct >= 70 ? " — Great job!" : " — Keep studying!");
    ctx.ui.notify(msg, pct >= 70 ? "success" : "info");
    saveQuizScore(topic, pct);
  }

  function showComparison(key: string, ctx: any) {
    const content = comparisons[key];
    if (!content) {
      ctx.ui.notify(`Unknown comparison: ${key}`, "error");
      return;
    }
    ctx.ui.notify(content, "info");
  }

  function formatProgress(): string {
    const topics = ["delegated", "credentials", "multi-tenant"];
    let lines = ["📊 OAuth 2.0 Learning Progress", "═".repeat(40)];
    for (const t of topics) {
      const p = progress[t];
      const viewed = p?.viewed ? "✅" : "⬜";
      const quiz = p?.quizScore != null ? `${p.quizScore}%` : "—";
      lines.push(`  ${viewed} ${t.padEnd(16)} Quiz: ${quiz}`);
    }
    lines.push("═".repeat(40));
    return lines.join("\n");
  }

  function showProgress(ctx: any) {
    ctx.ui.notify(formatProgress(), "info");
  }
}
