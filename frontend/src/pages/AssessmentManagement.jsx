// ============================================
// Assessment Management Page
// Assignments and Quizzes with create, evaluate, and views
// ============================================

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineClipboardList, HiOutlinePlus, HiOutlineCheck,
  HiOutlineStar, HiOutlineClock, HiOutlineEye, HiOutlineX,
} from 'react-icons/hi';

const AssessmentManagement = () => {
  const { API_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('assignments');
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assignment modal states
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '', description: '', deadline: '', maxMarks: 100, submissionType: 'PDF',
  });

  // Quiz modal states
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '', duration: 30, totalMarks: 50, attemptLimit: 1, questions: [],
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '', options: ['', '', '', ''], correctAnswer: '', explanation: '',
  });

  // View submission/attempt modals
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [evalData, setEvalData] = useState({ marks: '', feedback: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assRes, quizRes] = await Promise.all([
        axios.get(`${API_URL}/assessment/assignments`),
        axios.get(`${API_URL}/assessment/quizzes`),
      ]);
      setAssignments(assRes.data);
      setQuizzes(quizRes.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ==================== ASSIGNMENT HANDLERS ====================
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/assessment/assignments`, assignmentForm);
      setShowCreateAssignment(false);
      setAssignmentForm({ title: '', description: '', deadline: '', maxMarks: 100, submissionType: 'PDF' });
      fetchData();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleEvaluate = async (assignmentId, studentId) => {
    try {
      await axios.post(`${API_URL}/assessment/assignments/${assignmentId}/evaluate`, {
        studentId,
        marks: Number(evalData.marks),
        feedback: evalData.feedback,
      });
      setEvalData({ marks: '', feedback: '' });
      fetchData();
      // Refresh selected assignment
      const updated = assignments.find((a) => a._id === assignmentId);
      if (updated) setSelectedAssignment({ ...updated });
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // ==================== QUIZ HANDLERS ====================
  const addQuestion = () => {
    if (!currentQuestion.questionText || !currentQuestion.correctAnswer) return;
    setQuizForm({
      ...quizForm,
      questions: [...quizForm.questions, { ...currentQuestion }],
    });
    setCurrentQuestion({ questionText: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' });
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/assessment/quizzes`, quizForm);
      setShowCreateQuiz(false);
      setQuizForm({ title: '', duration: 30, totalMarks: 50, attemptLimit: 1, questions: [] });
      fetchData();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // Status badge colors
  const statusBadge = {
    NotSubmitted: { bg: '#64748b20', color: '#64748b' },
    Submitted: { bg: '#3b82f620', color: '#3b82f6' },
    LateSubmitted: { bg: '#f59e0b20', color: '#f59e0b' },
    Evaluated: { bg: '#22c55e20', color: '#22c55e' },
  };

  if (loading) return <div className="page-loading">Loading assessments...</div>;

  return (
    <div className="assessment-page">
      <h2 className="page-title">
        <HiOutlineClipboardList /> Assessment Management
      </h2>

      {/* Tab Switch */}
      <div className="filter-tabs">
        <button className={`filter-tab ${activeTab === 'assignments' ? 'filter-tab-active' : ''}`}
          onClick={() => setActiveTab('assignments')}>
          Assignments ({assignments.length})
        </button>
        <button className={`filter-tab ${activeTab === 'quizzes' ? 'filter-tab-active' : ''}`}
          onClick={() => setActiveTab('quizzes')}>
          Quizzes ({quizzes.length})
        </button>
      </div>

      {/* ==================== ASSIGNMENTS TAB ==================== */}
      {activeTab === 'assignments' && (
        <div>
          <div className="section-header">
            <button className="btn-primary" onClick={() => setShowCreateAssignment(true)}>
              <HiOutlinePlus /> Create Assignment
            </button>
          </div>

          <div className="assessment-grid">
            {assignments.map((a) => (
              <div key={a._id} className="assessment-card">
                <div className="assessment-card-header">
                  <h3>{a.title}</h3>
                  <span className="status-badge"
                    style={{ backgroundColor: a.status === 'Active' ? '#22c55e20' : '#64748b20', color: a.status === 'Active' ? '#22c55e' : '#64748b' }}>
                    {a.status}
                  </span>
                </div>
                <p className="assessment-desc">{a.description}</p>
                <div className="assessment-meta">
                  <span><HiOutlineClock /> {new Date(a.deadline).toLocaleDateString()}</span>
                  <span><HiOutlineStar /> {a.maxMarks} marks</span>
                  <span>{a.submissions?.length || 0} submissions</span>
                </div>
                <button className="btn-secondary" onClick={() => setSelectedAssignment(a)}>
                  <HiOutlineEye /> View Submissions
                </button>
              </div>
            ))}
          </div>

          {/* Create Assignment Modal */}
          {showCreateAssignment && (
            <div className="modal-overlay" onClick={() => setShowCreateAssignment(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Create Assignment</h3>
                <form onSubmit={handleCreateAssignment} className="modal-form">
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input type="text" className="form-input" required
                      value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-input form-textarea"
                      value={assignmentForm.description} onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Deadline</label>
                      <input type="date" className="form-input" required
                        value={assignmentForm.deadline} onChange={(e) => setAssignmentForm({ ...assignmentForm, deadline: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Max Marks</label>
                      <input type="number" className="form-input"
                        value={assignmentForm.maxMarks} onChange={(e) => setAssignmentForm({ ...assignmentForm, maxMarks: Number(e.target.value) })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Type</label>
                      <select className="form-input" value={assignmentForm.submissionType}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, submissionType: e.target.value })}>
                        <option>PDF</option>
                        <option>Image</option>
                        <option>JPG</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={() => setShowCreateAssignment(false)}>Cancel</button>
                    <button type="submit" className="btn-primary">Create</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* View Submissions Modal */}
          {selectedAssignment && (
            <div className="modal-overlay" onClick={() => setSelectedAssignment(null)}>
              <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3 className="modal-title">Submissions — {selectedAssignment.title}</h3>
                  <button className="modal-close" onClick={() => setSelectedAssignment(null)}><HiOutlineX /></button>
                </div>
                <div className="submissions-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr><th>Student</th><th>File</th><th>Submitted</th><th>Status</th><th>Marks</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {selectedAssignment.submissions?.map((s, i) => (
                        <tr key={i}>
                          <td>{s.studentId?.name || s.studentId}</td>
                          <td>{s.fileUrl ? <a href={s.fileUrl} className="link">View</a> : '—'}</td>
                          <td>{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}</td>
                          <td>
                            <span className="status-badge"
                              style={{ backgroundColor: statusBadge[s.status]?.bg, color: statusBadge[s.status]?.color }}>
                              {s.status}
                            </span>
                          </td>
                          <td>{s.status === 'Evaluated' ? `${s.marks}/${selectedAssignment.maxMarks}` : '—'}</td>
                          <td>
                            {s.status !== 'Evaluated' && s.status !== 'NotSubmitted' && (
                              <div className="eval-inline">
                                <input type="number" placeholder="Marks" className="form-input-sm"
                                  value={evalData.marks} onChange={(e) => setEvalData({ ...evalData, marks: e.target.value })} />
                                <input type="text" placeholder="Feedback" className="form-input-sm"
                                  value={evalData.feedback} onChange={(e) => setEvalData({ ...evalData, feedback: e.target.value })} />
                                <button className="btn-sm btn-primary"
                                  onClick={() => handleEvaluate(selectedAssignment._id, s.studentId?._id || s.studentId)}>
                                  <HiOutlineCheck /> Evaluate
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== QUIZZES TAB ==================== */}
      {activeTab === 'quizzes' && (
        <div>
          <div className="section-header">
            <button className="btn-primary" onClick={() => setShowCreateQuiz(true)}>
              <HiOutlinePlus /> Create Quiz
            </button>
          </div>

          <div className="assessment-grid">
            {quizzes.map((q) => (
              <div key={q._id} className="assessment-card">
                <div className="assessment-card-header">
                  <h3>{q.title}</h3>
                  <span className="status-badge" style={{ backgroundColor: '#6366f120', color: '#6366f1' }}>
                    {q.questions?.length || 0} Qs
                  </span>
                </div>
                <div className="assessment-meta">
                  <span><HiOutlineClock /> {q.duration} min</span>
                  <span><HiOutlineStar /> {q.totalMarks} marks</span>
                  <span>Limit: {q.attemptLimit}</span>
                  <span>{q.attempts?.length || 0} attempts</span>
                </div>
                <button className="btn-secondary" onClick={() => setSelectedQuiz(q)}>
                  <HiOutlineEye /> View Attempts
                </button>
              </div>
            ))}
          </div>

          {/* Create Quiz Modal */}
          {showCreateQuiz && (
            <div className="modal-overlay" onClick={() => setShowCreateQuiz(false)}>
              <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Create Quiz</h3>
                <form onSubmit={handleCreateQuiz} className="modal-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Title</label>
                      <input type="text" className="form-input" required
                        value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Duration (min)</label>
                      <input type="number" className="form-input"
                        value={quizForm.duration} onChange={(e) => setQuizForm({ ...quizForm, duration: Number(e.target.value) })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Attempt Limit</label>
                      <input type="number" className="form-input"
                        value={quizForm.attemptLimit} onChange={(e) => setQuizForm({ ...quizForm, attemptLimit: Number(e.target.value) })} />
                    </div>
                  </div>

                  {/* Add Questions */}
                  <div className="quiz-question-builder">
                    <h4>Add Questions ({quizForm.questions.length} added)</h4>
                    <div className="form-group">
                      <input type="text" className="form-input" placeholder="Question text"
                        value={currentQuestion.questionText}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })} />
                    </div>
                    <div className="form-row">
                      {currentQuestion.options.map((opt, i) => (
                        <div key={i} className="form-group">
                          <input type="text" className="form-input" placeholder={`Option ${i + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...currentQuestion.options];
                              newOpts[i] = e.target.value;
                              setCurrentQuestion({ ...currentQuestion, options: newOpts });
                            }} />
                        </div>
                      ))}
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <input type="text" className="form-input" placeholder="Correct answer (must match an option)"
                          value={currentQuestion.correctAnswer}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <input type="text" className="form-input" placeholder="Explanation"
                          value={currentQuestion.explanation}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })} />
                      </div>
                    </div>
                    <button type="button" className="btn-secondary" onClick={addQuestion}>
                      <HiOutlinePlus /> Add Question
                    </button>

                    {/* Listed questions */}
                    {quizForm.questions.length > 0 && (
                      <div className="question-list">
                        {quizForm.questions.map((q, i) => (
                          <div key={i} className="question-preview">
                            <strong>Q{i + 1}:</strong> {q.questionText}
                            <span className="correct-badge">✓ {q.correctAnswer}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={() => setShowCreateQuiz(false)}>Cancel</button>
                    <button type="submit" className="btn-primary">Create Quiz</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* View Attempts Modal */}
          {selectedQuiz && (
            <div className="modal-overlay" onClick={() => setSelectedQuiz(null)}>
              <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3 className="modal-title">Attempts — {selectedQuiz.title}</h3>
                  <button className="modal-close" onClick={() => setSelectedQuiz(null)}><HiOutlineX /></button>
                </div>
                {selectedQuiz.attempts?.length > 0 ? (
                  <>
                    <div className="quiz-avg">
                      Class Average: <strong>
                        {(selectedQuiz.attempts.reduce((s, a) => s + a.score, 0) / selectedQuiz.attempts.length).toFixed(1)}
                      </strong> / {selectedQuiz.totalMarks}
                    </div>
                    <table className="data-table">
                      <thead>
                        <tr><th>Student</th><th>Score</th><th>Attempted At</th></tr>
                      </thead>
                      <tbody>
                        {selectedQuiz.attempts.map((a, i) => (
                          <tr key={i}>
                            <td>{a.studentId?.name || a.studentId}</td>
                            <td>{a.score}/{selectedQuiz.totalMarks}</td>
                            <td>{new Date(a.attemptedAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <p className="no-data">No attempts yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssessmentManagement;
