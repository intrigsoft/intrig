import axios from 'axios';
// @ts-ignore
const insightHook = await import('intrig-hook');


export function getAxiosInstance(key: string) {
  let axiosInstance = axios.create({
    baseURL: process.env[`${key.toUpperCase()}_API_URL`],
  });

  if (insightHook) {
    axiosInstance.interceptors.request.use(insightHook.requestInterceptor);
  }

  return axiosInstance;
}


