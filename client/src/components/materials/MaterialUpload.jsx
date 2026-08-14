import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import classroomService from '../../services/classroom.service';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

export const MaterialUpload = ({ isOpen, onClose, classroomId, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
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
      if (!name) {
        setName(selectedFile.name);
      }
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name || file.name);
      formData.append('description', description);

      const newMaterial = await classroomService.uploadMaterial(classroomId, formData);
      setFile(null);
      setName('');
      setDescription('');
      onUploaded(newMaterial);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to upload material.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Classroom Material">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
            {error}
          </div>
        )}

        {/* File Dropzone / Picker */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Select File (PDF, Word, PPT, Image — max 25MB)
          </label>
          <div className="relative border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors bg-slate-50/50">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
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
                <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-xs font-medium text-slate-700">
                  Click or drag file here to upload
                </p>
                <p className="text-3xs text-slate-400 mt-1">PDF, DOC, PPTX, PNG up to 25MB</p>
              </div>
            )}
          </div>
        </div>

        <Input
          label="Display Name"
          placeholder="e.g. Lecture 1 - Introduction Slides.pdf"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Description (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="Notes or chapter details for this file..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            icon={UploadCloud}
            isLoading={loading}
            disabled={!file}
          >
            {loading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MaterialUpload;
