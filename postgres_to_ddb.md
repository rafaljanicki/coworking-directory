Refactor: convert storage to DynamoDB instead of PostgreSQL

Read files like:
- shared/schema.ts
- server/storage.ts
- package.json
- server/template.yaml

The template.yaml should be used to create a SAM template of the DynamoDB tables

Write what you changed or tried to do to final_output.md