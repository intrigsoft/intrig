"use server"
import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

type Interceptor = {
  request?: (
    config: InternalAxiosRequestConfig
  ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
  requestError?: (error: any) => any | Promise<any>;
  response?: (
    response: AxiosResponse
  ) => AxiosResponse | Promise<AxiosResponse>;
  responseError?: (error: any) => any | Promise<any>;
};

type EjectedInterceptor = {
  requestId?: number;
  responseId?: number;
};

const axiosInstances: Record<string, AxiosInstance> = {};
const globalInterceptors: Interceptor[] = [];
const ejectedInterceptors: Record<string, EjectedInterceptor[]> = {};

export function getAxiosInstance(key: string) {
  if (!axiosInstances[key]) {
    const instance = axios.create();
    applyGlobalInterceptors(instance, key);
    axiosInstances[key] = instance;
  }
  return axiosInstances[key];
}

export function addInterceptor(
  instanceKey: string | 'global',
  interceptor: Interceptor
) {
  if (instanceKey === 'global') {
    globalInterceptors.push(interceptor);
    Object.keys(axiosInstances).forEach((key) =>
      applyInterceptor(axiosInstances[key], interceptor, key)
    );
  } else {
    const instance = getAxiosInstance(instanceKey);
    applyInterceptor(instance, interceptor, instanceKey);
  }
}

export function clearInterceptors(instanceKey: string | 'global') {
  if (instanceKey === 'global') {
    globalInterceptors.length = 0;
    Object.keys(axiosInstances).forEach((key) => ejectInterceptors(key));
  } else {
    ejectInterceptors(instanceKey);
  }
}

function applyInterceptor(
  instance: AxiosInstance,
  interceptor: Interceptor,
  key: string
) {
  const ejected = ejectedInterceptors[key] || [];

  if (interceptor.request) {
    const requestId = instance.interceptors.request.use(
      interceptor.request,
      interceptor.requestError
    );
    ejected.push({ requestId });
  }
  if (interceptor.response) {
    const responseId = instance.interceptors.response.use(
      interceptor.response,
      interceptor.responseError
    );
    ejected.push({ responseId });
  }

  ejectedInterceptors[key] = ejected;
}

function applyGlobalInterceptors(instance: AxiosInstance, key: string) {
  globalInterceptors.forEach((interceptor) =>
    applyInterceptor(instance, interceptor, key)
  );
}

function ejectInterceptors(key: string) {
  const instance = axiosInstances[key];
  const ejected = ejectedInterceptors[key] || [];

  ejected.forEach(({ requestId, responseId }) => {
    if (requestId !== undefined) {
      instance.interceptors.request.eject(requestId);
    }
    if (responseId !== undefined) {
      instance.interceptors.response.eject(responseId);
    }
  });

  ejectedInterceptors[key] = [];
}
