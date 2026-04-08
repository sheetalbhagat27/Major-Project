// Student detail fetch करें OGI के साथ
export const getStudentDetail = async (id) => {
  const res = await fetch(`/api/students/${id}`);
  return res.json();
};

// Real-time OGI refresh
export const refreshStudentOGI = async (studentId) => {
  await fetch(`/api/students/${studentId}/refresh-ogi`, {
    method: 'POST',
  });
};
