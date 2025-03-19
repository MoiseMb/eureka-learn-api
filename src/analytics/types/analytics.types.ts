import { Correction, Subject, User } from '@prisma/client';

export type StudentStats = {
    totalSubmissions: number;
    correctedSubmissions: number;
    pendingSubmissions: number;
    averageScore: number;
    submissionsBySubject: {
        subjectId: number;
        _count: number;
    }[];
    recentCorrections: (Correction & {
        submission: {
            subject: Subject;
        };
    })[];
};

export type ProfessorStats = {
    totalSubjects: number;
    totalStudents: number;
    submissionsToCorrect: number;
    correctionsByType: {
        evaluationType: string;
        _count: number;
    }[];
    recentSubmissions: {
        id: number;
        student: User;
        subject: Subject;
        submittedAt: Date;
        fileUrl: string;
    }[];
};

export type AdminStats = {
    userStats: {
        distribution: {
            role: string;
            _count: {
                _all: number;
            };
        }[];
        totalUsers: number;
    };
    submissionMetrics: {
        total: number;
        corrected: number;
        pending: number;
    };
    classroomMetrics: {
        total: number;
        totalStudents: number;
        totalSubjects: number;
        averageStudentsPerClass: number;
        averageSubjectsPerClass: number;
    };
    subjectDistribution: {
        evaluationType: string;
        _count: {
            _all: number;
        };
    }[];
    recentActivities: {
        type: 'submission' | 'correction';
        id: number;
        timestamp: Date;
        firstName: string;
        lastName: string;
        title: string;
        status: string;
    }[];
    systemHealth: {
        activeClassrooms: number;
        submissionRate: number;
        correctionRate: number;
    };
};