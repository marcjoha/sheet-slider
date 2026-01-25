import { useRef, useEffect, useState, useCallback } from 'react';

interface Props {
    lines: string[];
    onReset: () => void;
}

export const PlayerScreen = ({ lines }: Props) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(2); // pixels per frame
    const [offset, setOffset] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(100); // percentage

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const dragStartX = useRef<number>(0);
    const initialOffset = useRef<number>(0);

    const requestRef = useRef<number | undefined>(undefined);

    const animate = useCallback(() => {
        if (isPlaying && !isDragging) {
            setOffset(prev => prev + speed);
            requestRef.current = requestAnimationFrame(animate);
        }
    }, [isPlaying, speed, isDragging]);

    useEffect(() => {
        if (isPlaying && !isDragging) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying, animate, isDragging]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                setIsPlaying(prev => !prev);
            }

            // Handle Zoom
            if (e.metaKey || e.ctrlKey) {
                if (e.key === '=' || e.key === '+') {
                    e.preventDefault();
                    setZoomLevel(z => Math.min(200, z + 10));
                } else if (e.key === '-') {
                    e.preventDefault();
                    setZoomLevel(z => Math.max(50, z - 10));
                } else if (e.key === '0') {
                    e.preventDefault();
                    setZoomLevel(100);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStartX.current = e.clientX;
        initialOffset.current = offset;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const delta = e.clientX - dragStartX.current;
        // Dragging right (positive delta) should move content right (decrease offset normally acts as moving content left, wait...
        // translateX(-offset). 
        // If offset increases, content moves left.
        // If I drag mouse right, I want content to move right.
        // So offset must DECREASE.
        // offset = initialOffset - delta
        setOffset(initialOffset.current - delta);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        if (isDragging) setIsDragging(false);
    };

    const imageHeight = (zoomLevel / 100) * 300;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>



            {/* Viewport */}
            <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'var(--base3)',
                    borderTop: '1px solid var(--base2)',
                    borderBottom: '1px solid var(--base2)',
                    cursor: isDragging ? 'grabbing' : 'grab'
                }}
            >
                {/* Track */}
                <div
                    style={{
                        display: 'flex',
                        position: 'absolute',
                        left: 0,
                        transform: `translateX(-${offset}px)`,
                        willChange: 'transform'
                    }}
                >
                    {/* Spacer to start from right edge? Or start immediately? 
              User request: "rolling fashion across the screen".
              Usually starts at right edge and moves left? Or starts center?
              Let's start with some padding.
          */}
                    <div style={{ width: '50vw', flexShrink: 0 }} />

                    {lines.map((line, i) => (
                        <img
                            key={i}
                            src={line}
                            alt={`Line ${i}`}
                            style={{
                                height: `${imageHeight}px`, // Scaled height
                                width: 'auto',
                                marginRight: '0', // No gap between lines
                                border: '1px dashed var(--base2)',
                                background: 'white',
                                pointerEvents: 'none', // Prevent image dragging ghost
                                userSelect: 'none'
                            }}
                        />
                    ))}

                    <div style={{ width: '50vw', flexShrink: 0 }} />
                </div>


            </div>

            {/* Controls */}
            <div style={{
                padding: '1.5rem',
                background: 'var(--base2)',
                display: 'flex',
                gap: '2rem',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
            }}>
                <button onClick={() => setOffset(0)} style={{ fontSize: '1.2rem' }}>⏮</button>

                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--accent-color)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    {isPlaying ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 500 }}>Speed</span>
                    <button
                        onClick={() => setSpeed(s => Math.max(0.1, s - 0.1))}
                        style={{ padding: '0.25em 0.75em' }}
                    >
                        -
                    </button>
                    <span style={{ width: '3ch', textAlign: 'center', fontWeight: 'bold' }}>{speed.toFixed(1)}</span>
                    <button
                        onClick={() => setSpeed(s => Math.min(10, s + 0.1))}
                        style={{ padding: '0.25em 0.75em' }}
                    >
                        +
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 500 }}>Size</span>
                    <button
                        onClick={() => setZoomLevel(z => Math.max(50, z - 10))}
                        style={{ padding: '0.25em 0.75em' }}
                    >
                        -
                    </button>
                    <span style={{ width: '4ch', textAlign: 'center', fontWeight: 'bold' }}>{zoomLevel}%</span>
                    <button
                        onClick={() => setZoomLevel(z => Math.min(200, z + 10))}
                        style={{ padding: '0.25em 0.75em' }}
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
};
