import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { ROLE_TEACHER } from 'src/constants/constant'
import { useEffect, useState } from 'react'
import { useAuth } from 'src/hooks/useAuth'
import { Box } from '@mui/system'


function CalendarPage() {
    const [sessions, setSessions] = useState()
    const { user } = useAuth()

    const fetchSessions = async () => {
        const response = await fetch(`http://localhost:1337/api/teacher-sessions/${user?.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.token}`
            },
        })
        const data = await response.json()
        if (data?.status === 200) {
            setSessions(data?.data?.rows)
        };
    }

    useEffect(() => {
        fetchSessions()
    }, [])

    const events = sessions && sessions.map(session => {
        return {
            title: session?.sessionTitle,
            start: new Date(Number(session?.sessionDate)),
        }
    })

    return (
        <div>
            {sessions && sessions.length > 0 ? <FullCalendar

                plugins={[dayGridPlugin]}
                initialView='dayGridMonth'
                weekends={false}
                events={events}
                eventContent={renderEventContent}
            /> : <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><h2>No Sessions Found</h2></Box>}
        </div>
    )
}

// a custom render function
function renderEventContent(eventInfo) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', px: 2 }} >
            <b>{eventInfo.timeText}</b>
            <i style={{ color: '#0E74D0' }}><b>{eventInfo.event.title}</b></i>
        </Box>
    )
}


CalendarPage.acl = {
    action: 'manage',
    subject: [ROLE_TEACHER]
}

export default CalendarPage