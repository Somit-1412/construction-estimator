import Link from "next/link";

const calculationCategories = [
  {
    title: "Foundation",
    description: "Foundation and below-plinth quantity calculations.",
    items: [
      {
        name: "Excavation",
        description: "Earthwork excavation quantities",
        href: "/engineer/calculations/excavation",
      },
      {
        name: "PCC",
        description: "Plain cement concrete quantities",
        href: "/engineer/calculations/pcc",
      },
      {
        name: "Footings",
        description: "Footing concrete, reinforcement and shuttering",
        href: "/engineer/calculations/footings",
      },
    ],
  },
  {
    title: "Structure",
    description: "RCC structural member calculations.",
    items: [
      {
        name: "Columns",
        description: "Column concrete and shuttering",
        href: "/engineer/calculations/columns",
      },
      {
        name: "Beams",
        description: "Beam concrete, reinforcement and shuttering",
        href: "/engineer/calculations/beams",
      },
      {
        name: "Slabs",
        description: "Slab concrete and structural quantities",
        href: "/engineer/calculations/slabs",
      },
    ],
  },
  {
  title: "Masonry",
  description: "Wall and masonry-related calculations.",
  items: [
    {
      name: "Brickwork",
      description:
        "Foundation, plinth and superstructure brickwork",
      href: "/engineer/calculations/brickwork",
    },
    {
      name: "DPC",
      description: "Damp-proof course quantities",
      href: "/engineer/calculations/dpc",
    },
  ],
},
  {
  title: "Finishing",
  description: "Internal and external finishing quantities.",
  items: [
    {
      name: "Internal Plaster",
      description: "Internal wall and ceiling plaster",
      href: "/engineer/calculations/internal-plaster",
    },
    {
      name: "External Plaster",
      description: "External wall plaster",
      href: "/engineer/calculations/external-plaster",
    },
    {
      name: "Flooring",
      description: "Floor and tile quantities",
    },
    {
      name: "Painting",
      description: "Internal and external painting quantities",
    },
  ],
},
  {
    title: "Openings",
    description: "Doors, windows and related work.",
    items: [
      {
        name: "Doors",
        description: "Door quantity and dimensions",
      },
      {
        name: "Windows",
        description: "Window quantity and dimensions",
      },
      {
        name: "Ventilators",
        description: "Ventilator quantity and dimensions",
      },
      {
        name: "Lintels",
        description: "Lintel concrete and reinforcement",
      },
    ],
  },
  {
    title: "Other Works",
    description: "Additional building quantity calculations.",
    items: [
      {
        name: "Filling",
        description: "Earth and plinth filling quantities",
      },
    ],
  },
];

export default function CalculationsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Calculations
        </h1>

        <p className="mt-2 text-zinc-400">
          Select a category to work through the project quantity
          calculations.
        </p>
      </div>

      <div className="space-y-8">
        {calculationCategories.map((category) => (
          <section key={category.title}>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                {category.title}
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                {category.description}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item) =>
                item.href ? (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-left transition hover:border-zinc-700 hover:bg-zinc-800"
                  >
                    <h3 className="font-medium">
                      {item.name}
                    </h3>

                    <p className="mt-2 text-sm text-zinc-400">
                      {item.description}
                    </p>

                    <p className="mt-4 text-sm text-zinc-500">
                      Open calculation →
                    </p>
                  </Link>
                ) : (
                  <div
                    key={item.name}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-left"
                  >
                    <h3 className="font-medium">
                      {item.name}
                    </h3>

                    <p className="mt-2 text-sm text-zinc-400">
                      {item.description}
                    </p>

                    <p className="mt-4 text-sm text-zinc-600">
                      Coming soon
                    </p>
                  </div>
                )
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}