import { DOWNLOAD_ICON_SVG } from '../config.js';

export class DocumentManager {
    getPdfDetails(type) {
        if (type === 'resume') {
            return {
                friendlyName: "Justin's Resume",
                pdfPath: 'pdfs/Resume - Justin Stutler.pdf',
                imagePath: 'pdfs/Resume - Justin Stutler.png',
                downloadFileName: 'Resume - Justin Stutler.pdf'
            };
        } else if (type === 'sop') {
            return {
                friendlyName: "Justin's Statement of Purpose",
                pdfPath: 'pdfs/Statement of Purpose - Justin Stutler.pdf',
                imagePath: 'pdfs/Statement of Purpose - Justin Stutler.png',
                downloadFileName: 'Statement of Purpose - Justin Stutler.pdf'
            };
        }
        return null;
    }

    generatePreviewHtml(details) {
        return `
            <div class="document-preview-container">
                <div class="preview-header">
                    <p>Here's a preview of ${details.friendlyName}:</p>
                    <a href="${details.pdfPath}" download="${details.downloadFileName}" class="icon-download-button-header" title="Download ${details.friendlyName}">${DOWNLOAD_ICON_SVG}</a>
                </div>
                <div class="image-wrapper">
                    <img src="${details.imagePath}" alt="${details.friendlyName} Preview" class="document-image-preview" onerror="this.alt='Preview image not available'; this.style.display='none'; this.parentNode.insertAdjacentHTML('beforeend', '<p>Preview image not available.</p>');">
                </div>
            </div>`;
    }
}