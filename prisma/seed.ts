import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const materials = [
  {
    name: "Cement",
    category: "Concrete & Masonry",
    unit: "BAG" as const,
  },
  {
    name: "Sand",
    category: "Concrete & Masonry",
    unit: "CUBIC_METER" as const,
  },
  {
    name: "Aggregate",
    category: "Concrete",
    unit: "CUBIC_METER" as const,
  },
  {
    name: "Bricks",
    category: "Masonry",
    unit: "NUMBER" as const,
  },
  {
    name: "Reinforcement Steel",
    category: "Reinforcement",
    unit: "KILOGRAM" as const,
  },
  {
    name: "Floor Tiles",
    category: "Flooring",
    unit: "SQUARE_METER" as const,
  },
  {
    name: "Paint",
    category: "Finishing",
    unit: "LITRE" as const,
  },
];

async function main() {
  for (const material of materials) {
    await prisma.material.upsert({
      where: {
        name: material.name,
      },
      update: {},
      create: material,
    });
  }

  console.log("Material master data seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });