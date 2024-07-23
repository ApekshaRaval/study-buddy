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
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
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
    fields,
    register,
    append,
    remove
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
                <DialogTitle>{"Create Quiz Form"}</DialogTitle>
                <form noValidate autoComplete='off' onSubmit={onSubmit}>
                    <DialogContent>
                        <Card sx={{ minHeight: '600px', height: '100%' }}>
                            <Box sx={{ maxWidth: { xs: 320, sm: 480 }, bgcolor: 'background.paper', mt: 3, px: 3 }}>

                            </Box>
                            <CardContent>

                                <InputLabel
                                    htmlFor='auth-login-v2-email'
                                    sx={{ fontSize: '0.90rem', mb: 1.5, color: '#0e74d0', fontWeight: 600 }}
                                >
                                    Quiz Title
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
                                    Quiz Date
                                </InputLabel>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <Controller
                                        name='sessionDate'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field: { value, onChange, onBlur } }) => (
                                            <DatePicker
                                                render={<InputIcon />}
                                                format='MM/DD/YYYY HH:mm:ss'
                                                showOtherDays
                                                onChange={setSessionDate}
                                                value={sessionDate}
                                                plugins={[<TimePicker position='bottom' />, <DatePickerHeader position='left' />]}
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
                                <InputLabel
                                    htmlFor='demo-simple-select-label'
                                    sx={{ fontSize: '0.90rem', mb: 1.5, color: '#0e74d0', fontWeight: 600 }}
                                >
                                    Subject of quiz
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
                                <InputLabel
                                    htmlFor='demo-simple-select-label'
                                    sx={{ fontSize: '0.90rem', my: 1.5, color: '#0e74d0', fontWeight: 600 }}
                                >
                                    Quiz questions
                                </InputLabel>
                                {fields.map((item, index) => {
                                    return (
                                        <Box key={item.id} position={"relative"} sx={{ mb: 2, p: 2 }}>
                                            <Box>
                                                <InputLabel
                                                    htmlFor='demo-simple-select-label'
                                                    sx={{ fontSize: '0.90rem', my: 1.5, color: '#0e74d0', fontWeight: 600 }}
                                                >
                                                    {index + 1}) question
                                                </InputLabel>
                                                <Controller
                                                    render={({ field }) => <TextField {...field} fullWidth sx={{ mb: 2 }} />}
                                                    name={`quizcontent.${index}.question`}
                                                    control={control}
                                                />
                                                <InputLabel
                                                    htmlFor='demo-simple-select-label'
                                                    sx={{ fontSize: '0.90rem', my: 1.5, color: '#0e74d0', fontWeight: 600 }}
                                                >
                                                    {index + 1})  Answer
                                                </InputLabel>
                                                <Controller
                                                    render={({ field }) => <TextField {...field} fullWidth />}
                                                    name={`quizcontent.${index}.answer`}
                                                    control={control}
                                                />
                                            </Box>

                                            <Button type="button" onClick={() => remove(index)} sx={{ position: "absolute", top: '-16px', right: '-33px' }}>
                                                <DeleteIcon />
                                            </Button>
                                        </Box>

                                    );
                                })}
                                <Button
                                    type="button"
                                    variant="outlined"
                                    sx={{ textTransform: 'capitalize', mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}
                                    onClick={() => {
                                        append({ question: "", answer: "" });
                                    }}
                                >
                                    <AddIcon />  Add Question
                                </Button>
                            </CardContent>
                        </Card>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} variant='outlined' sx={{ textTransform: 'capitalize' }}>Cancel</Button>
                        <Button type='submit' variant='contained' sx={{ textTransform: 'capitalize' }}>Submit</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </React.Fragment >
    )
}
