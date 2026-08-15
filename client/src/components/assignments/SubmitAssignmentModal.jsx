import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, Send } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import classroomService from '../../services/classroom.service';

export const SubmitAssignmentModal = ({ isOpen, onClose, assignment, onSubmitted }) => {
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!assignment) return null;

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
    if (!file) {
      setError('Please choose a file to submit.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('comment', comment.trim());

      const result = await classroomService.submitAssignment(assignment._id, formData);
      setFile(null);
      setComment('');
      onSubmitted(result);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit assignment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Submit Work: ${assignment.title}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
          <p className="font-semibold text-slate-800">Due: {new Date(assignment.dueDate).toLocaleString()}</p>
          <p className="text-slate-500 text-3xs mt-0.5">Maximum Marks: {assignment.maxMarks}</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
            {error}
          </div>
        )}

        {/* File Upload Dropzone */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Upload Solution File (PDF, DOCX, ZIP, Code)
          </label>
          <div className="relative border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-colors bg-slate-50/50">
            <input
              type="file"
              onChange={handleFileChange}
              required
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {file ? (
              <div className="flex items-center gap-2 text-brand-600">
                <FileText className="w-6 h-6" />
                <span className="text-xs font-semibold truncate max-w-xs">{file.name}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud className="w-7 h-7 text-slate-400 mb-1" />
                <p className="text-xs font-medium text-slate-700">Click or drag your completed work here</p>
                <p className="text-3xs text-slate-400">PDF, DOC, ZIP up to 25MB</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Student Comment (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="Add any notes or context for the instructor..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 bg-white text-slate-900 text-sm px-3.5 py-2 placeholder-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={Send}
            isLoading={loading}
            disabled={!file}
          >
            {loading ? 'Submitting...' : 'Turn In Assignment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SubmitAssignmentModal;
