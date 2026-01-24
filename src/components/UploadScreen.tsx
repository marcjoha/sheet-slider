
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
    return (
        <div
            style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                backgroundColor: 'var(--base3)', // Ensure background matches
                backgroundImage: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.02) 100%)' // Subtle texture feel
            }}
        >
            <div
                style={{
                    backgroundColor: '#fff',
                    padding: '4rem 6rem',
                    borderRadius: '2px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 20px 40px -10px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(220,210,190,0.3)',
                    maxWidth: '800px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2.5rem',
                    position: 'relative',
                    border: '1px solid #e0d8c0'
                }}
            >
                {/* Decorative border or corner element could go here */}

                <h1 style={{
                    fontFamily: '"Playfair Display", Georgia, serif',
                    fontSize: '4rem',
                    fontWeight: 700,
                    color: 'var(--violet)',
                    margin: 0,
                    letterSpacing: '-0.02em',
                    textShadow: '0 2px 0 rgba(0,0,0,0.05)'
                }}>
                    Sheet Slider
                </h1>

                <div style={{
                    width: '60px',
                    height: '4px',
                    background: 'var(--base1)',
                    opacity: 0.5,
                    borderRadius: '2px'
                }} />

                <div
                    {...getRootProps()}
                    style={{
                        border: '2px dashed var(--base1)',
                        borderRadius: '4px',
                        padding: '3rem',
                        width: '100%',
                        backgroundColor: isDragActive ? 'var(--base2)' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem'
                    }}
                >
                    <input {...getInputProps()} />
                    <div style={{ fontSize: '3rem', opacity: 0.6, marginBottom: '0.5rem' }}>🎼</div>

                    {isProcessing ? (
                        <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '1.25rem', color: 'var(--base01)' }}>
                            Parsing Opus...
                        </p>
                    ) : isDragActive ? (
                        <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '1.25rem', color: 'var(--blue)' }}>
                            Release to load sheet music
                        </p>
                    ) : (
                        <div>
                            <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '1.5rem', color: 'var(--base00)', margin: '0 0 0.5rem 0' }}>
                                Upload Sheet Music
                            </p>
                            <p style={{ fontFamily: 'sans-serif', fontSize: '0.9rem', color: 'var(--base1)', fontStyle: 'italic' }}>
                                (Drag PDF here or click to browse)
                            </p>
                        </div>
                    )}
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                    width: '100%'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--base2)' }} />
                        <span style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', color: 'var(--base1)' }}>or</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--base2)' }} />
                    </div>

                    <button
                        onClick={onLoadDefault}
                        disabled={isProcessing}
                        style={{
                            fontFamily: '"Playfair Display", serif',
                            fontSize: '1.1rem',
                            padding: '0.8em 2em',
                            background: 'transparent',
                            border: '1px solid var(--violet)',
                            color: 'var(--violet)',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--violet)';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--violet)';
                        }}
                    >
                        <span>♪</span> Tears in Heaven
                    </button>
                </div>

                <p style={{
                    position: 'absolute',
                    bottom: '1.5rem',
                    color: 'var(--base1)',
                    fontSize: '0.8rem',
                    fontFamily: 'sans-serif'
                }}>
                    Works best with clean, high-contrast PDF scores.
                </p>
            </div>
        </div>
    );
};

