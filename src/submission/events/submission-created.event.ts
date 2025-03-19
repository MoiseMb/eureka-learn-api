import { Submission, Subject } from '@prisma/client';

export class SubmissionCreatedEvent {
    constructor(
        public readonly submission: Submission,
        public readonly subject: Subject,
    ) {}
}