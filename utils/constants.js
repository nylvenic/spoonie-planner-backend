module.exports = {
    TODO_TABLE: 'todos',
    MAX_FILESIZE: 524288,
    RESPONSES: {
        USER: {
            CREATE: {
                'USER_EXISTS': {
                    msg: 'This username already exists.',
                    success: false
                },
                'EMAIL_EXISTS': {
                    msg: 'This email already exists.',
                    success: false
                },
                'SUCCESS': {
                    msg: 'Successfully created user. Navigating you to login page...',
                    success: true
                },
                'GENERIC_ERROR': {
                    msg: 'Something went wrong when creating user.',
                    success: false
                }
            },
            LOGIN: {
                'WRONG_PASSWORD': {
                    msg: 'Invalid password.',
                    success: false
                },
                'GENERIC_ERROR': {
                    msg: 'Something went wrong when logging in.',
                    success: false
                },
                'SUCCESS': {
                    msg: 'Successful authentication.',
                    success: true
                },
            },
            SPOONS_CHANGE: {
                'SUCCESS': (userId) => ({
                    msg: `Successfully changed the spoons of ${userId}.`,
                    success: true
                }),
                'GENERIC_ERROR': {
                    msg: 'Failed to update spoons.',
                    success: false
                }
            },
            SPOONS_GET: {
                'SUCCESS': (userId) => ({
                    msg: `Successfully obtained spoons for ${userId}.`, 
                    success: true
                }),
                'GENERIC_ERROR': {
                    msg: 'Failed to get spoons.',
                    success: false,
                }
            },
            CHANGE_MAX_SPOONS: {
                'SUCCESS': {
                    msg: 'Successfully changed max spoons.',
                    success: true
                },
                'GENERIC_ERROR': {
                    msg: 'An internal error occurred while attempting to change max spoons.',
                    success: false
                }
            },
            NICKNAME_CHANGE: {
                'SUCCESS': {
                    msg: 'Nickname changed successfully.',
                    success: true,
                },
                'GENERIC_ERROR': {
                    msg: 'Failed to change nickname value due to internal error.',
                    success: false,
                }
            },
            REMINDERS_CHANGE: {
                'SUCCESS': {
                    msg: 'Reminders updated successfully.',
                    success: true,
                },
                'GENERIC_ERROR': {
                    msg: 'Error changing reminders',
                    success: false,
                },
                
            },
            PASSWORD_CHANGE: {
                'SUCCESS': {
                    msg: 'Successfully changed password.',
                    success: true,
                },
                'WRONG_PASSWORD': {
                    msg: 'Please try re-entering your current password.',
                    success: false,
                },
                'GENERIC_ERROR': {
                    msg: 'Failed to change password due to internal error',
                    success: false,
                },
            },
            AVATAR_CHANGE: {
                'SUCCESS': {
                    msg: 'Avatar changed successfully.',
                    success: true,
                },
                'FILE_TOO_BIG': {
                    msg: 'File is too big, max 512KB',
                    success: false,
                },
                'INVALID_FILE_TYPE': {
                    msg: 'Invalid file type, must be JPEG, JPG, PNG or GIF',
                    success: false,
                },
                'GENERIC_ERROR': {
                    msg: 'Failed to change avatar value due to internal error.',
                    success: false,
                },
            },
            CHANGE_LAST_VISITED: {
                'SUCCESS': {
                    msg: 'Successfully changed last visited date.',
                    success: true,
                },
                'GENERIC_ERROR': {
                    msg: 'Failed to change last visited value due to internal error.',
                    success: false,
                },
            },
            GET_LAST_VISITED: {
                'SUCCESS': {
                    msg: 'Successfully retrieved last visited date.',
                    success: true,
                },
                'GENERIC_ERROR': {
                    msg: 'Failed to retrieve last visited value due to internal error.',
                    success: false,
                },
            },
        },
        GENERIC: {
            'USER_NOT_FOUND': {
                msg: 'User not found.',
                success: false
            },
            'ALL': {
                msg: 'An unexpected error has occurred.',
                success: false
            },
            'PAGE_NOT_FOUND': {
                msg: "Sorry, can't find that!",
                success: false,
            }
        }
    }
}