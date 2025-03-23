import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AdminStats, ProfessorStats, StudentStats } from '../types/analytics.types';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getStudentStats(studentId: number): Promise<StudentStats> {
        const [
            totalSubmissions,
            correctedSubmissions,
            averageScore,
            submissionsBySubject,
            recentCorrections
        ] = await Promise.all([
            // Total submissions
            this.prisma.submission.count({
                where: { studentId }
            }),
            // Corrected submissions
            this.prisma.submission.count({
                where: {
                    studentId,
                    isCorrected: true
                }
            }),
            // Average score
            this.prisma.correction.aggregate({
                where: {
                    submission: {
                        studentId
                    }
                },
                _avg: {
                    score: true
                }
            }),
            // Submissions by subject
            this.prisma.submission.groupBy({
                by: ['subjectId'],
                where: { studentId },
                _count: true,
                orderBy: {
                    _count: {
                        subjectId: 'desc'
                    }
                },
                take: 5
            }),
            // Recent corrections
            this.prisma.correction.findMany({
                where: {
                    submission: {
                        studentId
                    }
                },
                include: {
                    submission: {
                        include: {
                            subject: true
                        }
                    }
                },
                orderBy: {
                    correctedAt: 'desc'
                },
                take: 5
            })
        ]);


        return {
            totalSubmissions,
            correctedSubmissions,
            pendingSubmissions: totalSubmissions - correctedSubmissions,
            averageScore: averageScore._avg.score || 0,
            submissionsBySubject,
            recentCorrections
        };
    }

    async getProfessorStats(professorId: number): Promise<ProfessorStats> {
        const [
            totalSubjects,
            totalStudents,
            submissionStats,
            correctionsByType,
            recentSubmissions
        ] = await Promise.all([
            this.prisma.subject.count({
                where: { teacherId: professorId }
            }),
            this.prisma.user.count({
                where: {
                    role: Role.STUDENT,
                    classroom: {
                        teacherId: professorId
                    }
                }
            }),
            // Submissions statistics with correction status
            this.prisma.submission.findMany({
                where: {
                    subject: {
                        teacherId: professorId
                    }
                },
                select: {
                    isCorrecting: true,
                    isCorrected: true
                }
            }),
            // Corrections by evaluation type
            this.prisma.correction.groupBy({
                by: ['evaluationType'],
                where: {
                    submission: {
                        subject: {
                            teacherId: professorId
                        }
                    }
                },
                _count: true
            }),
            // Recent submissions
            this.prisma.submission.findMany({
                where: {
                    subject: {
                        teacherId: professorId
                    }
                },
                include: {
                    student: true,
                    subject: true
                },
                orderBy: {
                    submittedAt: 'desc'
                },
                take: 5
            })
        ]);

        const submissionMetrics = {
            total: submissionStats.length,
            correcting: submissionStats.filter(s => s.isCorrecting && !s.isCorrected).length,
            corrected: submissionStats.filter(s => s.isCorrected).length,
            pending: submissionStats.filter(s => !s.isCorrecting && !s.isCorrected).length
        };

        return {
            totalSubjects,
            totalStudents,
            submissionMetrics,
            correctionsByType,
            recentSubmissions,
            correctionProgress: submissionMetrics.total > 0
                ? Math.round((submissionMetrics.corrected / submissionMetrics.total) * 100)
                : 0
        };
    }

    async getAdminStats(): Promise<AdminStats> {
        const [
            userStats,
            submissionStats,
            classroomStats,
            subjectStats,
            recentActivities
        ] = await Promise.all([
            // User statistics with detailed counts
            this.prisma.user.groupBy({
                by: ['role'],
                _count: {
                    _all: true
                }
            }),
            // Submission and correction statistics
            this.prisma.$transaction([
                this.prisma.submission.count(),
                this.prisma.submission.count({
                    where: {
                        isCorrected: true
                    }
                })
            ]),
            // Classroom statistics
            this.prisma.$transaction([
                this.prisma.classroom.count(),
                this.prisma.user.count({
                    where: { role: Role.STUDENT }
                }),
                this.prisma.subject.count()
            ]),
            // Subject statistics by evaluation type
            this.prisma.subject.groupBy({
                by: ['evaluationType'],
                _count: {
                    _all: true
                }
            }),
            // Recent activities using MySQL syntax
            this.prisma.$queryRaw<{
                type: 'submission' | 'correction';
                id: number;
                timestamp: Date;
                firstName: string;
                lastName: string;
                title: string;
                status: string;
            }[]>`
                SELECT * FROM (
                    SELECT 
                        'submission' as type, 
                        s.id, 
                        s.submittedAt as timestamp, 
                        u.firstName, 
                        u.lastName, 
                        sub.title,
                        IF(s.isCorrected = true, 'corrected',
                            IF(s.isCorrecting = true, 'correcting', 'pending')
                        ) as status
                    FROM Submission s
                    JOIN User u ON s.studentId = u.id
                    JOIN Subject sub ON s.subjectId = sub.id
                    UNION ALL
                    SELECT 
                        'correction' as type, 
                        c.id, 
                        c.correctedAt as timestamp,
                        u.firstName, 
                        u.lastName, 
                        sub.title,
                        CONCAT('score: ', CAST(IFNULL(c.score, 0) AS CHAR)) as status
                    FROM Correction c
                    JOIN Submission s ON c.submissionId = s.id
                    JOIN User u ON s.studentId = u.id
                    JOIN Subject sub ON s.subjectId = sub.id
                ) as activities
                ORDER BY timestamp DESC
                LIMIT 10
            `
        ]);

        const [totalSubmissions, correctedSubmissions] = submissionStats;
        const [totalClassrooms, totalStudents, totalSubjects] = classroomStats;

        return {
            userStats: {
                distribution: userStats,
                totalUsers: userStats.reduce((acc, stat) => acc + stat._count._all, 0)
            },
            submissionMetrics: {
                total: totalSubmissions,
                corrected: correctedSubmissions,
                pending: totalSubmissions - correctedSubmissions
            },
            classroomMetrics: {
                total: totalClassrooms,
                totalStudents,
                totalSubjects,
                averageStudentsPerClass: totalClassrooms > 0 ? totalStudents / totalClassrooms : 0,
                averageSubjectsPerClass: totalClassrooms > 0 ? totalSubjects / totalClassrooms : 0
            },
            subjectDistribution: subjectStats,
            recentActivities,
            systemHealth: {
                activeClassrooms: totalClassrooms,
                submissionRate: totalStudents > 0 ? totalSubmissions / totalStudents : 0,
                correctionRate: totalSubmissions > 0 ? correctedSubmissions / totalSubmissions : 0
            }
        };
    }
}
