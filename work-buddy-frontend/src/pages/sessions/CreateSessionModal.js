import * as React from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Slide from '@mui/material/Slide'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { subjects } from 'src/constants/constant';

import { Controller } from 'react-hook-form';
import {
    Button,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    Tab,
    TextField,
} from '@mui/material';
import VideoFileIcon from '@mui/icons-material/VideoFile'
import { Box } from '@mui/system'
import { Delete } from '@mui/icons-material'
import DatePicker from 'react-multi-date-picker'
import TimePicker from 'react-multi-date-picker/plugins/time_picker'
import InputIcon from 'react-multi-date-picker/components/input_icon'
import DatePickerHeader from 'react-multi-date-picker/plugins/date_picker_header'
import styled from '@emotion/styled'
import { TabContext, TabList } from '@mui/lab'

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction='up' ref={ref} {...props} />
})
const TabListStyled = styled(TabList)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
    marginLeft: '12px',
    marginLeft: '12px',
    '& .MuiTabs-indicator': {
        display: 'none'
    },
    '& .Mui-selected': {
        textTransform: 'capitalize',
        color: 'white !important',
        backgroundColor: theme.palette.primary.main,
        borderRadius: 4
    }
}))

export default function CreateSessionModal({
    handleClose,
    handleMediaChange,
    open,
    tab,
    errors,
    handleChange,
    onSubmit,
    control,
    previewForVideo,
    sessionDate,
    setSessionDate,
    edit,
    setPreviewForVideo,
    setSessionEndTime,
    setSessionStartTime,
    sessionEndTime,
    sessionStartTime,

}) {
    return (
        <React.Fragment>
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                fullWidth
                maxWidth='sm'
                onClose={handleClose}
                aria-describedby='alert-dialog-slide-description'
            >
                <DialogTitle>{edit ? "Edit Session Form" : "Create Session Form"}</DialogTitle>
                <form noValidate autoComplete='off' onSubmit={onSubmit}>
                    <DialogContent>
                        <Card sx={{ minHeight: '600px', height: '100%' }}>
                            <Box sx={{ maxWidth: { xs: 320, sm: 480 }, bgcolor: 'background.paper', mt: 3, px: 3 }}>
                                <TabContext value={tab}>
                                    <TabListStyled onChange={handleChange} aria-label='scrollable force tabs example'>
                                        <Tab
                                            label='Create Session'
                                            value={'create'}
                                            sx={{ fontSize: '0.90rem', color: '#0e74d0', fontWeight: 600, textTransform: 'capitalize' }}
                                        />
                                        <Tab
                                            label='Schedule Session'
                                            value={'schedule'}
                                            sx={{ fontSize: '0.90rem', color: '#0e74d0', fontWeight: 600, textTransform: 'capitalize' }}
                                        />
                                    </TabListStyled>
                                </TabContext>
                            </Box>
                            <CardContent>

                                <InputLabel
                                    htmlFor='auth-login-v2-email'
                                    sx={{ fontSize: '0.90rem', mb: 1.5, color: '#0e74d0', fontWeight: 600 }}
                                >
                                    Session Title
                                </InputLabel>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <Controller
                                        name='sessionTitle'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field: { value, onChange, onBlur } }) => (
                                            <TextField
                                                autoFocus
                                                size='small'
                                                value={value}
                                                onBlur={onBlur}
                                                onChange={onChange}
                                                error={Boolean(errors.title)}
                                                placeholder='Enter title'
                                            />
                                        )}
                                    />
                                    {errors.sessionTitle && (
                                        <FormHelperText
                                            sx={{ color: 'error.main', marginRight: '0', marginLeft: '0', fontSize: '0.75rem' }}
                                        >
                                            {errors.sessionTitle.message}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                                <InputLabel
                                    htmlFor='auth-login-v2-email'
                                    sx={{ fontSize: '0.90rem', mb: 1.5, color: '#0e74d0', fontWeight: 600 }}
                                >
                                    Session Date
                                </InputLabel>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <Controller
                                        name='sessionDate'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field: { value, onChange, onBlur } }) => (
                                            <DatePicker
                                                render={<InputIcon />}
                                                format='MM/DD/YYYY'
                                                showOtherDays
                                                minDate={new Date()}
                                                onChange={setSessionDate}
                                                value={sessionDate}
                                            // plugins={[<TimePicker position='bottom' />, <DatePickerHeader position='left' />]}
                                            />
                                        )}
                                    />
                                    {errors.sessionDate && (
                                        <FormHelperText
                                            sx={{ color: 'error.main', marginRight: '0', marginLeft: '0', fontSize: '0.75rem' }}
                                        >
                                            {errors.sessionDate.message}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                                {
                                    tab === 'schedule' && (
                                        <>
                                            <InputLabel
                                                htmlFor='auth-login-v2-email'
                                                sx={{ fontSize: '0.90rem', mb: 1.5, color: '#0e74d0', fontWeight: 600 }}
                                            >
                                                Session Starttime
                                            </InputLabel>
                                            <FormControl fullWidth sx={{ mb: 2 }}>
                                                <DatePicker
                                                    disableDayPicker
                                                    format="hh:mm:ss A"
                                                    onChange={setSessionStartTime}
                                                    value={sessionStartTime}
                                                    plugins={[
                                                        <TimePicker />
                                                    ]}
                                                />
                                            </FormControl>
                                        </>
                                    )
                                }
                                {
                                    tab === 'schedule' && (
                                        <>
                                            <InputLabel
                                                htmlFor='auth-login-v2-email'
                                                sx={{ fontSize: '0.90rem', mb: 1.5, color: '#0e74d0', fontWeight: 600 }}
                                            >
                                                Session Endtime
                                            </InputLabel>
                                            <FormControl fullWidth sx={{ mb: 2 }}>
                                                <DatePicker
                                                    disableDayPicker
                                                    format="hh:mm:ss A"
                                                    onChange={setSessionEndTime}
                                                    value={sessionEndTime}
                                                    plugins={[
                                                        <TimePicker />
                                                    ]}
                                                />
                                            </FormControl>
                                        </>
                                    )
                                }
                                {tab === 'create' && previewForVideo === null && (
                                    <>
                                        <InputLabel
                                            htmlFor='demo-simple-select-label'
                                            sx={{ fontSize: '0.90rem', mb: 1.5, color: '#0e74d0', fontWeight: 600 }}
                                        >
                                            Upload Session
                                        </InputLabel>

                                        <Button variant='outlined' component='label' sx={{ width: '100%', mb: 2, height: '100px' }}>
                                            <VideoFileIcon sx={{ color: '#0e74d0', fontSize: '2rem' }} />
                                            <input type='file' accept='video/*' hidden onChange={handleMediaChange} />
                                        </Button>
                                    </>
                                )}
                                {previewForVideo !== null && (
                                    <>
                                        <InputLabel
                                            htmlFor='demo-simple-select-label'
                                            sx={{ fontSize: '0.90rem', mb: 1.5, color: '#0e74d0', fontWeight: 600 }}
                                        >
                                            {' '}
                                            Preview Session
                                        </InputLabel>

                                        <Box sx={{ mt: 2, width: '100%', position: 'relative', mb: 2 }}>
                                            <Delete
                                                sx={{ color: 'red', fontSize: '2rem', position: 'absolute', top: 10, right: 10 }}
                                                style={{ zIndex: 1, cursor: 'pointer' }}
                                                onClick={() => setPreviewForVideo(null)}
                                            />
                                            <video controls style={{ width: '100%', maxHeight: '300px' }}>
                                                <source src={previewForVideo} />
                                            </video>
                                        </Box>
                                    </>
                                )}

                                <InputLabel
                                    htmlFor='demo-simple-select-label'
                                    sx={{ fontSize: '0.90rem', mb: 1.5, color: '#0e74d0', fontWeight: 600 }}
                                >
                                    {tab === 'create' ? 'Link' : 'Meet link'}
                                </InputLabel>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <Controller
                                        name='sessionLink'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field: { value, onChange, onBlur } }) => (
                                            <TextField
                                                autoFocus
                                                value={value}
                                                size='small'
                                                onBlur={onBlur}
                                                onChange={onChange}
                                                placeholder={tab === 'create' ? 'Enter link' : 'Enter meet link'}
                                            />
                                        )}
                                    />
                                </FormControl>
                                <InputLabel
                                    htmlFor='demo-simple-select-label'
                                    sx={{ fontSize: '0.90rem', mb: 1.5, color: '#0e74d0', fontWeight: 600 }}
                                >
                                    Subject
                                </InputLabel>
                                <FormControl fullWidth>
                                    <Controller
                                        name='subject'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Select
                                                size='small'
                                                labelId='demo-simple-select-label'
                                                id='demo-simple-select'
                                                sx={{ '& .css-1qffa26-MuiList-root-MuiMenu-list': { height: '300px !important' } }}
                                                {...field}
                                            >
                                                {subjects.map(subject => (
                                                    <MenuItem key={subject.key} value={subject.value}>
                                                        {subject.value}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                </FormControl>

                            </CardContent>
                        </Card>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} variant='outlined' sx={{ textTransform: 'capitalize' }}>Cancel</Button>
                        <Button type='submit' variant='contained' sx={{ textTransform: 'capitalize' }}>Create Session</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </React.Fragment >
    )
}
