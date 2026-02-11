import { DOWNLOAD_ICON_SVG } from '../config.js';

export class DocumentManager {
    getPdfDetails(type) {
        if (type === 'resume') {
            return {
                friendlyName: "Justin's Resume",
                // Add cache-busting query so browser/extensions don't use an old blank version
                pdfPath: 'pdfs/Resume - Justin Stutler.pdf?v=1',
                imagePath: 'pngs/Resume - Justin Stutler.png',
                downloadFileName: 'Resume - Justin Stutler.pdf'
            };
        } else if (type === 'sop') {
            return {
                friendlyName: "Justin's Statement of Purpose",
                pdfPath: 'pdfs/Statement of Purpose - Justin Stutler.pdf',
                imagePath: 'pngs/Statement of Purpose - Justin Stutler.png',
                downloadFileName: 'Statement of Purpose - Justin Stutler.pdf'
            };
        } else if (type === 'housing-prices') {
            return {
                friendlyName: "Housing Prices Project",
                pdfPath: 'pdfs/House Prices - Advanced Regression Techniques.pdf',
                imagePath: 'pngs/House Prices - Advanced Regression Techniques.png',
                downloadFileName: 'House Prices - Advanced Regression Techniques.pdf'
            };
        } else if (type === 'facial-recognition') {
            return {
                friendlyName: "Facial Recognition Project",
                pdfPath: 'pdfs/Facial Recognition.pdf',
                imagePath: 'pngs/Facial Recognition.png',
                downloadFileName: 'Facial Recognition.pdf'
            };
        } else if (type === 'robot-localization') {
            return {
                friendlyName: "Robot Localization Project",
                pdfPath: 'pdfs/Robot Localization with Particle Filtering.pdf',
                imagePath: 'pngs/Robot Localization with Particle Filtering.png',
                downloadFileName: 'Robot Localization with Particle Filtering.pdf'
            };
        } else if (type === 'uninformed-informed-search') {
            return {
                friendlyName: "Uninformed and Informed Search Project",
                pdfPath: 'pdfs/Uninformed and Informed Search.pdf',
                imagePath: 'pngs/Uninformed and Informed Search.png',
                downloadFileName: 'Uninformed and Informed Search.pdf'
            };
        }
        return null;
    }

    generatePreviewHtml(details) {
        return `
            <div class="document-preview-container">
                <div class="preview-header">
                    <p>Here's a preview of ${details.friendlyName}:</p>
                    <div class="preview-header-actions" style="display:flex; flex-direction:row; flex-wrap:nowrap; align-items:center; gap:6px; white-space:nowrap;">
                        <a href="${details.pdfPath}" target="_blank" rel="noopener noreferrer" class="icon-download-button-header view-pdf-link">View full PDF</a>
                        <a href="${details.pdfPath}" download="${details.downloadFileName}" class="icon-download-button-header" title="Download ${details.friendlyName}">${DOWNLOAD_ICON_SVG}</a>
                    </div>
                </div>
                <div class="image-wrapper">
                    <img src="${details.imagePath}" alt="${details.friendlyName} Preview" class="document-image-preview" onerror="this.alt='Preview image not available'; this.style.display='none'; this.parentNode.insertAdjacentHTML('beforeend', '<p>Preview image not available.</p>');">
                </div>
            </div>`;
    }
}