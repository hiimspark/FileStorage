import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Shared.css';
import { downloadFile, getSharedFileInfo } from '../../utils/api';

const Shared = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        const data = await getSharedFileInfo(token);
        setFileInfo(data);
      } catch (err) {
        console.error('Error fetching shared file:', err);
        setError('Не удалось загрузить информацию о файле');
      } finally {
        setLoading(false);
      }
    };

    fetchFileInfo();
  }, [token]);

  const handleDownload = async (fileId, filename) => {
    try {
      const { success } = await downloadFile(fileId, filename);
      if (success) {
        console.log(`Файл ${filename} успешно скачан`);
      }
    } catch (error) {
      console.error('Ошибка при скачивании файла:', error);
      setError(`Не удалось скачать файл: ${error.message}`);
    }
  };

  const copyToClipboard = () => {
    if (fileInfo) {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Copy failed:', err);
          setError('Не удалось скопировать ссылку');
        });
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/')} className="home-button">
          На главную
        </button>
      </div>
    );
  }

  if (!fileInfo) {
    return null;
  }

  return (
    <div className="shared-file-container">
      <div className="file-card">
        <div className="file-header">
          <h2>Общий доступ к файлу</h2>
          <div className="file-icon">{getFileIcon(fileInfo.file.name)}</div>
        </div>

        <div className="file-details">
          <div className="detail-row">
            <span className="detail-label">Название:</span>
            <span className="detail-value">{fileInfo.file.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Размер:</span>
            <span className="detail-value">{formatFileSize(fileInfo.file.size)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Дата загрузки:</span>
            <span className="detail-value">{formatDate(fileInfo.file.uploaded_at)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Действителен до:</span>
            <span className="detail-value">{formatDate(fileInfo.expires_at)}</span>
          </div>
        </div>

        <div className="share-link-container">
          <div className="share-link-label">Ссылка для доступа:</div>
          <div className="share-link-input" onClick={copyToClipboard}>
            {window.location.href}
            <span className="copy-hint">{copied ? 'Скопировано!' : 'Нажмите, чтобы скопировать'}</span>
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={() => handleDownload(fileInfo.file.id, fileInfo.file.name)} className="download-button">
            Скачать файл
          </button>
          <button onClick={() => navigate('/')} className="home-button">
            На главную
          </button>
        </div>
      </div>
    </div>
  );
};

const getFileIcon = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  const icons = {
    pdf: '📕',
    doc: '📘', docx: '📘',
    xls: '📊', xlsx: '📊',
    ppt: '📑', pptx: '📑',
    jpg: '🖼', jpeg: '🖼', png: '🖼', gif: '🖼', svg: '🖼',
    mp3: '🎵', wav: '🎵', ogg: '🎵',
    mp4: '🎬', mov: '🎬', avi: '🎬',
    zip: '🗜', rar: '🗜', '7z': '🗜',
    txt: '📝',
    exe: '⚙️', dmg: '⚙️',
  };
  return icons[extension] || '📄';
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

export default Shared;