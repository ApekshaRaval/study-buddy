// ** MUI Imports
import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Components
import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler'
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
// ** Configs
import themeConfig from 'src/configs/themeConfig'

const AppBarContent = props => {
  // ** Props
  const { hidden, settings, saveSettings, toggleNavVisibility } = props


  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        {hidden ? (
          <IconButton color='inherit' sx={{ ml: -2.75 }} onClick={toggleNavVisibility}>
            <Icon icon='bx:menu' />
          </IconButton>
        ) : null}

        <ModeToggler settings={settings} saveSettings={saveSettings} />
      </Box>
      <Typography
        variant='h5'
        sx={{
          ml: 2,
          lineHeight: 1,
          fontWeight: 700,
          color: '#0E74D0',
          letterSpacing: '-0.45px',
          textTransform: 'capitalize',
          fontSize: '1.3rem !important'
        }}
      >
        {themeConfig.templateName}
      </Typography>
      <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
        <UserDropdown settings={settings} />
      </Box>
    </Box>
  )
}

export default AppBarContent
