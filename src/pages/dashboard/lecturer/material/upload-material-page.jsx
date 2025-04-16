import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Upload, File, Video, Loader2, X, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { getSessionBySessionId } from "@/services/sessionService";
import { uploadFile } from "@/services/uploadFileService";
import { format } from "date-fns";

const API_URL = import.meta.env.VITE_VIDEO_URL;

export default function UploadMaterialBySessionPage() {
  const { classId, sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const fileInputRef = useRef(null);
  const recordingInputRef = useRef(null);
  const navigate = useNavigate();
  const [uploadType, setUploadType] = useState("recordings");

  //get upload type
  useEffect(() => {
    const typeFromURL = searchParams.get("type");
    if (typeFromURL === "recordings" || typeFromURL === "files") {
      setUploadType(typeFromURL);
    } else {
      navigate("/*");
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    async function fetchSessionDetails() {
      try {
        const response = await getSessionBySessionId(sessionId);
        console.log(response.data);
        setSessionDetails(response.data);
      } catch (error) {
        console.error("Failed to fetch session details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSessionDetails();
  }, [sessionId]);

  const handleBack = () => {
    navigate(`/lecturer/material/${classId}`);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };

  const handleRecordingChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedRecording(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.warning("Please select at least one file to upload.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        await uploadFile(file, classId, sessionId, "file", (percent) => {
          // Tính toán tổng tiến độ dựa trên số lượng file
          const overallProgress = ((i + percent / 100) / selectedFiles.length) * 100;
          setUploadProgress(Math.round(overallProgress));
        });
      }

      toast.success(`${selectedFiles.length} file(s) have been uploaded.`);

      // Reset sau khi upload xong
      setUploadProgress(100);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Nếu cần load lại session sau upload:
      const response = await getSessionBySessionId(sessionId);
      setSessionDetails(response.data);
    } catch (error) {
      console.error("Failed to upload files:", error);
      toast.error("There was an error uploading your files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRecordingUpload = async () => {
    if (!selectedRecording) {
      toast.warning("Please select a video recording to upload.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Tiến trình upload
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          if (prev < 50) return prev + 5;
          else if (prev < 80) return prev + 2;
          else return prev + 3;
        });
      }, 300);

      // Upload video recording (record) file
      await uploadFile(selectedRecording, classId, sessionId, "record", (percent) => {
        setUploadProgress(percent);
      });

      // Sau khi upload xong
      clearInterval(interval);
      setUploadProgress(100);

      toast.success(`${selectedRecording.name} has been uploaded.`);

      // Lấy thông tin session sau khi upload xong
      const response = await getSessionBySessionId(sessionId);
      setSessionDetails(response.data);
      setSelectedRecording(null);

      // Clear input field
      if (recordingInputRef.current) recordingInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to upload recording:", error);
      toast.error("There was an error uploading your recording. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearSelectedRecording = () => {
    setSelectedRecording(null);
    if (recordingInputRef.current) {
      recordingInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleFileClick = (fileUrl) => {
    const fullUrl = `${API_URL}${fileUrl}`;
    window.open(fullUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button onClick={handleBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sessions
      </Button>

      {sessionDetails && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Session #{sessionDetails.sessionNumber}</h1>
          <p className="text-muted-foreground">
            {sessionDetails.class.classCode} - {sessionDetails.class.className}
          </p>
          <p>
            Slot {sessionDetails.slot}, {sessionDetails.sessionDate ? format(sessionDetails.sessionDate, "dd/MM/yyyy") : "TBD"}
          </p>
        </div>
      )}

      <Tabs defaultValue={uploadType} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="recordings" disabled>
            Recordings
          </TabsTrigger>
          <TabsTrigger value="files" disabled>
            Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recordings">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Recording</CardTitle>
              </CardHeader>
              <CardContent className="">
                <div className="space-y-4">
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="recording">Select Video Recording</Label>
                    <Input id="recording" type="file" accept="video/*" onChange={handleRecordingChange} ref={recordingInputRef} disabled={uploading} />
                  </div>

                  {selectedRecording && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Selected Recording:</p>
                      <div className="rounded-md border p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Video className="mr-2 h-4 w-4" />
                            <span className="text-sm">{selectedRecording.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">({formatFileSize(selectedRecording.size)})</span>
                          </div>
                          <Button variant="ghost" size="icon" onClick={clearSelectedRecording} disabled={uploading}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {uploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="h-2 w-full" />
                      <p className="text-xs text-muted-foreground text-right">{uploadProgress}%</p>
                      <div className="mt-2 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-5 w-5">
                            <path
                              fillRule="evenodd"
                              d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <strong>Warning:</strong> Please do not close this page while upload is in progress.
                        </div>
                      </div>
                    </div>
                  )}

                  {sessionDetails?.records.length !== 0 ? (
                    <Button disabled className="w-full">
                      <Check className="mr-2 h-4 w-4" />
                      Already Uploaded
                    </Button>
                  ) : (
                    <Button onClick={handleRecordingUpload} disabled={!selectedRecording || uploading} className="w-full">
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Recording
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uploaded Recordings</CardTitle>
              </CardHeader>
              <CardContent>
                {sessionDetails?.records.length ? (
                  <div className="space-y-4">
                    {sessionDetails.records.map((recording, index) => (
                      <div key={recording.recordId} className="flex items-start justify-between rounded-md border p-3">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Video className="mr-2 h-4 w-4" />
                            <span className="font-medium">Record {index + 1}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Duration: {recording.duration}</p>
                          <p className="text-xs text-muted-foreground">Uploaded: {format(recording.createdAt, "HH:mm, dd/MM/yyyy")}</p>
                        </div>
                        <div className="space-y-2">
                          <Button size="sm" className="w-full" onClick={() => navigate(`/record/${sessionDetails.sessionId}`)}>
                            Watch
                          </Button>
                          <Button size="sm" className="w-full">
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                    <p className="text-center text-muted-foreground">No recordings uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="files">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="files">Select Files</Label>
                    <Input id="files" type="file" multiple onChange={handleFileChange} ref={fileInputRef} disabled={uploading} />
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Selected Files:</p>
                      <div className="max-h-40 overflow-y-auto rounded-md border p-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between py-1">
                            <div className="flex items-center">
                              <File className="mr-2 h-4 w-4" />
                              <span className="text-sm">{file.name}</span>
                              <span className="ml-2 text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeSelectedFile(index)} disabled={uploading}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {uploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="h-2 w-full" />
                      <p className="text-xs text-muted-foreground text-right">{uploadProgress}%</p>
                      <div className="mt-2 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-5 w-5">
                            <path
                              fillRule="evenodd"
                              d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <strong>Warning:</strong> Please do not close this page while upload is in progress.
                        </div>
                      </div>
                    </div>
                  )}

                  <Button onClick={handleFileUpload} disabled={selectedFiles.length === 0 || uploading} className="w-full">
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Files
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uploaded Files</CardTitle>
              </CardHeader>
              <CardContent>
                {sessionDetails?.files && sessionDetails?.files.length > 0 ? (
                  <div className="space-y-4">
                    {sessionDetails.files.map((file) => (
                      <div key={file.fileId} className="flex items-start justify-between rounded-md border p-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center">
                            <File className="mr-2 h-4 w-4" />
                            <span className="font-medium truncate" style={{ maxWidth: "250px" }}>
                              {file.fileName}
                            </span>
                            {/* Truncate tên file */}
                          </div>
                          <p className="text-xs text-muted-foreground">Size: {formatFileSize(file.fileSize)}</p>
                          <p className="text-xs text-muted-foreground">Uploaded: {new Date(file.createdAt).toLocaleString()}</p>
                        </div>

                        <div className="mt-2">
                          <Button variant="outline" size="sm" onClick={() => handleFileClick(file.fileUrl)}>
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                    <p className="text-center text-muted-foreground">No files uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
