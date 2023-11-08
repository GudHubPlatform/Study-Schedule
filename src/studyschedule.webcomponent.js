import GhHtmlElement from "@gudhub/gh-html-element";
import html from "./studyschedule.html";
import './style.scss';

import {REDIPS} from './redips-drag-min.js';
import { classes, lessons } from "./offlineData.js";
import ScheduleController from "./ScheduleController.js";
import ScheduleModel from "./ScheduleModel.js";

import { 
    cellColAttribute, 
    cellRowAttribute, 
    lessonCellClass, 
    lessonIdAttribute,
    lesson as renderLesson
} from './utils/htmlComponents.js';

class GhStudySchedule extends GhHtmlElement {

    // Constructor with super() is required for native web component initialization

    constructor() {
        super();
        this.columnWidth = 2;
        this.daysOfWeek = ["понеділок","вівторок","середа","четвер","п'ятниця"];
        this.lessonsPerDay = 7;
        this.classes = classes;
        this.lessons = lessons;
        
        this.cellColAttribute = cellColAttribute;
        this.cellRowAttribute = cellRowAttribute;
        this.lessonCellClass = lessonCellClass;
        this.lessonIdAttribute = lessonIdAttribute;
        this.renderLesson = renderLesson;

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
        const handleBeforeDrop = this.handleBeforeDropElement.bind(this);
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
                return handleBeforeDrop(targetCell);
            };

            rd.event.deleted = (isExistingCell) => {
                return handleDeleted(isExistingCell);
            };

            rd.event.finish = () => {
                console.log(1);
                handleFinish();
            };
        }

        setTimeout(() => {
            redips.init();
        }, 0);
    }

    handleDragElement(clickedCell) {
        this.clickedCell = clickedCell;
    
        const lessonId = this.clickedCell.children[0].getAttribute(lessonIdAttribute);
        
        const row = clickedCell.getAttribute(cellRowAttribute);
        const col = clickedCell.getAttribute(cellColAttribute);

        const clickedCellCoords = {row, col};

        this.disableHighlight = this.controller.highlightCells(lessonId, clickedCellCoords);
    }

    handleBeforeDropElement(targetCell) {
        const row = targetCell.getAttribute(cellRowAttribute);
        const col = targetCell.getAttribute(cellColAttribute);

        if (targetCell === this.clickedCell) return false;

        const lessonId = this.clickedCell.children[0].getAttribute(lessonIdAttribute);

        const res = this.controller.setLesson(row, col, lessonId);

        if (Boolean(res) && this.clickedCell.classList.contains('lesson-cell')) {
            const clickedCellRow = this.clickedCell.getAttribute(cellRowAttribute);
            const clickedCellCol = this.clickedCell.getAttribute(cellColAttribute);

            const removedLesson = this.controller.removeLesson(clickedCellRow, clickedCellCol);
        }

        return Boolean(res);
    }

    handleDeleted(isExistingCell) {
        const clickedCellRow = this.clickedCell.getAttribute(cellRowAttribute);
        const clickedCellCol = this.clickedCell.getAttribute(cellColAttribute);

        const removedLesson = this.controller.removeLesson(clickedCellRow, clickedCellCol);
    }

    handleFinishEvent() {
        this.disableHighlight();
    }

    setCorrespondingHTMLElements() {
        const htmlElements = document.querySelectorAll(lessonCellClass);

        this.controller.setHTMLElements(htmlElements);
    }

    // disconnectedCallback() is called after the component is destroyed
    disconnectedCallback() {
    };
}
// Register web component only if it is not registered yet

if(!customElements.get('gh-study-schedule')){
    customElements.define('gh-study-schedule', GhStudySchedule);
}