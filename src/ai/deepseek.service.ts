import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SubjectCreatedEvent } from '../subject/events/subject-created.event';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/upload/upload.service';
import * as PDFDocument from 'pdfkit';
import Ollama from 'ollama';
import { Multer } from 'multer';

@Injectable()
export class DeepseekService {
    private readonly ollama: typeof Ollama;
    private readonly MODEL = 'deepseek-r1:1.5b';

    constructor(
        private prisma: PrismaService,
        private uploadService: UploadService
    ) {
        this.ollama = Ollama;
    }

    @OnEvent('subject.created')
    async handleSubjectCreated(event: SubjectCreatedEvent) {
        console.log(`🤖 Starting AI correction guide generation for subject: ${event.subject.title}`);
        try {
            const subject = event.subject;

            await this.prisma.subject.update({
                where: { id: subject.id },
                data: { isCorrecting: true }
            });

            const fileResponse = await axios.get(subject.fileUrl);
            const subjectContent = fileResponse.data;

            const response = await this.ollama.generate({
                model: this.MODEL,
                prompt: this.buildSubjectPrompt(subject, subjectContent),
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                }
            });

            const correctionGuide = response.response;
            const pdfBuffer = await this.generatePDF(subject.title, correctionGuide);

            const correctionFile = {
                buffer: pdfBuffer,
                originalname: `correction_${subject.title}.pdf`,
                mimetype: 'application/pdf'
            };

            const uploadResult = await this.uploadService.uploadFile(
                correctionFile as Multer.File,
                'professorCorrectionSubjects'
            );

            await this.prisma.subject.update({
                where: { id: subject.id },
                data: {
                    correctionFileUrl: uploadResult,
                    isCorrecting: false,
                    isCorrected: true,
                }
            });

            console.log(`✅ AI correction guide generated successfully for subject: ${subject.title}`);
        } catch (error) {
            await this.prisma.subject.update({
                where: { id: event.subject.id },
                data: { isCorrecting: false, isCorrected: false }
            });
            console.error('❌ Subject correction generation failed:', error);
            throw error;
        }
    }

    private buildSubjectPrompt(subject: any, content: string): string {
        return `
### Context
You are an expert professor generating a detailed correction guide for a **${subject.evaluationType}** assignment.

### Instructions
- **Strictly adhere to the language used in the provided document** (e.g., if the document is in French, respond in French).
- **Ensure high accuracy** in all explanations, solutions, and formatting.
- **Follow structured formatting in Markdown** for clarity and readability.

---

## 📌 Assignment Details
- **Title:** ${subject.title}
- **Type:** ${subject.type}
- **Evaluation Type:** ${subject.evaluationType}
- **Description:** ${subject.description}

### 🔍 Assignment Content:
\`\`\`
${content}
\`\`\`

---

## 📝 Correction Guide Structure

### 1️⃣ OBJECTIVES & LEARNING OUTCOMES
- **Main Educational Goals:** Explain what the student is expected to learn.
- **Technical Skills Evaluated:** Detail the specific programming/database concepts assessed.
- **Success Criteria:** Define the key indicators of a successful solution.

### 2️⃣ SOLUTION OVERVIEW
- **Expected Approach:** Describe the correct way to solve the problem.
- **Key Concepts & Techniques:** Explain the logic, algorithms, or database operations used.
- **Best Practices & Design Patterns:** Include relevant coding principles (e.g., SOLID for OOP, Index Optimization for SQL).

### 3️⃣ EVALUATION CRITERIA (Total: 20 points)
- **✅ Functional Correctness (6 points)**
  - Clearly explain how correctness is assessed.
  - Provide example test cases and expected outputs.

- **✅ Code Structure & Architecture (5 points)**
  - Describe optimal organization.
  - Detail expected modularity (e.g., functions, classes).

- **✅ Best Practices & Optimization (5 points)**
  - Explain expected coding standards and patterns.
  - Identify potential inefficiencies and improvements.

- **✅ Documentation & Readability (4 points)**
  - Specify required comments and documentation.
  - Detail expected readability and maintainability.

### 4️⃣ COMMON ERRORS & TROUBLESHOOTING
- **List frequent mistakes** students might make.
- **Provide debugging tips** and ways to correct them.
- **Explain why certain incorrect approaches fail.**

### 5️⃣ BONUS POINTS OPPORTUNITIES
- **List extra features** that could earn additional credit.
- **Detail possible optimizations** for performance improvement.

---

## ✍️ Response Format
- **Use Markdown formatting** with headers, bullet points, and code blocks.
- **Provide code snippets where necessary**, formatted properly:
\`\`\`${subject.evaluationType.toLowerCase()}
// Example Code
\`\`\`
- **Ensure clarity and professional-level explanation.**

---

### 🚀 FINAL REMINDER
🔹 Your response must be **detailed, structured, and professional**.
🔹 Do **NOT** modify the language of the correction unless explicitly required.
🔹 Always ensure accuracy in **technical explanations and code formatting**.
        `;
    }

    private async generatePDF(title: string, content: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            doc.fontSize(20).text('Correction Guide - ' + title, { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(content);
            doc.end();
        });
    }
}
