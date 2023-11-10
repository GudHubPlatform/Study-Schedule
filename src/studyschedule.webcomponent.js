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
    lesson as renderLesson,
    lessonContentContainerClass,
    lessonContentContainerRemovableClass,
    removeDotFromClass,
    closeIconClass
} from './lessonComponent.js';

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
        this.isClickedCloseIcon;
        this.setIsClickedCloseIcon = (bool) => {this.isClickedCloseIcon = bool};
        this.handleClickCloseIcon = this.handleClickCloseIcon;

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
        const redips = {};

        const isClickedCloseIcon = () => this.isClickedCloseIcon;
        const setIsClickedCloseIcon = (bool) => this.setIsClickedCloseIcon(bool);
        const setClickedCell = (cell) => {this.clickedCell = cell};

        const handleDrag = this.handleDragElement.bind(this);
        const handleBeforeDrop = this.handleBeforeDropElement.bind(this);
        const handleDeleted = this.handleDeleted.bind(this);
        const handleFinish = this.handleFinishEvent.bind(this);
        const handleCloneDropped = this.handleCloneDropped.bind(this);

        redips.init = function () {
            const rd = REDIPS.drag;

            rd.init('redips-drag');
            rd.hover.colorTd = '#9BB3DA';
            rd.scroll.bound = 30;
            
            rd.event.clicked = (clickedCell) => {
                setClickedCell(clickedCell);

                if (isClickedCloseIcon()) {
                    handleDeleted();
                    rd.emptyCell(clickedCell);
                    setIsClickedCloseIcon(false);
                } else {
                    handleDrag(clickedCell);
                }
            };

            rd.event.droppedBefore = (targetCell) => {
                return handleBeforeDrop(targetCell);
            };

            rd.event.deleted = (isExistingCell) => {
                return handleDeleted(isExistingCell);
            };

            rd.event.finish = () => {
                handleFinish();
            };

            rd.event.clonedDropped = () => {
                const clonedElement = REDIPS.drag.obj;
                handleCloneDropped(clonedElement);
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
        if (this.isClickedCloseIcon) return;

        const row = targetCell.getAttribute(cellRowAttribute);
        const col = targetCell.getAttribute(cellColAttribute);

        if (targetCell === this.clickedCell) return false;

        const lessonId = this.clickedCell.children[0].getAttribute(lessonIdAttribute);

        const resultStorageObject = this.controller.setLesson(row, col, lessonId);

        if (Boolean(resultStorageObject) && this.clickedCell.classList.contains('lesson-cell')) {
            const clickedCellRow = this.clickedCell.getAttribute(cellRowAttribute);
            const clickedCellCol = this.clickedCell.getAttribute(cellColAttribute);

            const removedLesson = this.controller.removeLesson(clickedCellRow, clickedCellCol);
        }

        return Boolean(resultStorageObject);
    }

    handleDeleted(isExistingCell) {
        const clickedCellRow = this.clickedCell.getAttribute(cellRowAttribute);
        const clickedCellCol = this.clickedCell.getAttribute(cellColAttribute);

        const removedLesson = this.controller.removeLesson(clickedCellRow, clickedCellCol);
    }

    handleFinishEvent() {
        if (this.disableHighlight) {
            this.disableHighlight();
        }
    }

    handleCloneDropped(clonedElement) {
        const lessonContentContainer = clonedElement.querySelector(lessonContentContainerClass);
        lessonContentContainer.classList.add(removeDotFromClass(lessonContentContainerRemovableClass));

        const closeIcon = clonedElement.querySelector(closeIconClass);
        closeIcon.addEventListener('mousedown', () => this.handleClickCloseIcon());
    }

    handleClickCloseIcon(event) {
        this.setIsClickedCloseIcon(true);
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