import {useAxiosInstance, useNetworkState} from "./intrig-provider";
import {error, init, NetworkState, success} from "./network-state";
import {useCallback} from "react";

export interface GetPetByIdParams {
  id: string
}

export function useGetPetById<T>(key: string = "default"): [NetworkState<T>, (params: GetPetByIdParams) => void, () => void] {
  const networkKey = "GET /pet/{petId}:" + key

  let axios = useAxiosInstance();

  let [state, dispatch] = useNetworkState<NetworkState<T>>(networkKey);

  const execute = useCallback((p: GetPetByIdParams) => {
    let {id, ...params} = p
    axios
      .get(`/pet/${id}`, {
        params
      })
      .then(response => success(response.data))
      .catch(e => {
        if (e.response) {
          error(e.response.data, e.response.status)
        } else {
          error(e)
        }
      })
  }, [axios]);

  return [
    state,
    execute,
    () => dispatch(init())
  ]
}
