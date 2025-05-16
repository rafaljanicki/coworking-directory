/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: "coworking-directory",
      removal: input.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "eu-central-1", // As per your example
        },
        cloudflare: "6.1.2",
      },
    };
  },
  async run() {
    const coworkingSpacesTable = new sst.aws.Dynamo("Spaces", {
      fields: { id: "number" },
      primaryIndex: { hashKey: "id" },
    });
    const reportsTable = new sst.aws.Dynamo("Reports", {
      fields: { id: "number" },
      primaryIndex: { hashKey: "id" },
    });
    const blogPostsTable = new sst.aws.Dynamo("BlogPosts", {
      fields: { id: "string" },
      primaryIndex: { hashKey: "id" },
    });
    const api = new sst.aws.ApiGatewayV2("myApi", {
      link: [coworkingSpacesTable, reportsTable, blogPostsTable],
      cors: true, // Enable CORS for all routes
      domain: {
        name: "api.biuracoworking.pl",
        dns: sst.cloudflare.dns()
      },
      transform: {
        route: {
          // @ts-ignore - Opts type might not be perfectly inferred here but structure is standard for SST
          handler: (args, opts) => {
            if (typeof args.handler === "string") {
              // Ensure handler is defined as a path
              const currentEnv =
                typeof args.environment === "object" ? args.environment : {};
              args.environment = {
                ...currentEnv,
                COWORKING_SPACES_TABLE_NAME: coworkingSpacesTable.name,
                REPORTS_TABLE_NAME: reportsTable.name,
                BLOG_POSTS_TABLE_NAME: blogPostsTable.name,
              };
            }
          },
        },
      },
    });
    // Coworking Spaces
    api.route("GET /spaces", "server/handlers/getSpaces.handler");
    api.route("GET /spaces/{id}", "server/handlers/getSpaceById.handler");
    // Reports
    api.route("POST /reports", "server/handlers/createReport.handler");
    // Blog Posts
    api.route("GET /posts", "server/handlers/getPosts.handler");
    api.route("GET /posts/{slug}", "server/handlers/getPostBySlug.handler");
    // Search
    // Image Upload
    // Auth
    api.route("GET /health", "server/handlers/healthCheck.handler");
    const site = new sst.aws.StaticSite("viteSite", {
      path: ".",
      build: {
        command: "npm run build",
        output: "dist/public", // Output directory relative to 'path'
      },
      environment: {
        // Pass the API endpoint to the Vite app
        VITE_API_URL: api.url,
      },
      invalidation: {
        paths: "all",
        wait: true,
      },
      domain: {
        name: "biuracoworking.pl",
        dns: sst.cloudflare.dns(),
        redirects: ["www.biuracoworking.pl"],
      }
    });
    return {
      ApiEndpoint: api.url,
      SiteUrl: site.url,
    };
  },
});
