import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import classroomService from '../../services/classroom.service';
import { LogIn } from 'lucide-react';

export const JoinClassroomModal = ({ isOpen, onClose, onJoined, onClassroomJoined }) => {
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanCode = joinCode.trim().toUpperCase();
    if (!cleanCode) {
      setError('Please enter a classroom code.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await classroomService.joinClassroom(cleanCode);
      setJoinCode('');
      const callback = onJoined || onClassroomJoined;
      if (typeof callback === 'function') {
        callback(result.classroom || result);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to join classroom. Please verify the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join a Classroom">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-500">
          Ask your teacher for the 6-character classroom join code and enter it below.
        </p>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
            {error}
          </div>
        )}

        <Input
          label="Classroom Code"
          placeholder="e.g. 7K4R9M"
          value={joinCode}
          onChange={(e) => {
            setJoinCode(e.target.value.toUpperCase());
            if (error) setError(null);
          }}
          className="text-center font-mono tracking-widest text-lg uppercase"
          maxLength={8}
          required
        />

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" icon={LogIn} isLoading={loading}>
            Join Classroom
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default JoinClassroomModal;
