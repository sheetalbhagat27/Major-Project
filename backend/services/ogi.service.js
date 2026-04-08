// export const calculateOGI = (student) => {
//    return (
//       student.quizAverage * 0.4 +
//       student.assignmentAverage * 0.3 +
//       student.attendance * 0.2 +
//       student.moduleCompletion * 0.1
//    )
// }
// services/ogi.service.js - ✅ CommonJS syntax
function calculateOGI(student) {
  // आपकी OGI calculation logic यहाँ
  const attendance = student.attendancePercentage || 0;
  const assignments = student.assignments?.length || 0;
  const quizzes = student.quizzes?.length || 0;
  
  // Simple OGI formula (customize करें)
  return Math.round((attendance * 0.4 + assignments * 0.3 + quizzes * 0.3) / 10);
}

module.exports = { calculateOGI }; // ✅ CommonJS export
