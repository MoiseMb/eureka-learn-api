import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    try {
        const hashedPassword = await hash('passer', 12);
        const superAdmin = await prisma.user.upsert({
            where: { email: 'admin@admin.com' },
            update: {},
            create: {
                email: 'admin@admin.com',
                firstName: ' Pape Moussa',
                lastName: 'MBENGUE',
                password: hashedPassword,
                role: Role.ADMIN,
            },
        });

        console.log('Super Admin créé:', superAdmin);


    } catch (error) {
        console.error('Erreur lors du seeding:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });