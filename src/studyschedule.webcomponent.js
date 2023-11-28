import GhHtmlElement from "@gudhub/gh-html-element";
import html from "./studyschedule.html";
import loader from "./loader.html";
import './style.scss';

import Lesson, { dragDisabledClass } from './components/lesson/lesson.webcomponent.js';
import Classroom from './components/classroom/classroom.webcomponent.js';
import LessonDragList from "./components/lessonDragList/lessonDragList.webcomponent.js";

import renderer from './utils/componentsRenderer.js';
import ScopeSingleton from './utils/ScopeSingleton.js';

import {REDIPS} from './redips-drag-min.js';
import { getClassesScheme, getClassroomsScheme, getLessonsScheme } from "./jsonSchemes.js";
import ScheduleController from "./ScheduleController.js";
import ScheduleModel from "./ScheduleModel.js";

import { createLessonsForClasses } from "./utils/dataFunctions.js";

export const lessonClass = '.lesson';
export const classroomClass = '.classroom';
export const lessonCellClass = '.lesson-cell';
export const classRoomCellClass = '.classroom-cell';
export const lessonAllowedClass = '.lesson-allowed';
export const classroomAllowedClass = '.classroom-allowed';
const cellRowAttribute = 'row';
const cellColAttribute = 'col';

export const columnWidth = 2;

class GhStudySchedule extends GhHtmlElement {

    // Constructor with super() is required for native web component initialization

    constructor() {
        super();
        this.renderer = renderer;

        //table classes
        this.lessonCellClass = lessonCellClass;
        this.classRoomCellClass = classRoomCellClass;
        this.lessonAllowedClass = lessonAllowedClass;
        this.classroomAllowedClass = classroomAllowedClass;

        //table attributes
        this.cellRowAttribute = cellRowAttribute;
        this.cellColAttribute = cellColAttribute;

        //data
        this.columnWidth = columnWidth;
        this.daysOfWeek = ["понеділок","вівторок","середа","четвер","п'ятниця"];
        this.lessonsPerDay;
        this.classes;
        this.rawLessons;
        this.lessons;
        this.classrooms;

        // mvc
        this.model;
        this.controller;
        this.storage;

        //highlight cells
        this.disableHighlight;

        this.onDisconnectCallbacks = [];
    }

    // onInit() is called after parent gh-element scope is ready

    async onInit() {
        super.render(loader);
        await this.loadData.all();
        this.lessonsPerDay = this.scope.field_model.data_model.lessons_per_day;
        this.lessons = createLessonsForClasses(this.rawLessons, this.classes);

        this.model = new ScheduleModel(this.classes, this.daysOfWeek, this.lessonsPerDay);
        this.controller = new ScheduleController(this.scope, this.model, this.lessons, this.classrooms);

        this.initScopeSingleton();
 
        await this.controller.loadLocalStorageCellsToStorage();
        this.storage = this.controller.getStorage();

        super.render(html);

        this.setCorrespondingHTMLElements();

        this.dndInit();

        const destroyLessonsSubscribe = this.subscribeOnItemsUpdate.lessons();
        const destroyClassroomsSubscribe = this.subscribeOnItemsUpdate.classrooms();

        this.onDisconnectCallbacks.push(
            destroyLessonsSubscribe,
            destroyClassroomsSubscribe,
        );
    };

    // disconnectedCallback() is called after the component is destroyed
    disconnectedCallback() {
        this.onDisconnectCallbacks.forEach((callback) => callback());

        ScopeSingleton.reset();
    };

    loadData = {
        lessons: () => {
            const {
                lessons_app_id,
                lessons_app_title_field_id,
                lessons_app_teacher_field_id,
                lessons_app_course_field_id,
                lessons_app_academic_hours_field_id,
                lessons_filters_list = [],
            } = this.scope.field_model.data_model;
            const lessonsScheme = getLessonsScheme({
                lessons_app_id,
                lessons_app_title_field_id,
                lessons_app_teacher_field_id,
                lessons_app_course_field_id,
                lessons_app_academic_hours_field_id,
                lessons_filters_list,
            });
            return gudhub.jsonConstructor(lessonsScheme).then((data) => {this.rawLessons = data.lessons});
        },
        classes: () => {
            const { 
                classes_app_id,
                classes_app_title_field_id,
                classes_app_course_field_id,
                classes_filters_list = [],
                classes_sorting_type = 'asc',
            } = this.scope.field_model.data_model;
            const classesScheme = getClassesScheme({
                classes_app_id,
                classes_app_title_field_id,
                classes_app_course_field_id,
                classes_filters_list,
                classes_sorting_type,
            });
            return gudhub.jsonConstructor(classesScheme).then((data) => {this.classes = data.classes});
        },
        classrooms: () => {
            const { 
                cabinets_app_id,
                cabinets_app_number_field_id,
            } = this.scope.field_model.data_model;
            const classroomsScheme = getClassroomsScheme({
                cabinets_app_id,
                cabinets_app_number_field_id,
            });
            return gudhub.jsonConstructor(classroomsScheme).then((data) => {this.classrooms = data.classrooms});
    
        },
        all: () => {
            const classesPromise = this.loadData.lessons();
            const lessonsPromise = this.loadData.classes();
            const classroomsPromise = this.loadData.classrooms();
            return Promise.all([
                classesPromise,
                lessonsPromise,
                classroomsPromise,
            ]);
        },
    }

