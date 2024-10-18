import {useAxiosInstance, useNetworkState} from "./intrig-provider";
import {error, init, NetworkState, success} from "./network-state";
import {useCallback} from "react";

export interface UpdatePetParams {
  id: string
}

export interface UpdatePetBody {
  name?: string;
  status?: string;
  // Add other pet properties as needed
}

export function useUpdatePet<T>(key: string = "default"): [NetworkState<T>, (body: UpdatePetBody, params: UpdatePetParams) => void, () => void] {
  const networkKey = "GET /pet/{petId}:" + key

  let axios = useAxiosInstance();

  let [state, dispatch] = useNetworkState<NetworkState<T>>(networkKey);

  const execute = useCallback((body: UpdatePetBody, p: UpdatePetParams) => {
    let {id, ...params} = p
    axios
      .post(`/pet/${id}`, body, {
        params,
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
