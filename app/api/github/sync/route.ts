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

    const graphQLquery=`{
      user(login: "${GITHUB_USERNAME}"){
        contributionsCollection{
          contributionCalendar{
          weeks{
            contributionDays{
              date
              contributionCount
            }
          }
          }
        }
        pinnedItems(first:6,types:REPOSITORY){
          nodes{
            ... on Repository{
              name
            }
          }
        }
      }
    }`
    const graphQlRequest=await fetch("https://api.github.com/graphql",{
      method:"POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body:JSON.stringify({query:graphQLquery})
    })

    const graphqlData=await graphQlRequest.json();

    const pinnedRepos:string[]=graphqlData.data.user.pinnedItems.nodes.map((node:any)=>node.name);

    const contributions: { date: string; contributionCount: number }[] =
  graphqlData.data.user.contributionsCollection.contributionCalendar.weeks
    .flatMap((week: any) => week.contributionDays)
    .map((day: any) => ({
      date: day.date,
      contributionCount: day.contributionCount,
    }));

    // for (const repo of repos) {
      // await prisma.repo.upsert({
        // where: {
          // userId_name: {
            // userId: user.id,
            // name: repo.name,
          // },
        // },
        // update: {
          // stars: repo.stargazers_count,
          // forks: repo.forks_count,
          // description: repo.description ?? "unknown",
          // is_pinned:pinnedRepos.includes(repo.name),
          // language:repo.language || "unknown",
          // url:repo.html_url,

        // },
        // create: {
          // userId: user.id,
          // name: repo.name,
          // description: repo.description ?? "unknown",
          // stars: repo.stargazers_count,
          // forks: repo.forks_count,
          // url: repo.html_url,
          // is_pinned: false,
          // language: repo.language || "unknown",
        // },
      // });
    // }
    await Promise.all(
      repos.map((repo: any) =>
        prisma.repo.upsert({
          where: { userId_name: { userId: user.id, name: repo.name } },
          update: {
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            description: repo.description ?? null,
            is_pinned: pinnedRepos.includes(repo.name),
            language: repo.language || "unknown",
            url: repo.html_url,
          },
          create: {
            userId: user.id,
            name: repo.name,
            description: repo.description ?? null,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            url: repo.html_url,
            is_pinned: pinnedRepos.includes(repo.name),
            language: repo.language || "unknown",
          },
        })
      )
    );
    await prisma.repo.deleteMany({
      where: {
        userId: user.id,
        name: { notIn: repos.map((r: any) => r.name) },
      },
    });
    for (const day of contributions) {
      await prisma.contribution.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date: new Date(day.date + "T00:00:00.000Z"),
          },
        },
        update: {
          commitCount: day.contributionCount,
        },
        create: {
          userId: user.id,
          date: new Date(day.date + "T00:00:00.000Z"),
          commitCount: day.contributionCount,
        },
      });
    }
    const languageCount:Record<string,number>={};
    for(const repo of repos){
      if(repo.language && repo.language!=="unknown"){
        languageCount[repo.language]=(languageCount[repo.language]||0)+1;

      }
    }
    const totalrepos=Object.values(languageCount).reduce((a,b)=>a+b,0);
    const LANGUAGE_COLORS: Record<string, string> = {
      TypeScript: "#3178c6",
      JavaScript: "#f1e05a",
      Python: "#3572A5",
      Rust: "#dea584",
      Go: "#00ADD8",
      Java: "#b07219",
      CSS: "#563d7c",
      HTML: "#e34c26",
      Shell: "#89e051",
      Ruby: "#701516",
      Swift: "#F05138",
      Kotlin: "#A97BFF",
      Dart: "#00B4AB",
      "C++": "#f34b7d",
      C: "#555555",
      "C#": "#178600",
    };
    const languageStats=Object.entries(languageCount).map(([language,count])=>({
      name:language,
      percent:Number(((count/totalrepos)*100).toFixed(2)),
      color:LANGUAGE_COLORS[language]||"#8b949e"
    })).sort((a:any,b:any)=>b.percent-a.percent).slice(0,8);

    await Promise.all(
      languageStats.map((lang) =>
        prisma.languageStats.upsert({
          where: {
            userId_name: {
              userId: user.id,
              name: lang.name,
            },
          },
          update: {
            percent: lang.percent,
            color: lang.color,
          },
          create: {
            userId: user.id,
            name: lang.name,
            percent: lang.percent,
            color: lang.color,
          },
        })
      )
    );
    
    
    await prisma.languageStats.deleteMany({
      where: {
        userId: user.id,
        name: { notIn: languageStats.map((l) => l.name) },
      },
    });
    
    

    return NextResponse.json({
      success: true,
      user,
      repos_synced: repos.length,
      contributions_synced: contributions.length,
    });
  } catch (error) {
    console.error("Error syncing GitHub user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync GitHub data" },
      { status: 500 }
    );
  }
}
