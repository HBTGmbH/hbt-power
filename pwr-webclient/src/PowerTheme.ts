import {Color} from './utils/ColorUtil';
import {createTheme, ThemeOptions} from '@material-ui/core/styles';

const newPowerTheme: ThemeOptions = {
    typography: {
        fontSize: 24,
        fontFamily: [
            'Roboto',
            'sans-serif',].join(','),
    },
    palette: {
        primary: {
            light: '#474b77',
            main: '#191E55',
            dark: '#11153b',
            contrastText: '#fff',
        },
        secondary: {
            light: '#6bebeb',
            main: '#46E6E6',
            dark: '#31a1a1',
        },
        error: {
            main: Color.HBT_2017_HIGHLIGHT.toCSSRGBString(),
        },
        text: {

            //disabled: Color.HBT_2017_GRAY.toCSSRGBAString(0.5),
        }
    },
    props: {
        MuiPaper: {
            square: true
        },
        // Grey area instead of only an underline, so input fields are easy to spot (#56). Also used by the date pickers.
        MuiTextField: {
            variant: 'filled'
        }
    },
    overrides: {
        // A grey area marks a field you can type in: disabled fields have none, so e.g. the read mode of a form
        // is easy to tell apart from its edit mode
        MuiFilledInput: {
            root: {
                '&$disabled': {
                    backgroundColor: 'transparent'
                }
            }
        },
        MuiInputAdornment: {
            root: {
                height: 'auto'
            }
        },
        MuiTabs: {
            root: {
                color: '#fff',
                indicatorColor: '#46E6E6',
                backgroundColor: '#191E55'
            }
        },
        MuiTab: {
            root: {
                '&$selected': {
                    color: '#46E6E6'
                }
            }

        }
    }
};

export const POWER_MUI_THEME = createTheme(newPowerTheme as any);
