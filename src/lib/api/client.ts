
import type {
    Resource,
    Route,
    Broker,
    Container,
    DataSource,
    NetworkSetting,
    Config,
    DataRequest,
    ServiceApplication,
    Contract,
    SystemLog,
    ApiStatus,
    ExternalService,
    DataspaceConnector,
    RoutingService,
    ConnectorController
} from '@/lib/types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (options.body && (options.method === 'POST' || options.method === 'PUT')) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${options.method} ${url}`, error);
      throw error;
    }
  }

  // Resources API
  resources = {
    getAll: (params?: { providerId?: string; type?: string; accessPolicy?: string }): Promise<Resource[]> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, value);
        });
      }
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return this.request<Resource[]>(`/resources${query}`);
    },
    getById: (id: string): Promise<Resource> => this.request<Resource>(`/resources/${id}`),
    create: (data: any): Promise<Resource> => this.request<Resource>(`/resources`, { method: 'POST', body: data }),
    update: (id: string, data: any): Promise<Resource> => this.request<Resource>(`/resources/${id}`, { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> => this.request<void>(`/resources/${id}`, { method: 'DELETE' })
  };

  // Routes API
  routes = {
    getAll: (params?: { providerId?: string; consumerId?: string; status?: string }): Promise<Route[]> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, value);
        });
      }
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return this.request<Route[]>(`/routes${query}`);
    },
    getById: (id: string): Promise<Route> => this.request<Route>(`/routes/${id}`),
    create: (data: any): Promise<Route> => this.request<Route>(`/routes`, { method: 'POST', body: data }),
    update: (id: string, data: any): Promise<Route> => this.request<Route>(`/routes/${id}`, { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> => this.request<void>(`/routes/${id}`, { method: 'DELETE' })
  };

  // Brokers API
  brokers = {
    getAll: (params?: { validationStatus?: string }): Promise<Broker[]> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, value);
        });
      }
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return this.request<Broker[]>(`/brokers${query}`);
    },
    getById: (id: string): Promise<Broker> => this.request<Broker>(`/brokers/${id}`),
    create: (data: any): Promise<Broker> => this.request<Broker>(`/brokers`, { method: 'POST', body: data }),
    update: (id: string, data: any): Promise<Broker> => this.request<Broker>(`/brokers/${id}`, { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> => this.request<void>(`/brokers/${id}`, { method: 'DELETE' })
  };

  // Containers API
  containers = {
    getAll: (params?: { status?: string }): Promise<Container[]> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, value);
        });
      }
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return this.request<Container[]>(`/containers${query}`);
    },
    getById: (id: string): Promise<Container> => this.request<Container>(`/containers/${id}`),
    create: (data: any): Promise<Container> => this.request<Container>(`/containers`, { method: 'POST', body: data }),
    update: (id: string, data: any): Promise<Container> => this.request<Container>(`/containers/${id}`, { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> => this.request<void>(`/containers/${id}`, { method: 'DELETE' }),
    action: (id: string, action: 'start' | 'stop' | 'restart'): Promise<Container> =>
      this.request<Container>(`/containers/${id}/actions`, { method: 'POST', body: { action } })
  };

  // Data Sources API
  dataSources = {
    getAll: (params?: { type?: string; status?: string }): Promise<DataSource[]> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, value);
        });
      }
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return this.request<DataSource[]>(`/data-sources${query}`);
    },
    getById: (id: string): Promise<DataSource> => this.request<DataSource>(`/data-sources/${id}`),
    create: (data: any): Promise<DataSource> => this.request<DataSource>(`/data-sources`, { method: 'POST', body: data }),
    update: (id: string, data: any): Promise<DataSource> => this.request<DataSource>(`/data-sources/${id}`, { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> => this.request<void>(`/data-sources/${id}`, { method: 'DELETE' }),
    testConnection: (id: string): Promise<{ success: boolean; message: string }> => this.request(`/data-sources/${id}/test`, { method: 'POST' })
  };

  // Network Settings API
  networkSettings = {
    getAll: (params?: { providerId?: string; protocol?: string; status?: string }): Promise<NetworkSetting[]> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, value);
        });
      }
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return this.request<NetworkSetting[]>(`/network-settings${query}`);
    },
    getById: (id: string): Promise<NetworkSetting> => this.request<NetworkSetting>(`/network-settings/${id}`),
    create: (data: any): Promise<NetworkSetting> => this.request<NetworkSetting>(`/network-settings`, { method: 'POST', body: data }),
    update: (id: string, data: any): Promise<NetworkSetting> => this.request<NetworkSetting>(`/network-settings/${id}`, { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> => this.request<void>(`/network-settings/${id}`, { method: 'DELETE' })
  };

  // Configs API
  configs = {
    getAll: (params?: { category?: string; secrets?: boolean }): Promise<Config[]> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) searchParams.append(key, value.toString());
        });
      }
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return this.request<Config[]>(`/configs${query}`);
    },
    getById: (id: string): Promise<Config> => this.request<Config>(`/configs/${id}`),
    create: (data: any): Promise<Config> => this.request<Config>(`/configs`, { method: 'POST', body: data }),
    update: (id: string, data: any): Promise<Config> => this.request<Config>(`/configs/${id}`, { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> => this.request<void>(`/configs/${id}`, { method: 'DELETE' })
  };

  // Requests API
  requests = {
    getAll: (params?: { requesterId?: string; providerId?: string; status?: string; requestType?: string }): Promise<DataRequest[]> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, value);
        });
      }
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return this.request<DataRequest[]>(`/requests${query}`);
    },
    getById: (id: string): Promise<DataRequest> => this.request<DataRequest>(`/requests/${id}`),
    create: (data: any): Promise<DataRequest> => this.request<DataRequest>(`/requests`, { method: 'POST', body: data }),
    update: (id: string, data: any): Promise<DataRequest> => this.request<DataRequest>(`/requests/${id}`, { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> => this.request<void>(`/requests/${id}`, { method: 'DELETE' })
  };

  // Service Applications API
  serviceApplications = {
    getAll: (params?: { providerId?: string; status?: string }): Promise<ServiceApplication[]> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, value);
        });
      }
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return this.request<ServiceApplication[]>(`/service-applications${query}`);
    },
    getById: (id: string): Promise<ServiceApplication> => this.request<ServiceApplication>(`/service-applications/${id}`),
    create: (data: any): Promise<ServiceApplication> => this.request<ServiceApplication>(`/service-applications`, { method: 'POST', body: data }),
    update: (id: string, data: any): Promise<ServiceApplication> => this.request<ServiceApplication>(`/service-applications/${id}`, { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> => this.request<void>(`/service-applications/${id}`, { method: 'DELETE' }),
    healthCheck: (id: string): Promise<{ success: boolean; message: string }> => this.request(`/service-applications/${id}/health`, { method: 'POST' })
  };

  // Contracts API
  contracts = {
    getAll: (params?: { providerId?: string; consumerId?: string; status?: string; contractType?: string }): Promise<Contract[]> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, value);
        });
      }
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return this.request<Contract[]>(`/contracts${query}`);
    },
    getById: (id: string): Promise<Contract> => this.request<Contract>(`/contracts/${id}`),
    create: (data: any): Promise<Contract> => this.request<Contract>(`/contracts`, { method: 'POST', body: data }),
    update: (id: string, data: any): Promise<Contract> => this.request<Contract>(`/contracts/${id}`, { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> => this.request<void>(`/contracts/${id}`, { method: 'DELETE' }),
    sign: (id: string): Promise<Contract> => this.request<Contract>(`/contracts/${id}/sign`, { method: 'POST' }),
    terminate: (id: string): Promise<Contract> => this.request<Contract>(`/contracts/${id}/terminate`, { method: 'POST' })
  };

  // System Logs API
  systemLogs = {
    getAll: (params?: { service?: string; level?: string; userId?: string; limit?: number }): Promise<SystemLog[]> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) searchParams.append(key, value.toString());
        });
      }
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return this.request<SystemLog[]>(`/system-logs${query}`);
    },
    create: (data: any): Promise<SystemLog> => this.request<SystemLog>(`/system-logs`, { method: 'POST', body: data })
  };

  // API Status API
  apiStatus = {
    getAll: (params?: { serviceName?: string; status?: string }): Promise<ApiStatus[]> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, value);
        });
      }
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return this.request<ApiStatus[]>(`/api-status${query}`);
    },
    create: (data: any): Promise<ApiStatus> => this.request<ApiStatus>(`/api-status`, { method: 'POST', body: data })
  };

  // External Services API
  externalServices = {
    getAll: (params?: { serviceType?: string; status?: string; authType?: string }): Promise<ExternalService[]> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, value);
        });
      }
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return this.request<ExternalService[]>(`/external-services${query}`);
    },
    getById: (id: string): Promise<ExternalService> => this.request<ExternalService>(`/external-services/${id}`),
    create: (data: any): Promise<ExternalService> => this.request<ExternalService>(`/external-services`, { method: 'POST', body: data }),
    update: (id: string, data: any): Promise<ExternalService> => this.request<ExternalService>(`/external-services/${id}`, { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> => this.request<void>(`/external-services/${id}`, { method: 'DELETE' })
  };

  // Dataspace Connectors API
  dataspaceConnectors = {
    getAll: (params?: { status?: string; version?: string }): Promise<DataspaceConnector[]> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, value);
        });
      }
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return this.request<DataspaceConnector[]>(`/dataspace-connectors${query}`);
    },
    getById: (id: string): Promise<DataspaceConnector> => this.request<DataspaceConnector>(`/dataspace-connectors/${id}`),
    register: (data: any): Promise<DataspaceConnector> => this.request<DataspaceConnector>(`/dataspace-connectors`, { method: 'POST', body: data }),
    update: (id: string, data: any): Promise<DataspaceConnector> => this.request<DataspaceConnector>(`/dataspace-connectors/${id}`, { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> => this.request<void>(`/dataspace-connectors/${id}`, { method: 'DELETE' })
  };

  // Routing Services API
  routingServices = {
    getAll: (params?: { status?: string; routingType?: string; loadBalancing?: string }): Promise<RoutingService[]> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, value);
        });
      }
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return this.request<RoutingService[]>(`/routing-services${query}`);
    },
    getById: (id: string): Promise<RoutingService> => this.request<RoutingService>(`/routing-services/${id}`),
    create: (data: any): Promise<RoutingService> => this.request<RoutingService>(`/routing-services`, { method: 'POST', body: data }),
    update: (id: string, data: any): Promise<RoutingService> => this.request<RoutingService>(`/routing-services/${id}`, { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> => this.request<void>(`/routing-services/${id}`, { method: 'DELETE' })
  };

  // Connector Controllers API
  connectorControllers = {
    getAll: (params?: { status?: string; controllerType?: string; ipAddress?: string }): Promise<ConnectorController[]> => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, value);
        });
      }
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return this.request<ConnectorController[]>(`/connector-controllers${query}`);
    },
    getById: (id: string): Promise<ConnectorController> => this.request<ConnectorController>(`/connector-controllers/${id}`),
    create: (data: any): Promise<ConnectorController> => this.request<ConnectorController>(`/connector-controllers`, { method: 'POST', body: data }),
    update: (id: string, data: any): Promise<ConnectorController> => this.request<ConnectorController>(`/connector-controllers/${id}`, { method: 'PUT', body: data }),
    delete: (id: string): Promise<void> => this.request<void>(`/connector-controllers/${id}`, { method: 'DELETE' })
  };
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types for better TypeScript support
export type { ApiOptions };
export default ApiClient;
