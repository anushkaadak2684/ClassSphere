import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Video,
  Users,
  FileText,
  Clock,
  ArrowLeft,
  Copy,
  Check,
  Plus,
  Play,
  Upload,
  Trash2,
  Calendar,
  BookOpen,
  TrendingUp,
  Award,
  Crown,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import classroomService from '../services/classroom.service';
import Navbar from '../components/layout/Navbar';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import MaterialList from '../components/materials/MaterialList';
import MaterialUpload from '../components/materials/MaterialUpload';
import AttendanceTable from '../components/classroom/AttendanceTable';
import AssignmentList from '../components/assignments/AssignmentList';
import CreateAssignmentModal from '../components/assignments/CreateAssignmentModal';
import ProgressView from '../components/progress/ProgressView';

export const Classroom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isTeacher } = useAuth();

  const [classroom, setClassroom] = useState(null);
  const [participants, setParticipants] = useState({ teacher: null, students: [] });
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [progressData, setProgressData] = useState(null);

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'materials' | 'assignments' | 'participants' | 'attendance' | 'progress'
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [liveActionLoading, setLiveActionLoading] = useState(false);

  const isClassroomTeacher = isTeacher && classroom?.teacher?._id === user?._id;

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [classData, partsData, matsData, assignData] = await Promise.all([
        classroomService.getClassroomById(id),
        classroomService.getParticipants(id),
        classroomService.getMaterials(id),
        classroomService.getAssignments(id),
      ]);

      setClassroom(classData);
      setParticipants(partsData);
      setMaterials(matsData || []);
      setAssignments(assignData || []);

      // If teacher, fetch attendance
      if (user?.role === 'teacher') {
        try {
          const attData = await classroomService.getAttendance(id);
          setAttendance(attData || []);
        } catch (e) {
          console.warn('[Attendance fetch notice]:', e);
        }
      }

      // Fetch progress
      try {
        const prog = await classroomService.getProgress(id);
        setProgressData(prog);
      } catch (e) {
        console.warn('[Progress fetch notice]:', e);
      }
    } catch (err) {
      console.error('[Classroom fetch error]:', err);
      setError(err.message || 'Failed to load classroom.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [id]);

  const refreshAssignmentsAndProgress = async () => {
    try {
      const [assignData, progData] = await Promise.all([
        classroomService.getAssignments(id),
        classroomService.getProgress(id),
      ]);
      setAssignments(assignData || []);
      setProgressData(progData);
    } catch (e) {
      console.warn('[Refresh error]:', e);
    }
  };

  const copyCode = () => {
    if (classroom?.joinCode) {
      navigator.clipboard.writeText(classroom.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartLive = async () => {
    try {
      setLiveActionLoading(true);
      await classroomService.startLiveSession(id);
      navigate(`/classrooms/${id}/live`);
    } catch (err) {
      setError(err.message || 'Failed to start live session.');
      setLiveActionLoading(false);
    }
  };

  const handleMaterialUploaded = (newMaterial) => {
    setMaterials((prev) => [newMaterial, ...prev]);
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    try {
      await classroomService.deleteMaterial(materialId);
      setMaterials((prev) => prev.filter((m) => m._id !== materialId));
    } catch (err) {
      alert(err.message || 'Failed to delete material.');
    }
  };

  const handleAssignmentCreated = (newAssignment) => {
    setAssignments((prev) => [newAssignment, ...prev]);
    refreshAssignmentsAndProgress();
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment and all submissions?')) return;
    try {
      await classroomService.deleteAssignment(assignmentId);
      setAssignments((prev) => prev.filter((a) => a._id !== assignmentId));
      refreshAssignmentsAndProgress();
    } catch (err) {
      alert(err.message || 'Failed to delete assignment.');
    }
  };

  const handleDeleteClassroom = async () => {
    if (!window.confirm('Are you sure you want to delete this entire classroom and all associated records?')) return;
    try {
      await classroomService.deleteClassroom(id);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message || 'Failed to delete classroom.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <Loader fullScreen text="Loading classroom information..." />
      </div>
    );
  }

  if (error || !classroom) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12 w-full">
          <ErrorMessage message={error || 'Classroom not found'} onRetry={fetchAllData} />
          <div className="mt-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
        </div>

        {/* Classroom Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="brand" size="sm" className="font-semibold uppercase tracking-wider text-3xs">
                  {classroom.subject}
                </Badge>
                {classroom.isLive ? (
                  <Badge variant="live" size="sm" className="font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping mr-1" />
                    LIVE SESSION IN PROGRESS
                  </Badge>
                ) : (
                  <span className="text-3xs font-medium text-slate-400">Class Offline</span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {classroom.name}
              </h1>

              {classroom.description && (
                <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                  {classroom.description}
                </p>
              )}

              {/* Meta bar */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-700">Teacher:</span>
                  <span>{classroom.teacher?.name || 'Instructor'}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{participants.students?.length || 0} Students enrolled</span>
                </div>
                <span>•</span>
                <button
                  onClick={copyCode}
                  title="Click to copy join code"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-xs font-semibold transition-colors"
                >
                  <span>Code: {classroom.joinCode}</span>
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {isClassroomTeacher ? (
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={classroom.isLive ? Video : Play}
                    isLoading={liveActionLoading}
                    onClick={handleStartLive}
                    className={`shadow-md ${classroom.isLive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-600 hover:bg-brand-700'}`}
                  >
                    {classroom.isLive ? 'Enter Live Session' : 'Start Live Class'}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    icon={Upload}
                    onClick={() => setIsUploadOpen(true)}
                  >
                    Upload Material
                  </Button>
                </>
              ) : (
                <Link to={`/classrooms/${classroom._id}/live`}>
                  <Button
                    variant={classroom.isLive ? 'danger' : 'primary'}
                    size="lg"
                    icon={Video}
                    className="shadow-md"
                  >
                    {classroom.isLive ? 'Join Live Class Now' : 'Enter Classroom Theater'}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 mb-6 overflow-x-auto">
          <nav className="flex space-x-6 text-sm font-medium whitespace-nowrap min-w-max">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 relative transition-colors ${
                activeTab === 'overview'
                  ? 'text-brand-600 font-semibold border-b-2 border-brand-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`pb-3 relative transition-colors flex items-center gap-1.5 ${
                activeTab === 'materials'
                  ? 'text-brand-600 font-semibold border-b-2 border-brand-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Materials</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-3xs">
                {materials.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`pb-3 relative transition-colors flex items-center gap-1.5 ${
                activeTab === 'assignments'
                  ? 'text-brand-600 font-semibold border-b-2 border-brand-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Assignments</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-3xs">
                {assignments.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`pb-3 relative transition-colors flex items-center gap-1.5 ${
                activeTab === 'participants'
                  ? 'text-brand-600 font-semibold border-b-2 border-brand-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Participants</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-3xs">
                {participants.students?.length || 0}
              </span>
            </button>
            {isClassroomTeacher && (
              <button
                onClick={() => setActiveTab('attendance')}
                className={`pb-3 relative transition-colors flex items-center gap-1.5 ${
                  activeTab === 'attendance'
                    ? 'text-brand-600 font-semibold border-b-2 border-brand-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Attendance</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-3xs">
                  {attendance.length}
                </span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('progress')}
              className={`pb-3 relative transition-colors flex items-center gap-1.5 ${
                activeTab === 'progress'
                  ? 'text-brand-600 font-semibold border-b-2 border-brand-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Progress Analytics</span>
              <TrendingUp className="w-3.5 h-3.5 text-brand-500" />
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Classroom Summary
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {classroom.description || 'No specific instructions provided.'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-3xs text-slate-400 font-semibold uppercase">Subject</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{classroom.subject}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-3xs text-slate-400 font-semibold uppercase">Enrolled Students</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{participants.students?.length || 0}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-3xs text-slate-400 font-semibold uppercase">Join Code</span>
                    <p className="text-xs font-mono font-bold text-brand-600 mt-0.5">{classroom.joinCode}</p>
                  </div>
                </div>
              </div>

              {/* Recent Materials & Assignments preview */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Upcoming Assignments
                  </h3>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className="text-xs text-brand-600 font-semibold hover:underline"
                  >
                    View All
                  </button>
                </div>
                {assignments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">No assignments posted yet.</p>
                ) : (
                  <div className="space-y-2">
                    {assignments.slice(0, 3).map((a) => (
                      <div
                        key={a._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 text-xs"
                      >
                        <span className="font-semibold text-slate-800">{a.title}</span>
                        <span className="text-3xs text-slate-500">
                          Due {new Date(a.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Teacher details & Danger Zone */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Instructor
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm border border-brand-200">
                    {classroom.teacher?.name?.charAt(0).toUpperCase() || 'T'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{classroom.teacher?.name}</h4>
                    <p className="text-xs text-slate-500">{classroom.teacher?.email}</p>
                  </div>
                </div>
              </div>

              {isClassroomTeacher && (
                <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100">
                  <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-1">
                    Danger Zone
                  </h4>
                  <p className="text-3xs text-rose-600 mb-4">
                    Deleting this classroom will remove all enrollments, assignments, submissions, and materials.
                  </p>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={handleDeleteClassroom}
                    className="w-full text-xs"
                  >
                    Delete Classroom
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Learning Materials & Handouts</h3>
                <p className="text-xs text-slate-500">
                  Download syllabus, slides, and lecture notes shared by the instructor.
                </p>
              </div>
              {isClassroomTeacher && (
                <Button
                  variant="primary"
                  size="md"
                  icon={Plus}
                  onClick={() => setIsUploadOpen(true)}
                >
                  Upload Material
                </Button>
              )}
            </div>

            <MaterialList
              materials={materials}
              isTeacher={isClassroomTeacher}
              onDeleteMaterial={handleDeleteMaterial}
            />
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Course Assignments</h3>
                <p className="text-xs text-slate-500">
                  {isClassroomTeacher
                    ? 'Create assignments, track student submissions, and review grades.'
                    : 'Download assignment briefs, submit your work, and view grades/feedback.'}
                </p>
              </div>
              {isClassroomTeacher && (
                <Button
                  variant="primary"
                  size="md"
                  icon={Plus}
                  onClick={() => setIsCreateAssignmentOpen(true)}
                >
                  Create Assignment
                </Button>
              )}
            </div>

            <AssignmentList
              assignments={assignments}
              isTeacher={isClassroomTeacher}
              onDeleteAssignment={handleDeleteAssignment}
              onAssignmentUpdated={refreshAssignmentsAndProgress}
            />
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Classroom Participants</h3>
              <p className="text-xs text-slate-500">
                View instructor and enrolled student roster.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
              {/* Instructor */}
              <div>
                <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Instructor
                </span>
                <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center border border-brand-200">
                      {classroom.teacher?.name?.charAt(0).toUpperCase() || 'T'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{classroom.teacher?.name}</p>
                      <p className="text-3xs text-slate-400">{classroom.teacher?.email}</p>
                    </div>
                  </div>
                  <Badge variant="brand" size="sm">
                    <Crown className="w-2.5 h-2.5 mr-0.5" /> Teacher
                  </Badge>
                </div>
              </div>

              {/* Students */}
              <div>
                <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Enrolled Students ({participants.students?.length || 0})
                </span>
                {participants.students?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No students have enrolled in this classroom yet.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {participants.students.map((s) => (
                      <div key={s._id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                            {s.name?.charAt(0).toUpperCase() || 'S'}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{s.name}</p>
                            <p className="text-3xs text-slate-400">{s.email}</p>
                          </div>
                        </div>
                        <span className="text-3xs text-slate-400">
                          Enrolled {new Date(s.enrolledAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && isClassroomTeacher && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Live Session Attendance Log</h3>
              <p className="text-xs text-slate-500">
                Automatic tracking of student joins, leaves, and cumulative participation durations.
              </p>
            </div>

            <AttendanceTable records={attendance} />
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Classroom Progress & Performance</h3>
              <p className="text-xs text-slate-500">
                {isClassroomTeacher
                  ? 'Overview of student attendance and assignment performance across the class.'
                  : 'Your personal attendance rate, turned in assignments, and graded scores.'}
              </p>
            </div>

            <ProgressView
              progressData={progressData}
              isTeacher={isClassroomTeacher}
            />
          </div>
        )}
      </main>

      {/* Upload Material Modal */}
      <MaterialUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        classroomId={id}
        onUploaded={handleMaterialUploaded}
      />

      {/* Create Assignment Modal */}
      <CreateAssignmentModal
        isOpen={isCreateAssignmentOpen}
        onClose={() => setIsCreateAssignmentOpen(false)}
        classroomId={id}
        onCreated={handleAssignmentCreated}
      />
    </div>
  );
};

export default Classroom;
