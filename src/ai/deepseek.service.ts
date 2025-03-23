import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SubjectCreatedEvent } from '../subject/events/subject-created.event';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/upload/upload.service';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as pdf from 'pdf-parse';
import { PDFDocument as PDFLib, StandardFonts } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';
import { Multer } from 'multer';

@Injectable()
export class DeepseekService {
    private readonly OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
    private readonly OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';

    constructor(
        private prisma: PrismaService,
        private uploadService: UploadService
    ) { }

    @OnEvent('subject.created')
    async handleSubjectCreated(event: SubjectCreatedEvent) {
        console.log(`🤖 Starting AI correction guide generation for subject: ${event.subject.title}`);
        try {
            const subject = event.subject;

            await this.prisma.subject.update({
                where: { id: subject.id },
                data: { isCorrecting: true }
            });

            // Récupérer le contenu du fichier du sujet
            const fileResponse = await axios.get(subject.fileUrl);
            const subjectContent = fileResponse.data;

            // Générer le guide de correction en utilisant OpenRouter au lieu d'Ollama
            const correctionGuide = await this.generateCorrectionWithOpenRouter(subject, subjectContent);

            // Générer le PDF
            const pdfFilename = `correction_${subject.id}.pdf`;
            const textFilename = `temp_${uuidv4()}.txt`;

            // Sauvegarder le contenu dans un fichier temporaire
            fs.writeFileSync(textFilename, correctionGuide, 'utf-8');

            // Convertir en PDF
            await this.convertTextToPdf(textFilename, pdfFilename);

            // Lire le fichier PDF
            const pdfBuffer = fs.readFileSync(pdfFilename);

            // Créer un objet file pour l'upload
            const correctionFile = {
                buffer: pdfBuffer,
                originalname: `correction_${subject.title}.pdf`,
                mimetype: 'application/pdf'
            };

            // Uploader le fichier
            const uploadResult = await this.uploadService.uploadFile(
                correctionFile as Multer.File,
                'professorCorrectionSubjects'
            );

            // Mettre à jour le sujet dans la base de données
            await this.prisma.subject.update({
                where: { id: subject.id },
                data: {
                    correctionFileUrl: uploadResult,
                    isCorrecting: false,
                    isCorrected: true,
                }
            });

            // Nettoyer les fichiers temporaires
            fs.unlinkSync(textFilename);
            fs.unlinkSync(pdfFilename);

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

    private async generateCorrectionWithOpenRouter(subject: any, content: string): Promise<string> {
        // Préparer le prompt pour OpenRouter
        const payload = {
            model: 'google/gemini-2.0-flash-001', // Utilisation de Google Gemini 2.0 Flash
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

        // Envoyer la requête à l'API OpenRouter
        const openRouterResponse = await axios.post(this.OPENROUTER_API_URL, payload, {
            headers: {
                Authorization: `Bearer ${this.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'http://localhost:3002',
                'X-Title': 'NestJS App',
                'Content-Type': 'application/json',
            },
        });

        // Extraire et nettoyer la réponse
        const resultOfPrompt = openRouterResponse.data.choices[0].message.content.trim();
        const cleanedResponse = resultOfPrompt
            .replace(/<think>.*?<\/think>/gs, '')
            .replace(/\\[()\[\]]/g, '')
            .replace(/\\boxed{(.*?)}/g, '$1');

        return cleanedResponse;
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

    // Fonction pour convertir un fichier texte en PDF
    private async convertTextToPdf(textFilename: string, pdfFilename: string): Promise<void> {
        const pdfDoc = await PDFLib.create();
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const textContent = fs.readFileSync(textFilename, 'utf-8');
        const lines = textContent.split('\n');

        let y = height - 50;
        lines.forEach((line) => {
            if (y < 50) {
                const newPage = pdfDoc.addPage();
                y = height - 50;
            }
            page.drawText(line, { x: 50, y, size: 12, font });
            y -= 15; // Espacement entre les lignes
        });

        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(pdfFilename, pdfBytes);
    }

    // Méthode précédente de génération de PDF utilisée comme alternative
    private generatePDFWithPDFKit(title: string, content: string): Promise<Buffer> {
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