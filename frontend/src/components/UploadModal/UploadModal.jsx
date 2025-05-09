import React, { useState } from 'react';
import './UploadModal.css';

const UploadModal = ({ onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (!fileName && selectedFile) {
      setFileName(selectedFile.name.split('.')[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Пожалуйста, выберите файл');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      await onUpload(file, fileName);
      onClose();
    } catch (err) {
      setError('Ошибка при загрузке файла');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="upload-modal">
        <h2>Добавить файл</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="file-upload">Выберите файл:</label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {file && (
              <div className="file-info">
                Выбран файл: {file.name} ({formatFileSize(file.size)})
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="file-name">Название файла:</label>
            <input
              id="file-name"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Введите название файла"
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
              disabled={isUploading || !file}
            >
              {isUploading ? 'Загрузка...' : 'Загрузить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Вспомогательная функция для форматирования размера файла
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]);
};

export default UploadModal;