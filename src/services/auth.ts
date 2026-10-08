/**
 * Authentication Service for Dataverse
 * Power Apps handles authentication automatically
 */

export async function getDataverseAuthToken(): Promise<string> {
  // When running in Power Apps, Power Platform provides authentication context automatically
  // The Dataverse API will use the current user's authentication from Power Apps
  return ''
}

export async function getDataverseHeaders(): Promise<Record<string, string>> {
  return {
    'Content-Type': 'application/json',
    'OData-MaxVersion': '4.0',
    'OData-Version': '4.0',
    'Accept': 'application/json',
    // Power Apps handles authorization automatically
    // No need to add Authorization header - Power Platform will add it
  }
}
