## 2025-04-18 - Add DynamoDB tables to the template.yaml. Plan the tables based on the shared/schema.ts file.

- Added AWS::Serverless::SimpleTable resources in server/template.yaml for:
  - CoworkingSpacesTable
  - ServicesTable
  - SpaceServicesTable
  - PricingPackagesTable
  - ReportsTable
- Updated ApiFunction environment variables to reference the new DynamoDB tables.
- Tables use numeric 'id' partition key matching serial PK definitions in shared/schema.ts.
- References: AWS SAM SimpleTable documentation, shared/schema.ts.
