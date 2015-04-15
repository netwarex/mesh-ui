var englishTranslations = {

    /* User auth */
    'LOG_IN': 'Log In',
    'LOG_OUT': 'Log Out',
    'USER_NAME': 'User Name',
    'PASSWORD': 'Password',
    'PROFILE': 'Profile',

    /* Projects */
    'PROJECTS': 'Projects',
    'ALL_PROJECTS': 'All Projects',

    /* Tags */
    'CREATE_NEW_TAG': 'Create new tag',

    /* Other */
    'SEARCH': 'Search',
    'UPDATE': 'Update',
    'TITLE': 'Title',
    'SCHEMA': 'Schema',
    'AUTHOR': 'Author',
    'CREATED': 'Created',
    'ITEMS_PER_PAGE': 'Items per page',

    /* Dialogs */
    'CONTENT_MODIFIED': 'Content Modified',
    'CONTENT_MODIFIED_HOW_TO_PROCEED': 'This content has been modified. How would you like to proceed?',
    
    /* Common buttons */
    'SAVE_CHANGES': 'Save Changes',
    'DISCARD_CHANGES': 'Discard Changes',
    'CANCEL': 'Cancel',

    /* Error messages */
    'ERROR': 'Error',
    'ERR_CHECK_LOGIN_DETAILS': 'Please check your login details and try again.'
};

angular.module('caiLunAdminUi.common.i18n')
    .constant('en', englishTranslations);