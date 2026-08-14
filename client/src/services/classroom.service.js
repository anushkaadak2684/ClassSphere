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
};

export default classroomService;
