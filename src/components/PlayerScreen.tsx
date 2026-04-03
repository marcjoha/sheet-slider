import { useRef, useEffect, useState, useCallback } from 'react';

interface Props {
    lines: string[];
    onReset: () => void;
}

export const PlayerScreen = ({ lines, onReset }: Props) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(2); // pixels per frame
    const [offset, setOffset] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(100); // percentage

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const dragStartX = useRef<number>(0);
    const initialOffset = useRef<number>(0);

    // Idle state
    const [isIdle, setIsIdle] = useState(false);
    const idleTimeout = useRef<number | undefined>(undefined);

    useEffect(() => {
        let lastX = -1;
        let lastY = -1;

        const resetIdle = (e?: Event) => {
            // Check if it's a mouse event and if coordinates actually changed
            if (e && e.type === 'mousemove') {
                const mouseEvent = e as MouseEvent;
                if (mouseEvent.clientX === lastX && mouseEvent.clientY === lastY) {
                    return; // Ignore fake mousemove from DOM changes under cursor
                }
                lastX = mouseEvent.clientX;
                lastY = mouseEvent.clientY;
            }

            setIsIdle(false);
            if (idleTimeout.current) clearTimeout(idleTimeout.current);
            idleTimeout.current = window.setTimeout(() => setIsIdle(true), 2500);
        };

        window.addEventListener('mousemove', resetIdle);
        window.addEventListener('keydown', resetIdle);
        window.addEventListener('touchstart', resetIdle);

        resetIdle();

        return () => {
            window.removeEventListener('mousemove', resetIdle);
            window.removeEventListener('keydown', resetIdle);
            window.removeEventListener('touchstart', resetIdle);
            if (idleTimeout.current) clearTimeout(idleTimeout.current);
        };
    }, []);

    const requestRef = useRef<number | undefined>(undefined);

    const animate = useCallback(function animateFrame() {
        if (isPlaying && !isDragging) {
            setOffset(prev => prev + speed);
            requestRef.current = requestAnimationFrame(animateFrame);
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
        setOffset(initialOffset.current - delta);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        if (isDragging) setIsDragging(false);
    };

    const imageHeight = (zoomLevel / 100) * 450;
    const showControls = !isPlaying || !isIdle;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative', cursor: isPlaying && isIdle && !isDragging ? 'none' : 'default' }}>

            {/* Back Button (Top Left) */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0,
                padding: 'clamp(0.5rem, 4vw, 1.5rem)',
                zIndex: 20,
                transition: 'opacity 0.5s ease',
                opacity: showControls ? 1 : 0,
                pointerEvents: showControls ? 'auto' : 'none'
            }}>
                <button onClick={onReset} style={{ 
                    padding: '0.5rem 1rem', 
                    borderRadius: '8px', 
                    border: 'none', 
                    background: 'var(--base2)', 
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    fontWeight: 600
                }}>
                    ← Back
                </button>
            </div>


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
                    cursor: isDragging ? 'grabbing' : isPlaying && isIdle ? 'none' : 'grab'
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
                    <div style={{ width: '50vw', flexShrink: 0 }} />

                    {lines.map((line, i) => (
                        <img
                            key={i}
                            src={line}
                            alt={`Line ${i}`}
                            style={{
                                height: `${imageHeight}px`,
                                width: 'auto',
                                marginRight: '0',
                                border: '1px dashed var(--base2)',
                                background: 'white',
                                pointerEvents: 'none',
                                userSelect: 'none'
                            }}
                        />
                    ))}

                    <div style={{ width: '50vw', flexShrink: 0 }} />
                </div>
            </div>

            {/* Controls */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: 'clamp(0.75rem, 3vw, 1.5rem)',
                background: 'var(--base2)',
                display: 'flex',
                gap: 'clamp(0.5rem, 4vw, 2rem)',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
                transition: 'transform 0.5s ease, opacity 0.5s ease',
                transform: showControls ? 'translateY(0)' : 'translateY(100%)',
                opacity: showControls ? 1 : 0,
                pointerEvents: showControls ? 'auto' : 'none',
                zIndex: 10
            }}>
                <button onClick={() => setOffset(0)} style={{ fontSize: '1.2rem', cursor: 'pointer', background: 'transparent', border: 'none' }}>⏮</button>

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
                        style={{ padding: '0.25em 0.75em', cursor: 'pointer' }}
                    >
                        -
                    </button>
                    <span style={{ width: '3ch', textAlign: 'center', fontWeight: 'bold' }}>{speed.toFixed(1)}</span>
                    <button
                        onClick={() => setSpeed(s => Math.min(10, s + 0.1))}
                        style={{ padding: '0.25em 0.75em', cursor: 'pointer' }}
                    >
                        +
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 500 }}>Size</span>
                    <button
                        onClick={() => setZoomLevel(z => Math.max(50, z - 10))}
                        style={{ padding: '0.25em 0.75em', cursor: 'pointer' }}
                    >
                        -
                    </button>
                    <span style={{ width: '4ch', textAlign: 'center', fontWeight: 'bold' }}>{zoomLevel}%</span>
                    <button
                        onClick={() => setZoomLevel(z => Math.min(200, z + 10))}
                        style={{ padding: '0.25em 0.75em', cursor: 'pointer' }}
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
};
