import type { Block } from 'payload'

export const MidnightDashboard: Block = {
  slug: 'midnightDashboard',
  interfaceName: 'MidnightDashboardBlock',
  labels: {
    singular: 'Midnight Dashboard',
    plural: 'Midnight Dashboards',
  },
  fields: [
    {
      name: 'networkId',
      type: 'select',
      label: 'Network ID',
      defaultValue: 'TestNet',
      options: [
        {
          label: 'TestNet',
          value: 'TestNet',
        },
        {
          label: 'MainNet',
          value: 'MainNet',
        },
        {
          label: 'DevNet',
          value: 'DevNet',
        },
      ],
      admin: {
        description: 'Select which Midnight network to connect to',
      },
    },
    {
      name: 'loggingLevel',
      type: 'select',
      label: 'Logging Level',
      defaultValue: 'info',
      options: [
        {
          label: 'Debug',
          value: 'debug',
        },
        {
          label: 'Info',
          value: 'info',
        },
        {
          label: 'Warn',
          value: 'warn',
        },
        {
          label: 'Error',
          value: 'error',
        },
      ],
      admin: {
        description: 'Set the logging level for the Midnight components',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Dashboard Title',
      admin: {
        description: 'Optional title to display above the dashboard',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Dashboard Description',
      admin: {
        description: 'Optional description to display above the dashboard',
      },
    },
  ],
}
