import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { StringEnum } from "@mariozechner/pi-ai";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";

export default function (pi: ExtensionAPI) {

  // ── /blog command: main hub ──
  pi.registerCommand("blog", {
    description: "Blog writing assistant — outline, draft, review, or polish a blog post",
    handler: async (args, ctx) => {
      if (args?.trim()) {
        // Direct subcommand: /blog outline, /blog review path, etc.
        const parts = args.trim().split(/\s+/);
        const sub = parts[0].toLowerCase();
        const rest = parts.slice(1).join(" ");
        if (sub === "outline") { await outlineFlow(rest, ctx); return; }
        if (sub === "review") { await reviewFlow(rest, ctx); return; }
        if (sub === "polish") { await polishFlow(rest, ctx); return; }
        if (sub === "list") { listBlogs(ctx); return; }
        // Treat as a topic for new outline
        await outlineFlow(args.trim(), ctx);
        return;
      }
      await mainMenu(ctx);
    },
  });

  // ── /blog-outline command ──
  pi.registerCommand("blog-outline", {
    description: "Generate a structured outline for a blog post on a given topic",
    handler: async (args, ctx) => {
      await outlineFlow(args?.trim() || "", ctx);
    },
  });

  // ── /blog-review command ──
  pi.registerCommand("blog-review", {
    description: "Review a blog post draft for clarity, structure, and readability",
    handler: async (args, ctx) => {
      await reviewFlow(args?.trim() || "", ctx);
    },
  });

  // ── /blog-polish command ──
  pi.registerCommand("blog-polish", {
    description: "Final polish pass — tighten prose, fix flow, add transitions",
    handler: async (args, ctx) => {
      await polishFlow(args?.trim() || "", ctx);
    },
  });

  // ── LLM tool ──
  pi.registerTool({
    name: "blog_assist",
    label: "Blog Assistant",
    description:
      "Help write, outline, review, or polish blog posts. Use when the user asks to write a blog, create an outline, review a draft, or improve blog writing.",
    promptSnippet: "Outline, draft, review, or polish blog posts",
    promptGuidelines: [
      "Use blog_assist when the user asks to write a blog, outline a topic, review a draft, or polish writing.",
    ],
    parameters: Type.Object({
      action: StringEnum(["outline", "review", "polish", "tips"] as const),
      topic: Type.Optional(Type.String({ description: "Blog topic or file path to an existing draft" })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      let text = "";
      switch (params.action) {
        case "outline":
          text = generateOutlinePrompt(params.topic || "");
          break;
        case "review":
          text = generateReviewChecklist(params.topic || "");
          break;
        case "polish":
          text = generatePolishChecklist();
          break;
        case "tips":
          text = WRITING_TIPS;
          break;
      }
      return { content: [{ type: "text", text }], details: {} };
    },
  });

  // ── Main Menu ──
  async function mainMenu(ctx: any) {
    const choice = await ctx.ui.select("✍️  Blog Writing Assistant", [
      "📝 New Outline — generate a structured outline for a topic",
      "📖 Review Draft — check clarity, structure, readability",
      "✨ Polish — final pass for flow, transitions, tightening",
      "📂 List Blogs — find existing blog drafts",
      "💡 Writing Tips — quick reference for good blog writing",
    ]);
    if (!choice) return;

    if (choice.includes("Outline")) await outlineFlow("", ctx);
    else if (choice.includes("Review")) await reviewFlow("", ctx);
    else if (choice.includes("Polish")) await polishFlow("", ctx);
    else if (choice.includes("List")) listBlogs(ctx);
    else if (choice.includes("Tips")) ctx.ui.notify(WRITING_TIPS, "info");
  }

  // ── Outline Flow ──
  async function outlineFlow(topic: string, ctx: any) {
    if (!topic) {
      topic = await ctx.ui.input("What's the blog topic?", "e.g., How OAuth 2.0 works in Azure") || "";
      if (!topic) return;
    }

    const audience = await ctx.ui.select("Who's the audience?", [
      "Beginners — no assumptions about prior knowledge",
      "Intermediate — knows the basics, wants depth",
      "Advanced — deep dive for practitioners",
      "Mixed — accessible but with depth for those who want it",
    ]);
    if (!audience) return;

    const tone = await ctx.ui.select("What tone?", [
      "Conversational — like explaining to a friend",
      "Tutorial — step-by-step, hands-on",
      "Storytelling — analogy-driven, narrative",
      "Technical — precise, reference-style",
    ]);
    if (!tone) return;

    const length = await ctx.ui.select("Target length?", [
      "Short (800-1200 words) — focused, single concept",
      "Medium (1500-2500 words) — thorough but digestible",
      "Long (3000+ words) — comprehensive guide",
    ]);
    if (!length) return;

    const outline = generateOutline(topic, audience!, tone!, length!);
    ctx.ui.notify(outline, "info");

    const next = await ctx.ui.select("What next?", [
      "📝 Start writing — generate a draft from this outline",
      "🔄 Adjust outline — change something",
      "💾 Save outline — keep it for later",
      "✅ Done",
    ]);
    if (!next || next.includes("Done")) return;
    if (next.includes("Start writing")) {
      ctx.ui.notify("💡 Use the outline above as a guide. Start writing your draft in a .md file, then run /blog-review when ready.", "info");
    }
  }

  // ── Review Flow ──
  async function reviewFlow(path: string, ctx: any) {
    if (!path) {
      path = await ctx.ui.input("Path to blog draft (.md file):", "e.g., blogs/my-post.md") || "";
      if (!path) return;
    }

    const fullPath = join(ctx.cwd, path);
    if (!existsSync(fullPath)) {
      ctx.ui.notify(`File not found: ${path}`, "error");
      return;
    }

    const content = readFileSync(fullPath, "utf-8");
    const review = reviewDraft(content);
    ctx.ui.notify(review, "info");
  }

  // ── Polish Flow ──
  async function polishFlow(path: string, ctx: any) {
    if (!path) {
      path = await ctx.ui.input("Path to blog draft (.md file):", "e.g., blogs/my-post.md") || "";
      if (!path) return;
    }

    const fullPath = join(ctx.cwd, path);
    if (!existsSync(fullPath)) {
      ctx.ui.notify(`File not found: ${path}`, "error");
      return;
    }

    const content = readFileSync(fullPath, "utf-8");
    const checklist = polishDraft(content);
    ctx.ui.notify(checklist, "info");
  }

  // ── List Blogs ──
  function listBlogs(ctx: any) {
    const blogDirs = ["blogs", "blog", "posts", "_posts", "content", "articles"];
    let found: string[] = [];

    for (const dir of blogDirs) {
      const full = join(ctx.cwd, dir);
      if (existsSync(full)) {
        try {
          const files = readdirSync(full).filter((f: string) => f.endsWith(".md"));
          found.push(...files.map((f: string) => `${dir}/${f}`));
        } catch {}
      }
    }

    // Also check current dir
    try {
      const here = readdirSync(ctx.cwd).filter((f: string) => f.endsWith(".md") && f !== "README.md");
      found.push(...here);
    } catch {}

    if (found.length === 0) {
      ctx.ui.notify("No blog drafts found. Create a .md file or put drafts in a blogs/ directory.", "info");
    } else {
      ctx.ui.notify(`📂 Found ${found.length} blog file(s):\n\n${found.map(f => `  • ${f}`).join("\n")}`, "info");
    }
  }

  // ── Generators ──

  function generateOutline(topic: string, audience: string, tone: string, length: string): string {
    const audienceKey = audience.split(" — ")[0];
    const toneKey = tone.split(" — ")[0];
    const lengthKey = length.split(" (")[0];

    return `
╔══════════════════════════════════════════════════════════════════════╗
║  📝 BLOG OUTLINE                                                    ║
╚══════════════════════════════════════════════════════════════════════╝

  Topic:    ${topic}
  Audience: ${audienceKey}
  Tone:     ${toneKey}
  Length:   ${lengthKey}

═══════════════════════════════════════════════════════════════════════
  SUGGESTED STRUCTURE
═══════════════════════════════════════════════════════════════════════

  1. HOOK (2-3 sentences)
     ─────────────────────────────────────────────────
     Start with a pain point, surprising fact, or relatable
     scenario. NOT "In this article, we will explore..."

     Try: "You've probably seen [common situation]. Here's what's
     actually happening under the hood."

  2. THE PROBLEM / CONTEXT (1-2 paragraphs)
     ─────────────────────────────────────────────────
     Why does this topic matter? What goes wrong without this
     knowledge? Set up WHY the reader should care.

  3. THE CORE CONCEPT (main body)
     ─────────────────────────────────────────────────
     ${toneKey === "Storytelling"
       ? "Use an analogy or narrative to introduce the concept.\n     Make the abstract concrete before showing the real version."
       : toneKey === "Tutorial"
       ? "Step-by-step walkthrough with code examples.\n     Each step should be copy-pasteable and testable."
       : "Explain the concept clearly, building from simple to complex."}

     Break into 2-4 sub-sections with clear headers.
     Each section should answer ONE question.

  4. PRACTICAL APPLICATION (1-3 sections)
     ─────────────────────────────────────────────────
     Show real code, real config, real commands.
     ${audienceKey === "Beginners"
       ? "Explain every parameter. Assume nothing."
       : "Focus on the non-obvious parts. Skip the boilerplate."}

  5. COMMON MISTAKES / GOTCHAS (3-5 bullets)
     ─────────────────────────────────────────────────
     What do people get wrong? What bit YOU when you learned this?
     These are often the most valuable part of the post.

  6. SUMMARY / MENTAL MODEL (2-4 sentences)
     ─────────────────────────────────────────────────
     Give the reader a framework they can carry in their head.
     "If you remember nothing else, remember: ..."

  7. CALL TO ACTION (optional, 1-2 sentences)
     ─────────────────────────────────────────────────
     Link to further reading, a tool, a repo, or next steps.

═══════════════════════════════════════════════════════════════════════
  WRITING REMINDERS
═══════════════════════════════════════════════════════════════════════

  ✅ First sentence of each section should be a standalone summary
  ✅ Use concrete examples instead of abstract explanations
  ✅ Tables > walls of text for comparisons
  ✅ One idea per paragraph
  ✅ Read each section aloud — if you stumble, rewrite
  ✅ Cut 20% on your final pass. Seriously.
`;
  }

  function generateOutlinePrompt(topic: string): string {
    if (!topic) return "Provide a topic to generate an outline. Usage: blog_assist(action: 'outline', topic: 'your topic')";
    return `Generate a blog outline for: "${topic}"\n\nUse /blog-outline for the interactive version with audience/tone/length selection.`;
  }

  function generateReviewChecklist(topic: string): string {
    return `Use /blog-review with a file path for a full review. This tool works best when the LLM reviews the actual content.`;
  }

  function generatePolishChecklist(): string {
    return POLISH_CHECKLIST;
  }

  function reviewDraft(content: string): string {
    const lines = content.split("\n");
    const wordCount = content.split(/\s+/).length;
    const headers = lines.filter(l => l.match(/^#{1,3}\s/));
    const codeBlocks = (content.match(/```/g) || []).length / 2;
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
    const longParas = paragraphs.filter(p => p.split(/\s+/).length > 150);
    const firstLine = lines.find(l => l.trim() && !l.startsWith("#"))?.trim() || "";
    const hasBoringOpener = /^(in this|this article|today we|let's explore|welcome to)/i.test(firstLine);
    const tables = (content.match(/\|.*\|/g) || []).length;
    const images = (content.match(/!\[/g) || []).length;

    let issues: string[] = [];
    let strengths: string[] = [];

    // Structure
    if (headers.length < 3) issues.push("🔴 Only " + headers.length + " headers — consider breaking up with more sub-sections");
    else strengths.push("✅ Good section structure (" + headers.length + " headers)");

    if (longParas.length > 0) issues.push("🟡 " + longParas.length + " paragraph(s) exceed 150 words — consider splitting");

    // Opening
    if (hasBoringOpener) issues.push("🔴 Opening line uses a generic pattern (\"In this article...\"). Start with a hook — a pain point, question, or surprising fact");
    else strengths.push("✅ Opening avoids generic \"In this article\" pattern");

    // Content
    if (wordCount < 500) issues.push("🟡 Only " + wordCount + " words — may be too thin to provide value");
    else if (wordCount > 5000) issues.push("🟡 " + wordCount + " words — consider splitting into a series");

    if (codeBlocks > 0) strengths.push("✅ Includes " + Math.floor(codeBlocks) + " code block(s) — practical!");
    else if (wordCount > 1000) issues.push("🟡 No code examples — consider adding practical snippets");

    if (tables > 2) strengths.push("✅ Uses tables for comparison — great for scannability");

    // Readability
    const avgWordsPerSection = wordCount / Math.max(headers.length, 1);
    if (avgWordsPerSection > 600) issues.push("🟡 Avg ~" + Math.round(avgWordsPerSection) + " words/section — some sections may be too dense");

    return `
╔══════════════════════════════════════════════════════════════════════╗
║  📖 BLOG REVIEW                                                     ║
╚══════════════════════════════════════════════════════════════════════╝

  📊 Stats
  ─────────────────────────────────────
  Words:         ${wordCount.toLocaleString()}
  Sections:      ${headers.length}
  Code blocks:   ${Math.floor(codeBlocks)}
  Tables:        ${Math.floor(tables / 3)} (approx)
  Images:        ${images}
  Paragraphs:    ${paragraphs.length}

  💪 Strengths
  ─────────────────────────────────────
${strengths.length > 0 ? strengths.map(s => "  " + s).join("\n") : "  (none detected — keep writing!)"}

  ⚠️  Issues to Address
  ─────────────────────────────────────
${issues.length > 0 ? issues.map(i => "  " + i).join("\n") : "  (none — looking good!)"}

  📋 Manual Checklist
  ─────────────────────────────────────
  □ Does the title make you want to click?
  □ Could someone skim headers alone and get the gist?
  □ Does each section answer exactly ONE question?
  □ Are examples concrete (real URLs, real config, real code)?
  □ Did you include "what people get wrong" / gotchas?
  □ Would YOU share this if you found it via search?
  □ Read the first and last paragraphs — do they work standalone?
`;
  }

  function polishDraft(content: string): string {
    const lines = content.split("\n");

    // Detect specific polish opportunities
    let findings: string[] = [];

    // Check for passive voice indicators
    const passivePatterns = content.match(/\b(is|are|was|were|been|being)\s+(being\s+)?\w+ed\b/gi) || [];
    if (passivePatterns.length > 5) {
      findings.push(`🟡 Found ~${passivePatterns.length} passive voice patterns. Consider rewriting key ones to active voice.`);
    }

    // Check for weasel words
    const weasels = content.match(/\b(very|really|basically|actually|just|simply|quite|rather|somewhat|fairly)\b/gi) || [];
    if (weasels.length > 3) {
      findings.push(`🟡 Found ${weasels.length} filler/weasel words (very, really, basically, just, etc.). Cut most of them.`);
    }

    // Check for "we will" / "let's" overuse
    const weWill = content.match(/\b(we will|we'll|let's|let us)\b/gi) || [];
    if (weWill.length > 4) {
      findings.push(`🟡 "${weWill[0]}" appears ${weWill.length} times. Vary your transitions.`);
    }

    // Consecutive short sentences
    const sentences = content.split(/[.!?]+/).map(s => s.trim().split(/\s+/).length);
    let consecutiveShort = 0;
    for (const len of sentences) {
      if (len < 6) consecutiveShort++;
      else consecutiveShort = 0;
      if (consecutiveShort >= 4) {
        findings.push("🟡 Found 4+ very short sentences in a row. Vary sentence length for better rhythm.");
        break;
      }
    }

    return `
╔══════════════════════════════════════════════════════════════════════╗
║  ✨ POLISH PASS                                                      ║
╚══════════════════════════════════════════════════════════════════════╝

  Automated Findings
  ─────────────────────────────────────
${findings.length > 0 ? findings.map(f => "  " + f).join("\n") : "  ✅ No obvious issues detected"}

${POLISH_CHECKLIST}
`;
  }

  // ── Constants ──

  const WRITING_TIPS = `
╔══════════════════════════════════════════════════════════════════════╗
║  💡 BLOG WRITING TIPS                                                ║
╚══════════════════════════════════════════════════════════════════════╝

  THE HOOK
  ─────────────────────────────────────
  ❌ "In this article, we will explore OAuth 2.0..."
  ✅ "You've built an app. It needs to call an API on behalf of
      your user. And you're staring at the OAuth docs wondering
      why there are 47 different flows."

  STRUCTURE
  ─────────────────────────────────────
  • Each header should be a question the reader has
  • First sentence of each section = standalone summary
  • If a section exceeds 300 words, split it
  • Use tables for any comparison (beats paragraphs every time)

  CLARITY
  ─────────────────────────────────────
  • Concrete > abstract: "like a hotel key card" > "a delegated token"
  • Cut "very", "really", "basically", "simply", "just"
  • One idea per paragraph
  • If you wrote "it" or "this", check if the referent is clear

  ANALOGIES
  ─────────────────────────────────────
  • Map EVERY concept, not just the main one
  • Acknowledge where the analogy breaks down
  • Use the analogy first, then show the real thing
  • Revisit the analogy when introducing advanced concepts

  THE 20% RULE
  ─────────────────────────────────────
  Your first draft is 20% too long. Always.
  Read each sentence and ask: "Does removing this lose anything?"
  If no → delete it.

  SCANNABILITY
  ─────────────────────────────────────
  • Headers every 200-400 words
  • Bold key terms on first use
  • Code blocks for anything copy-pasteable
  • Bullet lists for 3+ related items
  • TL;DR at the end (or start) for long posts
`;

  const POLISH_CHECKLIST = `
  Manual Polish Checklist
  ─────────────────────────────────────
  □ Read the entire post aloud. Rewrite where you stumble.
  □ Cut 20% — remove sentences that don't add new information.
  □ Check every "it", "this", "that" — is the referent clear?
  □ Vary sentence length — short. Then a longer, more flowing one.
  □ Check transitions between sections — do they flow or jolt?
  □ Verify all code examples are correct and runnable.
  □ Check all links work.
  □ Re-read just the headers — do they tell the full story?
  □ Re-read just the first sentence of each section — same test.
  □ Ask: would I share this? Would I bookmark it?
`;
}
