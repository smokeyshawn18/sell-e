sell-e/
└── backend/
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── nodemon.json # dev only
├── drizzle.config.ts # DB ORM config
└── src/
├── index.ts # entry point: app + server + clerk middleware
├── config/
│ └── env.ts # env vars + other configs
├── controllers/ # route handlers (thin, calls services)
│ ├── commentController.ts
│ ├── notificationController.ts
│ ├── productController.ts
│ └── userController.ts
├── services/ # business logic
│ ├── commentService.ts
│ ├── notificationService.ts
│ ├── productService.ts
│ └── userService.ts
├── db/
│ ├── index.ts # DB connection
│ ├── schema.ts # Drizzle ORM schemas
│ └── queries/ # resource-specific queries
│ ├── commentQueries.ts
│ ├── notificationQueries.ts
│ ├── productQueries.ts
│ └── userQueries.ts
├── routes/ # routes only
│ ├── commentRoutes.ts
│ ├── notificationRoutes.ts
│ ├── productRoutes.ts
│ ├── userRoutes.ts
│ └── index.ts # aggregate all routes
├── types/ # TypeScript global types
│ └── global.d.ts
└── utils/ # helpers/util functions
└── logger.ts
