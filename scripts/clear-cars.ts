
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Deleting ALL cars...");
  await prisma.car.deleteMany({});
  console.log("All cars deleted.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
