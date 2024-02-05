export const getClassesScheme = settings => {
    const {
        classes_app_id,
        classes_app_title_field_id,
        classes_app_course_field_id,
        classes_filters_list,
        classes_sorting_type,
    } = settings;

    if (!classes_app_id || !classes_app_title_field_id || !classes_app_course_field_id) return;

    return {
        type: 'array',
        id: 1,
        childs: [
            {
                type: 'property',
                id: 3,
                property_name: 'id',
                property_type: 'variable',
                variable_type: 'current_item',
            },
            {
                type: 'property',
                id: 4,
                property_name: 'title',
                property_type: 'field_value',
                field_id: classes_app_title_field_id,
                interpretation: 1,
            },
            {
                type: 'property',
                id: 7,
                property_name: 'course',
                property_type: 'field_value',
                field_id: classes_app_course_field_id,
            },
        ],
        property_name: 'classes',
        app_id: classes_app_id,
        filter: classes_filters_list,
        isSortable: 1,
        sortType: classes_sorting_type,
        field_id_to_sort: classes_app_course_field_id,
    };
};

export const getSubjectsScheme = settings => {
    const { subjects_app_id, subjects_app_course_field_id, subjects_filters_list, subjects_app_teacher_field_id } =
        settings;

    if (!subjects_app_id || !subjects_app_course_field_id || !subjects_app_teacher_field_id) return;

    return {
        type: 'array',
        id: 1,
        childs: [
            {
                type: 'property',
                id: 3,
                property_name: 'id',
                property_type: 'variable',
                variable_type: 'current_item',
            },
            {
                type: 'property',
                id: 6,
                property_name: 'course',
                property_type: 'field_value',
                field_id: subjects_app_course_field_id,
            },
            {
                type: 'property',
                id: 7,
                property_name: 'teacherRefId',
                property_type: 'field_value',
                field_id: subjects_app_teacher_field_id,
            },
        ],
        property_name: 'lessons',
        app_id: subjects_app_id,
        filter: subjects_filters_list,
        use_variables_for_limit_and_offset: 0,
    };
};

export const getClassroomsScheme = settings => {
    debugger
    const { rooms_app_id } = settings;

    if (!rooms_app_id) return;

    return {
        type: 'array',
        id: 1,
        childs: [
            {
                type: 'property',
                id: 3,
                property_name: 'id',
                property_type: 'variable',
                variable_type: 'current_item',
            },
        ],
        property_name: 'rooms',
        app_id: rooms_app_id,
        filter: [],
        isSortable: 1,
        field_id_to_sort: '807581',
        sortType: 'asc',
    };
};
