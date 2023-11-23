import GhHtmlElement from "@gudhub/gh-html-element";
import html from "./studyschedule.html";
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
    }

    // onInit() is called after parent gh-element scope is ready

    async onInit() {
        await this.loadData();
        this.lessonsPerDay = this.scope.field_model.data_model.lessons_per_day;
        this.lessons = createLessonsForClasses(this.rawLessons, this.classes);
        this.model = new ScheduleModel(this.classes, this.daysOfWeek, this.lessonsPerDay);
        this.controller = new ScheduleController(this.model, this.lessons, this.classrooms);
        this.controller.loadLocalStorageCellsToStorage();
        this.storage = this.controller.getStorage();

        this.initScopeSingleton();

        super.render(html);

        this.dndInit();
    };

    async loadData() {
        const { 
            classes_app_id,
            classes_app_title_field_id,
            classes_app_course_field_id,
            classes_filters_list = [],
            classes_sorting_type = 'asc',
            lessons_app_id,
            lessons_app_title_field_id,
            lessons_app_teacher_field_id,
            lessons_app_course_field_id,
            lessons_app_academic_hours_field_id,
            lessons_filters_list = [],
            cabinets_app_id,
            cabinets_app_number_field_id,
        } = this.scope.field_model.data_model;

        const classesScheme = getClassesScheme({
            classes_app_id,
            classes_app_title_field_id,
            classes_app_course_field_id,
            classes_filters_list,
            classes_sorting_type,
        });

        const lessonsScheme = getLessonsScheme({
            lessons_app_id,
            lessons_app_title_field_id,
            lessons_app_teacher_field_id,
            lessons_app_course_field_id,
            lessons_app_academic_hours_field_id,
            lessons_filters_list,
        });

        const classroomsScheme = getClassroomsScheme({
            cabinets_app_id,
            cabinets_app_number_field_id,
        });

        const classesPromise = gudhub.jsonConstructor(classesScheme).then((data) => {this.classes = data.classes});
        const lessonsPromise = gudhub.jsonConstructor(lessonsScheme).then((data) => {this.rawLessons = data.lessons});
        const classroomsPromise = gudhub.jsonConstructor(classroomsScheme).then((data) => {this.classrooms = data.classrooms});

        await Promise.all([
            classesPromise,
            lessonsPromise,
            classroomsPromise,
        ]);
    }

    dndInit() {
        const redips = {};

        redips.init = function () {
            const rd = REDIPS.drag;

            rd.init('redips-drag');
            rd.hover.colorTd = '#9BB3DA';
            rd.scroll.bound = 30;

            rd.mark.exceptionClass[classroomClass.replace('.','')] = 'classroom-allowed';
            rd.mark.exceptionClass[lessonClass.replace('.','')] = 'lesson-allowed';

            rd.event.clicked = (clickedCell) => {
                const lesson = clickedCell.getElementsByTagName('schedule-lesson')[0];
                if (lesson.isCloseIconClicked) {
                    console.log('rd click prevented');
                } else {

                }
            };

            rd.event.droppedBefore = (targetCell) => {
            };

            rd.event.deleted = (clonedAndDirectlyMovedToTrasg) => {
            };

            rd.event.finish = () => {
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
        };
        ScopeSingleton.getInstance(this.scope, this.controller, data);
    };

    // disconnectedCallback() is called after the component is destroyed
    disconnectedCallback() {
        
    };
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