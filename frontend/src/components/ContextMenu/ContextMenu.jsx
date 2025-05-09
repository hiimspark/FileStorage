import React, { useState, useEffect, useRef } from 'react';
import './ContextMenu.css';

const ContextMenu = ({ x, y, file, folders, currentFolder, onClose, onDownload, onMove, onShare, onDelete }) => {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleMoveToFolder = (folderId, e) => {
    e.stopPropagation();
    onMove(file.id, folderId);
    onClose();
  };

  return (
    <div 
      ref={menuRef}
      className="context-menu"
      style={{ top: `${y}px`, left: `${x}px` }}
    >
      <div className="menu-item" onClick={(e) => { e.preventDefault(); onDownload(file.id, file.name); onClose(); }} onMouseDown={(e) => e.stopPropagation()}>
        Скачать файл
      </div>
      
      <div 
        className="menu-item submenu-trigger" 
        onMouseEnter={() => setShowSubmenu(true)}
        onMouseLeave={() => setShowSubmenu(false)}
      >
        Переместить в папку
        {showSubmenu && (
          <div className="submenu">
            {currentFolder !== 0 && (
            <div 
              key="root-folder" 
              className="submenu-item"
              onClick={(e) => { 
                e.preventDefault(); 
                handleMoveToFolder(0, e); 
                onClose(); 
              }} 
              onMouseDown={(e) => e.stopPropagation()}
            >
              Мой диск
            </div>
          )}
            
            {folders.map(folder => (
              <div 
                key={folder.id} 
                className="submenu-item"
                onClick={(e) => { 
                  e.preventDefault(); 
                  handleMoveToFolder(folder.id, e); 
                  onClose(); 
                }} 
                onMouseDown={(e) => e.stopPropagation()}
              >
                {folder.name}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="menu-item" onClick={(e) => { e.preventDefault(); onShare(file.id); onClose(); }} onMouseDown={(e) => e.stopPropagation()}>
        Поделиться
      </div>
      
      <div className="menu-item delete" onClick={(e) => { e.preventDefault(); onDelete(file.id); onClose(); }} onMouseDown={(e) => e.stopPropagation()}>
        Удалить
      </div>
    </div>
  );
};

export default ContextMenu;