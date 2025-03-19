import { PrismaClient, Role, EvaluationType, SubjectType } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    try {
        const hashedPassword = await hash('passer', 12);

        // Create Admin
        const admin = await prisma.user.upsert({
            where: { email: 'admin@admin.com' },
            update: {},
            create: {
                email: 'admin@admin.com',
                firstName: 'Pape Moussa',
                lastName: 'MBENGUE',
                password: hashedPassword,
                role: Role.ADMIN,
            },
        });

        // Create Professor
        const professor = await prisma.user.upsert({
            where: { email: 'prof@test.com' },
            update: {},
            create: {
                email: 'prof@test.com',
                firstName: 'John',
                lastName: 'Doe',
                password: hashedPassword,
                role: Role.PROFESSOR,
            },
        });

        // Create Student
        const student = await prisma.user.upsert({
            where: { email: 'student@test.com' },
            update: {},
            create: {
                email: 'student@test.com',
                firstName: 'Jane',
                lastName: 'Smith',
                password: hashedPassword,
                role: Role.STUDENT,
            },
        });

        // Create Classroom
        const classroom = await prisma.classroom.create({
            data: {
                name: 'Computer Science 101',
                description: 'Introduction to Programming',
                teacher: { connect: { id: professor.id } },
                students: { connect: { id: student.id } },
            },
        });

        // Create Subjects
        const subjects = await Promise.all([
            prisma.subject.create({
                data: {
                    title: 'Java Programming Basics',
                    description: 'Introduction to Java Programming',
                    fileUrl: 'https://example.com/java-basics.pdf',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    evaluationType: EvaluationType.POO_JAVA,
                    type: SubjectType.PDF,
                    teacher: { connect: { id: professor.id } },
                    classroom: { connect: { id: classroom.id } },
                },
            }),
            prisma.subject.create({
                data: {
                    title: 'Python Programming',
                    description: 'Python for Beginners',
                    fileUrl: 'https://example.com/python-basics.pdf',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    evaluationType: EvaluationType.PYTHON,
                    type: SubjectType.PDF,
                    teacher: { connect: { id: professor.id } },
                    classroom: { connect: { id: classroom.id } },
                },
            }),
        ]);

        // Create Submissions and Corrections
        for (const subject of subjects) {
            const submissions = await Promise.all(
                Array(3).fill(null).map(async (_, index) => {
                    const submission = await prisma.submission.create({
                        data: {
                            fileUrl: `https://example.com/submission-${index + 1}.pdf`,
                            student: { connect: { id: student.id } },
                            subject: { connect: { id: subject.id } },
                            type: SubjectType.PDF,
                            isCorrected: true,
                        },
                    });

                    // Create correction for each submission
                    await prisma.correction.create({
                        data: {
                            score: Math.random() * 20,
                            notes: `Correction feedback for submission ${index + 1}`,
                            evaluationType: subject.evaluationType,
                            submission: { connect: { id: submission.id } },
                        },
                    });

                    return submission;
                }),
            );
        }

        console.log('Seed data created successfully');

    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });