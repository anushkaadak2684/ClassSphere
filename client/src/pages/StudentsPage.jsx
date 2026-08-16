import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Mail,
  Calendar,
  Search,
  RefreshCw,
  UserCheck,
  TrendingUp,
  Award,
  FileCheck2,
  CalendarCheck,
  Eye,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import classroomService from '../services/classroom.service';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

export const StudentsPage = () => {
  const { user, isTeacher } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [studentsRoster, setStudentsRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');

  // Student Details Modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentClassroom, setSelectedStudentClassroom] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchRoster = async () => {
    try {
      setLoading(true);
      const classList = await classroomService.getClassrooms();
      setClassrooms(classList || []);

      if (isTeacher) {
        // For teacher, fetch classroom progress for each classroom to get active student metrics
        const rosterPromises = (classList || []).map(async (c) => {
          try {
            const prog = await classroomService.getProgress(c._id);
            const studentList = prog?.students || [];
            return studentList.map((s) => ({
              ...s,
              classroom: c,
            }));
          } catch (err) {
            console.warn(`[Progress fetch notice for class ${c._id}]:`, err);
            return [];
          }
        });

        const nestedRosters = await Promise.all(rosterPromises);
        setStudentsRoster(nestedRosters.flat());
      } else {
        // For student, fetch classmates & teachers
        const classmatesPromises = (classList || []).map(async (c) => {
          try {
            const parts = await classroomService.getParticipants(c._id);
            return {
              classroom: c,
              teacher: parts.teacher,
              students: parts.students || [],
            };
          } catch {
            return { classroom: c, teacher: null, students: [] };
          }
        });
        const results = await Promise.all(classmatesPromises);
        setStudentsRoster(results);
      }
    } catch (err) {
      console.error('[StudentsPage fetch error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [isTeacher]);

  const handleOpenStudentDetails = async (studentItem) => {
    setSelectedStudent(studentItem.student);
    setSelectedStudentClassroom(studentItem.classroom);
    try {
      setLoadingDetails(true);
      const data = await classroomService.getStudentClassroomDetails(
        studentItem.classroom._id,
        studentItem.student._id
      );
      setStudentDetails(data);
    } catch (err) {
      console.error('[Student details fetch error]:', err);
      // Fallback with current row data if API details encounter an issue
      setStudentDetails({
        student: studentItem.student,
        classroom: studentItem.classroom,
        performance: {
          attendancePercentage: studentItem.attendancePercentage || 0,
          attendedSessions: studentItem.attendedSessions || 0,
          totalSessions: studentItem.totalSessions || 0,
          completedAssignments: studentItem.completedAssignments || 0,
          totalAssignments: studentItem.totalAssignments || 0,
          averageMarks: studentItem.averageScore || 0,
          pendingAssignments: Math.max(0, (studentItem.totalAssignments || 0) - (studentItem.completedAssignments || 0)),
        },
        assignmentHistory: [],
        attendanceHistory: [],
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
    setSelectedStudentClassroom(null);
    setStudentDetails(null);
  };

  // Filtered Roster for Teacher
  const filteredTeacherRoster = isTeacher
    ? studentsRoster.filter((item) => {
        const q = searchQuery.toLowerCase();
        const studentName = item.student?.name?.toLowerCase() || '';
        const studentEmail = item.student?.email?.toLowerCase() || '';
        const className = item.classroom?.name?.toLowerCase() || '';
        const matchesQuery = studentName.includes(q) || studentEmail.includes(q) || className.includes(q);

        if (selectedClassFilter === 'all') return matchesQuery;
        return matchesQuery && item.classroom?._id === selectedClassFilter;
      })
    : [];

  const formatDuration = (seconds = 0) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  return (
    <AppLayout
      title={isTeacher ? 'Student Management Roster' : 'Classmates & Instructors'}
      subtitle={isTeacher ? 'Performance & Academic Tracking' : 'Academic Network'}
      actions={
        <button
          onClick={fetchRoster}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Refresh roster"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      }
    >
      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {isTeacher && classrooms.length > 0 && (
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="all">All Classrooms ({classrooms.length})</option>
              {classrooms.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.subject})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>
            {isTeacher
              ? `${filteredTeacherRoster.length} student records found`
              : `${classrooms.length} enrolled subjects`}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-colors">
          <Loader size="lg" text="Retrieving student performance roster..." />
        </div>
      ) : classrooms.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 transition-colors">
          <EmptyState
            icon={Users}
            title={isTeacher ? 'No classrooms created' : 'No classrooms enrolled'}
            description={
              isTeacher
                ? 'Create a classroom and share the join code with your students to manage student rosters.'
                : 'Join classrooms to view peers and instructors.'
            }
          />
        </div>
      ) : isTeacher ? (
        /* TEACHER: STUDENT MANAGEMENT / PERFORMANCE ROSTER */
        filteredTeacherRoster.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No students found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No enrolled students matched your search criteria. Share your classroom codes to onboard students.
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Classroom</th>
                    <th className="py-3.5 px-4">Attendance</th>
                    <th className="py-3.5 px-4">Assignments</th>
                    <th className="py-3.5 px-4">Avg. Marks</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredTeacherRoster.map((item, idx) => {
                    const attRate = item.attendancePercentage || 0;
                    const avgMarks = item.averageScore || 0;
                    return (
                      <tr
                        key={`${item.classroom?._id}-${item.student?._id}-${idx}`}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs shrink-0 border border-brand-200 dark:border-brand-800">
                              {item.student?.avatarUrl ? (
                                <img
                                  src={item.student.avatarUrl}
                                  alt={item.student.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                item.student?.name?.charAt(0).toUpperCase() || 'S'
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-900 dark:text-white truncate block">
                                {item.student?.name}
                              </span>
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate block">
                                {item.student?.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[160px]">
                            {item.classroom?.name}
                          </span>
                          <span className="text-[10px] text-brand-600 dark:text-brand-400 font-medium">
                            {item.classroom?.subject}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              attRate >= 75
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            }`}>
                              {attRate}%
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden lg:inline">
                              ({item.attendedSessions || 0}/{item.totalSessions || 0} classes)
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.completedAssignments || 0}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500">
                            {' '}/ {item.totalAssignments || 0}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {item.gradedCount > 0 ? (
                            <span className={`font-mono font-bold text-[11px] ${
                              avgMarks >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                              avgMarks >= 60 ? 'text-indigo-600 dark:text-indigo-400' :
                              'text-amber-600 dark:text-amber-400'
                            }`}>
                              {avgMarks}%
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">Unassigned</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Eye}
                            onClick={() => handleOpenStudentDetails(item)}
                            className="text-xs"
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )
      ) : (
        /* STUDENT: CLASSMATES & INSTRUCTORS VIEW */
        <div className="space-y-8">
          {studentsRoster.map((group) => (
            <Card key={group.classroom._id} className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    {group.classroom.subject}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {group.classroom.name}
                  </h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {group.students.length} Classmates
                </span>
              </div>

              {/* Teacher */}
              {group.teacher && (
                <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-sm border border-brand-200 dark:border-brand-800">
                      {group.teacher.avatarUrl ? (
                        <img src={group.teacher.avatarUrl} alt={group.teacher.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        group.teacher.name?.charAt(0).toUpperCase() || 'T'
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{group.teacher.name}</span>
                        <Badge variant="brand" size="sm" className="text-[10px]">Instructor</Badge>
                      </div>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">{group.teacher.email}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Classmates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {group.students.map((student) => (
                  <div
                    key={student._id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {student.avatarUrl ? (
                        <img src={student.avatarUrl} alt={student.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        student.name?.charAt(0).toUpperCase() || 'S'
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{student.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{student.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* INDIVIDUAL STUDENT DETAILS MODAL DRAWER */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-base border border-brand-200 dark:border-brand-800">
                  {selectedStudent.avatarUrl ? (
                    <img src={selectedStudent.avatarUrl} alt={selectedStudent.name} className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    selectedStudent.name?.charAt(0).toUpperCase() || 'S'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedStudent.name}</h3>
                    <Badge variant="brand" size="sm" className="capitalize">{selectedStudent.role || 'Student'}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{selectedStudent.email}</p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {loadingDetails ? (
                <div className="py-16 flex flex-col items-center justify-center">
                  <Loader size="md" text="Loading individual performance logs..." />
                </div>
              ) : (
                <>
                  {/* Classroom Context */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Performance in: <strong className="text-slate-900 dark:text-white">{selectedStudentClassroom?.name}</strong>
                    </span>
                    <span className="font-semibold text-brand-600 dark:text-brand-400">
                      {selectedStudentClassroom?.subject}
                    </span>
                  </div>

                  {/* Performance KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Attendance
                      </span>
                      <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                        {studentDetails?.performance?.attendancePercentage || 0}%
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {studentDetails?.performance?.attendedSessions || 0}/{studentDetails?.performance?.totalSessions || 0} classes
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Completed
                      </span>
                      <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        {studentDetails?.performance?.completedAssignments || 0}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        of {studentDetails?.performance?.totalAssignments || 0} total
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Pending
                      </span>
                      <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
                        {studentDetails?.performance?.pendingAssignments || 0}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Due assignments</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Avg. Marks
                      </span>
                      <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                        {studentDetails?.performance?.averageMarks || 0}%
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {studentDetails?.performance?.gradedCount || 0} graded
                      </span>
                    </div>
                  </div>

                  {/* Assignment History Section */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                      Coursework & Assignment History
                    </h4>
                    {!studentDetails?.assignmentHistory || studentDetails.assignmentHistory.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3">No assignments posted for this classroom yet.</p>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
                        {studentDetails.assignmentHistory.map((item) => (
                          <div key={item._id} className="p-3.5 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-900 dark:text-white block truncate">
                                {item.title}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Due: {new Date(item.dueDate).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                item.submissionStatus === 'graded' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                                item.submissionStatus === 'submitted' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :
                                item.submissionStatus === 'overdue' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800' :
                                'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              }`}>
                                {item.submissionStatus}
                              </span>

                              {item.marks !== null && (
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                  {item.marks}/{item.maxMarks}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Attendance History Section */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                      Session Attendance Log
                    </h4>
                    {!studentDetails?.attendanceHistory || studentDetails.attendanceHistory.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3">No live lecture sessions recorded for this student.</p>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
                        {studentDetails.attendanceHistory.map((att) => (
                          <div key={att._id} className="p-3.5 bg-white dark:bg-slate-900 flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white block">
                                {new Date(att.sessionDate || att.joinedAt).toLocaleDateString(undefined, {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Duration: {formatDuration(att.duration)}
                              </span>
                            </div>

                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              att.status === 'present'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            }`}>
                              {att.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex justify-end">
              <Button variant="outline" size="sm" onClick={handleCloseModal}>
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default StudentsPage;
