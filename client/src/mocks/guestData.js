const guestUserId = 'guest-local-user'

const now = Date.now()
const isoMinutesAgo = (minutes) =>
    new Date(now - minutes * 60 * 1000).toISOString()
const isoHoursAgo = (hours) => new Date(now - hours * 60 * 60 * 1000).toISOString()

export const guestUser = {
    _id: guestUserId,
    displayName: 'Guest Explorer',
    username: 'guest_explorer',
    email: 'Sign in to unlock your account',
    usernameSet: true,
    burnAfterRead: false,
    defaultMessageMode: 'permanent',
    isTemp: false,
    avatar: ''
}

const contacts = {
    rhea: {
        _id: 'guest-contact-rhea',
        username: 'rhea',
        displayName: 'Rhea Sol',
        isOnline: true,
        lastSeen: isoMinutesAgo(3)
    },
    atlas: {
        _id: 'guest-contact-atlas',
        username: 'atlas',
        displayName: 'Atlas Reed',
        isOnline: false,
        lastSeen: isoHoursAgo(4)
    },
    noa: {
        _id: 'guest-contact-noa',
        username: 'noa',
        displayName: 'Noa Vale',
        isOnline: true,
        lastSeen: isoMinutesAgo(12)
    }
}

export const guestChats = [
    {
        _id: 'guest-room-rhea',
        members: [guestUser, contacts.rhea],
        unreadCount: 2,
        updatedAt: isoMinutesAgo(5),
        lastMessage: {
            content: 'Tap around freely. Guest mode keeps this local only.',
            sender: contacts.rhea,
            sentAt: isoMinutesAgo(5)
        }
    },
    {
        _id: 'guest-room-atlas',
        members: [guestUser, contacts.atlas],
        unreadCount: 0,
        updatedAt: isoHoursAgo(2),
        lastMessage: {
            content: 'Nearby Share preview looks polished now.',
            sender: guestUser,
            sentAt: isoHoursAgo(2)
        }
    },
    {
        _id: 'guest-room-noa',
        members: [guestUser, contacts.noa],
        unreadCount: 1,
        updatedAt: isoHoursAgo(10),
        lastMessage: {
            content: 'Calls are preview-only until you sign in.',
            sender: contacts.noa,
            sentAt: isoHoursAgo(10)
        }
    }
]

export const guestChatMessages = {
    'guest-room-rhea': [
        {
            _id: 'guest-message-rhea-1',
            roomId: 'guest-room-rhea',
            sender: contacts.rhea,
            content: 'Welcome to guest mode. This conversation is just demo data.',
            isTemp: false,
            readBy: [guestUserId],
            createdAt: isoHoursAgo(6)
        },
        {
            _id: 'guest-message-rhea-2',
            roomId: 'guest-room-rhea',
            sender: guestUser,
            content: 'Perfect. I only want to explore the UI first.',
            isTemp: false,
            readBy: [guestUserId, contacts.rhea._id],
            createdAt: isoHoursAgo(6)
        },
        {
            _id: 'guest-message-rhea-3',
            roomId: 'guest-room-rhea',
            sender: contacts.rhea,
            content: 'Try the tabs, filters, nearby cards, and profile settings.',
            isTemp: true,
            expiresAt: new Date(now + 45 * 60 * 1000).toISOString(),
            readBy: [guestUserId],
            createdAt: isoMinutesAgo(50)
        }
    ],
    'guest-room-atlas': [
        {
            _id: 'guest-message-atlas-1',
            roomId: 'guest-room-atlas',
            sender: guestUser,
            content: 'The layout should feel complete even without backend access.',
            isTemp: false,
            readBy: [guestUserId],
            createdAt: isoHoursAgo(2)
        },
        {
            _id: 'guest-message-atlas-2',
            roomId: 'guest-room-atlas',
            sender: contacts.atlas,
            content: 'Exactly. Sign in only when you are ready to sync real data.',
            isTemp: false,
            readBy: [guestUserId],
            createdAt: isoHoursAgo(2)
        }
    ],
    'guest-room-noa': [
        {
            _id: 'guest-message-noa-1',
            roomId: 'guest-room-noa',
            sender: contacts.noa,
            content: 'Calls, groups, and nearby all stay local in guest mode.',
            isTemp: false,
            readBy: [guestUserId],
            createdAt: isoHoursAgo(10)
        }
    ]
}

