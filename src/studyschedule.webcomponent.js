import GhHtmlElement from "@gudhub/gh-html-element";
import html from "./studyschedule.html";
import './style.scss';

import {REDIPS} from './redips-drag-min.js';
import { classes, lessons } from "./offlineData.js";
import ScheduleController from "./ScheduleController.js";
import ScheduleModel from "./ScheduleModel.js";

class GhStudySchedule extends GhHtmlElement {

    // Constructor with super() is required for native web component initialization

    constructor() {
        super();
        this.columnWidth = 2;
        this.daysOfWeek = ["понеділок","вівторок","середа","четвер","п'ятниця"];
        this.lessonsPerDay = 7;
        this.classes = classes;
        this.lessons = lessons;

        this.cellRowAttribute = 'data-row';
        this.cellColAttribute = 'data-col';
        this.lessonIdAttribute = 'data-id';
        this.lessonCellClass = '.lesson-cell';
        
        this.clickedCell;
        this.disableHighlight;

        this.model = new ScheduleModel(classes, this.daysOfWeek, this.lessonsPerDay);
        this.controller = new ScheduleController(this.model, lessons);
        this.controller.loadLocalStorageCellsToStorage();
        this.storage = this.controller.getStorage();
    }

    // onInit() is called after parent gh-element scope is ready

    onInit() {
        super.render(html);
        
        this.setCorrespondingHTMLElements();
        this.dndInit();
    };

    dndInit() {
        // create container needed for methods below
        const redips = {};

        const handleDrag = this.handleDragElement.bind(this);
        const handleDrop = this.handleDropElement.bind(this);
        const handleDeleted = this.handleDeleted.bind(this);
        const handleFinish = this.handleFinishEvent.bind(this);

        // initialization
        redips.init = function () {
            // reference to the REDIPS.drag library
            const rd = REDIPS.drag;
            // initialization
            rd.init('redips-drag');
            // set hover color
            rd.hover.colorTd = '#9BB3DA';
            rd.dropMode = 'single';
            rd.scroll.bound = 100;
            
            rd.event.clicked = (clickedCell) => {
                handleDrag(clickedCell);
            };

            rd.event.droppedBefore = (targetCell) => {
                return handleDrop(targetCell);
            };

            rd.event.deleted = (isExistingCell) => {
                return handleDeleted(isExistingCell);
            };

            rd.event.finish = () => {
                handleFinish();
            };
        }

        setTimeout(() => {
            redips.init();
        }, 0);
    }

    handleDragElement(clickedCell) {
        this.clickedCell = clickedCell;
    
        const lessonId = this.clickedCell.children[0].getAttribute(this.lessonIdAttribute);
        
        const row = clickedCell.getAttribute(this.cellRowAttribute);
        const col = clickedCell.getAttribute(this.cellColAttribute);

        const clickedCellCoords = {row, col};
        
        this.disableHighlight = this.controller.highlightCells(lessonId, clickedCellCoords);
    }

    handleDropElement(targetCell) {
        const row = targetCell.getAttribute(this.cellRowAttribute);
        const col = targetCell.getAttribute(this.cellColAttribute);

        if (targetCell === this.clickedCell) return false;

        const  lessonId = this.clickedCell.children[0].getAttribute(this.lessonIdAttribute);

        const res = this.controller.setLesson(row, col, lessonId);

        if (Boolean(res) && this.clickedCell.classList.contains('lesson-cell')) {
            const clickedCellRow = this.clickedCell.getAttribute(this.cellRowAttribute);
            const clickedCellCol = this.clickedCell.getAttribute(this.cellColAttribute);

            const removedLesson = this.controller.removeLesson(clickedCellRow, clickedCellCol);
        }

        return Boolean(res);
    }

    handleDeleted(isExistingCell) {
        const clickedCellRow = this.clickedCell.getAttribute(this.cellRowAttribute);
        const clickedCellCol = this.clickedCell.getAttribute(this.cellColAttribute);

        const removedLesson = this.controller.removeLesson(clickedCellRow, clickedCellCol);
    }

    handleFinishEvent() {
        this.disableHighlight();
    }

    setCorrespondingHTMLElements() {
        const htmlElements = document.querySelectorAll(this.lessonCellClass);

        this.controller.setHTMLElements(htmlElements);
    }

    // scheduleRulesMatch(clickedCell, targetCell) {
    //     const lessonName = clickedCell.textContent;
    //     const targetCellClassNumber = this.getValueFromClassName(targetCell, this.numberClassPrefix);
    //     const rowOfTargetCell = targetCell.parentElement;
    //     const targetCellIndex = rowOfTargetCell.children;
    //     console.log(targetCellIndex);

    //     const cellsInRowWithSameClassNumber = [];

    //     for (let i = targetCellIndex - 1; i > 0; i --) {
    //         const scheduleCell = rowOfTargetCell.children[i];
    //         const scheduleCellClassNumber = this.getValueFromClassName(scheduleCell, this.numberClassPrefix);

    //         if (scheduleCellClassNumber === targetCellClassNumber) {
    //             cellsInRowWithSameClassNumber.push(scheduleCell);
    //         } else {
    //             break;
    //         }
    //     }

    //     for (let i = targetCellIndex + 1; i < rowOfTargetCell.children.length - 1; i --) {
    //         const scheduleCell = rowOfTargetCell.children[i];
    //         const scheduleCellClassNumber = this.getValueFromClassName(scheduleCell, this.numberClassPrefix);

    //         if (scheduleCellClassNumber === targetCellClassNumber) {
    //             cellsInRowWithSameClassNumber.push(scheduleCell);
    //         } else {
    //             break;
    //         }
    //     }

    //     console.log(cellsInRowWithSameClassNumber);
    // };

    // disconnectedCallback() is called after the component is destroyed
    disconnectedCallback() {
    };
}
// Register web component only if it is not registered yet

if(!customElements.get('gh-study-schedule')){
    customElements.define('gh-study-schedule', GhStudySchedule);
}