    subscribeOnItemsUpdate = {
        lessons: () => {
            const { lessons_app_id } = this.scope.field_model.data_model;
    
            const onLessonsItemsUpdate = async () => {
                await this.loadData.lessons();
                this.lessons = createLessonsForClasses(this.rawLessons, this.classes);
            };
    
            gudhub.on('gh_items_update', {lessons_app_id}, onLessonsItemsUpdate);
    
            return () => gudhub.destroy('gh_items_update', {lessons_app_id}, onLessonsItemsUpdate);
        },
        classrooms: () => {
            const { cabinets_app_id } = this.scope.field_model.data_model;
    
            const onClassroomsItemsUpdate = async () => {
                await this.loadData.classrooms();
            };
    
            gudhub.on('gh_items_update', {cabinets_app_id}, onClassroomsItemsUpdate);
    
            return () => gudhub.destroy('gh_items_update', {cabinets_app_id}, onClassroomsItemsUpdate);
        },
    };

    dndInit() {
        const redips = {};

        const controller = this.controller;

        redips.init = function () {
            const rd = REDIPS.drag;

            rd.init('redips-drag');
            rd.hover.colorTd = '#9BB3DA';
            rd.scroll.bound = 30;

            rd.mark.exceptionClass[classroomClass.replace('.','')] = classroomAllowedClass.replace('.', '');
            rd.mark.exceptionClass[lessonClass.replace('.','')] = lessonAllowedClass.replace('.', '');

            rd.event.clicked = async (clickedCell) => {
                const dndDiv = clickedCell.getElementsByClassName('redips-drag')[0];
                const scheduleElement = dndDiv.children[0];
                if (scheduleElement && scheduleElement.isCloseIconClicked) {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    if (scheduleElement.isRemoved) return;
                }
                const clickedCellCoords = {
                    row: clickedCell.getAttribute(cellRowAttribute),
                    col: clickedCell.getAttribute(cellColAttribute),
                };
                if (scheduleElement instanceof Lesson) {
                    this.disableHighlight = controller.highlightLessonsCells(scheduleElement.uniqueId, clickedCellCoords);
                } else if (scheduleElement instanceof Classroom) {
                    const  {
                        app_id,
                        item_id
                    } = scheduleElement;
                    const classroomId = [app_id, item_id].join('.');
                    this.disableHighlight = controller.highlightClassroomsCells(classroomId, clickedCellCoords);
                }
            };

            rd.event.droppedBefore = (targetCell) => {
            };

            rd.event.dropped = () => {
            }

            rd.event.deleted = (clonedAndDirectlyMovedToTrasg) => {
            };

            rd.event.finish = () => {
                if (this.disableHighlight) {
                    this.disableHighlight();
                    this.disableHighlight = null;
                }
            };

            rd.event.clonedDropped = () => {
            };

            return rd;
        }

        const checkForDisabledDivs = () => {
            const dragListContainer = document.getElementById('lesson-table-container');
            const lessons = dragListContainer.getElementsByTagName('schedule-lesson');
            
            for (const lesson of  lessons) {
                const dragDiv = lesson.parentElement;
                if (dragDiv.classList.contains(dragDisabledClass.replace('.', ''))) {
                    this.rd.enableDrag(false, dragDiv);
                }
            }
        }

        setTimeout(() => {
            this.rd = redips.init();
            ScopeSingleton.getInstance().setRD(this.rd);
            checkForDisabledDivs();
        }, 0);
    }

    initScopeSingleton = () => {
        const data = {
            lessons: this.lessons,
            classes: this.classes,
            classrooms: this.classrooms,
            onDisconnectCallbacks: this.onDisconnectCallbacks,
        };
        ScopeSingleton.getInstance(this.scope, this.controller, data);
    };


    setCorrespondingHTMLElements() {
        const htmlElements = document.querySelectorAll(lessonCellClass);
        this.controller.setHTMLElements(htmlElements);
    }

    handleEnableHighlight() {
        this.disableHighlight = this.controller.highlightClassroomsCells()
    }
}

// Register web component only if it is not registered yet

if(!customElements.get('gh-study-schedule')){
    customElements.define('gh-study-schedule', GhStudySchedule);
}
if(!customElements.get('schedule-lesson')){
    customElements.define('schedule-lesson', Lesson);
}
if(!customElements.get('schedule-classroom')){
    customElements.define('schedule-classroom', Classroom);
}
if(!customElements.get('schedule-lesson-drag-list')){
    customElements.define('schedule-lesson-drag-list', LessonDragList);
}