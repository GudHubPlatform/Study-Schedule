export function createLessons(lessons, classes) {
    const createdLessons = [];

    for (const lesson of lessons) {
        const lessonCourse = lesson.course;

        if (!lessonCourse) continue;

        const filteredClassesByCourse = classes.filter((clas) => clas.course === lesson.course);

        for (const clas of filteredClassesByCourse) {
            const uniqueId = `${lesson.id}/${clas.id}`;
            const subjectRefId = lesson.id;
            const clasId = clas.id
            const teacherRefId = lesson.teacherRefId;

            const newLesson = {
                uniqueId,
                subjectRefId,
                clasId,
                teacherRefId,
            };

            createdLessons.push(newLesson);
        }
    }

    return createdLessons;
}