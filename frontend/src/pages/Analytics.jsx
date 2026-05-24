import React, { useState, useEffect } from 'react';
import { getHabits, getHabitProgress, getStreak } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import ProgressChart from '../components/ProgressChart';
import StreakBadge from '../components/StreakBadge';

export default function Analytics() {
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const habitsRes = await getHabits();
      const habitList = habitsRes.data;
      setHabits(habitList);

      // Auto-select first habit for ProgressChart
      if (habitList.length > 0) setSelectedHabit(habitList[0]);

      const statsData = await Promise.all(habitList.map(async h => {
        const [progressRes, streakRes] = await Promise.all([
          getHabitProgress(h.id),
          getStreak(h.id)
        ]);
        return {
          name: h.name,
          icon: h.icon,
          color: h.color,
          total: progressRes.data.length,
          streak: streakRes.data.streak,
        };
      }));
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 40, color: 'var(--text2)' }}>Loading analytics...</div>
  );

  return (
    <div>
      <div className="topbar">
        <div className="page-title">Analytics 📊</div>
      </div>

      {/* ── Top Charts ── */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        <div className="card">
          <h3 style={{ fontFamily: 'Syne', marginBottom: 20 }}>Total Completions</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text2)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text2)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 10
                }}
              />
              <Bar dataKey="total" fill="#6C63FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'Syne', marginBottom: 20 }}>Current Streaks</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text2)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text2)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 10
                }}
              />
              <Bar dataKey="streak" fill="#FF6584" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 30-Day Activity Chart (ProgressChart) ── */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Syne' }}>30-Day Activity</h3>

          {/* Habit selector tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {habits.map(h => (
              <button
                key={h.id}
                onClick={() => setSelectedHabit(h)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: '1.5px solid',
                  borderColor: selectedHabit?.id === h.id ? h.color : 'var(--border)',
                  background: selectedHabit?.id === h.id ? h.color + '22' : 'transparent',
                  color: selectedHabit?.id === h.id ? h.color : 'var(--text2)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                {h.icon} {h.name}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ ProgressChart component used here */}
        {selectedHabit ? (
          <ProgressChart
            habitId={selectedHabit.id}
            color={selectedHabit.color}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--text2)' }}>
            No habits found. Create one first!
          </div>
        )}
      </div>

      {/* ── Performance Table ── */}
      <div className="card">
        <h3 style={{ fontFamily: 'Syne', marginBottom: 16 }}>Performance Summary</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Habit', 'Category', 'Total Days', 'Streak', 'Status'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '10px 12px',
                    color: 'var(--text2)', fontWeight: 600
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}>{s.icon} {s.name}</td>
                  <td style={{ padding: '12px', color: 'var(--text2)' }}>{habits[i]?.category}</td>
                  <td style={{ padding: '12px', fontWeight: 700 }}>{s.total}</td>

                  {/* ✅ Uses StreakBadge component */}
                  <td style={{ padding: '12px' }}>
                    {s.streak > 0
                      ? <StreakBadge streak={s.streak} showLabel={false} />
                      : <span style={{ color: 'var(--text2)' }}>—</span>
                    }
                  </td>

                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 20,
                      fontSize: '0.78rem', fontWeight: 700,
                      background: s.streak > 0 ? '#43e97b22' : '#ff658422',
                      color: s.streak > 0 ? '#1a9e4e' : '#cc3366'
                    }}>
                      {s.streak > 0 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}

              {stats.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 30, textAlign: 'center', color: 'var(--text2)' }}>
                    No data yet. Complete some habits first!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}