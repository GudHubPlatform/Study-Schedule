import './studyschedule.webcomponent.js';


export const daysOfWeek = [
    {
        optionsName: 'Mon',
        scheduleName: 'понеділок',
        value: 0,
    },
    {
        optionsName: 'Tue',
        scheduleName: 'вівторок',
        value: 1,
    },
    {
        optionsName: 'Wed',
        scheduleName: 'середа',
        value: 2,
    },
    {
        optionsName: 'Thu',
        scheduleName: 'четвер',
        value: 3,
    },
    {
        optionsName: 'Fri',
        scheduleName: "п'ятниця",
        value: 4,
    },
    {
        optionsName: 'Sat',
        scheduleName: 'субота',
        value: 5,
    },
    {
        optionsName: 'Sun',
        scheduleName: 'неділя',
        value: 6,
    }
];

export default class GhStudyScheduleData {
    /*------------------------------- FIELD TEMPLATE --------------------------------------*/

    getTemplate() {
        return {
            constructor: 'field',
            name: 'Study Schedule',
            icon: 'text_icon',
            type: 'study_schedule',
            model: {
                field_id: 0,
                field_name: 'Study Schedule',
                field_value: '',
                data_type: 'study_schedule',
                data_model: {
                    academic_weeks_in_semester_field_id: null,
                    semester_start_date_field_id: null,
                    show_days_count: null,
                    classes_app_id: null,
                    classes_app_title_field_id: null,
                    classes_app_course_field_id: null,
                    classes_filters_list: [],
                    classes_sorting_type: 0,
                    subjects_app_id: null,
                    subjects_app_title_field_id: null,
                    subjects_app_teacher_field_id: null,
                    subjects_app_course_field_id: null,
                    subjects_app_academic_hours_field_id: null,
                    subjects_filters_list: [],
                    rooms_app_id: null,
                    rooms_app_number_field_id: null,
                    lessonsTime: null,
                    lessons_app_id: null,
                    lessons_app_subject_field_id: null,
                    lessons_app_teacher_field_id: null,
                    lessons_app_class_field_id: null,
                    lessons_app_date_field_id: null,
                    lessons_app_room_field_id: null,
                    lessons_app_schedule_id_field_id: null,
                    interpretation: [
                        {
                            src: 'form',
                            id: 'default',
                            settings: {
                                editable: 1,
                                show_field_name: 1,
                                show_field: 1,
                            },
                            style: { position: 'beetwen' },
                        },
                    ],
                },
            },
        };
    }

    /*------------------------------- INTERPRETATION --------------------------------------*/

    getInterpretation(gudhub, value, appId, itemId, field_model) {
        return [
            {
                id: 'default',
                name: 'Default',
                content: () =>
                    '<gh-study-schedule app-id="{{appId}}" item-id="{{itemId}}" field-id="{{fieldId}}"></gh-study-schedule>',
            },
            {
                id: 'value',
                name: 'Value',
                content: () => value,
            },
        ];
    }

    /*--------------------------  SETTINGS --------------------------------*/

