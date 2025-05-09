import React from 'react';
import './DeleteModal.css';

const DeleteModal = ({ fileName, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="delete-modal">
        <h3>Подтвердите удаление</h3>
        <p>Вы уверены, что хотите удалить файл <strong>{fileName}</strong>? Это действие нельзя отменить.</p>
        
        <div className="modal-buttons">
          <button onClick={onCancel} className="cancel-button">
            Отмена
          </button>
          <button onClick={onConfirm} className="confirm-button">
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;