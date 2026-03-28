import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "dummy";

if (!GITHUB_USERNAME) {
  throw new Error("GITHUB_USERNAME env var is missing");
}

export async function GET(req: Request) {
  try {
    // Fetch GitHub profile data
    const rawProfile = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!rawProfile.ok) {
      throw new Error(`GitHub API returned status ${rawProfile.status}`);
    }

    const profile = await rawProfile.json();

    const existing = await prisma.user.findFirst({
      where: { githubUsername: GITHUB_USERNAME },
    });
    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            name: profile.name || "",
            avatarUrl: profile.avatar_url || null,
            bio: profile.bio || null,
            followers: profile.followers || 0,
            location: profile.location || null,
            fetchedAt: new Date(),
          },
        })
      : await prisma.user.create({
          data: {
            githubUsername: GITHUB_USERNAME,
            name: profile.name || "",
            avatarUrl: profile.avatar_url || null,
            bio: profile.bio || null,
            followers: profile.followers || 0,
            location: profile.location || null,
          },
        });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error syncing GitHub user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync GitHub data" },
      { status: 500 }
    );
  }
}