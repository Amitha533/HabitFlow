import React, { useState, useEffect } from 'react';
import { getAllBadges } from '../services/api';

const ALL_POSSIBLE = [
  { type: 'BRONZE',     icon: '🥉', name: '3-Day Starter',    desc: 'Complete a habit 3 days in a row' },
  { type: 'SILVER',     icon: '🥈', name: 'Week Warrior',     desc: '7-day streak achieved!' },
  { type: 'GOLD',       icon: '🥇', name: '2-Week Champion',  desc: '14-day streak achieved!' },
  { type: 'PLATINUM',   icon: '💎', name: 'Month Master',     desc: '30-day streak achieved!' },
  { type: 'DIAMOND',    icon: '👑', name: 'Diamond Legend',   desc: '60-day streak achieved!' },
  { type: 'TEN_DAYS',   icon: '⭐', name: '10 Days Done',     desc: 'Completed a habit 10 times' },
  { type: 'FIFTY_DAYS', icon: '🌟', name: '50 Days Legend',   desc: 'Completed a habit 50 times' },
  { type: 'CENTURY',    icon: '🚀', name: 'Century Club',     desc: 'Completed a habit 100 times' },
];

export default function Badges() {
  const [earned, setEarned] = useState([]);

  useEffect(() => {
    getAllBadges().then(res => setEarned(res.data));
  }, []);

  const earnedTypes = new Set(earned.map(b => b.badgeType));

  return (
    <div>
      <div className="topbar">
        <div className="page-title">Badges 🏅</div>
        <div style={{ color: 'var(--text2)' }}>{earnedTypes.size} / {ALL_POSSIBLE.length} earned</div>
      </div>

      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontWeight: 700 }}>Overall Progress</span>
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
            {Math.round((earnedTypes.size / ALL_POSSIBLE.length) * 100)}%
          </span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill"
            style={{ width: `${(earnedTypes.size / ALL_POSSIBLE.length) * 100}%` }} />
        </div>
      </div>

      <div className="grid-auto">
        {ALL_POSSIBLE.map(b => {
          const isEarned = earnedTypes.has(b.type);
          return (
            <div key={b.type} className="badge-card"
              style={{ opacity: isEarned ? 1 : 0.4, filter: isEarned ? 'none' : 'grayscale(1)' }}>
              <div className="badge-icon">{b.icon}</div>
              <div className="badge-name">{b.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: 6 }}>{b.desc}</div>
              {isEarned && (
                <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700 }}>
                  ✓ EARNED
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}