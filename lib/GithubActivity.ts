// lib/github.ts
export async function getGithubActivity(username: string) {
    const res = await fetch(
      `https://api.github.com/users/${username}/events?per_page=15`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        next: { revalidate: 600 },
      }
    );
  
    if (!res.ok) return [];
  
    const rawEvents = await res.json();
    console.log("RAW EVENTS:", JSON.stringify(rawEvents.slice(0, 3), null, 2));
  
    return rawEvents
      .map((event: any) => {
        const base = {
          type: event.type,
          repo: event.repo?.name || "unknown",
          timestamp: event.created_at,
        };
  
        switch (event.type) {
          case "PushEvent": {
            const branch = event.payload?.ref?.replace("refs/heads/", "") ?? "unknown";
           
            return { ...base, details: `Pushed to  ${branch} of ${event.repo.name}` };
          }
  
          case "PullRequestEvent":
            return {
              ...base,
              details: `${event.payload?.action} PR #${event.payload?.pull_request?.number}`,
            };
  
          case "IssuesEvent":
            return {
              ...base,
              details: `${event.payload?.action} issue #${event.payload?.issue?.number}`,
            };
  
          case "WatchEvent":
            return { ...base, details: `Starred repo` };
  
          default:
            return null;
        }
      })
      .filter(Boolean)
      .slice(0, 8);
  }