import Container from "@/components/Container";
import ContributionHeatmap from "@/components/HeatMap";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { calculateStreak } from "@/lib/Streak";
import Header from "@/components/Header";
import DashedCard from "@/components/DashedBorder";
import StatsCard from "@/components/StatsCard";

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

  const totalContributions = user.contributions.reduce(
    (sum, day) => sum + day.commitCount,
    0
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Container>
        {/* HEADER */}
        <div className="mt-20">
          <DashedCard className="w-full h-fit">
            <Header
              User={user}
              contributions={{
                currentStreak,
                longestStreak,
              }}
            />{" "}
          </DashedCard>
        </div>

        {/* HEATMAP */}

        <ContributionHeatmap
          contributions={user.contributions}
          totalContributions={totalContributions}
          className="items-center mx-auto p-6"
        />

      

        <div className="p-6  text-neutral-500 grid grid-cols-2  gap-4">
          <DashedCard className="">
          <StatsCard
            className=" rounded-lg relative"
            heading="Contributions"
            value={totalContributions}
            subheading="Last 365 days"
          />
          </DashedCard>
          <StatsCard
            className=" rounded-lg"
            heading="Contributions"
            value={totalContributions}
            subheading="Last 365 days"
          />
        </div>
      </Container>
    </div>
  );
}
