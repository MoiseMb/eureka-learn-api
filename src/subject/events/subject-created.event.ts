import { Subject } from '@prisma/client';

export class SubjectCreatedEvent {
    constructor(public readonly subject: Subject) {}
}