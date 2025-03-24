import { Submission, Subject } from '@prisma/client';
import { Multer } from 'multer';

export type SubmissionWithFile = Submission & {
    file: Multer.File;
};

export class SubmissionCreatedEvent {
    constructor(
        public readonly submission: SubmissionWithFile,
        public readonly subject: Subject,
    ) { }
}