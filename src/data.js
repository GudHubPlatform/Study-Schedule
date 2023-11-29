import './studyschedule.webcomponent.js';

export default class GhStudyScheduleData {

    /*------------------------------- FIELD TEMPLATE --------------------------------------*/

    getTemplate() {
        return {
            constructor: 'field',
            name: 'Study Schedule',
            icon: 'text_icon',
            model: {
                field_id: 0,
                field_name: 'Study Schedule',
                field_value: '',
                data_type: 'study_schedule',
                data_model: {
                    academic_weeks_in_semester_field_id: null,
                    classes_app_id: null,
                    classes_app_title_field_id: null,
                    classes_app_course_field_id: null,
                    classes_filters_list: [],
                    classes_sorting_type: 0,
                    lessons_app_id: null,
                    lessons_app_title_field_id: null,
                    lessons_app_teacher_field_id: null,
                    lessons_app_course_field_id: null,
                    lessons_app_academic_hours_field_id: null,
                    lessons_per_day: null,
                    lessons_filters_list: [],
                    cabinets_app_id: null,
                    cabinets_app_number_field_id: null,
                    interpretation: [{
                        src: 'form',
                        id: 'default',
                        settings: {
                            editable: 1,
                            show_field_name: 1,
                            show_field: 1
                        },
                        style: { position: "beetwen" }
                    }]
                }
            }
        };
    }

    /*------------------------------- INTERPRETATION --------------------------------------*/

    getInterpretation(gudhub, value, appId, itemId, field_model) {

        return [{
            id: 'default',
            name: 'Default',
            content: () =>
                '<gh-study-schedule app-id="{{appId}}" item-id="{{itemId}}" field-id="{{fieldId}}"></gh-study-schedule>'
        }, {
            id: 'value',
            name: 'Value',
            content: () => value
        }];
    }

    /*--------------------------  SETTINGS --------------------------------*/

