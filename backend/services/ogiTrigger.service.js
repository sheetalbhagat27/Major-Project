import Student from '../models/Student.js';
import { calculateOGI } from './ogi.service.js';

export const updateStudentOGI = async (studentId) => {
  const student = await Student.findById(studentId);
  if (student) {
    student.OGI = calculateOGI(student);
    await student.save();
    console.log(`✅ OGI updated for student: ${student.name}`);
  }
};
