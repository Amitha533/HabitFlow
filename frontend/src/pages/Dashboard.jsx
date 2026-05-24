import React, { useState, useEffect } from 'react';
import { getHabits, getTodayProgress, markComplete, unmarkComplete, getStreak } from '../services/api';
import HabitCard from '../components/HabitCard';
import QuoteCard from '../components/QuoteCard';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [completed, setCompleted] = useState(new Set());
  const [streaks, setStreaks] = useState({});
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [habitsRes, todayRes] = await Promise.all([getHabits(), getTodayProgress()]);
      const habitList = habitsRes.data;
      setHabits(habitList);

      const doneIds = new Set(todayRes.data.map(p => p.habitId));
      setCompleted(doneIds);

      const streakMap = {};
      await Promise.all(habitList.map(async h => {
        const res = await getStreak(h.id);
        streakMap[h.id] = res.data.streak;
      }));
      setStreaks(streakMap);
    } catch (err) {
      toast.error('Failed to load data');
    } finally { setLoading(false); }
  };

  const handleToggle = async (habitId, isCompleted) => {
    try {
      if (isCompleted) {
        await unmarkComplete(habitId);
        setCompleted(prev => { const n = new Set(prev); n.delete(habitId); return n; });
        toast('Habit unchecked', { icon: '↩️' });
      } else {
        const res = await markComplete(habitId);
        setCompleted(prev => new Set([...prev, habitId]));
        const newStreak = res.data.streak;
        setStreaks(prev => ({ ...prev, [habitId]: newStreak }));
        if (newStreak > 0) toast.success(`🔥 ${newStreak} day streak!`);
        else toast.success('Habit completed! ✅');
        const newBadges = res.data.badges;
        if (newBadges.length > 0) toast(`🏅 New badge: ${newBadges[newBadges.length - 1].badgeName}`, { duration: 4000 });
      }
    } catch (err) { toast.error('Something went wrong'); }
  };

  const pct = habits.length ? Math.round((completed.size / habits.length) * 100) : 0;

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">Good day! 👋</div>
          <div style={{ color: 'var(--text2)', marginTop: 4 }}>{today}</div>
        </div>
      </div>

      <QuoteCard />

      {/* Stats Row */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        {[
          { n: habits.length, l: 'Total Habits' },
          { n: completed.size, l: 'Done Today' },
          { n: `${pct}%`, l: 'Completion' },
        ].map(s => (
          <div key={s.l} className="card stat-box">
            <div className="stat-number">{s.n}</div>
            <div className="stat-label">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Daily Progress Bar */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontWeight: 700 }}>Today's Progress</span>
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{completed.size}/{habits.length}</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        {pct === 100 && (
          <div style={{ textAlign: 'center', marginTop: 12, fontWeight: 700, color: 'var(--accent)' }}>
            🎉 All habits complete! Amazing job!
          </div>
        )}
      </div>

      {/* Habits */}
      <h3 style={{ fontFamily: 'Syne', marginBottom: 16 }}>Today's Habits</h3>
      {habits.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🌱</div>
          <h3>No habits yet!</h3>
          <p>Go to My Habits to add your first habit.</p>
        </div>
      ) : (
        <div className="grid-auto">
          {habits.map(h => (
            <HabitCard key={h.id} habit={h}
              isCompleted={completed.has(h.id)}
              streak={streaks[h.id] || 0}
              onToggle={handleToggle}
              onEdit={() => {}}
              onDelete={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}