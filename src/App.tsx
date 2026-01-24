import { useState } from 'react';
import { UploadScreen } from './components/UploadScreen';
import { PlayerScreen } from './components/PlayerScreen';
import { processPDF } from './lib/processor';

function App() {
  const [lines, setLines] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const extractedLines = await processPDF(file);
      if (extractedLines.length === 0) {
        alert('No music lines detected. Please try a different file.');
      } else {
        setLines(extractedLines);
      }
    } catch (err) {
      console.error(err);
      alert('Error processing PDF: ' + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadDefault = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/demo.pdf');
      const blob = await response.blob();
      const file = new File([blob], 'demo.pdf', { type: 'application/pdf' });
      await handleFile(file);
    } catch (err) {
      console.error(err);
      alert('Error loading demo file');
      setIsProcessing(false);
    }
  };

  if (lines.length > 0) {
    return <PlayerScreen lines={lines} onReset={() => setLines([])} />;
  }

  return (
    <UploadScreen onFileSelected={handleFile} onLoadDefault={handleLoadDefault} isProcessing={isProcessing} />
  );
}

export default App;
