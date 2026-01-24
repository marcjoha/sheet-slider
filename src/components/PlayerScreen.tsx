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

    const requestRef = useRef<number | undefined>(undefined);

    const animate = useCallback(() => {
        if (isPlaying) {
            setOffset(prev => prev + speed);
            requestRef.current = requestAnimationFrame(animate);
        }
    }, [isPlaying, speed]);

    useEffect(() => {
        if (isPlaying) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying, animate]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                setIsPlaying(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const imageHeight = (zoomLevel / 100) * 300;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>



            {/* Viewport */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'var(--base3)',
                    borderTop: '1px solid var(--base2)',
                    borderBottom: '1px solid var(--base2)'
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
                                background: 'white'
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
                        fontSize: '1.5rem',
                        background: 'var(--accent-color)',
                        color: 'white',
                        border: 'none'
                    }}
                >
                    {isPlaying ? '⏸' : '▶'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 500 }}>Speed</span>
                    <button
                        onClick={() => setSpeed(s => Math.max(0.5, s - 0.5))}
                        style={{ padding: '0.25em 0.75em' }}
                    >
                        -
                    </button>
                    <span style={{ width: '3ch', textAlign: 'center', fontWeight: 'bold' }}>{speed.toFixed(1)}</span>
                    <button
                        onClick={() => setSpeed(s => Math.min(10, s + 0.5))}
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
