import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, Calendar, Clock, Image, Video, Trash2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useConnection } from '../hooks/useConnection';
import { useToast } from '../components/common/Toast';
import { formatDate, formatFileSize, truncate } from '../utils/cn';

export default function HistoryPage() {
  const { isConnected, sessionId } = useConnection();
  const { error: showError } = useToast();
  
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock history data (in a real app, this would come from the API)
  useEffect(() => {
    if (!isConnected || !sessionId) {
      showError('Please connect your WhatsApp account first');
      return;
    }

    // Simulate loading
    setIsLoading(true);
    
    // In a real app, you would fetch from the API:
    // const fetchHistory = async () => {
    //   const result = await uploadApi.getHistory(sessionId);
    //   if (result.success) {
    //     setHistory(result.data?.history || []);
    //   }
    // };
    // fetchHistory();
    
    // For now, use mock data
    const mockHistory = [
      {
        id: '1',
        fileName: 'vacation_photo.jpg',
        fileType: 'image',
        originalSize: 2_500_000,
        compressedSize: 800_000,
        uploadDate: new Date(Date.now() - 3600000).toISOString(),
        success: true,
      },
      {
        id: '2',
        fileName: 'birthday_video.mp4',
        fileType: 'video',
        originalSize: 15_000_000,
        compressedSize: 5_000_000,
        uploadDate: new Date(Date.now() - 86400000).toISOString(),
        success: true,
      },
      {
        id: '3',
        fileName: 'selfie.png',
        fileType: 'image',
        originalSize: 1_200_000,
        compressedSize: 400_000,
        uploadDate: new Date(Date.now() - 172800000).toISOString(),
        success: true,
      },
    ];
    
    setTimeout(() => {
      setHistory(mockHistory);
      setIsLoading(false);
    }, 1000);
  }, [isConnected, sessionId, showError]);

  // Handle delete
  const handleDelete = (id: string) => {
    // In a real app:
    // const result = await api.deleteHistory(id);
    // if (result.success) {
    //   setHistory(history.filter(item => item.id !== id));
    //   showSuccess('History item deleted');
    // }
    
    setHistory(history.filter(item => item.id !== id));
  };

  // Handle clear all
  const handleClearAll = () => {
    setHistory([]);
  };

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <Card padding="lg" className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Link className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Connect First
          </h2>
          <p className="text-text-muted mb-6">
            Please connect your WhatsApp account to view upload history
          </p>
          <Button
            variant="primary"
            onClick={() => (window.location.href = '/connect')}
          >
            Connect WhatsApp
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Upload History</h1>
          <p className="text-sm text-text-muted">
            View your recent status uploads
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => (window.location.href = '/')}
        >
          Back
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card padding="md" className="text-center">
          <h3 className="text-3xl font-bold text-primary">{history.length}</h3>
          <p className="text-sm text-text-muted">Total Uploads</p>
        </Card>
        <Card padding="md" className="text-center">
          <h3 className="text-3xl font-bold text-secondary">
            {history.filter(h => h.fileType === 'image').length}
          </h3>
          <p className="text-sm text-text-muted">Images</p>
        </Card>
        <Card padding="md" className="text-center">
          <h3 className="text-3xl font-bold text-accent">
            {history.filter(h => h.fileType === 'video').length}
          </h3>
          <p className="text-sm text-text-muted">Videos</p>
        </Card>
      </div>

      {/* History List */}
      <Card padding="lg">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border-light dark:border-border-medium">
            <h2 className="font-semibold text-text-primary">Recent Uploads</h2>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                leftIcon={<Trash2 className="w-4 h-4" />}
                className="text-red-500 hover:text-red-400"
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="py-12 text-center">
              <p className="text-text-muted">Loading history...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && history.length === 0 && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-secondary flex items-center justify-center">
                <Calendar className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">
                No Uploads Yet
              </h3>
              <p className="text-sm text-text-muted mb-6">
                Your upload history will appear here
              </p>
              <Button
                variant="primary"
                onClick={() => (window.location.href = '/upload')}
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Upload Status
              </Button>
            </div>
          )}

          {/* History Items */}
          {!isLoading && history.length > 0 && (
            <div className="space-y-3">
              {history.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-bg-secondary transition-colors"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {item.fileType === 'image' ? (
                      <Image className="w-5 h-5 text-primary" />
                    ) : (
                      <Video className="w-5 h-5 text-primary" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-text-primary truncate">
                        {truncate(item.fileName, 30)}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.success ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {item.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(item.uploadDate)}
                      </span>
                      <span>
                        {formatFileSize(item.originalSize)} 
                        {item.compressedSize && (
                          <span className="text-text-muted/70">
                            &rarr; {formatFileSize(item.compressedSize)}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="text-text-muted hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Tips */}
      <Card padding="md" className="bg-blue-500/5 border-blue-500/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-600 dark:text-blue-400">
              History Tips
            </h4>
            <p className="text-sm text-blue-600/80 dark:text-blue-400/80 mt-1">
              Upload history is stored locally and will be cleared when you disconnect your account.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Dummy import for JSX
function Upload() {
  return null;
}
