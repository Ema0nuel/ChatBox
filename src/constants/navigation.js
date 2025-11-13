import {
    LuLayoutDashboard,
    LuMessageSquare,
    LuUsers,
    LuSettings,
    LuBriefcase,
    LuFileText
} from 'react-icons/lu';

export const navigationItems = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LuLayoutDashboard,
        path: '/admin/dashboard'
    },
    {
        id: 'conversations',
        label: 'Conversations',
        icon: LuMessageSquare,
        path: '/admin/conversations'
    },
    {
        id: 'active-users',
        label: 'Active Users',
        icon: LuUsers,
        path: '/admin/users'
    },

    {
        id: 'settings',
        label: 'Settings',
        icon: LuSettings,
        path: '/admin/settings'
    }
];