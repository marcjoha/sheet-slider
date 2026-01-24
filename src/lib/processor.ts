// @ts-ignore
import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';

// Point to the worker file in the public folder
// We copied it from node_modules/pdfjs-dist/build/pdf.worker.min.mjs to public/
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export async function processPDF(file: File): Promise<string[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    const allLines: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 2.0; // Higher scale for better quality
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        const lines = detectAndSliceLines(canvas, context);
        allLines.push(...lines);
    }

    return allLines;
}

function detectAndSliceLines(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): string[] {
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const rowDarkness: number[] = new Array(height).fill(0);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            rowDarkness[y] += (255 - brightness);
        }
    }

    // 1. Identify "Ink Regions"
    // A region is a continuous block of ink.
    const threshold = width * 10; // Noise threshold
    const regions: { start: number, end: number }[] = [];
    let inRegion = false;
    let regionStart = 0;

    for (let y = 0; y < height; y++) {
        const isInk = rowDarkness[y] > threshold;
        if (isInk && !inRegion) {
            inRegion = true;
            regionStart = y;
        } else if (!isInk && inRegion) {
            // Close small gaps within a region immediately?
            // Actually, let's just capture raw regions first.
            inRegion = false;
            regions.push({ start: regionStart, end: y });
        }
    }
    if (inRegion) regions.push({ start: regionStart, end: height });


    // 2. Analyze Gaps & Merge
    // We want to merge "staff lines" and "tab lines" into single "Systems".
    // We look for a large jump in gap size to differentiate "within-system" gap vs "between-system" gap.

    // First, merge very close regions (e.g. broken lines) <= 10px
    const mergedRegions: { start: number, end: number }[] = [];
    if (regions.length > 0) {
        let current = regions[0];
        for (let i = 1; i < regions.length; i++) {
            const next = regions[i];
            if (next.start - current.end <= 15) { // 15px micro-merge tolerance
                current.end = next.end;
            } else {
                mergedRegions.push(current);
                current = next;
            }
        }
        mergedRegions.push(current);
    }

    if (mergedRegions.length === 0) return [];

    // Calculate gaps between merged regions
    const gaps: number[] = [];
    for (let i = 1; i < mergedRegions.length; i++) {
        gaps.push(mergedRegions[i].start - mergedRegions[i - 1].end);
    }

    // Dynamic Thresholding
    // If we have distinct systems, the "System Gap" should be significantly larger than "Staff Gap".
    // Let's take the median gap.
    const sortedGaps = [...gaps].sort((a, b) => a - b);
    const medianGap = sortedGaps[Math.floor(sortedGaps.length / 2)] || 50;

    // Heuristic: A system break is likely > 2.0x the median gap, or at least 50px?
    // If the sheet is dense, median might be the system gap.
    // Let's use clustering or a robust outlier check.
    // Simple robust approach: Any gap > max(50, medianGap * 1.5) is a split.
    // AND gap should be > 20px (min separation).
    const SYSTEM_CUT_THRESHOLD = Math.max(40, medianGap * 1.8);

    const systems: { start: number, end: number }[] = [];
    let currentSystem = mergedRegions[0];

    for (let i = 1; i < mergedRegions.length; i++) {
        const region = mergedRegions[i];
        const gap = region.start - currentSystem.end;

        if (gap > SYSTEM_CUT_THRESHOLD) {
            systems.push(currentSystem);
            currentSystem = region;
        } else {
            // Merge into current system
            currentSystem.end = region.end;
        }
    }
    systems.push(currentSystem);

    // 3. Filter Titles / Headings
    // Heuristic: If the first system is short and isolated at the top.
    // Compare height of first system to median height of other systems.
    // 3. Filter Non-Staff Content (Titles, Headings, Chords, Footers)
    // Heuristic: A valid music system MUST have at least one long horizontal line (the staff line).
    // We check if any row in the system has a darkness > 50% of the max possible darkness.
    // Max possible darkness = width * 255.

    const validSystems = systems.filter(sys => {
        let hasStaffLine = false;
        // Check rows in this system
        for (let y = sys.start; y < sys.end; y++) {
            if (rowDarkness[y] > (width * 255 * 0.5)) {
                hasStaffLine = true;
                break;
            }
        }
        return hasStaffLine;
    });

    // 4. Slice at Midpoints
    const slicedImages: string[] = [];

    validSystems.forEach((sys, index) => {
        // Determine cut points
        // Previous cut is the midpoint gap between prevSys and currSys
        // Next cut is midpoint gap between currSys and nextSys

        // For the first system:
        let topCut = 0;
        if (index === 0) {
            // Include some top margin
            topCut = Math.max(0, sys.start - 50);
        } else {
            const prevSys = validSystems[index - 1];
            // Since we filtered, the 'previous system' in the list is the previous *valid* music line.
            // We should ideally cut at the midpoint of the gap between them.
            // Note: The 'gap' might now contain the discarded text/chords. 
            // Cutting at midpoint is still a reasonable default, or we could be tighter.

            // Let's stick to midpoint between the valid content blocks.
            // This effectively "hides" the discarded chords by not including them in the view window? 
            // Wait, if we cut at midpoint between Item 1 and Item 5 (items 2,3,4 removed),
            // the slice for Item 5 will extend upwards half way to Item 1. 
            // This MIGHT include the chords we just validly excluded if they physically sit there.

            // BETTER APPROACH:
            // Just add fixed padding around the valid system?
            // OR find the midpoint between this system and the *original detected underlying region* above it?
            // Too complex.

            // Let's just use fixed nice padding (e.g. 50px) around the detected staff.
            // This guarantees we don't accidentally include "ghost" content we tried to filter.
            topCut = Math.max(0, sys.start - 60);
        }

        // Bottom cut
        let bottomCut = Math.min(height, sys.end + 60);

        // Ensure cuts don't overlap or go out of bounds?
        // With fixed padding they might overlap if systems are close, but that's okay (each slice is independent).
        // Actually, if we just slice "sys.start - 60" to "sys.end + 60", we act purely on the valid block.
        // This effectively "crops out" the chords sitting above it. Perfect.

        topCut = Math.max(0, sys.start - 60);
        bottomCut = Math.min(height, sys.end + 60);

        // Extract
        const cutH = bottomCut - topCut;
        if (cutH > 0) {
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = width;
            sliceCanvas.height = cutH;
            const sliceCtx = sliceCanvas.getContext('2d');
            if (sliceCtx) {
                sliceCtx.drawImage(canvas, 0, topCut, width, cutH, 0, 0, width, cutH);
                slicedImages.push(sliceCanvas.toDataURL('image/png'));
            }
        }
    });

    return slicedImages;
}
