import React, { useState } from 'react';
import { Plus, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import classroomService from '../../services/classroom.service';

export const CreateAssignmentModal = ({ isOpen, onClose, classroomId, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 25 * 1024 * 1024) {
        setError('File exceeds 25MB limit.');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      setError('Please provide an assignment title and due date.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('dueDate', new Date(dueDate).toISOString());
      formData.append('maxMarks', maxMarks);
      if (file) {
        formData.append('file', file);
      }

      const newAssignment = await classroomService.createAssignment(classroomId, formData);
      setTitle('');
      setDescription('');
      setDueDate('');
      setMaxMarks(100);
      setFile(null);
      onCreated(newAssignment);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create assignment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Assignment">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
            {error}
          </div>
        )}

        <Input
          label="Assignment Title"
          placeholder="e.g. Assignment 1: Binary Search Tree Implementation"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Instructions & Description
          </label>
          <textarea
            rows="3"
            placeholder="Detailed instructions, formatting requirements, and rubric..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 bg-white text-slate-900 text-sm px-3.5 py-2 placeholder-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Due Date & Time"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />

          <Input
            label="Maximum Marks"
            type="number"
            min="1"
            value={maxMarks}
            onChange={(e) => setMaxMarks(e.target.value)}
            required
          />
        </div>

        {/* Optional Attachment Dropzone */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Attachment / Starter Code (Optional)
          </label>
          <div className="relative border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors bg-slate-50/50">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {file ? (
              <div className="flex items-center gap-2 text-brand-600">
                <FileText className="w-5 h-5" />
                <span className="text-xs font-semibold truncate max-w-xs">{file.name}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                <p className="text-xs font-medium text-slate-700">Attach problem sheet or template file</p>
                <p className="text-3xs text-slate-400">PDF, DOC, ZIP up to 25MB</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" icon={Plus} isLoading={loading}>
            Publish Assignment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateAssignmentModal;
