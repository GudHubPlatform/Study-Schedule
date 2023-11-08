export default class ScheduleModel {
    constructor(classes, daysOfWeek, lessonsPerDay) {
        this.classes = classes;
        this.daysOfWeek = daysOfWeek;
        this.lessonsPerDay = lessonsPerDay;
        this.rowCount = this.daysOfWeek.length * this.lessonsPerDay;
        this.colCount = this.classes.length;
        this.scheduleStorage = [];
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
        const removedLesson = foundCell.lesson;
    
        if (removedLesson !== null) {
            foundCell.lesson = null;
        }

        return removedLesson;
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
}