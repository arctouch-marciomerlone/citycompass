const ENVIRONMENT_READ_HINT =
  "HYGRAPH_MANAGEMENT_TOKEN is missing Management API permission ENVIRONMENT_READ (Read existing environments). Enable it on the Permanent Auth Token, then re-run. The Management SDK and Schema as Code export both need this permission. Docs: https://hygraph.com/docs/getting-started/access-and-permissions/management-api-permissions";

export function rewriteManagementPermissionError(message: string): string {
  if (message.includes("ENVIRONMENT_READ")) {
    return ENVIRONMENT_READ_HINT;
  }
  return message;
}
