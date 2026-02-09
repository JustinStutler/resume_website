import { imageGallery } from '../data.js';

export class GalleryManager {
    constructor() {
        this.viewedImageNames = new Set();
        this.lastImageShown = null;
    }

    getRandomImage() {
        if (imageGallery.length === 0) return { error: "No images in gallery." };

        let availableImages = imageGallery.filter(img => !this.viewedImageNames.has(img));
        let resetOccurred = false;

        if (availableImages.length === 0) {
            this.viewedImageNames.clear();
            availableImages = [...imageGallery];
            resetOccurred = true;

            // Avoid repeating the last one immediately
            if (this.lastImageShown && availableImages.length > 1) {
                const filtered = availableImages.filter(img => img !== this.lastImageShown);
                if (filtered.length > 0) availableImages = filtered;
            }
        }

        const randomIndex = Math.floor(Math.random() * availableImages.length);
        const selectedImage = availableImages[randomIndex];

        this.viewedImageNames.add(selectedImage);
        this.lastImageShown = selectedImage;

        return {
            imageName: selectedImage,
            resetOccurred: resetOccurred,
            count: this.viewedImageNames.size,
            total: imageGallery.length
        };
    }
}