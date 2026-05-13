import api from './api'

export const groupService = {
    // Create a group
    createGroup: (data) => api.post('/groups', data),

    // Get my groups
    getMyGroups: () => api.get('/groups/mine'),

    // Get public groups (discover)
    discoverGroups: () => api.get('/groups/discover'),

    // Join group via invite code
    joinGroup: (inviteCode) => api.post(`/groups/join/${inviteCode}`),

    // Set group as temporary (admin only)
    setGroupTemp: (groupId, duration) =>
        api.patch(`/groups/${groupId}/temp`, { duration })
}
