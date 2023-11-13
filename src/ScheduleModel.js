export default class ScheduleModel {
    constructor(classes, daysOfWeek, lessonsPerDay) {
        this.classes = classes;
        this.daysOfWeek = daysOfWeek;
        this.lessonsPerDay = lessonsPerDay;
        this.rowCount = this.daysOfWeek.length * this.lessonsPerDay;
        this.colCount = this.classes.length;
        this.scheduleStorage = [];
        this.academicHours = {};
    }

    storageInitialization(cellsMap) {
        for (let i = 0; i < this.rowCount; i++) {
            this.scheduleStorage.push([]);
    
            for (const clas of this.classes) {
                let cell = {
                    dayOfWeek: this.daysOfWeek[i % this.daysOfWeek.length],
                    clas: clas,
                    lessonNumber: i % this.lessonsPerDay + 1,
                    lesson: null,
                    htmlElement: null,
                };

                const key = `${cell.clas.classNumber}:${cell.clas.classLetter}:${cell.dayOfWeek}:${cell.lessonNumber}`;

                const foundcell = cellsMap[key];

                if (foundcell) {
                    cell = foundcell;
                    this.addAcademicHour(cell.lesson.id);
                }

                this.scheduleStorage[i].push(cell);
            }
        }
    }

    getCell(row, col) {
        const foundCell = this.scheduleStorage[row][col];
        return foundCell;
    }

    setLesson(row, col, lesson) {
        const foundCell = this.scheduleStorage[row][col];
        foundCell.lesson = lesson;
        return foundCell;
    }

    removeLesson(row, col) {
        const foundCell = this.scheduleStorage[row][col];
        const removedLessonId = foundCell.lesson.id;

        foundCell.lesson = null;

        return removedLessonId;
    }

    setHTMLElement(row, col, element) {
        const foundCell = this.scheduleStorage[row][col];
        foundCell.htmlElement = element;
        return foundCell;
    }
    
    getHTMLElement(row, col) {
        const foundCell = this.scheduleStorage[row][col];
        return foundCell.htmlElement;
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
        return [...this.scheduleStorage.map((row) => [...row])];
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
}