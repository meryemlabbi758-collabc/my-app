/**
 * Dataverse Schema Initialization
 * Creates tables and sample data in Dataverse automatically
 */

import { getDataverseHeaders } from './auth'

const DATAVERSE_URL = import.meta.env.VITE_DATAVERSE_URL || ''
const API_URL = `${DATAVERSE_URL}/api/data/v9.2`

interface TableSchema {
  LogicalName: string
  SchemaName: string
  DisplayName: string
  Columns: ColumnDefinition[]
}

interface ColumnDefinition {
  Name: string
  Type: string
  DisplayName: string
  IsRequired?: boolean
  IsUnique?: boolean
  OptionSet?: Record<string, number>
}

/**
 * Create a table in Dataverse
 */
export async function createTable(schema: TableSchema): Promise<any> {
  try {
    const headers = await getDataverseHeaders()

    const tableDefinition = {
      SchemaName: schema.SchemaName,
      DisplayName: schema.DisplayName,
      LogicalName: schema.LogicalName,
      IsActivity: false,
      OwnershipType: 'UserOwned',
      CanTriggerWorkflow: true,
    }

    const response = await fetch(`${API_URL}/EntityDefinitions`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(tableDefinition),
    })

    if (!response.ok && response.status !== 409) {
      console.error(`[DataverseInit] Failed to create table ${schema.SchemaName}:`, response.status)
      return null
    }

    console.log(`[DataverseInit] Table created: ${schema.SchemaName}`)

    // Create columns
    for (const column of schema.Columns) {
      await createColumn(schema.SchemaName, column)
    }

    return true
  } catch (error) {
    console.error(`[DataverseInit] Error creating table:`, error)
    return null
  }
}

/**
 * Create a column in a table
 */
async function createColumn(tableName: string, column: ColumnDefinition): Promise<void> {
  try {
    const headers = await getDataverseHeaders()

    const columnDefinition: any = {
      SchemaName: column.Name,
      DisplayName: column.DisplayName,
      Description: column.DisplayName,
      RequiredLevel: { Value: column.IsRequired ? 'ApplicationRequired' : 'None' },
    }

    // Set column type-specific properties
    switch (column.Type) {
      case 'String':
        columnDefinition.AttributeType = 'String'
        columnDefinition.MaxLength = 100
        break
      case 'Text':
        columnDefinition.AttributeType = 'Memo'
        columnDefinition.MaxLength = 2000
        break
      case 'Integer':
        columnDefinition.AttributeType = 'Integer'
        break
      case 'Decimal':
        columnDefinition.AttributeType = 'Decimal'
        break
      case 'Choice':
        columnDefinition.AttributeType = 'Picklist'
        columnDefinition.OptionSet = {
          Options: Object.entries(column.OptionSet || {}).map(([optionLabel, value]) => ({
            Label: { LocalizedLabels: [{ Label: optionLabel, LanguageCode: 1033 }] },
            Value: value,
          })),
        }
        break
      case 'Lookup':
        columnDefinition.AttributeType = 'Lookup'
        break
      case 'Date':
        columnDefinition.AttributeType = 'DateTime'
        break
      case 'URL':
        columnDefinition.AttributeType = 'String'
        columnDefinition.MaxLength = 2048
        columnDefinition.Format = 'Url'
        break
    }

    const response = await fetch(`${API_URL}/EntityDefinitions(LogicalName='${tableName}')/Attributes`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(columnDefinition),
    })

    if (!response.ok && response.status !== 409) {
      console.warn(`[DataverseInit] Column creation status: ${response.status}`)
    }
  } catch (error) {
    console.error(`[DataverseInit] Error creating column:`, error)
  }
}

/**
 * Initialize all required Dataverse tables
 */
export async function initializeDataverseTables(): Promise<boolean> {
  console.log('[DataverseInit] Starting Dataverse initialization...')

  try {
    // Table 1: Clients (accounts)
    await createTable({
      LogicalName: 'account',
      SchemaName: 'Account',
      DisplayName: 'Client',
      Columns: [
        { Name: 'Name', Type: 'String', DisplayName: 'Client Name', IsRequired: true },
        { Name: 'new_logo', Type: 'String', DisplayName: 'Logo', IsRequired: false },
        { Name: 'websiteurl', Type: 'URL', DisplayName: 'Website', IsRequired: false },
      ],
    })

    // Table 2: Tickets (incidents)
    await createTable({
      LogicalName: 'incident',
      SchemaName: 'Incident',
      DisplayName: 'Ticket',
      Columns: [
        { Name: 'Title', Type: 'String', DisplayName: 'Title', IsRequired: true },
        { Name: 'Description', Type: 'Text', DisplayName: 'Description', IsRequired: false },
        {
          Name: 'Statuscode',
          Type: 'Choice',
          DisplayName: 'Status',
          IsRequired: true,
          OptionSet: {
            'Open': 1,
            'In Progress': 2,
            'Review': 3,
            'Done': 4,
          },
        },
        {
          Name: 'Prioritycode',
          Type: 'Choice',
          DisplayName: 'Priority',
          IsRequired: true,
          OptionSet: {
            'Low': 0,
            'Medium': 1,
            'High': 2,
            'Critical': 3,
          },
        },
        { Name: 'new_environment', Type: 'String', DisplayName: 'Environment', IsRequired: false },
        { Name: 'new_fixversion', Type: 'String', DisplayName: 'Fix Version', IsRequired: false },
        { Name: 'new_buildid', Type: 'String', DisplayName: 'Build ID', IsRequired: false },
        { Name: 'Ownerid', Type: 'Lookup', DisplayName: 'Assignee', IsRequired: false },
        { Name: 'Followupby', Type: 'Date', DisplayName: 'Due Date', IsRequired: false },
      ],
    })

    // Table 3: Environments
    await createTable({
      LogicalName: 'new_environment',
      SchemaName: 'new_environment',
      DisplayName: 'Environment',
      Columns: [
        { Name: 'new_name', Type: 'String', DisplayName: 'Environment Name', IsRequired: true },
        { Name: 'new_buildid', Type: 'String', DisplayName: 'Build ID', IsRequired: false },
        { Name: 'new_fixversion', Type: 'String', DisplayName: 'Fix Version', IsRequired: false },
        { Name: 'new_icon', Type: 'String', DisplayName: 'Icon', IsRequired: false },
        { Name: 'new_color', Type: 'String', DisplayName: 'Color', IsRequired: false },
        { Name: 'new_accountid', Type: 'Lookup', DisplayName: 'Client', IsRequired: true },
      ],
    })

    console.log('[DataverseInit] ✅ Dataverse initialization complete!')
    return true
  } catch (error) {
    console.error('[DataverseInit] ❌ Initialization failed:', error)
    return false
  }
}

/**
 * Add sample data to Dataverse
 */
export async function addSampleData(): Promise<void> {
  try {
    const headers = await getDataverseHeaders()

    // Sample clients
    const clients = [
      { name: 'DXC Technology', new_logo: '🏢' },
      { name: 'Client B', new_logo: '🏭' },
      { name: 'Client C', new_logo: '🏛️' },
    ]

    for (const client of clients) {
      await fetch(`${API_URL}/accounts`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      })
    }

    console.log('[DataverseInit] Sample data added')
  } catch (error) {
    console.error('[DataverseInit] Error adding sample data:', error)
  }
}
