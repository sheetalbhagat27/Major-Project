// Student profile के top में
<div className="grid grid-cols-3 gap-6 mb-8">
  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-2xl">
    <h3 className="text-3xl font-bold">{student.OGI}</h3>
    <p className="text-blue-100">OGI Score</p>
    <div className="mt-4">
      <div className="w-full bg-white/20 rounded-full h-3">
        <div 
          className="bg-white h-3 rounded-full transition-all duration-1000" 
          style={{ width: `${student.OGI}%` }}
        />
      </div>
    </div>
  </div>
  
  <div className="p-8 bg-white border rounded-2xl shadow-lg">
    <h3 className="text-2xl font-bold text-gray-800">{student.attendancePercentage}%</h3>
    <p className="text-gray-600">Attendance</p>
  </div>
  
  <div className="p-8 bg-white border rounded-2xl shadow-lg">
    <h3 className="text-2xl font-bold text-green-600">{student.status}</h3>
    <p className="text-gray-600">Status</p>
  </div>
</div>