export const guestGroups = [
    {
        _id: 'guest-group-design',
        name: 'Design Orbit',
        isPublic: true,
        isTemp: false,
        inviteCode: 'DESIGN-ORBIT',
        room: {
            _id: 'guest-group-room-design',
            lastMessage: {
                content: 'Moodboards, UI reviews, and launch polish all in one place.'
            }
        },
        members: [
            { user: guestUser, role: 'member' },
            {
                user: {
                    _id: 'guest-group-host-lina',
                    username: 'lina',
                    displayName: 'Lina Hart'
                },
                role: 'admin'
            }
        ]
    },
    {
        _id: 'guest-group-builders',
        name: 'Builders Lounge',
        isPublic: false,
        isTemp: true,
        inviteCode: 'BUILDERS-LOUNGE',
        room: {
            _id: 'guest-group-room-builders',
            lastMessage: {
                content: 'Prototype ideas, experiments, and temporary drops.'
            }
        },
        members: [
            { user: guestUser, role: 'member' },
            {
                user: {
                    _id: 'guest-group-host-omar',
                    username: 'omar',
                    displayName: 'Omar West'
                },
                role: 'admin'
            }
        ]
    }
]

export const guestPublicGroups = [
    ...guestGroups,
    {
        _id: 'guest-group-nearby',
        name: 'Nearby Lab',
        description: 'Preview device discovery, transfer cards, and share flows.',
        isPublic: true,
        isTemp: false,
        inviteCode: 'NEARBY-LAB',
        members: [
            { user: { _id: 'guest-public-1' }, role: 'member' },
            { user: { _id: 'guest-public-2' }, role: 'member' },
            { user: { _id: 'guest-public-3' }, role: 'member' }
        ]
    }
]

export const guestGroupMessages = {
    'guest-group-design': [
        {
            _id: 'guest-group-message-1',
            roomId: 'guest-group-room-design',
            sender: {
                _id: 'guest-group-host-lina',
                username: 'lina',
                displayName: 'Lina Hart'
            },
            content: 'Welcome to the public preview thread.',
            isTemp: false,
            readBy: [guestUserId],
            createdAt: isoHoursAgo(12)
        },
        {
            _id: 'guest-group-message-2',
            roomId: 'guest-group-room-design',
            sender: guestUser,
            content: 'Guest mode makes this feel safe to explore.',
            isTemp: false,
            readBy: [guestUserId],
            createdAt: isoHoursAgo(11)
        }
    ],
    'guest-group-builders': [
        {
            _id: 'guest-group-message-3',
            roomId: 'guest-group-room-builders',
            sender: {
                _id: 'guest-group-host-omar',
                username: 'omar',
                displayName: 'Omar West'
            },
            content: 'This temporary room showcases layout and message styling only.',
            isTemp: true,
            expiresAt: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
            readBy: [guestUserId],
            createdAt: isoHoursAgo(5)
        }
    ]
}

export const guestNearbyDevices = [
    { userId: 'guest-nearby-rhea', username: 'rhea' },
    { userId: 'guest-nearby-atlas', username: 'atlas' },
    { userId: 'guest-nearby-noa', username: 'noa' }
]

export const guestTransfers = [
    {
        id: 'guest-transfer-1',
        fileName: 'launch-plan.pdf',
        fileSize: 2.3 * 1024 * 1024,
        status: 'done',
        direction: 'outgoing',
        peerUsername: 'rhea',
        progress: 100
    },
    {
        id: 'guest-transfer-2',
        fileName: 'ui-notes.txt',
        fileSize: 12 * 1024,
        status: 'receiving',
        direction: 'incoming',
        peerUsername: 'atlas',
        progress: 64
    }
]
