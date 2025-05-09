import React from 'react';
import './ShareModal.css';

const ShareModal = ({ shareLink, onClose }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
      .then(() => alert('Ссылка скопирована!'))
      .catch(err => console.error('Copy failed:', err));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Поделиться файлом</h3>
        <div className="share-link-container">
          <input 
            type="text" 
            value={shareLink} 
            readOnly 
            className="share-link-input"
          />
          <button onClick={copyToClipboard} className="copy-button">
            Копировать
          </button>
        </div>
        <button onClick={onClose} className="close-button">
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default ShareModal;