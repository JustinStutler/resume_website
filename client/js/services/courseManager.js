import { allDescribableCourses } from '../data.js';

export class CourseManager {
    constructor() {
        this.shownCourseIdentifiers = [];
        this.lastCourseShown = null;
    }

    getRandomCourse() {
        let availableCourses = allDescribableCourses.filter(course =>
            !this.shownCourseIdentifiers.includes(this._getIdentifier(course))
        );

        let resetOccurred = false;

        // Reset if all courses shown
        if (availableCourses.length === 0) {
            this.shownCourseIdentifiers = [];
            availableCourses = [...allDescribableCourses];
            resetOccurred = true;

            // Try to avoid showing the exact same one immediately after reset
            if (this.lastCourseShown && availableCourses.length > 1) {
                const lastId = this._getIdentifier(this.lastCourseShown);
                const filtered = availableCourses.filter(c => this._getIdentifier(c) !== lastId);
                if (filtered.length > 0) availableCourses = filtered;
            }
        }

        const randomIndex = Math.floor(Math.random() * availableCourses.length);
        const selectedCourse = availableCourses[randomIndex];
        
        // Update state
        this.shownCourseIdentifiers.push(this._getIdentifier(selectedCourse));
        this.lastCourseShown = selectedCourse;

        return {
            course: selectedCourse,
            resetOccurred: resetOccurred,
            allShown: this.shownCourseIdentifiers.length >= allDescribableCourses.length
        };
    }

    _getIdentifier(course) {
        return JSON.stringify({ 
            name: course.name, 
            institution: course.institution, 
            term: course.term 
        });
    }
}