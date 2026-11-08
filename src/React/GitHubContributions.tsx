import { useState, useEffect } from "react";

interface DayContribution {
  date: string;
  count: number;
  level: number;
}

interface GitHubContributionsProps {
  username?: string;
}

const LEVEL_COLORS: Record<number, string> = {
  0: "bg-[#161b22] border border-[#ffffff0a]",
  1: "bg-[#0e4429] border border-[#006d32]/30",
  2: "bg-[#006d32] border border-[#26a641]/30",
  3: "bg-[#26a641] border border-[#39d353]/40",
  4: "bg-[#39d353] border border-[#86efac]/50",
};

// Pre-seeded fallback data in case of offline / rate limits
function generateFallbackContributions(): DayContribution[] {
  const days: DayContribution[] = [];
  const now = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().split("T")[0],
      count: 0,
      level: 0,
    });
  }
  return days;
}

export default function GitHubContributions({
  username = "syed-fariq-ali-shah-bit",
}: GitHubContributionsProps) {
  const [contributions, setContributions] = useState<DayContribution[]>(
    generateFallbackContributions()
  );
  const [hoveredDay, setHoveredDay] = useState<DayContribution | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchContributions() {
      try {
        const res = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${username}?y=last`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;

        if (Array.isArray(data.contributions) && data.contributions.length > 0) {
          setContributions(data.contributions);
        }
      } catch {
        // Fallback already in state
      }
    }

    fetchContributions();
    return () => {
      isMounted = false;
    };
  }, [username]);

  // Group into weeks of 7 days
  const weeks: DayContribution[][] = [];
  let currentWeek: DayContribution[] = [];
  contributions.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Calculate month labels with week indices
  const monthLabels: { weekIndex: number; label: string }[] = [];
  let lastMonth = "";
  weeks.forEach((week, idx) => {
    if (!week[0]) return;
    const date = new Date(week[0].date + "T00:00:00");
    const month = date.toLocaleString("en-US", { month: "short" });
    if (month !== lastMonth) {
      monthLabels.push({ weekIndex: idx, label: month });
      lastMonth = month;
    }
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border border-[#ffffff15] bg-[#121215]/85 backdrop-blur-xl p-4 sm:p-5 grain-surface apple-card text-left shadow-xl transition-all duration-300 hover:border-[#6C839C]/40">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-[#ffffff0f]">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-4 text-[var(--white)] shrink-0"
          >
            <path d="M12.001 2C6.47598 2 2.00098 6.475 2.00098 12C2.00098 16.425 4.86348 20.1625 8.83848 21.4875C9.33848 21.575 9.52598 21.275 9.52598 21.0125C9.52598 20.775 9.51348 19.9875 9.51348 19.15C7.00098 19.6125 6.35098 18.5375 6.15098 17.975C6.03848 17.6875 5.55098 16.8 5.12598 16.5625C4.77598 16.375 4.27598 15.9125 5.11348 15.9C5.90098 15.8875 6.46348 16.625 6.65098 16.925C7.55098 18.4375 8.98848 18.0125 9.56348 17.75C9.65098 17.1 9.91348 16.6625 10.201 16.4125C7.97598 16.1625 5.65098 15.3 5.65098 11.475C5.65098 10.3875 6.03848 9.4875 6.67598 8.7875C6.57598 8.5375 6.22598 7.5125 6.77598 6.1375C6.77598 6.1375 7.61348 5.875 9.52598 7.1625C10.326 6.9375 11.176 6.825 12.026 6.825C12.876 6.825 13.726 6.9375 14.526 7.1625C16.4385 5.8625 17.276 6.1375 17.276 6.1375C17.826 7.5125 17.476 8.5375 17.376 8.7875C18.0135 9.4875 18.401 10.375 18.401 11.475C18.401 15.3125 16.0635 16.1625 13.8385 16.4125C14.201 16.725 14.5135 17.325 14.5135 18.2625C14.5135 19.6 14.501 20.675 14.501 21.0125C14.501 21.275 14.6885 21.5875 15.1885 21.4875C19.259 20.1133 21.9999 16.2963 22.001 12C22.001 6.475 17.526 2 12.001 2Z" />
          </svg>
          <span className="text-xs font-semibold text-[var(--white)] tracking-tight">
            Contributions
          </span>
        </div>

        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-[var(--sec)] hover:text-white transition-colors font-mono"
        >
          <span>@{username}</span>
          <span className="text-[10px]">↗</span>
        </a>
      </div>

      {/* Contribution Calendar Scroll Area */}
      <div className="overflow-x-auto pb-1 scrollbar-thin">
        <div className="min-w-[560px] select-none">
          {/* Months Header */}
          <div className="flex text-[9px] text-[var(--white-icon)] font-mono mb-1.5 pl-6 relative h-3.5">
            {monthLabels.map(({ weekIndex, label }, i) => (
              <span
                key={`${label}-${i}`}
                className="absolute"
                style={{ left: `${24 + weekIndex * 10}px` }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="flex gap-1 items-start">
            {/* Day of Week Labels */}
            <div className="flex flex-col gap-[2px] text-[8px] text-[var(--white-icon)] font-mono pr-1 select-none w-5 text-right">
              <span className="h-[8.5px] leading-[8.5px] opacity-0">S</span>
              <span className="h-[8.5px] leading-[8.5px]">M</span>
              <span className="h-[8.5px] leading-[8.5px] opacity-0">T</span>
              <span className="h-[8.5px] leading-[8.5px]">W</span>
              <span className="h-[8.5px] leading-[8.5px] opacity-0">T</span>
              <span className="h-[8.5px] leading-[8.5px]">F</span>
              <span className="h-[8.5px] leading-[8.5px] opacity-0">S</span>
            </div>

            {/* Week Columns */}
            <div className="flex gap-[2px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[2px]">
                  {week.map((day) => {
                    const level = Math.min(4, Math.max(0, day.level || 0));
                    return (
                      <div
                        key={day.date}
                        className={`size-[8.5px] rounded-[2px] transition-transform duration-150 hover:scale-125 cursor-pointer ${LEVEL_COLORS[level]}`}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${formatDate(day.date)}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info / Hover Bar */}
      <div className="flex items-center justify-between gap-2 pt-2.5 mt-2 border-t border-[#ffffff0f] text-[11px] font-mono text-[var(--white-icon)]">
        <div className="truncate">
          {hoveredDay ? (
            <span>
              <strong className="text-[var(--white)] font-semibold">
                {hoveredDay.count}
              </strong>{" "}
              {hoveredDay.count === 1 ? "contribution" : "contributions"} on{" "}
              <span className="text-[var(--sec)]">
                {formatDate(hoveredDay.date)}
              </span>
            </span>
          ) : (
            <span className="text-[#ffffff50]">
              Hover over cells for daily details
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
          <span className="text-[#ffffff50]">Less</span>
          <div className="flex items-center gap-[3px]">
            <span className="size-2 rounded-[2px] bg-[#161b22] border border-[#ffffff0a]" />
            <span className="size-2 rounded-[2px] bg-[#0e4429] border border-[#006d32]/30" />
            <span className="size-2 rounded-[2px] bg-[#006d32] border border-[#26a641]/30" />
            <span className="size-2 rounded-[2px] bg-[#26a641] border border-[#39d353]/40" />
            <span className="size-2 rounded-[2px] bg-[#39d353] border border-[#86efac]/50" />
          </div>
          <span className="text-[#ffffff50]">More</span>
        </div>
      </div>
    </div>
  );
}



