import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDisk, downloadFile, moveFile, shareFile, deleteFile, uploadFile, createFolder } from '../../utils/api';
import ContextMenu from '../../components/ContextMenu/ContextMenu'
import ShareModal from '../../components/ShareModal/ShareModal'
import DeleteModal from '../../components/DeleteModal/DeleteModal';
import UploadModal from '../../components/UploadModal/UploadModal';
import FolderUploadModal from '../../components/FolderUploadModal/FolderUploadModal';
import './Disk.css';

const Disk = () => {
    const { folderId } = useParams();
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const [currentFolder, setCurrentFolder] = useState(folderId ? parseInt(folderId) : 0);
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const [breadcrumbs, setBreadcrumbs] = useState([{ id: 0, name: 'Мой диск' }]);
    const navigate = useNavigate();
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showFolderUploadModal, setShowFolderUploadModal] = useState(false);
    const [contextMenu, setContextMenu] = useState({
      show: false,
      x: 0,
      y: 0,
      file: null
    });

    const [deleteModal, setDeleteModal] = useState({
      show: false,
      fileId: null,
      fileName: ''
    });

    useEffect(() => {
      const id = folderId ? parseInt(folderId) : 0;
      setCurrentFolder(id);
      fetchFolderContents(id);
    }, [folderId]);
    
    const handleFileRightClick = (file, e) => {
      e.preventDefault();
      setContextMenu({
        show: true,
        x: e.clientX,
        y: e.clientY,
        file: file
      });
    };

    const handleDeleteClick = (fileId, fileName) => {
      setDeleteModal({
        show: true,
        fileId,
        fileName
      });
    };
  
    
    const handleMoveFile = async (fileId, folderId) => {
      try {
        await moveFile(fileId, folderId);
        const { folders: updatedFolders, files: updatedFiles } = await getDisk(currentFolder);
    
        setFolders(updatedFolders);
        setFiles(updatedFiles);
        
        console.log('Файл успешно перемещен');
      } catch (error) {
        console.error('Ошибка при перемещении файла:', error);
      }
    };
    
    const handleShareFile = async (fileId) => {
      try {
        const link = await shareFile(fileId);
        setShareLink(link);
        setShowShareModal(true);
      } catch (error) {
        console.error('Ошибка при создании ссылки:', error);
        setError('Не удалось создать ссылку для доступа');
      }
    };
    
    const handleDeleteFile = async () => {
      try {
        await deleteFile(deleteModal.fileId);
        
        const data = await getDisk(currentFolder);
        setFiles(data.files);
        
        setDeleteModal({ show: false, fileId: null, fileName: '' });
        
        console.log('Файл успешно удален');
      } catch (error) {
        console.error('Ошибка при удалении файла:', error);
        setError('Не удалось удалить файл');
      }
    };
  
    const cancelDelete = () => {
      setDeleteModal({ show: false, fileId: null, fileName: '' });
    };
  
    const fetchFolderContents = async (folderId) => {      
      try {
        const { folders: fetchedFolders, files: fetchedFiles } = await getDisk(folderId);
        const { folders: currentFolders, files: currnentFiles } = await getDisk(currentFolder);

        setFolders(fetchedFolders);
        setFiles(fetchedFiles);
        
        if (folderId !== currentFolder) {
          updateBreadcrumbs(folderId, currentFolders);
        }
      } catch (err) {
        if (err.message.includes('401')) {
          navigate('/login');
        }
      }
    };
  
    const updateBreadcrumbs = (folderId, folders) => {
      if (folderId === 0) {
        setBreadcrumbs([{ id: 0, name: 'Мой диск' }]);
        return;
      }
      
      const alreadyExists = breadcrumbs.some(crumb => crumb.id === folderId);
      if (alreadyExists) {
        const existingIndex = breadcrumbs.findIndex(crumb => crumb.id === folderId);
        setBreadcrumbs(breadcrumbs.slice(0, existingIndex + 1));
        return;
      }
      
      const currentFolderData = folders.find(f => f.id === folderId);
      
      if (currentFolderData) {
        setBreadcrumbs(prev => [...prev, { 
          id: folderId, 
          name: currentFolderData.name || `${folderId}` 
        }]);
      } else {
        setBreadcrumbs(prev => [...prev, { 
          id: folderId, 
          name: `${folderId}` 
        }]);
      }
    };

  const handleFolderClick = (folderId) => {
    navigate(`/disk/folder/${folderId}`);
  };

  const handleBackClick = () => {
    if (breadcrumbs.length <= 1) {
      navigate('/disk');
      return;
    }
    
    const prevFolderId = breadcrumbs[breadcrumbs.length - 2].id;
    
    if (prevFolderId === 0) {
      navigate('/disk');
    } else {
      navigate(`/disk/folder/${prevFolderId}`);
    }
  };

  const handleBreadcrumbClick = (folderId) => {
    if (folderId === currentFolder) return;
    
    if (folderId === 0) {
      navigate('/disk');
    } else {
      navigate(`/disk/folder/${folderId}`);
    }
  };

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

  const handleUpload = async (file, fileName) => {
    await uploadFile(file, fileName, currentFolder);
    const data = await getDisk(currentFolder);
    setFiles(data.files);
  };

  const handleFolderCreation = async (folderName) => {
    await createFolder(folderName, currentFolder);
    const data = await getDisk(currentFolder);
    setFolders(data.folders);
  };

  return (
    <div className="disk-container">
      <div className="navigation">
        {breadcrumbs.length > 1 && (
          <button onClick={handleBackClick} className="back-button">
            ← Назад
          </button>
        )}
        
        <div className="breadcrumbs">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              {index > 0 && <span className="separator">/</span>}
              <span 
                className={`breadcrumb ${crumb.id === currentFolder ? 'active' : ''}`}
                onClick={() => handleBreadcrumbClick(crumb.id)}
              >
                {crumb.name}
              </span>
            </React.Fragment>
          ))}
        </div>
        <div className="add-buttons">
          <button onClick={() => setShowUploadModal(true)}>Добавить файл</button>
          <button onClick={() => setShowFolderUploadModal(true)}>Создать папку</button>
        </div>
      </div>
      
      <div className="disk-content">
        <div className="folders-section">
          <h3>Папки ({folders.length})</h3>
          {folders.length === 0 ? (
            <p>Нет подпапок</p>
          ) : (
            <div className="folders-list">
              {folders.map(folder => (
                <div 
                  key={folder.id} 
                  className="folder-item"
                  onClick={() => handleFolderClick(folder.id, folder.name)}
                >
                  <div className="folder-icon">📁</div>
                  <div className="folder-info">
                    <div className="folder-name">{folder.name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="files-section">
          <h3>Файлы ({files.length})</h3>
          {files.length === 0 ? (
            <p>Нет файлов</p>
          ) : (
            <div className="files-list">
              {files.map(file => (
                <div key={file.id} className="file-item" onContextMenu={(e) => handleFileRightClick(file, e)}>
                  <div className="file-icon">{getFileIcon(file.name)}</div>
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-meta">
                      <div className="file-size">{formatFileSize(file.size)}</div>
                      <div className="file-size">{formatDate(file.uploaded_at)}</div>
                    </div>
                  </div>
                  {contextMenu.show && (
                    <ContextMenu
                      x={contextMenu.x}
                      y={contextMenu.y}
                      file={contextMenu.file}
                      currentFolder={currentFolder}
                      folders={folders}
                      onClose={() => setContextMenu({ ...contextMenu, show: false })}
                      onDownload={handleDownload}
                      onMove={handleMoveFile}
                      onShare={handleShareFile}
                      onDelete={handleDeleteClick}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
        />
      )}
      {showFolderUploadModal && (
        <FolderUploadModal
          onClose={() => setShowFolderUploadModal(false)}
          onUpload={handleFolderCreation}
        />
      )}
      {deleteModal.show && (
        <DeleteModal
          fileName={deleteModal.fileName}
          onConfirm={handleDeleteFile}
          onCancel={cancelDelete}
        />
      )}
      {showShareModal && (
        <ShareModal 
          shareLink={shareLink}
          onClose={() => setShowShareModal(false)}
        />
      )}
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
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

export default Disk;