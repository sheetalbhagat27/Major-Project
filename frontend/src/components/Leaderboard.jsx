const Leaderboard = () => {
  const { data: students } = useStudents();

  const topStudents = students?.sort((a, b) => b.OGI - a.OGI).slice(0, 10);

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-8 rounded-3xl">
      <h2 className="text-3xl font-bold mb-8">🏆 OGI Leaderboard</h2>
      <div className="space-y-4">
        {topStudents?.map((student, idx) => (
          <div key={student._id} className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center font-bold text-xl">
              {idx + 1}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{student.name}</p>
              <p className="text-sm opacity-80">{student.enrollmentId}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-300">{student.OGI}</div>
              <div className="w-24 bg-white/20 rounded-full h-2 mt-1">
                <div 
                  className="bg-yellow-300 h-2 rounded-full" 
                  style={{ width: `${student.OGI}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
