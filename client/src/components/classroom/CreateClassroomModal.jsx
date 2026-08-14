import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import classroomService from '../../services/classroom.service';
import { Plus } from 'lucide-react';

export const CreateClassroomModal = ({ isOpen, onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.subject.trim()) {
      setError('Please provide a classroom name and subject.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const newClassroom = await classroomService.createClassroom(formData);
      setFormData({ name: '', subject: '', description: '' });
      onCreated(newClassroom);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create classroom.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Classroom">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
            {error}
          </div>
        )}

        <Input
          label="Classroom Name"
          name="name"
          placeholder="e.g. CS201 - Advanced Data Structures"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <Input
          label="Subject / Topic"
          name="subject"
          placeholder="e.g. Computer Science"
          value={formData.subject}
          onChange={handleChange}
          required
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Description (Optional)
          </label>
          <textarea
            name="description"
            rows="3"
            placeholder="Brief overview of the syllabus, objectives, or instructions..."
            value={formData.description}
            onChange={handleChange}
            className="block w-full rounded-lg border border-slate-300 bg-white text-slate-900 text-sm px-3.5 py-2.5 placeholder-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" icon={Plus} isLoading={loading}>
            Create Classroom
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateClassroomModal;
