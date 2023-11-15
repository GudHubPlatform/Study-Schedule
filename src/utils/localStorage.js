const dataKey = 'scheduleCells';

function addCell(cell) {
    try {
        console.log(cell);
        const existingCells = getCells();

        const existingCellIndex = existingCells.findIndex(existingCell => (
            existingCell.clas.id === cell.clas.id &&
            existingCell.dayOfWeek === cell.dayOfWeek &&
            existingCell.lessonNumber === cell.lessonNumber
        ));

        if (existingCellIndex !== -1) {
            existingCells[existingCellIndex] = { ...existingCells[existingCellIndex], ...cell };
        } else {
            existingCells.push(cell);
        }

        saveCells(existingCells);
    } catch (error) {
        console.error('Error adding cell to localStorage:', error);
    }
}

function removeLessonFromCell(cell) {
    try {
        const existingCells = getCells();

        const cellIndex = existingCells.findIndex(existingCell => (
            existingCell.clas.id === cell.clas.id &&
            existingCell.dayOfWeek === cell.dayOfWeek &&
            existingCell.lessonNumber === cell.lessonNumber
        ));

        if (cellIndex !== -1) {
            delete existingCells[cellIndex].lesson;

            if (!existingCells[cellIndex].classroom) {
                existingCells.splice(cellIndex, 1);
            }

            saveCells(existingCells);
        }
    } catch (error) {
        console.error('Error removing lesson from cell in localStorage:', error);
    }
}

function removeClassroomFromCell(cell) {
    try {
        const existingCells = getCells();

        const cellIndex = existingCells.findIndex(existingCell => (
            existingCell.clas.id === cell.clas.id &&
            existingCell.dayOfWeek === cell.dayOfWeek &&
            existingCell.lessonNumber === cell.lessonNumber
        ));

        if (cellIndex !== -1) {
            delete existingCells[cellIndex].classroom;

            if (!existingCells[cellIndex].lesson) {
                existingCells.splice(cellIndex, 1);
            }

            saveCells(existingCells);
        }
    } catch (error) {
        console.error('Error removing classroom from cell in localStorage:', error);
    }
}

function removeCell(cell) {
    try {
        const existingCells = getCells();

        const cellIndex = existingCells.findIndex(existingCell => (
            existingCell.clas.id  == cell.clas.id &&
            existingCell.dayOfWeek == cell.dayOfWeek &&
            existingCell.lessonNumber == cell.lessonNumber
        ));

        if (cellIndex !== -1) {
            existingCells.splice(cellIndex, 1);

            saveCells(existingCells);
        }
    } catch (error) {
        console.error('Error removing cell from localStorage:', error);
    }
}

function getCells() {
    try {
        const storedCells = localStorage.getItem(dataKey);
        return storedCells ? JSON.parse(storedCells) : [];
    } catch (error) {
        console.error('Error getting cells from localStorage:', error);
        return [];
    }
}

function saveCells(cells) {
    try {
        localStorage.setItem(dataKey, JSON.stringify(cells));
    } catch (error) {
        console.error('Error saving cells to localStorage:', error);
    }
}

export default {
    addCell,
    removeClassroomFromCell,
    removeLessonFromCell,
    getCells
}