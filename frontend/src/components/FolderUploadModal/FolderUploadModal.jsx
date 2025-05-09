import React, { useState } from 'react';
import './FolderUploadModal.css';

const FolderUploadModal = ({ onClose, onUpload }) => {
  const [folderName, setFolderName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsUploading(true);
    setError('');

    try {
      await onUpload(folderName);
      onClose();
    } catch (err) {
      setError('Ошибка при создании папки');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="upload-modal">
        <h2>Создать папку</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="folder-name">Название папки:</label>
            <input
              id="folder-name"
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Введите название папки"
              disabled={isUploading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-buttons">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={isUploading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="upload-button"
              disabled={isUploading}
            >
              {isUploading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FolderUploadModal;