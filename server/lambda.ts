// This file is maintained for backward compatibility
// and re-exports handlers from individual files

// Re-export the individual handlers
export { handler as healthCheck } from './handlers/healthCheck';
export { handler as getSpaces } from './handlers/getSpaces';
export { handler as getSpaceById } from './handlers/getSpaceById';
export { handler as getServices } from './handlers/getServices';
export { handler as getSpaceServices } from './handlers/getSpaceServices';
export { handler as getSpacePricing } from './handlers/getSpacePricing';
export { handler as createReport } from './handlers/createReport';
export { handler as handleOptions } from './handlers/handleOptions';