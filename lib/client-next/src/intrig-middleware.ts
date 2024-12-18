import axios from 'axios';

export async function getAxiosInstance(key: string) {
  // @ts-ignore
  let insightHook;
  try {
    // @ts-ignore
    insightHook = require('intrig-hook');
  } catch (error) {
    console.warn('intrig-hook is not available. Proceeding without request interceptor.', error);
  }

  const baseURL = process.env[`${key.toUpperCase()}_API_URL`];
  if (!baseURL) {
    throw new Error(`Environment variable ${key.toUpperCase()}_API_URL is not defined.`);
  }

  const axiosInstance = axios.create({ baseURL });

  if (insightHook?.requestInterceptor) {
    axiosInstance.interceptors.request.use(insightHook.requestInterceptor);
  }

  return axiosInstance;
}
