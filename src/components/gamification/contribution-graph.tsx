'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ContributionDay {
  date: string;
  count: number;
}

interface ContributionGraphProps {
  data: ContributionDay[]; // Last 52 weeks of data
  className?: string;
}

export function ContributionGraph({ data, className }: ContributionGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Get intensity level based on exercise count
  const getIntensityClass = (count: number): string => {
    if (count === 0) return 'bg-gray-200';
    if (count >= 10) return 'bg-green-500';
    if (count >= 6) return 'bg-green-400';
    if (count >= 3) return 'bg-green-300';
    return 'bg-green-200';
  };

  // Generate last 52 weeks (364 days) of dates
  const generateWeeks = (): ContributionDay[][] => {
    const weeks: ContributionDay[][] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the most recent Sunday
    const currentDay = today.getDay();
    const mostRecentSunday = new Date(today);
    mostRecentSunday.setDate(today.getDate() - currentDay);

    // Generate 52 weeks of data
    for (let week = 0; week < 52; week++) {
      const weekData: ContributionDay[] = [];

      for (let day = 0; day < 7; day++) {
        const date = new Date(mostRecentSunday);
        date.setDate(mostRecentSunday.getDate() - (51 - week) * 7 + day);
        const dateStr = date.toISOString().split('T')[0];

        const existingData = data.find(d => d.date === dateStr);
        weekData.push({
          date: dateStr,
          count: existingData?.count || 0,
        });
      }

      weeks.push(weekData);
    }

    return weeks;
  };

  const weeks = generateWeeks();

  // Get month labels
  const getMonthLabels = (): Array<{ label: string; offset: number }> => {
    const labels: Array<{ label: string; offset: number }> = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstDay = new Date(week[0].date);
      const month = firstDay.getMonth();

      if (month !== lastMonth && weekIndex > 0) {
        labels.push({
          label: months[month],
          offset: weekIndex,
        });
        lastMonth = month;
      }
    });

    return labels;
  };

  const monthLabels = getMonthLabels();

  const handleMouseEnter = (day: ContributionDay, event: React.MouseEvent) => {
    setHoveredDay(day);
    setMousePos({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (hoveredDay) {
      setMousePos({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={cn('relative', className)}>
      {/* Month labels */}
      <div className="flex mb-2 pl-8">
        {monthLabels.map((month, index) => (
          <div
            key={index}
            className="text-xs text-gray-600"
            style={{
              marginLeft: index === 0 ? `${month.offset * 15}px` : `${(month.offset - monthLabels[index - 1].offset) * 15}px`
            }}
          >
            {month.label}
          </div>
        ))}
      </div>

      {/* Graph */}
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pr-2">
          <div className="h-3" /> {/* Sun */}
          <div className="text-xs text-gray-600 h-3 flex items-center">Mon</div>
          <div className="h-3" /> {/* Tue */}
          <div className="text-xs text-gray-600 h-3 flex items-center">Wed</div>
          <div className="h-3" /> {/* Thu */}
          <div className="text-xs text-gray-600 h-3 flex items-center">Fri</div>
          <div className="h-3" /> {/* Sat */}
        </div>

        {/* Contribution squares */}
        <div className="flex gap-1 overflow-x-auto">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={cn(
                    'w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-gray-400',
                    getIntensityClass(day.count)
                  )}
                  onMouseEnter={(e) => handleMouseEnter(day, e)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  title={`${formatDate(day.date)}: ${day.count} exercise${day.count !== 1 ? 's' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-600">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-200" />
          <div className="w-3 h-3 rounded-sm bg-green-200" />
          <div className="w-3 h-3 rounded-sm bg-green-300" />
          <div className="w-3 h-3 rounded-sm bg-green-400" />
          <div className="w-3 h-3 rounded-sm bg-green-500" />
        </div>
        <span>More</span>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg pointer-events-none"
          style={{
            left: `${mousePos.x + 10}px`,
            top: `${mousePos.y + 10}px`,
          }}
        >
          <div className="font-medium">{formatDate(hoveredDay.date)}</div>
          <div className="text-gray-300">
            {hoveredDay.count} exercise{hoveredDay.count !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
