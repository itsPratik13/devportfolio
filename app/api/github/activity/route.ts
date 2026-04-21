import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "dummy";

if (!GITHUB_USERNAME) {
  throw new Error("GITHUB_USERNAME env var is missing");
}

export async function GET() {
  const result = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=5`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: {
        revalidate: 3600,
      },
    }
  );
  if (!result.ok) {
    return NextResponse.json({ activity: [], error: "GitHub fetch failed" }, { status: 500 });
  }
  const rawEvents = await result.json();
  const activity = rawEvents.map((event: any) => {
    const base = {
      type: event.type,
      repo: event.repo.name || "unknown",
      timestamp: event.created_at,
    };
    switch (event.type) {
      case "PushEvent":
        const count = event.payload?.commits?.length || 0;
        if (count === 0) return null;
        return {
          ...base,
          details: `Pushed ${count} commit(s) to ${event.repo.name}`,
        };
      case "PullRequestEvent":
        return {
          ...base,
          details:`${event.payload?.action} PR #${event.payload?.pull_request?.number} in ${event.repo.name}`
        };
      case "IssuesEvent":
        return {
          ...base,
          details: `${event.payload?.action} issue #${event.payload?.issue?.number} in ${event.repo.name}`,
        };
      case "WatchEvent":
        return { ...base, details: `Starred ${event.repo.name}`};
        default: return null;
    }
  }).filter(Boolean).slice(0,3);

  return NextResponse.json({activity})
}
