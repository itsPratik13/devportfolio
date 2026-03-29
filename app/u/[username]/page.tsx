import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: Props) {
 
  const { username } = await params;

  if (!username) notFound();

  const user = await prisma.user.findUnique({
    where: {
      githubUsername: username,
    },
    include: {
      repos: { orderBy: { stars: "desc" } },
      contributions: { orderBy: { date: "asc" } },
      languages: true,
    },
  });

  if (!user) notFound();

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
      <p>Followers: {user.followers}</p>
      <p>Repos: {user.repos.length}</p>
      <p>Contributions: {user.contributions.length}</p>
    </div>
  );
}