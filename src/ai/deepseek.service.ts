import { Injectable } from '@nestjs/common';
import { Subject, Submission } from '@prisma/client';
import { OnEvent } from '@nestjs/event-emitter';
import { SubmissionCreatedEvent } from '../submission/events/submission-created.event';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DeepseekService {
    private readonly OLLAMA_API = 'http://localhost:11434/api/generate';
    private readonly MODEL = 'deepseekr1:14b';

    constructor(private prisma: PrismaService) { }

    @OnEvent('submission.created')
    async handleSubmissionCreated(event: SubmissionCreatedEvent) {
        try {
            // Set submission to correcting state
            await this.prisma.submission.update({
                where: { id: event.submission.id },
                data: { isCorrecting: true }
            });

            // const evaluation = await this.evaluateSubmission(event.submission, event.subject);

            // // Create correction and update submission status
            // await this.prisma.$transaction([
            //     this.prisma.correction.create({
            //         data: {
            //             submissionId: event.submission.id,
            //             score: evaluation.score,
            //             notes: evaluation.notes,
            //             evaluationType: event.subject.evaluationType
            //         }
            //     }),
            //     this.prisma.submission.update({
            //         where: { id: event.submission.id },
            //         data: {
            //             isCorrecting: false,
            //             isCorrected: true
            //         }
            //     })
            // ]);
        } catch (error) {
            await this.prisma.submission.update({
                where: { id: event.submission.id },
                data: { isCorrecting: false }
            });
            console.error('Evaluation failed:', error);
        }
    }

    private async evaluateSubmission(submission: Submission, subject: Subject): Promise<{
        score: number;
        notes: string;
    }> {
        try {
            const fileResponse = await axios.get(submission.fileUrl);
            const submissionContent = fileResponse.data;

            const prompt = `
                You are an expert programming instructor evaluating a student submission.
                
                Context:
                - Programming Language/Topic: ${subject.evaluationType}
                - Assignment: ${subject.title}
                - Requirements: ${subject.description}

                Submitted Code:
                \`\`\`
                ${submissionContent}
                \`\`\`

                Task:
                1. Analyze the code quality, correctness, and best practices
                2. Consider:
                   - Code functionality and correctness (5 points)
                   - Code organization and clarity (5 points)
                   - Error handling and edge cases (5 points)
                   - Documentation and best practices (5 points)

                Required Output Format:
                1. Score: Provide a score out of 20 points
                2. Detailed Analysis: Explain the scoring breakdown
                3. Feedback: List specific strengths and areas for improvement
                4. Recommendations: Provide actionable suggestions
            `;

            const response = await axios.post(this.OLLAMA_API, {
                model: this.MODEL,
                prompt: prompt,
                stream: false
            });

            const aiResponse = response.data.response;

            const scoreMatch = aiResponse.match(/Score:\s*(\d+)/);
            const score = scoreMatch ? parseInt(scoreMatch[1]) : 10;

            return {
                score: Math.min(Math.max(score, 0), 20),
                notes: aiResponse
            };

        } catch (error) {
            console.error('DeepSeek evaluation failed:', error);
            return {
                score: 0,
                notes: "Automatic evaluation failed. Please wait for manual review."
            };
        }
    }
}