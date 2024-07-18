// ** React Imports
import { useState, Fragment } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import MuiAvatar from '@mui/material/Avatar'
import CustomAvatar from 'src/@core/components/mui/avatar'
// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Context
import { useAuth } from 'src/hooks/useAuth'
import { getInitials } from 'src/@core/utils/get-initials'

// ** Styled Components
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

const UserDropdown = props => {
  // ** Props
  const { settings } = props
  const { user } = useAuth()

  // ** States
  const [anchorEl, setAnchorEl] = useState(null)

  // ** Hooks
  const router = useRouter()
  const { logout } = useAuth()

  // ** Vars
  const { direction } = settings

  const handleDropdownOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = url => {
    if (url) {
      router.push(url)
    }
    setAnchorEl(null)
  }

  const styles = {
    py: 2,
    px: 4,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.secondary',
    textDecoration: 'none',
    '& svg': {
      mr: 2,
      fontSize: '1.25rem',
      color: 'text.secondary'
    }
  }

  const handleLogout = () => {
    logout()
    handleDropdownClose()
  }

  return (
    <Fragment>
      <Badge
        overlap='circular'
        onClick={handleDropdownOpen}
        sx={{ ml: 2, cursor: 'pointer' }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        {user?.profilePic ? (
          <MuiAvatar
            sx={{ width: '5rem', height: '5rem' }}
            src={user?.profilePic}
            alt={user?.userName}
          />
        ) : (
          <CustomAvatar
            skin='light'
            sx={{ width: '3rem', height: '3rem', fontWeight: 500, fontSize: '1rem' }}
          >
            {getInitials(user?.userName)}

          </CustomAvatar>
        )}
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 230, mt: 4 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'ltr' ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: direction === 'ltr' ? 'right' : 'left' }}
      >
        <Box sx={{ py: 2, px: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              overlap='circular'
              badgeContent={<BadgeContentSpan />}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
            >
              {user?.profilePic ? (
                <MuiAvatar
                  sx={{ width: '5rem', height: '5rem' }}
                  src={user?.profilePic}
                  alt={user?.userName}
                />
              ) : (
                <CustomAvatar
                  skin='light'
                  // color={store.selectedChat.contact.avatarColor}
                  sx={{ width: '3rem', height: '3rem', fontWeight: 500, fontSize: '1rem' }}
                >
                  {getInitials(user?.userName)}

                </CustomAvatar>
              )}
              {/* <Avatar alt='John Doe' src='/images/avatars/1.png' sx={{ width: '2.5rem', height: '2.5rem' }} /> */}
            </Badge>
            <Box sx={{ ml: 3, display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography sx={{ fontWeight: 500 }}>{user?.userName}</Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                {user?.role}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ mt: '0 !important' }} />
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <Icon icon='bx:user' />
            Profile
          </Box>
        </MenuItem>
        {/* <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <Icon icon='bx:envelope' />
            Inbox
          </Box>
        </MenuItem>
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <Icon icon='bx:message' />
            Chat
          </Box>
        </MenuItem>
        <Divider sx={{ my: theme => `${theme.spacing(2)} !important` }} />
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <Icon icon='bx:cog' />
            Settings
          </Box>
        </MenuItem>
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <Icon icon='bx:dollar' />
            Pricing
          </Box>
        </MenuItem>
        <MenuItem sx={{ p: 0 }} onClick={() => handleDropdownClose()}>
          <Box sx={styles}>
            <Icon icon='bx:help-circle' />
            FAQ
          </Box>
        </MenuItem> */}
        <Divider />
        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 2,
            px: 4,
            color: 'text.secondary',
            '& svg': { mr: 2, fontSize: '1.25rem', color: 'text.secondary' }
          }}
        >
          <Icon icon='bx:power-off' />
          Sign Out
        </MenuItem>
      </Menu>
    </Fragment>
  )
}

export default UserDropdown
