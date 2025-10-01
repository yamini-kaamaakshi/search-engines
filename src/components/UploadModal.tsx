interface UploadModalProps {
  showUploadModal: boolean;
  setShowUploadModal: (show: boolean) => void;
  uploadLoading: boolean;
  uploadedFiles: string[];
  deletingFile: string | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeleteFile: (filename: string) => void;
}

export default function UploadModal({
  showUploadModal,
  setShowUploadModal,
  uploadLoading,
  uploadedFiles,
  deletingFile,
  handleFileUpload,
  handleDeleteFile,
}: UploadModalProps) {
  if (!showUploadModal) {
    return null;
  }

  return (
    <div className="absolute right-0 bottom-full mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Upload PDF</h3>
          <button
            onClick={() => setShowUploadModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Upload Area */}
        <div className="relative border border-gray-300 rounded p-4 text-center hover:border-gray-400 transition-colors mb-3">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={uploadLoading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <p className="text-sm text-gray-600">Choose file or drag here</p>
        </div>

        {/* Upload Status */}
        {uploadLoading && (
          <div className="mb-3 text-sm text-gray-600">Uploading...</div>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-2">{uploadedFiles.length} file(s)</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {uploadedFiles.map((filename, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                >
                  <span className="text-gray-700 truncate">{filename}</span>
                  <button
                    onClick={() => handleDeleteFile(filename)}
                    disabled={deletingFile === filename}
                    className="text-gray-400 hover:text-red-500 ml-2"
                  >
                    {deletingFile === filename ? "..." : "×"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}