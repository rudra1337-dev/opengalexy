import { useSelector } from 'react-redux'

export const useMessages = () => {
    return useSelector((state) => state.messages)
}
