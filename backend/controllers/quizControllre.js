// quizzes/:id/attempts/evaluate POST route के लिए
const evaluateQuizAttempt = async (req, res) => {
  const { studentId, marksObtained } = req.body;
  
  const quiz = await Quiz.findById(req.params.id);
  const attempt = quiz.attempts.find(a => a.studentId.toString() === studentId);
  
  attempt.marksObtained = marksObtained;
  await quiz.save();

  // ✅ OGI Update
  const student = await Student.findById(studentId);
  student.OGI = calculateOGI(student);
  await student.save();

  res.json({ message: 'Quiz evaluated' });
};
