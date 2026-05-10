import Group from '../models/Group.model.js'
import Room from '../models/Room.model.js'
import generateInviteLink from '../utils/generateLink.js'
import { getExpiryDate } from '../utils/timeHelper.js'

// @desc    Create a group
// @route   POST /api/groups
const createGroup = async (req, res) => {
    try {
        const { name, description, isPublic, isTemp, duration } = req.body

        // create the room for this group first
        const room = await Room.create({
            type: 'group',
            members: [req.user._id],
            isTemp: isTemp || false,
            expiresAt: isTemp ? getExpiryDate(duration) : null
        })

        // create the group
        const group = await Group.create({
            name,
            description: description || '',
            room: room._id,
            createdBy: req.user._id,
            isPublic: isPublic || false,
            inviteCode: generateInviteLink(),
            isTemp: isTemp || false,
            expiresAt: isTemp ? getExpiryDate(duration) : null,
            members: [{ user: req.user._id, role: 'admin' }]
        })

        // link group back to room
        await Room.findByIdAndUpdate(room._id, { group: group._id })

        res.status(201).json({ success: true, group })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Get all public groups (discover)
// @route   GET /api/groups/discover
const discoverGroups = async (req, res) => {
    try {
        const groups = await Group.find({ isPublic: true })
            .populate('createdBy', 'username avatar')
            .sort({ createdAt: -1 })
            .limit(20)

        res.json({ success: true, groups })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Join group via invite code
// @route   POST /api/groups/join/:inviteCode
const joinGroup = async (req, res) => {
    try {
        const group = await Group.findOne({ inviteCode: req.params.inviteCode })
        if (!group) return res.status(404).json({ message: 'Invalid invite link' })

        // check if already a member
        const alreadyMember = group.members.some(m => m.user.toString() === req.user._id.toString())
        if (alreadyMember) return res.status(400).json({ message: 'Already a member' })

        // add to group members
        group.members.push({ user: req.user._id, role: 'member' })
        await group.save()

        // add to room members
        await Room.findByIdAndUpdate(group.room, {
            $addToSet: { members: req.user._id }
        })

        res.json({ success: true, group })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Get my groups
// @route   GET /api/groups/mine
const getMyGroups = async (req, res) => {
    try {
        const groups = await Group.find({ 'members.user': req.user._id })
            .populate('room', 'lastMessage')
            .sort({ updatedAt: -1 })

        res.json({ success: true, groups })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}





// @desc    Set group as temp (admin only)
// @route   PATCH /api/groups/:id/temp
const setGroupTemp = async (req, res) => {
    try {
        const { duration } = req.body

        const group = await Group.findById(req.params.id)
        if (!group) return res.status(404).json({ message: 'Group not found' })

        // check if user is admin of this group
        const member = group.members.find(m => m.user.toString() === req.user._id.toString())

        if (!member) {
            return res.status(403).json({ message: 'You are not a member of this group' })
        }

        if (member.role !== 'admin') {
            return res.status(403).json({ message: 'Only group admin can change temp settings' })
        }

        // update group temp
        group.isTemp = true
        group.expiresAt = getExpiryDate(duration)
        await group.save()

        // also update the group's room temp
        await Room.findByIdAndUpdate(group.room, {
            isTemp: true,
            expiresAt: getExpiryDate(duration)
        })

        res.json({ success: true, message: `Group will expire in ${duration}`, group })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export { createGroup, discoverGroups, joinGroup, getMyGroups, setGroupTemp }