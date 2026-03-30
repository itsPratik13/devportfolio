'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ContributionDay {
  date: string;
  commitCount: number;
}

interface Props {
  contributions: ContributionDay[];
  totalContributions: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getLevel(count: number, max: number): number {
  if (count === 0) return 0;
  if (count <= max * 0.25) return 1;
  if (count <= max * 0.5) return 2;
  if (count <= max * 0.75) return 3;
  return 4;
}

export default function ContributionHeatmap({ contributions, totalContributions }: Props) {
  const [hoveredDay, setHoveredDay] = useState<{
    day: ContributionDay & { level: number };
    x: number;
    y: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains('dark'));

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  // Scroll to end on mount
  useEffect(() => {
    if (mounted && scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [mounted]);

  const max = useMemo(
    () => Math.max(...contributions.map((d) => d.commitCount), 1),
    [contributions]
  );

  // Build week grid from contributions
  const weeks = useMemo(() => {
    const dataByDate = new Map(
      contributions.map((d) => [
        new Date(d.date).toISOString().slice(0, 10),
        d.commitCount,
      ])
    );

    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    );

    // Go back 52 weeks, align to Sunday
    const startDate = new Date(todayUTC);
    startDate.setUTCDate(todayUTC.getUTCDate() - 52 * 7);
    startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay());

    const allDays: (ContributionDay & { level: number })[] = [];
    for (let i = 0; i < 53 * 7; i++) {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + i);
      if (date > todayUTC) break;
      const key = date.toISOString().slice(0, 10);
      const count = dataByDate.get(key) || 0;
      allDays.push({ date: key, commitCount: count, level: getLevel(count, max) });
    }

    // Chunk into weeks
    const result: (ContributionDay & { level: number })[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      result.push(allDays.slice(i, i + 7));
    }
    return result;
  }, [contributions, max]);

  // Month labels
  const monthLabels = useMemo(() => {
    const labels: { month: string; position: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, weekIndex) => {
      if (week.length > 0) {
        const month = new Date(week[0].date).getUTCMonth();
        if (month !== lastMonth) {
          labels.push({ month: MONTHS[month], position: weekIndex });
          lastMonth = month;
        }
      }
    });
    return labels;
  }, [weeks]);

  const getLevelColor = (level: number) => {
    if (!isDark) {
      // Light mode — green
      switch (level) {
        case 0: return 'bg-[#ebedf0]';
        case 1: return 'bg-[#9be9a8]';
        case 2: return 'bg-[#40c463]';
        case 3: return 'bg-[#30a14e]';
        case 4: return 'bg-[#216e39]';
        default: return 'bg-[#ebedf0]';
      }
    }
    // Dark mode — blue to cyan
    switch (level) {
      case 0: return 'bg-[#161b22]';
      case 1: return 'bg-[#0d3b6e]';
      case 2: return 'bg-[#0969da]';
      case 3: return 'bg-[#0ccff0]';
      case 4: return 'bg-[#00ffff] shadow-[0_0_6px_rgba(0,255,255,0.5)]';
      default: return 'bg-[#161b22]';
    }
  };

  const tileSize = 11;
  const tileGap = 3;
  const totalWeeks = weeks.length;

  const tooltip =
    hoveredDay && mounted
      ? createPortal(
          <div
            className="fixed z-[9999] px-3 py-1.5 rounded-md text-xs whitespace-nowrap pointer-events-none shadow-lg"
            style={{
              left: hoveredDay.x,
              top: hoveredDay.y,
              transform: 'translate(-50%, -100%)',
              background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            <span className="font-medium">{hoveredDay.day.commitCount}</span>{' '}
            contribution{hoveredDay.day.commitCount !== 1 ? 's' : ''} on{' '}
            {new Date(hoveredDay.day.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              timeZone: 'UTC',
            })}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className="w-full">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex flex-col items-start min-w-max">
            {/* Month labels */}
            <div
              className="flex mb-2 text-[11px] text-gray-400"
              style={{ gap: `${tileGap}px` }}
            >
              {monthLabels.map((label, index) => {
                const nextPos = monthLabels[index + 1]?.position ?? totalWeeks;
                const span = nextPos - label.position;
                const width = span * tileSize + (span - 1) * tileGap;
                return (
                  <div
                    key={`${label.month}-${label.position}`}
                    style={{ width: `${width}px`, minWidth: `${width}px` }}
                    className="text-left"
                  >
                    {index > 0 || width >= 30 ? label.month : ''}
                  </div>
                );
              })}
            </div>

            {/* Grid */}
            <div className="flex" style={{ gap: `${tileGap}px` }}>
              {weeks.map((week, weekIndex) => (
                <div
                  key={weekIndex}
                  className="flex flex-col"
                  style={{ gap: `${tileGap}px` }}
                >
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      style={{ width: `${tileSize}px`, height: `${tileSize}px` }}
                      className={`rounded-[2px] ${getLevelColor(day.level)} transition-all duration-150 hover:scale-125 cursor-pointer`}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredDay({
                          day,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8,
                        });
                      }}
                      onMouseLeave={() => setHoveredDay(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400">
            {totalContributions.toLocaleString()} contributions in the last year
          </span>
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                style={{ width: `${tileSize}px`, height: `${tileSize}px` }}
                className={`rounded-[2px] ${getLevelColor(level)}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
      {tooltip}
    </>
  );
}