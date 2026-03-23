import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../lib/auth.jsx";
import {
  FileText, Upload, Trash2, ChevronRight, Loader2,
  CheckCircle, AlertCircle, Clock, Plus, X
} from "lucide-react";

export default function DocumentsPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const { user } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Upload form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploadMsg, setUploadMsg] = useState("");

  useEffect(() => {
    if (user?._id) fetchDocuments();
  }, [user]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/content/documents?userId=${user._id}`);
      setDocuments(res.data.documents || []);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Document title is required.";
    if (!file) newErrors.file = "Please select a PDF file.";
    else if (file.type !== "application/pdf") newErrors.file = "Only PDF files are allowed.";
    else if (file.size > 10 * 1024 * 1024) newErrors.file = "File must be under 10 MB.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = async () => {
    if (!validate()) return;
    setUploading(true);
    setUploadMsg("");
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("title", title.trim());
      formData.append("userId", user._id);
      const res = await axios.post("/api/content/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadMsg("Document uploaded successfully!");
      setDocuments((prev) => [res.data.document, ...prev]);
      setTitle("");
      setFile(null);
      setShowForm(false);
    } catch (err) {
      setUploadMsg(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document and all its generated content?")) return;
    try {
      await axios.delete(`/api/content/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
    } catch {
      alert("Failed to delete document.");
    }
  };

  const statusIcon = (status) => {
    if (status === "ready") return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    if (status === "processing") return <Clock className="w-4 h-4 text-amber-400 animate-spin" />;
    return <AlertCircle className="w-4 h-4 text-rose-400" />;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-sm text-blue-400 font-semibold uppercase tracking-widest mb-1">Content Engine</p>
            <h1 className="text-4xl font-bold text-white">My Documents</h1>
            <p className="text-gray-400 mt-1">Upload PDFs and generate AI-powered study content</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Upload PDF
          </button>
        </div>

        {/* Upload Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Upload Document</h2>
                <button onClick={() => { setShowForm(false); setErrors({}); setFile(null); setTitle(""); }}
                  className="text-gray-500 hover:text-gray-300 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Title */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                  Document Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setErrors(err => ({ ...err, title: undefined })); }}
                  placeholder="e.g. Introduction to Machine Learning"
                  className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.title ? "border-rose-500" : "border-gray-600"}`}
                />
                {errors.title && <p className="text-rose-400 text-xs mt-1.5">{errors.title}</p>}
              </div>

              {/* File picker */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                  PDF File
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    errors.file ? "border-rose-500 bg-rose-500/5" : file ? "border-blue-500 bg-blue-500/5" : "border-gray-600 hover:border-gray-500 bg-gray-800/40"
                  }`}
                >
                  <Upload className={`w-8 h-8 mx-auto mb-2 ${file ? "text-blue-400" : "text-gray-600"}`} />
                  <p className="text-sm text-gray-400">
                    {file ? <span className="text-blue-400 font-medium">{file.name}</span> : "Click to select a PDF (max 10 MB)"}
                  </p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => { setFile(e.target.files[0] || null); setErrors(err => ({ ...err, file: undefined })); }}
                />
                {errors.file && <p className="text-rose-400 text-xs mt-1.5">{errors.file}</p>}
              </div>

              {uploadMsg && (
                <p className={`text-sm mb-4 ${uploadMsg.includes("success") ? "text-emerald-400" : "text-rose-400"}`}>
                  {uploadMsg}
                </p>
              )}

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload & Extract Text</>}
              </button>
            </div>
          </div>
        )}

        {/* Documents list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-700 rounded-2xl">
            <FileText className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No documents yet</p>
            <p className="text-gray-600 text-sm mt-1">Upload a PDF to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc._id}
                className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover:text-blue-300 transition-colors">{doc.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {statusIcon(doc.status)}
                      <span className="text-gray-500 text-xs capitalize">{doc.status}</span>
                      {doc.pageCount > 0 && <span className="text-gray-600 text-xs">· {doc.pageCount} pages</span>}
                      <span className="text-gray-600 text-xs">· {new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.status === "ready" && (
                    <button
                      onClick={() => navigate(`/content/${doc._id}`)}
                      className="flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm font-medium px-4 py-2 rounded-lg transition-all"
                    >
                      Generate
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="p-2 text-gray-600 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
