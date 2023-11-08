const dataKey = 'scheduleCells';

function addCell(cell) {
    try {
        const existingCells = getCells();

        const isDuplicate = existingCells.some(existinCells => (
            existinCells.clas.classNumber === cell.clas.classNumber &&
            existinCells.clas.classLetter === cell.clas.classLetter &&
            existinCells.lessonNumber === cell.lessonNumber
        ));

        if (isDuplicate) {
            console.error('Cell with the same classNumber, classLetter, and lessonNumber already exists.');
            return;
        }

        existingCells.push(cell);

        saveCells(existingCells);
    } catch (error) {
        console.error('Error adding cell to localStorage:', error);
    }
}

function removeCell(cell) {
    try {
        const existingCells = getCells();

        const cellIndex = existingCells.findIndex(existingCell => (
            existingCell.clas.classNumber === cell.clas.classNumber &&
            existingCell.clas.classLetter === cell.clas.classLetter &&
            existingCell.lessonNumber === cell.lessonNumber
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
    removeCell,
    getCells
}