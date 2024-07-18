import { ROLE_STUDENT, ROLE_TEACHER } from "src/constants/constant"

const navigation = () => {
  return [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: 'bx:bxs-dashboard',
      action: 'manage',
      subject: ROLE_TEACHER
    },

    {
      title: 'Sessions',
      path: '/sessions',
      icon: 'bx:bxl-microsoft-teams',
      action: 'manage',
      subject: ROLE_TEACHER
    },
    {
      title: 'Classrooms',
      path: '/classroom',
      icon: 'bx:bxl-microsoft-teams',
      action: 'manage',
      subject: ROLE_STUDENT
    },
    {
      title: 'My Calendar',
      path: '/calendar',
      icon: 'bx:bxs-calendar-event',
      action: 'manage',
      subject: ROLE_TEACHER
    },
    {
      title: 'Chats',
      path: '/chat',
      icon: 'bx:bxs-message-rounded-dots',
      action: 'manage',
      subject: ROLE_TEACHER
    },
    {
      title: 'Chats',
      path: '/chat',
      icon: 'bx:bxs-message-rounded-dots',
      action: 'manage',
      subject: ROLE_STUDENT
    },

  ]
}

export default navigation
