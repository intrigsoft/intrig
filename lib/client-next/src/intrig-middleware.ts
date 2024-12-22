import axios from 'axios';
let insightHook = await import('intrig-hook');

export async function getAxiosInstance(key: string) {
  const baseURL = process.env[`${key.toUpperCase()}_API_URL`];
  if (!baseURL) {
    throw new Error(
      `Environment variable ${key.toUpperCase()}_API_URL is not defined.`
    );
  }

  const axiosInstance = axios.create({ baseURL });

  if (insightHook?.requestInterceptor) {
    axiosInstance.interceptors.request.use(insightHook.requestInterceptor);
  }

  return axiosInstance;
}
