import {useNetworkState} from "./intrig-provider";
import {NetworkState} from "./network-state";

export interface GetPetByIdParams extends Record<string, any> {
  id: string
}

export function useGetPetById<T>(key: string = "default"): [NetworkState<T>, (params: GetPetByIdParams) => void, () => void] {
  let [state, dispatch, clear] = useNetworkState<NetworkState<T>>(key, "GET /pet/{petId}", "petstore");

  return [
    state,
    (p) => {
      let {id, ...params} = p
      dispatch({
        method: 'get',
        url: `/pet/${id}`,
        params,
      });
    },
    clear
  ]
}
