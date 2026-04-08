data "external_schema" "prisma" {
    program = [ 
      "npx",
      "prisma",
      "migrate",
      "diff",
      "--from-empty",
      "--to-schema-datamodel",
      "./schema.prisma",
      "--script"
    ]
}

env "local" {
  schema {
    src = data.external_schema.prisma.url
  }
}