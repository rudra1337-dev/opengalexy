import { useSelector } from 'react-redux'

export const useChat = () => {
    return useSelector((state) => state.chats)
}
