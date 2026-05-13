import { useSelector } from 'react-redux'

export const useCall = () => {
    return useSelector((state) => state.call)
}
