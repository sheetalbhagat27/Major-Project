// Dashboard stats में add करें
const stats = [
  { name: 'Total Students', value: totalStudents },
  { name: 'Avg OGI Score', value: avgOGI, color: 'from-purple-500 to-pink-500' },
  { name: 'Top Performers', value: topPerformers, color: 'from-green-500 to-emerald-500' }
];

// Stats card
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {stats.map((stat, idx) => (
    <div key={idx} className={` bg-gradient-to-br  ${stat.color} p-8 rounded-3xl shadow-2xl`}>
      <dt className="text-white/80 text-sm font-medium">{stat.name}</dt>
      <dd className="mt-2 text-4xl font-bold text-white">{stat.value}</dd>
    </div>
  ))}
</div>
