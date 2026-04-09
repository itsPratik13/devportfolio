import Container from "@/components/Container";
import ContributionHeatmap from "@/components/HeatMap";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { calculateStreak } from "@/lib/Streak";
import Header from "@/components/Header";

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
  const { currentStreak, longestStreak } = calculateStreak(user.contributions);

  return (
    <div className="flex items-center justify-center min-h-screen  ">
      
      <Container className="">
        <div>
         <Header User={user}/>

        </div>
      </Container>
    </div>
  );
}
