'use client';

import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
}

export default function VisitorCounter() {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/analytics/track');
        if (response.ok) {
          const data = await response.json();
          setStats(data.analytics);
        }
      } catch (error) {
        console.warn('Failed to fetch visitor stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Users className="h-4 w-4" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Users className="h-4 w-4" />
      <span>{stats.totalVisitors.toLocaleString()} visitors</span>
      <span className="text-gray-400">•</span>
      <span>{stats.todayVisitors.toLocaleString()} today</span>
    </div>
  );
}
