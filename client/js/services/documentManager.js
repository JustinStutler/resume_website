import { DOWNLOAD_ICON_SVG } from '../config.js';

export class DocumentManager {
    getPdfDetails(type) {
        if (type === 'resume') {
            return {
                friendlyName: "Justin's Resume",
                pdfPath: 'pdfs/Resume-3-25-26.pdf',
                imagePath: 'pngs/Resume---Justin-Stutler.png',
                downloadFileName: 'Resume - Justin Stutler.pdf'
            };
        } else if (type === 'sop') {
            return {
                friendlyName: "Justin's Statement of Purpose",
                pdfPath: 'pdfs/Statement-of-Purpose---Justin-Stutler.pdf',
                imagePath: 'pngs/Statement-of-Purpose---Justin-Stutler.png',
                downloadFileName: 'Statement of Purpose - Justin Stutler.pdf'
            };
        } else if (type === 'housing-prices') {
            return {
                friendlyName: "Housing Prices Project",
                pdfPath: 'pdfs/House-Prices---Advanced-Regression-Techniques.pdf',
                imagePath: 'pngs/House-Prices---Advanced-Regression-Techniques.png',
                downloadFileName: 'House Prices - Advanced Regression Techniques.pdf'
            };
        } else if (type === 'facial-recognition') {
            return {
                friendlyName: "Facial Recognition Project",
                pdfPath: 'pdfs/Facial-Recognition.pdf',
                imagePath: 'pngs/Facial-Recognition.png',
                downloadFileName: 'Facial Recognition.pdf'
            };
        } else if (type === 'robot-localization') {
            return {
                friendlyName: "Robot Localization Project",
                pdfPath: 'pdfs/Robot-Localization-with-Particle-Filtering.pdf',
                imagePath: 'pngs/Robot-Localization-with-Particle-Filtering.png',
                downloadFileName: 'Robot Localization with Particle Filtering.pdf'
            };
        } else if (type === 'uninformed-informed-search') {
            return {
                friendlyName: "Uninformed and Informed Search Project",
                pdfPath: 'pdfs/Uninformed-and-Informed-Search.pdf',
                imagePath: 'pngs/Uninformed-and-Informed-Search.png',
                downloadFileName: 'Uninformed and Informed Search.pdf'
            };
        } else if (type === 'cv-capstone') {
            return {
                friendlyName: "Song Genre from Album Art: Computer Vision Capstone",
                pdfPath: 'pdfs/Song-Genre-from-Album-Art---Computer-Vision-Capstone.pdf',
                imagePath: 'pngs/Song-Genre-from-Album-Art---Computer-Vision-Capstone.png',
                downloadFileName: 'Song Genre from Album Art - Computer Vision Capstone.pdf'
            };
        } else if (type === 'ai-interface') {
            return {
                friendlyName: "AI Personal Assistant and Interface",
                pdfPath: 'pdfs/AI-Personal-Assistant-and-Interface.pdf',
                imagePath: 'pngs/AI-Personal-Assistant-and-Interface.png',
                downloadFileName: 'AI Personal Assistant and Interface.pdf'
            };
        }
        return null;
    }

    generatePreviewHtml(details) {
        const previewContent = `<div class="image-wrapper">
                    <img src="${details.imagePath}" alt="${details.friendlyName} Preview" class="document-image-preview" onerror="this.alt='Preview image not available'; this.style.display='none'; this.parentNode.insertAdjacentHTML('beforeend', '<p>Preview image not available.</p>');">
               </div>`;

        return `
            <div class="document-preview-container">
                <div class="preview-header">
                    <p>Here's a preview of ${details.friendlyName}:</p>
                    <div class="preview-header-actions" style="display:flex; flex-direction:row; flex-wrap:nowrap; align-items:center; gap:6px; white-space:nowrap;">
                        <a href="${details.pdfPath}" target="_blank" rel="noopener noreferrer" class="icon-download-button-header view-pdf-link">View full PDF</a>
                        <button class="icon-download-button-header" title="Download ${details.friendlyName}" data-pdf-url="${details.pdfPath}" data-pdf-filename="${details.downloadFileName}">${DOWNLOAD_ICON_SVG}</button>
                    </div>
                </div>
                ${previewContent}
            </div>`;
    }

    static initDownloadHandler() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-pdf-url]');
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();

            const url = btn.dataset.pdfUrl;
            const filename = btn.dataset.pdfFilename;

            fetch(url)
                .then(res => {
                    if (!res.ok) throw new Error(`Download failed: ${res.status}`);
                    return res.blob();
                })
                .then(rawBlob => {
                    const blob = new Blob([rawBlob], { type: 'application/pdf' });
                    const blobUrl = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = blobUrl;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(blobUrl);
                    }, 1000);
                })
                .catch(err => {
                    console.error('PDF download error:', err);
                    // Fallback: direct link in new tab
                    const a = document.createElement('a');
                    a.href = url;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                });
        });
    }
}