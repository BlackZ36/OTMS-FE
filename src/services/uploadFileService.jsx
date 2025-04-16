import axiosClient from "./axiosClient";

export const uploadFile = async (file, classId, sessionId, type, onProgress = () => {}) => {
  const formData = new FormData();
  formData.append("File", file);
  formData.append("SessionId", sessionId);
  formData.append("Type", type);

  try {
    const response = await axiosClient.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (typeof onProgress === "function") {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return response.data; // { fileName, sessionId, type, url }
  } catch (error) {
    throw new Error("Upload thất bại", error);
  }
};

export const downloadFileService = async (fileId, fileName) => {
  try {
    const response = await axiosClient.get(`/files/download/${fileId}`, {
      responseType: "blob", // Quan trọng để nhận file nhị phân
    });

    // Tạo URL từ blob và kích hoạt tải
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName || "downloaded_file");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Lỗi khi tải file:", error);
    throw error;
  }
};
