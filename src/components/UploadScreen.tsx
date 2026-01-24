
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
                fontFamily: 'Georgia, "Times New Roman", Times, serif'
            }}
        >
            <h1 style={{ color: 'var(--yellow)', fontSize: '3rem', margin: 0 }}>Sheet Slider</h1>

            <div
                {...getRootProps()}
                style={{
                    border: '2px dashed var(--base1)',
                    borderRadius: '8px',
                    padding: '4rem',
                    backgroundColor: isDragActive ? 'var(--base2)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    maxWidth: '600px',
                    width: '100%'
                }}
            >
                <input {...getInputProps()} />
                {isProcessing ? (
                    <p>Processing music sheet...</p>
                ) : isDragActive ? (
                    <p>Drop the PDF here...</p>
                ) : (
                    <div>
                        <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                            Upload Sheet Music
                        </p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--base1)', fontStyle: 'italic' }}>
                            (Drag PDF here or click to select)
                        </p>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button
                    onClick={onLoadDefault}
                    disabled={isProcessing}
                    style={{
                        fontFamily: 'Georgia, "Times New Roman", Times, serif', // Use Georgia for button too
                        fontSize: '1.1rem',
                        padding: '0.8em 1.5em',
                        borderRadius: '4px',
                        background: 'var(--base2)',
                        border: '1px solid var(--base1)',
                        color: 'var(--base00)',
                        cursor: 'pointer'
                    }}
                >
                    Tears in Heaven
                </button>
            </div>

            <p style={{ color: 'var(--base1)', fontSize: '0.9rem' }}>
                Note: Works best with clean, high-contrast sheet music.
            </p>
        </div>
    );
};
