export const getClassesScheme = (settings) => {
  const {  
    classes_app_id,
    classes_app_title_field_id,
    classes_app_course_field_id,
    classes_filters_list,
    classes_sorting_type,
  } = settings;

  if (!classes_app_id || !classes_app_title_field_id || !classes_app_course_field_id) return;

  return {
    "type": "array",
    "id": 1,
    "childs": [
      {
        "type": "property",
        "id": 3,
        "property_name": "id",
        "property_type": "variable",
        "variable_type": "current_item"
      },
      {
        "type": "property",
        "id": 4,
        "property_name": "title",
        "property_type": "field_value",
        "field_id": classes_app_title_field_id,
        "interpretation": 1
      },
      {
        "type": "property",
        "id": 7,
        "property_name": "course",
        "property_type": "field_value",
        "field_id": classes_app_course_field_id
      }
    ],
    "property_name": "classes",
    "app_id": classes_app_id,
    "filter": classes_filters_list,
    "isSortable": 1,
    "sortType": classes_sorting_type,
    "field_id_to_sort": classes_app_course_field_id
  }
};

export const getLessonsScheme = (settings) => {

  const {
    lessons_app_id,
    lessons_app_course_field_id,
    lessons_filters_list,
  } = settings;

  if (!lessons_app_id || !lessons_app_course_field_id) return;

  return {
    "type": "array",
    "id": 1,
    "childs": [
      {
        "type": "property",
        "id": 3,
        "property_name": "id",
        "property_type": "variable",
        "variable_type": "current_item"
      },
      {
        "type": "property",
        "id": 6,
        "property_name": "course",
        "property_type": "field_value",
        "field_id": lessons_app_course_field_id
      },
    ],
    "property_name": "lessons",
    "app_id": lessons_app_id,
    "filter": lessons_filters_list,
    "use_variables_for_limit_and_offset": 0
  }
};

  export const getClassroomsScheme = (settings) => {
    const {
      cabinets_app_id,
    } = settings;

    if (!cabinets_app_id) return;

    return {
      "type": "array",
      "id": 1,
      "childs": [
        {
          "type": "property",
          "id": 3,
          "property_name": "id",
          "property_type": "variable",
          "variable_type": "current_item"
        },
      ],
      "property_name": "classrooms",
      "app_id": "33956",
      "filter": [],
      "isSortable": 1,
      "field_id_to_sort": "807581",
      "sortType": "asc"
    }
  };