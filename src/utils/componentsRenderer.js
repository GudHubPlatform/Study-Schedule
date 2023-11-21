import ScopeSingleton from "../utils/ScopeSingleton.js";
import { lessonClass, classroomClass } from "../studyschedule.webcomponent.js";

export const isCloneAttribute = 'is-clone';
export const itemRefIdAttribute = 'item-id';
export const classItemRefIdAttribute = 'class-ref-id';
export const classFieldIdAttributes = {
    title: 'class-title-field-id',
};

export const lessonFieldIdAttributes = {
    teacher:'lesson-teacher-field-id',
    title:'lesson-title-field-id',
    academicHours:'lesson-academic-hours-field-id',
    course:'lesson-course-field-id',
};

const getScope = () => ScopeSingleton.getInstance().getScope();

const lesson = (lessonItemRefId, classRefId, isClone = 0) => {
    const scope = getScope();
    const {
        lessons_app_title_field_id,
        lessons_app_course_field_id,
        lessons_app_teacher_field_id,
        lessons_app_academic_hours_field_id,
        classes_app_title_field_id
    } = scope.field_model.data_model;

    const {
        title,
        teacher,
        course,
        academicHours
    } = lessonFieldIdAttributes;

    return `<div class="${lessonClass.replace('.', '')} redips-drag ${isClone ? 'redips-clone' : ''}">
                <schedule-lesson
                    ${itemRefIdAttribute}=${lessonItemRefId}
                    ${title}=${lessons_app_title_field_id}
                    ${teacher}=${lessons_app_teacher_field_id}
                    ${course}=${lessons_app_course_field_id}
                    ${academicHours}=${lessons_app_academic_hours_field_id}

                    ${classItemRefIdAttribute}=${classRefId}
                    ${classFieldIdAttributes.title}=${classes_app_title_field_id}

                    ${isCloneAttribute}=${isClone}
                >
                </schedule-lesson>
            </div>`;
}

export const classRoomFieldIdAttributes = {
    title: 'classroom-title-field-id'
};
const classroom = (classRefId, isClone = 0) => {
    const scope = getScope();
    const {
        cabinets_app_number_field_id,
    } = scope.field_model.data_model;

    const {
        title,
    } = classRoomFieldIdAttributes;

    return `<div class="${classroomClass.replace('.', '')} redips-drag ${isClone ? 'redips-clone' : ''}">
                <schedule-classroom
                    ${itemRefIdAttribute}=${classRefId}
                    ${title}=${cabinets_app_number_field_id}

                    ${isCloneAttribute}=${isClone}
                >
                </schedule-classroom>
            </div>`;
}

const renderer = {
    lesson,
    classroom,
};

export default renderer;