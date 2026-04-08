const AttendanceForm = () => {
  const [students, setStudents] = useState([]);
  const updateOGI = useUpdateOGI();

  const handleSubmitAttendance = async (formData) => {
    await fetch('/api/attendance', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    
    // Auto refresh students list - OGI दिखेगा
    queryClient.invalidateQueries(['students']);
    
    toast.success('Attendance marked! OGI updated ✅');
  };

  return (
    <div>
      {/* Attendance form */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        {students.map(student => (
          <div key={student._id} className="p-4 bg-gray-50 rounded-xl">
            <p className="font-medium">{student.name}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                student.OGI >= 80 ? 'bg-green-100 text-green-800' :
                student.OGI >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {student.OGI}
              </span>
              <select onChange={() => updateOGI.mutate({ studentId: student._id })}>
                <option>Present</option>
                <option>Absent</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
