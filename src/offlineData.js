const teachers = [{
    id: 1,
    name: 'Андрій',
    surname: 'Смірнов'
},
{
    id: 2,
    name: 'Марія',
    surname: 'Петрова'
},
{
    id: 3,
    name: 'Олег',
    surname: 'Іванов'
},
{
    id: 4,
    name: 'Юлія',
    surname: 'Коваленко'
},
{
    id: 5,
    name: 'Сергій',
    surname: 'Морозов'
},
{
    id: 6,
    name: 'Ольга',
    surname: 'Ткаченко'
},
{
    id: 7,
    name: 'Віталій',
    surname: 'Грищенко'
},
{
    id: 8,
    name: 'Тетяна',
    surname: 'Шевченко'
},
{
    id: 9,
    name: 'Іван',
    surname: 'Козак'
},
{
    id: 10,
    name: 'Наталія',
    surname: 'Лисенко'
},
{
    id: 11,
    name: 'Роман',
    surname: 'Баженов'
},
{
    id: 12,
    name: 'Максим',
    surname: 'Жуков'
},
{
    id: 13,
    name: 'Ірина',
    surname: 'Савченко'
},
{
    id: 14,
    name: 'Павло',
    surname: 'Гончар'
}];

export const lessons = [{
    id: 0,
    title: 'укр література',
    classNumber: '5',
},{
    id: 1,
    title: 'укр література',
    classNumber: '6',
},{
    id: 2,
    title: 'укр література',
    classNumber: '7',
},{
    id: 3,
    title: "Основи здоров'я",
    classNumber: '7',
    teacher: teachers[0]
},{
    id: 4,
    title: 'трудове навчання',
    classNumber: '',
    teacher: teachers[1]
},{
    id: 5,
    title: 'образотворче мистецтво',
    classNumber: '',
    teacher: teachers[2]
},{
    id: 6,
    title: 'англійська мова',
    classNumber: '',
    teacher: teachers[3]
},{
    id: 7,
    title: 'музичне мистецтво',
    classNumber: '',
    teacher: teachers[4]
},
{
    id: 8,
    title: 'хімія',
    classNumber: '',
    teacher: teachers[5]
},{
    id: 9,
    title: 'географія',
    classNumber: '',
    teacher: teachers[6]
},{
    id: 10,
    title: 'історія',
    classNumber: '',
    teacher: teachers[7]
},{
    id: 11,
    title: 'всесвіт. історія',
    classNumber: '',
    teacher: teachers[8]
},{
    id: 12,
    title: 'математика',
    classNumber: '',
    teacher: teachers[9]
},{
    id: 13,
    title: 'алгебра',
    classNumber: '',
    teacher: teachers[9]
},{
    id: 14,
    title: 'геометрія',
    classNumber: '5',
    teacher: teachers[9]
},{
    id: 15,
    title: 'укр мова',
    classNumber: '',
    teacher: teachers[10]
},{
    id: 16,
    title: 'укр література',
    classNumber: '',
    teacher: teachers[10]
},{
    id: 17,
    title: 'світова література',
    classNumber: '',
    teacher: teachers[11]
},{
    id: 18,
    title: 'фізкультура',
    classNumber: '',
    teacher: teachers[12]
},{
    id: 19,
    title: 'екологія',
    classNumber: '',
    teacher: teachers[13]
}
];

export const classes = [{
    id: 0,
    classNumber: 5,
    classLetter: 'а',
    lessonsAcademicHours: {}, 
},{
    id: 1,
    classNumber: 5,
    classLetter: 'б',
},{
    id: 2,
    classNumber: 5,
    classLetter: 'в',
},{
    id: 3,
    classNumber: 6,
    classLetter: 'а',
},{
    id: 4,
    classNumber: 6,
    classLetter: 'б',
},{
    id: 5,
    classNumber: 6,
    classLetter: 'в',
},{
    id: 6,
    classNumber: 7,
    classLetter: 'а',
},{
    id: 7,
    classNumber: 7,
    classLetter: 'б',
},{
    id: 8,
    classNumber: 7,
    classLetter: 'в',
},{
    id: 9,
    classNumber: 8,
    classLetter: 'а',
},{
    id: 10,
    classNumber: 8,
    classLetter: 'б',
},{
    id: 11,
    classNumber: 9,
    classLetter: 'а',
},{
    id: 12,
    classNumber: 9,
    classLetter: 'б',
},{
    id: 13,
    classNumber: 10,
    classLetter: 'а',
},{
    id: 14,
    classNumber: 11,
    classLetter: 'а',
}];