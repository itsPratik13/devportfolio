import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "dummy";

if (!GITHUB_USERNAME) {
  throw new Error("GITHUB_USERNAME env var is missing");
}

export async function GET(req: Request) {
  const existingUser = await prisma.user.findUnique({
    where: {
      githubUsername: GITHUB_USERNAME,
    },
  });

  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "true";
  if (existingUser && !force) {
    const diffTime = Date.now() - new Date(existingUser.fetchedAt).getTime();
    if (diffTime < 60 * 60 * 1000) {
      return NextResponse.json({
        success: true,
        source: "cache",
        user: existingUser,
      });
    }
  }

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

    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: profile.name || profile.login,
            avatarUrl: profile.avatar_url || null,
            bio: profile.bio || null,
            followers: profile.followers || 0,
            location: profile.location || null,
          
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
    const reposRetrieved = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,

      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    if (!reposRetrieved.ok) {
      throw new Error(`GitHub repos API failed: ${reposRetrieved.status}`);
    }
    const repos = await reposRetrieved.json();
    // await prisma.repo.deleteMany({
    // where: {
    // userId: user.id,
    // },
    // });
    // await prisma.repo.createMany({
    // data: repos.map((repo: any) => ({
    // name: repo.name,
    // description: repo.description ?? null,
    // stars: repo.stargazers_count,
    // forks: repo.forks_count,
    // url: repo.html_url,
    // language: repo.language || "unknown",
    // is_pinned: false,
    // userId: user.id,
    // })),
    // });

    for (const repo of repos) {
      await prisma.repo.upsert({
        where: {
          userId_name: {
            userId: user.id,
            name: repo.name,
          },
        },
        update: {
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          description: repo.description ?? "unknown",
          is_pinned:false,
          language:repo.language || "unknown",
          url:repo.html_url,

        },
        create: {
          userId: user.id,
          name: repo.name,
          description: repo.description ?? "unknown",
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          url: repo.html_url,
          is_pinned: false,
          language: repo.language || "unknown",
        },
      });
    }
    await prisma.repo.deleteMany({
      where: {
        userId: user.id,
        name: { notIn: repos.map((r: any) => r.name) },
      },
    });
    return NextResponse.json({
      success: true,
      user,
      repos_synced: repos.length,
    });
  } catch (error) {
    console.error("Error syncing GitHub user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync GitHub data" },
      { status: 500 }
    );
  }
}
