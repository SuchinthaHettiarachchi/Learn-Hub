import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Download, File, AlertCircle } from 'lucide-react';

export function CourseLearnPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/purchasedCourse/${id}`);
      setCourse(response.data);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (course?.pdfFile) {
      try {
        const response = await api.get(`/downloadPDF/${id}`, {
          responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${course.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
        alert('Failed to download PDF. Please try again.');
      }
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-b-blue-600" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Course not found</h2>
          <Link to="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{course.title}</h1>
          <p className="text-slate-600 dark:text-slate-400">{course.description}</p>
        </div>

        {/* PDF Viewer Section */}
        {course.pdfFile ? (
          <div className="space-y-6">
            {/* PDF Display Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
              {/* Toolbar */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <File className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="font-bold text-slate-900 dark:text-white">{course.title} - Course Material</h2>
                </div>
                <Button
                  onClick={handleDownloadPDF}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2 rounded-lg"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>

              {/* PDF Embed */}
              <div className="w-full h-96 md:h-[700px] bg-slate-100 dark:bg-slate-800">
                <iframe
                  src={`${course.pdfFile}#toolbar=1&navpanes=0&scrollbar=1`}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  title={`${course.title} PDF`}
                  className="w-full h-full"
                />
              </div>

              {/* Download Alternative */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Can't view the PDF in your browser?
                </p>
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  className="border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold gap-2 rounded-lg"
                >
                  <Download className="h-4 w-4" />
                  Download to Your Computer
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-lg">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <AlertCircle className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Course Material</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              The instructor hasn't uploaded course material yet. Please check back later.
            </p>
            <Link to="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

