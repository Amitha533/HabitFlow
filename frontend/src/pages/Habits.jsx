import React, { useState, useEffect } from 'react';
import { getHabits, createHabit, updateHabit, deleteHabit, getStreak } from '../services/api';
import HabitCard from '../components/HabitCard';
import HabitModal from '../components/HabitModal';
import BadgeDisplay from '../components/BadgeDisplay';
import CalendarView from '../components/CalendarView';
import toast from 'react-hot-toast';

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [streaks, setStreaks] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editHabit, setEditHabit] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => { loadHabits(); }, []);

  const loadHabits = async () => {
    try {
      setError(false);
      const res = await getHabits();
      const habitList = res.data;
      setHabits(habitList);

      // Load streaks for all habits
      const streakMap = {};
      await Promise.all(habitList.map(async h => {
        try {
          const s = await getStreak(h.id);
          streakMap[h.id] = s.data.streak;
        } catch { streakMap[h.id] = 0; }
      }));
      setStreaks(streakMap);
    } catch (err) {
      setError(true);
      toast.error('Cannot connect to backend. Is Spring Boot running?');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form) => {
    try {
      if (editHabit) {
        await updateHabit(editHabit.id, form);
        toast.success('Habit updated! ✏️');
      } else {
        await createHabit(form);
        toast.success('Habit created! 🌱');
      }
      setShowModal(false);
      setEditHabit(null);
      loadHabits();
    } catch {
      toast.error('Failed to save. Check backend connection.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this habit?')) return;
    try {
      await deleteHabit(id);
      toast('Habit removed', { icon: '🗑️' });
      setExpandedId(null);
      loadHabits();
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const handleEdit = (habit) => {
    setEditHabit(habit);
    setShowModal(true);
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  // ── Loading state ──
  if (loading) return (
    <div style={{ padding: 40, color: 'var(--text2)', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
      Loading habits...
    </div>
  );

  // ── Backend offline state ──
  if (error) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔌</div>
      <h3 style={{ fontFamily: 'Syne', marginBottom: 8 }}>Backend Not Connected</h3>
      <p style={{ color: 'var(--text2)', marginBottom: 20 }}>
        Make sure Spring Boot is running at <code>localhost:8080</code>
      </p>
      <button className="btn btn-primary" onClick={loadHabits}>
        🔄 Retry Connection
      </button>
    </div>
  );

  return (
    <div>
      {/* ── Header ── */}
      <div className="topbar">
        <div>
          <div className="page-title">My Habits ✅</div>
          <div style={{ color: 'var(--text2)', fontSize: '0.85rem', marginTop: 4 }}>
            {habits.length} habit{habits.length !== 1 ? 's' : ''} tracked
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setEditHabit(null); setShowModal(true); }}
        >
          + Add Habit
        </button>
      </div>

      {/* ── Empty State ── */}
      {habits.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🎯</div>
          <h3>Start your journey!</h3>
          <p style={{ marginTop: 8, color: 'var(--text2)' }}>
            Create your first habit and build consistency.
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 20 }}
            onClick={() => setShowModal(true)}
          >
            + Add First Habit
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {habits.map(h => (
            <div key={h.id}>
              {/* Habit Card */}
              <HabitCard
                habit={h}
                isCompleted={false}
                streak={streaks[h.id] || 0}
                onToggle={() => {}}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />

              {/* Expand Button */}
              <button
                onClick={() => toggleExpand(h.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text2)',
                  fontSize: '0.8rem',
                  padding: '4px 12px',
                  marginTop: 4,
                  fontWeight: 600,
                }}
              >
                {expandedId === h.id ? '▲ Hide details' : '▼ Show details'}
              </button>

              {/* Expanded Details — Badges + Calendar */}
              {expandedId === h.id && (
                <div
                  className="card fade-in"
                  style={{
                    marginTop: 8,
                    borderTop: `3px solid ${h.color}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                  }}
                >
                  {/* Badges Row */}
                  <div>
                    <div style={{
                      fontWeight: 700,
                      fontFamily: 'Syne',
                      marginBottom: 10,
                      fontSize: '0.9rem'
                    }}>
                      🏅 Earned Badges
                    </div>
                    <BadgeDisplay habitId={h.id} />
                  </div>

                  {/* Calendar Heatmap */}
                  <div>
                    <div style={{
                      fontWeight: 700,
                      fontFamily: 'Syne',
                      marginBottom: 10,
                      fontSize: '0.9rem'
                    }}>
                      📅 Activity (Last 70 Days)
                    </div>
                    <CalendarView habitId={h.id} color={h.color} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <HabitModal
          habit={editHabit}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditHabit(null); }}
        />
      )}
    </div>
  );
}