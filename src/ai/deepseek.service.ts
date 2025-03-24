import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SubjectCreatedEvent } from '../subject/events/subject-created.event';
import { SubmissionCreatedEvent } from 'src/submission/events/submission-created.event';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/upload/upload.service';
import * as fs from 'fs';
import * as pdfParse from 'pdf-parse';
import { PDFDocument as PDFLib, StandardFonts } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DeepseekService {
    private readonly OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
    private readonly OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';

    constructor(
        private prisma: PrismaService,
        private uploadService: UploadService,
    ) { }

    @OnEvent('subject.created')
    async handleSubjectCreated(event: SubjectCreatedEvent) {
        console.log(`🤖 Starting AI correction guide generation for subject: ${event.subject.title}`);
        try {
            const subject = event.subject;
            await this.prisma.subject.update({
                where: { id: subject.id },
                data: { isCorrecting: true },
            });

            if (!subject.file || !subject.file.buffer || !subject.file.mimetype) {
                throw new Error('Subject file is missing or invalid');
            }

            let subjectContent = '';
            if (subject.file.mimetype === 'application/pdf') {
                subjectContent = await this.extractTextFromPdf(subject.file.buffer);
            } else if (subject.file.mimetype === 'text/plain') {
                subjectContent = subject.file.buffer.toString('utf-8');
            } else {
                throw new Error(`Unsupported file format: ${subject.file.mimetype}. Only PDF and text files are supported.`);
            }

            const correctionGuide = await this.generateCorrectionWithOpenRouterForSubjectCreatedEvent(subject, subjectContent);

            const pdfFilename = `correction_${subject.id}.pdf`;
            const textFilename = `temp_${uuidv4()}.txt`;

            try {
                fs.writeFileSync(textFilename, correctionGuide, 'utf-8');
                await this.convertTextToPdf(textFilename, pdfFilename);

                // Lire le fichier PDF
                const pdfBuffer = fs.readFileSync(pdfFilename);

                // Créer un objet file pour l'upload
                const correctionFile = {
                    buffer: pdfBuffer,
                    originalname: `correction_${subject.title}.pdf`,
                    mimetype: 'application/pdf',
                };

                // Uploader le fichier
                const uploadResult = await this.uploadService.uploadFile(
                    correctionFile,
                    'professorCorrectionSubjects'
                );

                // Mettre à jour le sujet dans la base de données
                await this.prisma.subject.update({
                    where: { id: subject.id },
                    data: {
                        correctionFileUrl: uploadResult,
                        isCorrecting: false,
                        isCorrected: true,
                    },
                });
            } finally {
                // Nettoyer les fichiers temporaires
                if (fs.existsSync(textFilename)) {
                    fs.unlinkSync(textFilename);
                }
                if (fs.existsSync(pdfFilename)) {
                    fs.unlinkSync(pdfFilename);
                }
            }

            console.log(`✅ AI correction guide generated successfully for subject: ${subject.title}`);
        } catch (error) {
            await this.prisma.subject.update({
                where: { id: event.subject.id },
                data: { isCorrecting: false, isCorrected: false },
            });
            console.error('❌ Subject correction generation failed:', error);
            throw error;
        }
    }

    @OnEvent('submission.created')
    async handleSubmissionCreated(event: SubmissionCreatedEvent) {
        const { submission, subject } = event;

        try {
            // Set submission to correcting state
            await this.prisma.submission.update({
                where: { id: submission.id },
                data: { isCorrecting: true }
            });

            // Télécharger le fichier de soumission depuis Supabase
            const fileBuffer = await this.uploadService.downloadFile(submission.fileUrl);
            console.log('File downloaded successfully:', submission.fileUrl);

            // Extraire le texte du fichier PDF
            const contentFileCorrection = await this.extractTextFromPdf(fileBuffer);
            // console.log('Text extracted from PDF:', contentFileCorrection);

            let submissionContent = '';
            if (submission.file.mimetype === 'application/pdf') {
                submissionContent = await this.extractTextFromPdf(submission.file.buffer);
            } else if (submission.file.mimetype === 'text/plain') {
                submissionContent = submission.file.buffer.toString('utf-8');
            } else {
                throw new Error(`Unsupported file format: ${submission.file.mimetype}. Only PDF and text files are supported.`);
            }

            // Générer le guide de correction avec OpenRouter
            const correction = await this.generateCorrectionWithOpenRouterForSubmissionCreatedEvent(
                contentFileCorrection,
                submissionContent,
            );
            const jsonString = correction.replace(/json|```/g, '')
            const objetCorrection = JSON.parse(jsonString);


            await this.prisma.correction.create({
                data: {
                    score: objetCorrection.grading,
                    notes: objetCorrection.general_comment,
                    evaluationType: subject.evaluationType,
                    submissionId: submission.id
                }
            });

            await this.prisma.submission.update({
                where: { id: submission.id },
                data: {
                    isCorrecting: false,
                    isCorrected: true
                }
            });



            console.log('✅ Correction with feedback uploaded successfully');
        } catch (error) {
            // Reset submission status on error
            await this.prisma.submission.update({
                where: { id: submission.id },
                data: {
                    isCorrecting: false,
                    isCorrected: false
                }
            });
            console.error('❌ Failed to handle submission:', error);
            throw error;
        }
    }

    private async generateCorrectionWithOpenRouterForSubjectCreatedEvent(subject: any, content: string): Promise<string> {
        try {
            const payload = {
                model: 'google/gemini-2.0-flash-001',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: this.buildSubjectPrompt(subject, content),
                            },
                        ],
                    },
                ],
            };

            const openRouterResponse = await axios.post(this.OPENROUTER_API_URL, payload, {
                headers: {
                    Authorization: `Bearer ${this.OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'http://localhost:3002',
                    'X-Title': 'NestJS App',
                    'Content-Type': 'application/json',
                },
            });

            const resultOfPrompt = openRouterResponse.data.choices[0].message.content.trim();
            const cleanedResponse = resultOfPrompt
                .replace(/<think>.*?<\/think>/gs, '')
                .replace(/\\[()\[\]]/g, '')
                .replace(/\\boxed{(.*?)}/g, '$1');

            return cleanedResponse;
        } catch (error) {
            console.error('❌ OpenRouter API request failed:', error);
            throw new Error('Failed to generate correction guide with OpenRouter');
        }
    }

    private async generateCorrectionWithOpenRouterForSubmissionCreatedEvent(correction: any, studentProposition: string): Promise<string> {
        try {
            const payload = {
                model: 'google/gemini-2.0-flash-001',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: this.buildSubmissionPrompt(correction, studentProposition),
                            },
                        ],
                    },
                ],
            };

            const openRouterResponse = await axios.post(this.OPENROUTER_API_URL, payload, {
                headers: {
                    Authorization: `Bearer ${this.OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'http://localhost:3002',
                    'X-Title': 'NestJS App',
                    'Content-Type': 'application/json',
                },
            });

            const resultOfPrompt = openRouterResponse.data.choices[0].message.content.trim();
            const cleanedResponse = resultOfPrompt
                .replace(/<think>.*?<\/think>/gs, '')
                .replace(/\\[()\[\]]/g, '')
                .replace(/\\boxed{(.*?)}/g, '$1');

            return cleanedResponse;
        } catch (error) {
            console.error('❌ OpenRouter API request failed:', error);
            throw new Error('Failed to generate correction guide with OpenRouter');
        }
    }

    private async extractTextFromPdf(fileBuffer: Buffer): Promise<string> {
        try {
            const data = await pdfParse(fileBuffer);
            if (!data || !data.text) {
                throw new Error('Failed to extract text from PDF: Invalid PDF data');
            }
            return data.text;
        } catch (error) {
            console.error('❌ Failed to extract text from PDF:', error);
            throw new Error('Failed to extract text from PDF');
        }
    }

    private buildSubjectPrompt(subject: any, content: string): string {
        return `
### Context
You are an expert professor generating A detailed correction based on the guide below for a **${subject.evaluationType}** assignment.

### Instructions
- **Ensure high accuracy** in all explanations, solutions, and formatting.
- **Follow structured formatting in Markdown** for clarity and readability.

---

##  Assignment Details
- **Title:** ${subject.title}
- **Type:** ${subject.type}
- **Evaluation Type:** ${subject.evaluationType}
- **Description:** ${subject.description}

###  Assignment Content:
\`\`\`
${content}
\`\`\`

---

Correction Guide Structure
1 OBJECTIVES & LEARNING OUTCOMES

Main Educational Goals: Explain what the student is expected to learn.
Success Criteria: Define the key indicators of a successful solution.

2 SOLUTION OVERVIEW

Expected Approach: Describe the correct way to solve the problem.
Best Practices & Design Patterns: Include relevant coding principles (e.g., SOLID for OOP, Index Optimization for SQL).

3 EVALUATION CRITERIA (Total: 20 points)

Functional Correctness (6 points)

Clearly explain how correctness is assessed.
Provide example test cases and expected outputs.


Code Structure & Architecture (5 points)

Describe optimal organization.
Detail expected modularity (e.g., functions, classes).


Best Practices & Optimization (5 points)

Explain expected coding standards and patterns.
Identify potential inefficiencies and improvements.


Documentation & Readability (4 points)

Specify required comments and documentation.
Detail expected readability and maintainability.



4 EXPECTED ANSWERS FOR EACH QUESTION IN A DEDICATED SECTION

Exact and Precise Answers: For technical or calculation domains, provide numerical answers or specific solutions.
Exact but General Answers: For literary or conceptual domains, provide a response framework with expected key elements.
Model Answer Examples: Present examples of ideal answers to serve as reference when grading.
Specific Evaluation Criteria: Detail what makes a response complete or correct for each question.

5 COMMON ERRORS & TROUBLESHOOTING

List frequent mistakes students might make.
Provide debugging tips and ways to correct them.
Explain why certain incorrect approaches fail.

6 BONUS POINTS OPPORTUNITIES

List extra features that could earn additional credit.
Detail possible optimizations for performance improvement.

---

##  Response Format
- ** Make the all response in French
- **Use Markdown formatting** with headers, bullet points, and code blocks.
- **Provide code snippets where necessary**, formatted properly:
\`\`\`${subject.evaluationType.toLowerCase()}
// Example Code
\`\`\`
- **Ensure clarity and professional-level explanation.**

---

###  FINAL REMINDER
- Your response must be **detailed, structured, and professional**.
- Do **NOT** change the base language (that of the subject) when correcting, unless explicitly required.
- Always ensure accuracy in **technical explanations and code formatting**.
        `;
    }

    private buildSubmissionPrompt(assignmentCorrection: string, studentFileCorrection: string): string {
        return `You are an experienced educator specializing in [Database Management and SQL].  You are grading a student's assignment on [Specific Assignment Topic, e.g., SQL Queries for Data Retrieval].  Your task is to provide feedback on the student's work, focusing on both correctness and best practices. 
                    Harshness/Grading Style: [Correction Style, e.g., Gentle and Encouraging,  Strict and Detailed, Balanced]. This dictates the tone and the extent to which minor errors are penalized.  A "Gentle" style will prioritize positive feedback and constructive suggestions. A "Strict" style will point out all errors, even minor ones, and might be more critical of inefficient solutions. A "Balanced" style will provide a mix of positive and negative feedback, focusing on major areas for improvement.
                    Assignment correction: `+ assignmentCorrection + `  
                    Student's Submission: ` + studentFileCorrection + `
                    Correction Guidelines:  
                    1.  Overall Impression:  Provide a brief summary of the student's work.  Did they generally understand the concepts? Were there any significant gaps in their knowledge?  
                    2.  Correctness:  Evaluate the correctness of the student's solutions.  
                        *   For SQL: Determine if the queries produce the expected results. If not, identify the specific errors in the logic or syntax.  
                        *   For other subjects: Assess if the answers are accurate and complete according to the assignment requirements.  
                    3.  Efficiency and Best Practices (Especially for SQL):  Assess the efficiency of the student's solutions (e.g., query performance).  Suggest improvements in terms of:  
                        *   Using appropriate SQL functions (e.g., avoiding cursors when set-based operations are possible).  
                        *   Optimizing query structure (e.g., using appropriate JOIN types, indexes).  
                        *   Following coding standards (e.g., clear naming conventions, consistent formatting).  
                    4.  Clarity and Readability:  Evaluate the clarity and readability of the student's code or written answers.  
                        *   For SQL: Is the code well-formatted and easy to understand? Are comments used effectively to explain the logic?  
                        *   For other subjects: Is the writing clear, concise, and well-organized?  
                    5.  Specific Feedback:  Provide detailed feedback on each question or task in the assignment. For each question:  
                        *   State whether the answer is correct or incorrect.  
                        *   If incorrect, explain the error in detail and provide a corrected solution or suggestion.  
                        *   If correct, offer suggestions for improvement in terms of efficiency, clarity, or best practices.
                    6.  General Comment: Provide a comment about all the student's work
                    7.  Grading :  Evaluate the student on a scale of 0 to 20, where 20 is a perfectly correct solution and 0 is completely incorrect or results in a syntax error. Justify your score based on the number and severity of the identified differences. If a specific grading rubric is provided, use it insteed, to assign a grade for the assignment. 

                    Important Considerations:  

                    *   It is imperative that you note the work done after correction and that you make also a general comment.
                    *   Focus on Learning: The primary goal is to help the student learn and improve.  Frame feedback in a constructive and supportive manner.  
                    *   Explain Why:  Don't just say something is wrong; explain why it's wrong and how to fix it.  
                    *   Be Specific:  Avoid vague statements like "This could be better." Instead, provide concrete suggestions.  
                    *   Consider the Student's Level:  Don't expect a beginner to write code like an expert.  
                    *   Maintain Consistency: Apply the same grading criteria consistently across the entire assignment.
                    *   Make the whole response in french.

                    So, the response will be in json and will contain three fields, the fisrt is general_comment, the second is specific_feedback, and the third is the grading (in int)`;
    }

    // Fonction pour convertir un fichier texte en PDF
    private async convertTextToPdf(textFilename: string, pdfFilename: string): Promise<void> {
        const pdfDoc = await PDFLib.create();
        let page = pdfDoc.addPage();
        let { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const textContent = fs.readFileSync(textFilename, 'utf-8');
        const lines = textContent.split('\n');

        let y = height - 50;
        const margin = 50;
        const maxWidth = width - 2 * margin; // Largeur disponible
        const fontSize = 12;

        lines.forEach((line) => {
            let words = line.split(' ');
            let currentLine = '';

            words.forEach((word) => {
                let testLine = currentLine + word + ' ';
                let textWidth = font.widthOfTextAtSize(testLine, fontSize);

                if (textWidth > maxWidth) {
                    if (y < 50) {
                        page = pdfDoc.addPage();
                        y = height - 50;
                    }
                    page.drawText(currentLine.trim(), { x: margin, y, size: fontSize, font });
                    y -= 15; // Espacement entre lignes
                    currentLine = word + ' ';
                } else {
                    currentLine = testLine;
                }
            });

            if (currentLine.trim() !== '') {
                if (y < 50) {
                    page = pdfDoc.addPage();
                    y = height - 50;
                }
                page.drawText(currentLine.trim(), { x: margin, y, size: fontSize, font });
                y -= 15;
            }
        });

        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(pdfFilename, pdfBytes);
    }


    // Méthode précédente de génération de PDF utilisée comme alternative
    // private generatePDFWithPDFKit(title: string, content: string): Promise<Buffer> {
    //     return new Promise((resolve, reject) => {
    //         const doc = new PDFDocument();
    //         const buffers = [];

    //         doc.on('data', buffers.push.bind(buffers));
    //         doc.on('end', () => resolve(Buffer.concat(buffers)));
    //         doc.on('error', reject);

    //         doc.fontSize(20).text('Correction Guide - ' + title, { align: 'center' });
    //         doc.moveDown();
    //         doc.fontSize(12).text(content);
    //         doc.end();
    //     });
    // }
}