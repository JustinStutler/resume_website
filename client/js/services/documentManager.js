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
                pdfPath: 'pdfs/Song-Genre-Proposal.pdf',
                imagePath: 'pngs/Song-Genre-Proposal.png',
                downloadFileName: 'Song Genre from Album Art - Proposal.pdf',
                tabs: {
                    proposal: {
                        label: 'Proposal',
                        pdfPath: 'pdfs/Song-Genre-Proposal.pdf',
                        imagePath: 'pngs/Song-Genre-Proposal.png',
                        downloadFileName: 'Song Genre from Album Art - Proposal.pdf'
                    },
                    project: {
                        label: 'Project',
                        pdfPath: 'pdfs/Song-Genre-Project.pdf',
                        imagePath: 'pngs/Song-Genre-Project.png',
                        downloadFileName: 'Song Genre from Album Art - Project.pdf'
                    }
                },
                defaultTab: 'proposal'
            };
        } else if (type === 'connect-4') {
            return {
                friendlyName: "Connect 4: Transformer RL Agent",
                pdfPath: 'pdfs/Connect-4-Proposal.pdf',
                imagePath: 'pngs/Connect-4-Proposal.png',
                downloadFileName: 'Connect 4 - Proposal.pdf',
                tabs: {
                    proposal: {
                        label: 'Proposal',
                        pdfPath: 'pdfs/Connect-4-Proposal.pdf',
                        imagePath: 'pngs/Connect-4-Proposal.png',
                        downloadFileName: 'Connect 4 - Proposal.pdf'
                    },
                    project: null
                },
                defaultTab: 'proposal'
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

        const tabsHtml = details.tabs ? this._generateTabsHtml(details) : '';

        return `
            <div class="document-preview-container">
                <div class="preview-header">
                    <p>Here's a preview of ${details.friendlyName}:</p>
                    <div class="preview-header-actions" style="display:flex; flex-direction:row; flex-wrap:nowrap; align-items:center; gap:6px; white-space:nowrap;">
                        ${tabsHtml}
                        <a href="${details.pdfPath}" target="_blank" rel="noopener noreferrer" class="icon-download-button-header view-pdf-link">View full PDF</a>
                        <button class="icon-download-button-header" title="Download ${details.friendlyName}" data-pdf-url="${details.pdfPath}" data-pdf-filename="${details.downloadFileName}">${DOWNLOAD_ICON_SVG}</button>
                    </div>
                </div>
                ${previewContent}
            </div>`;
    }

    _generateTabsHtml(details) {
        const { tabs, defaultTab } = details;
        let html = '<div class="preview-tab-group">';

        for (const [key, tab] of Object.entries(tabs)) {
            if (tab === null) {
                html += `<span class="preview-tab-chip preview-tab-coming-soon" data-tab-key="${key}">Coming Soon</span>`;
            } else {
                const isActive = key === defaultTab;
                html += `<button class="preview-tab-chip${isActive ? ' active' : ''}" data-tab-key="${key}" data-tab-pdf="${tab.pdfPath}" data-tab-image="${tab.imagePath}" data-tab-filename="${tab.downloadFileName}">${tab.label}</button>`;
            }
        }

        html += '</div>';
        return html;
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

    static initTabHandler() {
        document.addEventListener('click', (e) => {
            const chip = e.target.closest('.preview-tab-chip:not(.preview-tab-coming-soon)');
            if (!chip || chip.classList.contains('active')) return;

            const container = chip.closest('.document-preview-container');
            if (!container) return;

            // Toggle active state on tabs
            container.querySelectorAll('.preview-tab-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            // Update preview image
            const img = container.querySelector('.document-image-preview');
            if (img) {
                img.src = chip.dataset.tabImage;
                img.alt = `${chip.textContent} Preview`;
            }

            // Update View full PDF link
            const viewLink = container.querySelector('.view-pdf-link');
            if (viewLink) {
                viewLink.href = chip.dataset.tabPdf;
            }

            // Update Download button
            const downloadBtn = container.querySelector('[data-pdf-url]');
            if (downloadBtn) {
                downloadBtn.dataset.pdfUrl = chip.dataset.tabPdf;
                downloadBtn.dataset.pdfFilename = chip.dataset.tabFilename;
            }
        });
    }
}
