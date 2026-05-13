import { useSelector } from 'react-redux'

export const useSocket = () => {
    return useSelector((state) => state.socket)
}
