import api from './api';

export const classroomService = {
  // Classrooms
  async getClassrooms() {
    const res = await api.get('/classrooms');
    return res.data;
  },

  async getClassroomById(id) {
    const res = await api.get(`/classrooms/${id}`);
    return res.data;
  },

  async createClassroom(data) {
    const res = await api.post('/classrooms', data);
    return res.data;
  },

  async updateClassroom(id, data) {
    const res = await api.put(`/classrooms/${id}`, data);
    return res.data;
  },

  async deleteClassroom(id) {
    const res = await api.delete(`/classrooms/${id}`);
    return res.data;
  },

  async joinClassroom(joinCode) {
    const res = await api.post('/classrooms/join', { joinCode });
    return res.data;
  },

  async getParticipants(id) {
    const res = await api.get(`/classrooms/${id}/participants`);
    return res.data;
  },

  // Live session toggles
  async startLiveSession(id) {
    const res = await api.post(`/classrooms/${id}/start`);
    return res.data;
  },

  async endLiveSession(id) {
    const res = await api.post(`/classrooms/${id}/end`);
    return res.data;
  },

  // Materials
  async getMaterials(classroomId) {
    const res = await api.get(`/classrooms/${classroomId}/materials`);
    return res.data;
  },

  async uploadMaterial(classroomId, formData) {
    const res = await api.post(`/classrooms/${classroomId}/materials`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async deleteMaterial(materialId) {
    const res = await api.delete(`/materials/${materialId}`);
    return res.data;
  },

  // Attendance
  async getAttendance(classroomId) {
    const res = await api.get(`/classrooms/${classroomId}/attendance`);
    return res.data;
  },

  // Assignments
  async getAssignments(classroomId) {
    const res = await api.get(`/classrooms/${classroomId}/assignments`);
    return res.data;
  },

  async createAssignment(classroomId, formData) {
    const res = await api.post(`/classrooms/${classroomId}/assignments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async getAssignmentById(assignmentId) {
    const res = await api.get(`/assignments/${assignmentId}`);
    return res.data;
  },

  async updateAssignment(assignmentId, data) {
    const res = await api.put(`/assignments/${assignmentId}`, data);
    return res.data;
  },

  async deleteAssignment(assignmentId) {
    const res = await api.delete(`/assignments/${assignmentId}`);
    return res.data;
  },

  // Submissions
  async submitAssignment(assignmentId, formData) {
    const res = await api.post(`/assignments/${assignmentId}/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async getAssignmentSubmissions(assignmentId) {
    const res = await api.get(`/assignments/${assignmentId}/submissions`);
    return res.data;
  },

  async getMySubmission(assignmentId) {
    const res = await api.get(`/assignments/${assignmentId}/my-submission`);
    return res.data;
  },

  async gradeSubmission(submissionId, { marks, feedback }) {
    const res = await api.put(`/submissions/${submissionId}/grade`, { marks, feedback });
    return res.data;
  },

  // Progress Analytics
  async getProgress(classroomId) {
    const res = await api.get(`/classrooms/${classroomId}/progress`);
    return res.data;
  },
};

export default classroomService;