    getSettings(scope) {
        return [{
            title: 'Options',
            type: 'general_setting',
            icon: 'menu',
            columns_list: [
                [
                    {
                        title: 'General Settings',
                        type: 'header'
                    },
                    {
                        type: "ghElement",
                        property: "data_model.academic_weeks_in_semester_field_id",
                        data_model: function (fieldModel) {
                            return {
                                field_name: "Academic weeks in semester field",
                                name_space: "academic_weeks_in_semester_field",
                                data_type: "field",
                                data_model: {
                                    app_id: fieldModel.app_id
                                }
                            }
                        },
                        onInit: function(settingScope, fieldModel) {
                            settingScope.$watch(function() {
                                return fieldModel.app_id;
                            }, function(newValue) {
                                settingScope.field_model.app_id = newValue;
                            });
                        },
                    }
                ],
                [
                    {
                      title: 'Classes Settings',
                      type: 'header'
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
                                    interpretation: [{
                                        src: 'form',
                                        id: 'with_text',
                                        settings: {
                                            editable: 1,
                                            show_field_name: 1,
                                            show_field: 1
                                        },
                                    }]
                                }
                            }
                        }
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
                                    app_id: fieldModel.data_model.classes_app_id
                                }
                            }
                        },
                        onInit: function(settingScope, fieldModel) {
                            settingScope.$watch(function() {
                                return fieldModel.data_model.classes_app_id;
                            }, function(newValue) {
                                settingScope.field_model.data_model.app_id = newValue;
                            });
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
                                    app_id: fieldModel.data_model.classes_app_id
                                }
                            }
                        },
                        onInit: function(settingScope, fieldModel) {
                            settingScope.$watch(function() {
                                return fieldModel.data_model.classes_app_id;
                            }, function(newValue) {
                                settingScope.field_model.data_model.app_id = newValue;
                            });
                        },
                    },
                    {
                      title: 'Classes Filter',
                      type: 'header'
                    },{
                      type: "html",
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
                        type: "ghElement",
                        property: "data_model.classes_sorting_type",
                        data_model() {
                          return {
                            field_name: "Sorting Type",
                            name_space: "sorting_type",
                            data_type: "text_opt",
                            data_model: {
                              options: [
                                {
                                  name: "Ascending",
                                  value: "asc",
                                },
                                {
                                  name: "Descending",
                                  value: "desc",
                                },
                            ]},
                        };
                        }
                    }
                ],
                [
                    {
                      title: 'Lessons Settings',
                      type: 'header'
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
                                    interpretation: [{
                                        src: 'form',
                                        id: 'with_text',
                                        settings: {
                                            editable: 1,
                                            show_field_name: 1,
                                            show_field: 1
                                        },
                                    }]
                                }
                            }
                        }
                    },
                    {
                        type: 'ghElement',
                        property: 'data_model.lessons_app_title_field_id',
                        data_model: function (fieldModel) {
                            return {
                                data_type: 'field',
                                field_name: 'Lesson Title',
                                name_space: 'lesson_title',
                                data_model: {
                                    app_id: fieldModel.data_model.lessons_app_id
                                }
                            }
                        },
                        onInit: function(settingScope, fieldModel) {
                            settingScope.$watch(function() {
                                return fieldModel.data_model.lessons_app_id;
                            }, function(newValue) {
                                settingScope.field_model.data_model.app_id = newValue;
                            });
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
                                    app_id: fieldModel.data_model.lessons_app_id
                                }
                            }
                        },
                        onInit: function(settingScope, fieldModel) {
                            settingScope.$watch(function() {
                                return fieldModel.data_model.lessons_app_id;
                            }, function(newValue) {
                                settingScope.field_model.data_model.app_id = newValue;
                            });
                        },
                    },
                    {
                        type: 'ghElement',
                        property: 'data_model.lessons_app_course_field_id',
                        data_model: function (fieldModel) {
                            return {
                                data_type: 'field',
                                field_name: 'Lesson course',
                                name_space: 'lesson_course',
                                data_model: {
                                    app_id: fieldModel.data_model.lessons_app_id
                                }
                            }
                        },
                        onInit: function(settingScope, fieldModel) {
                            settingScope.$watch(function() {
                                return fieldModel.data_model.lessons_app_id;
                            }, function(newValue) {
                                settingScope.field_model.data_model.app_id = newValue;
                            });
                        },
                    },
                    {
                        type: 'ghElement',
                        property: 'data_model.lessons_app_academic_hours_field_id',
                        data_model: function (fieldModel) {
                            return {
                                data_type: 'field',
                                field_name: 'Lesson academic hours',
                                name_space: 'lesson_academic_hours',
                                data_model: {
                                    app_id: fieldModel.data_model.lessons_app_id
                                }
                            }
                        },
                        onInit: function(settingScope, fieldModel) {
                            settingScope.$watch(function() {
                                return fieldModel.data_model.lessons_app_id;
                            }, function(newValue) {
                                settingScope.field_model.data_model.app_id = newValue;
                            });
                        },
                    },
                    {
                        type: "ghElement",
                        property: "data_model.lessons_per_day",
                        data_model: function () {
                            return {
                                field_name: "Lessons per day",
                                name_space: "lessons_per_day",
                                data_type: "number",
                            };
                        },
                    },
                    {
                      title: 'Lessons Filter',
                      type: 'header'
                    },{
                      type: "html",
                      onInit: function (settingScope) {
                        settingScope.$watch(
                          function () {
                            return settingScope.fieldModel.data_model.lessons_app_id;
                          },
                          function (newValue) {
                            settingScope.field_model.data_model.app_id = newValue;
                          }
                        );
                      },
                      data_model: function (fieldModel) {
                        return {
                          recipient: {
                            app_id: fieldModel.data_model.lessons_app_id,
                          },
                        };
                      },
                      control:
                        '<gh-filter gh-filter-data-model="field_model" filter-list="fieldModel.data_model.lessons_filters_list" gh-mode="variable"></gh-filter>',
                    },
                ],
                [{
                    title: 'Cabinets Settings',
                    type: 'header'
                  },
                  {
                      type: 'ghElement',
                      property: 'data_model.cabinets_app_id',
                      data_model: function () {
                          return {
                              data_type: 'app',
                              field_name: 'Cabinets App',
                              name_space: 'cabinets_app',
                              data_model: {
                                  current_app: false,
                                  interpretation: [{
                                      src: 'form',
                                      id: 'with_text',
                                      settings: {
                                          editable: 1,
                                          show_field_name: 1,
                                          show_field: 1
                                      },
                                  }]
                              }
                          }
                      }
                  },
                  {
                      type: 'ghElement',
                      property: 'data_model.cabinets_app_number_field_id',
                      data_model: function (fieldModel) {
                          return {
                              data_type: 'field',
                              field_name: 'Lesson Number',
                              name_space: 'lesson_number',
                              data_model: {
                                  app_id: fieldModel.data_model.cabinets_app_id
                              }
                          }
                      },
                      onInit: function(settingScope, fieldModel) {
                          settingScope.$watch(function() {
                              return fieldModel.data_model.cabinets_app_id;
                          }, function(newValue) {
                              settingScope.field_model.data_model.app_id = newValue;
                          });
                      },
                  },
                ]
            ]
        }];
    }
}