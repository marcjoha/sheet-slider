
import { useDropzone } from 'react-dropzone';

interface Props {
    onFileSelected: (file: File) => void;
    onLoadDefault: () => void;
    isProcessing: boolean;
}

export const UploadScreen = ({ onFileSelected, onLoadDefault, isProcessing }: Props) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false,
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                onFileSelected(acceptedFiles[0]);
            }
        },
    });

    return (
        <div
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2rem',
            }}
        >
            <h1 style={{ color: 'var(--yellow)' }}>Sheet Slider</h1>
            <div
                {...getRootProps()}
                style={{
                    border: '2px dashed var(--base1)',
                    borderRadius: '8px',
                    padding: '4rem',
                    backgroundColor: isDragActive ? 'var(--base2)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'center',
                }}
            >
                <input {...getInputProps()} />
                {isProcessing ? (
                    <p>Processing music sheet...</p>
                ) : isDragActive ? (
                    <p>Drop the PDF here...</p>
                ) : (
                    <p>Drag & drop a music sheet PDF here, or click to select</p>
                )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button onClick={onLoadDefault} disabled={isProcessing}>
                    Load Demo (Tears in Heaven)
                </button>
            </div>

            <p style={{ color: 'var(--base1)', fontSize: '0.9rem' }}>
                Note: Works best with clean, high-contrast sheet music.
            </p>
        </div>
    );
};

