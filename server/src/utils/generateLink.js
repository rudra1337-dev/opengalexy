import { v4 as uuidv4 } from 'uuid'

const generateInviteLink = () => {
    return uuidv4().replace(/-/g, '').substring(0, 12)  // ← short unique code
}

export default generateInviteLink