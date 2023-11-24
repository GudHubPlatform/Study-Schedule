const documentAddress = {};

function initDocumentAddress(scope) {
    const {
        appId,
        fieldId,
        itemId
    } = scope;

    documentAddress.app_id = appId;
    documentAddress.element_id = fieldId;
    documentAddress.item_id = itemId;
};

function getDocumentObject(cells) {
    return { ...documentAddress, data: {cells}};
};

async function addCell(cell) {
    try {
        const existingCells = await getCells();

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

        await saveCells(existingCells);
    } catch (error) {
        console.error('Error adding cell to document:', error);
    }
}

async function removeLessonFromCell(cell) {
    try {
        const existingCells = await getCells();

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

            await saveCells(existingCells);
        }
    } catch (error) {
        console.error('Error removing lesson from cell in document:', error);
    }
}

async function removeClassroomFromCell(cell) {
    try {
        const existingCells = await getCells();

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

            await saveCells(existingCells);
        }
    } catch (error) {
        console.error('Error removing classroom from cell in document:', error);
    }
}

async function getCells() {
    try {
        const document = await gudhub.getDocument(documentAddress);
        if (!document || !document.data || !document.data.cells) return [];
        const storedCells = document.data.cells;
        return storedCells ? storedCells : [];
    } catch (error) {
        console.error('Error getting cells from document:', error);
        return [];
    }
}

async function saveCells(cells) {
    try {
        const documentObject = getDocumentObject(cells);
        await gudhub.createDocument(documentObject);
    } catch (error) {
        console.error('Error saving cells to document:', error);
    }
}

export default {
    addCell,
    removeClassroomFromCell,
    removeLessonFromCell,
    getCells,
    initDocumentAddress,
}