export default function StatsCard({ title, value, sub, icon, color = 'gold' }) {
  const colorMap = {
    gold: 'text-brand-gold',
    red: 'text-brand-red',
    green: 'text-green-400',
    blue: 'text-blue-400',
  };
  return (
    <div className="admin-card flex items-start gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">{title}</p>
        <p className={`text-3xl font-display tracking-wide ${colorMap[color]}`}>{value}</p>
        {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
}
