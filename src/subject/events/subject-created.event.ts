import { Subject } from '@prisma/client';
import { Multer } from 'multer';

export type SubjectWithFile = Subject & {
    file: Multer.File;
};
export class SubjectCreatedEvent {
    constructor(public readonly subject: SubjectWithFile) { }
}