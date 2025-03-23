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
            where: { email: 'wally@gmail.com' },
            update: {},
            create: {
                email: 'wally@gmail.com',
                firstName: 'Wally ',
                lastName: 'NDOUR',
                password: hashedPassword,
                role: Role.PROFESSOR,
            },
        });

        // Create Student
        const student = await prisma.user.upsert({
            where: { email: 'suzane@gmail.com' },
            update: {},
            create: {
                email: 'suzane@gmail.com',
                firstName: 'Suzanne',
                lastName: 'LY',
                password: hashedPassword,
                role: Role.STUDENT,
            },
        });

        // Create Classroom
        const classroom = await prisma.classroom.create({
            data: {
                name: 'DIC2 TR',
                description: 'classe des ingenieures ',
                teacher: { connect: { id: professor.id } },
                students: { connect: { id: student.id } },
            },
        });

        const subjects = await Promise.all([
            prisma.subject.create({
                data: {
                    title: 'Controle SQL',
                    description: 'Introduction a sql',
                    fileUrl: 'https://sjqemivqghmprsddwifn.supabase.co/storage/v1/object/public/uploads/subjects/1742398172772_evaluation.pdf',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    evaluationType: EvaluationType.SQL,
                    type: SubjectType.PDF,
                    teacher: { connect: { id: professor.id } },
                    classroom: { connect: { id: classroom.id } },
                },
            }),
            prisma.subject.create({
                data: {
                    title: 'exam sql',
                    description: 'Introduction a sql',
                    fileUrl: 'https://sjqemivqghmprsddwifn.supabase.co/storage/v1/object/public/uploads/subjects/1742398172772_evaluation.pdf',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    evaluationType: EvaluationType.PYTHON,
                    type: SubjectType.PDF,
                    teacher: { connect: { id: professor.id } },
                    classroom: { connect: { id: classroom.id } },
                },
            }),
        ]);

        for (const subject of subjects) {
            const submissions = await Promise.all(
                Array(3).fill(null).map(async (_, index) => {
                    const submission = await prisma.submission.create({
                        data: {
                            fileUrl: `https://sjqemivqghmprsddwifn.supabase.co/storage/v1/object/public/uploads/submissions/1742503463055_reponse.pdf`,
                            student: { connect: { id: student.id } },
                            subject: { connect: { id: subject.id } },
                            type: SubjectType.PDF,
                            isCorrected: true,
                        },
                    });

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