const checkResponse = (res) => {
    if (res.ok) {
      return res.json();
    }
    return res.json().then((err) => Promise.reject(err));
  };

const headersWithContentType = { "Content-Type": "application/json" };

export const registerUser = (username, password) => {
    return fetch(`http://localhost:8000/api/auth/users/`, {
      method: "POST",
      headers: headersWithContentType,
      body: JSON.stringify({ username, password }),
    });
};

export const loginUser = (username, password) => {
    return fetch(`http://localhost:8000/api/auth/token/login/`, {
      method: "POST",
      headers: headersWithContentType,
      body: JSON.stringify({ username, password }),
    })
      .then(checkResponse)
      .then((data) => {
        if (data.auth_token) {
          localStorage.setItem("auth_token", `Token ${data.auth_token}`);
          return data;
        }
        return null;
      });
};


export const logoutUser = () => {
    return fetch(`${URL}/api/token/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `${localStorage.getItem("auth_token")}`,
      },
    }).then((res) => {
      if (res.status === 204) {
        localStorage.removeItem("auth_token");
        return res;
      }
      return null;
    });
};

export const downloadFile = async (fileId, fileName) => {
    try{
    const response = await fetch(`http://localhost:8000/api/files/${fileId}/download/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `${localStorage.getItem("auth_token")}`,
      },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const filename = fileName;
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
  
      return { success: true, filename };
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
};

export const getDisk = async (folderId = 0) => {
    try {
      let endpoint;
      
      if (folderId === 0) {
        const [foldersResponse, filesResponse] = await Promise.all([
          fetch('http://localhost:8000/api/folders/', {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `${localStorage.getItem("auth_token")}`,
            },
          }),
          fetch('http://localhost:8000/api/files/', {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `${localStorage.getItem("auth_token")}`,
            },
          })
        ]);
  
        if (!foldersResponse.ok) throw new Error(`Folders error: ${foldersResponse.status}`);
        if (!filesResponse.ok) throw new Error(`Files error: ${filesResponse.status}`);
  
        const folders = await foldersResponse.json();
        const allFiles = await filesResponse.json();
        const files = allFiles.filter(file => file.folder === null);
  
        return { folders, files };
      } else {
        endpoint = `http://localhost:8000/api/folders/${folderId}/contents/`;
        
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `${localStorage.getItem("auth_token")}`,
          },
        });
  
        if (!response.ok) throw new Error(`Error: ${response.status}`);
  
        const data = await response.json();
        
        return { 
          folders: data.subfolders || [], 
          files: data.files || [] 
        };
      }
    } catch (error) {
      console.error('Error in getDisk:', error);
      throw error;
    }
  };


export const moveFile = async (fileId, folderId = 0) => {
  try{
    return fetch(`http://localhost:8000/api/files/${fileId}/add-to/${folderId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `${localStorage.getItem("auth_token")}`,
      },
    });
    } catch (error) {
      console.error('File move error:', error);
      throw error;
    }
};

export const shareFile = async (fileId) => {
  try {
    const response = await fetch(`http://localhost:8000/api/files/${fileId}/share/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `${localStorage.getItem("auth_token")}`,
      },
    });
    
    const data = await checkResponse(response);
    return `http://localhost:3000/shared/${data.token}/`;
  } catch (error) {
    console.error('Sharing error:', error);
    throw error;
  }
};

export const getSharedFileInfo = async (token) => {
  try {
    const response = await fetch(`http://localhost:8000/api/shared/${token}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `${localStorage.getItem("auth_token")}`,
      },
    });
    const data = await checkResponse(response);
    return data
  }
  catch (error) {
    console.error('Error while getting shared file info:', error);
    throw error;
  }
}

export const deleteFile = (fileId) => {
  return fetch (`http://localhost:8000/api/files/${fileId}/delete/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `${localStorage.getItem("auth_token")}`,
    },
  });
}

export const uploadFile = async (file, fileName, currentFolder) => {
  const formData = new FormData();
  
  const renamedFile = new File([file], `${fileName}.${file.name.split('.').pop()}`, {
    type: file.type,
    lastModified: file.lastModified
  });

  formData.append('file', renamedFile);
  if (currentFolder != 0){
    formData.append('folder', currentFolder);
  }

  try {
    const response = await fetch('http://localhost:8000/api/upload/', {
      method: 'POST',
      headers: {
        'Authorization': `${localStorage.getItem('auth_token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

export const createFolder = async (folderName, currentFolder) => {
  const formData = new FormData();

  formData.append('name', folderName);
  if (currentFolder != 0){
    formData.append('parent', currentFolder);
  }

  try {
    const response = await fetch('http://localhost:8000/api/folders/create', {
      method: 'POST',
      headers: {
        'Authorization': `${localStorage.getItem('auth_token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Folder creation failed:', error);
    throw error;
  }
};