    getSettings(scope) {
        return [
            {
                title: 'Options',
                type: 'general_setting',
                icon: 'menu',
                columns_list: [
                    [
                        {
                            title: 'General Settings',
                            type: 'header',
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.academic_weeks_in_semester_field_id',
                            data_model: function (fieldModel) {
                                return {
                                    field_name: 'Academic weeks in semester field',
                                    name_space: 'academic_weeks_in_semester_field',
                                    data_type: 'field',
                                    data_model: {
                                        app_id: fieldModel.app_id,
                                    },
                                };
                            },
                            onInit: function (settingScope, fieldModel) {
                                settingScope.$watch(
                                    function () {
                                        return fieldModel.app_id;
                                    },
                                    function (newValue) {
                                        settingScope.field_model.app_id = newValue;
                                    }
                                );
                            },
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.semester_start_date_field_id',
                            data_model: function (fieldModel) {
                                return {
                                    field_name: 'Semester start date field',
                                    name_space: 'semester_start_date_field',
                                    data_type: 'field',
                                    data_model: {
                                        app_id: fieldModel.app_id,
                                    },
                                };
                            },
                            onInit: function (settingScope, fieldModel) {
                                settingScope.$watch(
                                    function () {
                                        return fieldModel.app_id;
                                    },
                                    function (newValue) {
                                        settingScope.field_model.app_id = newValue;
                                    }
                                );
                            },
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.show_days_count',
                            data_model() {
                                return {
                                    field_name: 'Show Days',
                                    name_space: 'show_days_count',
                                    data_type: 'text_opt',
                                    data_model: {
                                        multiple_value: true,
                                        options: daysOfWeek.map(day => ({
                                            name: day.optionsName,
                                            value: day.value
                                        })),
                                    },
                                };
                            },
                        },
                    ],
                    [
                        {
                            title: 'Classes Settings',
                            type: 'header',
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.classes_app_id',
                            data_model: function () {
                                return {
                                    data_type: 'app',
                                    field_name: 'Classes App',
                                    name_space: 'classes_app',
                                    data_model: {
                                        current_app: false,
                                        interpretation: [
                                            {
                                                src: 'form',
                                                id: 'with_text',
                                                settings: {
                                                    editable: 1,
                                                    show_field_name: 1,
                                                    show_field: 1,
                                                },
                                            },
                                        ],
                                    },
                                };
                            },
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.classes_app_title_field_id',
                            data_model: function (fieldModel) {
                                return {
                                    data_type: 'field',
                                    field_name: 'Class Title',
                                    name_space: 'class_title',
                                    data_model: {
                                        app_id: fieldModel.data_model.classes_app_id,
                                    },
                                };
                            },
                            onInit: function (settingScope, fieldModel) {
                                settingScope.$watch(
                                    function () {
                                        return fieldModel.data_model.classes_app_id;
                                    },
                                    function (newValue) {
                                        settingScope.field_model.data_model.app_id = newValue;
                                    }
                                );
                            },
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.classes_app_course_field_id',
                            data_model: function (fieldModel) {
                                return {
                                    data_type: 'field',
                                    field_name: 'Class Course',
                                    name_space: 'class_course',
                                    data_model: {
                                        app_id: fieldModel.data_model.classes_app_id,
                                    },
                                };
                            },
                            onInit: function (settingScope, fieldModel) {
                                settingScope.$watch(
                                    function () {
                                        return fieldModel.data_model.classes_app_id;
                                    },
                                    function (newValue) {
                                        settingScope.field_model.data_model.app_id = newValue;
                                    }
                                );
                            },
                        },
                        {
                            title: 'Classes Filter',
                            type: 'header',
                        },
                        {
                            type: 'html',
                            onInit: function (settingScope) {
                                settingScope.$watch(
                                    function () {
                                        return settingScope.fieldModel.data_model.classes_app_id;
                                    },
                                    function (newValue) {
                                        settingScope.field_model.data_model.app_id = newValue;
                                    }
                                );
                            },
                            data_model: function (fieldModel) {
                                return {
                                    recipient: {
                                        app_id: fieldModel.data_model.classes_app_id,
                                    },
                                };
                            },
                            control:
                                '<gh-filter gh-filter-data-model="field_model" filter-list="fieldModel.data_model.classes_filters_list" gh-mode="variable"></gh-filter>',
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.classes_sorting_type',
                            data_model() {
                                return {
                                    field_name: 'Sorting Type',
                                    name_space: 'sorting_type',
                                    data_type: 'text_opt',
                                    data_model: {
                                        options: [
                                            {
                                                name: 'Ascending',
                                                value: 'asc',
                                            },
                                            {
                                                name: 'Descending',
                                                value: 'desc',
                                            },
                                        ],
                                    },
                                };
                            },
                        },
                    ],
                    [
                        {
                            title: 'Subjects Settings',
                            type: 'header',
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.subjects_app_id',
                            data_model: function () {
                                return {
                                    data_type: 'app',
                                    field_name: 'Subjects App',
                                    name_space: 'subjects_app',
                                    data_model: {
                                        current_app: false,
                                        interpretation: [
                                            {
                                                src: 'form',
                                                id: 'with_text',
                                                settings: {
                                                    editable: 1,
                                                    show_field_name: 1,
                                                    show_field: 1,
                                                },
                                            },
                                        ],
                                    },
                                };
                            },
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.subjects_app_title_field_id',
                            data_model: function (fieldModel) {
                                return {
                                    data_type: 'field',
                                    field_name: 'Subject Title',
                                    name_space: 'subject_title',
                                    data_model: {
                                        app_id: fieldModel.data_model.subjects_app_id,
                                    },
                                };
                            },
                            onInit: function (settingScope, fieldModel) {
                                settingScope.$watch(
                                    function () {
                                        return fieldModel.data_model.subjects_app_id;
                                    },
                                    function (newValue) {
                                        settingScope.field_model.data_model.app_id = newValue;
                                    }
                                );
                            },
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.subjects_app_teacher_field_id',
                            data_model: function (fieldModel) {
                                return {
                                    data_type: 'field',
                                    field_name: 'Subject teacher',
                                    name_space: 'subject_teacher',
                                    data_model: {
                                        app_id: fieldModel.data_model.subjects_app_id,
                                    },
                                };
                            },
                            onInit: function (settingScope, fieldModel) {
                                settingScope.$watch(
                                    function () {
                                        return fieldModel.data_model.subjects_app_id;
                                    },
                                    function (newValue) {
                                        settingScope.field_model.data_model.app_id = newValue;
                                    }
                                );
                            },
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.subjects_app_course_field_id',
                            data_model: function (fieldModel) {
                                return {
                                    data_type: 'field',
                                    field_name: 'Subject course',
                                    name_space: 'subject_course',
                                    data_model: {
                                        app_id: fieldModel.data_model.subjects_app_id,
                                    },
                                };
                            },
                            onInit: function (settingScope, fieldModel) {
                                settingScope.$watch(
                                    function () {
                                        return fieldModel.data_model.subjects_app_id;
                                    },
                                    function (newValue) {
                                        settingScope.field_model.data_model.app_id = newValue;
                                    }
                                );
                            },
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.subjects_app_academic_hours_field_id',
                            data_model: function (fieldModel) {
                                return {
                                    data_type: 'field',
                                    field_name: 'Subject academic hours',
                                    name_space: 'subject_academic_hours',
                                    data_model: {
                                        app_id: fieldModel.data_model.subjects_app_id,
                                    },
                                };
                            },
                            onInit: function (settingScope, fieldModel) {
                                settingScope.$watch(
                                    function () {
                                        return fieldModel.data_model.subjects_app_id;
                                    },
                                    function (newValue) {
                                        settingScope.field_model.data_model.app_id = newValue;
                                    }
                                );
                            },
                        },
                        {
                            title: 'Subjects Filter',
                            type: 'header',
                        },
                        {
                            type: 'html',
                            onInit: function (settingScope) {
                                settingScope.$watch(
                                    function () {
                                        return settingScope.fieldModel.data_model.subjects_app_id;
                                    },
                                    function (newValue) {
                                        settingScope.field_model.data_model.app_id = newValue;
                                    }
                                );
                            },
                            data_model: function (fieldModel) {
                                return {
                                    recipient: {
                                        app_id: fieldModel.data_model.subjects_app_id,
                                    },
                                };
                            },
                            control:
                                '<gh-filter gh-filter-data-model="field_model" filter-list="fieldModel.data_model.subjects_filters_list" gh-mode="variable"></gh-filter>',
                        },
                    ],
                    [
                        {
                            title: 'Rooms Settings',
                            type: 'header',
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.rooms_app_id',
                            data_model: function () {
                                return {
                                    data_type: 'app',
                                    field_name: 'Rooms App',
                                    name_space: 'rooms_app',
                                    data_model: {
                                        current_app: false,
                                        interpretation: [
                                            {
                                                src: 'form',
                                                id: 'with_text',
                                                settings: {
                                                    editable: 1,
                                                    show_field_name: 1,
                                                    show_field: 1,
                                                },
                                            },
                                        ],
                                    },
                                };
                            },
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.rooms_app_number_field_id',
                            data_model: function (fieldModel) {
                                return {
                                    data_type: 'field',
                                    field_name: 'Room Number',
                                    name_space: 'room_number',
                                    data_model: {
                                        app_id: fieldModel.data_model.rooms_app_id,
                                    },
                                };
                            },
                            onInit: function (settingScope, fieldModel) {
                                settingScope.$watch(
                                    function () {
                                        return fieldModel.data_model.rooms_app_id;
                                    },
                                    function (newValue) {
                                        settingScope.field_model.data_model.app_id = newValue;
                                    }
                                );
                            },
                        },
                        {
                            title: 'Lesson Schedule',
                            type: 'header',
                        },
                        {
                            type: 'html',
                            data_model: function (fieldModel) {
                                return {
                                    patterns: [
                                        {
                                            property: 'time',
                                            type: 'duration',
                                            prop_name: 'Time',
                                            data_model: function (option) {
                                                return {};
                                            },
                                            display: true,
                                        },
                                    ],
                                };
                            },
                            control:
                                '<gh-option-table items="fieldModel.data_model.lessonsTime" pattern="field_model.patterns"></gh-option-table>',
                        },
                    ],
                    [
                        {
                            title: 'Lesson Generation',
                            type: 'header',
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.lessons_app_id',
                            data_model: function () {
                                return {
                                    data_type: 'app',
                                    field_name: 'Lessons App',
                                    name_space: 'lessons_app',
                                    data_model: {
                                        current_app: false,
                                        interpretation: [
                                            {
                                                src: 'form',
                                                id: 'with_text',
                                                settings: {
                                                    editable: 1,
                                                    show_field_name: 1,
                                                    show_field: 1,
                                                },
                                            },
                                        ],
                                    },
                                };
                            },
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.lessons_app_subject_field_id',
                            data_model: function (fieldModel) {
                                return {
                                    data_type: 'field',
                                    field_name: 'Lesson subject',
                                    name_space: 'lesson_subject',
                                    data_model: {
                                        app_id: fieldModel.data_model.lessons_app_id,
                                    },
                                };
                            },
                            onInit: function (settingScope, fieldModel) {
                                settingScope.$watch(
                                    function () {
                                        return fieldModel.data_model.lessons_app_id;
                                    },
                                    function (newValue) {
                                        settingScope.field_model.data_model.app_id = newValue;
                                    }
                                );
                            },
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.lessons_app_teacher_field_id',
                            data_model: function (fieldModel) {
                                return {
                                    data_type: 'field',
                                    field_name: 'Lesson teacher',
                                    name_space: 'lesson_teacher',
                                    data_model: {
                                        app_id: fieldModel.data_model.lessons_app_id,
                                    },
                                };
                            },
                            onInit: function (settingScope, fieldModel) {
                                settingScope.$watch(
                                    function () {
                                        return fieldModel.data_model.lessons_app_id;
                                    },
                                    function (newValue) {
                                        settingScope.field_model.data_model.app_id = newValue;
                                    }
                                );
                            },
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.lessons_app_class_field_id',
                            data_model: function (fieldModel) {
                                return {
                                    data_type: 'field',
                                    field_name: 'Lesson class',
                                    name_space: 'lesson_class',
                                    data_model: {
                                        app_id: fieldModel.data_model.lessons_app_id,
                                    },
                                };
                            },
                            onInit: function (settingScope, fieldModel) {
                                settingScope.$watch(
                                    function () {
                                        return fieldModel.data_model.lessons_app_id;
                                    },
                                    function (newValue) {
                                        settingScope.field_model.data_model.app_id = newValue;
                                    }
                                );
                            },
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.lessons_app_date_field_id',
                            data_model: function (fieldModel) {
                                return {
                                    data_type: 'field',
                                    field_name: 'Lesson date',
                                    name_space: 'lesson_date',
                                    data_model: {
                                        app_id: fieldModel.data_model.lessons_app_id,
                                    },
                                };
                            },
                            onInit: function (settingScope, fieldModel) {
                                settingScope.$watch(
                                    function () {
                                        return fieldModel.data_model.lessons_app_id;
                                    },
                                    function (newValue) {
                                        settingScope.field_model.data_model.app_id = newValue;
                                    }
                                );
                            },
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.lessons_app_schedule_id_field_id',
                            data_model: function (fieldModel) {
                                return {
                                    data_type: 'field',
                                    field_name: 'Lesson schedule id',
                                    name_space: 'lesson_schedule_id',
                                    data_model: {
                                        app_id: fieldModel.data_model.lessons_app_id,
                                    },
                                };
                            },
                            onInit: function (settingScope, fieldModel) {
                                settingScope.$watch(
                                    function () {
                                        return fieldModel.data_model.lessons_app_id;
                                    },
                                    function (newValue) {
                                        settingScope.field_model.data_model.app_id = newValue;
                                    }
                                );
                            },
                        },
                        {
                            type: 'ghElement',
                            property: 'data_model.lessons_app_room_field_id',
                            data_model: function (fieldModel) {
                                return {
                                    data_type: 'field',
                                    field_name: 'Lesson room',
                                    name_space: 'lesson_room_id',
                                    data_model: {
                                        app_id: fieldModel.data_model.lessons_app_id,
                                    },
                                };
                            },
                            onInit: function (settingScope, fieldModel) {
                                settingScope.$watch(
                                    function () {
                                        return fieldModel.data_model.lessons_app_id;
                                    },
                                    function (newValue) {
                                        settingScope.field_model.data_model.app_id = newValue;
                                    }
                                );
                            },
                        },
                    ],
                ],
            },
        ];
    }
}
