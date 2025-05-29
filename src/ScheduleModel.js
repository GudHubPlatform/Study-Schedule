export default class ScheduleModel {
    constructor(classes, daysOfWeek, lessonsPerDay, selectedDayIndexes = null) {
        this.classes = classes;
        this.daysOfWeek = daysOfWeek;
        this.lessonsPerDay = lessonsPerDay;
        this.selectedDayIndexes = selectedDayIndexes || daysOfWeek.map((_, index) => index);
        this.rowCount = this.daysOfWeek.length * this.lessonsPerDay;
        this.colCount = this.classes.length;
        this.scheduleStorage = [];
        this.academicHours = {};
    }

    getCell(row, col) {
        const foundCell = this.scheduleStorage[row][col];
        return foundCell;
    }

    setLesson(row, col, lesson) {
        const foundCell = this.scheduleStorage[row][col];

        if (foundCell.lesson) return;

        foundCell.lesson = lesson;
        return foundCell;
    }

    removeLesson(row, col) {
        const foundCell = this.scheduleStorage[row][col];
        if (!foundCell.lesson) return false;
        const removedLessonId = foundCell.lesson.uniqueId;

        foundCell.lesson = null;

        return removedLessonId;
    }

    setClassroom(row, col, room) {
        const foundCell = this.scheduleStorage[row][col];

        if (foundCell.room) return;

        foundCell.room = room;
        return foundCell;
    }

    removeClassroom(row, col) {
        const foundCell = this.scheduleStorage[row][col];
        if (!foundCell.room) return false;
        const removedClassroomId = foundCell.room.id;

        foundCell.room = null;

        return removedClassroomId;
    }

    setHTMLElement(row, col, element) {
        const foundCell = this.scheduleStorage[row][col];
        foundCell.htmlElement = element;
        return foundCell;
    }

    getLessonCellHTMLElement(row, col) {
        const foundCell = this.scheduleStorage[row][col];
        return foundCell.htmlElement;
    }

    getClassroomCellHTMLElement(row, col) {
        const foundCell = this.scheduleStorage[row][col];
        if (foundCell.htmlElement) {
            return foundCell.htmlElement.nextElementSibling;
        }
    }

    getClassNumber(row, col) {
        const foundCell = this.scheduleStorage[row][col];
        return foundCell.clas.classNumber;
    }

    getRowCount() {
        return this.rowCount;
    }

    getColCount() {
        return this.colCount;
    }

    getStorage() {
        return [...this.scheduleStorage.map(row => [...row])];
    }

    getAcademicHours() {
        const hours = {};

        for (const [id, value] of Object.entries(this.academicHours)) {
            hours[id] = value;
        }

        return hours;
    }

    addAcademicHour(lessonId) {
        const isExist = Object.hasOwnProperty.call(this.academicHours, [lessonId]);

        if (isExist) {
            this.academicHours[lessonId]++;
        } else {
            this.academicHours[lessonId] = 1;
        }
    }

    subtractAcademicHour(lessonId) {
        const isExist = Object.hasOwnProperty.call(this.academicHours, [lessonId]);

        if (isExist) {
            this.academicHours[lessonId]--;

            if (this.academicHours[lessonId] === 0) {
                delete this.academicHours[lessonId];
            }
        }
    }

    // Convert display row to original day index
    getOriginalDayIndex(row) {
        const displayDayIndex = Math.floor(row / this.lessonsPerDay);
        return this.selectedDayIndexes[displayDayIndex];
    }

    // Convert original day index to display row range
    getDisplayRowsForOriginalDay(originalDayIndex) {
        const displayDayIndex = this.selectedDayIndexes.indexOf(originalDayIndex);
        if (displayDayIndex === -1) return null;
        
        const startRow = displayDayIndex * this.lessonsPerDay;
        const endRow = startRow + this.lessonsPerDay - 1;
        return { startRow, endRow, displayDayIndex };
    }
}

export function getKeyFromCell(cell) {
    const key = `${cell.clas.id}:${cell.dayOfWeekIndex}:${cell.lessonNumber}`;
    return key;
}
