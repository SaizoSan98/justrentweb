
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkManualWagons() {
    const cars = await prisma.car.findMany({
        where: {
            transmission: 'MANUAL',
            OR: [
                { model: { contains: 'Ceed' } },
                { model: { contains: 'Focus' } },
                { model: { contains: '308' } }
            ]
        },
        include: {
            categories: true
        }
    });

    console.log(`Found ${cars.length} potential manual wagons:`);
    cars.forEach(c => {
        console.log(`- ${c.make} ${c.model} (${c.transmission}) [RenteonId: ${c.renteonId}]`);
    });
}

checkManualWagons().finally(() => prisma.$disconnect());
