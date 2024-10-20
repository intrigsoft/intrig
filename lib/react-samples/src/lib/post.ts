import {useAxiosInstance, useNetworkState} from "./intrig-provider";
import {NetworkState} from "./network-state";

export interface UpdatePetParams {
  id: string
}

export interface UpdatePetBody {
  name?: string;
  status?: string;
  // Add other pet properties as needed
}

export function useUpdatePet<T>(key: string = "default"): [NetworkState<T>, (body: UpdatePetBody, params: UpdatePetParams) => void, () => void] {
  useAxiosInstance("petstore");
  let [state, dispatch, clear] = useNetworkState<NetworkState<T>>(key, "UPDATE /pet/{petId}", "petstore");

  return [
    state,
    (data: UpdatePetBody, p: UpdatePetParams) => {
      let {id, ...params} = p
      dispatch({
        method: 'post',
        url: `/pet/${id}`,
        params,
        data
      })
    },
    clear
  ]
}
